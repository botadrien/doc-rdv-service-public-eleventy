/*
 * Contrat de slug — un seul comportement d'ancre de titre sur tout le site.
 *
 * Trois chemins produisent des `id` de titre / des permaliens :
 *   - le filtre `slugify` d'Eleventy (permaliens, et markdown-it-anchor sur la
 *     home non migrée) ;
 *   - `admin-src/serialize.ts` `injectHeadingIds` (pages éditées avec dsfr-editor) ;
 *   - `markdown-it-anchor` via ce paquet (recoit le filtre d'Eleventy).
 *
 * Ils doivent coïncider, sinon les liens du sommaire (`fr-summary`) tombent à
 * côté. La convention : `@sindresorhus/slugify` avec `{ decamelize: false }`.
 * Ce test échoue si une montée de version d'Eleventy ou de la lib change ça.
 */
const test = require("node:test");
const assert = require("node:assert/strict");

const eleventySlugify = require("@11ty/eleventy/src/Filters/Slugify.js");
const slugify = require("@sindresorhus/slugify");

/** Ce que fait `serialize.ts` : slugify avec decamelize désactivé. */
const headingId = (s) => slugify(s, { decamelize: false });

const FIXTURES = [
  "Comment ça marche",
  "Été 2024 !",
  "Prendre un rendez-vous",
  "FAQ & dépannage",
  "ProblèmeConnu", // pas de découpe camelCase attendue
  "  Espaces  en  trop  ",
  "Étape 1 : préparer",
];

test("injectHeadingIds == filtre slugify d'Eleventy", () => {
  for (const s of FIXTURES) {
    assert.equal(headingId(s), eleventySlugify(s), `divergence sur « ${s} »`);
  }
});

test("le filtre d'Eleventy garde decamelize:false", () => {
  assert.equal(eleventySlugify("ProblèmeConnu"), "problemeconnu");
});
