---
title: Introduction
description: What NoMoreRP is, and how its packages fit together.
---

# Introduction

NoMoreRP is an open-source **roleplay gamemode base for [nanos world](https://nanos.world)**, written in Lua.

It gives server creators a clean, modular foundation — an object-oriented **MVC** architecture wired by a **loader + dependency-injection registry** — so you spend your time building your gamemode instead of the plumbing underneath it.

## The philosophy

NoMoreRP is **a framework, not a bundle of scripts**. Everything is split into small, standalone, dependency-free packages that you can adopt whole or one piece at a time. Each package is its own nanos world repository, released under MIT.

- **Modular** — take the full stack, or pull in only the promise library.
- **Dependency-free** — no external Lua modules; each package vendors what it needs.
- **Typed** — fully annotated with LuaCATS for real autocomplete and type-checking in your editor.
- **Bilingual by design** — no user-facing string is hardcoded; everything flows through the localization system.

## The ecosystem

The stack is layered from low-level primitives up to the gamemode itself:

| Package | Layer | Role |
|---|---|---|
| [`nmrp-promise`](/en/promise) | async | JS-grade promises for Lua — `async` / `await`, combinators. |
| [`nmrp-norm`](/en/norm) | database | Server-side ORM (Norm) — models, relations, migrations. |
| [`nmrp-rpc`](/en/rpc) | networking | Promise-based request/reply RPC across server and client. |
| [`nmrp-locale`](/en/locale) | i18n | Shared localization for Lua **and** WebUI. |
| [`nmrp`](/en/nmrp) | game mode | The MVC base that ties it all together. |
| [`nmrp-character-needs`](/en/character-needs) | add-on | Survival gauges (stamina today) on top of the core. |
| [`nmrp-ui`](/en/ui) | UI | The HUD + inventory WebUI, built with Svelte. |
| [`light-class`](/en/light-class) | utility | The tiny OOP library everything else is built on. |

## Architecture at a glance

The gamemode splits every file into one of three **realms**:

- **`Server/`** — authority, database, business logic.
- **`Client/`** — UI (WebUI / Svelte), input, rendering.
- **`Shared/`** — code loaded into **both** VMs (libraries, classes, helpers, globals).

On the server, features are organized as **MVC modules** wired by dependency injection: a model defines the data, a service holds the logic, and a controller connects it to the engine. The [nmrp](/en/nmrp) page covers this in full.

## Where to go next

- **New here?** Start with [Installation](/en/installation) to get a server running.
- **Just want a library?** Each package page is self-contained — jump straight to [nmrp-promise](/en/promise), [nmrp-rpc](/en/rpc), [nmrp-norm](/en/norm) or [nmrp-locale](/en/locale).
- **Building a full gamemode?** Read [nmrp](/en/nmrp) for the MVC + DI model.

> Every package is MIT-licensed and lives on GitHub under the [No-More-RP](https://github.com/No-More-RP) organization. Contributions are welcome.
