# Architecture du CMS — Decap + dsfr-editor

> Statut : **en production** (bascule `1920f80`, 2026-09-09).
> Remplace `docs/apercu-cms-dsfr.md` (aperçu Sveltia, supprimé) et
> `admin-src/SPIKE-NOTES.md` (journal de spike, supprimé).

L'édition du contenu passe par **Decap CMS** (coquille) dans lequel est monté
**`dsfr-editor`** (éditeur WYSIWYG BlockNote + `@codegouvfr/react-dsfr`), via un
widget custom. Le corps de chaque page est stocké en **source JSON BlockNote +
HTML pré-compilé** ; Eleventy sert ce HTML verbatim.

Décision de coquille : [`adr/0001`](adr/0001-remplacer-editeur-cms-par-decap-dsfr-editor.md).
Décision « pas de fork Decap » : [`adr/0002`](adr/0002-ne-pas-forker-decap.md).

## Les 4 couches et leur frontière

### Couche 1 — `packages/dsfr-editor/` (bibliothèque WYSIWYG, vendorée)

Copie du dépôt [`botadrientronics/dsfr-editor`](https://github.com/botadrientronics/dsfr-editor),
intégrée en `git subtree` — voir [`vendoring-dsfr-editor.md`](vendoring-dsfr-editor.md).

**Possède :** le schéma BlockNote (`src/schema.ts`), les blocs DSFR
(`src/blocks/*` : encadré, alerte, accordéon, mise en relief, + `htmlEmbed`
local), le slash menu (`src/slashMenu.tsx`), la modale de config de bloc
(`src/blocks/blockConfig.tsx`), et **la** fonction qui transforme un document
BlockNote en HTML DSFR publié (`src/publish/renderPublishedHtml.ts`).

**Ne sait rien de :** Decap, Eleventy, le format de corps de fichier, le marqueur
`<!--dsfr-editor:source-->`, Nunjucks, `templateEngineOverride`, la convention de
slug du site, la syntaxe historique `:::` / `???` / `{{ component }}`, `content/**`.

**Interface exposée** (`src/index.ts`) : `useDsfrEditor`, `<DsfrEditor>`,
`renderPublishedHtml(editor, blocks, { wrapInContainer })`, les types, `dsfrSchema`.

### Couche 2 — `admin-src/` (colle Decap ⇄ dsfr-editor, spécifique au site)

**Possède :** la config Decap (`main.tsx` — collections, backend, widget),
le widget custom (`DsfrEditorWidget.tsx` — monte `<DsfrEditor>`, sérialise le
corps, injecte les `id` de titres), et **le contrat de sérialisation du corps de
fichier** (`serialize.ts`).

**Ne connaît de BlockNote que l'API publique de `dsfr-editor`.**
Ni le rendu Eleventy, ni l'auth GitHub (déléguée au worker Cloudflare).

**Interface vers Decap :** un widget `dsfr-editor` dont `value` / `onChange` = le
corps de fichier verbatim (Decap ne le fait pas transiter par son sérialiseur
markdown).

**Interface vers le repo :** le format d'octets de `content/**/index.md` (ci-dessous)
+ la clé frontmatter `templateEngineOverride: false` (champ caché de `PAGE_FIELDS`).

### Couche 3 — site Eleventy

**Possède :** frontmatter → page, layouts (`_includes/layouts/*`), le filtre
`tableOfContents` (`fr-summary`), le transform `strip-dsfr-editor-source`, le
passthrough du bundle admin.

**Repose sur le contrat :** une page dont le corps porte le marqueur déclare
`templateEngineOverride: false` ; son corps est du HTML **contenu seul**
(`wrapInContainer: false`) avec les `<h2 id>` déjà posés.

**Ne sait rien de** BlockNote ni de la source JSON (il retire juste le commentaire).

### Couche 4 — outillage hors-ligne (`scripts/`)

`scripts/migrate/` — import GitBook → Markdown (gelé, cf.
[`reprise-migration-gitbook.md`](reprise-migration-gitbook.md)).
`scripts/check-build.mjs` — filet de sécurité du format dsfr-editor (voir plus bas).

## Format de corps de fichier

```
---
title: …
layout: layouts/page.njk
templateEngineOverride: false
---
<!--dsfr-editor:source
[ …arbre BlockNote JSON, indenté, `--` échappé en --… ]
-->
<h2 id="…">…</h2><p>…</p>…
```

- La **source JSON** est la vérité : elle permet de rouvrir la page dans
  l'éditeur sans perte. **Ne jamais éditer le HTML à la main** (dérive silencieuse).
- Le **HTML** est ce que le navigateur a compilé pendant l'édition
  (`renderPublishedHtml`, `wrapInContainer: false`). Pas de rendu au build.
- `serialize.ts` garantit l'aller-retour `parseBody(buildBody(x)) === x`
  (test : `admin-src/serialize.test.ts`). `--`, `-->`, `<!--` sont échappés pour
  que le commentaire HTML reste valide et que `JSON.parse` relise à l'identique.
- `templateEngineOverride: false` (Eleventy 2.x) = *raw passthrough* : ni
  Nunjucks, ni markdown-it. Le frontmatter est quand même lu (`eleventyNavigation`,
  `draft`, `permalink` de `content/content.11tydata.js`), le layout enveloppe.
  C'est un **champ caché** de la config Decap (`admin-src/main.tsx`, `PAGE_FIELDS`),
  écrit à la création comme à l'enregistrement.
  ⚠️ Ne PAS le calculer en `eleventyComputed` : en Eleventy 2.x la fonction pose
  toujours la clé, et la home (non concernée) perdrait ses `{{ component() }}`.
- `eleventy.config.js` → transform `strip-dsfr-editor-source` : retire le
  commentaire source du HTML publié (la source reste dans le `.md`, pas dans `_site/`).
- Pourquoi `wrapInContainer: false` : `_includes/layouts/page.njk` fournit déjà
  le conteneur, le `<h1>`, le fil d'Ariane, le `fr-summary` et le sidemenu ; le
  corps est le contenu seul.

### Filet de sécurité — `scripts/check-build.mjs`

Lancé en CI après le build (`.github/workflows/{test,deploy}.yml`) :

1. **Lint des sources** — toute page `content/**` dont le corps porte le marqueur
   DOIT déclarer `templateEngineOverride: false`. Sinon Eleventy ferait repasser
   son HTML pré-compilé par Nunjucks + markdown-it.
2. **Scan de `_site/`** — aucun fichier HTML ne doit encore contenir le marqueur.

## Build & déploiement

```
admin-src/  --(Vite: npm run admin:build)-->  public/admin/{index.html,assets/}
            --(passthrough Eleventy)-->        _site/admin/
```

- `admin:build` est branché en `prebuild` / `prebuild-ghpages` : il précède
  toujours un build Eleventy.
- `public/admin/index.html` + `public/admin/assets/` sont **gitignorés**
  (générés à chaque build, y compris en CI).
- Config Vite : `admin-src/vite.config.ts` (`root: admin-src/`, `base: "./"`,
  `dedupe: ["react", "react-dom"]`, sortie `public/admin/`).

## Auth

Le worker Cloudflare [`sveltia-cms-auth-rdvsp`](https://github.com/botadrien/sveltia-cms-auth-rdvsp)
(flux OAuth compatible Netlify/Decap) est réutilisé tel quel — `backend.base_url`
dans `admin-src/main.tsx`. Mise en place : [`cms-auth-github-app.md`](cms-auth-github-app.md).

**Contrainte Decap :** `decap-cms-backend-github` fait `GET /repos/{owner}/{repo}`
et exige `permissions.push`. Il n'y a **aucun contournement par config** (le champ
`bypassWriteAccessCheckForAppTokens` du code n'est pas branché). Le compte GitHub
connecté doit donc avoir un **accès write** au dépôt (propriétaire, ou
collaborateur write avec la GitHub App installée). Sinon : « Your GitHub user
account does not have access to this repo. »

## Notes d'exploitation

### Contournement npm Decap (régression du 2026-09-08)

Le lot Decap `*.1` publié le 2026-09-08 (`decap-cms-lib-util@3.8.1`,
`-lib-auth@3.3.1`, `-lib-widgets@3.4.1`, `-editor-component-image@3.4.1`,
`-default-exports@3.3.1`, **et `decap-server@3.11.1`**) référence des versions
pnpm `catalog:` non résolues → `npm install` échoue (`EUNSUPPORTEDPROTOCOL`).

Contournement en place, **à retirer quand l'upstream republie proprement** :

- `package.json` → `overrides` épinglant les 5 paquets à leur dernier patch sain (`*.0`) ;
- `.npmrc` → `legacy-peer-deps=true` ;
- dev local : `npx -y decap-server@3.11.0` (surtout **pas** le `3.11.1`).

### Poids du bundle

`/admin` charge ~1,9 Mo gzip (`index.js` ≈ 6,8 Mo brut / 1,87 Mo gz, + chunk
`native` Slate/CodeMirror 432 Ko / 83 Ko gz tiré par `decap-cms-widget-markdown`).
Piste d'allègement **sans fork** : composer depuis `decap-cms-core` + une liste
explicite de widgets (sans markdown/richtext/code). Cf. `adr/0002`.

### `node_modules` : host vs VM

`node_modules` contient des binaires natifs spécifiques à la plateforme
(`@esbuild/*`, `@rollup/rollup-*`, `pagefind`). Ne pas lancer `npm install`
tantôt depuis macOS, tantôt depuis une VM Linux, sur le **même** `node_modules`
(erreur « esbuild … another platform »). Choisir un environnement.
`package-lock.json` reste portable.

### Pertes de conversion connues (pages migrées)

- corps multi-paragraphes dans une alerte / un encadré → aplati inline ;
- `<img width>` → largeur perdue ;
- `:::` imbriqués dans un accordéon → non convertis (rendus en texte littéral) ;
- `faq` : 3 fragments HTML tombés en bloc `code`.

## Dev local

```bash
npm run admin:dev            # http://localhost:5173  (Vite, HMR)
npx -y decap-server@3.11.0   # 2e terminal — proxy FS local sur :8081
```

Dans l'UI : « Se connecter » (le `local_backend` court-circuite l'OAuth).
Sans les serveurs de dev, `npm start` sert le dernier bundle admin committé.

## Modifier un bloc / l'éditeur

Tout est dans `packages/dsfr-editor/` (couche 1). Procédure de synchro avec
l'upstream + liste des modifications locales : [`vendoring-dsfr-editor.md`](vendoring-dsfr-editor.md).
