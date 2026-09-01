const {DateTime} = require("luxon");
const {nanoid} = require ("nanoid");

const esbuild = require("esbuild");

const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
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
    // Copy the contents of the `public` folder to the output folder
    // For example, `./public/css/` ends up in `_site/css/`
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

    // Watch content images for the image pipeline.
    eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpeg,jpg,gif}");

    // App plugins
    eleventyConfig.addPlugin(require("./eleventy.config.drafts.js"));
    eleventyConfig.addPlugin(require("./eleventy.config.images.js"));

    // Official plugins
    eleventyConfig.addPlugin(pluginSyntaxHighlight, {
        preAttributes: {tabindex: 0}
    });
    eleventyConfig.addPlugin(pluginNavigation);
    eleventyConfig.addPlugin(pluginBundle);
    eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
    // Fournit page.lang (à partir de la donnée `lang`) — site monolingue français.
    eleventyConfig.addPlugin(EleventyI18nPlugin, {
        defaultLanguage: "fr",
        errorMode: "never"
    });

    // --- Shims i18n (site monolingue) -------------------------------------
    // `"clé" | i18n` et `"clé" | i18n({}, lang)` -> chaîne française
    eleventyConfig.addFilter("i18n", (key) => uiStrings[key] !== undefined ? uiStrings[key] : key);
    // `url | locale_url` et `url | locale_url(lang)` -> URL inchangée : les pages
    // sont servies à la racine (pas de préfixe /fr/). On écrase le filtre du plugin i18n.
    eleventyConfig.addFilter("locale_url", (url) => url);
    // `collection | filterCollectionLang` -> collection inchangée
    eleventyConfig.addFilter("filterCollectionLang", (collection) => collection);
    eleventyConfig.addGlobalData("availableLang", ["fr"]);

    // Custom collections
    eleventyConfig.addCollection("allSortedByPathAsc", function(collectionApi) {
        return collectionApi.getAll().sort((a, b) => {
            return a.inputPath.localeCompare(b.inputPath);
        });
    });

    // Filters
    eleventyConfig.addFilter("jsDateObject", function jsDateObject(dateStr, format, zone) {
        return DateTime.fromFormat(dateStr, format || "yyyy-LL-dd", {zone: zone || "utc"}).toJSDate();
    });

    eleventyConfig.addFilter("readableDate", function readableDate(dateObj, format, zone) {
        return DateTime.fromJSDate(dateObj, {zone: zone || "utc"})
            .setLocale(this.page.lang || "fr")
            .toFormat(format || "dd LLLL yyyy");
    });

    eleventyConfig.addFilter("htmlDateString", (dateObj) => {
        return DateTime.fromJSDate(dateObj, {zone: "utc"}).toFormat("yyyy-LL-dd");
    });

    eleventyConfig.addFilter("getYear", (dateObj) => DateTime.fromJSDate(dateObj, {zone: "utc"}).year);
    eleventyConfig.addFilter("getMonth", (dateObj) => DateTime.fromJSDate(dateObj, {zone: "utc"}).month);
    eleventyConfig.addFilter("getDay", (dateObj) => DateTime.fromJSDate(dateObj, {zone: "utc"}).day);

    // Get the first `n` elements of a collection.
    eleventyConfig.addFilter("head", (array, n) => {
        if (!Array.isArray(array) || array.length === 0) {
            return [];
        }
        if (n < 0) {
            return array.slice(n);
        }
        return array.slice(0, n);
    });

    // Return the smallest number argument
    eleventyConfig.addFilter("min", (...numbers) => Math.min.apply(null, numbers));

    eleventyConfig.addFilter("filterTagList", function filterTagList(tags, addTags = []) {
        return (tags || []).filter(tag => ["all", "nav", "post", "posts", "events"]
            .concat(addTags)
            .indexOf(tag) === -1);
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

    eleventyConfig.addNunjucksGlobal("nanoid", () => nanoid());

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
