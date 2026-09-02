# Aperçu Sveltia CMS fidèle au rendu Eleventy + DSFR

> **Statut : implémenté** (1er septembre 2026). Fichiers : `markdown-config.js`,
> `admin-src/preview.js`, hook `eleventy.before` dans `eleventy.config.js`,
> `public/admin/index.html`. Bundle généré : `public/admin/preview.gen.js`
> (gitignoré). Approche : « esbuild auto » + « contenu seul ».
>
> ⚠️ Ce document décrit l'analyse initiale. Certains détails ont évolué depuis
> (conteneurs Markdown ajoutés : `steps`, `tiles` ; `markdown-it-attrs` et la
> coloration Prism retirés). **Source de vérité : `markdown-config.js` +
> `markdown-custom-containers.js` + `public/admin/editor-components.js`.**

## Contexte

Dans la vue d'édition de Sveltia CMS (`/admin`), le volet d'aperçu de droite rend
le Markdown avec **`marked`**, alors que le site le rend avec **`markdown-it@14`
+ 4 plugins + `markdown-custom-containers.js`**. Deux moteurs différents : sans
CSS du site ni équivalent des conteneurs, l'aperçu affiche des `:::info` /
`????accordionsgroup` bruts et aucun style DSFR. L'objectif est de rendre ce
volet visuellement proche de la sortie 11ty pour que les éditeurs voient
« la vraie page » pendant qu'ils écrivent.

Décisions prises :
- **Approche : esbuild auto.** L'aperçu réutilise le *vrai* pipeline markdown-it
  du site (extrait dans un module partagé), bundlé pour le navigateur par esbuild
  branché dans le build 11ty. Fidélité ~99 %, toujours synchro avec les futurs
  conteneurs. Tout tourne côté navigateur (esbuild = compilation uniquement ;
  markdown-it et ses plugins sont du JS navigateur pur).
- **Coquille : contenu seul.** L'aperçu rend le corps markdown stylé DSFR, sans
  reproduire le bandeau bleu / `<h1>` / fil d'Ariane de `layouts/page.njk`.
  Sveltia continue d'afficher les aperçus de champ (titre, description) au-dessus.

## Ce qui existe déjà (vérifié)

