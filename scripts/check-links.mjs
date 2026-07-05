// Broken-link check over the built site (dist/). Validates every root-relative
// internal href/src (e.g. /promise, /en/norm, /nmrp_full_512.png) resolves to a
// real file. External URLs, hashes, mailto: and data: are skipped. Run after
// `pnpm build`. Exits non-zero if any internal link is broken.
import fs from 'node:fs';
import path from 'node:path';

const DIST = 'dist';

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

function isFile(p) {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

function resolves(link) {
  let p = link.split('#')[0].split('?')[0];
  if (!p) return true;
  try {
    p = decodeURIComponent(p);
  } catch {}
  const base = path.join(DIST, p);
  return (
    isFile(base) || isFile(base + '.html') || isFile(path.join(base, 'index.html'))
  );
}

const SKIP = /^(https?:|\/\/|#|mailto:|tel:|data:|javascript:)/i;

const files = walk(DIST);
const broken = [];
const attrRe = /(?:href|src)="([^"]*)"/g;

for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  const seen = new Set();
  let m;
  while ((m = attrRe.exec(html))) {
    const link = m[1];
    if (!link || seen.has(link)) continue;
    seen.add(link);
    if (SKIP.test(link)) continue;
    if (link.startsWith('/') && !resolves(link)) {
      broken.push(`${path.relative(DIST, f)}  →  ${link}`);
    }
  }
}

if (broken.length) {
  console.error(`\n✗ ${broken.length} broken internal link(s):`);
  broken.forEach((b) => console.error('  ' + b));
  process.exit(1);
}
console.log(`✓ ${files.length} pages checked — no broken internal links.`);
