module.exports = {
    callout: md => {
        const re = /^callout(\s+.*)?$/;
        return {
            validate: (params) => {
                return params.trim().match(re);
            },

            render: (tokens, idx) => {
                const params = tokens[idx].info.trim().match(re);

                if (tokens[idx].nesting === 1) {
                    // opening tag
                    return `
<div class="fr-callout">
    <h3 class="fr-callout__title">${md.utils.escapeHtml(params?.[1]) || ""}</h3>
    <div class="fr-callout__text">
`;
                } else {
                    // closing tag
                    return '</div></div>\n';
                }
            }
        }
    },
    highlight: () => {
        const re = /^highlight$/;
        return {
            validate: (params) => {
                return params.trim().match(re);
            },
    
            render: (tokens, idx) => {
                if (tokens[idx].nesting === 1) {
                    // opening tag
                    return `
<div class="fr-highlight">
    <p>
`;
                } else {
                    // closing tag
                    return `
    </p>
</div>
\n`;
                }
            }
        }
    },
    quote: md => {
        const re = /^quote(\s+.*)?$/
        let params = undefined;
        return {
            validate: (params) => {
                return params.trim().match(re);
            },

            render: (tokens, idx) => {
                params = tokens[idx].info.trim().match(re) || params;

                if (tokens[idx].nesting === 1) {
                    // opening tag
                    return `
<figure class="fr-quote fr-quote--column">
  <blockquote>
`;
                } else {
                    // closing tag
                    const imageBlock = params && params[1] ? `
    <figcaption>
        <div class="fr-quote__image">
            <img src="${md.utils.escapeHtml(params[1]) || ""}" class="fr-responsive-img" alt="" />
        </div>
    </figcaption>` : undefined;
                    return `
    ${imageBlock || ""}
  </blockquote>
</figure>
<br>
\n`;
                }
            }
        }
    },
    alert: md => {
        const re = /^(info|warning|error|success)(\s+.*)?$/;
        return {
            validate: (params) => {
                return params.trim().match(re);
            },

            render: (tokens, idx) => {
                const params = tokens[idx].info.trim().match(re);
                const type = params?.[1];
                const title = md.utils.escapeHtml(params?.[2]) || '';

                if (tokens[idx].nesting === 1) {
                    title_elem = '';
                    small_class = 'fr-alert--sm';
                    if (title !== '') {
                        title_elem = `<h3 class="fr-alert__title">${title}</h3>`;
                        small_class = "";
                    }
                    // opening tag
                    return `
<div class="fr-alert fr-alert--${type} ${small_class}">
    ${title_elem}
`;
                } else {
                    // closing tag
                    return '</div>\n';
                }
            }
        }
    },
    // Étapes verticales numérotées (1, 2, 3…) — composant custom.
    // Syntaxe (marqueur `:` par défaut, 4 deux-points pour le groupe, 3 par étape) :
    //
    //     ::::steps
    //     :::step Partager l'ambition
    //     Contenu **markdown** de l'étape.
    //     :::
    //     :::step Identifier les référents
    //     …
    //     :::
    //     ::::
    steps: () => {
        return {
            validate: (params) => params.trim() === "steps",

            render: (tokens, idx) => {
                return tokens[idx].nesting === 1
                    ? '<ol class="steps">\n'
                    : "</ol>\n";
            }
        };
    },
    step: md => {
        const re = /^step(?:\s+(.*))?$/;
        return {
            validate: (params) => params.trim().match(re),

            render: (tokens, idx) => {
                if (tokens[idx].nesting === 1) {
                    const params = tokens[idx].info.trim().match(re);
                    const title = (params && params[1] || "").trim();
                    return (
                        '<li class="steps__item">\n' +
                        (title
                            ? `<p class="steps__title">${md.utils.escapeHtml(title)}</p>\n`
                            : "")
                    );
                }
                return "</li>\n";
            }
        };
    },
    // Grille de tuiles DSFR (fr-tile) — première implémentation simplifiée :
    // titre + lien uniquement sur la ligne de fence, description dans le corps.
    // Pas de pictogramme / badge / variante ici — pour ça, garder le composant
    // Nunjucks `{{ component("tile", {…}) }}`.
    //
    //     ::::tiles
    //     :::tile Configurer son organisation | /documentation-utilisateur/configurer-son-organisation/
    //     Comprendre les options des motifs et des agents.
    //     :::
    //     :::tile France Titres | https://rendezvouspasseport.ants.gouv.fr/
    //     :::
    //     ::::
    tiles: () => {
        return {
            validate: (params) => params.trim() === "tiles",

            render: (tokens, idx) => {
                if (tokens[idx].nesting !== 1) {
                    return "</ul>\n";
                }
                // Nombre de colonnes = nombre de tuiles (plafonné à 3).
                let count = 0;
                for (
                    let i = idx + 1;
                    i < tokens.length && tokens[i].type !== "container_tiles_close";
                    i++
                ) {
                    if (tokens[i].type === "container_tile_open") count++;
                }
                const cols = Math.max(1, Math.min(count || 1, 3));
                return `<ul class="tiles" style="--tiles-cols:${cols}">\n`;
            }
        };
    },
    tile: md => {
        const re = /^tile\s+(.+)$/;
        return {
            validate: (params) => re.test(params.trim()),

            render: (tokens, idx) => {
                if (tokens[idx].nesting !== 1) {
                    return "</div>\n</div></div></div>\n</li>\n";
                }
                const raw = tokens[idx].info.trim().replace(/^tile\s+/, "");
                const sep = raw.indexOf("|");
                const title = (sep === -1 ? raw : raw.slice(0, sep)).trim();
                const url = (sep === -1 ? "" : raw.slice(sep + 1)).trim();
                const external = /^https?:\/\//i.test(url);
                return (
                    '<li>\n<div class="fr-tile fr-tile--sm fr-enlarge-link">\n' +
                    '<div class="fr-tile__body"><div class="fr-tile__content">\n' +
                    '<h3 class="fr-tile__title">' +
                    `<a class="fr-tile__link" href="${md.utils.escapeHtml(url || "#")}"` +
                    (external ? ' target="_blank" rel="noopener"' : "") +
                    `>${md.utils.escapeHtml(title)}</a></h3>\n` +
                    '<div class="fr-tile__desc">\n'
                );
            }
        };
    },
    accordion: md => {
        const re = /^(accordionsgroup|.*)?$/;
        return {
            validate: (params) => {
                return params.trim().match(re);
            },

            render: (tokens, idx) => {
                const params = tokens[idx].info.trim().match(re);

                if (tokens[idx].nesting === 1) {
                    // opening tag
                    if (params?.[1] === "accordionsgroup") {
                        return `<div class="fr-accordions-group">`;
                    } else {
                        return `
<section class="fr-accordion">
    <h3 class="fr-accordion__title">
        <button class="fr-accordion__btn" aria-expanded="false" aria-controls="accordion-${idx}">
            ${md.utils.escapeHtml(params?.[1]) || ""}
        </button>
    </h3>
    <div class="fr-collapse" id="accordion-${idx}">
`;
                    }
                } else {
                    // closing tag
                    if (params?.[1] === "accordionsgroup") {
                        return `</div>`;
                    } else {
                        return '</div></section>\n';
                    }
                }
            },

            marker: "?"
        }
    }

}