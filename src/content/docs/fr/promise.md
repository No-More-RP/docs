---
title: nmrp-promise
description: Des promesses dignes du JS pour Lua — async / await, chaînage et combinateurs bâtis sur les coroutines de nanos world.
---

# nmrp-promise

Un package **nanos world** qui apporte une `Promise` complète, digne du JS, à Lua : un cœur [Promises/A+](https://promisesaplus.com/) sans dépendances, câblé au moteur nanos, qui exporte les globales `Promise`, `async` et `await` vers tous les autres packages.

## Ce que c'est

`nmrp-promise` embarque un cœur [Promises/A+](https://promisesaplus.com/) (vendorisé sous forme de sous-module git) et le relie à nanos world. Charger le package installe le planificateur et expose trois globales — **`Promise`**, **`async`** et **`await`** — à tous les packages qui partagent le même état Lua.

### Comment fonctionne le moteur asynchrone

Le moteur asynchrone, c'est la **coroutine Lua**. `:Await()` met en pause la coroutine courante et la promesse la reprend dès qu'elle est réglée — il n'y a pas de boucle d'événements.

La distribution des handlers (`:Then`) est **synchrone**, donc le chaînage, les combinateurs et `async` / `await` fonctionnent partout. Seuls les helpers basés sur le temps (`Promise.delay`, `:Timeout`) ont besoin du planificateur, que ce package branche pour toi sur le `Timer.SetTimeout` de nanos.

## Installation

Ajoute `nmrp-promise` aux `packages_requirements` de ton package :

```toml
[script] # or [game_mode]
    packages_requirements = [ "nmrp-promise" ]
```

Les globales `Promise`, `async` et `await` sont alors disponibles partout — l'état Lua est partagé entre les packages, côté serveur comme côté client.

> Le cœur est livré vendorisé, donc le package tourne dès l'installation. Si tu as cloné le dépôt, récupère d'abord le sous-module : `git submodule update --init --recursive`.

## Créer une promesse

Il y a deux façons de créer une promesse, plus des fabriques statiques pour les valeurs déjà réglées.

```lua
-- Executor style (recommended): wrap a callback API.
local p <const> = Promise(function(resolve, reject)
    do_async(function(err, value)
        if (err) then reject(err); else resolve(value); end
    end);
end);

-- Deferred style: get the handle now, settle it later.
local d <const> = Promise();
do_async(function(_, value) d:Resolve(value); end);

-- Static factories.
Promise.resolve(42);
Promise.reject("nope");
```

## Chaînage

`:Then` renvoie **toujours** une nouvelle promesse, donc les chaînes transforment les valeurs, récupèrent des erreurs et aplatissent automatiquement les promesses imbriquées.

```lua
fetch_user(id)
    :Then(function(user) return user.name; end)         -- transform
    :Then(function(name) return load_avatar(name); end) -- return a promise -> flattened
    :Catch(function(err) return default_avatar; end)    -- recover
    :Finally(function() hide_spinner(); end);           -- always runs
```

| Méthode | Description |
|---|---|
| `:Then(onFulfilled, onRejected)` | Attache des handlers, renvoie une promesse chaînée. |
| `:Catch(onRejected)` | Sucre syntaxique pour `:Then(nil, onRejected)`. |
| `:Finally(onFinally)` | S'exécute au règlement, laisse passer la valeur / la raison. |
| `:Tap(onFulfilled)` | Effet de bord à l'accomplissement, transmet la valeur. |
| `:Timeout(ms, reason?)` | Rejette si non réglée dans `ms`. |
| `:Resolve(value)` / `:Reject(reason)` | Règle une promesse différée. |
| `:Await()` / `:await()` | Bloque la coroutine courante pour obtenir la valeur (relève les rejets). |
| `:GetState()` / `:IsSettled()` | Introspection. |

> `:Await()` met une coroutine en pause, il doit donc s'exécuter à l'intérieur d'une coroutine (un corps `async(...)` ou un `coroutine.wrap`). C'est interdit sur le thread principal.

## Combinateurs (statiques)

Les helpers statiques combinent plusieurs promesses ou font remonter des valeurs et des fonctions simples dans le monde des promesses.

```lua
Promise.all({ a, b, c })        -- array of values, rejects on first failure
Promise.allSettled({ a, b })    -- { {status="fulfilled", value=}, {status="rejected", reason=} }
Promise.race({ a, b })          -- first to settle (either way)
Promise.any({ a, b })           -- first to FULFIL, else AggregateError
Promise.map(list, mapper)       -- map (mapper may return promises), then all
Promise.try(fn, ...)            -- run fn safely into a promise
Promise.delay(ms, value?)       -- resolve after a delay (uses the nanos Timer)
Promise.timeout(p, ms, reason?) -- race p against a timeout (uses the nanos Timer)
Promise.resolve(v) / Promise.reject(r) / Promise.is(v)
```

## async / await

`async` exécute une fonction dans une coroutine pour qu'elle puisse `:Await()`, et renvoie elle-même une promesse pour le résultat de la fonction.

```lua
local job <const> = async(function()
    local user <const> = fetch_user(1):Await();
    local posts <const> = await(fetch_posts(user.id)); -- global await: any thenable
    return #posts;
end);

job:Then(function(n) print(("loaded %d posts"):format(n)); end)
   :Catch(function(err) print("failed:", err); end);
```

Une promesse rejetée attendue à l'intérieur d'un `async` lève une erreur que tu peux `pcall`, exactement comme un `try` / `await` en JavaScript.

## Rejets non gérés

Un rejet qui n'est jamais observé (aucun `:Catch`, `:Then(_, onRejected)` ni `:Await`) est signalé une fois qu'un tick est passé. Personnalise le handler :

```lua
Promise.OnUnhandledRejection(function(reason, message)
    Console.Error(("Unhandled promise rejection: %s"):format(message));
end);
```

## Interop

La métatable d'instance porte `__name == "Promise"`, et une couche générique d'adoption des thenables reconnaît `Then` / `next` / `then`, si bien que les promesses étrangères circulent à travers `Promise.all`, `:Then`, `await`, etc. C'est ce qui permet à [Norm](https://github.com/No-More-RP/nmrp-norm) et à [nmrp-rpc](https://github.com/No-More-RP/nmrp-rpc) de renvoyer de vraies instances nmrp-promise.

## Voir aussi

- [nmrp-rpc](/rpc) — RPC requête / réponse basé sur les promesses, entre serveur et client.
- [nmrp-norm](/norm) — ORM côté serveur dont les requêtes renvoient des instances nmrp-promise.

MIT © 2026 JustGodWork.
