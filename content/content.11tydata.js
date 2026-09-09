module.exports = {
    lang: 'fr',
    // « Mis à jour le… » : date du dernier commit Git touchant la page
    // (stable quel que soit le checkout, contrairement au mtime du fichier).
    date: 'git Last Modified',
    // Site monolingue servi à la racine : `slugOverride` produit /mon-slug/
    // (sans préfixe de langue).
    permalink: function (data) {
        if (data.slugOverride) {
            return `/${this.slugify(data.slugOverride)}/`;
        }
    }
    // NB : les pages éditées avec dsfr-editor portent `templateEngineOverride: false`
    // dans leur frontmatter (champ caché de la config Decap, cf. admin-src/main.tsx)
    // — corps HTML servi verbatim, ni Nunjucks ni markdown-it.
    // Ne PAS calculer cette clé ici : en Eleventy 2.x une fonction eleventyComputed
    // pose toujours la clé, et la home (non concernée) perdrait ses {{ component() }}.
};
