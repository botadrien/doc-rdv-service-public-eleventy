/*
 * Widget custom Decap CMS `dsfr-editor` : monte <DsfrEditor> dans l'arbre React
 * de Decap (React 19 partagé, pas d'iframe), et sérialise le corps de fichier
 * en « source JSON + HTML compilé » (voir serialize.ts).
 *
 * Corps à l'ancien format (Markdown) : converti à l'ouverture via
 * markdownToDsfrBlocks (voir markdownToBlocks.ts). L'enregistrement migre le
 * fichier au nouveau format.
 *
 * Spike — cf. docs/remplacer-editeur-cms-dsfr-editor.md (chantiers 1 & 4).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DsfrEditor,
  useDsfrEditor,
  renderPublishedHtml,
  type DsfrPartialBlock,
} from "dsfr-editor";
import "dsfr-editor/style.css";

import { buildBody, injectHeadingIds, parseBody } from "./serialize";
import { markdownToDsfrBlocks } from "./markdownToBlocks";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function DsfrEditorControl(props: any) {
  const { value, onChange, forID, classNameWrapper } = props;

  // `initialContent` n'est lu qu'au montage — on fige la valeur d'entrée.
  const initial = useMemo(
    () => parseBody(typeof value === "string" ? value : ""),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const editor = useDsfrEditor({ initialContent: initial.doc });
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [legacy, setLegacy] = useState(Boolean(initial.legacyMarkdown));

  const serialize = useCallback(() => {
    let html = "";
    try {
      html = renderPublishedHtml(editor, editor.document, { wrapInContainer: false });
      html = injectHeadingIds(html);
    } catch (err) {
      console.error("[dsfr-editor] renderPublishedHtml a levé :", err);
    }
    return buildBody(editor.document, html);
  }, [editor]);

  // Conversion de l'ancien format Markdown, une fois, au montage.
  useEffect(() => {
    if (!initial.legacyMarkdown) return;
    try {
      const blocks = markdownToDsfrBlocks(initial.legacyMarkdown, editor);
      if (blocks.length) {
        editor.replaceBlocks(editor.document, blocks as any);
        onChange(serialize()); // le fichier changera de format à l'enregistrement
      }
    } catch (err) {
      console.error("[dsfr-editor] conversion Markdown a échoué :", err);
    } finally {
      setLegacy(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(serialize()), 300);
  }, [onChange, serialize]);

  return (
    <div className={classNameWrapper} id={forID}>
      {legacy && (
        <p className="fr-badge fr-badge--sm fr-badge--info" style={{ marginBottom: ".5rem" }}>
          Conversion de l'ancien format…
        </p>
      )}
      <DsfrEditor editor={editor} onChange={handleChange} />
    </div>
  );
}

// Pas de composant d'aperçu : l'éditeur WYSIWYG DSFR EST l'aperçu (le volet de
// droite de Decap est désactivé par collection, `editor: { preview: false }`).
