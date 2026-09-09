/*
 * Migration one-shot : ouvre chaque page de contenu dans le Decap CMS local
 * (qui convertit le corps Markdown -> blocs dsfr-editor à l'ouverture), puis
 * publie -> le fichier `.md` passe au nouveau format
 * (`<!--dsfr-editor:source … -->` + HTML compilé).
 *
 * Prérequis (2 terminaux) :
 *   npm run admin:dev            # Vite  -> :5173
 *   npx -y decap-server@3.11.0   # proxy -> :8081  (PAS le 3.11.1)
 *
 * Puis :  node scripts/migrate-blocknote.mjs [--collection <name>] [--dry]
 *
 * `playwright-core` requis (chromium déjà installé via ms-playwright).
 * cf. docs/cms-architecture.md
 */
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

/** Ajoute `templateEngineOverride: false` au frontmatter (corps HTML pré-compilé
 * -> Eleventy ne doit ni Nunjucks ni markdown-it). */
function ensureTemplateEngineOverride(file) {
  if (!fs.existsSync(file)) return false;
  let s = fs.readFileSync(file, "utf8");
  if (!s.includes("<!--dsfr-editor:source")) return false;
  if (/^templateEngineOverride:/m.test(s)) return true;
  fs.writeFileSync(
    file,
    s.replace(/^---\n/, "---\ntemplateEngineOverride: false\n"),
  );
  return true;
}

const BASE = "http://localhost:5173";
const ARGS = process.argv.slice(2);
const ONLY = ARGS.includes("--collection")
  ? ARGS[ARGS.indexOf("--collection") + 1]
  : null;
const DRY = ARGS.includes("--dry");

/** Collections `folder` (garder synchro avec admin-src/main.tsx). */
const COLLECTIONS = [
  "documentation-utilisateur",
  "documentation-technique",
  "accompagner-le-changement",
  "toutes-les-notions",
  "integration",
  "a-propos",
];

function findChromium() {
  const dir = `${process.env.HOME}/.cache/ms-playwright`;
  const build = fs
    .readdirSync(dir)
    .filter((d) => d.startsWith("chromium-"))
    .sort()
    .pop();
  for (const sub of ["chrome-linux/chrome", "chrome-linux-arm64/chrome"]) {
    const p = path.join(dir, build, sub);
    if (fs.existsSync(p)) return p;
  }
  throw new Error("chromium introuvable sous ~/.cache/ms-playwright");
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Charge une route Decap avec un reload dur (le SPA ne remonte pas toujours). */
async function hardGoto(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.reload({ waitUntil: "networkidle", timeout: 60000 });
}

const browser = await chromium.launch({
  executablePath: findChromium(),
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1500, height: 1200 } });
page.on("pageerror", (e) => console.log("  ⚠ pageerror:", e.message));

console.log("→ connexion…");
await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60000 });
await sleep(2500);
for (const t of ["Login", "Se connecter"]) {
  const b = page.locator(`button:has-text('${t}')`).first();
  if (await b.count()) {
    await b.click();
    await sleep(4000);
    break;
  }
}
if (await page.locator("text=/avec GitHub/i").count()) {
  console.error(
    "✗ Decap n'utilise PAS le proxy local (bouton « avec GitHub »). " +
      "Lancer `npx -y decap-server@3.11.0` et recharger.",
  );
  await browser.close();
  process.exit(2);
}

let ok = 0;
let ko = 0;

for (const col of COLLECTIONS) {
  if (ONLY && col !== ONLY) continue;
  await hardGoto(page, `${BASE}/#/collections/${col}`);
  const linkSel = `a[href*='/collections/${col}/entries/']`;
  try {
    await page.locator(linkSel).first().waitFor({ timeout: 25000 });
  } catch {
    console.log(`\n=== ${col} — aucune page trouvée (skip) ===`);
    continue;
  }
  const hrefs = await page.evaluate(
    (sel) =>
      [...document.querySelectorAll(sel)].map((a) => a.getAttribute("href")),
    linkSel,
  );
  console.log(`\n=== ${col} — ${hrefs.length} page(s) ===`);

  for (const href of hrefs) {
    const slug = href.split("/entries/")[1];
    process.stdout.write(`  • ${slug} … `);
    try {
      await hardGoto(page, BASE + href);
      await page.locator(".ProseMirror").first().waitFor({ timeout: 30000 });

      // attendre la fin de conversion : le compteur de blocs se stabilise.
      let prev = -1;
      let stable = 0;
      for (let i = 0; i < 25 && stable < 3; i++) {
        await sleep(700);
        const n = await page.evaluate(
          () => document.querySelectorAll(".bn-block").length,
        );
        stable = n === prev ? stable + 1 : 0;
        prev = n;
      }

      if (DRY) {
        const s = await page.evaluate(() => ({
          blocks: document.querySelectorAll(".bn-block").length,
          embeds: document.querySelectorAll(".dsfr-html-embed").length,
          alerts: document.querySelectorAll(".fr-alert").length,
          callouts: document.querySelectorAll(".fr-callout").length,
          highlights: document.querySelectorAll(".fr-highlight").length,
          accordions: document.querySelectorAll(
            ".dsfr-editor-accordion-section",
          ).length,
          code: document.querySelectorAll("[data-content-type='codeBlock']")
            .length,
        }));
        console.log("DRY", JSON.stringify(s));
        ok++;
        continue;
      }

      await page
        .getByRole("button", { name: /Publier/i })
        .first()
        .click({ timeout: 10000 });
      await sleep(1200);
      const now = page.getByText(/Publier maintenant|Publish now/i).first();
      if (await now.count()) await now.click();
      await sleep(6000);

      const file = `content/${col}/${slug.replace(/\/index$/, "")}/index.md`;
      const patched = ensureTemplateEngineOverride(file);
      console.log(patched ? "ok" : "ok (frontmatter non patché)");
      ok++;
    } catch (e) {
      console.log("ÉCHEC —", e.message.split("\n")[0]);
      ko++;
    }
  }
}

console.log(`\n${ok} page(s) traitée(s), ${ko} échec(s).`);
await browser.close();
process.exit(ko ? 1 : 0);
