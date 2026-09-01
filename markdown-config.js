const markdownItAnchor = require("markdown-it-anchor");
const markdownItAttrs = require("markdown-it-attrs");
const markdownItContainer = require("markdown-it-container");

const customMarkdownContainers = require("./markdown-custom-containers");

/**
 * Configuration markdown-it partagée entre Eleventy (`eleventy.config.js`) et
 * l'aperçu du CMS (`admin-src/preview.js`, bundlé pour le navigateur par esbuild).
 *
 * Toute évolution du rendu Markdown (nouveau conteneur, option d'un plugin…) se
 * fait ici, et l'aperçu du CMS reste automatiquement synchrone.
 *
 * @param {import("markdown-it")} md   Instance markdown-it à configurer.
 * @param {{ slugify: (str: string) => string }} options
 *        `slugify` : côté Eleventy, le filtre `slugify` intégré ; côté navigateur,
 *        `@sindresorhus/slugify` avec `{ decamelize: false }` (comportement
 *        identique — cf. `@11ty/eleventy/src/Filters/Slugify.js`).
 * @returns {import("markdown-it")} la même instance, configurée.
 */
module.exports = function configureMarkdown(md, { slugify }) {
    md.use(markdownItAnchor, {
        permalink: markdownItAnchor.permalink.ariaHidden({
            placement: "after",
            class: "header-anchor",
            symbol: "#",
            ariaHidden: false,
        }),
        level: [1, 2, 3, 4],
        slugify,
    });

    md.renderer.rules.table_open = function () {
        return '<table class="fr-table">';
    };

    md.use(markdownItAttrs);
    md.use(markdownItContainer, "callout", customMarkdownContainers.callout(md));
    md.use(markdownItContainer, "highlight", customMarkdownContainers.highlight(md));
    md.use(markdownItContainer, "quote", customMarkdownContainers.quote(md));
    md.use(markdownItContainer, "alert", customMarkdownContainers.alert(md));
    md.use(markdownItContainer, "accordion", customMarkdownContainers.accordion(md));

    return md;
};
