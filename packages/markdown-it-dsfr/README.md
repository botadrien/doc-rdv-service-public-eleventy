# markdown-it-dsfr

Plugin [markdown-it](https://github.com/markdown-it/markdown-it) qui ajoute des
conteneurs pour le [Système de Design de l'État (DSFR)](https://www.systeme-de-design.gouv.fr/).
Framework-agnostique : Eleventy, Astro, VitePress, Nuxt Content, markdown-it nu.

> **Statut : interne, non publié.** Extrait du dépôt
> `doc-rdv-service-public-eleventy` (étape 1 de
> [`docs/mutualisation-outils-dsfr.md`](../../docs/mutualisation-outils-dsfr.md)).
> Consommé en local via npm workspaces.

## Utilisation

```js
const MarkdownIt = require("markdown-it");
const markdownItDsfr = require("markdown-it-dsfr");

const md = new MarkdownIt({ html: true }).use(markdownItDsfr, {
  // optionnel — passé à markdown-it-anchor
  slugify: (s) => s.trim().toLowerCase().replace(/\s+/g, "-"),
});
```

Eleventy :

```js
eleventyConfig.amendLibrary("md", (md) =>
  md.use(markdownItDsfr, { slugify: eleventyConfig.getFilter("slugify") }),
);
```

Charger aussi le CSS compagnon **après `dsfr.min.css`** (style des étapes et des
tuiles, que le DSFR ne fournit pas) :

```
node_modules/markdown-it-dsfr/dsfr-content.css
```

Le DSFR n'a pas de garde-fou `img { max-width: 100% }` global : prévoyez-le dans
votre CSS, sinon les captures d'écran dans le Markdown débordent.

## Conteneurs

| Syntaxe | Rend |
|---|---|
| `:::info` / `:::success` / `:::warning` / `:::error` `[titre]` … `:::` | `fr-alert` (`fr-alert--sm` sans titre) |
| `:::callout [titre]` … `:::` | `fr-callout` |
| `:::highlight` … `:::` | `fr-highlight` |
| `:::quote [url-image]` … `:::` | `fr-quote` |
| `????accordionsgroup` … `????` avec `??? Titre` … `???` | `fr-accordions-group` + `fr-accordion` |
| `::::steps` … `::::` avec `:::step Titre` … `:::` | `<ol class="steps">` (badges numérotés CSS) |
| `::::tiles` … `::::` avec `:::tile Titre \| lien` … `:::` | `<ul class="tiles">` de `fr-tile--sm` |

Plus : ancres de titres (`h1`–`h4`, `.header-anchor`) et `<table class="fr-table">`.

Marqueurs canoniques : [`syntax.js`](syntax.js). Rendu HTML : [`containers.js`](containers.js).

## Tests

```bash
npm test    # node:test — rendu DSFR de chaque conteneur
```
