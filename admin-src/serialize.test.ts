import { describe, expect, it } from "vitest";
import { buildBody, injectHeadingIds, parseBody } from "./serialize";
import type { DsfrPartialBlock } from "dsfr-editor";

/** Doc avec les séquences dangereuses pour un commentaire HTML. */
const doc = [
  { type: "heading", props: { level: 2 }, content: [{ type: "text", text: "Titre", styles: {} }] },
  {
    type: "paragraph",
    content: [
      { type: "text", text: "Texte avec -- puis --> et <!-- au milieu.", styles: {} },
    ],
  },
] as unknown as DsfrPartialBlock[];

const html = '<h2 id="titre">Titre</h2><p>Texte avec -- puis --&gt; et &lt;!-- au milieu.</p>';

describe("buildBody / parseBody", () => {
  it("fait un aller-retour exact malgré --, --> et <!-- dans le texte", () => {
    const round = parseBody(buildBody(doc, html));
    expect(round.doc).toEqual(doc);
    expect(round.html).toBe(html);
    expect(round.legacyMarkdown).toBeUndefined();
  });

  it("n'émet jamais `-->` avant le vrai délimiteur de fin", () => {
    const body = buildBody(doc, html);
    const source = body.slice(0, body.indexOf("\n-->\n"));
    expect(source).not.toContain("-->");
    expect(source).not.toContain("<!--dsfr-editor:source\n<!--");
  });

  it("un corps illisible ne casse pas parseBody", () => {
    expect(parseBody("").doc).toEqual([]);
    expect(parseBody("n'importe quoi").doc).toEqual([]);
  });
});

describe("injectHeadingIds", () => {
  it("slugifie les titres de contenu sans id", () => {
    expect(injectHeadingIds("<h2>Comment ça marche</h2>")).toContain('id="comment-ca-marche"');
    expect(injectHeadingIds("<h3>Été 2024 !</h3>")).toContain('id="ete-2024"');
  });

  it("ne découpe pas le camelCase (decamelize: false, comme Eleventy)", () => {
    // decamelize:true donnerait `probleme-connu` -> ancres divergentes du site.
    expect(injectHeadingIds("<h2>ProblèmeConnu</h2>")).toContain('id="problemeconnu"');
  });

  it("laisse les titres de composants (avec classe) intacts", () => {
    const out = injectHeadingIds('<h2 class="fr-tile__title">Une tuile</h2>');
    expect(out).not.toContain("id=");
  });

  it("respecte un id déjà posé", () => {
    expect(injectHeadingIds('<h2 id="deja">X</h2>')).toContain('id="deja"');
  });
});
