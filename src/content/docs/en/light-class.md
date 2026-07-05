---
title: light-class
description: A lightweight single-file OOP library for Lua, vendored by nmrp-norm.
---

# light-class

A lightweight, single-file object-oriented programming (OOP) library for Lua.

## Features

- **Lightweight** — a single file with no dependencies.
- **Simple syntax** — an intuitive API for defining classes and inheritance.
- **Inheritance** — supports single inheritance through `class.extend`.
- **Metamethods** — automatically inherits metamethods (such as `__add`, `__tostring`, and so on) from superclasses.
- **Compatibility** — designed for Lua 5.1+, LuaJIT, and Lua 5.4 (it handles `__name` and `__tostring` formatting automatically).

## Installation

Copy the `light-class.lua` file into your project directory and require it.

You usually don't need to do this yourself: light-class is vendored and embedded directly into the [`nmrp-norm`](/en/docs/norm) bundle, so it ships with the package.

## Usage

Require the library once, then use `class.new` to declare a class and `class.extend` to derive from an existing one.

### Creating a class

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

`__init` is the constructor: it runs when you call the class like a function. Methods are declared with the `:` syntax so they receive `self`.

### Inheritance

Derive a class from another one with `class.extend`. Call the parent constructor explicitly to reuse its initialization.

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

Overridden methods (like `speak`) replace the parent version, while any method not overridden is inherited from the superclass.

## See also

- [nmrp-norm](/en/docs/norm) — the ORM package that vendors and embeds light-class.

MIT License.
