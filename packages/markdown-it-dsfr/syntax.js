/**
 * Marqueurs canoniques des conteneurs Markdown DSFR.
 *
 * Source de vérité de la SYNTAXE (indépendamment du rendu HTML, qui vit dans
 * `containers.js`). Destiné à être importé par `sveltia-cms-dsfr` pour garder les
 * `pattern` des composants d'éditeur alignés sur ces parsers — cf.
 * `docs/mutualisation-outils-dsfr.md`, étape 2.
 *
 * Convention : le conteneur « groupe » utilise un marqueur plus long (`????`,
 * `::::`) que ses éléments (`???`, `:::`) pour permettre l'imbrication sans
 * ambiguïté (markdown-it-container ne gère pas l'imbrication à marqueur égal).
 */
module.exports = {
    // Accordéons — marqueur `?`
    accordionsGroup: { open: "????accordionsgroup", close: "????" },
    accordionItem: { fence: "???", // `??? Titre` … `???`
        titled: true },

    // Conteneurs à `:` (3 deux-points), un seul niveau
    alert: { fence: ":::", names: ["info", "success", "warning", "error"], title: "optional" },
    callout: { fence: ":::", name: "callout", title: "optional" },
    highlight: { fence: ":::", name: "highlight", title: "none" },
    quote: { fence: ":::", name: "quote", title: "none" /* arg = URL image */ },

    // Groupes imbriqués — groupe `::::`, élément `:::`
    steps: { group: "::::steps", groupClose: "::::", item: ":::step" /* `:::step Titre` */ },
    tiles: { group: "::::tiles", groupClose: "::::", item: ":::tile" /* `:::tile Titre | lien` */ },
};
