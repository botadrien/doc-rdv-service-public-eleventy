import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

/*
 * Bundle admin : coquille Decap CMS + widget dsfr-editor.
 * `npm run admin:dev`   -> serveur Vite sur http://localhost:5173/
 * `npm run admin:build` -> public/admin/ (branché en prebuild / prebuild-ghpages)
 *
 * cf. docs/cms-architecture.md
 */
const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  root: r("."),
  base: "./",
  plugins: [react()],
  resolve: {
    // `dsfr-editor` est résolu par le workspace npm ; son `package.json`
    // `exports` pointe la source TS (`src/index.ts`), pas de `dist/`.
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
