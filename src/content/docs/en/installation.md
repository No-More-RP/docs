---
title: Installation
description: Get a NoMoreRP server running, from an empty Packages folder to a live gamemode.
---

# Installation

This page takes you from an empty server to a running NoMoreRP gamemode. If you only want a single library (promises, RPC…), skip ahead to its page — each one lists its own one-line install.

## Prerequisites

- A **[nanos world](https://nanos.world) dedicated server**.
- A **database** reachable from the server (SQLite works out of the box; MySQL / MariaDB for production).
- `git` to clone the packages (submodules are used for vendored cores).

## 1. Install the packages

Every NoMoreRP package is a folder inside your server's `Packages/` directory. Clone the core and the libraries it depends on:

```bash
cd Packages/

git clone --recursive https://github.com/No-More-RP/nmrp
git clone --recursive https://github.com/No-More-RP/nmrp-promise
git clone --recursive https://github.com/No-More-RP/nmrp-norm
git clone https://github.com/No-More-RP/nmrp-rpc
git clone https://github.com/No-More-RP/nmrp-locale
```

> `nmrp-promise` and `nmrp-norm` vendor their cores as **git submodules**. Use `--recursive` when cloning, or run `git submodule update --init --recursive` inside the folder afterwards.

The gamemode declares those dependencies in its own `Package.toml`, so the engine loads them in the right order:

```toml
[game_mode]
    packages_requirements = [
        "nmrp-promise",
        "nmrp-norm",
        "nmrp-rpc",
        "nmrp-locale",
    ]
```

## 2. Select the gamemode

In your server's `Config.toml`, set `nmrp` as the active game mode:

```toml
[game]
    game_mode = "nmrp"
    packages  = [
        # add-ons (script packages) go here, e.g.:
        # "nmrp-character-needs",
    ]
```

> **Game modes vs. packages.** `nmrp` is a *game-mode* package, so it goes in `game_mode`. Add-ons like [`nmrp-character-needs`](/en/character-needs) are *script* packages — they go in the `packages` list instead, never in `game_mode`.

## 3. Configure the database

The database connection is a **game-mode custom setting** — you can set it from the new-game menu, from `Config.toml`, or on the server command line. Its default is:

```toml
database_connection = "db=nmrp user=root host=127.0.0.1 port=3307"
```

Other custom settings:

| Setting | Type | Default | Purpose |
|---|---|---|---|
| `database_connection` | text | `db=nmrp …` | Database connection string. |
| `debug` | boolean | `false` | Verbose logging. |
| `mode` | select | `production` | `development` or `production`. |

## 4. Launch

Start (or restart) the server. On boot the loader builds the database connection and the `ctx` container, then wires every module in dependency order. When you see the controllers register, the gamemode is live.

## Add an add-on

Add-ons extend the core without touching it. To install one — for example [`nmrp-character-needs`](/en/character-needs):

1. Clone it into `Packages/` alongside the core.
2. Add it to the **`packages`** list (not `game_mode`) in `Config.toml`.
3. Restart the server — it loads after the core and registers itself.

## Next

- Understand the architecture you just launched → [nmrp](/en/nmrp).
- Explore the libraries it stands on → [nmrp-promise](/en/promise), [nmrp-rpc](/en/rpc), [nmrp-norm](/en/norm), [nmrp-locale](/en/locale).
