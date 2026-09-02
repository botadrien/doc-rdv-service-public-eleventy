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
};
