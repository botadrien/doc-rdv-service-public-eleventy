# ADR 0001 — Remplacer l'éditeur du CMS par dsfr-editor (coquille Decap)

> **Statut : accepté et implémenté** (bascule `1920f80`, 2026-09-09).
> Ce document est l'**évaluation initiale** (9 septembre 2026), conservée comme
> décision d'architecture. Le plan de chantiers ci-dessous est **historique** :
> il a été exécuté, avec ces écarts par rapport au texte d'origine —
>
> - **Format de stockage** : fichiers `.md` conservés + `templateEngineOverride:
>   false` au frontmatter (champ caché Decap), et **pas** un passage en `.njk`.
> - **Blocs manquants** : un bloc `htmlEmbed` (HTML brut) a finalement été ajouté
>   à `dsfr-editor` — les tuiles et `::::steps` sont pré-rendus dedans, pas
>   déversés en `codeBlock`.
> - **`dsfr-editor`** : **vendoré** dans `packages/dsfr-editor/` (git subtree),
>   pas consommé en dépendance `file:` / git.
> - **Migration** : 20 pages (pas 28) ; la home reste en widget Markdown natif.
> - **`amendLibrary` markdown-it-dsfr** : toujours câblé tant que la home n'est
>   pas migrée.
>
> État courant et fonctionnement : [`../cms-architecture.md`](../cms-architecture.md).
> Décision « pas de fork Decap » : [`0002-ne-pas-forker-decap.md`](0002-ne-pas-forker-decap.md).

## Contexte

Aujourd'hui, l'édition passe par **Sveltia CMS** (`public/admin/`, chargé en `<script>` depuis unpkg).
Le widget `markdown` intégré édite le corps de page, complété par des *editor components* maison (`public/admin/editor-components.js`) qui produisent la syntaxe de conteneurs `:::` / `???` comprise par Eleventy via `packages/markdown-it-dsfr`.
Le corps est stocké en **Markdown** dans le frontmatter des fichiers `content/<section>/<page>/index.md`, puis rendu au build par `markdown-it-dsfr`.
Un volet d'aperçu fidèle (`admin-src/preview.js` → `public/admin/preview.gen.js`, bundle esbuild) rejoue le pipeline markdown-it du site.

