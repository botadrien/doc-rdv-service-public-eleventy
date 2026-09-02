const markdownItAnchor = require("markdown-it-anchor");
const markdownItContainer = require("markdown-it-container");

const containers = require("./containers");

/**
 * Plugin markdown-it : conteneurs et réglages pour le Système de Design de l'État
 * (DSFR). Framework-agnostique — utilisable avec Eleventy (`amendLibrary`), Astro
 * (`markdownit()`), VitePress, Nuxt Content ou markdown-it nu.
 *
 *     const MarkdownIt = require("markdown-it");
 *     const markdownItDsfr = require("markdown-it-dsfr");
 *     const md = new MarkdownIt({ html: true }).use(markdownItDsfr, { slugify });
 *
 * Fournit : ancres de titres (`markdown-it-anchor`), `<table class="fr-table">`,
 * et les conteneurs `:::info|success|warning|error`, `:::callout`, `:::highlight`,
 * `:::quote`, `????accordionsgroup` / `???`, `::::steps` / `:::step`,
 * `::::tiles` / `:::tile`. Voir `syntax.js` pour les marqueurs, `dsfr-content.css`
 * pour le style des étapes et des tuiles.
 *
 * @param {import("markdown-it")} md
 * @param {{ slugify?: (str: string) => string }} [options]
 *        `slugify` : passé à `markdown-it-anchor`. Côté Eleventy, le filtre
 *        `slugify` intégré ; côté navigateur, `@sindresorhus/slugify` avec
 *        `{ decamelize: false }`. Omis → slugify par défaut de `markdown-it-anchor`.
 */
module.exports = function markdownItDsfr(md, options = {}) {
    md.use(markdownItAnchor, {
        permalink: markdownItAnchor.permalink.ariaHidden({
            placement: "after",
            class: "header-anchor",
            symbol: "#",
            ariaHidden: false,
        }),
        level: [1, 2, 3, 4],
        ...(options.slugify ? { slugify: options.slugify } : {}),
    });

    md.renderer.rules.table_open = function () {
        return '<table class="fr-table">';
    };

    md.use(markdownItContainer, "callout", containers.callout(md));
    md.use(markdownItContainer, "highlight", containers.highlight(md));
    md.use(markdownItContainer, "quote", containers.quote(md));
    md.use(markdownItContainer, "alert", containers.alert(md));
    md.use(markdownItContainer, "steps", containers.steps(md));
    md.use(markdownItContainer, "step", containers.step(md));
    md.use(markdownItContainer, "tiles", containers.tiles(md));
    md.use(markdownItContainer, "tile", containers.tile(md));
    md.use(markdownItContainer, "accordion", containers.accordion(md));

    return md;
};
