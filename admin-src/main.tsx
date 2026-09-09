/*
 * Point d'entrée du bundle admin.
 *
 *   window.CMS_MANUAL_INIT = true   (posé dans index.html)
 *   -> registerWidget(...) PUIS CMS.init(...)
 *
 * Backend : `github` (auth via le worker Cloudflare, `base_url`) + `local_backend`
 * pour le dev. Le proxy FS local se lance avec :
 *
 *   npx -y decap-server@3.11.0     (:8081 — le 3.11.1 est cassé, cf. docs/cms-architecture.md)
 *
 * Toutes les sections de contenu sont exposées avec le widget `dsfr-editor` et
 * SANS volet d'aperçu.
 *
 * Le corps est du HTML pré-compilé : Eleventy ne doit ni Nunjucks ni markdown-it.
 * C'est garanti par le champ caché `templateEngineOverride: false` de `PAGE_FIELDS`
 * (Decap l'écrit dans le frontmatter à la création comme à l'enregistrement).
 *
 * cf. docs/cms-architecture.md
 */
import CMS from "decap-cms-app";
import { startReactDsfr } from "@codegouvfr/react-dsfr/spa";
import "@codegouvfr/react-dsfr/dsfr/dsfr.min.css";
import "@codegouvfr/react-dsfr/dsfr/utility/utility.min.css";

import { DsfrEditorControl } from "./DsfrEditorWidget";

startReactDsfr({ defaultColorScheme: "light" });

// Pas de composant d'aperçu : l'éditeur WYSIWYG DSFR tient lieu d'aperçu.
CMS.registerWidget("dsfr-editor", DsfrEditorControl);

/* eslint-disable @typescript-eslint/no-explicit-any */

const NAV_FIELD = {
  name: "eleventyNavigation",
  label: "Navigation",
  widget: "object",
  required: false,
  collapsed: true,
  fields: [
    { name: "key", label: "Libellé dans le menu", widget: "string" },
    { name: "parent", label: "Section parente", widget: "string", required: false },
    {
      name: "order",
      label: "Ordre",
      widget: "number",
      required: false,
      value_type: "int",
    },
  ],
};

/** Champs communs à toutes les pages de contenu (cf. ancre `&page_fields`). */
const PAGE_FIELDS = [
  { name: "title", label: "Titre", widget: "string" },
  { name: "description", label: "Sous-titre (chapô)", widget: "string", required: false },
  { name: "layout", label: "Gabarit", widget: "hidden", default: "layouts/page.njk" },
  // Corps = HTML pré-compilé : Eleventy le sert verbatim (ni Nunjucks, ni markdown-it).
  { name: "templateEngineOverride", label: "Traitement Eleventy", widget: "hidden", default: false },
  NAV_FIELD,
  {
    name: "showBreadcrumb",
    label: "Afficher le fil d'Ariane",
    widget: "boolean",
    required: false,
    default: true,
  },
  {
    name: "slugOverride",
    label: "URL personnalisée (optionnel)",
    widget: "string",
    required: false,
  },
  { name: "draft", label: "Brouillon", widget: "boolean", required: false, default: false },
  { name: "body", label: "Contenu", widget: "dsfr-editor" },
];

const withBodyWidget = (widget: string) =>
  PAGE_FIELDS.map((f) => (f.name === "body" ? { ...f, widget } : f));

/** Une section = un dossier `content/<slug>/` de pages `<page>/index.md`. */
const section = (name: string, label: string) => ({
  name,
  label,
  label_singular: "Page",
  folder: `content/${name}`,
  extension: "md",
  format: "frontmatter",
  create: true,
  path: "{{slug}}/index",
  editor: { preview: false },
  fields: PAGE_FIELDS,
});

/** Une page autonome = un fichier fixe. */
const file = (name: string, label: string, path: string, bodyWidget = "dsfr-editor") => ({
  name,
  label,
  file: path,
  fields: withBodyWidget(bodyWidget),
});

/** Stub de menu de section (`content/<slug>.md`, `permalink: false`). */
const menuStub = (name: string, label: string) => ({
  name,
  label,
  file: `content/${name}.md`,
  fields: [
    { name: "permalink", label: "Permalink", widget: "hidden", default: false },
    {
      name: "eleventyNavigation",
      label: "Navigation",
      widget: "object",
      fields: [
        { name: "key", label: "Libellé dans le menu", widget: "string" },
        { name: "order", label: "Ordre", widget: "number", value_type: "int" },
      ],
    },
  ],
});

const config = {
  backend: {
    name: "github",
    repo: "botadrien/doc-rdv-service-public-eleventy",
    branch: "main",
    // Worker Cloudflare (flux OAuth compatible Netlify/Decap — le même que Sveltia).
    // ⚠️ non testé avec Decap ; si le login échoue, déployer un OAuth provider Decap.
    base_url: "https://sveltia-cms-auth-rdvsp.adrien-076.workers.dev",
  },
  local_backend: true,
  load_config_file: false,
  locale: "fr",
  // Médias globaux. NB : la co-localisation `media_folder: assets` par collection
  // (comme l'ancien config.yml Sveltia) fait planter `decap-server` sur les
  // pages sans dossier `assets/` (ENOENT -> 500) ; OK avec le backend github
  // réel. À rebrancher à la bascule.
  media_folder: "public/img/uploads",
  public_folder: "/img/uploads",
  collections: [
    section("documentation-utilisateur", "Documentation utilisateur"),
    section("documentation-technique", "Documentation technique"),
    section("accompagner-le-changement", "Accompagner le changement"),
    section("toutes-les-notions", "Toutes les notions"),
    section("integration", "Intégration"),
    section("a-propos", "À propos"),
    {
      name: "pages-generales",
      label: "Pages générales",
      editor: { preview: false },
      files: [
        // La home (`layout: home.njk`, héro + grilles de tuiles) reste éditée en
        // Markdown pour l'instant — trop spécifique pour dsfr-editor.
        {
          name: "accueil",
          label: "Accueil",
          file: "content/index.md",
          fields: [
            { name: "title", label: "Titre", widget: "string" },
            { name: "layout", label: "Gabarit", widget: "hidden", default: "layouts/home.njk" },
            {
              name: "eleventyNavigation",
              label: "Navigation",
              widget: "object",
              required: false,
              fields: [
                { name: "key", label: "Libellé dans le menu", widget: "string" },
                { name: "order", label: "Ordre", widget: "number", required: false, value_type: "int" },
              ],
            },
            { name: "body", label: "Contenu", widget: "markdown" },
          ],
        },
        file("accessibilite", "Déclaration d'accessibilité", "content/accessibility/index.md"),
        file("mentions-legales", "Mentions légales", "content/legal/index.md"),
        file("donnees-personnelles", "Données personnelles et cookies", "content/personal-data/index.md"),
        file("contact", "Nous contacter", "content/contact/index.md"),
      ],
    },
    {
      name: "menus",
      label: "Menus de section",
      description:
        "Libellé et ordre des sections dans le menu principal. Ces entrées ne génèrent aucune page.",
      files: [
        menuStub("a-propos", "À propos"),
        menuStub("documentation-utilisateur", "Documentation utilisateur"),
        menuStub("documentation-technique", "Documentation technique"),
        menuStub("accompagner-le-changement", "Accompagner le changement"),
        menuStub("toutes-les-notions", "Toutes les notions"),
        menuStub("integration", "Intégration"),
      ],
    },
  ],
};

CMS.init({ config: config as any });
