# Spike — Decap CMS + dsfr-editor (branche `spike/decap-dsfr-editor`)

But : valider l'intégration de `dsfr-editor` (BlockNote/React) dans Decap CMS
consommé en paquet npm, **avant** de s'engager. cf.
`docs/remplacer-editeur-cms-dsfr-editor.md`.

## Comment lancer

```bash
npm install                 # nécessite le bloc `overrides` + `.npmrc` (voir plus bas)
npm run admin:dev           # http://localhost:5173  (Vite)
npx -y decap-server@3.11.0  # 2e terminal — proxy FS :8081 (le 3.11.1 est cassé, cf. plus bas)
```

Dans l'UI : « Se connecter » (`local_backend` -> connexion directe via le proxy).
Toutes les sections sont exposées avec le widget `dsfr-editor`. Un corps encore
au format Markdown est **converti à l'ouverture** ; « Publier » migre le fichier.

## Fichiers du spike

| Fichier | Rôle |
|---|---|
| `admin-src/vite.config.ts` | build Vite (React + alias `dsfr-editor` -> source vendorée) |
| `admin-src/index.html` | coquille : pose `window.CMS_MANUAL_INIT` |
| `admin-src/main.tsx` | `decap-cms-app` + `registerWidget("dsfr-editor", …)` + `CMS.init({config})` (config inline) |
| `admin-src/DsfrEditorWidget.tsx` | le widget : monte `<DsfrEditor>`, compile le HTML, appelle `onChange` |
| `admin-src/serialize.ts` | corps = `<!--dsfr-editor:source [JSON] -->` + HTML ; `injectHeadingIds` ; détecte l'ancien format |
| `admin-src/markdownToBlocks.ts` | conversion corps Markdown historique -> blocs BlockNote DSFR |
| `admin-src/legacyShortcodes.ts` | rendu HTML des `{{ component("tile") }}` (port de `tile.njk`) et de `::::steps` |
| `packages/dsfr-editor/src/blocks/HtmlEmbed.tsx` | bloc « HTML brut » (trappe : tuiles / steps / grilles / `<video>`) |
| `eleventy.config.js` | transform `strip-dsfr-editor-source` (retire le commentaire source du HTML publié) |
| `content/content.11tydata.js` | `eleventyComputed.templateEngineOverride` = `false` si le corps porte le marqueur source |

## Rendu Eleventy (étape 1) — validé

Corps HTML pré-compilé servi **verbatim** : `templateEngineOverride: false`
calculé automatiquement (`content.11tydata.js`, détection du marqueur dans
`page.rawInput`) -> ni Nunjucks ni markdown-it ; `{{ … }}` littéral inoffensif.
Le commentaire `<!--dsfr-editor:source-->` est retiré au build. Fichiers `.md`
gardés. Coexistence propre avec les pages non migrées (markdown-it-dsfr).

## Migration complète (étapes 2–3) — FAITE

`scripts/migrate-blocknote.mjs` (pilote Playwright : ouvre chaque page dans le
Decap local → conversion → Publier) a migré **les 20 pages de contenu**. Build
Eleventy complet vert : **0 `{{ }}` et 0 commentaire source** dans `_site/`.

Vérifié : `prescription` (5 alertes, **4 vidéos**, accordéons, images 128px),
`faq` (**40 accordéons**), `comment-ca-marche` (7 alertes + 1 warning +
diagrammes HTML), `formulaire` (`:::success` + `::::steps` + 2 tuiles).

`content/index.md` (home, `layout: home.njk`) **non migré** — reste en widget
`markdown` natif.

Reconnu par `markdownToBlocks` : `:::info|success|warning|error` / `:::callout` /
`:::highlight` / `????`/`???`, Markdown standard. Pré-rendu en `htmlEmbed` :
`{{ component("tile") }}` (grille reconstruite), `::::steps` (`<ol class="steps">`),
HTML brut (`<div fr-grid-row>` / `<video>` / `<figure>`). `::::tiles` (0 usage)
-> bloc `code`.

Bugs `dsfr-editor` corrigés au passage (à remonter en amont) :
`cleanup()` supposait `el.className` string (KO sur `<svg>`), et laissait fuiter
un attribut `classname`/`bn-*` sur les liens.

## Résultats

### ✅ Ce qui marche

- **`<DsfrEditor>` monte dans l'arbre React de Decap** — React 19 unique (dédupé
  par Vite), **aucune erreur « Invalid hook call »**. C'était le risque n°1.
- **Slash menu `/`** : les blocs DSFR (Encadré, Alerte, Accordéon — section, Mise
  en relief) apparaissent, en français, à côté des blocs natifs.
- **CSS DSFR appliqué** aux blocs custom dans l'éditeur (alerte bleue + icône,
  encadré à liseré, titres Marianne). Pas de casse visible entre le CSS emotion
  de Decap et celui de react-dsfr.
- **Sérialisation du corps** (`serialize.ts`), vérifiée en round-trip Node
  (`parseBody(buildBody(x)) === x`, exact) :
  - source JSON BlockNote dans un commentaire HTML en tête ;
  - `--`, `-->`, `<!--` échappés en `--` (JSON reste valide, commentaire sûr) ;
  - HTML compilé propre : `<h2 id="…">`, `<div class="fr-alert fr-alert--info" role="status">`,
    aucune classe `bn-*` (le `cleanup()` DOMParser de `renderPublishedHtml`
    tourne dans le navigateur).
