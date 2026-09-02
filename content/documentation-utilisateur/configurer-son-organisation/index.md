---
title: Configurer son organisation
layout: layouts/page.njk
eleventyNavigation:
  key: Configurer son organisation
  parent: Documentation utilisateur
  order: 3
showBreadcrumb: true
---
En tant qu’**Agent Admin**, votre rôle est de configurer votre organisation. Vos options de configuration sont au plus proche des besoins métiers. Votre configuration assure à vos équipes les conditions nécessaires pour travailler simplement et répondre aux besoins des usagers.

Vous trouverez ici une aide et des explications sur la configuration d'une organisation. Vous pouvez consultez le **guide** ou les **questions fréquentes**.

{% from "components/component.njk" import component with context %}
<div class="fr-grid-row fr-grid-row--gutters fr-my-4w">
  <div class="fr-col-12 fr-col-md-6">
  {{ component("tile", { url: false, externalUrl: "https://www.canva.com/design/DAGz5MMraCA/tKSSSeonoaIX5HDmJZTsjA/view?utm_content=DAGz5MMraCA&#x26;utm_campaign=designshare&#x26;utm_medium=link2&#x26;utm_source=uniquelinks&#x26;utlId=h6bddb23c9b", title: "Tutoriel ↗", description: "Découvrez étape par étape les options de configuration d'une organisation", pictogram: "leisure/book.svg" }) }}
  </div>
</div>

????accordionsgroup

???Quels sont les différents niveaux d'accès ?

Vous pouvez ouvrir des accès aux agents de votre administration. Les agents pourront alors disposer d'un compte RDV Service Public on se connectant via un email et un mot de passe ou en utilisant [ProConnect](https://www.proconnect.gouv.fr).

Vous trouverez des options de configurations organisées en 2 étapes :

#### Niveau de permissions

Lors de l’invitation d’un agent, vous devez définir son niveau de permission :

**Basique**\
Ce niveau permet à l’agent de :

* Gérer ses propres plages d’ouverture, indisponibilités et rendez-vous ;
* Gérer les rendez-vous des agents appartenant au **même service**.

:::warning
**L’agent basique n’a pas accès au menu **_**Configuration**_**, et ne peut donc pas modifier les paramètres de l’organisation.**
:::

**Administrateur**\
Ce niveau donne à l’agent des droits étendus :

* Accès à l’agenda **de tous les agents** de l’organisation, quel que soit leur service ;
* Possibilité de modifier les plages d’ouverture, les indisponibilités et les rendez-vous de tous les agents ;
*   Accès au menu _**Configuration**_, lui permettant de :

    * Inviter d'autres agents ;
    * Créer et modifier des motifs de rendez-vous ;
    * Ajouter des lieux de permanences;
    * Modifier les informations de l'organisation.

**Intervenant**

Le statut intervenant fonctionne différemment des deux précédents :

* Il **n’est pas lié à une adresse e-mail** ;
* Sa création génère un **agenda autonome**, que vous pouvez nommer librement ;
* Cet agenda est ensuite **géré par les autres agents** de l’organisation.

Ce statut est idéal pour des **partenaires externes** effectuant des permanences ponctuelles dans votre structure. Bien qu’ils ne possèdent pas de compte **RDV Service Public**, les rendez-vous peuvent tout de même être pris sur cet agenda intervenant.

#### Permissions supplémentaires

**Agent d’accueil**

Un agent d’accueil (anciennement agent étant effecté au service secrétariat), peut :

* Accéder à l’agenda **de tous les agents** de l’organisation, quel que soit leur service ;
* **Gérer les rendez-vous de tous les agents** de l’organisation.

#### **Services**

Après avoir défini le niveau de droit et renseigné l’adresse e-mail ou un nom, vous devez l’associer au service auquel il est rattaché. Rattacher un agent à un service, c'est lui donner accès aux motifs et aux agendas agents associés à ce service.

:::success
**Il est possible de rattacher un agent à plusieurs services**.
:::

:::error
**Une fois cette étape validée, il ne sera plus possible de modifier les services associés à l’agent.**
:::

Si un changement est nécessaire :

* Contactez l’**Administrateur d'Espace** de votre compte **RDV Service Public** ;
* Ou supprimez l’agent concerné, puis recommencez l’invitation avec les bons paramètres.

