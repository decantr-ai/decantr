import { createSignal, createEffect } from 'decantr/state';
import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Input } from 'decantr/components';
import { injectExplorerCSS } from './styles.js';
injectExplorerCSS();

const { div, h2, p, span, section, code, small } = tags;

// Atom categories — loaded from registry, cached locally
let atomCategories = null;

// ─── CSS property hints for common atom prefixes ─────────────
const ATOM_CSS_HINTS = {
  _flex: 'display: flex', _grid: 'display: grid', _block: 'display: block',
  _inline: 'display: inline', _relative: 'position: relative', _absolute: 'position: absolute',
  _fixed: 'position: fixed', _sticky: 'position: sticky', _none: 'display: none',
  _invisible: 'visibility: hidden',
  _p: 'padding', _m: 'margin', _gap: 'gap', _sp: 'spacing scale',
  _w: 'width', _h: 'height', _min: 'min-width/height', _max: 'max-width/height',
  _text: 'font-size', _heading: 'heading scale', _body: 'body text', _caption: 'caption text',
  _label: 'label text', _overline: 'overline text', _fw: 'font-weight', _lh: 'line-height',
  _ls: 'letter-spacing', _font: 'font-family', _fontmono: 'font-family: monospace',
  _fg: 'color', _bg: 'background', _bc: 'border-color',
  _border: 'border', _b1: 'border: 1px', _radius: 'border-radius',
  _shadow: 'box-shadow', _opacity: 'opacity', _blur: 'filter: blur', _overflow: 'overflow',
  _pointer: 'cursor: pointer', _select: 'user-select', _cursor: 'cursor', _transition: 'transition',
  _aic: 'align-items: center', _jcc: 'justify-content: center', _jcsb: 'justify-content: space-between',
  _center: 'center both', _tc: 'text-align: center', _tl: 'text-align: left', _tr: 'text-align: right',
  '_sm:': '@media (sm)', '_md:': '@media (md)', '_lg:': '@media (lg)', '_xl:': '@media (xl)',
};

function getHint(atom) {
  if (ATOM_CSS_HINTS[atom]) return ATOM_CSS_HINTS[atom];
  // Match longest prefix
  for (const [prefix, hint] of Object.entries(ATOM_CSS_HINTS)) {
    if (atom.startsWith(prefix)) return hint;
  }
  return null;
}

// ─── Preview strategy per category ───────────────────────────

function renderChildBoxes(sizes) {
  return (sizes || [1, 2, 3]).map(i =>
    div({ class: css(`_w[var(--d-sp-6)] _h[var(--d-sp-4)] _bgprimary _r[var(--d-radius-sm)] _op[${0.4 + i * 0.2}]`) })
  );
}

function renderLayoutPreview(atom) {
  if (atom === '_none' || atom === '_invisible') {
    return div({ class: css('_p2 _fgmutedfg _caption') }, ATOM_CSS_HINTS[atom] || atom);
  }
  return div({ class: 'de-atom-preview ' + css('_p2') },
    div({ class: css(atom + ' _gap2 _p2 _border _bcborder _minh[var(--d-sp-8)] _r[var(--d-radius-inner)]') },
      ...renderChildBoxes()
    )
  );
}

function renderSpacingPreview(atom) {
  // Show nested boxes to visualize padding/margin/gap
  if (atom.startsWith('_gap')) {
    return div({ class: 'de-atom-preview ' + css('_p2') },
      div({ class: css('_flex ' + atom + ' _border _bcborder _p1 _r[var(--d-radius-inner)]') },
        div({ class: css('_w[var(--d-sp-4)] _h[var(--d-sp-4)] _bgprimary _r[var(--d-radius-sm)] _op[0.7]') }),
        div({ class: css('_w[var(--d-sp-4)] _h[var(--d-sp-4)] _bgprimary _r[var(--d-radius-sm)] _op[0.9]') }),
        div({ class: css('_w[var(--d-sp-4)] _h[var(--d-sp-4)] _bgprimary _r[var(--d-radius-sm)]') })
      )
    );
  }
  // Padding/margin: show a box with the spacing applied
  return div({ class: 'de-atom-preview ' + css('_p2') },
    div({ class: css(atom + ' _border _bcborder _bg[var(--d-primary-subtle)] _r[var(--d-radius-inner)]') },
      div({ class: css('_bgprimary _r[var(--d-radius-sm)] _h[var(--d-sp-4)] _op[0.6]') })
    )
  );
}

function renderSizingPreview(atom) {
  return div({ class: 'de-atom-preview ' + css('_p2') },
    div({ class: css(atom + ' _border _bcborder _bg[var(--d-primary-subtle)] _r[var(--d-radius-inner)] _minh[var(--d-sp-4)]') })
  );
}

function renderTypographyPreview(atom) {
  return div({ class: 'de-atom-preview ' + css('_p2') },
    span({ class: css(atom) }, 'Aa Bb 123')
  );
}

