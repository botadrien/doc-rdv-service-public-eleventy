/**
 * Bloc « HTML brut » (`htmlEmbed`).
 *
 * Trappe universelle : rend une chaîne HTML **telle quelle**. Sert aux fragments
 * sans bloc dédié — grilles de mise en page, `<video>`, `<figure>`, tuiles
 * pré-rendues, étapes pré-rendues…
 *
 * - En édition : aperçu via `dangerouslySetInnerHTML` (non éditable) + engrenage
 *   `⚙` qui ouvre une modale avec une zone de texte pour le HTML.
 * - À la publication : `renderPublishedHtml` injecte `props.html` **directement**
 *   (sans conteneur). `toExternalHTML` ci-dessous n'est qu'un repli
 *   copier-coller / export brut.
 *
 * ⚠️ Contenu de confiance uniquement (auteurs du dépôt) — pas d'entrée externe.
 */
import { createReactBlockSpec } from "@blocknote/react";
import { BlockShell, serializeForKey } from "./blockKit";

function EmbedPreview({ html }: { html: string }) {
  if (!html.trim()) {
    return (
      <div
        className="fr-callout fr-callout--brown-caramel fr-icon-code-s-slash-line"
        contentEditable={false}
      >
        <p className="fr-callout__text fr-text--sm">
          Bloc HTML vide — ouvrez la configuration (engrenage) pour coller du HTML.
        </p>
      </div>
    );
  }
  return (
    <div
      className="dsfr-html-embed"
      contentEditable={false}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export const htmlEmbedBlock = createReactBlockSpec(
  {
    type: "htmlEmbed",
    content: "none",
    propSchema: {
      html: { default: "" },
    },
  },
  {
    render: (props) => (
      <BlockShell
        name="HTML brut"
        resetKey={serializeForKey(props.block.props)}
        blockId={props.block.id}
        blockType="htmlEmbed"
      >
        <EmbedPreview html={props.block.props.html} />
      </BlockShell>
    ),
    toExternalHTML: (props) => (
      <div dangerouslySetInnerHTML={{ __html: props.block.props.html }} />
    ),
  },
);
