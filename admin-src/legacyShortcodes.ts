/*
 * Rendu des shortcodes Nunjucks historiques en HTML statique, pour la
 * conversion vers un bloc `htmlEmbed`.
 *
 * Seul `{{ component("tile", { … }) }}` est utilisé dans le contenu (19 occ.,
 * jamais `card`, jamais `{% if/for %}`). Port fidèle de
 * `_includes/components/tile.njk` (site monolingue : `locale_url` / `htmlBaseUrl`
 * sont l'identité ; le préfixe GitHub Pages est réappliqué au build par
 * `EleventyHtmlBasePlugin`).
 */

const NEW_WINDOW = "Nouvelle fenêtre"; // _data/i18n/fr → new_window

const esc = (s: unknown): string =>
  String(s == null ? "" : s).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string,
  );

/** `&#x26;` / `&#38;` / `&amp;` (entités saisies dans le Markdown) -> `&`. */
const decodeAmp = (s: string): string =>
  s.replace(/&(?:#x26|#38|amp);/gi, "&");

export const FROM_RE =
  /^[ \t]*\{%[-\s]*from\s+["']components\/component\.njk["'][\s\S]*?%\}[ \t]*\n?/gm;

export const COMPONENT_TILE_RE =
  /\{\{\s*component\(\s*(["'])(\w+)\1\s*,\s*(\{[\s\S]*?\})\s*\)\s*\}\}/g;

type TileData = {
  url?: string | false;
  externalUrl?: string;
  title?: string;
  description?: string;
  detail?: string;
  pictogram?: string;
  horizontal?: boolean;
  sm?: boolean;
};

/** Parseur d'objet littéral JS toléré (chaînes, booléens, null, nombres). */
export function parseTileObject(src: string): TileData {
  const out: Record<string, unknown> = {};
  const re =
    /(\w+)\s*:\s*(?:(["'])((?:\\.|(?!\2).)*)\2|(true|false|null)|(-?\d+))/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    if (m[3] !== undefined) out[m[1]] = decodeAmp(m[3]);
    else if (m[4] !== undefined)
      out[m[1]] = { true: true, false: false, null: null }[m[4]];
    else out[m[1]] = Number(m[5]);
  }
  return out as TileData;
}

export function renderTile(t: TileData): string {
  const isExternal = !!t.externalUrl && !t.url;
  const url = t.url ? t.url : t.externalUrl || "#";
  const title = String(t.title || "")
    .replace(/\s*↗/g, "")
    .trim();
  const horizontal = !!t.horizontal || (isExternal && !t.pictogram);
  const cls = [
    "fr-tile fr-enlarge-link",
    horizontal && "fr-tile--horizontal",
    (t.sm || horizontal) && "fr-tile--sm",
  ]
    .filter(Boolean)
    .join(" ");
  const urlTitle = title + (isExternal ? ` - ${NEW_WINDOW}` : "");
  const host =
    isExternal && t.externalUrl
      ? esc(t.externalUrl.replace(/^https?:\/\//, "").split("/")[0])
      : "";
  const detail = t.detail ? esc(t.detail) : isExternal ? host : "";
  const picto = t.pictogram
    ? `<div class="fr-tile__header"><div class="fr-tile__pictogram">` +
      `<svg aria-hidden="true" class="fr-artwork" viewBox="0 0 80 80" width="80px" height="80px">` +
      `<use class="fr-artwork-decorative" href="/artwork/pictograms/${esc(t.pictogram)}#artwork-decorative"></use>` +
      `<use class="fr-artwork-minor" href="/artwork/pictograms/${esc(t.pictogram)}#artwork-minor"></use>` +
      `<use class="fr-artwork-major" href="/artwork/pictograms/${esc(t.pictogram)}#artwork-major"></use>` +
      `</svg></div></div>`
    : "";
  return (
    `<div class="${cls}"><div class="fr-tile__body"><div class="fr-tile__content">` +
    `<h3 class="fr-tile__title"><a class="fr-tile__link" href="${esc(url)}" title="${esc(urlTitle)}"` +
    (isExternal ? ` target="_blank" rel="noopener"` : "") +
    `>${esc(title)}</a></h3>` +
    (t.description ? `<p class="fr-tile__desc">${esc(t.description)}</p>` : "") +
    (detail ? `<p class="fr-tile__detail">${detail}</p>` : "") +
    `</div></div>${picto}</div>`
  );
}

/** Plusieurs tuiles adjacentes → grille DSFR responsive. */
export function renderTileGrid(tiles: TileData[]): string {
  if (!tiles.length) return "";
  const cols = Math.max(1, Math.min(tiles.length, 3));
  const md = cols <= 2 ? 6 : 4;
  const cells = tiles
    .map(
      (t) =>
        `<div class="fr-col-12 fr-col-md-${md}">${renderTile(t)}</div>`,
    )
    .join("");
  return `<div class="fr-grid-row fr-grid-row--gutters fr-my-4w">${cells}</div>`;
}

/* --- Étapes numérotées (`::::steps` / `:::step`) ------------------------- */

/** Passe inline minimale (gras / italique / lien) — suffisant pour les corps
 * d'étapes (prose simple). */
function inlineMd(s: string): string {
  return esc(s)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(?<!\w)[_*]([^_*\n]+)[_*](?!\w)/g, "<em>$1</em>")
    .replace(
      /\[([^\]]+)\]\(([^)\s]+)\)/g,
      (_m, t, u) => `<a href="${esc(u)}">${t}</a>`,
    );
}

/** `::::steps` / `:::step Titre … :::` -> `<ol class="steps">…` (markup
 * markdown-it-dsfr, sans dépendre de markdown-it dans le bundle). */
export function renderSteps(block: string): string {
  const inner = block
    .replace(/^[ \t]*::::steps[^\n]*\n/, "")
    .replace(/\n[ \t]*::::[ \t]*$/, "");
  const items = inner
    .split(/\n(?=[ \t]*:::step\b)/)
    .map((part) => {
      // retire le `:::` de fermeture de l'étape (et espaces alentour).
      const cleaned = part.trim().replace(/\n+[ \t]*:::[ \t]*$/, "");
      const m = cleaned.match(/^[ \t]*:::step[ \t]*([^\n]*)\n?([\s\S]*)$/);
      if (!m) return "";
      const title = m[1].trim();
      const body = m[2]
        .trim()
        .split(/\n{2,}/)
        .filter(Boolean)
        .map((p) => `<p>${inlineMd(p.trim().replace(/\n/g, " "))}</p>`)
        .join("\n");
      return (
        `<li class="steps__item">` +
        (title ? `<p class="steps__title">${esc(title)}</p>` : "") +
        (body ? `\n${body}\n` : "") +
        `</li>`
      );
    })
    .filter(Boolean);
  return items.length ? `<ol class="steps">\n${items.join("\n")}\n</ol>` : "";
}

/** Extrait et rend toutes les tuiles d'une région Nunjucks. */
export function renderNunjucksRegion(region: string): string {
  const tiles: TileData[] = [];
  let m: RegExpExecArray | null;
  COMPONENT_TILE_RE.lastIndex = 0;
  while ((m = COMPONENT_TILE_RE.exec(region))) {
    if (m[2] === "tile") {
      try {
        tiles.push(parseTileObject(m[3]));
      } catch {
        /* ignore une tuile illisible */
      }
    }
  }
  return renderTileGrid(tiles);
}
