---
title: nmrp-character-needs
description: Un add-on de besoins vitaux pour NMRP qui ajoute des jauges de survie au HUD, avec la stamina disponible dès aujourd'hui.
---

# nmrp-character-needs

Un add-on de besoins vitaux pour [NMRP](/nmrp) qui ajoute des jauges de survie au HUD via le SDK d'add-ons de NMRP. Il embarque la **stamina** dès aujourd'hui, avec la faim, la soif et l'alcool prévus par la suite.

## Ce que c'est

`nmrp-character-needs` est un **add-on** construit sur le **SDK d'add-ons de NMRP**. Il se branche sur le core NMRP à travers le global `NMRP` et ajoute des jauges de survie au HUD **sans toucher au core**.

Aujourd'hui il embarque un module fonctionnel : la **stamina** — une stamina de sprint autoritaire côté serveur, répliquée vers une jauge du HUD. La faim, la soif et l'alcool sont prévus, chacun étant un nouveau module enregistré exactement de la même manière.

## Installation

C'est un package **script**, pas un game-mode. Il tourne par-dessus le game-mode `nmrp`, donc tu l'enregistres à côté de lui et non à sa place.

1. Place le dossier `nmrp-character-needs` dans le répertoire `Packages/` de ton serveur.
2. Assure-toi que ses dépendances sont présentes dans `Packages/` elles aussi. Elles sont déclarées dans `Package.toml` :

   ```toml
   [script]
       packages_requirements = [
           "nmrp-promise",
           "nmrp-norm",
           "nmrp-rpc",
           "nmrp-locale",
           "nmrp",
       ]
   ```

3. Enregistre le package dans le `Config.toml` de ton serveur. Comme c'est un package script et **pas** un game-mode, il va dans la liste `packages` de la section `[game]` (à côté de `game_mode = "nmrp"`), et **pas** dans `game_mode` :

   ```toml
   [game]
       game_mode = "nmrp"
       packages = [
           "nmrp-character-needs",
       ]
   ```

4. Démarre (ou redémarre) le serveur. L'add-on se charge après le core NMRP et s'enregistre tout seul.

> [!WARNING]
> L'erreur la plus fréquente est de mettre ce package dans `game_mode`. C'est un add-on : garde `game_mode = "nmrp"` et ajoute `nmrp-character-needs` à la liste `packages`. Consulte [Installation](/installation) pour la mise en place complète du serveur.

## Comment ça marche

L'add-on utilise le **SDK d'add-ons de NMRP**, exposé via le global `NMRP` (publié par le core avec `Package.Export`). Le `Index.lua` de chaque realm enregistre ses modules une fois que le core est prêt :

```lua
-- Server/Index.lua and Client/Index.lua
NMRP.register(require 'modules/stamina/stamina.module.lua');
```

`NMRP.register` attend que le core ait fini de démarrer (schéma synchronisé côté serveur, joueur local résolu côté client), puis branche le module dans le loader du core.

Un module d'add-on est le **même descripteur** que celui du core :

```lua
{ name, depends?, models?, service?, controller? }
```

Comme c'est la même forme, un module peut `depends` sur des modules du core (`"player"`, `"hud"`, ...) et les atteindre via `ctx.services`.

### Le module stamina

| Module | Realm | Rôle |
|---|---|---|
| `stamina` | Serveur | Stamina de sprint autoritaire : se vide pendant le sprint, coupe le sprint à 0, se régénère au repos. Réplique un segment de mouvement `{ value, rate, delay }` au client propriétaire uniquement lors d'une transition. |
| `stamina` | Client | Enregistre une jauge `stamina` sur le HUD du core (`ctx.services.hud.register_gauge`) et lui envoie les segments, que le HUD interpole localement. |

La jauge de stamina est une **jauge de HUD** créée à l'exécution : le HUD du core ne garde que la vie en permanence et laisse les features ajouter et retirer des barres à la volée, donc cet add-on possède sa barre et la retire au déchargement.

Le réglage (taux de vidage/régénération, seuils, période de tick) se trouve dans la table `CONFIG` de `Server/modules/stamina/stamina.service.lua`.

## Ajouter un module

Un nouveau besoin (faim, soif, ...) s'ajoute avec la même forme qu'un module du core (voir le README de NMRP) :

1. Crée `Server/modules/<name>/` et/ou `Client/modules/<name>/` avec `<name>.module.lua` (plus `model` / `service` / `controller` selon les besoins).
2. Écris les requires **relatifs au dossier** et type-les à la main (les chemins finissent par `.lua`).
3. Déclare `depends` sur les modules du core dont tu as besoin (`"player"`, `"hud"`, ...).
4. Ajoute la ligne d'enregistrement au `Index.lua` du realm :

   ```lua
   NMRP.register(require 'modules/<name>/<name>.module.lua');
   ```

## Conventions

L'add-on suit les conventions de NMRP : commentaires en anglais uniquement, instructions terminées par `;`, `<const>` sur chaque local non réassigné, conditions entre parenthèses, annotations LuaCATS complètes, et un exemple sur chaque fonction publique.

## See also

- [nmrp](/nmrp) — le game-mode core sur lequel cet add-on se branche.
- [Installation](/installation) — mise en place complète du serveur et des packages.
- [nmrp-character-needs sur GitHub](https://github.com/No-More-RP/nmrp)

MIT © 2026 JustGod.
