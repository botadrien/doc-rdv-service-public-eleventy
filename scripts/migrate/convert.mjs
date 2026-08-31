#!/usr/bin/env node
// Convertit la documentation GitBook (rdv-solidarites/rdv-service-public-gitbook)
// vers le format eleventy-dsfr de ce dépôt.
//
//   node scripts/migrate/convert.mjs <chemin-du-clone-gitbook>
//
// Écrit dans content/ (pages + assets co-localisés) et affiche un rapport.
// Idempotent : réécrase les fichiers générés.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const SRC = process.argv[2];
if (!SRC || !fs.existsSync(path.join(SRC, "SUMMARY.md"))) {
  console.error("Usage: node scripts/migrate/convert.mjs <clone-du-repo-gitbook>");
  process.exit(1);
}
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const CONTENT = path.join(ROOT, "content");
const ASSETS_SRC = path.join(SRC, ".gitbook", "assets");

const report = { assets: new Set(), missingAssets: new Set(), brokenLinks: new Set(), embeds: [], notes: [] };

// --- utilitaires ----------------------------------------------------------
const slugify = (s) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, " ")
    .replace(/&#x20;/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const stripFrontMatter = (raw) => {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { fm: {}, body: raw };
  const fm = {};
  for (const line of m[1].split("\n")) {
    const mm = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (mm) fm[mm[1]] = mm[2].replace(/^["']|["']$/g, "");
  }
  return { fm, body: raw.slice(m[0].length) };
};

const yamlEscape = (s) => (/[:#"'\[\]{}]|^\s|\s$/.test(s) ? JSON.stringify(s) : s);

// --- 1. SUMMARY.md : arbre de navigation ---------------------------------
const summary = fs.readFileSync(path.join(SRC, "SUMMARY.md"), "utf8");
const SECTION_TITLES = {
  "accompagner-le-changement": "Accompagner le changement",
  "documentation-utilisateur": "Documentation utilisateur",
  "integration": "Intégration",
  "documentation-technique": "Documentation technique",
  "a-propos": "À propos",
  "toutes-les-notions": "Toutes les notions",
};
// slug de page particulier (fichier source -> slug d'URL)
const SLUG_OVERRIDE = { "accompagner-le-changement/guide-des-etapes": "etape-par-etape" };

const pages = []; // { group, title, src, sectionSlug, pageSlug, destDir, url }
const sectionsSeen = [];
let curGroup = null;
for (const line of summary.split("\n")) {
  const g = line.match(/^##\s+(.+?)\s*$/);
  if (g) { curGroup = g[1]; continue; }
  const l = line.match(/^\*\s+\[(.+?)\]\((.+?\.md)\)/);
  if (!l) continue;
  const [, title, src] = l;
  if (src === "README.md") { pages.push({ home: true, title, src }); continue; }
  const sectionSlug = src.split("/")[0];
  const base = src.replace(/\.md$/, "");
  const pageSlug = SLUG_OVERRIDE[base] || path.basename(base);
  if (!sectionsSeen.includes(sectionSlug)) sectionsSeen.push(sectionSlug);
  const destDir = path.join(CONTENT, sectionSlug, pageSlug);
  pages.push({
    group: curGroup, title, src, sectionSlug, pageSlug, destDir,
    url: `/${sectionSlug}/${pageSlug}/`,
  });
}

// table de correspondance : chemin source .md -> URL finale
const urlBySrc = {};
for (const p of pages) if (!p.home) urlBySrc[p.src] = p.url;
urlBySrc["README.md"] = "/";

// --- 2. assets ----------------------------------------------------------
const assetNameCache = new Map();
function resolveAsset(ref, fromSrcFile) {
  // ref ressemble à ../.gitbook/assets/NOM ou .gitbook/assets/NOM
  let name = ref.replace(/^.*\.gitbook\/assets\//, "");
  try { name = decodeURIComponent(name); } catch {}
  name = name.trim();
  const candidates = [name];
  try { candidates.push(decodeURIComponent(name)); } catch {}
  for (const c of candidates) {
    const abs = path.join(ASSETS_SRC, c);
    if (fs.existsSync(abs)) return { abs, name: c };
  }
  report.missingAssets.add(`${name}  (référencé par ${fromSrcFile})`);
  return null;
}
function copyAsset(ref, destDir, fromSrcFile) {
  const found = resolveAsset(ref, fromSrcFile);
  if (!found) return null;
  const ext = path.extname(found.name).toLowerCase();
  let outName = assetNameCache.get(found.abs);
  if (!outName) {
    outName = slugify(path.basename(found.name, path.extname(found.name))) + ext;
    assetNameCache.set(found.abs, outName);
  }
  const destAssets = path.join(destDir, "assets");
  fs.mkdirSync(destAssets, { recursive: true });
  fs.copyFileSync(found.abs, path.join(destAssets, outName));
  report.assets.add(outName);
  return `./assets/${outName}`;
}

// --- 3. transformations du corps --------------------------------------
function rewriteLink(href, fromSrc) {
  if (/^\/broken\/pages\//.test(href)) { report.brokenLinks.add(`${href}  (dans ${fromSrc})`); return null; }
  const hashSplit = href.split("#");
  let target = hashSplit[0];
  const hash = hashSplit[1] ? "#" + hashSplit[1] : "";
  // URLs absolues vers l'ancien site
  const abs = target.match(/^https?:\/\/aide\.rdv-service-public\.fr(\/[^\s]*)?$/);
  if (abs) {
    let p = (abs[1] || "/").replace(/\/$/, "");
    return (p === "" ? "/" : p + "/") + hash;
  }
  if (/^https?:\/\//.test(target) || target.startsWith("mailto:") || target.startsWith("tel:")) return href;
  if (target === "" && hash) return hash; // ancre interne à la page
  // lien relatif .md
  if (/\.md$/.test(target)) {
    const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(fromSrc), target)).replace(/^\.\//, "");
    if (urlBySrc[resolved]) return urlBySrc[resolved] + hash;
    // essai sans le préfixe de dossier
    const bare = Object.keys(urlBySrc).find((k) => k.endsWith("/" + target) || k === target);
    if (bare) return urlBySrc[bare] + hash;
    report.notes.push(`lien .md non résolu : ${href} (dans ${fromSrc})`);
    return href;
  }
  return href;
}

function convertBody(body, page) {
  let s = body;

  // titre H1 en tête -> retiré (le layout affiche {{ title }})
  s = s.replace(/^\s*#\s+.+\n/, "");

  // <table data-view="cards"> -> grille de tuiles DSFR
  s = convertCardTables(s, page);

  // séparateurs GitBook "***" seuls -> ligne vide
  s = s.replace(/^\s*\*\*\*\s*$/gm, "");

  // artefacts d'espace insécable / continuation
  s = s.replace(/&#x20;/g, " ");
  s = s.replace(/[ \t]+\\\n/g, "\n\n"); // "texte \<\n>" -> saut de paragraphe
  s = s.replace(/[ \t]+$/gm, "");

  // ancres vides dans les titres :  ### Titre <a href="#x" id="x"></a>
  s = s.replace(/\s*<a href="#[^"]*"\s+id="[^"]*"><\/a>/g, "");

  // <h2 align="center">X</h2>  (et h3/h4)
  s = s.replace(/<h([234])[^>]*>\s*([\s\S]*?)\s*<\/h\1>/g, (_, lvl, inner) => {
    inner = inner.replace(/<\/?(mark|strong|em)[^>]*>/g, "").trim();
    return "\n" + "#".repeat(Number(lvl)) + " " + inner + "\n";
  });

  // <mark ...>...</mark> -> contenu nu (styles de couleur non repris)
  s = s.replace(/<mark[^>]*>([\s\S]*?)<\/mark>/g, "$1");

  // {% hint style="info|warning|danger|success" %} ... {% endhint %}
  const HINT = { info: "info", warning: "warning", danger: "error", success: "success" };
  s = s.replace(/\{%\s*hint\s+style="(\w+)"\s*%\}([\s\S]*?)\{%\s*endhint\s*%\}/g,
    (_, style, inner) => `\n:::${HINT[style] || "info"}\n${inner.trim()}\n:::\n`);

  // {% stepper %} ... {% step %} #### T ... {% endstep %} ... {% endstepper %}
  s = s.replace(/\{%\s*stepper\s*%\}([\s\S]*?)\{%\s*endstepper\s*%\}/g, (_, inner) => {
    let n = 0;
    const steps = inner.replace(/\{%\s*step\s*%\}([\s\S]*?)\{%\s*endstep\s*%\}/g, (__, stepBody) => {
      n += 1;
      const lines = stepBody.trim().split("\n");
      let title = "";
      const h = lines[0].match(/^#{2,4}\s+(.+)$/);
      const bold = lines[0].match(/^\s*_*\*\*(.+?)\*\*_*\s*$/);
      if (h) { title = h[1]; lines.shift(); }
      else if (bold) { title = bold[1].replace(/[*_]/g, "").trim(); lines.shift(); }
      const heading = `### ${n}. ${title || "Étape " + n}`;
      return "\n" + heading + "\n\n" + lines.join("\n").trim() + "\n";
    });
    return "\n" + steps + "\n";
  });

  // {% embed url="..." %}
  s = s.replace(/\{%\s*embed\s+url="([^"]+)"\s*%\}/g, (_, url) => {
    report.embeds.push(`${page.src}  ${url.slice(0, 80)}`);
    if (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(url)) {
      return `\n<video controls preload="metadata" style="width:100%;max-width:720px" src="${url}"></video>\n`;
    }
    return `\n<p><a href="${url}" target="_blank" rel="noopener">${url}</a></p>\n`;
  });

  const imgAttr = (tag, name) => (tag.match(new RegExp(`\\b${name}="([^"]*)"`)) || [])[1];

  // <div align="..."><figure><img ...>...</figure></div>  (petite image inline, souvent width=128)
  s = s.replace(/<div[^>]*>\s*<figure>\s*(<img\s+[^>]*>)\s*(?:<figcaption>([\s\S]*?)<\/figcaption>)?\s*<\/figure>\s*<\/div>/g,
    (_, imgTag, cap) => {
      const src = imgAttr(imgTag, "src");
      const rel = /\.gitbook\/assets\//.test(src) ? copyAsset(src, page.destDir, page.src) : src;
      if (!rel) return "";
      const width = imgAttr(imgTag, "width");
      const w = width ? ` width="${width}"` : "";
      return `\n<img src="${rel}" alt="${imgAttr(imgTag, "alt") || ""}"${w}>\n`;
    });

  // <figure><img ...><figcaption>C</figcaption></figure>
  s = s.replace(/<figure>\s*(<img\s+[^>]*>)\s*(?:<figcaption>([\s\S]*?)<\/figcaption>)?\s*<\/figure>/g,
    (_, imgTag, cap = "") => {
      const src = imgAttr(imgTag, "src");
      const alt = imgAttr(imgTag, "alt") || "";
      const rel = /\.gitbook\/assets\//.test(src) ? copyAsset(src, page.destDir, page.src) : src;
      if (!rel) return "";
      cap = cap.trim();
      return cap
        ? `\n<figure class="fr-content-media">\n\n![${alt}](${rel})\n\n<figcaption class="fr-content-media__caption">${cap}</figcaption>\n</figure>\n`
        : `\n![${alt}](${rel})\n`;
    });

  // images markdown ![alt](../.gitbook/assets/NAME)
  s = s.replace(/!\[([^\]]*)\]\((<?)([^)\s]*\.gitbook\/assets\/[^)]+?)(>?)\)/g, (_, alt, lt, src) => {
    const rel = copyAsset(src, page.destDir, page.src);
    return rel ? `![${alt}](${rel})` : `![${alt}]()`;
  });

  // <details><summary><strong>Q</strong></summary> ... </details>  -> accordéon DSFR (marqueur ?)
  s = s.replace(/<details>\s*<summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g, (_, sum, inner) => {
    const title = sum.replace(/<\/?(strong|em|mark)[^>]*>/g, "").replace(/&#x20;/g, " ").trim();
    return `\n???${title}\n\n${inner.trim()}\n\n???\n`;
  });
  // regroupe les accordéons consécutifs dans ????accordionsgroup ... ????
  s = s.replace(/(?:\?\?\?[^\n]*\n[\s\S]*?\n\?\?\?[ \t]*\n\s*){2,}/g,
    (block) => `\n????accordionsgroup\n\n${block.trim()}\n\n????\n`);

  // liens markdown [txt](href)
  s = s.replace(/\[([^\]]*)\]\(([^)]+)\)/g, (m, txt, href) => {
    if (/\.gitbook\/assets\//.test(href) || href.startsWith("./assets/")) return m;
    const nw = rewriteLink(href.trim(), page.src);
    if (nw === null) return txt; // lien cassé -> texte nu
    // si le libellé du lien est lui aussi une URL de l'ancien site, on l'aligne
    if (/^https?:\/\/aide\.rdv-service-public\.fr/.test(txt.trim())) {
      return `[cette page de la FAQ](${nw})`;
    }
    return `[${txt}](${nw})`;
  });

  // nettoyage des lignes vides multiples
  s = s.replace(/\n{3,}/g, "\n\n").trim() + "\n";
  return s;
}

// --- 4. génération ----------------------------------------------------
// Nettoyage ciblé : seulement les dossiers de sections gérés par la migration.
for (const sec of sectionsSeen) {
  fs.rmSync(path.join(CONTENT, sec), { recursive: true, force: true });
  fs.rmSync(path.join(CONTENT, sec + ".md"), { force: true });
}

// 4a. stubs de section (entrées de menu sans page propre)
sectionsSeen.forEach((sec, i) => {
  const title = SECTION_TITLES[sec] || sec;
  const fm = [
    "---",
    "eleventyNavigation:",
    `  key: ${yamlEscape(title)}`,
    `  order: ${i + 2}`, // 1 = Accueil
    "permalink: false",
    "---",
    "",
  ].join("\n");
  fs.writeFileSync(path.join(CONTENT, sec + ".md"), fm);
});

// 4b. pages
const orderInSection = {};
for (const page of pages) {
  if (page.home) { generateHome(page); continue; }
  const { fm, body } = stripFrontMatter(fs.readFileSync(path.join(SRC, page.src), "utf8"));
  fs.mkdirSync(page.destDir, { recursive: true });
  const converted = convertBody(body, page);
  orderInSection[page.sectionSlug] = (orderInSection[page.sectionSlug] || 0) + 1;

  const front = ["---", `title: ${yamlEscape(page.title)}`];
  if (fm.description) front.push(`description: ${yamlEscape(fm.description)}`);
  front.push("layout: layouts/page.njk");
  front.push("eleventyNavigation:");
  front.push(`  key: ${yamlEscape(page.title)}`);
  front.push(`  parent: ${yamlEscape(SECTION_TITLES[page.sectionSlug] || page.sectionSlug)}`);
  front.push(`  order: ${orderInSection[page.sectionSlug]}`);
  front.push("showBreadcrumb: true");
  front.push("---", "");

  fs.writeFileSync(path.join(page.destDir, "index.md"), front.join("\n") + converted);
}

// 4c. accueil (README.md)
function generateHome(page) {
  const { body } = stripFrontMatter(fs.readFileSync(path.join(SRC, "README.md"), "utf8"));
  const homePage = { src: "README.md", destDir: CONTENT };
  let s = convertBody(body, homePage);
  // README structure ses sections en #### -> on remonte en ## (la page a un H1 de héro)
  s = s.replace(/^#### /gm, "## ");
  const front = [
    "---",
    "title: Aide de RDV Service Public",
    "layout: layouts/home.njk",
    "eleventyNavigation:",
    "  key: Accueil",
    "  order: 1",
    "---",
    "",
    '<div class="fr-py-8w fr-background-alt--blue-cumulus">',
    '  <div class="fr-container">',
    '    <h1>Centre d\'aide de RDV Service Public</h1>',
    '    <p class="fr-text--lead">Tutoriels, guides de configuration et réponses aux questions',
    "      les plus fréquentes pour prendre en main RDV Service Public.</p>",
    "  </div>",
    "</div>",
    "",
    '<div class="fr-container fr-my-8w">',
    "",
  ].join("\n");
  fs.rmSync(path.join(CONTENT, "index.njk"), { force: true });
  // fichier .md : markdown rendu + pré-traitement Nunjucks ({{ component(...) }})
  fs.writeFileSync(path.join(CONTENT, "index.md"), front + "\n" + s + "\n\n</div>\n");
}

// --- 5. <table data-view="cards"> -> grille de tuiles DSFR ------------
function convertCardTables(s, page) {
  return s.replace(/<table[^>]*\bdata-view="cards"[^>]*>([\s\S]*?)<\/table>/g, (_, tbl) => {
    const rows = [...tbl.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((m) => m[1]);
    const cards = [];
    for (const row of rows) {
      const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => m[1]);
      if (!cells.length) continue;
      let title = "", desc = "", url = "";
      for (const c of cells) {
        const a = c.match(/<a href="([^"]+)"/);
        if (a) {
          if (/\.gitbook\/assets\//.test(a[1])) continue; // image de couverture ignorée
          url = a[1];
          continue;
        }
        const text = c.replace(/<[^>]+>/g, "").replace(/&#x20;/g, " ").trim();
        if (!text) continue;
        if (!title) title = text; else if (!desc) desc = text;
      }
      if (!title && !url) continue;
      let finalUrl = url;
      let external = false;
      if (/^https?:\/\//.test(url) || url.startsWith("mailto:")) external = true;
      else if (/\.md($|#)/.test(url)) finalUrl = rewriteLink(url, page.src) || url;
      cards.push({ title, desc, url: finalUrl, external });
    }
    if (!cards.length) return "";
    const col = cards.length >= 3 ? "fr-col-md-4" : "fr-col-md-6";
    const items = cards.map((c) => {
      const params = c.external
        ? `{ url: false, externalUrl: ${JSON.stringify(c.url)}, title: ${JSON.stringify(c.title)}, description: ${JSON.stringify(c.desc)} }`
        : `{ url: ${JSON.stringify(c.url)}, title: ${JSON.stringify(c.title)}, description: ${JSON.stringify(c.desc)} }`;
      return `  <div class="fr-col-12 ${col}">\n  {{ component("tile", ${params}) }}\n  </div>`;
    }).join("\n");
    return `\n{% from "components/component.njk" import component with context %}\n<div class="fr-grid-row fr-grid-row--gutters fr-my-4w">\n${items}\n</div>\n`;
  });
}

// --- 6. rapport -----------------------------------------------------
const line = "─".repeat(60);
console.log(`\n${line}\nMIGRATION TERMINÉE\n${line}`);
console.log(`Pages écrites   : ${pages.filter((p) => !p.home).length} + accueil`);
console.log(`Sections        : ${sectionsSeen.join(", ")}`);
console.log(`Assets copiés   : ${report.assets.size}`);
if (report.missingAssets.size) {
  console.log(`\n⚠️  Assets introuvables (${report.missingAssets.size}) :`);
  for (const a of report.missingAssets) console.log("   - " + a);
}
if (report.brokenLinks.size) {
  console.log(`\n⚠️  Liens cassés (transformés en texte nu) :`);
  for (const b of report.brokenLinks) console.log("   - " + b);
}
if (report.embeds.length) {
  console.log(`\nℹ️  Embeds convertis (${report.embeds.length}) :`);
  for (const e of report.embeds) console.log("   - " + e);
}
if (report.notes.length) {
  console.log(`\nℹ️  Notes :`);
  for (const n of [...new Set(report.notes)]) console.log("   - " + n);
}
console.log();
