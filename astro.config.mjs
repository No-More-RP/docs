import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Static site — outputs to ./dist on `npm run build`
  markdown: {
    // Syntax highlighting tuned to the dark, cyan-accented brand.
    // The panel background is overridden to #0d0f14 in DocsLayout.astro.
    shikiConfig: {
      theme: 'one-dark-pro',
      wrap: false,
    },
  },
});
