# Mutualiser les outils DSFR de ce dépôt

> Statut : **décision prise (2 septembre 2026), extraction non commencée.**
> Objectif : partager avec d'autres équipes les briques réutilisables produites
> ici, et garder dans ce dépôt uniquement le **contenu de l'aide RDV Service
> Public** + les éventuels composants **spécifiques à ce site**.

## État des lieux — 3 couches de portabilité

| Bloc | Fichiers | Nature | Couplage |
|---|---|---|---|
| **1. Cœur portable** | `markdown-config.js`, `markdown-custom-containers.js` ; règles CSS `.steps` / `.tiles` / largeur de lecture / fallback emoji dans `public/css/index.css` | Plugin **markdown-it** pur + CSS compagnon | Aucun — 11ty, Astro, VitePress, Nuxt Content, markdown-it nu |
| **2. Couche CMS** | `public/admin/editor-components.js`, `admin-src/preview.js`, hook esbuild de `eleventy.config.js` | Scripts navigateur (`window.CMS.*`) | **Fort** avec la syntaxe des conteneurs (les `pattern` doivent matcher) + noms de collections |
| **3. Thème Eleventy** | `_includes/layouts/*`, `_includes/templates/*`, `_includes/components/{tile,component,breadcrumb,back_to_top}.njk`, glu de `eleventy.config.js` (passthrough DSFR, filtre `tableOfContents`, shims i18n), `public/admin/config.yml` | Thème Eleventy opinioné | Eleventy uniquement ; recoupe déjà [`codegouvfr/eleventy-dsfr`](https://github.com/codegouvfr/eleventy-dsfr) |

Rien n'est aujourd'hui **spécifique à RDVSP** : tous les conteneurs / composants
sont génériques. Si des composants propres au site apparaissent (widget de prise
de RDV, encart support…), ils resteront ici, en surcouche des paquets.

## Écosystème

- [`codegouvfr/eleventy-dsfr`](https://github.com/codegouvfr/eleventy-dsfr) :
  template **à cloner**, **plus activement maintenu**, sans CMS.
  [Issue #17](https://github.com/codegouvfr/eleventy-dsfr/issues/17) demande un
  accordéon markdown → intérêt réel, vélocité faible.
- Autres sites d'aide de l'État : GitBook (fin de vie),
  [`docsify-dsfr-template`](https://github.com/codegouvfr/docsify-dsfr-template),
  Eleventy. Un **plugin markdown-it agnostique** comble un vrai trou multi-stack.
- Un « plugin 11ty » est techniquement un paquet npm
  ([doc](https://www.11ty.dev/docs/create-plugin/)). Vraie question : **paquet
  couplé Eleventy** vs **paquets agnostiques** vs **les deux**.
- Sveltia : [pas de registre de plugins](https://sveltiacms.app/en/docs/api/editor-components).
  Distribuer = publier un bundle navigateur chargé en `<script>`. L'aperçu
  par-composant (`toPreview`) n'est pas encore implémenté côté Sveltia — chez nous
  la fidélité vient de `registerPreviewTemplate` dans `preview.js`.

## Pistes envisagées

### A — Plugin Eleventy unique (`eleventy-plugin-dsfr`)

Un paquet, un `addPlugin` : conteneurs + passthrough DSFR + filtres + (option) CMS + (option) layouts.

- **Pour** : une ligne pour le consommateur ; cible pile le public `eleventy-dsfr` ;
  un seul dépôt / version / doc ; `eleventy-dsfr` pourrait en dépendre et maigrir.
- **Contre** : **Eleventy-only** — Astro / VitePress / docsify exclus du travail
  markdown (le plus dur et le plus universel) ; couple une logique portable à un
  framework ; le volet CMS reste mal logé.

### B — Paquets npm agnostiques (`markdown-it-dsfr` + `sveltia-cms-dsfr`)

- **Pour** : `markdown-it-dsfr` réutilisable par **tout** consommateur markdown-it
  (portée maximale) ; séparation des responsabilités ; paquets petits et
  testables ; indépendant de la santé de `eleventy-dsfr`.
- **Contre** : 2+ paquets à publier / versionner / synchroniser ; **couplage
  inter-paquets réel** (les `pattern`/`toBlock` des composants d'éditeur doivent
  suivre les parsers de conteneurs — décalage = round-trip cassé en silence) ;
  pas d'histoire « une ligne » pour Eleventy.

### C — Les deux : cœur agnostique + fin wrapper `eleventy-plugin-dsfr` ✅ **retenue**

`markdown-it-dsfr` (+ CSS) et `sveltia-cms-dsfr` = couche portable. Puis
`eleventy-plugin-dsfr` ≈ 50 lignes de glu (enregistre le plugin md-it, copie
CSS + assets DSFR, ajoute `tableOfContents`, câble esbuild).

- **Pour** : Eleventy → un `addPlugin` ; les autres → les briques ; le wrapper
  Eleventy reste trivial ; `eleventy-dsfr` peut en dépendre ; robuste à un
  changement de stack.
- **Contre** : le plus de pièces (3 paquets) → **monorepo pnpm/npm workspaces**
  quasi obligatoire ; le plus de travail initial.

### Hors périmètre paquet

- **Layouts + `config.yml`** : mieux en **starter à cloner** qu'en paquet
  (Eleventy 2 gère mal les templates packagés). `eleventy-dsfr` joue déjà ce rôle.
- **PR à `eleventy-dsfr`** : viser **petit** — fermer l'issue #17 (accordéon
  markdown) en pointant vers `markdown-it-dsfr`, comme vitrine. Pas un gros MR CMS.

## Décision

**Piste C, séquencée.** On n'est **pas prêt à publier sur npm** : l'extraction se
fait d'abord *en interne* (monorepo local sous le compte `botadrien`), ce dépôt
consomme via `file:` / dépendance git, et la publication npm (ou vers `codegouvfr`)
sera décidée plus tard.

Ordre :

1. **`markdown-it-dsfr` (+ `dsfr-content.css`)** — 80 % de la valeur, faible
   risque, utile tout de suite.
2. **`sveltia-cms-dsfr`** — composants d'éditeur + aperçu CMS, une fois #1 stable.
3. **`eleventy-plugin-dsfr`** — seulement s'il y a des consommateurs Eleventy tiers.

## Feuille de route

### Étape 0 — Filet de sécurité *(fait)*

- [x] Suite de tests `test/` (`npm test`, `node:test`) : rendu de chaque
      conteneur + round-trip `fromBlock → toBlock` des composants d'éditeur.
      C'est le **prérequis** pour scinder en paquets sans casser les round-trips
      en silence.

### Étape 1 — Isoler le cœur dans ce dépôt (sans publier)

- [ ] Créer `packages/markdown-it-dsfr/` : `index.js` (le plugin, forme
      `module.exports = (md, opts) => …`), `containers.js` (ex-
      `markdown-custom-containers.js`), `dsfr-content.css` (règles extraites de
      `index.css`), `syntax.js` (marqueurs + regex **canoniques**, à importer
      plus tard par `sveltia-cms-dsfr`), `package.json` (`private: true`,
      `version: 0.0.0`), `README.md`.
- [ ] `eleventy.config.js` + `admin-src/preview.js` consomment
      `packages/markdown-it-dsfr` en chemin relatif.
- [ ] `base.njk` : inclure `dsfr-content.css` depuis le paquet.
- [ ] Basculer le dépôt en **npm workspaces** (`"workspaces": ["packages/*"]`).
- [ ] Tests déplacés / partagés avec le paquet.

### Étape 2 — `sveltia-cms-dsfr`

- [ ] `packages/sveltia-cms-dsfr/` : composants d'éditeur + module d'aperçu,
      build navigateur via esbuild (IIFE + ESM).
- [ ] Les `pattern`/`toBlock` importent `syntax.js` de `markdown-it-dsfr`
      (fin du couplage silencieux).
- [ ] `admin-src/preview.js` : ne garder ici que la partie spécifique au site
      (noms de collections, résolution `./assets/`).

### Étape 3 — `eleventy-plugin-dsfr` *(conditionnel)*

- [ ] Wrapper mince : `addPlugin` unique = md-it + passthrough DSFR +
      `tableOfContents` + hook esbuild CMS.
- [ ] Ce dépôt l'utilise ; `eleventy.config.js` fond à ~30 lignes.

### Étape 4 — Ouverture

- [ ] Choisir l'hébergement de publication (npm public, org `codegouvfr`, …).
- [ ] Petite PR `eleventy-dsfr` (issue #17) comme vitrine.
- [ ] `README` de chaque paquet + exemples 11ty / Astro.

## Références

- [eleventy-dsfr](https://github.com/codegouvfr/eleventy-dsfr) ·
  [issue #17](https://github.com/codegouvfr/eleventy-dsfr/issues/17) ·
  [docsify-dsfr-template](https://github.com/codegouvfr/docsify-dsfr-template)
- [11ty — Create a Plugin](https://www.11ty.dev/docs/create-plugin/) ·
  [11ty — Markdown](https://www.11ty.dev/docs/languages/markdown/)
- [markdown-it-container](https://www.npmjs.com/package/markdown-it-container)
- [Sveltia — Editor Components](https://sveltiacms.app/en/docs/api/editor-components) ·
  [@sveltia/cms](https://www.npmjs.com/package/@sveltia/cms)
