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
npm test           # markdown-it-dsfr + aller-retour de sérialisation dsfr-editor + typecheck
```

Le site est **monolingue (français)** et servi à la racine (pas de préfixe `/fr/`).

## Édition du contenu (Decap CMS + dsfr-editor)

Interface d'édition : `/admin/` — coquille **Decap CMS** dans laquelle est monté
**`dsfr-editor`** (éditeur WYSIWYG BlockNote/DSFR). Pas de volet d'aperçu :
l'éditeur colle au rendu final. Le bundle est construit par Vite depuis
[`admin-src/`](admin-src/).

Architecture et format de stockage : [`docs/cms-architecture.md`](docs/cms-architecture.md).

- **En local** :
  ```bash
  npm run admin:dev            # Vite, http://localhost:5173
  npx -y decap-server@3.11.0   # 2e terminal — proxy FS local :8081
  ```
  puis « Se connecter » dans l'UI.
- **En production** : **« Sign in with GitHub »**, via le worker Cloudflare
  [`sveltia-cms-auth-rdvsp`](https://github.com/botadrien/sveltia-cms-auth-rdvsp).
  Le compte doit avoir un **accès write** au dépôt. Mise en place (GitHub App
  limitée à ce dépôt) : [`docs/cms-auth-github-app.md`](docs/cms-auth-github-app.md).

Le contenu vit dans `content/<section>/<page>/index.md` (source JSON BlockNote +
HTML pré-compilé) ; les images sont co-localisées dans `content/<section>/<page>/assets/`.

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

- [ ] auth CMS : passer d'une OAuth App à une **GitHub App** limitée à ce dépôt
      — procédure dans [`docs/cms-auth-github-app.md`](docs/cms-auth-github-app.md)
      (étapes GitHub + Cloudflare à exécuter à la main ; le code est prêt)
- [ ] retirer le contournement npm Decap (`overrides` + `.npmrc legacy-peer-deps`)
      quand l'upstream republie les paquets `catalog:` — cf.
      [`docs/cms-architecture.md`](docs/cms-architecture.md)
- [ ] PR upstream à [`dsfr-editor`](https://github.com/botadrientronics/dsfr-editor)
      (fixes `cleanup()`, option `headingIds`) — cf.
      [`docs/vendoring-dsfr-editor.md`](docs/vendoring-dsfr-editor.md)
- [x] corriger l'affichage des images — toutes servies depuis `content/.../assets/`

### Mutualiser les outils DSFR

`packages/markdown-it-dsfr` (conteneurs Markdown DSFR) est isolé en paquet local,
non publié. `packages/dsfr-editor` est vendoré (git subtree). Détails et suite
éventuelle : [`docs/mutualisation-outils-dsfr.md`](docs/mutualisation-outils-dsfr.md).

### Cutover DNS

Voir la section **Déploiement › Cutover** ci-dessus.

## Licence

Code sous licence MIT, contenu éditorial sous licence Étalab 2.0 — voir [`LICENSE.md`](./LICENSE.md).