- **IDs de titres** injectés côté navigateur : `« Comment ça marche »` ->
  `id="comment-ca-marche"` (identique au `slugify` d'Eleventy). ✔ pour `fr-summary`.
- **Decap reçoit `onChange`** (l'entête passe à « MODIFICATIONS NON ENREGISTRÉES »).
- **Écriture bout-en-bout confirmée** : « Publier » -> `decap-server` écrit
  `content/spike/<slug>/index.njk` = frontmatter YAML (`title`, `layout`) + le
  corps **verbatim** (`<!--dsfr-editor:source …-->` + HTML). Ré-ouverture ->
  `parseBody` rend le `doc`, l'éditeur se réhydrate.
- **Arbo réelle lue via le proxy** : la collection « Documentation utilisateur
  (réel) » liste bien les pages de `content/documentation-utilisateur/`.
- **Volet d'aperçu absent** (`editor: { preview: false }`) : formulaire centré,
  éditeur pleine largeur.

### Conversion de l'ancien format (chantier 4, live)

Toutes les sections sont exposées avec le widget `dsfr-editor`. Quand un corps est
encore du Markdown (`content/**/index.md` non migré), il est **converti à
l'ouverture** (`markdownToBlocks.ts`) ; l'enregistrement écrit le nouveau format.

Vérifié sur du vrai contenu (aucune erreur) :
- **`toutes-les-notions/prescription`** : 13 titres, 23 paragraphes, **5 alertes**
  (`:::info`), **3 accordéons**, 3 images — converti.
- **`documentation-utilisateur/faq`** : **40 accordéons** + 39 titres + 188
  paragraphes — converti, éditable.
- **`integration/formulaire`** : `:::success` -> alerte verte ; `::::steps` et
  `{{ component("tile") }}` -> **bloc `code` verbatim** (dégradé, visible).

Reconnus : `:::info|success|warning|error`, `:::callout`, `:::highlight`,
`????accordionsgroup` / `???`, + tout le Markdown standard (via
`editor.tryParseMarkdownToBlocks`, **synchrone** en @blocknote 0.54).
Dégradés en bloc `code` : `::::steps`, `::::tiles`, shortcodes Nunjucks
(`{% %}` / `{{ }}`), HTML brut (`<div>` / `<figure>` / `<video>` / `<table>`).
Pertes connues : largeur des `<img width=…>`, structure multi-paragraphe DANS une
alerte/encadré (aplatie en inline), formatage des titres d'accordéon.

### Décision — pas de volet d'aperçu

L'éditeur BlockNote DSFR est **déjà** proche du rendu final : le volet d'aperçu
de droite de Decap fait double emploi. Il est désactivé par collection
(`editor: { preview: false }`) et le widget n'enregistre **pas** de composant
d'aperçu (`registerWidget` à 2 arguments). L'objectif est que l'éditeur colle au
rendu ; tout écart se corrige côté `dsfr-editor` (thème / blocs), pas via un
aperçu séparé.

### ⚠️ Points à traiter (pas des bloqueurs)

- **Poids du bundle** : `index.js` = **6,8 Mo brut / 1,87 Mo gzip**, + `native`
  (Slate/CodeMirror) 432 Ko / 83 Ko gz, + langages Prism en petits chunks.
  ~2 Mo gzip sur `/admin`. Plus lourd que l'estimation « ~1 Mo » de l'éval.
  Piste : composer depuis `decap-cms-core` sans `decap-cms-widget-markdown` /
  `-code` (retire Slate + CodeMirror). **Sans fork.**
- 2 warnings prop-types bénins (`ErrorBoundary` / `Modal` `children`) venant de
  Decap / react-dsfr sous React 19. 1× 404 (favicon).

### Test local : host vs VM

`node_modules` contient des binaires natifs **spécifiques à la plateforme**
(`@esbuild/*`, `@rollup/rollup-*`, `pagefind`). Ne pas lancer `npm install`
tantôt depuis le host macOS, tantôt depuis la VM Linux sur le **même**
`node_modules` (erreur `esbuild ... another platform`). Choisir **un** environnement
et y faire `npm install` + `npm run`. `package-lock.json` reste portable
(il liste toutes les plateformes).

### 🔴 Régression upstream Decap (npm) — 8 sept. 2026

Le lot publié le 2026-09-08 (`*.1`) de 5 paquets Decap
(`decap-cms-lib-util@3.8.1`, `-lib-auth@3.3.1`, `-lib-widgets@3.4.1`,
`-editor-component-image@3.4.1`, `-default-exports@3.3.1`) **et
`decap-server@3.11.1`** référence des versions pnpm `catalog:` **non résolues** ->
`npm install` échoue (`EUNSUPPORTEDPROTOCOL`).

Contournement en place :
- `package.json` -> `overrides` épinglant les 5 paquets à leur dernier patch sain
  (`*.0`) ;
- `.npmrc` -> `legacy-peer-deps=true` ;
- `decap-server` : utiliser `@3.11.0`.

À signaler à l'upstream ; retirer le contournement quand c'est corrigé.

### Exemple de fichier produit

`content/spike/comment-prendre-un-rendez-vous/index.njk` (écrit par Decap au spike) :

```
---
title: Comment prendre un rendez-vous
layout: layouts/page.njk
---
<!--dsfr-editor:source
[ { "type": "heading", … "level": 2 }, { "type": "paragraph", … "--" … } ]
-->
<h2 id="etape-1">Étape 1</h2><p>Texte avec -- et un lien.</p>
```

## Verdict

**Feu vert pour la voie Decap auto-bundlé.** Le risque principal (double React /
BlockNote dans Decap) est levé, et le cycle complet est prouvé : arbo réelle lue
via le proxy, édition WYSIWYG avec les 4 blocs DSFR, sérialisation round-trip
exacte, écriture du `.njk` (frontmatter + corps verbatim). Restent des tâches
d'intégration connues : poids du bundle (~1,9 Mo gzip), régression npm amont
temporaire, câblage Eleventy du nouveau format, migration des 28 pages.
