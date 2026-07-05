import { defineCollection, z } from 'astro:content';

// A single bilingual "docs" collection.
// Language lives in the folder (fr/, en/); ordering lives in src/data/docs-nav.js.
const docs = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
});

export const collections = { docs };
