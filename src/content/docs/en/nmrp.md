---
title: nmrp
description: The core NoMoreRP game mode — an object-oriented MVC base wired by a loader and a dependency-injection registry.
---

# nmrp

An open-source roleplay game-mode base for [nanos world](https://nanos.world), written in Lua: a clean, modular foundation where an object-oriented **MVC** is wired by a **loader + dependency-injection registry**, so you spend your time on your gamemode instead of on plumbing.

## What it is

`nmrp` is a **game-mode package**. It gives server creators the structure they usually have to build from scratch:

- **MVC** — every feature is a module split into a Model (data), a Service (logic), a Controller (engine wiring), and an optional Store (in-memory state).
- **A loader** — modules are booted in dependency order; you list them once and the loader does three ordered passes over them.
- **Dependency injection** — a single `ctx` container holds the database, models, services and config, so any service reaches any other without global lookups.

It stands on the [No More RP](https://github.com/No-More-RP) package ecosystem:

| Package | Role |
|---|---|
| [`nmrp-promise`](/en/promise) | JS-grade promises (`async`/`await`, combinators). |
| [`nmrp-norm`](/en/norm) | Server-side ORM (Norm): models, relations, migrations. |
| [`nmrp-rpc`](/en/rpc) | Promise-based RPC across server and client. |
| [`nmrp-locale`](/en/locale) | Shared localization (i18n) for Lua + WebUI. |

The client UI is built with **Svelte + WebUI**.

## Installation

`nmrp` is a **game-mode** package, so it declares its dependencies in `Package.toml` and the engine loads them in order:

```toml
[game_mode]
    packages_requirements = [
        "nmrp-promise",
        "nmrp-norm",
        "nmrp-rpc",
        "nmrp-locale",
    ]
```

Make sure those packages exist in your server's `Packages/` folder, select `nmrp` as the active game mode, then start the server. The database connection is configured through the game-mode custom setting `database_connection` (new-game menu, `Config.toml`, or the server command line).

> **Full setup.** This is only the short version. For prerequisites, cloning the packages (with submodules), configuring the database and adding add-ons, follow the complete [Installation](/en/installation) page.

## Architecture

### Realms

nanos world runs two Lua VMs. Code is organized by which one it targets:

| Realm | Folder | Role |
|---|---|---|
| **Server** | `Server/` | Authority, database, business logic. |
| **Client** | `Client/` | UI (WebUI / Svelte), input, rendering. |
| **Shared** | `Shared/` | Code loaded into **both** VMs (lib, classes, helpers, globals). |

> **Layer rule.** `Shared/` is loaded into both VMs, so it must never reach for server-only APIs (database, authority) or client-only APIs (WebUI, rendering). Keep those in `Server/` and `Client/` respectively.

### Bootstrap

Each realm has a tiny, uniform entry point:

- `Server/Index.lua` and `Client/Index.lua` contain **only** `require 'app.lua';`.
- `Server/app.lua` builds the DB + the `ctx` container, then calls `loader.boot(mod1, mod2, ...)`.
- `Client/app.lua` mounts the WebUI + views + network/input wiring.

```lua
-- Server/Index.lua
require 'app.lua';
```

### MVC + DI (server side)

A **module** is a folder `Server/modules/<name>/` exposing a descriptor (`<name>.module.lua`). The loader wires it in three passes over the topological order of `depends`:

| Layer | File | Role |
|---|---|---|
| **Model** | `<name>.model.lua` | `fun(db): models` — defines the Norm tables, returns the models. |
| **Service** | `<name>.service.lua` | `fun(ctx): service` — business logic (closure-factory), stored in `ctx.services[name]`. |
| **Controller** | `<name>.controller.lua` | `fun(ctx): void` — wires the engine: commands, `Events`, `Timer`, `Player.Subscribe`. |
| **Store** (optional) | `<name>.store.lua` | In-memory repository / cache. |

`ctx` (`AppContext`) is the injection container:

```lua
---@class AppContext
---@field db       Database
---@field models   table<string, Model>
---@field services table<string, Service>
---@field config   Config
---@field events   EventEmitter
```

A service reaches others through `ctx.services.x` — and declares `depends = { "x" }` so the loader boots that dependency first.

> **Layer rule.** The **controller** owns everything that touches the engine (timers, subscriptions, inbound RPC, commands); the **service** is logic + lifecycle hooks. Keep engine wiring out of services.

The reference module is [`Server/modules/player`](https://github.com/No-More-RP/nmrp/tree/main/Server/modules/player).

## Add a module

1. Create `Server/modules/<name>/` with `<name>.module.lua` (plus `model` / `service` / `controller` as needed).
2. Write requires **relative to the folder** and type them by hand (nanos resolves `require` per caller directory; paths end with `.lua`).
3. `service` is a closure-factory; the `controller` wires the engine; use the lifecycle hooks on `ctx.services.player`.
4. Declare `depends` if the module relies on another.
5. Add the module to `loader.boot(...)` in `Server/app.lua`.

> A module with no persistence (runtime state only) has no `model`.

## Conventions

All new code follows the same conventions:

- English-only comments.
- `;`-terminated statements.
- `<const>` on every non-reassigned local.
- Parenthesized conditions.
- Full LuaCATS annotations, and an example on every public function.
- No user-facing string is hardcoded — everything goes through [`nmrp-locale`](/en/locale).

## See also

- [Installation](/en/installation) — full server setup, from an empty `Packages/` folder to a live gamemode.
- [nmrp-promise](/en/promise) — the promise primitives every async path builds on.
- [nmrp-norm](/en/norm) — the ORM behind the Model layer.
- [nmrp-rpc](/en/rpc) — server↔client request/reply used by controllers.
- [nmrp-locale](/en/locale) — localization for Lua + WebUI.
- [nmrp-character-needs](/en/character-needs) — a reference add-on that extends the core.

MIT © 2026 JustGod.
