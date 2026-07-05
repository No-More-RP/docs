// JSON-LD (schema.org) structured-data generators. These describe the page to
// search engines / rich-result crawlers — no visual impact. Everything is built
// from real page data so it stays consistent with the visible content.

import { SITE_URL, DISCORD_URL } from './site.js';

const ORG = {
  '@type': 'Organization',
  name: 'No More RP',
  url: 'https://github.com/No-More-RP',
};

const PUBLISHER = {
  '@type': 'Organization',
  name: 'NoMoreRP',
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/nmrp_full_512.png`,
  },
};

/** Landing page — the framework itself as a free developer application. */
export function softwareAppSchema(lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'NoMoreRP',
    description:
      lang === 'fr'
        ? 'Une base de gamemode MVC orientée objet pour nanos world, épaulée par des packages Lua sans dépendances (RPC, ORM, promesses, i18n).'
        : 'An object-oriented MVC gamemode base for nanos world, backed by dependency-free Lua packages for RPC, ORM, promises and i18n.',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'nanos world',
    url: lang === 'en' ? `${SITE_URL}/en` : `${SITE_URL}/`,
    inLanguage: lang,
    author: ORG,
    license: 'https://opensource.org/licenses/MIT',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    sameAs: ['https://github.com/No-More-RP', DISCORD_URL].filter(Boolean),
  };
}

/** A documentation page. */
export function techArticleSchema({ title, description, lang, url, image }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: title,
    description,
    inLanguage: lang,
    url,
    image,
    author: ORG,
    publisher: PUBLISHER,
  };
}

/** Breadcrumb trail; `crumbs` is an ordered [{ name, url }]. */
export function breadcrumbSchema(crumbs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
}
