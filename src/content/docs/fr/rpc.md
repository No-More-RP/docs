---
title: nmrp-rpc
description: RPC requête/réponse basé sur les promesses pour nanos world, local et distant, avec propagation automatique des erreurs.
---

# nmrp-rpc

Transforme les events "tire-et-oublie" de nanos world en un RPC requête/réponse basé sur les promesses — tu `Subscribe` un handler nommé et tu l'appelles avec `Call`, et le résultat revient sous forme de promesse que tu peux await ou chaîner.

## C'est quoi

`nmrp-rpc` est un package nanos world qui ajoute un modèle **requête/réponse** par-dessus les events à sens unique du moteur. Au lieu d'apparier manuellement un `Call` avec son event de réponse et de suivre les ids de requête à la main, tu enregistres un handler nommé avec `Subscribe` et tu l'invoques avec `Call`. Le résultat — ou l'erreur — revient sous forme de [`Promise`](/promise) que tu peux `:Await()` ou `:Then(...)`.

Ça fonctionne **côté serveur et côté client**, **en local et à distance**, avec propagation automatique des erreurs : une erreur levée dans un handler rejette la promesse de l'appelant.

Le global `RPCEvents` est disponible partout, grâce à l'état Lua partagé entre les packages.

## Installation

Ajoute `nmrp-rpc` aux `packages_requirements` de ton package. Il dépend de [`nmrp-promise`](/promise), déclare-le donc aussi :

```toml
[script] # or [game_mode]
    packages_requirements = [ "nmrp-promise", "nmrp-rpc" ]
```

## RPC local (même realm)

Enregistre un handler et appelle-le dans la même VM (serveur↔serveur ou client↔client). La réponse locale est **synchrone**, donc `RPCEvents.Call` fonctionne aussi sur le thread principal.

```lua
-- Provider
RPCEvents.Subscribe("getTime", function()
    return os.time();
end);

-- Consumer (await, inside a coroutine)
async(function()
    local time <const> = RPCEvents.Call("getTime");
    print("server time:", time);
end);

-- Consumer (chain, no coroutine needed)
RPCEvents.CallAsync("getTime"):Then(function(time) print(time); end);
```

## RPC distant (serveur ↔ client)

Enregistre avec `SubscribeRemote` ; appelle avec `CallRemote` / `CallRemoteAsync`. La réponse distante est asynchrone, donc `CallRemote` doit tourner dans une coroutine.

> **Côté serveur, le premier argument de `CallRemote` / `CallRemoteAsync` est le `Player` cible.** De même, les handlers distants côté serveur reçoivent ce `player` comme premier paramètre.

```lua
-- On the client: expose something the server can ask for
RPCEvents.SubscribeRemote("getClientFps", function()
    return Client.GetFPS();
end);

-- On the server: ask a specific player, await the reply
async(function()
    local fps <const> = RPCEvents.CallRemote("getClientFps", player);
    Console.Log("%s fps: %d", player:GetAccountID(), fps);
end);
```

```lua
-- On the server: expose something the client can ask for (handler gets the Player)
RPCEvents.SubscribeRemote("buyItem", function(player, item_id)
    return inventory.give(player, item_id); -- return value or raise -> rejects the caller
end);

-- On the client: call it
RPCEvents.CallRemoteAsync("buyItem", "sword_01")
    :Then(function(ok) print("bought:", ok); end)
    :Catch(function(err) print("denied:", err); end);
```

## Gestion des erreurs

Si un handler lève une erreur, elle est capturée, loggée côté provider, et la promesse de l'appelant est **rejetée** avec le message — donc `:Catch` (ou un `pcall` autour de `:Await()`) la voit :

```lua
RPCEvents.Subscribe("risky", function() error("boom"); end);

RPCEvents.CallAsync("risky"):Catch(function(err) print("failed:", err); end);
```

## API — `RPCEvents`

| Fonction | Realm | Description |
|---|---|---|
| `RPCEvents.Subscribe(name, cb)` | Les deux | Enregistre un handler **local**. |
| `RPCEvents.SubscribeRemote(name, cb)` | Les deux | Enregistre un handler **distant** (côté serveur, `cb` reçoit `player` en premier). |
| `RPCEvents.Has(name)` | Les deux | Un handler est-il enregistré pour `name` ? |
| `RPCEvents.Call(name, ...)` | Les deux | Appel local, **await** le résultat. Coroutine requise (sauf le chemin local synchrone). |
| `RPCEvents.CallAsync(name, ...)` | Les deux | Appel local, retourne la `Promise` en attente (chaîne sans coroutine). |
| `RPCEvents.CallRemote(name, ...)` | Les deux | Appel distant, **await** le résultat. Coroutine requise. Serveur : le premier vararg est le `Player`. |
| `RPCEvents.CallRemoteAsync(name, ...)` | Les deux | Appel distant, retourne la `Promise` en attente. Serveur : le premier vararg est le `Player`. |

## Notes & limitations

- Réenregistrer le même **nom** d'event écrase le handler précédent (avec un warning) — nanos n'a pas de désinscription d'event, donc le nettoyage à l'arrêt du package n'est pas encore possible.
- L'identification d'appel par package (`invokingPackage`) est stubbée en attendant une fonctionnalité du moteur ([feedback nanos](https://feedback.nanos-world.com/p/cross-package-api-call-identification)).
- Les ids de requête bouclent à 65535 ; on ne s'attend pas en pratique à avoir autant de requêtes en vol simultanément.

## Voir aussi

- [nmrp-promise](/promise) — la librairie de promesses sur laquelle repose `nmrp-rpc`.
- [nmrp-rpc sur GitHub](https://github.com/No-More-RP/nmrp-rpc)

MIT © 2026 JustGodWork.
