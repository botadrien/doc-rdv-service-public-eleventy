/*
 * Composants d'éditeur Sveltia/Decap pour les blocs DSFR custom.
 *
 * Ils permettent d'insérer des accordéons et des étapes numérotées depuis
 * l'éditeur riche du CMS, tout en produisant la syntaxe Markdown déjà comprise
 * par Eleventy (markdown-it-container, cf. markdown-custom-containers.js) :
 *
 *     ????accordionsgroup
 *
 *     ??? Intitulé de l'accordéon
 *
 *     Contenu **markdown** riche
 *
 *     ???
 *
 *     ????
 *
 * - `dsfr-accordions-group` : un groupe (fr-accordions-group) + N accordéons.
 * - `dsfr-accordion`        : un accordéon isolé (hors groupe).
 *
 * Le marqueur du groupe est `????` (4), celui d'un accordéon `???` (3) — c'est ce
 * qui permet d'imbriquer les seconds dans le premier sans ambiguïté.
 *
 * Motifs : le drapeau `m` est indispensable. Sveltia teste le motif ligne par
 * ligne dans l'éditeur, MAIS l'aperçu (buildMarkdownWithPreviews) l'applique en
 * `matchAll` sur toute la valeur du champ ; sans `m`, `^` ne matche qu'au tout
 * début du champ et l'aperçu affiche les `???` bruts.
 */
