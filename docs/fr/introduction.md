---
title: Introduction
description: Ce qu'est NoMoreRP et comment ses packages s'assemblent.
---

# Introduction

NoMoreRP est une **base de gamemode roleplay open-source pour [nanos world](https://nanos.world)**, écrite en Lua.

Elle offre aux créateurs de serveur une fondation propre et modulaire — une architecture **MVC** orientée objet, câblée par un **loader + un registre d'injection de dépendances** — pour que tu passes ton temps à construire ton gamemode plutôt que la tuyauterie qui le porte.

## La philosophie

NoMoreRP est **un framework, pas un tas de scripts**. Tout est découpé en petits packages autonomes et sans dépendances, que tu adoptes en entier ou pièce par pièce. Chaque package est son propre dépôt nanos world, publié sous licence MIT.

- **Modulaire** — prends toute la stack, ou juste la lib de promesses.
- **Sans dépendances** — aucun module Lua externe ; chaque package embarque ce qu'il lui faut.
- **Typé** — entièrement annoté avec LuaCATS pour un vrai autocomplete et du type-checking dans ton éditeur.
- **Bilingue par conception** — aucune chaîne visible par le joueur n'est codée en dur ; tout passe par le système de localisation.

## L'écosystème

La stack est empilée des primitives bas niveau jusqu'au gamemode lui-même :

| Package | Couche | Rôle |
|---|---|---|
| [`nmrp-promise`](/promise) | async | Promesses dignes de JS pour Lua — `async` / `await`, combinateurs. |
| [`nmrp-norm`](/norm) | base de données | ORM côté serveur (Norm) — modèles, relations, migrations. |
| [`nmrp-rpc`](/rpc) | réseau | RPC requête/réponse basé sur des promesses, serveur ↔ client. |
| [`nmrp-locale`](/locale) | i18n | Localisation partagée pour Lua **et** WebUI. |
| [`nmrp`](/nmrp) | game-mode | La base MVC qui relie le tout. |
| [`nmrp-character-needs`](/character-needs) | add-on | Jauges de survie (stamina aujourd'hui) au-dessus du core. |
| [`nmrp-ui`](/ui) | UI | Le WebUI HUD + inventaire, construit avec Svelte. |
| [`light-class`](/light-class) | utilitaire | La micro-lib OOP sur laquelle tout le reste repose. |

## L'architecture en un coup d'œil

Le gamemode range chaque fichier dans l'un de trois **realms** :

- **`Server/`** — autorité, base de données, logique métier.
- **`Client/`** — UI (WebUI / Svelte), entrées, rendu.
- **`Shared/`** — code chargé dans les **deux** VMs (librairies, classes, helpers, globales).

Côté serveur, les fonctionnalités sont organisées en **modules MVC** câblés par injection de dépendances : un modèle définit les données, un service porte la logique, et un contrôleur le relie au moteur. La page [nmrp](/nmrp) détaille tout ça.

## Par où continuer

- **Nouveau ici ?** Commence par [Installation](/installation) pour faire tourner un serveur.
- **Juste une lib ?** Chaque page de package est autonome — va directement à [nmrp-promise](/promise), [nmrp-rpc](/rpc), [nmrp-norm](/norm) ou [nmrp-locale](/locale).
- **Un gamemode complet ?** Lis [nmrp](/nmrp) pour le modèle MVC + DI.

> [!NOTE]
> Chaque package est sous licence MIT et vit sur GitHub dans l'organisation [No-More-RP](https://github.com/No-More-RP). Les contributions sont les bienvenues.
