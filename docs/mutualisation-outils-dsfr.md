# Mutualiser les outils DSFR de ce dépôt

> Statut : **`markdown-it-dsfr` isolé** (paquet local, 2 sept. 2026).
> Le reste est en pause — pas de plan de publication npm à ce jour.

Objectif : garder dans ce dépôt le **contenu de l'aide RDV Service Public** + ce
qui est spécifique à ce site, et pouvoir partager les briques génériques.

## Les briques

| Bloc | Où | Nature | Portabilité |
|---|---|---|---|
| **Conteneurs Markdown DSFR** | `packages/markdown-it-dsfr/` | plugin **markdown-it** pur + `dsfr-content.css` | totale (11ty, Astro, VitePress, markdown-it nu) |
| **Éditeur WYSIWYG DSFR** | `packages/dsfr-editor/` (vendoré, cf. [`vendoring-dsfr-editor.md`](vendoring-dsfr-editor.md)) | blocs BlockNote + `@codegouvfr/react-dsfr` | React ; upstream = [`botadrientronics/dsfr-editor`](https://github.com/botadrientronics/dsfr-editor) |
| **Thème Eleventy** | `_includes/**`, glu de `eleventy.config.js` | thème opinioné | Eleventy ; recoupe [`codegouvfr/eleventy-dsfr`](https://github.com/codegouvfr/eleventy-dsfr) |

Rien n'est aujourd'hui spécifique à RDVSP : les conteneurs et blocs sont génériques.

## `packages/markdown-it-dsfr` — état

- **Isolé** dans le dépôt (npm workspaces), `private`, non publié.
- Conteneurs : `:::info|success|warning|error`, `:::callout`, `:::highlight`,
  `:::quote`, `????accordionsgroup` / `???`, `::::steps`, `::::tiles`, + ancres de
  titres et `<table class="fr-table">`. Tests : `packages/markdown-it-dsfr/test/`.
- **Depuis la bascule Decap/dsfr-editor**, ce plugin n'est **plus câblé sur le
  rendu du corps de page** : seule la home (`content/index.md`, non migrée) le
  déclenche encore via `amendLibrary("md", …)` dans `eleventy.config.js`. Une
  fois la home migrée, `amendLibrary` disparaît et `markdown-it-dsfr` devient un
  paquet purement autonome (son CSS `dsfr-content.css` reste servi pour le markup
  `.steps` / `.tiles` figé dans les pages).

## Écosystème

- [`codegouvfr/eleventy-dsfr`](https://github.com/codegouvfr/eleventy-dsfr) :
  template à cloner, sans CMS.
  [Issue #17](https://github.com/codegouvfr/eleventy-dsfr/issues/17) demande un
  accordéon markdown — `markdown-it-dsfr` y répond ; PR « vitrine » possible.
- Autres sites d'aide de l'État : GitBook (fin de vie), `docsify-dsfr-template`,
  Eleventy. Un plugin markdown-it agnostique comble un vrai trou multi-stack.

## Si on reprend la mutualisation

- **`markdown-it-dsfr`** : publier (npm public ou org `codegouvfr`) + README avec
  exemples 11ty / Astro. C'est 80 % de la valeur, faible risque.
- **`eleventy-plugin-dsfr`** (~50 lignes : plugin md-it + passthrough DSFR +
  `tableOfContents`) : seulement s'il y a des consommateurs Eleventy tiers.
- **`dsfr-editor`** : déjà un dépôt à part ; on contribue en amont, on ne
  re-package pas ici (cf. [`vendoring-dsfr-editor.md`](vendoring-dsfr-editor.md)).
- **Layouts + config** : mieux en starter à cloner qu'en paquet (`eleventy-dsfr`
  joue déjà ce rôle).

## Références

- [eleventy-dsfr](https://github.com/codegouvfr/eleventy-dsfr) ·
  [issue #17](https://github.com/codegouvfr/eleventy-dsfr/issues/17) ·
  [docsify-dsfr-template](https://github.com/codegouvfr/docsify-dsfr-template)
- [11ty — Create a Plugin](https://www.11ty.dev/docs/create-plugin/)
- [markdown-it-container](https://www.npmjs.com/package/markdown-it-container)