function renderColorPreview(atom) {
  if (atom.startsWith('_fg')) {
    return div({ class: 'de-atom-preview ' + css('_p2') },
      span({ class: css(atom + ' _heading5') }, 'Aa')
    );
  }
  if (atom.startsWith('_bg')) {
    return div({ class: 'de-atom-preview ' + css('_p2') },
      div({ class: css(atom + ' _radius _w[var(--d-sp-10)] _h[var(--d-sp-6)] _b1 _bcborder') })
    );
  }
  // border-color
  return div({ class: 'de-atom-preview ' + css('_p2') },
    div({ class: css(atom + ' _border _radius _w[var(--d-sp-10)] _h[var(--d-sp-6)] _bw[2px]') })
  );
}

function renderBorderPreview(atom) {
  return div({ class: 'de-atom-preview ' + css('_p2') },
    div({ class: css(atom + ' _bcborder _w[var(--d-sp-10)] _h[var(--d-sp-6)] _bg[var(--d-primary-subtle)]') })
  );
}

function renderEffectPreview(atom) {
  return div({ class: 'de-atom-preview ' + css('_p2') },
    div({ class: css(atom + ' _radius _w[var(--d-sp-10)] _h[var(--d-sp-6)] _bg[var(--d-surface-1)] _b1 _bcborder') })
  );
}

function renderAlignmentPreview(atom) {
  return div({ class: 'de-atom-preview ' + css('_p2') },
    div({ class: css('_flex ' + atom + ' _gap1 _border _bcborder _p1 _h[var(--d-sp-10)] _r[var(--d-radius-inner)]') },
      div({ class: css('_w[var(--d-sp-3)] _h[var(--d-sp-3)] _bgprimary _r[var(--d-radius-sm)] _op[0.6]') }),
      div({ class: css('_w[var(--d-sp-3)] _h[var(--d-sp-6)] _bgprimary _r[var(--d-radius-sm)] _op[0.8]') }),
      div({ class: css('_w[var(--d-sp-3)] _h[var(--d-sp-4)] _bgprimary _r[var(--d-radius-sm)]') })
    )
  );
}

function renderBadgePreview(atom) {
  return div({ class: css('_p2 _fgmutedfg _caption') }, getHint(atom) || atom);
}

// Map category IDs to preview strategies
const PREVIEW_STRATEGY = {
  layout: renderLayoutPreview,
  spacing: renderSpacingPreview,
  sizing: renderSizingPreview,
  typography: renderTypographyPreview,
  color: renderColorPreview,
  border: renderBorderPreview,
  effects: renderEffectPreview,
  interaction: renderBadgePreview,
  alignment: renderAlignmentPreview,
  responsive: renderBadgePreview,
};

// ─── Data loading ────────────────────────────────────────────

async function loadAtomCategories() {
  if (atomCategories) return atomCategories;
  try {
    const resp = await fetch('/__decantr/registry/atoms.json');
    const data = await resp.json();
    atomCategories = {};
    for (const [id, cat] of Object.entries(data.categories || {})) {
      atomCategories[id] = { label: cat.label, prefix: cat.prefixes || cat.prefix || [] };
    }
  } catch {
    atomCategories = {};
  }
  return atomCategories;
}

// ─── Explorer component ──────────────────────────────────────

export function AtomsExplorer(category) {
  const [filter, setFilter] = createSignal('');
  const container = div({ id: 'atoms-' + category, class: css('_flex _col _gap4') },
    p({ class: css('_body _fgmutedfg') }, 'Loading atoms...')
  );

  loadAtomCategories().then(categories => {
    const cat = categories[category];
    const catLabel = cat ? cat.label : 'All';
    const previewFn = PREVIEW_STRATEGY[category] || renderBadgePreview;

    const filterInput = Input({
      placeholder: `Filter ${catLabel.toLowerCase()} atoms...`,
      oninput: (e) => setFilter(e.target.value)
    });

    const grid = div({ class: 'de-atom-grid' });

    function renderAtoms() {
      grid.innerHTML = '';
      const prefixes = cat ? cat.prefix : [];
      const q = filter().toLowerCase();
      const filtered = q ? prefixes.filter(a => a.toLowerCase().includes(q)) : prefixes;

      for (const atom of filtered) {
        const hint = getHint(atom);
        const card = div({ class: 'de-atom-card' },
          code({ class: 'de-atom-name' }, atom),
          hint ? small({ class: 'de-atom-hint' }, hint) : null,
          previewFn(atom)
        );
        grid.appendChild(card);
      }

      if (filtered.length === 0) {
        grid.appendChild(p({ class: css('_fgmutedfg _body _p4') }, 'No atoms matching filter.'));
      }
    }

    createEffect(() => { filter(); renderAtoms(); });

    container.innerHTML = '';
    container.appendChild(section({ class: css('_flex _col _gap4') },
      div({ class: css('_flex _col _gap1') },
        h2({ class: css('_heading4') }, `Atoms — ${catLabel}`),
        p({ class: css('_body _fgmutedfg') }, '1000+ atomic CSS utility classes. Each prefixed with _ for namespace safety.')
      ),
      filterInput,
      grid
    ));
  });

  return container;
}

export async function loadAtomItems() {
  const categories = await loadAtomCategories();
  return Object.entries(categories).map(([id, cat]) => ({
    id, label: cat.label
  }));
}
