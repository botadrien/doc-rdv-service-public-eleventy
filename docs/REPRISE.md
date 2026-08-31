# Reprise du travail — migration GitBook → Eleventy

_État au 31 août 2026. Auteur de la session : migration initiale (Claude Code)._

## TL;DR

Le site est **fonctionnel et déployé**. Tout le contenu GitBook est migré. Il reste
surtout de la finition (analytics, pages légales, un lien cassé, cutover DNS).

- **Prod** : <https://botadrien.github.io/doc-rdv-service-public-eleventy/>
- **CMS prod** : <https://botadrien.github.io/doc-rdv-service-public-eleventy/admin/>
- **Repo** : <https://github.com/botadrien/doc-rdv-service-public-eleventy> (compte bot `botadrien`)
- Branche `main`, 6 commits, `origin/main` à jour, working tree propre.

## Comment relancer l'environnement

Le projet se développe dans une **VM Lima** (`scripts/lima-vm/`). Depuis la racine du
projet sur l'hôte macOS :

```bash
./scripts/lima-vm/host-create-vm.sh --gh-user botadrien   # (re)crée la VM doc-rdvsp-devbox
limactl shell doc-rdvsp-devbox
```

Dans la VM (ou toute machine avec Node ≥ 18) :

```bash
npm ci
npm start        # http://localhost:8080  (brouillons visibles)
npm run build    # build prod dans _site/ + index Pagefind
```

⚠️ `vm-setup.sh` installe maintenant Node 22 ; si la VM existait avant ce commit,
la recréer ou installer Node à la main (`curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt-get install -y nodejs`).

## Ce qui est fait

| Sujet | Détail |
|---|---|
| Scaffold | Gabarit `codegouvfr/eleventy-dsfr` importé puis **réduit au français, servi à la racine** (pas de `/fr/`). Retirés : blog, calendrier, flux RSS/Atom, pagination, mécanique bilingue. Conservés : DSFR, navigation, recherche Pagefind, sitemap, 404. |
| i18n | `EleventyI18nPlugin` gardé **uniquement** pour peupler `page.lang`. Les filtres `i18n` / `locale_url` / `filterCollectionLang` sont des **shims neutres** dans `eleventy.config.js` (chaînes FR depuis `_data/i18n/fr/index.js`). |
| Déploiement | `.github/workflows/deploy.yml` : `npm ci` → `npm run build-ghpages` (build `--pathprefix=/doc-rdv-service-public-eleventy/` + Pagefind) → GitHub Pages. Source Pages = « GitHub Actions ». 4 runs verts. |
| CMS | Sveltia dans `public/admin/` (`index.html` + `config.yml`, compatible Decap). Collection **Pages** arborescente (`nested.depth: 4`, `path: "{{slug}}/index"`), images co-localisées (`media_folder: assets`). Auth prod : **PAT GitHub** (« Sign in with Token »), pas d'OAuth Worker. |
| Contenu | 20 pages + accueil migrées depuis `rdv-solidarites/rdv-service-public-gitbook`. Arbo : `content/<section>/<page>/index.md`. 6 sections (stubs `content/<section>.md`, `permalink: false`) + Accueil + Contact. Nav identique à `SUMMARY.md`. |
| Images | 18 fichiers dans `content/<page>/assets/`, copiés via la règle passthrough `content/**/assets/*` (ajoutée dans `eleventy.config.js`). |
| Convertisseur | `scripts/migrate/convert.mjs` — **idempotent**, relançable. Voir `scripts/migrate/README.md`. |

## Fichiers clés

```
eleventy.config.js              config (pathPrefix "/", shims i18n, passthrough, conteneurs md)
_data/metadata.js               identité du site + bloc `matomo` (vide)
_data/data.js                   texte du pied de page
_data/i18n/fr/index.js          chaînes d'UI (source des shims i18n)
_includes/layouts/{base,page,home}.njk
_includes/templates/{header,footer,navigation}.njk
content/index.md                accueil (héro + grilles de tuiles)
content/<section>.md            stubs de navigation
content/<section>/<page>/index.md + assets/
content/{legal,personal-data,accessibility,contact}/index.md   pages hors migration
public/admin/{index.html,config.yml}   Sveltia
.github/workflows/deploy.yml
scripts/migrate/convert.mjs + README.md
```

