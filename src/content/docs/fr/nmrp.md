---
title: nmrp
description: Le game mode central de NoMoreRP — une base MVC orientée objet câblée par un loader et un registre d'injection de dépendances.
---

# nmrp

Une base de game mode roleplay open source pour [nanos world](https://nanos.world), écrite en Lua : une fondation propre et modulaire où un **MVC** orienté objet est câblé par un **loader + un registre d'injection de dépendances**, pour que tu passes ton temps sur ton gamemode plutôt que sur la tuyauterie.

## Ce que c'est

`nmrp` est un **package de game mode**. Il donne aux créateurs de serveurs la structure qu'ils doivent habituellement construire de zéro :

- **MVC** — chaque fonctionnalité est un module découpé en un Model (données), un Service (logique), un Controller (câblage moteur) et un Store optionnel (état en mémoire).
- **Un loader** — les modules sont démarrés dans l'ordre des dépendances ; tu les listes une seule fois et le loader fait trois passes ordonnées dessus.
- **L'injection de dépendances** — un unique conteneur `ctx` contient la base de données, les models, les services et la config, pour que n'importe quel service atteigne n'importe quel autre sans recherche globale.

Il repose sur l'écosystème de packages [No More RP](https://github.com/No-More-RP) :

| Package | Rôle |
|---|---|
| [`nmrp-promise`](/docs/promise) | Des promises de qualité JS (`async`/`await`, combinateurs). |
| [`nmrp-norm`](/docs/norm) | ORM côté serveur (Norm) : models, relations, migrations. |
| [`nmrp-rpc`](/docs/rpc) | RPC basé sur les promises entre serveur et client. |
| [`nmrp-locale`](/docs/locale) | Localisation partagée (i18n) pour Lua + WebUI. |

L'interface client est construite avec **Svelte + WebUI**.

## Installation

`nmrp` est un package de **game mode**, il déclare donc ses dépendances dans `Package.toml` et le moteur les charge dans l'ordre :

```toml
[game_mode]
    packages_requirements = [
        "nmrp-promise",
        "nmrp-norm",
        "nmrp-rpc",
        "nmrp-locale",
    ]
```

Assure-toi que ces packages existent dans le dossier `Packages/` de ton serveur, sélectionne `nmrp` comme game mode actif, puis démarre le serveur. La connexion à la base de données se configure via le custom setting de game mode `database_connection` (menu de nouvelle partie, `Config.toml` ou ligne de commande du serveur).

> **Installation complète.** Ceci n'est que la version courte. Pour les prérequis, le clonage des packages (avec les submodules), la configuration de la base de données et l'ajout d'add-ons, suis la page complète [Installation](/docs/installation).

## Architecture

### Realms

nanos world exécute deux VMs Lua. Le code est organisé selon celle qu'il vise :

| Realm | Dossier | Rôle |
|---|---|---|
| **Server** | `Server/` | Autorité, base de données, logique métier. |
| **Client** | `Client/` | UI (WebUI / Svelte), input, rendu. |
| **Shared** | `Shared/` | Code chargé dans les **deux** VMs (lib, classes, helpers, globals). |

> **Règle de couche.** `Shared/` est chargé dans les deux VMs, il ne doit donc jamais toucher aux API réservées au serveur (base de données, autorité) ni à celles réservées au client (WebUI, rendu). Garde-les respectivement dans `Server/` et `Client/`.

### Bootstrap

Chaque realm a un point d'entrée minuscule et uniforme :

- `Server/Index.lua` et `Client/Index.lua` contiennent **uniquement** `require 'app.lua';`.
- `Server/app.lua` construit la DB + le conteneur `ctx`, puis appelle `loader.boot(mod1, mod2, ...)`.
- `Client/app.lua` monte la WebUI + les vues + le câblage réseau/input.

```lua
-- Server/Index.lua
require 'app.lua';
```

### MVC + DI (côté serveur)

Un **module** est un dossier `Server/modules/<name>/` exposant un descripteur (`<name>.module.lua`). Le loader le câble en trois passes sur l'ordre topologique de `depends` :

| Couche | Fichier | Rôle |
|---|---|---|
| **Model** | `<name>.model.lua` | `fun(db): models` — définit les tables Norm, retourne les models. |
| **Service** | `<name>.service.lua` | `fun(ctx): service` — logique métier (closure-factory), stockée dans `ctx.services[name]`. |
| **Controller** | `<name>.controller.lua` | `fun(ctx): void` — câble le moteur : commandes, `Events`, `Timer`, `Player.Subscribe`. |
| **Store** (optionnel) | `<name>.store.lua` | Dépôt / cache en mémoire. |

`ctx` (`AppContext`) est le conteneur d'injection :

```lua
---@class AppContext
---@field db       Database
---@field models   table<string, Model>
---@field services table<string, Service>
---@field config   Config
---@field events   EventEmitter
```

Un service atteint les autres via `ctx.services.x` — et déclare `depends = { "x" }` pour que le loader démarre cette dépendance en premier.

> **Règle de couche.** Le **controller** possède tout ce qui touche au moteur (timers, subscriptions, RPC entrants, commandes) ; le **service** est logique + hooks de cycle de vie. Garde le câblage moteur hors des services.

Le module de référence est [`Server/modules/player`](https://github.com/No-More-RP/nmrp/tree/main/Server/modules/player).

## Ajouter un module

1. Crée `Server/modules/<name>/` avec `<name>.module.lua` (plus `model` / `service` / `controller` selon les besoins).
2. Écris les requires **relatifs au dossier** et type-les à la main (nanos résout `require` par répertoire appelant ; les chemins finissent par `.lua`).
3. Le `service` est une closure-factory ; le `controller` câble le moteur ; utilise les hooks de cycle de vie sur `ctx.services.player`.
4. Déclare `depends` si le module dépend d'un autre.
5. Ajoute le module à `loader.boot(...)` dans `Server/app.lua`.

> Un module sans persistance (état runtime uniquement) n'a pas de `model`.

## Conventions

Tout nouveau code suit les mêmes conventions :

- Commentaires en anglais uniquement.
- Instructions terminées par `;`.
- `<const>` sur chaque local non réassigné.
- Conditions entre parenthèses.
- Annotations LuaCATS complètes, et un exemple sur chaque fonction publique.
- Aucune chaîne visible par l'utilisateur n'est codée en dur — tout passe par [`nmrp-locale`](/docs/locale).

## See also

- [Installation](/docs/installation) — installation complète du serveur, d'un dossier `Packages/` vide jusqu'à un gamemode en ligne.
- [nmrp-promise](/docs/promise) — les primitives de promises sur lesquelles repose chaque chemin async.
- [nmrp-norm](/docs/norm) — l'ORM derrière la couche Model.
- [nmrp-rpc](/docs/rpc) — le request/reply serveur↔client utilisé par les controllers.
- [nmrp-locale](/docs/locale) — la localisation pour Lua + WebUI.
- [nmrp-character-needs](/docs/character-needs) — un add-on de référence qui étend le core.

MIT © 2026 JustGod.
