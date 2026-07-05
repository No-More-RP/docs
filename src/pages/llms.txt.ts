// /llms.txt — a concise, LLM-friendly index of the documentation.
// See https://llmstxt.org. The full content lives in /llms-full.txt.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { docsNav } from '../data/docs-nav.js';
import { DOCS_URL } from '../data/site.js';

const BASE = DOCS_URL || 'https://docs.nmrp.dev';

export const GET: APIRoute = async () => {
  const entries = await getCollection('docs');
  const byId = new Map(entries.map((e) => [e.id.replace(/\.md$/, ''), e]));

  const line = (lang: 'fr' | 'en', item: { slug: string; label: string }) => {
    const e = byId.get(`${lang}/${item.slug}`);
    const path = lang === 'en' ? `/en/${item.slug}` : `/${item.slug}`;
    const desc = e?.data.description ? `: ${e.data.description}` : '';
    return `- [${item.label}](${BASE}${path})${desc}`;
  };

  let out = `# NoMoreRP\n\n`;
  out += `> An object-oriented MVC gamemode base for nanos world, backed by dependency-free Lua packages for RPC, ORM, promises and i18n.\n\n`;

  out += `## Documentation\n\n`;
  for (const g of docsNav.en) for (const it of g.items) out += line('en', it) + '\n';

  out += `\n## Documentation (Français)\n\n`;
  for (const g of docsNav.fr) for (const it of g.items) out += line('fr', it) + '\n';

  out += `\n## Optional\n\n`;
  out += `- [Full documentation as a single file](${BASE}/llms-full.txt)\n`;

  return new Response(out, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