L'objectif est de remplacer cette surface d'édition par [`dsfr-editor`](https://github.com/botadrientronics/dsfr-editor).
C'est un éditeur WYSIWYG type Notion basé sur **BlockNote** (React) et `@codegouvfr/react-dsfr`, avec 4 blocs DSFR (encadré, accordéon, alerte, mise en relief) en plus des blocs natifs BlockNote.
Il persiste un **arbre de blocs BlockNote (JSON)** et sait produire le HTML final côté navigateur via `renderPublishedHtml()`.

## Décisions de cadrage

1. Le corps de page est rendu à 100 % par BlockNote (`renderPublishedHtml`), **pas** re-converti vers les conteneurs / helpers DSFR d'Eleventy.
2. **Le HTML est compilé par le navigateur pendant l'édition et commité tel quel** dans le dépôt, en plus de la **source JSON BlockNote** qui permet la ré-édition sans perte.
   → il n'y a **pas de rendu BlockNote au build**.
3. Le layout et la structure de page restent gérés par Eleventy (`_includes/layouts/*` : en-tête, fil d'Ariane, sommaire, sidemenu, pied de page).
4. On démarre **sans ajouter de blocs à `dsfr-editor`**.
   La dégradation temporaire de certaines pages est acceptée.
5. **Coquille CMS = Decap CMS, consommé en paquet npm.**

### Pourquoi Decap et pas Sveltia

Decap est **composable en npm** : le widget custom peut monter `<DsfrEditor>` **dans le même arbre React 19** que la coquille, sans iframe ni `postMessage`.
Le `config.yml` actuel (compatible Decap) reste valable.
Decap est de nouveau activement maintenu (React 19.1, v3.16.1 publiée le 8 septembre 2026).

Coût assumé : on build et on sert le bundle admin (~1 Mo gzip) au lieu d'un `<script>` CDN ; on perd la légèreté, l'i18n FR native et le polish de Sveltia ; Decap traîne Immutable.js et Redux.

### Fork ou pas ?

**Non — on consomme Decap en dépendance npm.**
Un widget custom ne demande aucun fork : `window.CMS_MANUAL_INIT = true`, `import CMS from "decap-cms-app"`, `CMS.registerWidget(...)` puis `CMS.init({ config })`.
Les registres (`registerWidget`, `registerPreviewStyle`, `registerLocale`, `registerMediaLibrary`, `registerEventListener`) couvrent le périmètre.

Un fork ne se justifierait que pour :

- **(a)** retirer le widget markdown/richtext intégré (Slate/remark) pour alléger le bundle — mais c'est **obtenable sans fork** en composant depuis `decap-cms-core` + les widgets choisis ;
- **(b)** modifier la coquille en profondeur (chrome admin thémé DSFR, masquer le volet d'aperçu, éditeur plein écran, flux de sauvegarde custom) ;
- **(c)** patcher soi-même des problèmes de sécurité ou des bugs — `patch-package` ou les `overrides` npm suffisent pour les petits correctifs, et l'upstream est de nouveau maintenu.

Coût d'un fork : ~40 paquets, socle Redux/Immutable *legacy*, upstream mouvant (montée React 19 récente) → charge de rebase permanente, à contre-courant de la philosophie « monorepo interne léger » du dépôt (`markdown-it-dsfr` fait 4 fichiers ; Decap, non).

**Séquence retenue** : spike avec `decap-cms-app` tel quel ; si le poids du bundle devient bloquant, passer à `decap-cms-core` + widgets explicites (toujours sans fork) ; n'envisager un fork que si le spike prouve que l'API widget ne peut ni contourner le sérialiseur de corps ni offrir un éditeur plein écran sans volet d'aperçu.

### Résultat visé

L'éditeur ouvre `/admin`, édite le corps en WYSIWYG dans `dsfr-editor`, sauvegarde → le fichier de page (source JSON + HTML compilé) est commité via l'API GitHub.
Au build, Eleventy insère le HTML dans le gabarit de page existant, sans le retoucher.

## Vue d'ensemble des chantiers

| # | Chantier | Risque | Charge |
|---|---|---|---|
| 1 | Bundle admin : `decap-cms-app` + widget `<DsfrEditor>` (React partagé) | élevé | 3–5 j |
| 2 | Format de stockage (source JSON + HTML dans `index.njk`) + Eleventy | faible–moyen | 1–2 j |
| 3 | IDs de titres pour le sommaire (`tableOfContents`) | faible | 0,5 j |
| 4 | Migration ponctuelle des 28 pages Markdown → JSON + HTML | moyen | 2–4 j |
| 5 | Nettoyage : Sveltia, editor-components, aperçu, `config.yml`, auth, CI, docs | faible–moyen | 1–2 j |

Socle fonctionnel : **~1,5 à 2 semaines**.
La finition (médiathèque, pages dégradées, blocs manquants) vient au-delà.
Commencer par un **spike de 1 à 2 jours** : `CMS.registerWidget` + `<DsfrEditor>` monté proprement dans un seul arbre React.

## Chantier 1 — Bundle admin Decap + widget dsfr-editor

### Construction du bundle

Petite app **Vite** dans `admin-src/`.
`dsfr-editor` utilise déjà Vite, et le plugin `@codegouvfr/react-dsfr/vite` gère la copie des polices et icônes DSFR — point pénible à ne pas refaire à la main sous esbuild.
Sortie : `_site/admin/` (ou `public/admin/` en passthrough, gitignoré comme `preview.gen.js`).

`admin-src/main.tsx` (init manuelle → on enregistre le widget avant `init`) :

```ts
window.CMS_MANUAL_INIT = true;
import CMS from "decap-cms-app";
import { startReactDsfr } from "@codegouvfr/react-dsfr/spa";
import "@codegouvfr/react-dsfr/dsfr/dsfr.min.css";
import "@codegouvfr/react-dsfr/dsfr/utility/utility.min.css";
import { DsfrEditorControl, DsfrEditorPreview } from "./DsfrEditorWidget";

startReactDsfr({ defaultColorScheme: "light" });
CMS.registerWidget("dsfr-editor", DsfrEditorControl, DsfrEditorPreview);
CMS.init(); // lit /admin/config.yml (ou init({ config }) inline)
```

Repli si le bundle est trop lourd : `decap-cms-core` + liste explicite de widgets (sans `decap-cms-widget-markdown`) — même code, plus d'assemblage, **pas de fork**.

**React unique** : le bundle Vite dédoublonne `react` / `react-dom`.
Decap est sur `^19.1`, `dsfr-editor` a un peer `^18 || ^19`, BlockNote 0.54 supporte React 19, `react-dsfr` `^1.34` aussi.
Pas d'iframe, pas de double-React.

`public/admin/index.html` : réduit à la coquille Decap (`<div id="nc-root">` + le `<script type="module">` émis par Vite).
Retirer les `<script>` Sveltia / editor-components / preview.gen.

### Le widget (`admin-src/DsfrEditorWidget.tsx`)

`DsfrEditorControl` reçoit `{ value, onChange, field, forID, classNameWrapper }` (Decap `registerWidget`).
Comme le widget porte le champ `body`, `value` est la **chaîne du corps de fichier**.

À l'ouverture : parser la source JSON du corps (voir chantier 2), puis monter `const editor = useDsfrEditor({ initialContent: source })` et `<DsfrEditor editor={editor} onChange={...} />`.

À chaque changement (débounce ~400 ms) :

1. `html = renderPublishedHtml(editor, editor.document, { wrapInContainer: false })` — l'option `wrapInContainer` existe déjà ;
2. injecter les `id` de titres (chantier 3) ;
3. `onChange(SOURCE_COMMENT(editor.document) + "\n" + html)`.

`DsfrEditorPreview` : rend la chaîne HTML stockée dans l'iframe d'aperçu Decap, avec le CSS DSFR du site (`registerPreviewStyle`).
C'est l'idée de `admin-src/preview.js` mais sur du HTML, sans markdown-it.
Alternative : pas d'aperçu du tout, l'éditeur WYSIWYG suffit.

`isValid` optionnel : refuser une sauvegarde si `renderPublishedHtml` a levé.

### Points durs à valider au spike

- Decap passe-t-il bien la chaîne de corps **verbatim** à un widget custom nommé (sans la faire transiter par son sérialiseur markdown), et la ré-écrit-il à l'identique ?
- `startReactDsfr` + le `dsfr.min.css` de react-dsfr cohabitent-ils avec le CSS (emotion) de Decap sans casse visuelle majeure ? (scoper si besoin).
- Poids du bundle (`decap-cms-app` ~1,5 Mo + BlockNote/ProseMirror + react-dsfr) : mesurer le gzip, vérifier que c'est acceptable pour une route `/admin`.

## Chantier 2 — Format de stockage et Eleventy

**Un fichier par page** : `content/<section>/<page>/index.njk`.
Pas `.md` : markdown-it mangerait le HTML indenté ; `.njk` laisse le HTML brut intact, et le HTML compilé ne contient aucun `{{ }}`.
Permaliens et `eleventyNavigation` inchangés.

- **Frontmatter** : métadonnées inchangées (`title`, `layout`, `description`, `eleventyNavigation`, `showBreadcrumb`, `draft`…).
- **Corps du fichier** = HTML compilé, précédé d'un commentaire qui porte la source :

  ```
  <!--dsfr-editor:source
  [ …arbre BlockNote JSON, indenté… ]
  -->
  <h2 id="…">…</h2> …
  ```

  Un seul champ (`body`), un seul contrôle.
  Le HTML reste greppable et diffable ; la source est un bloc unique en tête.
  Eleventy sert le commentaire tel quel (HTML inerte), ou on le retire via un mini-filtre dans le layout.
- **Eleventy** : quasi rien à faire.
  `_includes/layouts/page.njk` fait déjà `{{ content | safe }}` dans le `.fr-col…page-content` ; le conteneur, le `<h1>`, le fil d'Ariane, le sommaire et le sidemenu sont dans le layout.
  Le corps doit donc être **le contenu seul**, d'où `wrapInContainer: false`.
- `packages/markdown-it-dsfr` : n'est plus câblé sur le corps de page ; reste un paquet autonome.
  L'`amendLibrary("md", …)` d'`eleventy.config.js` peut être retiré (les stubs `content/<section>.md` et `content/menus/*` n'ont pas de corps).

## Chantier 3 — IDs de titres (sommaire)

Le filtre `tableOfContents` (`eleventy.config.js`) fait une regex `<h2 … id="…">` pour peupler le `fr-summary`.
`renderPublishedHtml` émet des `<h2>` **sans `id`**.

Il faut donc les injecter dans le widget, sur le DOM produit après `renderPublishedHtml`, avec `@sindresorhus/slugify` `{ decamelize: false }`.
C'est la convention déjà utilisée par l'aperçu actuel, identique au filtre `slugify` d'Eleventy.
Idéalement : une PR upstream à `dsfr-editor` (option `headingIds` dans `renderPublishedHtml`).

## Chantier 4 — Migration des 28 pages

Script ponctuel `scripts/migrate-blocknote.mjs` (one-shot, pas d'idempotence).

- Frontmatter conservé tel quel.
- Corps converti en arbre BlockNote :
  `:::info|success|warning|error` → `dsfrAlert` ;
  `:::callout` → `dsfrCallout` ;
  `:::highlight` → `dsfrHighlight` ;
  `????accordionsgroup` / `???` → suites de `dsfrAccordionSection` ;
  Markdown standard → `tryParseMarkdownToBlocks` (BlockNote) ;
  images `![](./assets/x.png)` → bloc `image` (URL relative conservée ; passthrough `content/**/assets/*` déjà en place ; la largeur `width=128` est perdue).
- **Non couvert → déversé verbatim dans un `codeBlock`** (rien de perdu, retouche ultérieure) :
  `::::steps` (3 pages), `{{ component("tile") }}` (9 pages), HTML brut `fr-grid-row` / `<figure>` / `<video>` (13 pages).
- Produire le **HTML** initial : rejouer `renderPublishedHtml` en Node **pour la migration seulement** (DOM shim `linkedom` ou `happy-dom` + stub de `@codegouvfr/react-dsfr`, que `schema.ts` importe transitivement via `blockConfig.tsx`).
  Ce code est jetable et hors du build.
- Sortie : `index.njk` ; suppression des `index.md`.
- Retouche manuelle estimée : **~15 à 20 pages**.

## Chantier 5 — Nettoyage et bascule

- Supprimer `public/admin/editor-components.js`, `admin-src/preview.js`, et le hook esbuild `preview.gen.js` dans `eleventy.config.js` (remplacé par le build Vite admin, branché en `eleventy.before` ou en `prebuild`).
- `public/admin/index.html` : coquille Decap.
- `public/admin/config.yml` : le champ `body` passe en `widget: dsfr-editor` ; `extension: njk` et `format: frontmatter` par collection ; retirer les `widget: markdown` internes.
  Le reste (backend github, `base_url`, collections une-par-section, `media_folder`) est inchangé.
- **Auth** : `base_url` pointe sur `sveltia-cms-auth-rdvsp…workers.dev`.
  Le worker d'auth Sveltia implémente le flux OAuth Netlify, donc **a priori compatible Decap** — à vérifier au spike.
  Sinon, déployer un [OAuth provider Decap](https://decapcms.org/docs/external-oauth-clients/) sur Cloudflare Workers (template documenté).
  `local_backend: true` + `npx decap-server` pour le dev local (remplace le « Work with Local Repository » de Sveltia).
- `.gitignore` : ajouter la sortie du build admin ; retirer `preview.gen.js`.
- `.github/workflows/deploy.yml` : builder le bundle admin (Vite) et la lib `dsfr-editor` (`tsc`) avant / pendant `npm run build-ghpages`.
  `dsfr-editor` est consommé en dépendance `file:` / git, cohérent avec la « monorepo interne » de `docs/mutualisation-outils-dsfr.md`.
- Docs : réécrire `docs/apercu-cms-dsfr.md`, `docs/mutualisation-outils-dsfr.md`, `docs/REPRISE.md`.

## Fichiers critiques

| Fichier | Rôle | Action |
|---|---|---|
| `admin-src/main.tsx` (nouveau) | point d'entrée du bundle admin | `decap-cms-app` + `registerWidget` + `CMS.init()` |
| `admin-src/DsfrEditorWidget.tsx` (nouveau) | widget custom | monte `<DsfrEditor>`, compile le HTML, injecte les `id` |
| `src/publish/renderPublishedHtml.ts` (dsfr-editor) | rendu HTML client | utilisé tel quel (+ PR `headingIds`) |
| `public/admin/index.html` | coquille CMS | Sveltia → coquille Decap |
| `public/admin/config.yml` | collections, champ `body` | `widget: dsfr-editor`, `extension: njk` |
| `public/admin/editor-components.js` | conteneurs `:::` / `???` | supprimer |
| `admin-src/preview.js` + hook esbuild | aperçu Markdown fidèle | supprimer (build Vite admin à la place) |
| `eleventy.config.js` | `amendLibrary`, hook esbuild, `tableOfContents`, passthrough | remplacer le hook esbuild ; `amendLibrary` optionnel |
| `_includes/layouts/page.njk` | gabarit | **inchangé** (déjà `{{ content \| safe }}`) |
| `content/**/index.md` (28 pages) | contenu | migrer → `index.njk` (frontmatter + source JSON + HTML) |
| `.github/workflows/deploy.yml` | CI Pages | build admin Vite + `dsfr-editor` |
| `package.json` | dépendances | `decap-cms-app`, `dsfr-editor` (+ ses peers), `vite`, `@vitejs/plugin-react` |

## Ce qui casse temporairement (accepté)

- `::::steps`, tuiles `{{ component() }}`, HTML brut (grilles, `<figure>`, `<video>`), images dimensionnées → en `codeBlock`, à retoucher (~15 à 20 pages).
- Le volet d'aperçu Markdown fidèle du CMS → remplacé par le WYSIWYG.
- La médiathèque n'est pas intégrée à l'éditeur (v1) → coller une URL ou un chemin `./assets/` à la main dans le bloc image.
- Les diffs git du corps sont moins lisibles (HTML + bloc JSON au lieu de Markdown).
- DX dev local : `npx decap-server` au lieu du File System Access de Sveltia.

## Risques résiduels

- **Cohérence source / HTML** : le JSON est la source, le HTML est *généré*.
  Ne jamais éditer le HTML à la main (sinon dérive silencieuse).
  À documenter ; un garde-fou CI (re-render + diff) réintroduirait un rendu Node, donc plus tard.
- **HTML = ce que le navigateur a produit** : dépend de la version de `dsfr-editor` / BlockNote.
  **Épingler** les versions ; une montée de version peut demander un re-render de masse.
- **Parité CSS** : `renderPublishedHtml` n'émet que des classes (`fr-callout`, `fr-alert--*`, `fr-accordion` + `fr-collapse`, `fr-highlight`).
  Le style vient du DSFR **du site** (1.11.2) + `dsfr-content.css`.
  Ces classes sont stables → OK a priori, à vérifier visuellement.
  Les accordéons publiés émettent le markup interactif hydraté par `dsfr.module.min.js` déjà chargé → comportement identique à aujourd'hui.
- **Decap** : bundle lourd, socle Immutable.js / Redux *legacy*, maintenance reprise mais historiquement lente.
  Le CSS de react-dsfr face au CSS emotion de Decap est à surveiller.
- **Intégration** : `registerWidget` + `<DsfrEditor>` dans le même arbre est le chemin le plus propre *sur le papier* — le spike doit le confirmer.

## Points ouverts à arbitrer

1. Embarquer la source : **commentaire en tête du corps** (retenu) vs champ frontmatter objet `content: { source, html }`.
2. Aperçu Decap : `DsfrEditorPreview` sur le HTML stocké vs pas d'aperçu.
3. Auth : réutiliser le worker Sveltia vs déployer un OAuth provider Decap.
4. Migration du HTML initial : **script Node jetable** (retenu) vs re-sauvegarde manuelle des 28 pages.
5. `dsfr-editor` : dépendance **git / `file:`** vs intégration au monorepo local ; PR upstream `headingIds`.
6. Médias : chemin `./assets/` manuel (v1) vs pont vers la médiathèque Decap (`media_library`).

## Vérification (fin de v1)

1. **Spike** : `admin-src/` minimal (`decap-cms-app` + `registerWidget` + `<DsfrEditor>`), `npm run dev` → l'éditeur s'affiche dans `/admin`, un `/` ouvre le slash menu DSFR, `onChange` produit du HTML + la source.
2. `npm start` → une page `index.njk` de test s'affiche dans le gabarit Eleventy : en-tête bleu, fil d'Ariane, sommaire `fr-summary` peuplé depuis les `id` de titres, accordéons hydratés par le JS DSFR, images `./assets/` servies.
3. `/admin` (build) → collection → l'éditeur charge `initialContent` depuis la source JSON du fichier ; une modif + sauvegarde → commit du `.njk` (commentaire source + HTML) ; rechargement conservé ; auth GitHub OK.
4. Comparaison visuelle avant / après sur 3 pages : alertes (`a-propos/comment-ca-marche`), accordéons (`toutes-les-notions/prescription`), une page simple.
5. `npm run build-ghpages` : builds admin Vite + `dsfr-editor` + Eleventy + Pagefind OK ; `_site/admin/` présent ; pages `.njk` rendues ; la recherche Pagefind indexe toujours le corps (`data-pagefind-body`).
6. Pages dégradées : le fragment brut apparaît en `codeBlock`, la page ne plante pas.
7. `npm test` : tests du widget (source ↔ HTML, `id` de titres identiques au `slugify` d'Eleventy).

## Annexe — alternatives de coquille CMS écartées (septembre 2026)

| Coquille | Pourquoi écartée |
|---|---|
| **Sveltia CMS** (statu quo) | bundle `<script>` uniquement, pas de composition npm → éditeur forcément en **iframe + postMessage** (plus de plomberie, pas de React partagé). Reste le repli si le spike Decap échoue. |
| **Pages CMS** | app Next.js à forker + **auto-héberger** (GitHub App + KV/D1) → sort du « serverless léger » ; format de config propre. |
| **Keystatic** | rich-text = Slate + « component blocks », pas BlockNote ; schéma TS → réécriture du modèle de contenu. |
| **Static CMS** | fork de Netlify CMS **abandonné (2024)**. |
| **Admin maison** | viable vu le périmètre (~31 pages, frontmatter + corps ; ~300 à 500 lignes via le worker OAuth existant) mais auth, listing, création, médias et i18n à maintenir soi-même. |
