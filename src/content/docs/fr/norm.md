---
title: nmrp-norm
description: Un package nanos world qui embarque Norm, un ORM Lua sans dépendances, et l'expose côté serveur.
---

# nmrp-norm

`nmrp-norm` embarque [Norm](https://justgodwork.github.io/norm-docs/) — un ORM Lua sans dépendances — et l'expose sous forme de global côté serveur pour que les autres packages puissent l'utiliser.

> **Côté serveur uniquement.** Norm dialogue avec une base de données, il vit donc dans `Server/` et expose un global `Norm`. Il n'a aucune surface côté client.

> **Documentation complète de l'ORM.** Cette page ne couvre que ce qui est spécifique au package nanos world. L'API complète — modèles, relations, query builder, transactions, migrations, hooks, suppressions douces — se trouve sur le [site de documentation de Norm](https://justgodwork.github.io/norm-docs/) et dans le README du core à [`Server/vendor/norm/README.md`](https://github.com/No-More-RP/nmrp-norm/blob/main/Server/vendor/norm/README.md).

## Ce que c'est

Norm est un petit ORM Lua autonome. `nmrp-norm` le vendorise en tant que submodule git et embarque sa seule dépendance (light-class) directement dans le bundle : il n'y a donc rien d'autre à installer. Une fois le package chargé, l'ORM est disponible côté serveur via le global `Norm`.

## Installation

Le core est vendorisé en **submodule git**, alors pense à le récupérer après le clone :

```bash
git submodule update --init --recursive    # pull the vendored Norm
```

`Server/Index.lua` charge le bundle et l'exporte :

```lua
local Norm = require 'vendor/norm/dist/norm.lua' -- embeds light-class, exposes `Norm`
Package.Export('Norm', Norm)                     -- available to other packages' server scripts
```

Ajoute `nmrp-norm` aux `packages_requirements` de ton package, et `Norm` devient global dans tes scripts serveur :

```toml
[game_mode]
    packages_requirements = [
        "nmrp-norm",
    ]
```

## Démarrage rapide

Crée une instance de l'ORM avec l'adapter nanos, définis un modèle, puis synchronise et utilise-le :

```lua
local db = Norm.new({
    adapter = Norm.adapters.nanos.new({ engine = DatabaseEngine.SQLite, connection = "./database.db" }),
})

local User = db:define("users", {
    id   = Norm.types.id(),
    name = Norm.types.string({ length = 64, nullable = false }),
})

coroutine.wrap(function()
    db:sync():await()
    local u = User:create({ name = "John" }):await()
    Console.Log("user #%d", u.id)
end)()
```

## Spécificités nanos

Les points suivants sont gérés pour toi par l'adapter nanos et sa détection automatique :

### Adapter

`Norm.adapters.nanos.new({ engine, connection, pool_size? })` ouvre une `Database(engine, connection_string, pool_size)` avec pool et journalise la connexion.

### Promesses

`nmrp-promise` est optionnel. S'il est chargé (global `Promise`), Norm renvoie des promesses nanos ; sinon il utilise sa promesse intégrée. `promise:await()` fonctionne pareil dans les deux cas — privilégie-le pour du code identique quel que soit le provider.

### Ids d'insertion atomiques

Sur SQLite (et **MariaDB ≥ 10.5**, détecté automatiquement via `SELECT VERSION()`), Norm récupère les nouveaux ids via `INSERT … RETURNING`, ce qui est sûr avec un pool. Le vrai MySQL n'a pas de `RETURNING`, il retombe donc sur un `LAST_INSERT_ID()` en best-effort.

### Colonnes JSON

Les colonnes JSON utilisent automatiquement le global nanos `JSON` (`stringify` / `parse`).

### Transactions

La `Database` de nanos n'expose aucune API de transaction, donc `db:transaction(...)` lève une erreur ici. Vérifie `db:supports_transactions()` avant de compter dessus.

## Reconstruire le bundle

Le bundle est vendorisé pour que le package tourne d'emblée. Après avoir modifié les sources du core dans `Server/vendor/norm/src/`, reconstruis-le :

```bash
cd Server/vendor/norm && lua build.lua   # regenerates dist/norm.lua + dist/norm.min.lua
```

## See also

- [Site de documentation de Norm](https://justgodwork.github.io/norm-docs/) — l'API complète de l'ORM.
- [`Server/vendor/norm/README.md`](https://github.com/No-More-RP/nmrp-norm/blob/main/Server/vendor/norm/README.md) — le README du core.
- [nmrp-promise](/docs/promise) — le provider de promesses optionnel auquel Norm s'intègre.

MIT © 2026 JustGodWork. Vendored submodules keep their own licenses.