## À faire (par ordre de priorité suggéré)

1. **Sveltia — tester `/admin` en prod** : créer un
   [PAT fine-grained](https://github.com/settings/tokens?type=beta) sur le repo
   (`Contents: Read and write`), se connecter via « Sign in with Token », créer/éditer
   une page de test, vérifier le commit. Ajuster `public/admin/config.yml` si l'arbo
   ou les champs ne collent pas (le widget markdown ne connaît pas les conteneurs
   `:::`/`???` — prévoir une aide ou des widgets custom si besoin).
2. **Matomo** : renseigner `_data/metadata.js` → `matomo: { url, siteId }` (récupérer
   l'ID de l'ancien site GitBook). Le script de suivi est déjà câblé conditionnellement
   dans `_includes/layouts/base.njk`.
3. **Lien cassé FAQ** : dans `content/documentation-utilisateur/faq/index.md`, la source
   pointait vers `/broken/pages/B6Alt0LSsmM3qHXxtr0j` (sujet : allow-list de domaines
   e-mail pour les responsables SI). Actuellement transformé en texte nu — repointer
   vers la bonne cible ou supprimer la phrase.
4. **Pages légales / Contact** : `content/{legal,personal-data,accessibility}/index.md`
   sont en version minimale avec des `[À compléter]`. À faire relire (directeur de
   publication, audit RGAA, config Matomo dans « Données personnelles »).
5. **Vidéos** (`content/toutes-les-notions/prescription/`) : 4 `.mp4` encore servis par
   le CDN GitBook (`files.gitbook.com`, tokens dans l'URL). Les rapatrier (soit dans le
   repo, soit sur un autre hébergeur) avant le cutover. Idem 1 image OVH dans la FAQ
   (`storage.gra.cloud.ovh.net`).
6. **Revue visuelle page par page** : comparer avec <https://aide.rdv-service-public.fr/>.
   Points d'attention : accordéons FAQ (40, regroupés), tuiles issues des tableaux de
   cartes, stymper → titres numérotés, images 128px inline (page Prescription).
7. **Cutover DNS vers `aide.rdv-service-public.fr`** (quand prêt) :
   - créer `public/CNAME` contenant `aide.rdv-service-public.fr` ;
   - retirer `--pathprefix=/doc-rdv-service-public-eleventy/` de `package.json`
     (`build-ghpages`) et du workflow ;
   - mettre à jour `_data/metadata.js` → `url` et `public/admin/config.yml`
     (`site_url`, `display_url`, `public_folder`) ;
   - DNS : `aide` → `CNAME` vers `botadrien.github.io` ; activer « Enforce HTTPS » ;
   - prévoir les redirections des anciennes URL (mêmes chemins, sauf
     `guide-des-etapes` → `etape-par-etape`, déjà géré) ;
   - envisager de transférer le repo vers une orga (`rdv-solidarites` / `betagouv`).
8. **Re-migration** : si le contenu GitBook évolue avant le cutover, relancer
   `node scripts/migrate/convert.mjs <clone-gitbook>` (idempotent ; ne touche pas aux
   pages légales/contact). Vérifier ensuite le rapport (liens cassés, assets manquants).

## Pièges rencontrés (pour info)

- Un fichier `.njk` **n'est pas** rendu en markdown → l'accueil est un `.md`
  (`content/index.md`) pour que `##`/`:::` fonctionnent tout en gardant `{{ component() }}`.
- Les images en markdown `![](./assets/…)` ne passent **pas** par `eleventy-img` : il a
  fallu la règle `addPassthroughCopy("content/**/assets/*")`.
- `page.lang` n'existe que si `EleventyI18nPlugin` est chargé (d'où sa conservation).
- Le marqueur des accordéons DSFR est `?` : `????accordionsgroup` … `???Titre` … `???` … `????`.
- L'outil shell garde le `cwd` entre commandes : toujours travailler en chemins absolus
  ou `cd` explicite vers la racine.
