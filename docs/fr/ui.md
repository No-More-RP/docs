---
title: nmrp-ui
description: L'interface web HUD et Inventaire de NoMoreRP, construite avec Svelte, Vite et TypeScript.
---

# nmrp-ui

L'interface web HUD + Inventaire du package nanos world NoMoreRP — une application Svelte autonome qui dialogue avec le jeu via un pont d'événements typé Lua↔JS.

## Ce que c'est

`nmrp-ui` est la couche front-end de NoMoreRP : le **HUD** affiché à l'écran (santé, stamina, et compagnie) ainsi que la fenêtre d'**inventaire**. C'est un projet Svelte + Vite + TypeScript autonome, livré sous la forme d'un unique `index.html` auto-suffisant, qui communique avec le jeu grâce à un petit contrat d'événements typé.

L'application est pensée pour tourner dans deux contextes :

- Dans le **navigateur**, pour un développement local rapide, avec un faux "jeu" qui remplace le moteur.
- **En jeu**, chargée par le client via `file://`, câblée sur le vrai pont `Events` de nanos world.

## Prise en main

Installe les dépendances avec [pnpm](https://pnpm.io) :

```bash
pnpm install
```

## Mode dev (navigateur)

Démarre le serveur de développement Vite :

```bash
pnpm dev
```

Ouvre [http://localhost:5173](http://localhost:5173). Comme aucun objet `window.Events` n'existe dans un simple navigateur, un **pont fictif** (`src/nanos/mock.ts`) est installé automatiquement. Il pousse des données de démo, anime le HUD et répond à tes actions — tu peux donc construire et tester l'UI sans lancer le jeu.

Raccourcis clavier en mode dev :

- `I` — ouvre / ferme l'inventaire
- `Escape` — ferme l'inventaire
- Double-clic sur un objet — l'utilise
- Glisser un objet — le déplace
- Clic droit sur un objet — le jette

> [!TIP]
> Le pont fictif n'existe que dans le navigateur. Dès que l'application tourne en jeu, le vrai objet `Events` est détecté et utilisé à la place — aucune modification de code nécessaire.

## Mode prod (en jeu)

Construis le bundle de production :

```bash
pnpm build         # outputs to dist/ (self-contained single-file index.html)
```

Ce dépôt est **autonome** : il construit dans son propre `dist/` et n'écrit jamais directement dans le package du jeu. À chaque push sur `main`, un workflow CI (`.github/workflows/build-web.yml`) reconstruit le bundle et le commit dans le dépôt `nmrp`, à l'emplacement `Client/web/`.

> [!WARNING]
> nanos world ne synchronise que `Client/` et `Shared/` vers les clients, c'est pourquoi le bundle doit atterrir dans le `Client/web/` de `nmrp`. Les sources et `node_modules` restent dans ce dépôt et ne sont jamais envoyés aux joueurs.

Le jeu charge `file:///web/index.html`, résolu relativement au script appelant (`Client/`), soit le chemin réel `Client/web/index.html` (voir `Client/app.lua` dans `nmrp`). Le build est un **unique fichier auto-suffisant** `index.html`, avec le JS et le CSS inlinés via `vite-plugin-singlefile` : sous `file://`, les assets séparés sont bloqués par CORS, tout doit donc être inliné dans un seul fichier.

Une fois le déploiement CI arrivé sur `nmrp`, **recharge le package** (ou redémarre le serveur) pour que le nouveau `Client/web/` soit synchronisé vers les clients.

> [!TIP]
> Hot-reload en jeu : mets `local DEV = true` dans `Client/app.lua` et lance `pnpm dev`. La WebUI pointera vers `http://localhost:5173` au lieu du fichier bundlé.

> [!NOTE]
> `dev` n'a pas besoin de synchronisation : le client charge directement l'URL HTTP.

## Architecture

L'arborescence `src/` s'organise autour du pont, des stores et des composants :

```
src/
  nanos/
    nanos.d.ts     # types the global `Events` injected by nanos world
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

Le fichier central est `bridge.ts` : il expose une API typée `call()` / `subscribe()`, et choisit de façon transparente le vrai `Events` de nanos quand on est en jeu, ou le mock quand on est dans le navigateur. Les stores Svelte s'abonnent aux événements entrants et exposent un état réactif aux composants.

## Ajouter un événement

Les événements constituent le contrat entre Lua et JS. Pour en ajouter un :

1. Déclare-le dans `src/nanos/events.ts`, sous `IncomingEvents` (jeu → UI) ou `OutgoingEvents` (UI → jeu).
2. Côté JS, utilise `call('my:event', ...)` pour émettre ou `subscribe('my:event', cb)` pour écouter — les deux sont typés par le contrat.
3. Côté Lua (`Client/app.lua`), utilise `MainUI:CallEvent('my:event', ...)` pour envoyer vers JS, ou `MainUI:Subscribe('my:event', cb)` pour recevoir depuis JS.

Garde `events.ts` et `Client/app.lua` synchronisés : ce couple est la **source de vérité** du contrat.

> [!NOTE]
> Les valeurs autoritaires côté serveur (par exemple la **stamina**) n'arrivent pas directement comme un événement WebUI. Elles passent par un remote nanos (`Events.CallRemote`, serveur → client), et `Client/app.lua` les transmet ensuite à la WebUI sous forme d'un `hud:update` classique.

## See also

- [Introduction à NoMoreRP](/nmrp)
- [Localisation (nmrp-locale)](/locale)

MIT © 2026 JustGodWork.
