/*
 * Corps de fichier = source JSON BlockNote (dans un commentaire HTML en tête)
 * + HTML compilé par le navigateur.
 *
 *   <!--dsfr-editor:source
 *   [ ...arbre BlockNote, indenté... ]
 *   -->
 *   <h2 id="...">...</h2> ...
 *
 * cf. docs/cms-architecture.md (§ format de corps de fichier).
 */
import slugify from "@sindresorhus/slugify";
import type { DsfrPartialBlock } from "dsfr-editor";

const OPEN = "<!--dsfr-editor:source";
const CLOSE = "-->";

// Un commentaire HTML ne doit pas contenir `-->` (ni `--!>`). Tout `--` de la
// source JSON est forcément dans une valeur chaîne -> on l'échappe en `-`
// (échappement JSON standard : `JSON.parse` le relit à l'identique).
const escapeDashes = (json: string) => json.replace(/--/g, "\\u002d\\u002d");

export function buildBody(doc: DsfrPartialBlock[], html: string): string {
  const json = escapeDashes(JSON.stringify(doc, null, 2));
  return `${OPEN}\n${json}\n${CLOSE}\n${html}\n`;
}

export function parseBody(body: string): {
  doc: DsfrPartialBlock[];
  html: string;
} {
  const start = body.indexOf(OPEN);
  if (start !== -1) {
    const end = body.indexOf(CLOSE, start + OPEN.length);
    if (end !== -1) {
      const raw = body.slice(start + OPEN.length, end).trim();
      try {
        const doc = JSON.parse(raw);
        if (Array.isArray(doc)) {
          return { doc, html: body.slice(end + CLOSE.length).trim() };
        }
      } catch (err) {
        console.warn("[dsfr-editor] source JSON illisible :", err);
      }
    }
  }
  // Pas de marqueur (page neuve, ou corps illisible) -> éditeur vide.
  return { doc: [], html: "" };
}

/**
 * Pose un `id` slugifié sur les titres h2–h4 qui n'en ont pas — indispensable
 * au filtre `tableOfContents` d'Eleventy (`fr-summary`).
 *
 * DOIT produire le même slug que le filtre `slugify` d'Eleventy
 * (`@sindresorhus/slugify`, `{ decamelize: false }`), sinon les ancres du
 * sommaire pointent dans le vide. Verrouillé par
 * `packages/markdown-it-dsfr/test/slugify.test.js` (convention) et
 * `serialize.test.ts` (cette fonction).
 */
export function injectHeadingIds(html: string): string {
  if (typeof DOMParser === "undefined") return html;
  const parsed = new DOMParser().parseFromString(
    `<div id="__root">${html}</div>`,
    "text/html",
  );
  const root = parsed.getElementById("__root");
  if (!root) return html;
  // Uniquement les titres « de contenu » (sans classe) — pas les
  // `fr-tile__title` / `fr-accordion__title` / `fr-alert__title` des composants.
  root
    .querySelectorAll("h2:not([class]), h3:not([class]), h4:not([class])")
    .forEach((h) => {
      if (!h.id) {
        const text = (h.textContent ?? "").trim();
        if (text) h.id = slugify(text, { decamelize: false });
      }
    });
  return root.innerHTML;
}
