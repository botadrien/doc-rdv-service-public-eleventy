/*
 * Composants d'éditeur Sveltia/Decap pour les accordéons du DSFR.
 *
 * Ils permettent d'insérer des accordéons depuis l'éditeur riche du CMS, tout en
 * produisant la syntaxe Markdown déjà comprise par Eleventy
 * (markdown-it-container « accordion », cf. markdown-custom-containers.js) :
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
 */
(function () {
  'use strict';

  if (!window.CMS || typeof window.CMS.registerEditorComponent !== 'function') {
    console.error('[editor-components] window.CMS.registerEditorComponent indisponible');
    return;
  }

  /** Découpe le corps d'un groupe en accordéons { title, body }. */
  var ITEM_RE = /^\?\?\?(?!\?)[ \t]*(.+)\n([\s\S]*?)\n\?\?\?(?!\?)[ \t]*$/gm;

  function parseItems(inner) {
    var items = [];
    var m;
    ITEM_RE.lastIndex = 0;
    while ((m = ITEM_RE.exec(inner))) {
      items.push({ title: m[1].trim(), body: m[2].trim() });
    }
    return items;
  }

  function itemToMarkdown(it) {
    var title = it && it.title ? String(it.title).trim() : '';
    var body = it && it.body ? String(it.body).trim() : '';
    return '???' + (title ? ' ' + title : '') + '\n\n' + body + '\n\n???';
  }

  function itemToPreview(it) {
    var title = (it && it.title) || 'Sans titre';
    var body = (it && it.body) || '';
    return '<details><summary><strong>' + title + '</strong></summary>\n\n' + body + '\n\n</details>';
  }

  // --- Groupe d'accordéons -------------------------------------------------
  window.CMS.registerEditorComponent({
    id: 'dsfr-accordions-group',
    label: "Accordéons (groupe)",
    icon: 'expand_more',
    // `[\s\S]` -> Sveltia traite le motif comme multi-ligne. Ancré en début de
    // chaîne : le bloc doit commencer sur la ligne `????accordionsgroup`.
    pattern: /^\?\?\?\?[ \t]*accordionsgroup[^\n]*\n([\s\S]*?)\n\?\?\?\?[ \t]*(?=\n|$)/,
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
      if (!items.length) {
        return '_(groupe d’accordéons vide)_';
      }
      return items.map(itemToPreview).join('\n\n');
    },
  });

  // --- Accordéon isolé ---------------------------------------------------
  window.CMS.registerEditorComponent({
    id: 'dsfr-accordion',
    label: 'Accordéon (isolé)',
    icon: 'expand_more',
    pattern: /^\?\?\?(?!\?)[ \t]*(.+)\n([\s\S]*?)\n\?\?\?(?!\?)[ \t]*(?=\n|$)/,
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
