// Config for the contributors page. The list is fetched client-side (from the
// GitHub API) and cached in localStorage for 24h — see Contributors.astro.

export const ORG = 'No-More-RP';

// Used only if the live org repo listing can't be fetched.
export const FALLBACK_REPOS = [
  'nmrp',
  'nmrp-promise',
  'nmrp-norm',
  'nmrp-rpc',
  'nmrp-locale',
  'nmrp-character-needs',
];

// Highlighted roles → a badge on the contributors page.
// Keys are GitHub logins (lower-case); value is a role key.
export const TEAM = {
  justgodwork: 'core',
  thibaultpointurier: 'core',
};

// Lower = higher in the list. Team members are pinned above everyone else.
export const ROLE_PRIORITY = { core: 0, maintainer: 1 };
