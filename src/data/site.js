// Cross-domain links between the marketing site and the documentation.
//
// The site ships as a single build served on two hosts:
//   - nmrp.dev       → the landing page (/)
//   - docs.nmrp.dev  → the documentation (/introduction, /en/introduction, …)
//
// In `astro dev` everything is served from one localhost origin, so we keep the
// links relative (empty base). A production `astro build` bakes in the real
// absolute domains, so a link from one host correctly jumps to the other.
const DEV = import.meta.env.DEV;

export const SITE_URL = DEV ? "" : "https://nmrp.dev";
export const DOCS_URL = DEV ? "" : "https://docs.nmrp.dev";

// Community Discord invite (same on both hosts).
// TODO: replace with the real permanent invite link.
export const DISCORD_URL = "https://discord.gg/g8DPwXVNWR";
