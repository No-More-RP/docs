---
title: nmrp-norm
description: A nanos world package that bundles Norm, a dependency-free Lua ORM, and exports it server-side.
---

# nmrp-norm

`nmrp-norm` bundles [Norm](https://justgodwork.github.io/norm-docs/) — a dependency-free Lua ORM — and exports it as a server-side global for other packages to use.

> **Server-side only.** Norm talks to a database, so it lives in `Server/` and exports a global `Norm`. It has no client-side surface.

> **Full ORM documentation.** This page only covers what is specific to the nanos world package. The complete API — models, relations, the query builder, transactions, migrations, hooks, soft deletes — lives in the [Norm documentation site](https://justgodwork.github.io/norm-docs/) and in the core README at [`Server/vendor/norm/README.md`](https://github.com/No-More-RP/nmrp-norm/blob/main/Server/vendor/norm/README.md).

## What it is

Norm is a small, self-contained Lua ORM. `nmrp-norm` vendors it as a git submodule and embeds its only dependency (light-class) directly into the bundle, so there is nothing else to install. Once the package is loaded, the ORM is available server-side through the global `Norm`.

## Setup

The core is vendored as a **git submodule**, so pull it after cloning:

```bash
git submodule update --init --recursive    # pull the vendored Norm
```

`Server/Index.lua` loads the bundle and exports it:

```lua
local Norm = require 'vendor/norm/dist/norm.lua' -- embeds light-class, exposes `Norm`
Package.Export('Norm', Norm)                     -- available to other packages' server scripts
```

Add `nmrp-norm` to your package's `packages_requirements`, and `Norm` becomes global to your server scripts:

```toml
[game_mode]
    packages_requirements = [
        "nmrp-norm",
    ]
```

## Quick start

Create an ORM instance with the nanos adapter, define a model, then sync and use it:

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

## nanos specifics

The following are handled for you by the nanos adapter and its auto-detection:

### Adapter

`Norm.adapters.nanos.new({ engine, connection, pool_size? })` opens a pooled `Database(engine, connection_string, pool_size)` and logs the connection.

### Promises

`nmrp-promise` is optional. If it is loaded (global `Promise`), Norm returns nanos promises; otherwise it uses its built-in one. `promise:await()` works the same either way — prefer it for code that stays identical across providers.

### Atomic insert ids

On SQLite (and **MariaDB ≥ 10.5**, auto-detected via `SELECT VERSION()`), Norm fetches new ids via `INSERT … RETURNING`, which is pool-safe. Real MySQL has no `RETURNING`, so it falls back to a best-effort `LAST_INSERT_ID()`.

### JSON columns

JSON columns automatically use the nanos global `JSON` (`stringify` / `parse`).

### Transactions

nanos' `Database` exposes no transaction API, so `db:transaction(...)` throws there. Check `db:supports_transactions()` first before relying on it.

## Rebuilding the bundle

The bundle is vendored so the package runs out of the box. After editing the core sources in `Server/vendor/norm/src/`, rebuild it:

```bash
cd Server/vendor/norm && lua build.lua   # regenerates dist/norm.lua + dist/norm.min.lua
```

## See also

- [Norm documentation site](https://justgodwork.github.io/norm-docs/) — the full ORM API.
- [`Server/vendor/norm/README.md`](https://github.com/No-More-RP/nmrp-norm/blob/main/Server/vendor/norm/README.md) — the core README.
- [nmrp-promise](/en/promise) — the optional promise provider Norm integrates with.

MIT © 2026 JustGodWork. Vendored submodules keep their own licenses.
