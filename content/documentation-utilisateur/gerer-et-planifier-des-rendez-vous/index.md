---
title: Gérer et planifier des rendez-vous
layout: layouts/page.njk
eleventyNavigation:
  key: Gérer et planifier des rendez-vous
  parent: Documentation utilisateur
  order: 4
showBreadcrumb: true
---
Tous les agents de la solution peuvent utiliser les fonctionnalités de gestion et de prise de rendez-vous. Cette page est donc à destination de tous les utilisateurs RDV Service Public !

Vous trouverez ici une aide et des explications sur les fonctionnalités de la solution. Vous pouvez consultez le **guide** ou les **questions fréquentes**.

{% from "components/component.njk" import component with context %}
<div class="fr-grid-row fr-grid-row--gutters fr-my-4w">
  <div class="fr-col-12 fr-col-md-6">
  {{ component("tile", { url: false, externalUrl: "https://www.canva.com/design/DAG12n5tsJk/4DdLZlT4eyfrV6nUboI5mQ/view?utm_content=DAG12n5tsJk&#x26;utm_campaign=designshare&#x26;utm_medium=link2&#x26;utm_source=uniquelinks&#x26;utlId=ha4d852eef7", title: "Tutoriel ↗", description: "Un tutoriel pas à pas pour comprendre les fonctionnalités essentielles", pictogram: "leisure/book.svg" }) }}
  </div>
</div>

????accordionsgroup

???À quoi servent les plages d'ouvertures ?

Les plages d'ouverture vous permettent de définir vos disponibilités.

\
Ces plages d'ouverture permettent aux autres agents de votre organisation de prendre des rendez-vous pour les usagers sur vos disponibilités via le bouton _**Trouver un RDV**_. Si votre organisation publie ses disponibilités en ligne, ces créneaux seront également visibles pour les usagers.

:::success
Chaque plage d'ouverture doit être associée à un ou plusieurs motifs de rendez-vous préalablement créés par les **Agents Admin** liés à votre service.
:::

Vous pouvez créer :

* **Des plages d'ouverture permanentes** : en configurant une répétition sur plusieurs jours de la semaine. Si aucune date de fin n'est précisée, la plage sera répétée de manière illimitée.
* **Des plages d'ouverture exceptionnelles** : en créant des disponibilités ponctuelles, sans répétition.

???

???Comment gérer mon agenda en cas d'une indisponiblité ponctuelle ?

Les indisponibilités vous permettent de fermer vos permanences de manière ponctuelle, par exemple en cas de congés, de formation ou d'absence exceptionnelle.

Les créneaux marqués comme indisponibles ne seront plus accessibles à la réservation pour les autres agents de votre organisation ni pour les usagers.

Vous avez également la possibilité de programmer des indisponibilités récurrentes.

:::error
**Si vous créez une indisponibilité sur une permanence où des rendez-vous sont déjà planifiés, ceux-ci ne seront pas annulés automatiquement. Vous devrez les annuler manuellement.**
:::

:::success
**Les jours fériés du calendrier français sont automatiquement paramétrés comme indisponibles dans la solution. Vous n'avez donc pas besoin de les ajouter manuellement.**
:::

???

???Comment recevoir des alertes de prise de rendez-vous dans mon agenda ?

Vous pouvez configurer vos préférences de notification depuis la configuration de votre compte. En cliquant sur votre nom et prénom en haut à droite, vous accéderez à votre espace _**Mon compte**_.

Depuis ce menu, vous pouvez configurer vos préférences de notiffication. Plusieurs options s'offrent à vous. Vous pouvez recevoir des notifications par email lorsqu’un rendez-vous est ajouté, modifié ou annulé dans un agenda. Elle répond au besoin des agents souhaitant être alertés en cas de changement dans leur planning.

Chaque email contient une pièce jointe au format `.xls`, compatible avec la plupart des logiciels de calendrier. Votre calendrier externe reconnaîtra automatiquement ces mises à jour, bien que certains logiciels demandent une validation manuelle des modifications.

???

???Comment retrouver l'historique de rendez-vous d'un usager ?

