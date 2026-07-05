// Contributors are fetched from the GitHub API at build time, aggregated across
// ALL public repositories of the No-More-RP organization (forks excluded) and
// deduplicated per user. New repos are picked up automatically — nothing to
// maintain here. Unauthenticated calls are rate-limited (60/h), which is plenty
// for a build. Every failure mode degrades gracefully: the org listing falls
// back to a known core set, a repo that errors is skipped, and if everything
// fails the page shows an empty state.

const ORG = "No-More-RP";

// Used only if the live org repo listing can't be fetched.
const FALLBACK_REPOS = [
  "nmrp",
  "nmrp-promise",
  "nmrp-norm",
  "nmrp-rpc",
  "nmrp-locale",
  "nmrp-character-needs",
  "docs",
];

// Optional token (GITHUB_TOKEN / GH_TOKEN) lifts the API limit from 60 to
// 5000 req/h — set it in `.env` for local builds or in the deploy environment.
// `import.meta.env` reads it from `.env` (Astro/Vite); `process.env` covers a
// real OS/Docker env var. This module is only ever used at build time, so the
// token never reaches the browser.
const TOKEN =
  import.meta.env.GITHUB_TOKEN ||
  import.meta.env.GH_TOKEN ||
  (typeof process !== "undefined" &&
    (process.env.GITHUB_TOKEN || process.env.GH_TOKEN)) ||
  "";

const gh = (path) =>
  fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "nmrp-docs",
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
  });

async function listOrgRepos() {
  try {
    const res = await gh(`/orgs/${ORG}/repos?per_page=100&type=public`);
    if (!res.ok) return FALLBACK_REPOS;
    const list = await res.json();
    if (!Array.isArray(list) || list.length === 0) return FALLBACK_REPOS;
    // Skip forks — we only want the org's own projects.
    return list.filter((r) => !r.fork).map((r) => r.name);
  } catch {
    return FALLBACK_REPOS;
  }
}

// Memoize across page renders so a single build fetches only once
// (the FR and EN contributor pages share the same result).
let cache;
export function getContributors() {
  if (!cache) cache = fetchContributors();
  return cache;
}

async function fetchContributors() {
  const byLogin = new Map();
  const repos = await listOrgRepos();

  await Promise.allSettled(
    repos.map(async (repo) => {
      const res = await gh(`/repos/${ORG}/${repo}/contributors?per_page=100`);
      if (!res.ok) return;
      const list = await res.json();
      if (!Array.isArray(list)) return;

      for (const c of list) {
        if (c.type !== "User") continue; // skip bots (dependabot, etc.)
        const cur = byLogin.get(c.login) || {
          login: c.login,
          avatar: c.avatar_url,
          url: c.html_url,
          contributions: 0,
        };
        cur.contributions += c.contributions || 0;
        byLogin.set(c.login, cur);
      }
    }),
  );

  return [...byLogin.values()].sort(
    (a, b) => b.contributions - a.contributions,
  );
}
