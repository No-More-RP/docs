---
title: nmrp-character-needs
description: A character-needs add-on for NMRP that adds survival gauges to the HUD, shipping stamina today.
---

# nmrp-character-needs

A character-needs add-on for [NMRP](/en/nmrp) that adds survival gauges to the HUD through the NMRP addon SDK. It ships **stamina** today, with hunger, thirst and alcohol on the roadmap.

## What it is

`nmrp-character-needs` is an **add-on** built on the **NMRP addon SDK**. It plugs into the NMRP core through the `NMRP` global and adds survival gauges to the HUD **without touching the core**.

Today it ships one working module: **stamina** — server-authoritative sprint stamina, replicated to a HUD gauge. Hunger, thirst and alcohol are planned, each a new module registered exactly the same way.

## Installation

This is a **script** package, not a game-mode. It runs on top of the `nmrp` game-mode, so it is registered alongside it rather than in place of it.

1. Place the `nmrp-character-needs` folder in your server's `Packages/` directory.
2. Make sure its dependencies are present in `Packages/` too. They are declared in `Package.toml`:

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

3. Register the package in your server's `Config.toml`. Because it is a script package and **not** a game-mode, it goes in the `packages` list of the `[game]` section (next to `game_mode = "nmrp"`), **not** in `game_mode`:

   ```toml
   [game]
       game_mode = "nmrp"
       packages = [
           "nmrp-character-needs",
       ]
   ```

4. Start (or restart) the server. The add-on loads after the NMRP core and registers itself.

> The single most common mistake is putting this package in `game_mode`. It is an add-on: keep `game_mode = "nmrp"` and add `nmrp-character-needs` to the `packages` list. See [Installation](/en/installation) for the full server setup.

## How it works

The add-on uses the **NMRP addon SDK**, exposed through the `NMRP` global (published by the core via `Package.Export`). Each realm's `Index.lua` registers its modules once the core is ready:

```lua
-- Server/Index.lua and Client/Index.lua
NMRP.register(require 'modules/stamina/stamina.module.lua');
```

`NMRP.register` waits for the core to finish booting (schema synced on the server, local player resolved on the client), then wires the module into the core loader.

An add-on module is the **same descriptor** the core uses:

```lua
{ name, depends?, models?, service?, controller? }
```

Because it is the same shape, a module can `depends` on core modules (`"player"`, `"hud"`, ...) and reach them through `ctx.services`.

### The stamina module

| Module | Realm | Role |
|---|---|---|
| `stamina` | Server | Authoritative sprint stamina: drains while sprinting, cuts sprint at 0, regenerates at rest. Replicates a motion segment `{ value, rate, delay }` to the owning client only on a transition. |
| `stamina` | Client | Registers a `stamina` gauge on the core HUD (`ctx.services.hud.register_gauge`) and feeds it the segments, which the HUD interpolates locally. |

The stamina gauge is a runtime **HUD gauge**: the core HUD keeps only health permanent and lets features add and remove bars on the fly, so this add-on owns its bar and removes it on unload.

Tuning (drain/regen rates, thresholds, tick period) lives in the `CONFIG` table of `Server/modules/stamina/stamina.service.lua`.

## Add a module

A new need (hunger, thirst, ...) is added with the same shape as a core module (see the NMRP README):

1. Create `Server/modules/<name>/` and/or `Client/modules/<name>/` with `<name>.module.lua` (plus `model` / `service` / `controller` as needed).
2. Write requires **relative to the folder** and type them by hand (paths end with `.lua`).
3. Declare `depends` on the core modules you need (`"player"`, `"hud"`, ...).
4. Add the registration line to the realm's `Index.lua`:

   ```lua
   NMRP.register(require 'modules/<name>/<name>.module.lua');
   ```

## Conventions

The add-on follows the NMRP conventions: English-only comments, `;`-terminated statements, `<const>` on every non-reassigned local, parenthesized conditions, full LuaCATS annotations, and an example on every public function.

## See also

- [nmrp](/en/nmrp) — the core game-mode this add-on plugs into.
- [Installation](/en/installation) — full server and package setup.
- [nmrp-character-needs on GitHub](https://github.com/No-More-RP/nmrp)

MIT © 2026 JustGod.
