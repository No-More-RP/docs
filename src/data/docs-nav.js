// Ordered sidebar for the documentation, per language.
// The `slug` of each item matches a markdown file under src/content/docs/<lang>/<slug>.md.
// Keep both languages in the SAME order so prev/next and the language switch line up.

export const docsNav = {
  fr: [
    {
      group: 'Démarrer',
      items: [
        { slug: 'introduction', label: 'Introduction' },
        { slug: 'installation', label: 'Installation' },
      ],
    },
    {
      group: 'Packages core',
      items: [
        { slug: 'promise', label: 'nmrp-promise' },
        { slug: 'norm', label: 'nmrp-norm' },
        { slug: 'rpc', label: 'nmrp-rpc' },
        { slug: 'locale', label: 'nmrp-locale' },
      ],
    },
    {
      group: 'Game-mode',
      items: [
        { slug: 'nmrp', label: 'nmrp' },
      ],
    },
    {
      group: 'Add-ons & UI',
      items: [
        { slug: 'character-needs', label: 'nmrp-character-needs' },
        { slug: 'ui', label: 'nmrp-ui' },
      ],
    },
    {
      group: 'Utilitaires',
      items: [
        { slug: 'light-class', label: 'light-class' },
      ],
    },
  ],

  en: [
    {
      group: 'Get started',
      items: [
        { slug: 'introduction', label: 'Introduction' },
        { slug: 'installation', label: 'Installation' },
      ],
    },
    {
      group: 'Core packages',
      items: [
        { slug: 'promise', label: 'nmrp-promise' },
        { slug: 'norm', label: 'nmrp-norm' },
        { slug: 'rpc', label: 'nmrp-rpc' },
        { slug: 'locale', label: 'nmrp-locale' },
      ],
    },
    {
      group: 'Game mode',
      items: [
        { slug: 'nmrp', label: 'nmrp' },
      ],
    },
    {
      group: 'Add-ons & UI',
      items: [
        { slug: 'character-needs', label: 'nmrp-character-needs' },
        { slug: 'ui', label: 'nmrp-ui' },
      ],
    },
    {
      group: 'Utilities',
      items: [
        { slug: 'light-class', label: 'light-class' },
      ],
    },
  ],
};

// UI micro-copy for the docs chrome, per language.
export const docsUi = {
  fr: {
    docsLabel: 'Docs',
    onThisPage: 'Sur cette page',
    prev: 'Précédent',
    next: 'Suivant',
    editHint: 'Une erreur ? Ouvre une issue sur GitHub.',
    editPage: 'Modifier cette page sur GitHub',
    updatedOn: 'Mis à jour le',
    backToSite: 'Accueil',
    contributors: 'Contributeurs',
    roadmap: 'Roadmap',
    searchPlaceholder: 'Rechercher…',
  },
  en: {
    docsLabel: 'Docs',
    onThisPage: 'On this page',
    prev: 'Previous',
    next: 'Next',
    editHint: 'Spotted a mistake? Open an issue on GitHub.',
    editPage: 'Edit this page on GitHub',
    updatedOn: 'Last updated',
    backToSite: 'Home',
    contributors: 'Contributors',
    roadmap: 'Roadmap',
    searchPlaceholder: 'Search…',
  },
};
