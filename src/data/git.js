// Build-time helper: last git commit date (ISO) for a file. Returns null if git
// isn't available (e.g. a checkout without history) so callers can degrade
// gracefully. Memoized per build.
import { execSync } from 'node:child_process';

const cache = new Map();

export function lastCommitDate(file) {
  if (cache.has(file)) return cache.get(file);
  let iso = null;
  try {
    const out = execSync(`git log -1 --format=%cI -- "${file}"`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (out) iso = out;
  } catch {
    /* git missing or no history — leave null */
  }
  cache.set(file, iso);
  return iso;
}
