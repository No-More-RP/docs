---
title: nmrp-ui
description: The HUD and Inventory WebUI for NoMoreRP, built with Svelte, Vite and TypeScript.
---

# nmrp-ui

The HUD + Inventory WebUI for the nanos world package NoMoreRP — a self-contained Svelte app that talks to the game through a typed Lua↔JS event bridge.

## What it is

`nmrp-ui` is the front-end layer of NoMoreRP: the on-screen **HUD** (health, stamina, and friends) and the **inventory** window. It is a standalone Svelte + Vite + TypeScript project that ships as a single self-contained `index.html` and communicates with the game via a small, typed event contract.

The app is designed to run in two contexts:

- In the **browser**, for fast local development, with a mock "game" standing in for the engine.
- **In game**, loaded by the client over `file://`, wired to the real nanos world `Events` bridge.

## Getting started

Install dependencies with [pnpm](https://pnpm.io):

```bash
pnpm install
```

## Dev mode (browser)

Start the Vite dev server:

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173). Because no `window.Events` object exists in a plain browser, a **mock bridge** (`src/nanos/mock.ts`) is installed automatically. It pushes demo data, animates the HUD, and replies to your actions — so you can build and test the UI without launching the game.

Keybinds in dev mode:

- `I` — open / close the inventory
- `Escape` — close the inventory
- Double-click an item — use it
- Drag an item — move it
- Right-click an item — drop it

> [!TIP]
> The mock bridge only exists in the browser. As soon as the app runs in game, the real `Events` object is detected and used instead — no code change required.

## Prod mode (in game)

Build the production bundle:

```bash
pnpm build         # outputs to dist/ (self-contained single-file index.html)
```

This repo is **standalone**: it builds to its own `dist/` and never writes into the game package directly. On every push to `main`, a CI workflow (`.github/workflows/build-web.yml`) rebuilds the bundle and commits it into the `nmrp` repo at `Client/web/`.

> [!WARNING]
> nanos world only syncs `Client/` and `Shared/` to clients, which is why the bundle must land in `nmrp`'s `Client/web/`. The sources and `node_modules` stay in this repo and are never sent to players.

The game loads `file:///web/index.html`, resolved relative to the calling script (`Client/`), so the real path is `Client/web/index.html` (see `Client/app.lua` in `nmrp`). The build is a **single self-contained** `index.html`, with JS and CSS inlined via `vite-plugin-singlefile`: under `file://`, separate assets are blocked by CORS, so everything must be inlined into one file.

After the CI deploy lands on `nmrp`, **reload the package** (or restart the server) so the new `Client/web/` is synced to clients.

> [!TIP]
> In-game hot-reload: set `local DEV = true` in `Client/app.lua` and run `pnpm dev`. The WebUI will point to `http://localhost:5173` instead of the bundled file.

> [!NOTE]
> `dev` does not need a sync: the client loads the HTTP URL directly.

## Architecture

The `src/` tree is organized around the bridge, the stores, and the components:

```
src/
  nanos/
    nanos.d.ts     # types for the global `Events` injected by nanos world
    events.ts      # typed Lua<->JS CONTRACT (domain types + event names)
    bridge.ts      # typed call() / subscribe(); selects real Events vs mock; isDev / inGame
    mock.ts        # fake "game" for browser dev
  stores/
    hud.ts         # HUD store, wired to hud:update
    inventory.ts   # inventory store + actions + derived weight
  lib/
    items.ts       # shared pure helpers (categoryGlyph)
  components/
    Hud.svelte
    Stamina.svelte
    Inventory.svelte
    InventorySlot.svelte
  App.svelte       # mount, ui:ready handshake, unsubscriptions
  main.ts
```

The key file is `bridge.ts`: it exposes a typed `call()` / `subscribe()` API, and transparently picks the real nanos `Events` when in game or the mock when in the browser. Svelte stores subscribe to incoming events and expose reactive state to the components.

## Adding an event

Events are the contract between Lua and JS. To add one:

1. Declare it in `src/nanos/events.ts`, under `IncomingEvents` (game → UI) or `OutgoingEvents` (UI → game).
2. On the JS side, use `call('my:event', ...)` to emit or `subscribe('my:event', cb)` to listen — both typed against the contract.
3. On the Lua side (`Client/app.lua`), use `MainUI:CallEvent('my:event', ...)` to send to JS, or `MainUI:Subscribe('my:event', cb)` to receive from JS.

Keep `events.ts` and `Client/app.lua` in sync: that pair is the **source of truth** for the contract.

> [!NOTE]
> Server-authoritative values (for example **stamina**) don't arrive as a WebUI event directly. They come via a nanos remote (`Events.CallRemote`, server → client), and `Client/app.lua` forwards them into the WebUI as a normal `hud:update`.

## See also

- [Introduction to NoMoreRP](/en/nmrp)
- [Localization (nmrp-locale)](/en/locale)

MIT © 2026 JustGodWork.
