---
title: Installation
description: Faire tourner un serveur NoMoreRP, du dossier Packages vide au gamemode en ligne.
---

# Installation

Cette page t'emmène d'un serveur vide à un gamemode NoMoreRP qui tourne. Si tu ne veux qu'une seule librairie (promesses, RPC…), saute directement à sa page — chacune indique son installation en une ligne.

## Prérequis

- Un **serveur dédié [nanos world](https://nanos.world)**.
- Une **base de données** joignable depuis le serveur (SQLite fonctionne d'emblée ; MySQL / MariaDB en production).
- `git` pour cloner les packages (les cores vendorisés utilisent des submodules).

## 1. Installer les packages

Chaque package NoMoreRP est un dossier dans le répertoire `Packages/` de ton serveur. Clone le core et les librairies dont il dépend :

```bash
cd Packages/

git clone --recursive https://github.com/No-More-RP/nmrp
git clone --recursive https://github.com/No-More-RP/nmrp-promise
git clone --recursive https://github.com/No-More-RP/nmrp-norm
git clone https://github.com/No-More-RP/nmrp-rpc
git clone https://github.com/No-More-RP/nmrp-locale
```

> `nmrp-promise` et `nmrp-norm` embarquent leur core en **submodule git**. Utilise `--recursive` au clone, ou lance ensuite `git submodule update --init --recursive` dans le dossier.

Le gamemode déclare ces dépendances dans son propre `Package.toml`, pour que le moteur les charge dans le bon ordre :

```toml
[game_mode]
    packages_requirements = [
        "nmrp-promise",
        "nmrp-norm",
        "nmrp-rpc",
        "nmrp-locale",
    ]
```

## 2. Sélectionner le gamemode

Dans le `Config.toml` de ton serveur, définis `nmrp` comme game-mode actif :

```toml
[game]
    game_mode = "nmrp"
    packages  = [
        # les add-ons (packages de type script) vont ici, ex. :
        # "nmrp-character-needs",
    ]
```

> **Game-mode vs. package.** `nmrp` est un package de type *game-mode*, il va donc dans `game_mode`. Les add-ons comme [`nmrp-character-needs`](/character-needs) sont des packages de type *script* — ils vont dans la liste `packages`, jamais dans `game_mode`.

## 3. Configurer la base de données

La connexion à la base est un **custom setting du game-mode** — tu peux la définir depuis le menu nouvelle partie, depuis `Config.toml`, ou en ligne de commande serveur. Sa valeur par défaut est :

```toml
database_connection = "db=nmrp user=root host=127.0.0.1 port=3307"
```

Les autres custom settings :

| Setting | Type | Défaut | Rôle |
|---|---|---|---|
| `database_connection` | text | `db=nmrp …` | Chaîne de connexion à la base. |
| `debug` | boolean | `false` | Logs détaillés. |
| `mode` | select | `production` | `development` ou `production`. |

## 4. Lancer

Démarre (ou redémarre) le serveur. Au boot, le loader construit la connexion base + le conteneur `ctx`, puis câble chaque module dans l'ordre des dépendances. Quand tu vois les contrôleurs s'enregistrer, le gamemode est en ligne.

## Ajouter un add-on

Les add-ons étendent le core sans y toucher. Pour en installer un — par exemple [`nmrp-character-needs`](/character-needs) :

1. Clone-le dans `Packages/`, à côté du core.
2. Ajoute-le à la liste **`packages`** (pas `game_mode`) dans `Config.toml`.
3. Redémarre le serveur — il se charge après le core et s'enregistre tout seul.

## Ensuite

- Comprendre l'architecture que tu viens de lancer → [nmrp](/nmrp).
- Explorer les librairies sur lesquelles elle repose → [nmrp-promise](/promise), [nmrp-rpc](/rpc), [nmrp-norm](/norm), [nmrp-locale](/locale).
