# NoMoreRP — Landing page (Astro)

Static, bilingual (FR / EN) landing page for **NoMoreRP**, the MVC roleplay
gamemode framework for [nanos world](https://nanos.gg), and its ecosystem of
dependency-free Lua packages ([github.com/No-More-RP](https://github.com/No-More-RP)).

## Run locally

```bash
npm install
npm run dev      # http://localhost:4321
```

## Build

```bash
npm run build    # outputs static site to ./dist
npm run preview  # serve the built site locally
```

## Structure

```
src/
  data/i18n.js            all copy, per language (edit here to change text)
  layouts/Base.astro      <head>, fonts, global resets & keyframes
  components/Landing.astro the whole page (markup + scoped styles)
  pages/
    index.astro           French route  (/)
    en.astro              English route (/en)
public/
  nmrp_full_512.png       logo / favicon
```

## Language switching

The page is fully static — each language is its own prerendered route.
The **FR / EN** toggle in the nav are plain links between `/` and `/en`,
so there is no client-side JavaScript and no flash of untranslated content.
To add a language: add a dictionary to `src/data/i18n.js` and a matching
page under `src/pages/`.

## Editing content

All text lives in `src/data/i18n.js` (`dict.fr` and `dict.en`). Feature,
module and install-step lists are plain arrays — add or remove items there
and the layout adapts automatically.

## Deploy

The `dist/` folder is a plain static site — host it on any static host
(Netlify, Vercel, Cloudflare Pages, GitHub Pages, …). For GitHub Pages under
a sub-path, set `base` in `astro.config.mjs`; all asset URLs already use
`import.meta.env.BASE_URL`.
