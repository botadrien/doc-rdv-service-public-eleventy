# Vendoring de `dsfr-editor`

`packages/dsfr-editor/` est une copie de
[`botadrientronics/dsfr-editor`](https://github.com/botadrientronics/dsfr-editor)
intégrée en **`git subtree`**. On consomme la **source TS directement**
(`package.json` `exports` → `src/index.ts`, pas de `dist/`) ; le bundle admin
Vite la compile.

## Pourquoi subtree (et pas submodule / dépendance git)

- Pas de piège « submodule non initialisé » pour les contributeurs ni la CI.
- `npm ci` marche sans accès réseau à un dépôt tiers.
- Les correctifs locaux vivent dans **ce** dépôt, en commits normaux, et restent
  diffables contre une baseline upstream.

## Baseline

- Remote : `dsfr-editor-upstream` = `https://github.com/botadrientronics/dsfr-editor.git`
- Commit de référence : voir `packages/dsfr-editor/VENDORED_FROM.txt`.
- Le commit de subtree `--squash` correspondant sert de **baseline diffable** :

  ```bash
  git log --oneline -- packages/dsfr-editor | grep -i "subtree"   # trouve la baseline
  git diff <baseline>..HEAD -- packages/dsfr-editor               # = le delta local
  ```

## Modifications locales (le delta)

1. **Fichiers de packaging repo-local** — `package.json` (`*-vendored`, peerDeps
   seulement), `tsconfig.json` (élagué, pas de `dist`), `tsconfig.typecheck.json`,
   `VENDORED_FROM.txt`. À rejouer tels quels après chaque `subtree pull`.
2. **Bloc `htmlEmbed`** — `src/blocks/HtmlEmbed.tsx` (nouveau) + câblage dans
   `src/schema.ts`, `src/blocks/index.ts`, `src/slashMenu.tsx`,
   `src/blocks/blockConfig.tsx`, `src/publish/renderPublishedHtml.ts`.
   Trappe « HTML de confiance » (`dangerouslySetInnerHTML`, pas de sanitizer) —
   spécifique au site ; à **garder local** sauf si l'upstream l'accepte en opt-in.
3. **`ConfigTextareaField`** — `src/blocks/blockConfig.tsx` : champ `textarea`
   générique. Candidat upstream.
4. **Fixes `cleanup()`** — `src/publish/renderPublishedHtml.ts` : `el.className`
   est un `SVGAnimatedString` sur `<svg>` → passer par `getAttribute("class")` ;
   strip d'un attribut `classname` / `bn-*` qui fuit sur les liens. Bugs francs,
   **à remonter en amont en priorité**.
5. **Ids d'accordéon déterministes** — `src/publish/renderPublishedHtml.ts` :
   `Math.random()` → slug du titre. Candidat upstream.

## Synchroniser avec l'upstream

```bash
git subtree pull --prefix packages/dsfr-editor dsfr-editor-upstream <tag|sha> --squash
# régler les conflits sur les fichiers de packaging (§1) — garder la version repo-local
# rejouer / rebaser les commits delta §2–5 si nécessaire
```

Puis mettre à jour `VENDORED_FROM.txt` et `@blocknote/*` / `@codegouvfr/react-dsfr`
dans le `package.json` racine si les peers ont bougé, et lancer `npm test`.

## PR upstream ouvertes / à ouvrir

- fixes `cleanup()` (§4) — prioritaire ;
- `ConfigTextareaField` (§3) ;
- option `headingIds` sur `renderPublishedHtml` (permettrait de supprimer
  `injectHeadingIds` côté `admin-src/serialize.ts`) ;
- ids d'accordéon déterministes (§5) ;
- (option) `htmlEmbed` en extension de schéma opt-in.
