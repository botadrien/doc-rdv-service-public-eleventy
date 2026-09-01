/*
 * Aperçu Sveltia CMS fidèle au rendu Eleventy + DSFR.
 *
 * Point d'entrée bundlé par esbuild -> public/admin/preview.gen.js (gitignoré),
 * chargé par public/admin/index.html après le script Sveltia.
 *
 * - Charge la CSS du site dans l'iframe d'aperçu (registerPreviewStyle).
 * - Enregistre un template « contenu seul » par collection qui rend le corps
 *   Markdown avec le VRAI markdown-it du site (markdown-config.js partagé),
 *   donc conteneurs / accordéons / ancres identiques à la prod.
 *
 * Voir docs/apercu-cms-dsfr.md.
 */
import MarkdownIt from "markdown-it";
import slugify from "@sindresorhus/slugify";

import configureMarkdown from "../markdown-config.js";

const CMS = window.CMS;
const h = window.h;
const createClass = window.createClass;

if (!CMS || !h || !createClass) {
  console.error("[preview] API CMS (window.CMS / window.h / window.createClass) indisponible");
} else {
  init();
}

function init() {
  const md = configureMarkdown(new MarkdownIt({ html: true }), {
    // Identique à @11ty/eleventy/src/Filters/Slugify.js
    slugify: (str) => slugify("" + str, { decamelize: false }),
  });

  /* --------------------------------------------------------------------- */
  /* 1. Styles du site dans l'iframe d'aperçu                              */
  /* --------------------------------------------------------------------- */
  // Chemins relatifs à /admin/ -> résolus avec le préfixe GitHub Pages.
  [
    "../css/dsfr.min.css",
    "../css/utility/utility.min.css",
    "../css/index.css",
    "../css/prism-diff.css",
  ].forEach((href) => CMS.registerPreviewStyle(href));

  CMS.registerPreviewStyle(
    [
      ":root{color-scheme:light}",
      'body{margin:0;padding:0;font-family:"Marianne",arial,sans-serif;',
      "  color:var(--text-default-grey,#161616);background:var(--background-default-grey,#fff)}",
      ".fr-container{margin-block:1.5rem}",
      // Pas de JS DSFR dans l'aperçu : accordéons/collapses toujours dépliés.
      ".fr-collapse{max-height:none!important;visibility:visible!important;",
      "  overflow:visible!important;--collapse:0!important}",
      ".fr-collapse::before{margin-top:0!important;content:none!important}",
      ".fr-accordion__btn{pointer-events:none}",
    ].join("\n"),
    { raw: true },
  );

  /* --------------------------------------------------------------------- */
  /* 2. Pré-traitement Nunjucks (seul component("tile") est reproduit)     */
  /* --------------------------------------------------------------------- */
  const FROM_RE =
    /^[ \t]*\{%[-\s]*from\s+["']components\/component\.njk["'][\s\S]*?%\}[ \t]*\n?/gm;
  const COMPONENT_RE =
    /\{\{\s*component\(\s*(["'])(\w+)\1\s*,\s*(\{[\s\S]*?\})\s*\)\s*\}\}/g;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
    })[c]);
  }

  function parseObjectLiteral(src) {
    const out = {};
    const re = /(\w+)\s*:\s*(?:(["'])((?:\\.|(?!\2).)*)\2|(true|false|null)|(-?\d+))/g;
    let m;
    while ((m = re.exec(src))) {
      if (m[3] !== undefined) out[m[1]] = m[3];
      else if (m[4] !== undefined) out[m[1]] = { true: true, false: false, null: null }[m[4]];
      else out[m[1]] = Number(m[5]);
    }
    return out;
  }

  function renderTile(t) {
    const ext = !!t.externalUrl;
    const url = t.url && t.url !== false ? t.url : t.externalUrl || "#";
    return (
      '<div class="fr-tile fr-enlarge-link"><div class="fr-tile__body">' +
      '<div class="fr-tile__content"><h4 class="fr-tile__title">' +
      '<a class="fr-tile__link" href="' +
      esc(url) +
      '"' +
      (ext ? ' target="_blank" rel="noopener"' : "") +
      ">" +
      esc(t.title) +
      "</a></h4>" +
      '<p class="fr-tile__desc">' +
      esc(t.description) +
      "</p></div></div></div>"
    );
  }

  function placeholder(name) {
    return (
      '<div class="fr-tile"><div class="fr-tile__body"><div class="fr-tile__content">' +
      '<p class="fr-tile__desc">[Composant « ' +
      esc(name) +
      " » — aperçu indisponible]</p></div></div></div>"
    );
  }

  function preprocess(src) {
    return String(src || "")
      .replace(FROM_RE, "")
      .replace(COMPONENT_RE, (_, q, name, obj) => {
        if (name !== "tile") return placeholder(name);
        try {
          return renderTile(parseObjectLiteral(obj));
        } catch (e) {
          return placeholder(name);
        }
      })
      // Reste de Nunjucks non géré : on retire les tags, on marque les expressions.
      .replace(/\{%[-\s][\s\S]*?%\}/g, "")
      .replace(/\{\{\s*[\s\S]*?\}\}/g, "⟦variable⟧");
  }

  /* --------------------------------------------------------------------- */
  /* 3. Résolution des images/vidéos co-localisées ./assets/…              */
  /* --------------------------------------------------------------------- */
  const EXT_MIME = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    svg: "image/svg+xml",
    webp: "image/webp",
    avif: "image/avif",
  };
  const assetCache = new Map();

  function resolveAssets(container, entryKey, getAsset) {
    if (typeof getAsset !== "function") return;
    container.querySelectorAll("img[src], video[src], source[src]").forEach((node) => {
      const src = node.getAttribute("src") || "";
      if (!/^(\.\/)?assets\//.test(src)) return;
      const cacheKey = entryKey + "|" + src;
      if (assetCache.has(cacheKey)) {
        node.src = assetCache.get(cacheKey);
        return;
      }
      let proxy;
      try {
        proxy = getAsset(src);
      } catch (e) {
        return;
      }
      if (!proxy) return;
      if (proxy.url && /^(blob:|data:|https?:)/.test(proxy.url)) {
        assetCache.set(cacheKey, proxy.url);
        node.src = proxy.url;
        return;
      }
      if (typeof proxy.toBase64 === "function") {
        proxy
          .toBase64()
          .then((b64) => {
            const ext = (src.split(".").pop() || "").toLowerCase();
            const uri = "data:" + (EXT_MIME[ext] || "application/octet-stream") + ";base64," + b64;
            assetCache.set(cacheKey, uri);
            node.src = uri;
          })
          .catch(() => {});
      }
    });
  }

  /* --------------------------------------------------------------------- */
  /* 4. Template « contenu seul »                                          */
  /* --------------------------------------------------------------------- */
  const BodyPreview = createClass({
    displayName: "DsfrBodyPreview",

    paint() {
      const el = this._el;
      if (!el) return;
      const entry = this.props.entry;
      const raw = entry && entry.getIn ? entry.getIn(["data", "body"]) : undefined;
      if (raw == null) {
        el.innerHTML = "";
        return;
      }
      el.innerHTML = md.render(preprocess(raw));
      const entryKey = String((entry.get && (entry.get("path") || entry.get("slug"))) || "");
      resolveAssets(el, entryKey, this.props.getAsset);
    },

    componentDidMount() {
      this.paint();
    },
    componentDidUpdate() {
      this.paint();
    },

    render() {
      const self = this;
      return h("div", {
        className: "fr-container",
        ref(el) {
          self._el = el;
        },
      });
    },
  });

  // Une clé par collection ET par fichier de file-collection (Sveltia indexe sur
  // fileName ?? collectionName). Garder synchro avec public/admin/config.yml.
  // 'accueil' inclus : layouts/home.njk n'a pas de bandeau, le corps porte déjà
  // sa structure fr-container -> le template « contenu seul » convient.
  [
    "doc-utilisateur",
    "doc-technique",
    "accompagner-le-changement",
    "toutes-les-notions",
    "integration",
    "a-propos",
    "accueil",
    "accessibilite",
    "mentions-legales",
    "donnees-personnelles",
    "contact",
  ].forEach((name) => CMS.registerPreviewTemplate(name, BodyPreview));
}
