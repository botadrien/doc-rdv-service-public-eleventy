const {DateTime} = require("luxon");

const esbuild = require("esbuild");

const pluginBundle = require("@11ty/eleventy-plugin-bundle");
const pluginNavigation = require("@11ty/eleventy-navigation");
const {EleventyHtmlBasePlugin} = require("@11ty/eleventy");
const {EleventyI18nPlugin} = require("@11ty/eleventy");

// Config markdown-it partagée avec l'aperçu du CMS (cf. docs/apercu-cms-dsfr.md).
const configureMarkdown = require("./markdown-config");

// Site monolingue (français). On garde les chaînes d'UI du template mais on
// remplace la mécanique i18n (plugins @11ty/eleventy-i18n + @codegouvfr/eleventy-plugin-i18n)
// par de simples filtres neutres — les pages sont servies à la racine, sans préfixe /fr/.
const uiStrings = require("./_data/i18n/fr");

module.exports = function (eleventyConfig) {
    // Copie du dossier `public` + des assets DSFR vers la sortie.
    eleventyConfig.addPassthroughCopy({
        "./public/": "/",
        "./node_modules/@gouvfr/dsfr/dist/favicon": "/favicon",
        "./node_modules/@gouvfr/dsfr/dist/fonts": "/css/fonts",
        "./node_modules/@gouvfr/dsfr/dist/icons": "/css/icons",
        "./node_modules/@gouvfr/dsfr/dist/dsfr.min.css": "/css/dsfr.min.css",
        "./node_modules/@gouvfr/dsfr/dist/utility/utility.min.css": "/css/utility/utility.min.css",
        "./node_modules/@gouvfr/dsfr/dist/dsfr.module.min.js": "/js/dsfr.module.min.js",
        "./node_modules/@gouvfr/dsfr/dist/dsfr.nomodule.min.js": "/js/dsfr.nomodule.min.js",
        "./node_modules/@gouvfr/dsfr/dist/artwork": "/artwork"
    });

    // Images co-localisées avec les pages (content/<section>/<page>/assets/…)
    eleventyConfig.addPassthroughCopy("content/**/assets/*.{png,jpg,jpeg,gif,svg,webp,avif}");
    eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpeg,jpg,gif}");

    // Plugins
    eleventyConfig.addPlugin(pluginNavigation);
    eleventyConfig.addPlugin(pluginBundle);
    eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
    // Fournit page.lang (à partir de la donnée `lang`) — site monolingue français.
    eleventyConfig.addPlugin(EleventyI18nPlugin, {
        defaultLanguage: "fr",
        errorMode: "never"
    });

    // --- Shims i18n (site monolingue) -----------------------------------
    // `"clé" | i18n` -> chaîne française ; `url | locale_url` -> URL inchangée
    // (pages servies à la racine, sans préfixe /fr/ — on écrase le filtre du plugin).
    eleventyConfig.addFilter("i18n", (key) => uiStrings[key] !== undefined ? uiStrings[key] : key);
    eleventyConfig.addFilter("locale_url", (url) => url);

    // Collection triée par chemin (plan du site HTML + sitemap.xml).
    eleventyConfig.addCollection("allSortedByPathAsc", function(collectionApi) {
        return collectionApi.getAll().sort((a, b) => a.inputPath.localeCompare(b.inputPath));
    });

    // --- Filtres -------------------------------------------------------
    eleventyConfig.addFilter("readableDate", function readableDate(dateObj, format, zone) {
        return DateTime.fromJSDate(dateObj, {zone: zone || "utc"})
            .setLocale(this.page.lang || "fr")
            .toFormat(format || "dd LLLL yyyy");
    });

    eleventyConfig.addFilter("htmlDateString", (dateObj) => {
        return DateTime.fromJSDate(dateObj, {zone: "utc"}).toFormat("yyyy-LL-dd");
    });

    // Sommaire (fr-summary) : extrait les titres de niveau 2 du HTML rendu.
    // markdown-it-anchor pose déjà un `id` et un lien `.header-anchor` sur chaque
    // titre — on retire ce lien avant de récupérer le texte.
    eleventyConfig.addFilter("tableOfContents", (content) => {
        const items = [];
        const re = /<h2[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/gi;
        let match;
        while ((match = re.exec(content || ""))) {
            const text = match[2]
                .replace(/<a\b[^>]*class="[^"]*header-anchor[^"]*"[\s\S]*?<\/a>/gi, "")
                .replace(/<[^>]+>/g, "")
                .trim();
            if (text) {
                items.push({ id: match[1], text });
            }
        }
        return items;
    });

    // Réglages de la bibliothèque Markdown — voir markdown-config.js (partagé avec
    // l'aperçu du CMS).
    eleventyConfig.amendLibrary("md", mdLib =>
        configureMarkdown(mdLib, {slugify: eleventyConfig.getFilter("slugify")})
    );

    // Bundle navigateur de l'aperçu du CMS (public/admin/preview.gen.js, gitignoré).
    // Régénéré avant chaque build — voir docs/apercu-cms-dsfr.md.
    eleventyConfig.addWatchTarget("admin-src/");
    eleventyConfig.addWatchTarget("markdown-config.js");
    eleventyConfig.on("eleventy.before", async () => {
        await esbuild.build({
            entryPoints: ["admin-src/preview.js"],
            bundle: true,
            format: "iife",
            minify: true,
            target: "es2020",
            outfile: "public/admin/preview.gen.js",
            logLevel: "warning",
        });
    });

    eleventyConfig.setNunjucksEnvironmentOptions({
        trimBlocks: true,
        lstripBlocks: true,
    });

    return {
        templateFormats: ["md", "njk", "html", "liquid"],
        markdownTemplateEngine: "njk",
        htmlTemplateEngine: "njk",
        dir: {
            input: "content",
            includes: "../_includes",
            data: "../_data",
            output: "_site"
        },
        pathPrefix: "/",
    };
};
