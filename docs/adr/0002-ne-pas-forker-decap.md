# ADR 0002 — Ne pas forker Decap CMS

> **Statut : accepté** (2026-09-09). Réexamen : voir le déclencheur en fin de document.
> Prolonge [`0001`](0001-remplacer-editeur-cms-par-decap-dsfr-editor.md) (section « Fork ou pas ? »),
> confirmé après le spike et la bascule.

## Décision

On consomme **Decap en dépendances npm** (`decap-cms-app`, puis à terme
`decap-cms-core` + widgets explicites). **Pas de fork.**

Le widget custom `dsfr-editor` se monte via l'API publique :
`window.CMS_MANUAL_INIT = true` → `CMS.registerWidget("dsfr-editor", …)` →
`CMS.init({ config })`. Le spike a prouvé que les deux seules inconnues qui
auraient pu justifier un fork se résolvent sans fork :

- **contourner le sérialiseur de corps** : le widget porte le champ `body`,
  reçoit et réécrit la chaîne verbatim (`serialize.ts`, aller-retour testé) ;
- **éditeur plein écran sans volet d'aperçu** : `editor: { preview: false }` par
  collection + `registerWidget` à 2 arguments (pas de composant d'aperçu).

## Les irritants, et pourquoi aucun ne justifie un fork

### 1. Check d'accès write

`decap-cms-backend-github` fait `GET /repos/{owner}/{repo}` et exige
`permissions.push` ; le champ d'instance `bypassWriteAccessCheckForAppTokens`
n'est **pas** lu depuis la config.

- **Choisi :** donner l'accès write aux éditeurs + installer la GitHub App sur le
  dépôt (documenté et testé — [`../cms-auth-github-app.md`](../cms-auth-github-app.md)).
- **Trappes de secours** si on veut un jeton plus restreint sans `push` :
  (a) `patch-package` sur `decap-cms-backend-github` ;
  (b) backend custom `class extends` enregistré via `CMS.registerBackend("github", …)` ;
  (c) PR upstream exposant un flag de config.

### 2. Poids du bundle (~1,87 Mo gz + chunk `native` 432 Ko)

- **Sans fork :** composer depuis `decap-cms-core` (publié, 3.18.x, sans
  dépendance Slate/CodeMirror) + une liste explicite de `registerWidget`, en
  retirant markdown / richtext / code. `decap-cms-app` n'ajoute au `core` que le
  câblage de 17 widgets + 10 backends + toutes les locales — on n'en garde qu'une
  poignée.
- Pré-requis : traiter le `widget: "markdown"` de la home (la migrer vers
  `dsfr-editor`, ou la repasser en widget texte).

### 3. Régression npm `catalog:` (2026-09-08)

`overrides` + `.npmrc legacy-peer-deps=true` + `decap-server@3.11.0` en place.
Un fork **n'y aiderait pas** (bug de métadonnées de publication sur des
dépendances transitives). Retrait quand l'upstream republie.

### 4. Ergonomie de config

Rien à faire : `CMS.init({ config })` inline est entièrement de l'API publique.

## Coût d'un fork (rejeté)

~40 paquets, socle Redux + Immutable.js *legacy*, webpack/babel maison, upstream
mouvant (React 19 arrivé le 2026-09-08, lot de patchs cassé le lendemain) →
charge de rebase permanente. À contre-courant de la philosophie du dépôt
(`packages/markdown-it-dsfr` = 4 fichiers ; `packages/dsfr-editor` = copie source
vendorée). Le dépôt ne forke même pas `dsfr-editor` (pourtant sous notre
contrôle) : forker Decap irait plus loin dans la mauvaise direction.

## Déclencheur de réexamen

Rouvrir cette décision seulement si, **cumulativement** : la composition
`decap-cms-core` n'allège pas assez le bundle, **et** l'octroi d'accès write est
bloqué côté organisation, **et** l'upstream ne répond pas aux PR proposées.