Le menu _Usagers_ vous permet de rechercher, par nom, les usagers ayant eu ou ayant un rendez-vous à venir au sein de votre service.

En accédant à la fiche d’un usager, vous pourrez consulter :

* Ses informations générales (nom, coordonnées, etc.) ;
* L’historique de ses rendez-vous passés ;
* Ses rendez-vous à venir ;
* Des statistiques liées à ses prises de rendez-vous (nombre de rendez-vous, annulations, etc.).

???

???Comment exporter une liste de rendez-vous ?

En tant qu’agent, vous pouvez exporter les rendez-vous :

* associés à votre service.
* auxquels vous êtes personnellement assigné.

Ces exports sont possibles depuis le menu _**Liste des RDV**_. La liste des rendez-vous peut être filtrée selon plusieurs critères : agent, motif, période ... Une fois le filtre appliqué, vous pouvez exporter la liste au format `.xls` ou au format `.pdf` .

Les fichiers générés sont accessibles dans le menu _**Mon compte**_.<br>

???

???Comment les usagers prennent-il rendez-vous ?

Les usagers peuvent prendre rendez-vous en ligne si cette option est activée et que vous avez partagé votre lien de réservation. Ce lien peut être diffusé sur votre site web ou tout autre support.

Une fois sur la plateforme, ils pourront :

* Choisir un service et un motif de rendez-vous.
* Sélectionner un créneau disponible
* S’identifier pour confirmer leur rendez-vous.

Deux options d’identification :

1. **FranceConnect** : les informations de contact sont récupérées automatiquement. C'est le parcours le plus rapide et sécurisé.
2. **Création de compte** : si l’usager ne passe pas par FranceConnect, il doit renseigner son nom, prénom, email et (optionnellement) son numéro de téléphone. Un email de vérification lui sera envoyé, et en cliquant sur le lien de vérificatio présent dans le mail, il sera redirigé vers son parcours et pourra finaliser son rendez-vous.

???

???Qui peut voir et modifier mon agenda ?

Par défaut, seuls les agents de votre service et de votre organisation peuvent consulter et planifier des rendez-vous dans votre agenda. Un agent admin pourra quant à lui visualiser et modifier tous les agendas de tous les services d'une organisation.

:::success
**Si vous devez partager votre agenda avec un agent d'un autre service, un agent admin devra lui donner accès à votre service.**
:::

???

???Comment trouver une disponibilité auprès d'un agent ?

Le bouton _**Trouver un rendez-vous**_ permet de rechercher rapidement des disponibilités dans votre organisation ou service, évitant ainsi une consultation manuelle des agendas.

Pour utiliser cette fonctionnalité :

* Cliquez sur _**Trouver un rendez-vous**_ pour accéder au moteur de recherche.
* Spécifiez vos critères : service, motif, agent, lieu et date.
* Cliquez sur _**Afficher les créneaux**_ pour voir les disponibilités correspondantes.

Conditions d’accès :

* Disponible uniquement si les agents ont configuré leurs plages d’ouverture.
* **Administrateurs et secrétariats** : accès à toutes les disponibilités.
* **Agents simples** : accès uniquement aux créneaux de leur service.

Si plusieurs agents sont disponibles sur le même créneau et motif, la première disponibilité enregistrée sera sélectionnée.

???

???Comment gérer un doublon de fiche usager ?

Les doublons peuvent apparaître lorsque :

* Un professionnel crée une fiche **sans e-mail**, puis l’usager crée un compte avec une adresse e-mail.
* Une faute de frappe lors d’une recherche fait croire qu’aucune fiche n’existe.

**L’outil ne fusionne pas automatiquement les fiches, car l’unicité repose uniquement sur l’e-mail.**

Pour fusionner des fiches usagers :

* Accéder au menu _**Usagers**_.
* Cliquer sur _**Fusionner deux usagers**_.
* Entrer le nom de l’usager en double dans chaque colonne.
* Comparez les fiches : **Différences en orange**, **similitudes en vert**.
* Sélectionnez les informations à conserver.
* Validez pour créer une **fiche unique fusionnée**.

???

????
