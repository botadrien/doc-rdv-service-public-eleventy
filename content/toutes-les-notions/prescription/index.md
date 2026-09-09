---
templateEngineOverride: false
title: Prescription
layout: layouts/page.njk
eleventyNavigation:
  key: Prescription
  parent: Toutes les notions
  order: 4
showBreadcrumb: true
---
<!--dsfr-editor:source
[
  {
    "id": "bccc7699-a1f8-4ec8-afc5-cded0373e94f",
    "type": "heading",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left",
      "level": 2
    },
    "content": [
      {
        "type": "text",
        "text": "Qu’est-ce qu’est la prescription ?",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "370b9a45-897a-4a5b-a141-66a8fa26a20d",
    "type": "htmlEmbed",
    "props": {
      "html": "<img src=\"./assets/image-5.png\" alt=\"\" width=\"128\">"
    },
    "children": []
  },
  {
    "id": "04d2eda1-e9eb-4e15-8125-bb4d29d86fb7",
    "type": "paragraph",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "RDV Solidarités a pour objectif de faciliter la mise en relation entre les usagers et les agents, ainsi qu'entre les agents de différentes structures et entités administratives. C’est dans ce contexte que la fonctionnalité de prescription a été pensée.",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "b726845b-f98f-4b1d-8b58-5e7f981312bb",
    "type": "paragraph",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "La prescription permet à un agent externe à l'organisation de planifier rendez-vous au nom de l’usager, en fonction des disponibilités de l'agent RDV Solidarités",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "f7fabc2b-e47a-46f7-a2a8-a67b057b26b9",
    "type": "paragraph",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "À titre d'exemple, la prescription offre la possibilité à un agent de médiathèque (le prescripteur) à prendre rendez-vous pour un apprenant avec un conseiller numérique (l’agent RDV Solidarités).",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "7c1d765a-46c2-470d-860e-92f2acfefccd",
    "type": "paragraph",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "Dans cette logique de mise en relation, la prescription peut prendre deux formes : la prescription interne et la prescription externe.",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "ff61f8d6-249a-4582-89c0-fdb4da9300b9",
    "type": "paragraph",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "Globalement, la ",
        "styles": {}
      },
      {
        "type": "text",
        "text": "prescription interne",
        "styles": {
          "bold": true
        }
      },
      {
        "type": "text",
        "text": " concerne les agents utilisateurs de RDV Solidarités (ayant un compte) qui souhaitent orienter un usager vers une structure à laquelle l'agent planifiant le rendez-vous n'appartient pas.",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "37d45102-108c-413d-93ff-f1e6c483904f",
    "type": "paragraph",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "Quant à la ",
        "styles": {}
      },
      {
        "type": "text",
        "text": "prescription externe",
        "styles": {
          "bold": true
        }
      },
      {
        "type": "text",
        "text": ", elle s'adresse aux agents qui n'ont pas de compte RDV Solidarités mais qui sont amenés à planifier des rendez-vous de manière régulière pour les usagers en fonction des disponibilités des agents utilisateurs de RDV Solidarités.",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "f549f66a-bb96-4052-9beb-1f341692185d",
    "type": "heading",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left",
      "level": 2
    },
    "content": [
      {
        "type": "text",
        "text": "En tant qu’administrateur, comment rendre les créneaux de réservation en ligne disponibles pour les prescripteurs ?",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "2ddd9a65-aaa6-4088-9e65-6f8bcbc65ab5",
    "type": "htmlEmbed",
    "props": {
      "html": "<img src=\"./assets/image.png\" alt=\"\" width=\"128\">"
    },
    "children": []
  },
  {
    "id": "c936e392-8fab-4fd6-9d30-df6165373d19",
    "type": "paragraph",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "Tout comme l’ouverture en ligne aux usagers, proposer des créneaux de prise de rendez-vous aux prescripteurs nécessites deux conditions :",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "98f4e876-a397-4ccc-b902-9618afb03262",
    "type": "bulletListItem",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "motif ouvert en ligne : Veuillez suivre le chemin suivant : Paramètres → Motifs → Éditer ou créer un motif → Onglet \"Réservation en ligne\" → Cochez la deuxième proposition dans l'encadré \"Réservation en ligne\".",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "91c8e005-574d-44b0-95f9-78f115a97748",
    "type": "bulletListItem",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "plage d’ouverture : Définissez la plage d'ouverture durant laquelle le prescripteur peut planifier un rendez-vous pour l'usager. Pour ce faire, suivez le chemin suivant : Plages d'ouverture → Éditer ou créer une plage d'ouverture → Sélectionnez un motif avec la pastille \"En ligne\".",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "8ad79d8a-1bbb-4572-89e0-38e2614ad7e5",
    "type": "heading",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left",
      "level": 2
    },
    "content": [
      {
        "type": "text",
        "text": "En tant que prescripteur, comment planifier un rendez-vous pour un usager ?",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "4969af46-532a-4aba-9669-43f77109192e",
    "type": "heading",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left",
      "level": 3
    },
    "content": [
      {
        "type": "text",
        "text": "Je suis un agent ayant un compte RDVS et je souhaite planifier un rendez-vous sein d’une organisation de mon territoire (prescription interne)",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "342bfdb9-f02d-49ca-af36-9c0f6e887926",
    "type": "heading",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left",
      "level": 4
    },
    "content": [
      {
        "type": "text",
        "text": "Je souhaite faire de la prescription interne pour un usager identifié 👇",
        "styles": {
          "bold": true
        }
      }
    ],
    "children": []
  },
  {
    "id": "d6425d43-6971-4014-bb1c-9cb546da15e2",
    "type": "htmlEmbed",
    "props": {
      "html": "<video controls preload=\"metadata\" style=\"width:100%;max-width:720px\" src=\"https://files.gitbook.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FCZACpx16wwY8yODH1YeI%2Fuploads%2FnFOLvM6JphSLygk0uMId%2Ftest.mp4?alt=media&token=505c02b5-61c4-4396-ac6f-5af8ef9e47a3\"></video>"
    },
    "children": []
  },
  {
    "id": "bb94576f-d3c8-4129-82b4-5f3ce7fea4d6",
    "type": "paragraph",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "Dans le cadre d’un accompagnement, l’usager doit suivre un parcours de rendez-vous le renvoyant d’une organisation à une autre. Dans ce contexte, le point de départ est l’identification de l’usager. Vous pouvez donc réorienter l’usager auprès d’une autre organisation du territoire en suivant ce chemin :",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "3a0a13c9-233f-40d5-9fc2-38c97083e795",
    "type": "paragraph",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "Identifier un usager → Trouver un RDV → Cliquer sur “élargir votre recherche” → Sélectionner les informations du rendez-vous (motif, lieux, créneaux) → valider le RDV en cliquant sur “Confirmer le RDV”",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "db9315a9-130c-441d-b404-e4dd4d992c6f",
    "type": "dsfrAlert",
    "props": {
      "severity": "info",
      "small": true,
      "title": ""
    },
    "content": [
      {
        "type": "text",
        "text": "Nous vous encourageons à privilégier ce chemin lorsqu'un motif est soumis à une sectorisation",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "fc1bdb4e-7ce6-489b-a468-11fc92e61157",
    "type": "heading",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left",
      "level": 4
    },
    "content": [
      {
        "type": "text",
        "text": "Je souhaite faire de la prescription interne pour un usager non-identifié 👇",
        "styles": {
          "bold": true
        }
      }
    ],
    "children": []
  },
  {
    "id": "b9352f57-cd4e-410f-a3e5-eedee57d00a8",
    "type": "htmlEmbed",
    "props": {
      "html": "<video controls preload=\"metadata\" style=\"width:100%;max-width:720px\" src=\"https://files.gitbook.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FCZACpx16wwY8yODH1YeI%2Fuploads%2FR7lSbQLXElbCWk74E9pY%2F2.mp4?alt=media&token=8128ac9a-e443-4259-be4f-1156dcd79b4f\"></video>"
    },
    "children": []
  },
  {
    "id": "31d1e8e5-aab3-43e1-9724-99c196db90e7",
    "type": "paragraph",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "Dans le cas où le motif de consultation nécessite une obtention rapide du rendez-vous, il est possible de trouver un créneau disponible plus rapidement dans une organisation voisine. Pour proposer un créneau plus rapidement dans une organisation voisine, l’agent prescripteur interne peut emprunter le chemin suivant :",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "37b6dc97-3a3a-462e-a32d-890c37851050",
    "type": "paragraph",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "Dirigez-vous vers le bouton “Trouver un RDV” → cliquez sur “élargir votre recherche” → Sélectionnez les informations du rendez-vous (motif, lieu, créneaux et usagers) → validez le RDV en cliquant sur “Confirmer le RDV”.",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "9dd1f6e6-60ad-496d-aa18-73c63784faf2",
    "type": "dsfrAlert",
    "props": {
      "severity": "info",
      "small": true,
      "title": ""
    },
    "content": [
      {
        "type": "text",
        "text": "Nous vous encourageons à privilégier ce chemin pour offrir des disponibilités plus rapidement",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "92aa6146-0885-48b8-9d2a-c4804f3ec038",
    "type": "heading",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left",
      "level": 4
    },
    "content": [
      {
        "type": "text",
        "text": "Je souhaite planifier un rendez-vous pour un usager depuis un lien prescripteur 👇",
        "styles": {
          "bold": true
        }
      }
    ],
    "children": []
  },
  {
    "id": "12a4231d-13cb-4ccc-aeab-c5a19b3ffdcc",
    "type": "dsfrAlert",
    "props": {
      "severity": "success",
      "small": true,
      "title": ""
    },
    "content": [
      {
        "type": "text",
        "text": "Nouveauté ✨",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "8bee816b-3010-4f85-9179-9aaf634571eb",
    "type": "htmlEmbed",
    "props": {
      "html": "<video controls preload=\"metadata\" style=\"width:100%;max-width:720px\" src=\"https://files.gitbook.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FCZACpx16wwY8yODH1YeI%2Fuploads%2FMsnRJ4XM3Qns27yjixs6%2F3.mp4?alt=media&token=6daf58c1-df06-4e8f-832e-2cb3de8bd2cd\"></video>"
    },
    "children": []
  },
  {
    "id": "6c60a9e1-d504-48e3-9529-d95ceeef7b29",
    "type": "paragraph",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "À partir du lien prescripteur (",
        "styles": {}
      },
      {
        "type": "link",
        "href": "https://www.rdv-solidarites.fr/prendre_rdv?prescripteur=1",
        "content": [
          {
            "type": "text",
            "text": "https://www.rdv-solidarites.fr/prendre_rdv?prescripteur=1",
            "styles": {}
          }
        ]
      },
      {
        "type": "text",
        "text": "), vous avez également la possibilité de planifier un rendez-vous par prescription. Pour ce faire, il vous suffit d'entrer l'adresse postale de l'usager. Une fois cette adresse indiquée, sélectionnez le service, le motif, le lien et le créneau de rendez-vous. Après avoir saisi toutes ces informations, un bandeau vert vous propose de finaliser la prise de rendez-vous en cliquant sur \"cliquez ici ».Cette proposition n'apparaît que lorsque vous êtes connecté à votre compte agent et vous permet de vous identifier directement.",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "da2f068e-7b45-4bed-b006-24a2c4f884ef",
    "type": "paragraph",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "Vous serez alors redirigé vers une page qui conserve les informations préalablement sélectionnées, et vous pourrez clôturer la prise de rendez-vous en identifiant l'usager. Confirmez le rendez-vous.",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "a1df442b-84d5-412d-9c3c-0fe215fa0843",
    "type": "dsfrAlert",
    "props": {
      "severity": "info",
      "small": true,
      "title": ""
    },
    "content": [
      {
        "type": "text",
        "text": "Nous vous encourageons à privilégier ce chemin lorsque vous êtes déjà connecté sur RDV. En etant authentifié sur votre espace, vous n’aurez plus besoin d’indiquer vos coordonnées",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "0ab38b6b-1ca0-4ff1-9ab4-d2f32970aa48",
    "type": "heading",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left",
      "level": 3
    },
    "content": [
      {
        "type": "text",
        "text": "Je suis un agent sans compte RDVS et je souhaite planifier un rendez-vous auprès une organisation utilisatrice de RDVS",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "00ae0496-a1b8-4df1-97b9-5b638fcabaa6",
    "type": "heading",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left",
      "level": 4
    },
    "content": [
      {
        "type": "text",
        "text": "Je souhaite planifier un rendez-vous auprès d’une organisation utilisatrice de RDVS 👇",
        "styles": {
          "bold": true
        }
      }
    ],
    "children": []
  },
  {
    "id": "38783d36-b452-4c97-b1e0-5395bef54f23",
    "type": "paragraph",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "En tant qu’agent d’une organisation utilisatrice de RDVS, vous pouvez planifier des rendez-vous selon les disponibilités des agents RDVS pour les usagers.",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "e77db5a8-b5bd-4ccb-a748-75e9591a4f76",
    "type": "htmlEmbed",
    "props": {
      "html": "<video controls preload=\"metadata\" style=\"width:100%;max-width:720px\" src=\"https://files.gitbook.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FCZACpx16wwY8yODH1YeI%2Fuploads%2F6LqpkBISSeVJQjpAqaQk%2F4.mp4?alt=media&token=44a641dc-c71a-45e4-99ef-ef0b81eb9de3\"></video>"
    },
    "children": []
  },
  {
    "id": "3a72d41e-7810-490d-9af9-de9e9cb97480",
    "type": "paragraph",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "Il existe deux entrés pour accéder au parcours prise de rendez-vous :",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "a7bdcb4f-4159-444d-a3a9-2d7d9510596b",
    "type": "bulletListItem",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "le lien propre à l’organisation que l’agent peut vous communiquer",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "9d1e4ec6-d9c3-474b-b66e-e223cb4cfc04",
    "type": "bulletListItem",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "lien prescripteur : ",
        "styles": {}
      },
      {
        "type": "link",
        "href": "https://www.rdv-solidarites.fr/prendre_rdv?prescripteur=1",
        "content": [
          {
            "type": "text",
            "text": "https://www.rdv-solidarites.fr/prendre_rdv?prescripteur=1",
            "styles": {}
          }
        ]
      }
    ],
    "children": []
  },
  {
    "id": "1f88af3e-4bbb-40eb-9a81-5339fcceb352",
    "type": "paragraph",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "Une fois que vous avez reçu le lien, sélectionnez les éléments du rendez-vous dans cet ordre : le service, le motif, le lien, puis le créneau.",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "6d57494b-226a-4579-98fc-834bdea715ae",
    "type": "paragraph",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "Lors de l'identification, cliquez sur \"",
        "styles": {}
      },
      {
        "type": "text",
        "text": "Je suis un prescripteur orientant un bénéficiaire",
        "styles": {
          "bold": true
        }
      },
      {
        "type": "text",
        "text": "\" via ce lien. Ensuite, veuillez renseigner vos coordonnées. Le nom, le prénom et l'adresse e-mail professionnel sont des champs obligatoires. Quant au numéro de téléphone, il est fortement recommandé. Ces informations seront visibles par l'agent chargé de la gestion du rendez-vous, lui permettant ainsi de revenir vers le prescripteur en cas de questions sur le contexte du rendez-vous, par exemple.",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "701675c5-3a2a-475e-8b51-4ef898dfa5e7",
    "type": "paragraph",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "Ensuite, il est nécessaire de renseigner les coordonnées de l'usager et confirmer le rendez-vous. Une fois confirmé, vous recevrez une notification par e-mail pour confirmer cette mise en relation",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "d9cee219-3588-4b71-b80f-9f6e5d6207f6",
    "type": "heading",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left",
      "level": 2
    },
    "content": [
      {
        "type": "text",
        "text": "F.A.Q",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "c74c7154-257e-45fa-99e8-57ac3ee64c2c",
    "type": "heading",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left",
      "level": 3
    },
    "content": [
      {
        "type": "text",
        "text": "Qui reçoit les notifications pour les prises de rendez-vous par prescription ?",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "badd7db0-dcbe-463e-a951-119da26addcd",
    "type": "paragraph",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "La prescription implique trois acteurs : le prescripteur, l’usager et l’agent. Tous ces acteurs sont informés du rendez-vous par notifications.",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "024fefbb-6b95-443b-a245-3b15ae3ac519",
    "type": "bulletListItem",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "Le prescripteur reçoit une notification par e-mail confirmant le rendez-vous pour le patient.",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "84e75e58-5f9f-4db5-9aca-aef404d66e2a",
    "type": "bulletListItem",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "Le patient reçoit une confirmation de rendez-vous ainsi qu'un rappel 48 heures avant le rendez-vous avec le professionnel.",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "f968c556-64b5-4887-92d6-b560f709c96e",
    "type": "bulletListItem",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "Le professionnel voit le rendez-vous apparaître directement dans son agenda. Selon la configuration de synchronisation, il peut également recevoir un e-mail ou voir le rendez-vous être importé automatiquement dans son agenda externe.",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "fdf879a3-e4aa-4c49-92c3-68f8d6ba9ed7",
    "type": "heading",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left",
      "level": 3
    },
    "content": [
      {
        "type": "text",
        "text": "Est-il possible pour un prescripteur d’annuler ou de modifier un RDV ?",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "bbcffc68-9ff4-4806-8df2-acc5f6c40be8",
    "type": "paragraph",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "Une fois le rendez-vous planifié, le prescripteur peut annuler le rendez-vous :",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "7084e548-d958-48f9-9a07-1a85d6874627",
    "type": "bulletListItem",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "Directement sur la page de confirmation s'il se rend compte qu’il a fait une erreur",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "3ce4ca9a-f74a-467b-b8ea-e1ffe6cc33bb",
    "type": "bulletListItem",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "En suivant le lien qui lui a été transmis par mail",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "ad975c56-b971-4085-bb4e-a36f4ee74889",
    "type": "dsfrAlert",
    "props": {
      "severity": "info",
      "small": true,
      "title": ""
    },
    "content": [
      {
        "type": "text",
        "text": "Le prescripteur agissant pour le compte de l’usager, les conditions d’annulations sont les mêmes que quand l’usager annule de lui même.",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "62a185aa-2b3d-4b75-b500-5e84af4ae2a8",
    "type": "paragraph",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "La modification d'un rendez-vous n’est actuellement pas possible pour les prescripteurs.",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "a06976ba-8572-4b4b-bd6b-26c900783014",
    "type": "heading",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left",
      "level": 3
    },
    "content": [
      {
        "type": "text",
        "text": "Est-il possible de contacter un prescripteur ?",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "7f1ba507-a324-4813-9e3d-504e3f6c115f",
    "type": "paragraph",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "Dans le cas où l'agent a besoin de plus d'informations sur le contexte de la prise de rendez-vous, il peut contacter le prescripteur en utilisant les informations laissées par ce dernier (au minimum, son adresse e-mail professionnelle, et idéalement, son numéro de téléphone). L'agent peut retrouver les coordonnées du prescripteur en suivant ce chemin :",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "1d2e5391-290e-434b-ab73-266a60d9388f",
    "type": "paragraph",
    "props": {
      "backgroundColor": "default",
      "textColor": "default",
      "textAlignment": "left"
    },
    "content": [
      {
        "type": "text",
        "text": "Sélectionner le rendez-vous (soit en double-cliquant sur l’agenda, soit depuis la liste des RDV) → Dirigez-vous vers “Rendez-vous pris par” et cliquez sur le nom du prescripteur. Vous retrouvez l’identité ainsi que les informations pour contacter le prescripteur",
        "styles": {}
      }
    ],
    "children": []
  },
  {
    "id": "03a96ed1-1dae-4885-bb10-489b1fda867c",
    "type": "dsfrAccordionSection",
    "props": {},
    "content": [
      {
        "type": "text",
        "text": "voir le détail de rendez-vous 👇",
        "styles": {}
      }
    ],
    "children": [
      {
        "id": "11c23edf-e8a4-4c73-ba45-c8ea7b7c4567",
        "type": "image",
        "props": {
          "textAlignment": "left",
          "backgroundColor": "default",
          "name": "",
          "url": "./assets/scr-20251006-oimm.png",
          "caption": "",
          "showPreview": true
        },
        "children": []
      }
    ]
  }
]
-->
<h2 id="qu-est-ce-qu-est-la-prescription">Qu’est-ce qu’est la prescription ?</h2><img src="./assets/image-5.png" alt="" width="128"><p>RDV Solidarités a pour objectif de faciliter la mise en relation entre les usagers et les agents, ainsi qu'entre les agents de différentes structures et entités administratives. C’est dans ce contexte que la fonctionnalité de prescription a été pensée.</p><p>La prescription permet à un agent externe à l'organisation de planifier rendez-vous au nom de l’usager, en fonction des disponibilités de l'agent RDV Solidarités</p><p>À titre d'exemple, la prescription offre la possibilité à un agent de médiathèque (le prescripteur) à prendre rendez-vous pour un apprenant avec un conseiller numérique (l’agent RDV Solidarités).</p><p>Dans cette logique de mise en relation, la prescription peut prendre deux formes : la prescription interne et la prescription externe.</p><p>Globalement, la <strong>prescription interne</strong> concerne les agents utilisateurs de RDV Solidarités (ayant un compte) qui souhaitent orienter un usager vers une structure à laquelle l'agent planifiant le rendez-vous n'appartient pas.</p><p>Quant à la <strong>prescription externe</strong>, elle s'adresse aux agents qui n'ont pas de compte RDV Solidarités mais qui sont amenés à planifier des rendez-vous de manière régulière pour les usagers en fonction des disponibilités des agents utilisateurs de RDV Solidarités.</p><h2 id="en-tant-qu-administrateur-comment-rendre-les-creneaux-de-reservation-en-ligne-disponibles-pour-les-prescripteurs">En tant qu’administrateur, comment rendre les créneaux de réservation en ligne disponibles pour les prescripteurs ?</h2><img src="./assets/image.png" alt="" width="128"><p>Tout comme l’ouverture en ligne aux usagers, proposer des créneaux de prise de rendez-vous aux prescripteurs nécessites deux conditions :</p><ul><li><p>motif ouvert en ligne : Veuillez suivre le chemin suivant : Paramètres → Motifs → Éditer ou créer un motif → Onglet "Réservation en ligne" → Cochez la deuxième proposition dans l'encadré "Réservation en ligne".</p></li><li><p>plage d’ouverture : Définissez la plage d'ouverture durant laquelle le prescripteur peut planifier un rendez-vous pour l'usager. Pour ce faire, suivez le chemin suivant : Plages d'ouverture → Éditer ou créer une plage d'ouverture → Sélectionnez un motif avec la pastille "En ligne".</p></li></ul><h2 id="en-tant-que-prescripteur-comment-planifier-un-rendez-vous-pour-un-usager">En tant que prescripteur, comment planifier un rendez-vous pour un usager ?</h2><h3 id="je-suis-un-agent-ayant-un-compte-rdvs-et-je-souhaite-planifier-un-rendez-vous-sein-d-une-organisation-de-mon-territoire-prescription-interne">Je suis un agent ayant un compte RDVS et je souhaite planifier un rendez-vous sein d’une organisation de mon territoire (prescription interne)</h3><h4 id="je-souhaite-faire-de-la-prescription-interne-pour-un-usager-identifie"><strong>Je souhaite faire de la prescription interne pour un usager identifié 👇</strong></h4><video controls="" preload="metadata" style="width:100%;max-width:720px" src="https://files.gitbook.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FCZACpx16wwY8yODH1YeI%2Fuploads%2FnFOLvM6JphSLygk0uMId%2Ftest.mp4?alt=media&amp;token=505c02b5-61c4-4396-ac6f-5af8ef9e47a3"></video><p>Dans le cadre d’un accompagnement, l’usager doit suivre un parcours de rendez-vous le renvoyant d’une organisation à une autre. Dans ce contexte, le point de départ est l’identification de l’usager. Vous pouvez donc réorienter l’usager auprès d’une autre organisation du territoire en suivant ce chemin :</p><p>Identifier un usager → Trouver un RDV → Cliquer sur “élargir votre recherche” → Sélectionner les informations du rendez-vous (motif, lieux, créneaux) → valider le RDV en cliquant sur “Confirmer le RDV”</p><div class="fr-alert fr-alert--info fr-alert--sm" role="status"><p>Nous vous encourageons à privilégier ce chemin lorsqu'un motif est soumis à une sectorisation</p></div><h4 id="je-souhaite-faire-de-la-prescription-interne-pour-un-usager-non-identifie"><strong>Je souhaite faire de la prescription interne pour un usager non-identifié 👇</strong></h4><video controls="" preload="metadata" style="width:100%;max-width:720px" src="https://files.gitbook.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FCZACpx16wwY8yODH1YeI%2Fuploads%2FR7lSbQLXElbCWk74E9pY%2F2.mp4?alt=media&amp;token=8128ac9a-e443-4259-be4f-1156dcd79b4f"></video><p>Dans le cas où le motif de consultation nécessite une obtention rapide du rendez-vous, il est possible de trouver un créneau disponible plus rapidement dans une organisation voisine. Pour proposer un créneau plus rapidement dans une organisation voisine, l’agent prescripteur interne peut emprunter le chemin suivant :</p><p>Dirigez-vous vers le bouton “Trouver un RDV” → cliquez sur “élargir votre recherche” → Sélectionnez les informations du rendez-vous (motif, lieu, créneaux et usagers) → validez le RDV en cliquant sur “Confirmer le RDV”.</p><div class="fr-alert fr-alert--info fr-alert--sm" role="status"><p>Nous vous encourageons à privilégier ce chemin pour offrir des disponibilités plus rapidement</p></div><h4 id="je-souhaite-planifier-un-rendez-vous-pour-un-usager-depuis-un-lien-prescripteur"><strong>Je souhaite planifier un rendez-vous pour un usager depuis un lien prescripteur 👇</strong></h4><div class="fr-alert fr-alert--success fr-alert--sm" role="status"><p>Nouveauté ✨</p></div><video controls="" preload="metadata" style="width:100%;max-width:720px" src="https://files.gitbook.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FCZACpx16wwY8yODH1YeI%2Fuploads%2FMsnRJ4XM3Qns27yjixs6%2F3.mp4?alt=media&amp;token=6daf58c1-df06-4e8f-832e-2cb3de8bd2cd"></video><p>À partir du lien prescripteur (<a href="https://www.rdv-solidarites.fr/prendre_rdv?prescripteur=1" target="_blank" rel="noopener noreferrer nofollow">https://www.rdv-solidarites.fr/prendre_rdv?prescripteur=1</a>), vous avez également la possibilité de planifier un rendez-vous par prescription. Pour ce faire, il vous suffit d'entrer l'adresse postale de l'usager. Une fois cette adresse indiquée, sélectionnez le service, le motif, le lien et le créneau de rendez-vous. Après avoir saisi toutes ces informations, un bandeau vert vous propose de finaliser la prise de rendez-vous en cliquant sur "cliquez ici ».Cette proposition n'apparaît que lorsque vous êtes connecté à votre compte agent et vous permet de vous identifier directement.</p><p>Vous serez alors redirigé vers une page qui conserve les informations préalablement sélectionnées, et vous pourrez clôturer la prise de rendez-vous en identifiant l'usager. Confirmez le rendez-vous.</p><div class="fr-alert fr-alert--info fr-alert--sm" role="status"><p>Nous vous encourageons à privilégier ce chemin lorsque vous êtes déjà connecté sur RDV. En etant authentifié sur votre espace, vous n’aurez plus besoin d’indiquer vos coordonnées</p></div><h3 id="je-suis-un-agent-sans-compte-rdvs-et-je-souhaite-planifier-un-rendez-vous-aupres-une-organisation-utilisatrice-de-rdvs">Je suis un agent sans compte RDVS et je souhaite planifier un rendez-vous auprès une organisation utilisatrice de RDVS</h3><h4 id="je-souhaite-planifier-un-rendez-vous-aupres-d-une-organisation-utilisatrice-de-rdvs"><strong>Je souhaite planifier un rendez-vous auprès d’une organisation utilisatrice de RDVS 👇</strong></h4><p>En tant qu’agent d’une organisation utilisatrice de RDVS, vous pouvez planifier des rendez-vous selon les disponibilités des agents RDVS pour les usagers.</p><video controls="" preload="metadata" style="width:100%;max-width:720px" src="https://files.gitbook.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FCZACpx16wwY8yODH1YeI%2Fuploads%2F6LqpkBISSeVJQjpAqaQk%2F4.mp4?alt=media&amp;token=44a641dc-c71a-45e4-99ef-ef0b81eb9de3"></video><p>Il existe deux entrés pour accéder au parcours prise de rendez-vous :</p><ul><li><p>le lien propre à l’organisation que l’agent peut vous communiquer</p></li><li><p>lien prescripteur : <a href="https://www.rdv-solidarites.fr/prendre_rdv?prescripteur=1" target="_blank" rel="noopener noreferrer nofollow">https://www.rdv-solidarites.fr/prendre_rdv?prescripteur=1</a></p></li></ul><p>Une fois que vous avez reçu le lien, sélectionnez les éléments du rendez-vous dans cet ordre : le service, le motif, le lien, puis le créneau.</p><p>Lors de l'identification, cliquez sur "<strong>Je suis un prescripteur orientant un bénéficiaire</strong>" via ce lien. Ensuite, veuillez renseigner vos coordonnées. Le nom, le prénom et l'adresse e-mail professionnel sont des champs obligatoires. Quant au numéro de téléphone, il est fortement recommandé. Ces informations seront visibles par l'agent chargé de la gestion du rendez-vous, lui permettant ainsi de revenir vers le prescripteur en cas de questions sur le contexte du rendez-vous, par exemple.</p><p>Ensuite, il est nécessaire de renseigner les coordonnées de l'usager et confirmer le rendez-vous. Une fois confirmé, vous recevrez une notification par e-mail pour confirmer cette mise en relation</p><h2 id="f-a-q">F.A.Q</h2><h3 id="qui-recoit-les-notifications-pour-les-prises-de-rendez-vous-par-prescription">Qui reçoit les notifications pour les prises de rendez-vous par prescription ?</h3><p>La prescription implique trois acteurs : le prescripteur, l’usager et l’agent. Tous ces acteurs sont informés du rendez-vous par notifications.</p><ul><li><p>Le prescripteur reçoit une notification par e-mail confirmant le rendez-vous pour le patient.</p></li><li><p>Le patient reçoit une confirmation de rendez-vous ainsi qu'un rappel 48 heures avant le rendez-vous avec le professionnel.</p></li><li><p>Le professionnel voit le rendez-vous apparaître directement dans son agenda. Selon la configuration de synchronisation, il peut également recevoir un e-mail ou voir le rendez-vous être importé automatiquement dans son agenda externe.</p></li></ul><h3 id="est-il-possible-pour-un-prescripteur-d-annuler-ou-de-modifier-un-rdv">Est-il possible pour un prescripteur d’annuler ou de modifier un RDV ?</h3><p>Une fois le rendez-vous planifié, le prescripteur peut annuler le rendez-vous :</p><ul><li><p>Directement sur la page de confirmation s'il se rend compte qu’il a fait une erreur</p></li><li><p>En suivant le lien qui lui a été transmis par mail</p></li></ul><div class="fr-alert fr-alert--info fr-alert--sm" role="status"><p>Le prescripteur agissant pour le compte de l’usager, les conditions d’annulations sont les mêmes que quand l’usager annule de lui même.</p></div><p>La modification d'un rendez-vous n’est actuellement pas possible pour les prescripteurs.</p><h3 id="est-il-possible-de-contacter-un-prescripteur">Est-il possible de contacter un prescripteur ?</h3><p>Dans le cas où l'agent a besoin de plus d'informations sur le contexte de la prise de rendez-vous, il peut contacter le prescripteur en utilisant les informations laissées par ce dernier (au minimum, son adresse e-mail professionnelle, et idéalement, son numéro de téléphone). L'agent peut retrouver les coordonnées du prescripteur en suivant ce chemin :</p><p>Sélectionner le rendez-vous (soit en double-cliquant sur l’agenda, soit depuis la liste des RDV) → Dirigez-vous vers “Rendez-vous pris par” et cliquez sur le nom du prescripteur. Vous retrouvez l’identité ainsi que les informations pour contacter le prescripteur</p><div class="fr-accordions-group"><section class="fr-accordion"><h3 class="fr-accordion__title"><button type="button" class="fr-accordion__btn" aria-expanded="false" aria-controls="acc-03a96ed1-1dae-4885-bb10-489b1fda867c">voir le détail de rendez-vous 👇</button></h3><div class="fr-collapse" id="acc-03a96ed1-1dae-4885-bb10-489b1fda867c"><img src="./assets/scr-20251006-oimm.png" alt=""></div></section></div>
