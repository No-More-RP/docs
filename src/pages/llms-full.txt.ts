// /llms-full.txt — every documentation page concatenated as raw markdown,
// so an LLM can ingest the whole documentation in one request.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { docsNav } from '../data/docs-nav.js';
import { DOCS_URL } from '../data/site.js';

const BASE = DOCS_URL || 'https://docs.nmrp.dev';

export const GET: APIRoute = async () => {
  const entries = await getCollection('docs');
  const byId = new Map(entries.map((e) => [e.id.replace(/\.md$/, ''), e]));

  let out = `# NoMoreRP — Full documentation\n\n`;
  out += `> MVC gamemode base for nanos world. This file concatenates every documentation page (English first, then French).\n`;

  for (const lang of ['en', 'fr'] as const) {
    out += `\n\n\n# ${lang === 'en' ? 'English' : 'Français'}\n`;
    for (const g of docsNav[lang]) {
      for (const it of g.items) {
        const e = byId.get(`${lang}/${it.slug}`);
        if (!e) continue;
        const path = lang === 'en' ? `/en/${it.slug}` : `/${it.slug}`;
        out += `\n\n---\n\nSource: ${BASE}${path}\n\n${e.body.trim()}\n`;
      }
    }
  }

  return new Response(out, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
