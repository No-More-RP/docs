---
title: light-class
description: Une petite bibliothèque OOP mono-fichier pour Lua, embarquée par nmrp-norm.
---

# light-class

Une bibliothèque de programmation orientée objet (OOP) légère et mono-fichier pour Lua.

## Fonctionnalités

- **Légère** — un seul fichier, sans aucune dépendance.
- **Syntaxe simple** — une API intuitive pour définir des classes et de l'héritage.
- **Héritage** — supporte l'héritage simple via `class.extend`.
- **Métaméthodes** — hérite automatiquement des métaméthodes (comme `__add`, `__tostring`, etc.) des classes parentes.
- **Compatibilité** — conçue pour Lua 5.1+, LuaJIT et Lua 5.4 (elle gère automatiquement le formatage de `__name` et `__tostring`).

## Installation

Copie le fichier `light-class.lua` dans ton projet, puis fais un `require` dessus.

En général tu n'as pas besoin de le faire toi-même : light-class est embarquée et intégrée directement dans le bundle [`nmrp-norm`](/docs/norm), donc elle est livrée avec le package.

## Utilisation

Fais un `require` de la bibliothèque une seule fois, puis utilise `class.new` pour déclarer une classe et `class.extend` pour dériver d'une classe existante.

### Créer une classe

```lua
local class = require("light-class")

-- Define a new class
local Dog = class.new("Dog")

-- Constructor
function Dog:__init(name)
    self.name = name
end

-- Method
function Dog:bark()
    print(self.name .. " says Woof!")
end

-- Instantiation
local myDog = Dog("Rex")
myDog:bark() -- Output: Rex says Woof!
```

`__init` est le constructeur : il s'exécute quand tu appelles la classe comme une fonction. Les méthodes se déclarent avec la syntaxe `:` pour recevoir `self`.

### Héritage

Dérive une classe d'une autre avec `class.extend`. Appelle explicitement le constructeur parent pour réutiliser son initialisation.

```lua
local Animal = class.new("Animal")

function Animal:__init(name)
    self.name = name
end

function Animal:speak()
    print("...")
end

-- Create a derived class
local Cat = class.extend("Cat", Animal)

function Cat:__init(name, color)
    -- Call super constructor
    Animal.__init(self, name)
    self.color = color
end

function Cat:speak()
    print(self.name .. " (color: " .. self.color .. ") meows.")
end

local myCat = Cat("Whiskers", "Black")
myCat:speak() -- Output: Whiskers (color: Black) meows.
```

Les méthodes surchargées (comme `speak`) remplacent la version du parent, tandis que toute méthode non surchargée est héritée de la classe parente.

## Voir aussi

- [nmrp-norm](/docs/norm) — le package ORM qui embarque et intègre light-class.

MIT License.
