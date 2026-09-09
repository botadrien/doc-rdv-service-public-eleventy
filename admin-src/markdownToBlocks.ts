/*
 * Conversion « corps Markdown historique » -> blocs BlockNote DSFR.
 *
 * Le Markdown standard (titres, listes, gras/italique, liens, images, citations,
 * code) passe par `editor.tryParseMarkdownToBlocks` de BlockNote. Les conteneurs
 * DSFR du dépôt (`:::info|success|warning|error`, `:::callout`, `:::highlight`,
 * `????accordionsgroup` / `???`) sont reconnus et convertis en blocs custom.
 *
 * Le reste — `{{ component("tile") }}`, `::::steps`, HTML brut (grille,
 * `<video>`, `<figure>`…) — est **pré-rendu en HTML** (voir `legacyShortcodes`)
 * et placé dans un bloc `htmlEmbed` : rendu correct sur la page, éditable en
 * HTML brut. `::::tiles` (0 usage réel) reste en bloc `code`.
 *
 * Regex alignées sur `public/admin/editor-components.js`.
 * cf. docs/remplacer-editeur-cms-dsfr-editor.md (chantier 4).
 */
import type { DsfrPartialBlock } from "dsfr-editor";

import {
  COMPONENT_TILE_RE,
  renderNunjucksRegion,
  renderSteps,
} from "./legacyShortcodes";

// @blocknote/core 0.54 : `tryParseMarkdownToBlocks` est SYNCHRONE.
interface ParseCapableEditor {
  tryParseMarkdownToBlocks(md: string): DsfrPartialBlock[];
}

type InlineNode = { type: "text"; text: string; styles: Record<string, unknown> };

/** Aplati le contenu inline de plusieurs blocs (les blocs alerte/encadré/relief
 * DSFR n'ont qu'une zone inline). */
function flattenInline(blocks: DsfrPartialBlock[]): InlineNode[] {
  const out: InlineNode[] = [];
  blocks.forEach((b, i) => {
    const c = (b as { content?: unknown }).content;
    if (Array.isArray(c)) {
      for (const node of c) {
        if (node && typeof node === "object" && "type" in node) {
          out.push(node as InlineNode);
        }
      }
      // Séparateur entre paragraphes -> simple espace (un saut de ligne
      // déclenche un wrapper `bn-inline-content-section` de BlockNote).
      if (i < blocks.length - 1) out.push({ type: "text", text: " ", styles: {} });
    }
  });
  return out.length ? out : [{ type: "text", text: "", styles: {} }];
}

function plain(md: string, editor: ParseCapableEditor): DsfrPartialBlock[] {
  const t = md.trim();
  if (!t) return [];
  try {
    const blocks = editor.tryParseMarkdownToBlocks(t);
    return blocks.length ? blocks : [textParagraph(t)];
  } catch {
    return [textParagraph(t)];
  }
}

function textParagraph(text: string): DsfrPartialBlock {
  return {
    type: "paragraph",
    content: [{ type: "text", text, styles: {} }],
  } as DsfrPartialBlock;
}

function codeBlock(text: string): DsfrPartialBlock {
  return {
    type: "codeBlock",
    props: { language: "text" },
    content: [{ type: "text", text: text.trim(), styles: {} }],
  } as DsfrPartialBlock;
}

function htmlEmbed(html: string): DsfrPartialBlock {
  return { type: "htmlEmbed", props: { html: html.trim() } } as DsfrPartialBlock;
}

/* --- Détection des régions spéciales -------------------------------------- */

type Region =
  | { kind: "accgroup"; body: string }
  | { kind: "accordion"; title: string; body: string }
  | { kind: "alert"; severity: string; title: string; body: string }
  | { kind: "callout"; title: string; body: string }
  | { kind: "highlight"; body: string }
  | { kind: "container"; text: string } // ::::steps / ::::tiles
  | { kind: "tilegrid"; text: string } // <div fr-grid-row> … {{ component("tile") }} …
  | { kind: "nunjucks"; text: string } // {% … %} / {{ … }}
  | { kind: "htmlblock"; text: string };

