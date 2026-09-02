# Aide de RDV Service Public

Site de documentation / centre d'aide de [RDV Service Public](https://www.rdv-service-public.fr/),
généré avec [Eleventy](https://www.11ty.dev/) et le
[Système de Design de l'État (DSFR)](https://www.systeme-de-design.gouv.fr/), à partir du
gabarit [`codegouvfr/eleventy-dsfr`](https://github.com/codegouvfr/eleventy-dsfr).

Il remplace l'ancien site GitBook <https://aide.rdv-service-public.fr/>
(source : [`rdv-solidarites/rdv-service-public-gitbook`](https://github.com/rdv-solidarites/rdv-service-public-gitbook)).

![Page d'accueil du site](docs/screenshots/accueil.png)

## Développement

Prérequis : Node.js ≥ 18.

```bash
npm ci             # installe les dépendances
npm start          # serveur de dev sur http://localhost:8080
npm run build      # build de production dans _site/ (+ index de recherche Pagefind)
npm test           # tests des blocs Markdown DSFR + composants d'éditeur (node:test)
```

Le site est **monolingue (français)** et servi à la racine (pas de préfixe `/fr/`).

## Édition du contenu (Sveltia CMS)

Interface d'édition : `/admin/` (`public/admin/`).

![Interface d'édition Sveltia CMS](docs/screenshots/edition-cms.png)

Le menu **« Insert »** de l'éditeur donne accès aux blocs DSFR (accordéons, étapes
numérotées, tuiles, alertes, mises en avant / en exergue). Voir
[`public/admin/editor-components.js`](public/admin/editor-components.js) et
[`markdown-custom-containers.js`](markdown-custom-containers.js).

- **En local** : lancer `npm start`, ouvrir <http://localhost:8080/admin/> dans un
  navigateur Chromium, choisir « Work with Local Repository » et sélectionner le dossier du projet.
- **En production** : « Sign in with Token » avec un
  [jeton d'accès personnel GitHub à granularité fine](https://github.com/settings/tokens?type=beta)
  limité à ce dépôt (permission *Contents: Read and write*).

Le contenu vit dans `content/<section>/<page>/index.md` ; les images sont co-localisées
dans `content/<section>/<page>/assets/`.

## Déploiement

Automatique via GitHub Actions (`.github/workflows/deploy.yml`) sur chaque push `main`,
vers **GitHub Pages** : <https://botadrien.github.io/doc-rdv-service-public-eleventy/>

Build avec `--pathprefix=/doc-rdv-service-public-eleventy/` (sous-chemin GitHub Pages).

### Cutover vers `aide.rdv-service-public.fr` (plus tard)

1. Ajouter `public/CNAME` contenant `aide.rdv-service-public.fr`.
2. Retirer `--pathprefix` du build (`package.json` + workflow).
3. Mettre à jour `_data/metadata.js` (`url`).
4. Configurer le DNS : `aide` → `CNAME` vers `botadrien.github.io`.
5. Mettre en place les redirections depuis les anciennes URL GitBook si nécessaire.

## Feuille de route

- [ ] Limiter le scope de l'auth app GitHub
- [ ] ajouter les redirects depuis les routes github directement dans cette app
- [x] corriger l'affichage des images — les captures Markdown débordaient de la
      colonne (le DSFR ne pose pas de `img { max-width: 100% }` global) ; toutes
      les images sont désormais servies depuis `content/.../assets/`

### Mutualiser les outils DSFR

Les briques réutilisables de ce dépôt (conteneurs Markdown DSFR, composants
d'éditeur Sveltia, thème Eleventy) ont vocation à être **extraites en paquets**
partageables avec d'autres équipes — cf.
[`docs/mutualisation-outils-dsfr.md`](docs/mutualisation-outils-dsfr.md).
Piste retenue : cœur agnostique (`markdown-it-dsfr`) + `sveltia-cms-dsfr` +
fin wrapper `eleventy-plugin-dsfr`. **Publication npm pas encore décidée.**

- [x] Filet de sécurité : suite `npm test` (contrat rendu + aller-retour éditeur)
- [x] Étape 1 — cœur isolé dans [`packages/markdown-it-dsfr/`](packages/markdown-it-dsfr/)
      (non publié), dépôt en npm workspaces
- [ ] Étape 2 — `packages/sveltia-cms-dsfr/` (composants d'éditeur + aperçu)
- [ ] Étape 3 — `packages/eleventy-plugin-dsfr/` (glu Eleventy) *(conditionnel)*
- [ ] Étape 4 — publication + petite PR à [`eleventy-dsfr`](https://github.com/codegouvfr/eleventy-dsfr/issues/17)

### Cutover DNS

Voir la section **Déploiement › Cutover** ci-dessus.

## Licence

Code sous licence MIT, contenu éditorial sous licence Étalab 2.0 — voir [`LICENSE.md`](./LICENSE.md).
