module.exports = {
    lang: 'fr',
    // Site monolingue servi à la racine : `slugOverride` produit /mon-slug/
    // (sans préfixe de langue).
    permalink: function (data) {
        if (data.slugOverride) {
            return `/${this.slugify(data.slugOverride)}/`;
        }
    }
};
