/*
 * Widget custom Decap CMS `dsfr-editor` : monte <DsfrEditor> dans l'arbre React
 * de Decap (React 19 partagé, pas d'iframe), et sérialise le corps de fichier
 * en « source JSON + HTML compilé » (voir serialize.ts).
 *
 * cf. docs/cms-architecture.md
 */
import { useCallback, useMemo, useRef } from "react";
import {
  DsfrEditor,
  useDsfrEditor,
  renderPublishedHtml,
} from "dsfr-editor";
import "dsfr-editor/style.css";

import { buildBody, injectHeadingIds, parseBody } from "./serialize";

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

  const handleChange = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(serialize()), 300);
  }, [onChange, serialize]);

  return (
    <div className={classNameWrapper} id={forID}>
      <DsfrEditor editor={editor} onChange={handleChange} />
    </div>
  );
}

// Pas de composant d'aperçu : l'éditeur WYSIWYG DSFR EST l'aperçu (le volet de
// droite de Decap est désactivé par collection, `editor: { preview: false }`).
