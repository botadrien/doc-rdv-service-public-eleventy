/*
 * Filet de sécurité autour du format dsfr-editor (corps = source JSON + HTML pré-compilé).
 *
 *   1. Lint des sources — toute page `content/**` dont le corps porte le marqueur
 *      `<!--dsfr-editor:source` DOIT déclarer `templateEngineOverride: false` au
 *      frontmatter. Sinon Eleventy ferait repasser le HTML pré-compilé par
 *      Nunjucks + markdown-it (exécution des `{{ }}` littéraux, `:::` transformés
 *      en alertes…). C'est le bug qu'une page créée dans Decap sans le champ
 *      caché déclencherait.
 *   2. Scan de la sortie — aucun fichier HTML de `_site/` ne doit encore contenir
 *      le marqueur : le transform `strip-dsfr-editor-source` (eleventy.config.js)
 *      doit l'avoir retiré.
 *
 * Lancé en CI après le build (`.github/workflows/{test,deploy}.yml`).
 * Utilisable sans `_site/` : l'étape 2 est simplement ignorée.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const MARKER = "<!--dsfr-editor:source";

/** Liste récursive des fichiers d'extension donnée sous `dir`. */
function walk(dir, ext) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((d) => d.isFile() && d.name.endsWith(ext))
    .map((d) => join(d.parentPath ?? d.path, d.name));
}

const errors = [];

// 1. Lint des sources
for (const file of walk("content", ".md")) {
  const src = readFileSync(file, "utf8");
  if (!src.includes(MARKER)) continue;
  const fmEnd = src.startsWith("---\n") ? src.indexOf("\n---", 4) : -1;
  const frontmatter = fmEnd === -1 ? "" : src.slice(4, fmEnd);
  if (!/^templateEngineOverride:\s*false\s*$/m.test(frontmatter)) {
    errors.push(
      `${file} — corps dsfr-editor sans « templateEngineOverride: false » au frontmatter`,
    );
  }
}

// 2. Scan de la sortie
for (const file of walk("_site", ".html")) {
  if (readFileSync(file, "utf8").includes(MARKER)) {
    errors.push(`${file} — marqueur source non retiré (transform strip-dsfr-editor-source)`);
  }
}

if (errors.length) {
  console.error(
    `check-build : ${errors.length} problème(s)\n` +
      errors.map((e) => `  - ${e}`).join("\n"),
  );
  process.exit(1);
}
console.log("check-build : OK");
