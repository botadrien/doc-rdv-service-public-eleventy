---
title: Dépôt et Architecture
layout: layouts/page.njk
eleventyNavigation:
  key: Dépôt et Architecture
  parent: Documentation technique
  order: 2
showBreadcrumb: true
---
Vous trouverez ci-dessous l'accès au dépôt de code public et l'architecture technique de l'application :

{% from "components/component.njk" import component with context %}
<div class="fr-grid-row fr-grid-row--gutters fr-my-4w">
  <div class="fr-col-12 fr-col-md-6">
  {{ component("tile", { url: false, externalUrl: "https://github.com/betagouv/rdv-service-public", title: "Consulter le dépôt de code", description: "" }) }}
  </div>
  <div class="fr-col-12 fr-col-md-6">
  {{ component("tile", { url: false, externalUrl: "https://github.com/betagouv/rdv-service-public/blob/production/docs/architecture-technique.md", title: "Consulter l'architecture technique", description: "" }) }}
  </div>
</div>