(function () {
  'use strict';

  if (!window.CMS || typeof window.CMS.registerEditorComponent !== 'function') {
    console.error('[editor-components] window.CMS.registerEditorComponent indisponible');
    return;
  }

  var ITEM_RE = /^\?\?\?(?!\?)[ \t]*(.+)\n([\s\S]*?)\n\?\?\?(?!\?)[ \t]*$/gm;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
    });
  }

  /** Découpe le corps d'un groupe en accordéons { title, body }. */
  function parseItems(inner) {
    var items = [];
    var m;
    ITEM_RE.lastIndex = 0;
    while ((m = ITEM_RE.exec(inner))) {
      items.push({ title: m[1].trim(), body: m[2].trim() });
    }
    return items;
  }

  /** Un accordéon -> syntaxe markdown-it-container. */
  function itemToMarkdown(it) {
    var title = it && it.title ? String(it.title).trim() : '';
    var body = it && it.body ? String(it.body).trim() : '';
    return '???' + (title ? ' ' + title : '') + '\n\n' + body + '\n\n???';
  }

  /*
   * Aperçu (panneau de droite). Sveltia inline la chaîne retournée dans le
   * markdown puis la passe à `marked`. On rend un <details> stylé « façon DSFR »
   * (repliable nativement, sans la CSS du DSFR qui n'est pas chargée dans
   * l'aperçu). Les lignes vides autour du corps sont nécessaires pour que
   * `marked` interprète le corps comme du markdown à l'intérieur du HTML.
   */
  var SUMMARY_STYLE =
    'display:block;padding:.75rem 0;font-weight:500;color:#000091;cursor:pointer';
  var DETAILS_STYLE = 'border-top:1px solid #dddddd;margin:0';

  function itemToPreview(it) {
    var title = esc((it && it.title) || 'Accordéon sans titre');
    var body = (it && it.body) || '_(vide)_';
    return (
      '<details style="' + DETAILS_STYLE + '">\n' +
      '<summary style="' + SUMMARY_STYLE + '">' + title + '</summary>\n\n' +
      body + '\n\n' +
      '</details>'
    );
  }

  function groupToPreview(items) {
    if (!items.length) {
      return '_(groupe d’accordéons vide)_';
    }
    return (
      '<div style="border-bottom:1px solid #dddddd">\n\n' +
      items.map(itemToPreview).join('\n\n') +
      '\n\n</div>'
    );
  }

  // --- Groupe d'accordéons -------------------------------------------------
  window.CMS.registerEditorComponent({
    id: 'dsfr-accordions-group',
    label: 'Accordéons (groupe)',
    icon: 'expand_more',
    pattern: /^\?\?\?\?[ \t]*accordionsgroup[^\n]*\n([\s\S]*?)\n\?\?\?\?[ \t]*(?=\n|$)/m,
    fields: [
      {
        name: 'items',
        label: 'Accordéons',
        label_singular: 'Accordéon',
        widget: 'list',
        summary: '{{fields.title}}',
        fields: [
          { name: 'title', label: 'Titre', widget: 'string' },
          { name: 'body', label: 'Contenu', widget: 'markdown' },
        ],
      },
    ],
    fromBlock: function (match) {
      return { items: parseItems(match[1] || '') };
    },
    toBlock: function (data) {
      var items = data && Array.isArray(data.items) ? data.items : [];
      if (!items.length) {
        return '????accordionsgroup\n\n????';
      }
      return '????accordionsgroup\n\n' + items.map(itemToMarkdown).join('\n\n') + '\n\n????';
    },
    toPreview: function (data) {
      var items = data && Array.isArray(data.items) ? data.items : [];
      return groupToPreview(items);
    },
  });

  // --- Étapes verticales numérotées ------------------------------------
  var STEP_RE = /^:::step[ \t]*(.*)\n([\s\S]*?)\n:::[ \t]*$/gm;

  function parseSteps(inner) {
    var steps = [];
    var m;
    STEP_RE.lastIndex = 0;
    while ((m = STEP_RE.exec(inner))) {
      steps.push({ title: (m[1] || '').trim(), body: (m[2] || '').trim() });
    }
    return steps;
  }

  function stepToMarkdown(s) {
    var title = s && s.title ? String(s.title).trim() : '';
    var body = s && s.body ? String(s.body).trim() : '';
    return ':::step ' + title + '\n\n' + body + '\n\n:::';
  }

  function stepsToPreview(steps) {
    if (!steps.length) {
      return '_(aucune étape)_';
    }
    return (
      '<ol>\n' +
      steps
        .map(function (s) {
          var title = esc(s.title || 'Étape sans titre');
          var body = s.body || '';
          return '<li><strong>' + title + '</strong>\n\n' + body + '\n\n</li>';
        })
        .join('\n\n') +
      '\n</ol>'
    );
  }

  window.CMS.registerEditorComponent({
    id: 'dsfr-steps',
    label: 'Étapes numérotées',
    icon: 'format_list_numbered',
    pattern: /^::::steps[^\n]*\n([\s\S]*?)\n::::[ \t]*(?=\n|$)/m,
    fields: [
      {
        name: 'steps',
        label: 'Étapes',
        label_singular: 'Étape',
        widget: 'list',
        summary: '{{fields.title}}',
        fields: [
          { name: 'title', label: 'Titre', widget: 'string' },
          { name: 'body', label: 'Contenu', widget: 'markdown', required: false },
        ],
      },
    ],
    fromBlock: function (match) {
      return { steps: parseSteps(match[1] || '') };
    },
    toBlock: function (data) {
      var steps = data && Array.isArray(data.steps) ? data.steps : [];
      if (!steps.length) {
        return '::::steps\n\n::::';
      }
      return '::::steps\n\n' + steps.map(stepToMarkdown).join('\n\n') + '\n\n::::';
    },
    toPreview: function (data) {
      var steps = data && Array.isArray(data.steps) ? data.steps : [];
      return stepsToPreview(steps);
    },
  });

  // --- Accordéon isolé ---------------------------------------------------
  window.CMS.registerEditorComponent({
    id: 'dsfr-accordion',
    label: 'Accordéon (isolé)',
    icon: 'expand_more',
    pattern: /^\?\?\?(?!\?)[ \t]*(.+)\n([\s\S]*?)\n\?\?\?(?!\?)[ \t]*(?=\n|$)/m,
    fields: [
      { name: 'title', label: 'Titre', widget: 'string' },
      { name: 'body', label: 'Contenu', widget: 'markdown' },
    ],
    fromBlock: function (match) {
      return { title: (match[1] || '').trim(), body: (match[2] || '').trim() };
    },
    toBlock: function (data) {
      return itemToMarkdown(data);
    },
    toPreview: function (data) {
      return itemToPreview(data);
    },
  });
})();
