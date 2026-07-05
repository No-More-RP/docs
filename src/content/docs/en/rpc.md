---
title: nmrp-rpc
description: Promise-based request/reply RPC for nanos world, local and remote, with automatic error propagation.
---

# nmrp-rpc

Turn nanos world's fire-and-forget events into a Promise-based request/reply RPC — you `Subscribe` a named handler and `Call` it, and the result comes back as a promise you can await or chain.

## What it is

`nmrp-rpc` is a nanos world package that layers a **request/reply** model on top of the engine's one-way events. Instead of manually pairing a `Call` with a matching reply event and tracking request ids by hand, you register a named handler with `Subscribe` and invoke it with `Call`. The result — or the error — comes back as a [`Promise`](/en/promise) you can `:Await()` or `:Then(...)`.

It works **server-side and client-side**, **local and remote**, with automatic error propagation: an error thrown inside a handler rejects the caller's promise.

The global `RPCEvents` is available everywhere, thanks to the shared Lua state between packages.

## Installation

Add `nmrp-rpc` to your package's `packages_requirements`. It depends on [`nmrp-promise`](/en/promise), so declare that one too:

```toml
[script] # or [game_mode]
    packages_requirements = [ "nmrp-promise", "nmrp-rpc" ]
```

## Local RPC (same realm)

Register a handler and call it within the same VM (server↔server or client↔client). The local reply is **synchronous**, so `RPCEvents.Call` also works on the main thread.

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

## Remote RPC (server ↔ client)

Register with `SubscribeRemote`; call with `CallRemote` / `CallRemoteAsync`. The remote reply is asynchronous, so `CallRemote` must run inside a coroutine.

> [!IMPORTANT]
> **On the server, the first argument to `CallRemote` / `CallRemoteAsync` is the target `Player`.** Server-side remote handlers likewise receive that `player` as their first parameter.

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

## Error handling

If a handler raises, the error is caught, logged on the provider side, and the caller's promise is **rejected** with the message — so `:Catch` (or a `pcall` around `:Await()`) sees it:

```lua
RPCEvents.Subscribe("risky", function() error("boom"); end);

RPCEvents.CallAsync("risky"):Catch(function(err) print("failed:", err); end);
```

## API — `RPCEvents`

| Function | Realm | Description |
|---|---|---|
| `RPCEvents.Subscribe(name, cb)` | Both | Register a **local** handler. |
| `RPCEvents.SubscribeRemote(name, cb)` | Both | Register a **remote** handler (server `cb` receives `player` first). |
| `RPCEvents.Has(name)` | Both | Is a handler registered for `name`? |
| `RPCEvents.Call(name, ...)` | Both | Local call, **awaits** the result. Coroutine required (except the synchronous local path). |
| `RPCEvents.CallAsync(name, ...)` | Both | Local call, returns the pending `Promise` (chain without a coroutine). |
| `RPCEvents.CallRemote(name, ...)` | Both | Remote call, **awaits** the result. Coroutine required. Server: first vararg is the `Player`. |
| `RPCEvents.CallRemoteAsync(name, ...)` | Both | Remote call, returns the pending `Promise`. Server: first vararg is the `Player`. |

## Notes & limitations

- Re-registering the same event **name** overwrites the previous handler (with a warning) — nanos has no event-unsubscribe, so cleanup on package stop is not yet possible.
- Per-package call identification (`invokingPackage`) is stubbed pending an engine feature ([nanos feedback](https://feedback.nanos-world.com/p/cross-package-api-call-identification)).
- Request ids wrap at 65535; in-flight requests beyond that bound are not expected in practice.

## See also

- [nmrp-promise](/en/promise) — the promise library `nmrp-rpc` is built on.
- [nmrp-rpc on GitHub](https://github.com/No-More-RP/nmrp-rpc)

MIT © 2026 JustGodWork.
