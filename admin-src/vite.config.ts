import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

/*
 * Spike : bundle admin Decap CMS + widget dsfr-editor.
 * `npm run admin:dev`  -> serveur Vite sur http://localhost:5173/
 * `npm run admin:build` -> _site/admin/ (non branché à la CI pour l'instant)
 *
 * cf. docs/remplacer-editeur-cms-dsfr-editor.md (chantier 1).
 */
const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  root: r("."),
  base: "./",
  plugins: [react()],
  resolve: {
    // Ceinture + bretelles : le paquet vendoré `packages/dsfr-editor` est déjà
    // résolu via les workspaces npm, mais on force la source TS pour éviter
    // toute tentative de résolution vers un `dist/` inexistant.
    alias: {
      "dsfr-editor/style.css": r("../packages/dsfr-editor/src/styles/index.css"),
      "dsfr-editor": r("../packages/dsfr-editor/src/index.ts"),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    // -> public/admin/ ; le passthrough Eleventy (`./public/` -> `/`) le copie
    // dans _site/admin/. `index.html` + `assets/` sont gitignorés (générés).
    outDir: r("../public/admin"),
    emptyOutDir: false,
  },
  server: { port: 5173 },
});