???

???Puis-je configurer plusieurs lieux ?

Les lieux permettent d'associer les disponiblités des plages d'ouvertures des agents à des adresses de rendez-vous.

:::success
**L'adresse du rendez-vous est communiquée dans chaque notification SMS et emails**
:::

Vous pouvez créer **autant de lieux que nécessaire** pour votre organisation. Cette fonctionnalité vous permet d’ajouter des lieux **supplémentaires**, en plus du **lieu principal.**

Cela est particulièrement utile si :

* Vos agents sont en **itinérance** ;
* Vous disposez de **plusieurs points d’accueil** pour les usagers.

Une fois les lieux créés, les agents pourront **associer leurs plages d’ouverture** aux différents lieux configurés.

???

???À quoi sert la configuration des informations de l'organisation ?

Depuis le menu **Configuration**, les agents administrateurs peuvent accéder à la section **Informations de l’organisation** et y compléter plusieurs champs.

Une fois renseignées, ces informations seront **mises à disposition des usagers**, notamment en cas de :

* difficulté à annuler leur rendez-vous en autonomie,
* besoin d’informations complémentaires,
* demande de modification, etc.

Ces éléments seront ensuite visibles dans les **récapitulatifs de rendez-vous**, accessibles depuis les **notifications email ou SMS**, afin de faciliter la prise de contact si nécessaire.

???

???La prise de rendez-vous en ligne est-elle obligatoire ?

Vous gardez la main sur l'ouverture ou non de la prise de rendez-vous en ligne par vos usagers.

:::success
**Cette fonctionnalité est désactivée par défaut. Vous pouvez l'activer motif par motif.**
:::

Pour permettre la **prise de rendez-vous en ligne**, deux conditions doivent être remplies :

1. Avoir créé un ou plusieurs **motifs de rendez-vous en ligne** ;
2. **Associer ces motifs** à des **plages d’ouverture**.

Une fois ces conditions remplies, rendez-vous dans le **menu **_**Configuration**_, onglet _**Réservation en ligne**._\
Vous y trouverez un **lien URL unique** : c’est par ce lien que les usagers pourront prendre rendez-vous avec votre organisation.

Vous pouvez diffuser cet URL sur :

* Votre **site internet** ;
* Vos communications par **e-mail** ;
* Tout autre support destiné à informer les usagers.

???

???Comment modifier le service d'un agent ?

Seul un agent admin d'espace peut modifier le service d'un agent. En effet, l'invitation est possible pour un agent admin. Mais la modification, pour sécuriser l'accès aux données des usagers, est restreinte au rôle agent admin d'espace. Votre référent agent admin d'espace pourra :alors

* Accéder à son _**Espace Admin**_
* Cliquer sur _**agent**_ et sélectionner _**modifier**_
* Associer l'agent à un ou plusieurs services pour définir ses droits d'accès

???

???À quoi servent les services et comment les activer ?

Les **services** servent à organiser votre espace et vos organisations en sous-ensembles distincts, chacun avec ses propres **agents** et **motifs**. Concrètement, ils permettent :

* **le cloisonnement** : séparer les activités pour que chaque service ait ses propres règles, agents et motifs.
* **la visibilité** : donner à chaque agent une vue adaptée à son service, sans être noyé dans l’ensemble des motifs et informations de toute l'organisation.

:::warning
Seul un agent admin d'espace peut activer les services. Il devra les configurer depuis son Espace Admin.
:::

Sans **services** activés :

* Tous les agents voient l’ensemble des motifs de rendez-vous.
* Par exemple, un agent de l’état civil pourrait avoir accès à des demandes liées à l’urbanisme ou à la petite enfance, ce qui peut générer de la confusion.

Avec **services** activés :

* Vous pouvez créer un **service État civil**, un **service Urbanisme**, un **service Petite enfance.**
* Chaque service dispose de ses propres **motifs** (par exemple : “Demande de carte d’identité” pour l’État civil, “Permis de construire” pour l’Urbanisme).
* Vous associez ensuite vos **agents** aux services concernés : les agents de l’État civil ne verront que les motifs qui leur sont liés, et ainsi de suite.

???

????
:::success
Vous trouverez également des informations complémentaires dans la [**Foire Aux Questions**](/documentation-utilisateur/faq/)
:::
