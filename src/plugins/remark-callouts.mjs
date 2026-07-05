// Remark plugin: GitHub-style admonitions.
//
//   > [!NOTE] / [!TIP] / [!IMPORTANT] / [!WARNING] / [!CAUTION]
//   > body…
//
// turns the blockquote into a titled, coloured callout (<div class="callout …">).
// Titles are localized from the source file path (…/fr/… vs …/en/…).

const LABELS = {
  note: { fr: 'Note', en: 'Note' },
  tip: { fr: 'Astuce', en: 'Tip' },
  important: { fr: 'Important', en: 'Important' },
  warning: { fr: 'Attention', en: 'Warning' },
  caution: { fr: 'Attention', en: 'Caution' },
};

const S =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';

const ICONS = {
  note: `${S}<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5h.01"/></svg>`,
  tip: `${S}<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.7 10.7c.5.4.9 1 1 1.7l.1.6h5.2l.1-.6c.1-.7.5-1.3 1-1.7A6 6 0 0 0 12 3z"/></svg>`,
  important: `${S}<path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  warning: `${S}<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>`,
  caution: `${S}<path d="M7.9 2h8.2L22 7.9v8.2L16.1 22H7.9L2 16.1V7.9z"/><path d="M15 9l-6 6M9 9l6 6"/></svg>`,
};

// Recursively find every blockquote node.
function eachBlockquote(node, fn) {
  if (!node || !Array.isArray(node.children)) return;
  for (const child of node.children) {
    if (child.type === 'blockquote') fn(child);
    eachBlockquote(child, fn);
  }
}

export default function remarkCallouts() {
  return (tree, file) => {
    const path = (file && (file.path || (file.history && file.history[0]))) || '';
    const lang = /[\\/]en[\\/]/.test(path) ? 'en' : 'fr';

    eachBlockquote(tree, (bq) => {
      const para = bq.children && bq.children[0];
      if (!para || para.type !== 'paragraph') return;
      const first = para.children && para.children[0];
      if (!first || first.type !== 'text') return;

      const m = first.value.match(
        /^\[!(note|tip|important|warning|caution)\]\s*/i,
      );
      if (!m) return;
      const type = m[1].toLowerCase();

      // Strip the marker; drop the now-empty leading text / paragraph.
      first.value = first.value.slice(m[0].length);
      if (first.value === '') {
        para.children.shift();
        if (para.children[0] && para.children[0].type === 'break')
          para.children.shift();
        if (para.children.length === 0) bq.children.shift();
      }

      // Render the blockquote as a callout <div> and prepend the title.
      bq.data = bq.data || {};
      bq.data.hName = 'div';
      bq.data.hProperties = { className: ['callout', `callout-${type}`] };
      bq.children.unshift({
        type: 'html',
        value: `<div class="callout-title">${ICONS[type]}<span>${LABELS[type][lang]}</span></div>`,
      });
    });
  };
}