const FINDERS: {
  re: RegExp;
  build: (m: RegExpExecArray) => Region;
}[] = [
  {
    re: /^\?\?\?\?[ \t]*accordionsgroup[^\n]*\n([\s\S]*?)\n\?\?\?\?[ \t]*$/m,
    build: (m) => ({ kind: "accgroup", body: m[1] }),
  },
  {
    re: /^\?\?\?(?!\?)[ \t]*(.+)\n([\s\S]*?)\n\?\?\?(?!\?)[ \t]*$/m,
    build: (m) => ({ kind: "accordion", title: m[1].trim(), body: m[2] }),
  },
  {
    re: /^::::(?:steps|tiles)[^\n]*\n[\s\S]*?\n::::[ \t]*$/m,
    build: (m) => ({ kind: "container", text: m[0] }),
  },
  {
    // Grille `<div class="fr-grid-row…">` contenant `{{ component("tile") }}`.
    // Jusqu'au dernier `</div>` avant une ligne vide (grille toujours 2 niveaux).
    re: /^[ \t]*<div[^>]*\bfr-grid-row\b[^>]*>[\s\S]*?component\(\s*["']tile["'][\s\S]*?<\/div>[ \t]*(?=\n[ \t]*\n|\n*$)/m,
    build: (m) => ({ kind: "tilegrid", text: m[0] }),
  },
  {
    // Autres shortcodes Nunjucks (`{% … %}` / `{{ … }}`) sur lignes consécutives.
    re: /^(?:[ \t]*\{[{%][\s\S]*?[}%]\}[ \t]*\n?)+/m,
    build: (m) => ({ kind: "nunjucks", text: m[0] }),
  },
  {
    // Blocs HTML bruts (grille sans tuile, figure, vidéo, tableau, iframe).
    // Non-greedy : jusqu'au 1er `</tag>` suivi d'une ligne vide / fin.
    re: /^[ \t]*<(div|figure|video|table|iframe)\b[\s\S]*?<\/\1>[ \t]*(?=\n[ \t]*\n|\n*$)/m,
    build: (m) => ({ kind: "htmlblock", text: m[0] }),
  },
  {
    // `<img>` / `<video>` autofermants sur une ligne (souvent avec width=…).
    re: /^[ \t]*<(?:img|video|iframe)\b[^>]*>(?:[ \t]*<\/video>)?[ \t]*$/m,
    build: (m) => ({ kind: "htmlblock", text: m[0] }),
  },
  {
    re: /^:::(info|success|warning|error)[ \t]*(.*)\n([\s\S]*?)\n:::[ \t]*$/m,
    build: (m) => ({
      kind: "alert",
      severity: m[1],
      title: m[2].trim(),
      body: m[3],
    }),
  },
  {
    re: /^:::callout[ \t]*(.*)\n([\s\S]*?)\n:::[ \t]*$/m,
    build: (m) => ({ kind: "callout", title: m[1].trim(), body: m[2] }),
  },
  {
    re: /^:::highlight[ \t]*\n([\s\S]*?)\n:::[ \t]*$/m,
    build: (m) => ({ kind: "highlight", body: m[1] }),
  },
];

/** Trouve la 1re région spéciale ; renvoie le texte avant, la région, l'après. */
function nextRegion(
  src: string,
): { before: string; region: Region; after: string } | null {
  let best: { idx: number; len: number; region: Region } | null = null;
  for (const f of FINDERS) {
    const m = f.re.exec(src);
    if (m && (best === null || m.index < best.idx)) {
      best = { idx: m.index, len: m[0].length, region: f.build(m) };
    }
  }
  if (!best) return null;
  return {
    before: src.slice(0, best.idx),
    region: best.region,
    after: src.slice(best.idx + best.len),
  };
}

const ACC_ITEM_RE = /^\?\?\?(?!\?)[ \t]*(.+)\n([\s\S]*?)\n\?\?\?(?!\?)[ \t]*$/gm;

function regionToBlocks(
  region: Region,
  editor: ParseCapableEditor,
): DsfrPartialBlock[] {
  switch (region.kind) {
    case "accgroup": {
      const items: DsfrPartialBlock[] = [];
      let m: RegExpExecArray | null;
      ACC_ITEM_RE.lastIndex = 0;
      while ((m = ACC_ITEM_RE.exec(region.body))) {
        items.push({
          type: "dsfrAccordionSection",
          content: [{ type: "text", text: m[1].trim(), styles: {} }],
          children: plain(m[2], editor),
        } as DsfrPartialBlock);
      }
      return items.length ? items : [textParagraph(region.body)];
    }
    case "accordion":
      return [
        {
          type: "dsfrAccordionSection",
          content: [{ type: "text", text: region.title, styles: {} }],
          children: plain(region.body, editor),
        } as DsfrPartialBlock,
      ];
    case "alert":
      return [
        {
          type: "dsfrAlert",
          props: {
            severity: region.severity,
            title: region.title,
            small: !region.title,
          },
          content: flattenInline(plain(region.body, editor)),
        } as DsfrPartialBlock,
      ];
    case "callout":
      return [
        {
          type: "dsfrCallout",
          props: { title: region.title },
          content: flattenInline(plain(region.body, editor)),
        } as DsfrPartialBlock,
      ];
    case "highlight":
      return [
        {
          type: "dsfrHighlight",
          props: {},
          content: flattenInline(plain(region.body, editor)),
        } as DsfrPartialBlock,
      ];
    case "container": {
      if (/^::::steps\b/.test(region.text.trim())) {
        const html = renderSteps(region.text);
        return html ? [htmlEmbed(html)] : [codeBlock(region.text)];
      }
      return [codeBlock(region.text)]; // ::::tiles (0 usage réel)
    }
    case "tilegrid": {
      const html = renderNunjucksRegion(region.text);
      return html ? [htmlEmbed(html)] : [];
    }
    case "nunjucks": {
      COMPONENT_TILE_RE.lastIndex = 0;
      if (!COMPONENT_TILE_RE.test(region.text)) return []; // ex. `{% from %}` seul
      const html = renderNunjucksRegion(region.text);
      return html ? [htmlEmbed(html)] : [];
    }
    case "htmlblock":
      // Nettoie les shortcodes Nunjucks résiduels (non exécutables).
      return [
        htmlEmbed(
          region.text
            .replace(/\{%[\s\S]*?%\}/g, "")
            .replace(/\{\{[\s\S]*?\}\}/g, ""),
        ),
      ];
  }
}

export function markdownToDsfrBlocks(
  markdown: string,
  editor: ParseCapableEditor,
): DsfrPartialBlock[] {
  const blocks: DsfrPartialBlock[] = [];
  let rest = markdown;
  // Garde-fou anti-boucle.
  for (let i = 0; i < 500; i++) {
    const found = nextRegion(rest);
    if (!found) break;
    blocks.push(...plain(found.before, editor));
    blocks.push(...regionToBlocks(found.region, editor));
    rest = found.after;
  }
  blocks.push(...plain(rest, editor));
  return blocks.length ? blocks : [textParagraph("")];
}
