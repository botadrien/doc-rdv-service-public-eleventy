// Rendu des conteneurs Markdown DSFR (markdown-config.js + markdown-custom-containers.js).
// Sert de contrat pour l'extraction future en paquet `markdown-it-dsfr`
// (cf. docs/mutualisation-outils-dsfr.md).

const test = require("node:test");
const assert = require("node:assert/strict");
const MarkdownIt = require("markdown-it");
const configureMarkdown = require("../markdown-config.js");

// Même slugify que l'aperçu CMS (≈ le filtre `slugify` intégré à Eleventy).
const slugify = require("@sindresorhus/slugify");
const md = configureMarkdown(new MarkdownIt({ html: true }), {
  slugify: (s) => slugify("" + s, { decamelize: false }),
});
const render = (src) => md.render(src).replace(/\s+/g, " ").trim();

test("alerte sans titre → fr-alert--sm", () => {
  const html = render(":::info\n\nMessage.\n\n:::");
  assert.match(html, /<div class="fr-alert fr-alert--info fr-alert--sm">/);
  assert.match(html, /<p>Message\.<\/p>/);
});

test("alerte avec titre → fr-alert__title, sans --sm", () => {
  const html = render(":::warning Attention\n\nCorps.\n\n:::");
  assert.match(html, /<div class="fr-alert fr-alert--warning /);
  assert.match(html, /<h3 class="fr-alert__title">\s*Attention<\/h3>/);
});

test("les 4 types d'alerte sont reconnus", () => {
  for (const type of ["info", "success", "warning", "error"]) {
    assert.match(render(`:::${type}\n\nx\n\n:::`), new RegExp(`fr-alert--${type}`));
  }
});

test("mise en avant → fr-callout + fr-callout__text", () => {
  const html = render(":::callout Bon à savoir\n\nContenu.\n\n:::");
  assert.match(html, /<div class="fr-callout">/);
  assert.match(html, /<h3 class="fr-callout__title">\s*Bon à savoir<\/h3>/);
  assert.match(html, /<div class="fr-callout__text">/);
});

test("mise en exergue → fr-highlight", () => {
  assert.match(render(":::highlight\n\nPhrase.\n\n:::"), /<div class="fr-highlight">/);
});

test("citation → fr-quote", () => {
  assert.match(render(":::quote\n\nUne citation.\n\n:::"), /<figure class="fr-quote/);
});

test("accordéons → fr-accordions-group + fr-accordion + fr-collapse", () => {
  const html = render("????accordionsgroup\n\n???Question ?\n\nRéponse.\n\n???\n\n????");
  assert.match(html, /<div class="fr-accordions-group">/);
  assert.match(html, /<section class="fr-accordion">/);
  assert.match(html, /<button class="fr-accordion__btn"[^>]*>\s*Question \?/);
  assert.match(html, /<div class="fr-collapse" id="accordion-/);
});

test("étapes → ol.steps > li.steps__item + steps__title, numérotation neutralisée", () => {
  const html = render("::::steps\n\n:::step Première\n\nA.\n\n:::\n\n:::step Deuxième\n\nB.\n\n:::\n\n::::");
  assert.match(html, /<ol class="steps">/);
  assert.equal((html.match(/<li class="steps__item">/g) || []).length, 2);
  assert.match(html, /<p class="steps__title">Première<\/p>/);
  // pas de numéro en dur dans le HTML (le badge vient du CSS compteur)
  assert.doesNotMatch(html, /steps__title">\d\./);
});

test("étape sans corps ne casse pas", () => {
  const html = render("::::steps\n\n:::step Seule\n\n:::\n\n::::");
  assert.match(html, /<p class="steps__title">Seule<\/p>/);
});

test("tuiles → ul.tiles[--tiles-cols] > fr-tile--sm, lien externe = target _blank", () => {
  const html = render(
    "::::tiles\n\n:::tile Interne | /faq/\n\nDesc.\n\n:::\n\n:::tile Externe | https://x.fr/\n\n:::\n\n::::",
  );
  assert.match(html, /<ul class="tiles" style="--tiles-cols:2">/);
  assert.match(html, /class="fr-tile fr-tile--sm fr-enlarge-link"/);
  assert.match(html, /href="\/faq\/"[^>]*>Interne<\/a>/);
  assert.match(html, /href="https:\/\/x\.fr\/" target="_blank" rel="noopener">Externe<\/a>/);
});

test("tables markdown → table.fr-table", () => {
  assert.match(render("| a | b |\n|---|---|\n| 1 | 2 |"), /<table class="fr-table">/);
});

test("titres h2/h3 reçoivent un id (markdown-it-anchor)", () => {
  assert.match(render("## Ma section"), /<h2[^>]*\bid="ma-section"/);
});
