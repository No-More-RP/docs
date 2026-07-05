---
title: nmrp-locale
description: i18n partagée pour NoMoreRP, utilisable depuis Lua (serveur + client) et la WebUI avec les mêmes tables de traduction.
---

# nmrp-locale

Un système de localisation (i18n) pour nanos world, partagé entre tous les packages et accessible **depuis Lua (serveur + client) et depuis la WebUI (JS)** avec exactement les mêmes tables de traduction.

## Ce que c'est

`nmrp-locale` donne à chaque package un unique store de traductions partagé et une seule façon de le lire, que tu sois en Lua ou dans une WebUI :

- **Locales par script** — chaque package déclare ses traductions sous son propre *namespace*, donc les clés n'entrent jamais en collision entre packages.
- **Locales partagées** — un namespace réservé (`Locale.SHARED`) accessible depuis chaque package. Une clé absente d'un namespace retombe automatiquement sur le partagé.
- **Compatible web** — le client pousse le store + la langue vers n'importe quelle WebUI via `Locale.Attach(webui)` ; la page charge `locale.js` et traduit côté JS, depuis les mêmes tables.

## Installation

Ajoute `nmrp-locale` aux `packages_requirements` de ton package :

```toml
[script] # or [game_mode]
    packages_requirements = [ "nmrp-locale" ]
```

Le `Locale` global est alors disponible partout — l'état Lua est partagé entre les packages.

> Des snippets d'usage prêts à copier vivent dans [`examples/`](https://github.com/No-More-RP/nmrp-locale/tree/main/examples) (par script, serveur-par-joueur, WebUI). Ils ne sont ni chargés ni livrés — pure référence.

## Modèle de langue

La langue active est **par joueur et détenue par le client**. Elle ne peut pas être choisie côté serveur. Sur le client, `Shared/locale.lua` la câble automatiquement : il adopte `Client.GetLanguage()` au chargement et suit l'événement moteur `"LanguageChange"` — tu n'as jamais à la définir toi-même.

- **Client / WebUI** — `Locale.Translate(...)` utilise la langue actuelle du joueur.
- **Serveur** — il n'y a pas de langue active unique. Traduis une chaîne destinée à un joueur en passant sa langue **explicitement** (le 4ᵉ argument).
- **Fallback** — un fallback à l'échelle serveur/realm (par défaut `"en"`), utilisé quand une clé manque dans la langue active. Définis-le avec `Locale.SetFallback("fr")`.

## Codes de langue

Les codes sont de simples chaînes ISO 639-1, optionnellement taguées par région (ex. `"en-US"`, `"pt-BR"`). N'importe quel code fonctionne au runtime — tu n'es pas limité à la liste ci-dessous.

- **Type** — l'alias `LocaleLanguage` (dans `Shared/locale.types.lua`) énumère les codes courants pour l'autocomplétion tout en acceptant n'importe quel `string`.
- **Enum runtime** — `Locale.Languages` (Lua) / `window.Locale.languages` (JS) associent chaque code supporté à son **nom d'affichage natif**, idéal pour un sélecteur de langue.

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

Supportés d'emblée : `en, fr, de, es, it, pt, pt-BR, ru, pl, tr, nl, sv, da, fi, no, cs, hu, ro, el, uk, ja, ko, zh-CN, zh-TW, ar, th, vi, id`.

## Résolution des clés

La résolution va du plus spécifique au plus large. Chaque langue est aussi essayée par son code de base (`"en-US"` -> `"en"`) :

```
namespace[language] -> namespace[fallback] -> shared[language] -> shared[fallback] -> "the.key"
```

Si rien ne correspond, la **clé elle-même** est renvoyée — les traductions manquantes se repèrent facilement en jeu.

## Lua : locales par script

Chaque package enregistre ses propres tables sous un namespace. Les tables imbriquées deviennent des clés à points.

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

## Lua : locales partagées

Un **pack intégré** soigné est livré sous `Shared/locales/` et enregistré dans le namespace partagé au boot, donc des clés universelles existent d'emblée :

```lua
-- Available immediately, in every package, in en/fr (more via contributions)
local L <const> = Locale.Namespace("other-package");
print(L:t("common.yes"));   -- "Yes" / "Oui"  (not in "other-package" -> shared)
print(L:t("common.cancel"));
print(Locale.Translate(Locale.SHARED, "time.today"));
```

Tu peux aussi alimenter le namespace partagé toi-même au runtime — il fusionne :

```lua
Locale.Shared:Register("en", { common = { retry = "Retry" } });
Locale.Shared:Register("fr", { common = { retry = "Réessayer" } });
```

### Clés partagées intégrées

`common.*` — `yes, no, ok, cancel, confirm, save, delete, edit, remove, add, create, close, back, next, previous, search, loading, settings, error, success, warning, info, enabled, disabled, none, all, name, description`
· `time.*` — `now, today, yesterday, tomorrow`

### Contribuer une langue au pack partagé

Le namespace partagé est **global à chaque package**, donc le pack reste petit et universel. Pour ajouter ou compléter une langue :

1. Ajoute `Shared/locales/<code>.lua` retournant une table `LocaleTranslations` — reflète les clés de `en.lua` (la référence).
2. Ajoute une ligne dans `Shared/locales/Index.lua` : `load("<code>", "<code>.lua");`.
3. Garde des clés **préfixées et universelles** (`common.*`, `time.*`, `unit.*`). Tout ce qui est spécifique au jeu/package appartient au namespace propre de ce package, pas ici.

