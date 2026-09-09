import { defineConfig } from "vitest/config";

// Tests TS qui ont besoin d'un DOM (DOMParser) : le rendu publié de dsfr-editor
// et la sérialisation du corps de fichier côté admin-src.
// Les tests `node:test` de `packages/*/test/` restent lancés par `node --test`.
export default defineConfig({
  test: {
    environment: "happy-dom",
    include: ["packages/dsfr-editor/**/*.test.ts", "admin-src/**/*.test.ts"],
  },
});
