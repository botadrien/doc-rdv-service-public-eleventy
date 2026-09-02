// Contrat des composants d'éditeur Sveltia (public/admin/editor-components.js).
//
// On vérifie que chaque composant fait un aller-retour stable
// `pattern → fromBlock → toBlock → pattern → fromBlock`, ET que la sortie
// `toBlock` est bien reconnue par les parsers markdown-it correspondants.
// C'est ce contrat qui devra survivre à l'extraction en paquets séparés
// (`markdown-it-dsfr` + `sveltia-cms-dsfr`, cf. docs/mutualisation-outils-dsfr.md).

const test = require("node:test");
const assert = require("node:assert/strict");
const MarkdownIt = require("markdown-it");
const markdownItDsfr = require("markdown-it-dsfr");
const slugify = require("@sindresorhus/slugify");

// --- Charge editor-components.js dans un faux environnement navigateur --------
const registry = new Map();
global.window = {
  CMS: { registerEditorComponent: (c) => registry.set(c.id, c) },
};
require("../public/admin/editor-components.js");

const md = new MarkdownIt({ html: true }).use(markdownItDsfr, {
  slugify: (s) => slugify("" + s, { decamelize: false }),
});

/** pattern → fromBlock → toBlock → fromBlock : les données doivent être stables. */
function roundTrip(id, markdown) {
  const c = registry.get(id);
  assert.ok(c, `composant "${id}" enregistré`);
  const m1 = markdown.match(c.pattern);
  assert.ok(m1, `pattern de "${id}" reconnaît sa propre syntaxe`);
  const data1 = c.fromBlock(m1);
  const block = c.toBlock(data1);
  const m2 = (block + "\n").match(c.pattern);
  assert.ok(m2, `pattern de "${id}" reconnaît la sortie de toBlock`);
  const data2 = c.fromBlock(m2);
  assert.deepEqual(data2, data1, `aller-retour stable pour "${id}"`);
  return block;
}

test("tous les composants attendus sont enregistrés", () => {
  assert.deepEqual(
    [...registry.keys()].sort(),
    ["dsfr-accordion", "dsfr-accordions-group", "dsfr-alert", "dsfr-callout", "dsfr-highlight", "steps", "tiles"].sort(),
  );
});

test("dsfr-alert : aller-retour + rendu fr-alert", () => {
  const block = roundTrip("dsfr-alert", ":::warning Attention\n\nCorps **fort**.\n\n:::\n");
  assert.match(md.render(block), /fr-alert fr-alert--warning/);
});

test("dsfr-callout : aller-retour + rendu fr-callout", () => {
  const block = roundTrip("dsfr-callout", ":::callout Titre\n\nContenu.\n\n:::\n");
  assert.match(md.render(block), /<div class="fr-callout">/);
});

test("dsfr-highlight : aller-retour + rendu fr-highlight", () => {
  const block = roundTrip("dsfr-highlight", ":::highlight\n\nExergue.\n\n:::\n");
  assert.match(md.render(block), /<div class="fr-highlight">/);
});

test("dsfr-accordions-group : aller-retour + rendu fr-accordions-group", () => {
  const block = roundTrip(
    "dsfr-accordions-group",
    "????accordionsgroup\n\n??? Q1\n\nR1\n\n???\n\n??? Q2\n\nR2\n\n???\n\n????\n",
  );
  assert.match(md.render(block), /<div class="fr-accordions-group">/);
});

test("dsfr-accordion : aller-retour + rendu fr-accordion", () => {
  const block = roundTrip("dsfr-accordion", "??? Question\n\nRéponse.\n\n???\n");
  assert.match(md.render(block), /<section class="fr-accordion">/);
});

test("steps : aller-retour + rendu ol.steps", () => {
  const block = roundTrip(
    "steps",
    "::::steps\n\n:::step Un\n\nA.\n\n:::\n\n:::step Deux\n\nB.\n\n:::\n\n::::\n",
  );
  const html = md.render(block);
  assert.match(html, /<ol class="steps">/);
  assert.equal((html.match(/steps__item/g) || []).length, 2);
});

test("tiles : aller-retour + rendu ul.tiles", () => {
  const block = roundTrip(
    "tiles",
    "::::tiles\n\n:::tile Interne | /faq/\n\nDesc.\n\n:::\n\n:::tile Externe | https://x.fr/\n\n:::\n\n::::\n",
  );
  const html = md.render(block);
  assert.match(html, /<ul class="tiles"/);
  assert.match(html, /href="https:\/\/x\.fr\/" target="_blank"/);
});
