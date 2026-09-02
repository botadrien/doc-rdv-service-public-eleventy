---
title: Aide de RDV Service Public
layout: layouts/home.njk
eleventyNavigation:
  key: Accueil
  order: 1
---

<div class="fr-p-4w fr-mb-6w fr-background-alt--blue-cumulus">
  <h1>Centre d'aide de RDV Service Public</h1>
  <p class="fr-text--lead">Tutoriels, guides de configuration et réponses aux questions
    les plus fréquentes pour prendre en main RDV Service Public.</p>
</div>

<div class="fr-mb-6w">

## Bien démarrer 🌱

Vous souhaitez déployer notre solution dans votre équipe ? Pour bien démarrer, nous vous recommandons de lire les bonnes pratiques du déploiement. Changer d’outil, ce n’est pas seulement une configuration technique, c’est aussi une transformation des pratiques quotidiennes !

{% from "components/component.njk" import component with context %}
<div class="fr-grid-row fr-grid-row--gutters fr-my-4w">
  <div class="fr-col-12 fr-col-md-6">
  {{ component("tile", { url: "/accompagner-le-changement/etape-par-etape/", title: "Étape par étape", description: "Quelques conseils et bonnes pratiques pour le déploiement" }) }}
  </div>
</div>

## Bien configurer ⚙️

Vous venez de créer un compte RDV Service Public ? Pour configurer la solution, nous vous invitons à consulter nos guides par rôle ci-dessous. Ils regroupent : des tutoriels pas-à-pas, des réponses aux questions les plus fréquentes, des explications adaptées à votre profil d’utilisateur. Idéal pour faire vos premiers pas sereinement dans la solution !

{% from "components/component.njk" import component with context %}
<div class="fr-grid-row fr-grid-row--gutters fr-my-4w">
  <div class="fr-col-12 fr-col-md-4">
  {{ component("tile", { url: "/documentation-utilisateur/gerer-et-planifier-des-rendez-vous/", title: "Gérer et planifier des rendez-vous", description: "Comprendre les fonctionnalités essentielles de la gestion des rendez-vous." }) }}
  </div>
  <div class="fr-col-12 fr-col-md-4">
  {{ component("tile", { url: "/documentation-utilisateur/configurer-son-organisation/", title: "Configurer une organisation", description: "Comprendre les options des motifs, des agents et de la réservation en ligne." }) }}
  </div>
  <div class="fr-col-12 fr-col-md-4">
  {{ component("tile", { url: "/documentation-utilisateur/configurer-son-espace/", title: "Gérer et configurer son espace", description: "Comprendre les options d'un espace, des organisations et des services." }) }}
  </div>
</div>

## Aller plus loin 🙌

Vous disposez déjà d’un compte et souhaitez aller plus loin grâce à une intégration ? Vous pouvez consulter nos guides et tutoriels dédiés pour vous accompagner pas à pas dans la mise en place et l’utilisation de ces fonctionnalités avancées.

{% from "components/component.njk" import component with context %}
<div class="fr-grid-row fr-grid-row--gutters fr-my-4w">
  <div class="fr-col-12 fr-col-md-6">
  {{ component("tile", { url: "/integration/formulaire/", title: "Démarche Simplifiée", description: "Associer des formulaires à la gestion des rendez-vous" }) }}
  </div>
  <div class="fr-col-12 fr-col-md-6">
  {{ component("tile", { url: "/integration/titres-securises/", title: "France Titres", description: "Brancher vos disponiblités au moteur de recherche national" }) }}
  </div>
</div>

:::info
Si vous ne trouvez pas de réponses à vos questions vous souhaitez suggérer des modifications, contactez nous : **support@rdv-service-public.fr**
:::


</div>