> **Ajouter un tout nouveau code de langue ?** La liste des codes est dupliquée dans 4 endroits qui doivent rester synchronisés (il n'y a pas de source partagée entre les VM Lua et le bundle JS) :
> - `Shared/locale.types.lua` — l'alias `LocaleLanguage` (autocomplétion)
> - `Shared/locale.lua` — la table `Locale.Languages` (code → nom natif)
> - `Client/web/locale.js` — la const `LANGUAGES` (code → nom natif)
> - `Client/web/locale.d.ts` — le type `LocaleLanguage`
>
> N'importe quel code ISO 639-1 fonctionne déjà au runtime via `Register()` — mettre à jour ces 4 endroits ne fait que l'ajouter à l'autocomplétion et à la map de sélection `Locale.Languages`.

## Serveur : traduire par joueur

Côté serveur il n'y a pas de langue active, alors passe la langue du joueur explicitement en dernier argument :

```lua
local L <const> = Locale.Namespace("my-package");

-- Resolve the player's language however you store it (preference, DB, etc.).
local lang <const> = player:GetValue("language") or Locale.fallback;
Chat.SendMessage(player, L:t("welcome", { name = name }, lang));
```

## Changement de langue & événements

Côté client, la langue active suit le joueur automatiquement ; tu peux la lire et t'abonner aux changements :

```lua
-- Client side: the active language follows the player automatically.
local lang <const> = Locale.GetLanguage(); -- = Client.GetLanguage()

Locale.SetFallback("en"); -- fallback for missing keys

local off <const> = Locale.OnChange(function(language)
    print("Language changed:", language);
end);
-- off() to unsubscribe
```

## Web (WebUI) : même store, côté JS

### 1. Client Lua : attacher la WebUI

```lua
local ui <const> = WebUI("MyUI", "file:///web/index.html");
Locale.Attach(ui); -- pushes the store + language, follows Register/SetLanguage
```

### 2. Page web : charger `locale.js`

`locale.js` est livré dans ce package à `Client/web/locale.js`. Une WebUI résout les chemins `file:///` relativement **au dossier du package appelant**, donc le script doit se trouver à côté de ta page : **copie `Client/web/locale.js` dans le dossier WebUI de ton propre package** (ex. ton `Client/web/`, à côté d'`index.html`) et charge-le là.

> **TypeScript ?** Copie `Client/web/locale.d.ts` à côté — il type le global `window.Locale` (et exporte `LocaleNamespace`, `LocaleLanguage`, etc.).

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

`locale.js` se câble automatiquement au pont `window.Events` en jeu : il demande le store au chargement (`locale:request`) et écoute `locale:load` / `locale:language`.

### Dev navigateur (hors jeu)

`window.Events` est absent hors jeu — alimente le store manuellement :

```js
window.Locale.load({
  language: "fr",
  fallback: "en",
  data: { "my-package": { fr: { "menu.title": "Paramètres" } } },
});
```

## Référence API

### Lua — `Locale`

Autorité : **[Both]** = appelable côté serveur et client · **[Client]** = client uniquement (no-op côté serveur).

| Fonction | Autorité | Description |
|---|---|---|
| `Locale.Namespace(name)` | Both | Objet namespace mis en cache (locales par script). |
| `Locale.Shared` | Both | Namespace partagé prêt à l'emploi. |
| `Locale.Languages` | Both | Map code supporté -> nom d'affichage natif. |
| `Locale.Register(ns, lang, tbl)` | Both | Enregistre/fusionne des traductions (tables imbriquées OK). Re-synchronise les WebUI côté client. |
| `Locale.Translate(ns, key, params?, language?)` | Both | Traduit avec fallback + interpolation `{name}`. `language` remplace la langue active (serveur par joueur). |
| `Locale.Has(ns, key, language?)` | Both | La clé existe-t-elle (ns ou partagé) ? |
| `Locale.SetLanguage(lang)` / `GetLanguage()` | Both | Langue active (pilotée par le client ; serveur = défaut à l'échelle du realm). |
| `Locale.SetFallback(lang)` | Both | Langue de fallback. |
| `Locale.OnChange(cb)` | Both | Écoute les changements ; renvoie une fonction de désabonnement. |
| `Locale.Attach(webui)` / `Detach(webui)` | Client | Câble une WebUI au store. |

### Lua — objet namespace

Tous **[Both]** : `ns:Register(lang, tbl)` · `ns:Get(key, params?, language?)` / `ns:t(...)` · `ns:Has(key, language?)`

### JS — `window.Locale`

La WebUI tourne **uniquement côté client**, donc toutes les fonctions JS sont client/WebUI :

`namespace(name)` · `t(key, params?)` (partagé) · `translate(ns, key, params?)` · `has(ns, key)` · `setLanguage(lang)` / `getLanguage()` · `onChange(cb)` · `load(payload)` · `languages` (code -> nom natif)

## Interpolation

Les tokens sont `{name}` (nommé) ou `{1}` (positionnel). Un token sans valeur correspondante est laissé tel quel (aide au débogage).

```lua
print(L:t("msg", { count = 3 })); -- "You have 3 message(s)"  from "You have {count} message(s)"
```

## Voir aussi

- [nmrp-ui](/ui) — la WebUI à laquelle tu attaches le store de locales.
- [nmrp-locale sur GitHub](https://github.com/No-More-RP/nmrp-locale)

MIT © 2026 JustGodWork.