- `public/admin/` = passthrough pur (`./public/` → `/`). Aucun bundler dans le
  projet. `index.html` charge `@sveltia/cms@0.204.0` (épinglé) puis
  `editor-components.js` (composants d'éditeur accordéons, flag `m` sur `pattern`).
- Pipeline site (`eleventy.config.js` l.47-140) : `markdown-it@14 {html:true}` +
  `markdown-it-anchor@8` (h1-4, `class=header-anchor`, `symbol:"#"`, `placement:after`,
  `slugify` = filtre 11ty ≈ `@sindresorhus/slugify {decamelize:false}`) + override
  `renderer.rules.table_open` → `<table class="fr-table">` + `markdown-it-attrs@4`
  (défauts ; **0 usage** dans le contenu) + 5 `markdown-it-container` définis dans
  `markdown-custom-containers.js` : `callout` / `highlight` / `quote` (marqueur
  `:::`, **0 usage**), `alert` (`:::info|warning|error|success [titre]`, **~45 blocs**,
  `fr-alert--sm` sans titre), `accordion` (marqueur `?`, `???` item / `????accordionsgroup`
  groupe, **très utilisé**).
- `.md` traité par **Nunjucks avant markdown-it**. Contenu réel : uniquement
  `{% from "components/component.njk" import component with context %}` +
  `{{ component("tile", { objet }) }}` (9 fichiers, jamais `card`), HTML brut
  (`fr-grid-row`/`fr-col-*`, `<img src="./assets/x.png">`, `<video src="https://…mp4">`,
  `<figure class="fr-content-media">`), images `![](./assets/x.png)` relatives au
  dossier du `.md`. Aucune table, aucun attrs, aucun footnote/tasklist/blockquote.
- `tile.njk` → `<div class="fr-tile fr-enlarge-link"><div class="fr-tile__body">
  <div class="fr-tile__content"><h4 class="fr-tile__title"><a class="fr-tile__link"
  href=URL [target=_blank rel=noopener]>TITRE</a></h4><p class="fr-tile__desc">DESC</p>
  </div></div></div>`.
- CSS du site (tout passthrough, accessible en relatif depuis `/admin/`) :
  `../css/dsfr.min.css`, `../css/utility/utility.min.css`, `../css/index.css`
  (custom : `.header-anchor`, `div.fr-callout__text p`, espacements table…),
  `../css/prism-diff.css`. `prism-okaidia.css` n'existe qu'inline / dans
  `node_modules`. Polices DSFR : `../fonts/` relatif à `dsfr.min.css` = `/css/fonts/` ✓.
  Icônes DSFR : `icons/` relatif à `utility.min.css` = `/css/icons/` ✓.
- Sveltia — API front (`window.CMS`) : `registerPreviewStyle(style,{raw})`
  (URL relative résolue contre `.../admin/` → préfixe GitHub Pages inclus ; Set →
  appels multiples = plusieurs `<link>`), `registerPreviewTemplate(name, ReactComp)`
  (clé = `fileName ?? collectionName`), `window.h`=createElement, `window.marked`,
  `window.DOMPurify`.
- Sveltia — `entry-preview.svelte` : si un template est enregistré pour la clé →
  iframe React ; sinon si `styleURLs.length` → iframe avec aperçus de champ par
  défaut ; sinon `<div>` inline. `EntryPreviewIframe` : `sandbox="allow-same-origin
  allow-scripts allow-popups allow-forms"`, `<base href="${origin}">`.
- Sveltia — props du template : `entry` (Immutable Map ; `entry.getIn(['data','body'])`),
  `widgetFor(keyPath)` (monte le FieldPreview Svelte de Sveltia → passe par `marked`),
  `getAsset(path)` → `AssetProxy` (`.url` = blob URL, **peuplé en async** dans le
  constructeur ; `.toString()` = `.url`), `getCollection`, `fieldsMetaData`, plus
  `document`/`window` de l'iframe.
- `markdown-it@14.1.0`, `markdown-it-anchor@8.6.7`, `markdown-it-attrs@4.3.1`,
  `markdown-it-container@4.0.0`, `@sindresorhus/slugify@1.1.2` (CJS) déjà dans
  `node_modules`. `esbuild` **absent**.

## Approche retenue

Extraire la config markdown-it dans un module partagé, la bundler pour le
navigateur avec esbuild (branché dans le build 11ty), et enregistrer dans Sveltia
un `registerPreviewTemplate` minimal (« contenu seul ») qui rend le corps avec ce
markdown-it réel.

### Fichiers

| Fichier | Action |
|---|---|
| `markdown-config.js` (racine, NOUVEAU) | Fonction partagée `module.exports = (md, { slugify }) => { … }` : applique anchor + override `table_open` + attrs + les 5 conteneurs (via `require('./markdown-custom-containers')`). CJS. |
| `markdown-custom-containers.js` | Inchangé. |
| `eleventy.config.js` | (a) Remplacer les `amendLibrary("md", …)` des l.116-140 par `eleventyConfig.amendLibrary("md", md => require("./markdown-config")(md, { slugify: eleventyConfig.getFilter("slugify") }))`. (b) Ajouter un hook `eleventyConfig.on("eleventy.before", async () => { await require("esbuild").build({ entryPoints:["admin-src/preview.js"], bundle:true, format:"iife", minify:true, target:"es2020", outfile:"public/admin/preview.gen.js" }); })`. |
| `admin-src/preview.js` (NOUVEAU) | Point d'entrée bundlé. Voir squelette ci-dessous. |
| `package.json` | `devDependencies` : `esbuild`, `markdown-it` (`14.1.0`, épinglé sur la version d'Eleventy), `@sindresorhus/slugify` (`1.1.2`). |
| `.gitignore` | Ajouter `public/admin/preview.gen.js`. |
| `public/admin/index.html` | Ajouter `<script src="preview.gen.js"></script>` après `editor-components.js`. |
| `public/admin/editor-components.js` | Inchangé (sert l'édition à gauche). Son `toPreview` devient inutilisé dans le volet d'aperçu — les accordéons y sont rendus nativement par le conteneur `accordion` du markdown-it partagé. |

### `admin-src/preview.js` — squelette

```js
import MarkdownIt from 'markdown-it';
import slugify from '@sindresorhus/slugify';
import configureMarkdown from '../markdown-config.js';

const md = new MarkdownIt({ html: true });
configureMarkdown(md, { slugify: (s) => slugify(s, { decamelize: false }) });

const CMS = window.CMS, h = window.h;

/* 1. Styles du site dans l'iframe d'aperçu */
['../css/dsfr.min.css', '../css/utility/utility.min.css',
 '../css/index.css', '../css/prism-diff.css'].forEach((href) => CMS.registerPreviewStyle(href));
CMS.registerPreviewStyle([
  ':root{color-scheme:light}',
  'body{margin:0;padding:0;font-family:"Marianne",arial,sans-serif;color:var(--text-default-grey,#161616);background:var(--background-default-grey,#fff)}',
  '.fr-container{margin-block:1.5rem}',
  /* pas de JS DSFR dans l'aperçu → accordéons toujours dépliés */
  '.fr-collapse{max-height:none!important;visibility:visible!important;overflow:visible!important;--collapse:0!important}',
  '.fr-collapse::before{margin-top:0!important;content:none!important}',
  '.fr-accordion__btn{pointer-events:none}',
  /* ~20 règles prism-okaidia collées ici si coloration des blocs de code voulue */
].join('\n'), { raw: true });

/* 2. Pré-traitement Nunjucks (seul `component("tile")` est reproduit) */
const FROM_RE = /^[ \t]*\{%[-\s]*from\s+["']components\/component\.njk["'][\s\S]*?%\}[ \t]*\n?/gm;
const COMPONENT_RE = /\{\{\s*component\(\s*(["'])(\w+)\1\s*,\s*(\{[\s\S]*?\})\s*\)\s*\}\}/g;
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function parseObj(src){const o={},re=/(\w+)\s*:\s*(?:(["'])((?:\\.|(?!\2).)*)\2|(true|false|null))/g;let m;
  while((m=re.exec(src)))o[m[1]]=m[3]!==undefined?m[3]:{true:true,false:false,null:null}[m[4]];return o;}
function tile(t){const ext=!!t.externalUrl,url=(t.url&&t.url!==false)?t.url:(t.externalUrl||'#');
  return `<div class="fr-tile fr-enlarge-link"><div class="fr-tile__body"><div class="fr-tile__content">`+
    `<h4 class="fr-tile__title"><a class="fr-tile__link" href="${url}"${ext?' target="_blank" rel="noopener"':''}>`+
    `${esc(t.title)}</a></h4><p class="fr-tile__desc">${esc(t.description)}</p></div></div></div>`;}
function ph(name){return `<div class="fr-tile"><div class="fr-tile__body"><div class="fr-tile__content">`+
  `<p class="fr-tile__desc">[Composant « ${esc(name)} » — aperçu indisponible]</p></div></div></div>`;}
function preprocess(src){
  return src.replace(FROM_RE,'')
    .replace(COMPONENT_RE,(_,q,name,obj)=>{ if(name!=='tile')return ph(name);
      try{return tile(parseObj(obj));}catch(e){return ph(name);} })
    .replace(/\{%[-\s][\s\S]*?%\}/g,'').replace(/\{\{\s*[\s\S]*?\}\}/g,'⟦variable⟧');
}

/* 3. Rendu du corps + résolution des images ./assets/ */
function renderInto(el, raw, getAsset){
  el.innerHTML = md.render(preprocess(raw || ''));
  el.querySelectorAll('img[src],video[src],source[src]').forEach((node)=>{
    const s = node.getAttribute('src') || '';
    if(!/^(\.\/)?assets\//.test(s)) return;
    try{
      const a = getAsset(s); if(!a) return;
      const set = () => { node.src = a.url || String(a); };
      set(); requestAnimationFrame(set); setTimeout(set, 400); // .url devient blob URL en async
    }catch(e){}
  });
}

/* 4. Template « contenu seul », enregistré pour chaque collection / fichier */
function BodyOnly(props){
  const raw = props.entry.getIn(['data','body']);
  if (raw == null) return h('div', { role:'document' });   // stubs menus, etc.
  return h('div', {
    className: 'fr-container',
    ref: (el) => { if (el) renderInto(el, raw, props.getAsset); },
  });
}

// garder synchro avec public/admin/config.yml
['doc-utilisateur','doc-technique','accompagner-le-changement','toutes-les-notions',
 'integration','a-propos','accueil','accessibilite','mentions-legales',
 'donnees-personnelles','contact'].forEach((n)=>CMS.registerPreviewTemplate(n, BodyOnly));
```

`markdown-config.js` doit produire des IDs de titres identiques au site : passer
le `slugify` de 11ty côté Eleventy et `@sindresorhus/slugify {decamelize:false}`
côté navigateur (comportement identique vérifié : `"Été 2024 !"` → `ete-2024`).
Vérifier `@11ty/eleventy/src/Filters/Slugify.js` à l'implémentation pour les
options exactes.

## Vérification

1. `npm start` → le hook `eleventy.before` génère `public/admin/preview.gen.js`
   (vérifier qu'il existe, ~130 KB, IIFE). Aucune erreur esbuild dans la console 11ty.
2. `http://localhost:8080/admin/` → Sveltia → **« Work with Local Repository »**
   (Chrome/Edge) → racine du dépôt. Vider le storage si l'ancien SW traîne.
3. Comparer chaque entrée à l'URL équivalente servie par `npm start` :
   - Alertes (couleur, `<h3>` titre, `--sm` sans titre, gras interne) :
     `a-propos/comment-ca-marche`, `documentation-utilisateur/configurer-son-organisation`.
   - Accordéons groupe + isolé rendus nativement, dépliés :
     `toutes-les-notions/activation-de-la-double-authentification`,
     `toutes-les-notions/prescription`.
   - Tuiles + `externalUrl` + entités `&#x26;` ; aucun `{% from %}` ni `{{ }}`
     littéral : `integration/formulaire`, `content/index.md` (`accueil`).
   - Images `![](./assets/…)` + `<img>`/`<video>` bruts :
     `a-propos/comment-ca-marche`, `toutes-les-notions/prescription`.
   - Police Marianne chargée, icônes DSFR, thème clair, zéro erreur console iframe.
4. Repli : commenter `<script src="preview.gen.js">` → l'iframe « styles seuls »
   (via `registerPreviewStyle` seul si on le garde) doit rester lisible ; sinon
   l'aperçu par défaut Sveltia (sans style) revient sans casse.
5. Build de prod : `npm run build-ghpages` → `preview.gen.js` présent dans
   `_site/admin/`. Workflow GitHub Pages inchangé (il lance déjà `eleventy`).

### Résultat vérifié (1er septembre 2026)

`npm start` en mode `--serve` : le hook `eleventy.before` lance esbuild,
`public/admin/preview.gen.js` (~183 KB, IIFE) est généré et servi (`200`), le
rendu du site est inchangé (mêmes marqueurs `fr-alert` / `fr-accordions-group` /
`header-anchor` dans `_site/`).

Rendu du corps par le bundle (via le `markdown-it` partagé), sur un corps
représentatif :

<details>
<summary>Entrée Markdown</summary>

```markdown
## Qu’est-ce que la prescription ?

:::info Astuce
Texte **gras** et [lien](https://exemple.fr).
:::

:::success
Sans titre → fr-alert--sm.
:::

????accordionsgroup

???Question 1

Réponse **1**.

???

???Question 2

Réponse 2.

???

????

{% from "components/component.njk" import component with context %}
<div class="fr-grid-row"><div class="fr-col-12 fr-col-md-6">
{{ component("tile", { url: "/a/", title: "Titre & co", description: "Desc" }) }}
</div></div>
```
</details>

<details>
<summary>Sortie HTML (identique à la prod)</summary>

```html
<h2 id="qu-est-ce-que-la-prescription" tabindex="-1">Qu’est-ce que la prescription ? <a class="header-anchor" href="#qu-est-ce-que-la-prescription">#</a></h2>

<div class="fr-alert fr-alert--info ">
    <h3 class="fr-alert__title"> Astuce</h3>
<p>Texte <strong>gras</strong> et <a href="https://exemple.fr">lien</a>.</p>
</div>

<div class="fr-alert fr-alert--success fr-alert--sm">
    
<p>Sans titre → fr-alert--sm.</p>
</div>
<div class="fr-accordions-group">
<section class="fr-accordion">
    <h3 class="fr-accordion__title">
        <button class="fr-accordion__btn" aria-expanded="false" aria-controls="accordion-14">
            Question 1
        </button>
    </h3>
    <div class="fr-collapse" id="accordion-14">
<p>Réponse <strong>1</strong>.</p>
</div></section>

<section class="fr-accordion">
    <h3 class="fr-accordion__title">
        <button class="fr-accordion__btn" aria-expanded="false" aria-controls="accordion-19">
            Question 2
        </button>
    </h3>
    <div class="fr-collapse" id="accordion-19">
<p>Réponse 2.</p>
</div></section>
</div></section>
<div class="fr-grid-row"><div class="fr-col-12 fr-col-md-6">
<div class="fr-tile fr-enlarge-link"><div class="fr-tile__body"><div class="fr-tile__content"><h4 class="fr-tile__title"><a class="fr-tile__link" href="/a/">Titre &amp; co</a></h4><p class="fr-tile__desc">Desc</p></div></div></div>
</div></div>
```
</details>

Observations : ancre de titre slugifiée à l'identique (`qu-est-ce-que-la-prescription`) ;
`:::info` avec titre → `<h3 class="fr-alert__title">` ; `:::success` sans titre →
`fr-alert--sm` ; `????accordionsgroup` rendu nativement (le `</section>` en trop au
`????` de fermeture reproduit fidèlement le bug de `markdown-custom-containers.js`
côté site) ; `{% from %}` retiré, `{{ component("tile") }}` → `fr-tile` avec titre
échappé (`&amp;`).

## Risques & limites

- **Shortcodes Nunjucks non exécutables** : seul `component("tile")` est reproduit.
  `component("card")` (0 usage), `nanoid()`, `{% if/for/set %}`, fil d'Ariane,
  navigation → placeholder ou suppression. Limite intrinsèque (pas de 11ty dans
  le navigateur), commune à toutes les approches.
- **Images `./assets/`** : résolues via `getAsset` + réassignation `requestAnimationFrame`/
  `setTimeout` (le `.url` blob d'`AssetProxy` est peuplé en async). Robuste pour
  les images déjà commitées (cas courant) ; une image tout juste uploadée et non
  enregistrée peut n'apparaître qu'après sauvegarde. À valider au test ; si
  fragile, écouter aussi un `MutationObserver` ou repasser le corps par
  `widgetFor('body')` (mais on reperd la fidélité markdown-it).
- **Pas de JS DSFR** : accordéons forcés dépliés en CSS ; onglets/modales/toggles
  éventuels seraient statiques. Acceptable pour un aperçu.
- **`eleventy.before` lance esbuild à chaque rebuild `--serve`** : ~50 ms, OK ;
  ajouter une garde « source inchangée » seulement si gênant.
- **`markdown-it` en devDep transitif rendu explicite** : épingler `14.1.0` sur la
  version d'Eleventy 2.0.1 ; à re-synchroniser lors d'une montée d'Eleventy.
- **Fichier généré gitignoré** : un clone frais sans build a un `/admin` sans
  aperçu enrichi jusqu'au premier `npm start`/`build`. La CI build avant deploy,
  donc la prod est toujours à jour.
- **`registerPreviewTemplate` remplace tout le volet** : les aperçus de champ
  titre/description de Sveltia disparaissent (choix « contenu seul » ⇒ acceptable ;
  le titre reste visible dans le champ d'édition à gauche).
- **Liste de collections codée en dur** dans `preview.js` : commentaire de synchro
  avec `config.yml` + garde `raw == null`.
- **DOMPurify** : le HTML du template React n'est PAS passé à DOMPurify (rendu via
  `ref`/`innerHTML`) → le contenu markdown est du contenu de confiance (dépôt),
  acceptable ; ne pas y injecter d'entrée utilisateur non fiable.

## Alternative écartée : sans build (marked + extensions)

`registerPreviewStyle` + `window.marked.use({ hooks:{preprocess}, extensions:[dsfrAlert…] })`
imitant les conteneurs à la main, corps délégué à `widgetFor('body')` (⇒ résolution
d'images et aperçus d'accordéons gratuits). ~90-95 %, zéro dépendance. Écartée au
profit de la parité exacte et de la synchro automatique, mais reste le repli si
esbuild pose problème.
