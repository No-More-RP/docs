---
title: nmrp-locale
description: Shared i18n for NoMoreRP, usable from Lua (server + client) and the WebUI with the same translation tables.
---

# nmrp-locale

A localization (i18n) system for nanos world, shared across every package and reachable **from Lua (server + client) and from the WebUI (JS)** with the exact same translation tables.

## What it is

`nmrp-locale` gives every package one shared translation store and one way to read it, whether you are in Lua or in a WebUI:

- **Per-script locales** — each package declares its translations under its own *namespace*, so keys never collide between packages.
- **Shared locales** — a reserved namespace (`Locale.SHARED`) reachable from every package. A key missing in a namespace automatically falls back to the shared one.
- **Web compatible** — the client pushes the store + language to any WebUI via `Locale.Attach(webui)`; the page loads `locale.js` and translates on the JS side, from the same tables.

## Installation

Add `nmrp-locale` to your package's `packages_requirements`:

```toml
[script] # or [game_mode]
    packages_requirements = [ "nmrp-locale" ]
```

The global `Locale` is then available everywhere — the Lua state is shared between packages.

> [!TIP]
> Ready-to-copy usage snippets live in [`examples/`](https://github.com/No-More-RP/nmrp-locale/tree/main/examples) (per-script, server-per-player, WebUI). They are not loaded or shipped — pure reference.

## Language model

The active language is **per-player and client-owned**. It cannot be chosen on the server. On the client, `Shared/locale.lua` wires it automatically: it adopts `Client.GetLanguage()` on load and follows the engine `"LanguageChange"` event — you never set it yourself.

- **Client / WebUI** — `Locale.Translate(...)` uses the player's current language.
- **Server** — there is no single active language. Translate a player-facing string by passing that player's language **explicitly** (the 4th argument).
- **Fallback** — a server/realm-wide fallback (default `"en"`), used when a key is missing in the active language. Set it with `Locale.SetFallback("fr")`.

## Language codes

Codes are plain ISO 639-1 strings, optionally region-tagged (e.g. `"en-US"`, `"pt-BR"`). Any code works at runtime — you are not limited to the list below.

- **Type** — the `LocaleLanguage` alias (in `Shared/locale.types.lua`) enumerates the common codes for autocomplete while still accepting any `string`.
- **Runtime enum** — `Locale.Languages` (Lua) / `window.Locale.languages` (JS) map each supported code to its **native display name**, ideal for a language picker.

```lua
for code, name in pairs(Locale.Languages) do
    print(code, name); -- "fr" -> "Français", "ja" -> "日本語", ...
end
```

```js
Object.entries(window.Locale.languages).forEach(([code, name]) => {
  // build <option value="fr">Français</option> ...
});
```

Supported out of the box: `en, fr, de, es, it, pt, pt-BR, ru, pl, tr, nl, sv, da, fi, no, cs, hu, ro, el, uk, ja, ko, zh-CN, zh-TW, ar, th, vi, id`.

## Key resolution

Resolution goes from most specific to broadest. Each language is also tried by its base code (`"en-US"` -> `"en"`):

```
namespace[language] -> namespace[fallback] -> shared[language] -> shared[fallback] -> "the.key"
```

If nothing matches, the **key itself** is returned — missing translations are easy to spot in game.

## Lua: per-script locales

Every package registers its own tables under a namespace. Nested tables become dotted keys.

```lua
-- In your package, e.g. Shared/locale.lua
local L <const> = Locale.Namespace("my-package");

L:Register("en", {
    menu = { title = "Settings", save = "Save" },
    welcome = "Welcome, {name}!",
});

L:Register("fr", {
    menu = { title = "Paramètres", save = "Enregistrer" },
    welcome = "Bienvenue, {name} !",
});

-- Usage (nested tables become dotted keys)
print(L:t("menu.title"));                -- "Settings" (active language = en)
print(L:t("welcome", { name = "Bob" })); -- "Welcome, Bob!"
```

## Lua: shared locales

A curated **built-in pack** ships under `Shared/locales/` and is registered into the shared namespace at boot, so universal keys exist out of the box:

```lua
-- Available immediately, in every package, in en/fr (more via contributions)
local L <const> = Locale.Namespace("other-package");
print(L:t("common.yes"));   -- "Yes" / "Oui"  (not in "other-package" -> shared)
print(L:t("common.cancel"));
print(Locale.Translate(Locale.SHARED, "time.today"));
```

You can also feed the shared namespace yourself at runtime — it merges:

```lua
Locale.Shared:Register("en", { common = { retry = "Retry" } });
Locale.Shared:Register("fr", { common = { retry = "Réessayer" } });
```

### Built-in shared keys

`common.*` — `yes, no, ok, cancel, confirm, save, delete, edit, remove, add, create, close, back, next, previous, search, loading, settings, error, success, warning, info, enabled, disabled, none, all, name, description`
· `time.*` — `now, today, yesterday, tomorrow`

### Contributing a language to the shared pack

The shared namespace is **global to every package**, so the pack stays small and universal. To add or complete a language:

1. Add `Shared/locales/<code>.lua` returning a `LocaleTranslations` table — mirror the keys of `en.lua` (the reference).
2. Add one line in `Shared/locales/Index.lua`: `load("<code>", "<code>.lua");`.
3. Keep keys **prefixed and universal** (`common.*`, `time.*`, `unit.*`). Anything game/package-specific belongs in that package's own namespace, not here.

> [!IMPORTANT]
> **Adding a brand-new language code?** The list of codes is duplicated in 4 places that must be kept in sync (there is no shared source between the Lua VMs and the JS bundle):
> - `Shared/locale.types.lua` — the `LocaleLanguage` alias (autocomplete)
> - `Shared/locale.lua` — the `Locale.Languages` table (code → native name)
> - `Client/web/locale.js` — the `LANGUAGES` const (code → native name)
> - `Client/web/locale.d.ts` — the `LocaleLanguage` type
>
> Any ISO 639-1 code already works at runtime via `Register()` — updating these 4 only adds it to autocomplete and the `Locale.Languages` selector map.

## Server: translate per player

On the server there is no active language, so pass the player's language explicitly as the last argument:

```lua
local L <const> = Locale.Namespace("my-package");

-- Resolve the player's language however you store it (preference, DB, etc.).
local lang <const> = player:GetValue("language") or Locale.fallback;
Chat.SendMessage(player, L:t("welcome", { name = name }, lang));
```

## Language change & events

On the client the active language follows the player automatically; you can read it and subscribe to changes:

```lua
-- Client side: the active language follows the player automatically.
local lang <const> = Locale.GetLanguage(); -- = Client.GetLanguage()

Locale.SetFallback("en"); -- fallback for missing keys

local off <const> = Locale.OnChange(function(language)
    print("Language changed:", language);
end);
-- off() to unsubscribe
```

## Web (WebUI): same store, JS side

### 1. Lua client: attach the WebUI

```lua
local ui <const> = WebUI("MyUI", "file:///web/index.html");
Locale.Attach(ui); -- pushes the store + language, follows Register/SetLanguage
```

### 2. Web page: load `locale.js`

`locale.js` ships in this package at `Client/web/locale.js`. A WebUI resolves `file:///` paths relative to the **calling package's own folder**, so the script must sit next to your page: **copy `Client/web/locale.js` into your own package's WebUI folder** (e.g. your `Client/web/`, next to `index.html`) and load it there.

> [!TIP]
> **TypeScript?** Copy `Client/web/locale.d.ts` alongside it — it types the global `window.Locale` (and exports `LocaleNamespace`, `LocaleLanguage`, etc.).

```html
<script src="locale.js"></script>
<script>
  const Locale = window.Locale;
  const L = Locale.namespace("my-package");

  function render() {
    document.querySelector("#title").textContent = L.t("menu.title");
    document.querySelector("#hi").textContent    = L.t("welcome", { name: "Bob" });
    document.querySelector("#yes").textContent   = Locale.t("common.yes"); // shared
  }

  // Re-render on store load / language change
  Locale.onChange(render);

  // Change the language from the UI (notifies Lua automatically)
  // Locale.setLanguage("fr");
</script>
```

`locale.js` auto-wires to the `window.Events` bridge in game: it requests the store on load (`locale:request`) and listens to `locale:load` / `locale:language`.

### Browser dev (no game)

`window.Events` is absent out of game — feed the store manually:

```js
window.Locale.load({
  language: "fr",
  fallback: "en",
  data: { "my-package": { fr: { "menu.title": "Paramètres" } } },
});
```

## API reference

### Lua — `Locale`

Authority: **[Both]** = callable on server and client · **[Client]** = client only (no-op on the server).

| Function | Authority | Description |
|---|---|---|
| `Locale.Namespace(name)` | Both | Cached namespace object (per-script locales). |
| `Locale.Shared` | Both | Ready-to-use shared namespace. |
| `Locale.Languages` | Both | Map of supported code -> native display name. |
| `Locale.Register(ns, lang, tbl)` | Both | Register/merge translations (nested tables OK). Re-syncs WebUIs on client. |
| `Locale.Translate(ns, key, params?, language?)` | Both | Translate with fallback + `{name}` interpolation. `language` overrides the active one (server per-player). |
| `Locale.Has(ns, key, language?)` | Both | Does the key exist (ns or shared)? |
| `Locale.SetLanguage(lang)` / `GetLanguage()` | Both | Active language (client-driven; server = realm-wide default). |
| `Locale.SetFallback(lang)` | Both | Fallback language. |
| `Locale.OnChange(cb)` | Both | Listen to changes; returns an unsubscribe function. |
| `Locale.Attach(webui)` / `Detach(webui)` | Client | Wire a WebUI to the store. |

### Lua — namespace object

All **[Both]**: `ns:Register(lang, tbl)` · `ns:Get(key, params?, language?)` / `ns:t(...)` · `ns:Has(key, language?)`

### JS — `window.Locale`

The WebUI runs **client side only**, so all JS functions are client/WebUI:

`namespace(name)` · `t(key, params?)` (shared) · `translate(ns, key, params?)` · `has(ns, key)` · `setLanguage(lang)` / `getLanguage()` · `onChange(cb)` · `load(payload)` · `languages` (code -> native name)

## Interpolation

Tokens are `{name}` (named) or `{1}` (positional). A token without a matching value is left as-is (a debugging aid).

```lua
print(L:t("msg", { count = 3 })); -- "You have 3 message(s)"  from "You have {count} message(s)"
```

## See also

- [nmrp-ui](/en/ui) — the WebUI you attach the locale store to.
- [nmrp-locale on GitHub](https://github.com/No-More-RP/nmrp-locale)

MIT © 2026 JustGodWork.
