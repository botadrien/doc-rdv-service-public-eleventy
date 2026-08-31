# Migration GitBook → Eleventy

`convert.mjs` convertit la documentation du dépôt
[`rdv-solidarites/rdv-service-public-gitbook`](https://github.com/rdv-solidarites/rdv-service-public-gitbook)
vers `content/`.

```bash
git clone https://github.com/rdv-solidarites/rdv-service-public-gitbook /tmp/gitbook-src
node scripts/migrate/convert.mjs /tmp/gitbook-src
```

Le script est **idempotent** : il régénère `content/index.md`, `content/<section>.md`
et `content/<section>/<page>/index.md` (+ `assets/`) à chaque exécution. Il ne touche
pas aux pages hors sections gérées (`content/legal`, `content/personal-data`,
`content/accessibility`, `content/contact`, `content/search-results.njk`,
`content/sitemap/`, `content/404.njk`).

## Conversions appliquées

| GitBook | Cible |
|---|---|
| front-matter `icon:` | supprimé |
| `# H1` en tête | supprimé (le layout affiche `title`) |
| `{% hint style=… %}` | `:::info` / `:::warning` / `:::error` / `:::success` |
| `{% stepper %}` / `{% step %}` | titres `### N. …` |
| `<table data-view="cards">` | grille de tuiles DSFR (`components/tile.njk`) |
| `<details><summary>` | accordéons DSFR groupés (`????accordionsgroup` / `???`) |
| `{% embed %}` .mp4 | `<video>` (URL GitBook CDN conservée) |
| `{% embed %}` autre | lien cliquable |
| `<figure>` / `<img>` / `![]()` `.gitbook/assets` | `assets/` co-localisé + `![]()` ou `<img>` |
| `<mark style="color:…">` | texte nu |
| `&#x20;`, `<hN align>` … | nettoyés |
| liens `*.md`, URLs `aide.rdv-service-public.fr` | permaliens internes |

## Points à traiter manuellement

- **Lien cassé** dans `documentation-utilisateur/faq/index.md` : la source pointait
  vers `/broken/pages/B6Alt0LSsmM3qHXxtr0j` (sujet : allow-list de domaines e-mail
  pour les responsables SI). Transformé en texte nu — à repointer.
- **Vidéos** (`toutes-les-notions/prescription/`) : 4 `.mp4` servis par le CDN GitBook
  avec des tokens dans l'URL. À re-héberger avant le cutover si les tokens expirent.
- **Image externe** dans la FAQ (section Outlook) : hébergée sur OVH
  (`storage.gra.cloud.ovh.net`). À rapatrier éventuellement.
- **Pages légales / Contact** : contenu adapté au produit mais à faire relire
  (mentions légales, données personnelles, déclaration d'accessibilité).
- **Matomo** : `_data/metadata.js` → `matomo.url` / `matomo.siteId` à renseigner.
