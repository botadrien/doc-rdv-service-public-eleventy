# Authentification du CMS via une GitHub App

> Objectif : les éditeurs se connectent au CMS en un clic (« Sign in with
> GitHub » → **Authorize**), et le jeton obtenu **ne donne accès qu'au dépôt
> `botadrien/doc-rdv-service-public-eleventy`**, en écriture de contenu.

Une **OAuth App** classique ne sait pas se limiter à un dépôt (scopes au niveau
du compte). Une **GitHub App** le permet : elle est *installée* sur des dépôts
choisis, et le jeton *user-to-server* qu'elle délivre = (dépôts installés) ∩
(droits de l'utilisateur) ∩ (permissions de l'App).

Le worker Cloudflare [`sveltia-cms-auth-rdvsp`](https://github.com/botadrien/sveltia-cms-auth-rdvsp)
(hérité de Sveltia, gardé pour Decap — le flux OAuth Netlify est le même)
fonctionne **sans modification de code** avec une GitHub App — à une condition :
**désactiver l'expiration des jetons utilisateur** (le worker ne gère pas le
`refresh_token`).

> ⚠️ **Decap exige un accès *write*.** `decap-cms-backend-github` fait
> `GET /repos/{owner}/{repo}` et vérifie `permissions.push` ; il n'y a aucun
> contournement par config. Le compte connecté doit être **propriétaire** du
> dépôt, ou **collaborateur avec accès write** *et* avoir l'App installée. Sinon :
> « Your GitHub user account does not have access to this repo. »
> (Permission `Contents: Read and write` de l'App — étape 1 — + rôle write du
> compte : les deux sont nécessaires.)

## Valeurs de référence

| | |
|---|---|
| Worker | `https://sveltia-cms-auth-rdvsp.adrien-076.workers.dev` |
| Callback URL | `https://sveltia-cms-auth-rdvsp.adrien-076.workers.dev/callback` |
| Dépôt | `botadrien/doc-rdv-service-public-eleventy` (public) |
| Domaine autorisé (aujourd'hui) | `botadrien.github.io` |
| Domaine autorisé (après cutover DNS) | `aide.rdv-service-public.fr` |

## 1. Créer la GitHub App

<https://github.com/settings/apps/new> (compte `botadrien`)

- **GitHub App name** : `RDV Service Public – Aide (CMS)`
- **Homepage URL** : `https://botadrien.github.io/doc-rdv-service-public-eleventy/`
- **Callback URL** : `https://sveltia-cms-auth-rdvsp.adrien-076.workers.dev/callback`
- **Expire user authorization tokens** : **DÉCOCHER** ⚠️ (sinon le jeton meurt
  au bout de 8 h et le worker ne sait pas le renouveler)
- **Request user authorization (OAuth) during installation** : cocher (l'éditeur
  autorise en même temps qu'il découvre l'App — un aller-retour de moins)
- **Webhook** → **Active** : DÉCOCHER (pas de webhook)
- **Permissions → Repository permissions** :
  - **Contents** : `Read and write`
  - **Metadata** : `Read-only` (ajouté d'office)
  - tout le reste : `No access`
- **Where can this GitHub App be installed?** : `Only on this account`
- **Create GitHub App**

Puis sur la page de l'App :
- noter le **Client ID** (`Iv1.xxxx` / `Iv23xxxx`)
- **Generate a new client secret** → copier la valeur (visible une seule fois)

## 2. Installer l'App sur le dépôt

Page de l'App → **Install App** → compte `botadrien` → **Only select
repositories** → `doc-rdv-service-public-eleventy` → **Install**.

C'est cette étape qui « choisit le dépôt ». À faire **une seule fois** par
`botadrien` ; les éditeurs (collaborateurs avec accès *write*) n'ont ensuite
qu'à autoriser.

## 3. Configurer le worker Cloudflare

Dashboard Cloudflare → Workers & Pages → `sveltia-cms-auth-rdvsp` → **Settings**
→ **Variables and Secrets** :

| Nom | Type | Valeur |
|---|---|---|
| `GITHUB_CLIENT_ID` | Text | Client ID de l'App (étape 1) |
| `GITHUB_CLIENT_SECRET` | Secret (Encrypt) | client secret de l'App (étape 1) |
| `ALLOWED_DOMAINS` | Text | `botadrien.github.io` |

- Les variables du dashboard s'appliquent immédiatement (pas de redéploiement).
- Si déployé par `wrangler` : `GITHUB_CLIENT_SECRET` **doit** passer par
  `wrangler secret put GITHUB_CLIENT_SECRET` (jamais dans `wrangler.toml`).
  `ALLOWED_DOMAINS` peut aller dans `wrangler.toml` sous `[vars]`.
- Au cutover DNS : `ALLOWED_DOMAINS = botadrien.github.io, aide.rdv-service-public.fr`
  (ou juste le nouveau domaine).

## 4. Le CMS

Il n'y a plus de `config.yml` : la config Decap est **inline** dans
`admin-src/main.tsx` (`backend: { name: "github", repo, branch, base_url }`).
`base_url` pointe déjà sur le worker ; pas de `auth_scope` (ignoré par une GitHub
App). Rien à changer côté code.

## 5. Tester

1. Ouvrir `https://botadrien.github.io/doc-rdv-service-public-eleventy/admin/`
2. **Sign in with GitHub** → écran d'autorisation GitHub → **Authorize**
3. Retour dans le CMS, connecté (si « … does not have access to this repo »,
   voir l'encadré en tête : le compte n'a pas l'accès write).
4. Vérifier qu'une petite modif se commite bien sur `main`.

Si un éditeur avait autorisé une ancienne **OAuth App** avec le scope `repo` :
*GitHub → Settings → Applications → Authorized OAuth Apps* → **Revoke**, puis
se reconnecter.

## Limites connues

- Flux OAuth Netlify **non spécifique** à un CMS : les endpoints sont les mêmes
  pour Sveltia et Decap ; le worker relaie le jeton « sans header de scope »
  (comme un fine-grained PAT). Testé OK avec Decap 3.16.
- **Dev local** : `npm run admin:dev` + `npx -y decap-server@3.11.0` (le
  `local_backend` court-circuite l'OAuth ; pas besoin d'ajouter `localhost` à
  `ALLOWED_DOMAINS`).
- Si un jour on veut révoquer l'accès en masse : désinstaller l'App du dépôt
  invalide tous les jetons d'un coup.
