import { getCollection } from 'astro:content';
import { OGImageRoute } from 'astro-og-canvas';

// Every docs page (fr/ + en/) gets a branded 1200×630 Open Graph card,
// generated at build time. Two synthetic "home" entries cover the landing page.
const entries = await getCollection('docs');

const pages: Record<string, { title: string; description?: string }> = {
  home: {
    title: 'NoMoreRP',
    description: 'Un framework roleplay MVC orienté objet pour nanos world.',
  },
  'en/home': {
    title: 'NoMoreRP',
    description: 'An object-oriented MVC roleplay framework for nanos world.',
  },
  ...Object.fromEntries(
    entries.map((e) => [e.id.replace(/\.md$/, ''), e.data]),
  ),
};

export const { getStaticPaths, GET } = OGImageRoute({
  param: 'route',
  pages,
  // key "fr/introduction" → "/og/fr/introduction.png"
  getSlug: (path) => `${path}.png`,
  getImageOptions: (_path, page) => ({
    title: page.title,
    description:
      page.description ?? 'MVC roleplay framework for nanos world',
    logo: { path: './public/nmrp_full_512.png', size: [76] },
    // Brand background (#0a0c10 → #08090c) with a cyan accent edge.
    bgGradient: [
      [10, 12, 16],
      [8, 9, 12],
    ],
    border: { color: [61, 214, 243], width: 12, side: 'block-end' },
    padding: 72,
    font: {
      title: {
        color: [242, 244, 248],
        size: 66,
        weight: 'Bold',
        lineHeight: 1.1,
        families: ['Inter'],
      },
      description: {
        color: [154, 159, 166],
        size: 31,
        weight: 'Normal',
        lineHeight: 1.4,
        families: ['Inter'],
      },
    },
    fonts: ['./src/fonts/Inter-Regular.ttf', './src/fonts/Inter-Bold.ttf'],
  }),
});
