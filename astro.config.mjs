import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkCallouts from './src/plugins/remark-callouts.mjs';

// The site ships as ONE build served on two hosts:
//   - nmrp.dev       → the landing page (/ and /en)
//   - docs.nmrp.dev  → the documentation (everything else)
const SITE = 'https://nmrp.dev';
const DOCS = 'https://docs.nmrp.dev';

const isLanding = (pathname) =>
  pathname === '/' || pathname === '/en' || pathname === '/en/';

// https://astro.build/config
export default defineConfig({
  // Static site — outputs to ./dist on `npm run build`
  site: SITE,
  integrations: [
    sitemap({
      // Drop the generated Open Graph image routes — they aren't pages.
      filter: (page) => !page.includes('/og/'),
      // Landing URLs stay on nmrp.dev; every doc page moves to docs.nmrp.dev.
      serialize(item) {
        const { pathname } = new URL(item.url);
        if (!isLanding(pathname)) item.url = DOCS + pathname;
        return item;
      },
    }),
  ],
  markdown: {
    // GitHub-style admonitions: > [!NOTE] / [!TIP] / [!WARNING] …
    remarkPlugins: [remarkCallouts],
    // Syntax highlighting tuned to the dark, cyan-accented brand.
    // The panel background is overridden to #0d0f14 in DocsLayout.astro.
    shikiConfig: {
      theme: 'one-dark-pro',
      wrap: false,
    },
  },
});
