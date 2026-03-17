import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { icon, Separator, Slider, Switch } from 'decantr/components';
import { createSignal, createEffect } from 'decantr/state';
import { getIconPath } from 'decantr/icons';
import { injectExplorerCSS } from './styles.js';
injectExplorerCSS();

const { div, h2, h3, p, span, section, pre, label } = tags;

// ─── Icon Groups (loaded from registry) ──────────────────────────
let ICON_GROUPS = [];
const GROUP_MAP = {};

async function ensureGroups() {
  if (ICON_GROUPS.length) return;
  try {
    const resp = await fetch('/__decantr/registry/icons.json');
    const reg = await resp.json();
    const groups = reg.groups || {};
    ICON_GROUPS = Object.entries(groups).map(([id, g]) => ({
      id, label: g.label, desc: g.description, icons: g.icons,
    }));
  } catch {
    ICON_GROUPS = [];
  }
  for (const g of ICON_GROUPS) for (const name of g.icons) GROUP_MAP[name] = g.id;
}

// Structural icons used internally by framework components
const STRUCTURAL = new Set([
  'chevron-down', 'chevron-up', 'chevron-left', 'chevron-right',
  'check', 'x', 'calendar', 'clock', 'search', 'arrow-up',
  'grip-vertical', 'info', 'check-circle', 'alert-triangle', 'x-circle',
]);

// ─── Weight/Fill Control Bar ────────────────────────────────────
function iconControlBar(weightSignal, filledSignal) {
  const [weight, setWeight] = weightSignal;
  const [filled, setFilled] = filledSignal;
  return div({ class: css('_flex _aic _gap4 _p3 _r2 _mb2') },
    div({ class: css('_flex _aic _gap2 _flex1 _maxw[400px]') },
      label({ class: css('_caption _fgmutedfg') }, 'Weight'),
      Slider({ min: 0.5, max: 4, step: 0.5, value: weight, showValue: true, onchange: setWeight })
    ),
    div({ class: css('_flex _aic _gap2') },
      Switch({ label: 'Filled', checked: filled, onchange: setFilled })
    )
  );
}

// ─── Icon Cell ──────────────────────────────────────────────────
function iconCell(name, navigateTo, weight, filled) {
  const groupId = GROUP_MAP[name] || ICON_GROUPS[0].id;
  return div({
    class: 'de-icon-cell' + (STRUCTURAL.has(name) ? ' de-structural' : ''),
    onclick: () => navigateTo(`/icons/${groupId}/${name}`),
    title: name,
  },
    icon(name, { size: '1.25rem', weight, filled }),
    span({ class: 'de-icon-cell-name' }, name)
  );
}

// ─── Icon Group View ────────────────────────────────────────────
export function IconGroupView(groupId, navigateTo) {
  const group = ICON_GROUPS.find(g => g.id === groupId);
  if (!group) return div({}, p({ class: css('_fgmutedfg') }, 'Group not found.'));

  const weightSignal = createSignal(2);
  const filledSignal = createSignal(false);
  const [weight] = weightSignal;
  const [filled] = filledSignal;

  const gridContainer = div({ class: 'de-icon-grid' });

  function rebuildGrid() {
    gridContainer.innerHTML = '';
    const w = weight();
    const f = filled();
    for (const name of group.icons) {
      gridContainer.appendChild(iconCell(name, navigateTo, w, f));
    }
  }

  rebuildGrid();
  createEffect(() => { weight(); filled(); rebuildGrid(); });

  return section({ class: css('_flex _col _gap4') },
    h2({ class: css('_heading4') }, `Icons \u2014 ${group.label}`),
    p({ class: css('_body _fgmutedfg') }, `${group.icons.length} icons. ${group.desc}`),
    iconControlBar(weightSignal, filledSignal),
    gridContainer
  );
}

// ─── Icon Detail View ───────────────────────────────────────────
export function IconDetail(iconName) {
  const svgPath = getIconPath(iconName);
  if (!svgPath) return div({}, p({ class: css('_fgmutedfg') }, `Unknown icon: ${iconName}`));

  const isStructural = STRUCTURAL.has(iconName);
  const weightSignal = createSignal(2);
  const filledSignal = createSignal(false);
  const [weight] = weightSignal;
  const [filled] = filledSignal;

  // Reactive preview + sizes
  const previewBox = div({ class: 'de-demo-box' });
  const sizesRow = div({ class: 'de-icon-preview-sizes' });
  const usageBlock = pre({ class: 'de-icon-code' });

  function rebuildPreview() {
    const w = weight();
    const f = filled();
    previewBox.innerHTML = '';
    previewBox.appendChild(icon(iconName, { size: '3rem', weight: w, filled: f }));
    sizesRow.innerHTML = '';
    for (const size of ['1rem', '1.25rem', '1.5rem', '2rem', '3rem']) {
      const cell = div({ class: 'de-icon-preview-size' },
        icon(iconName, { size, weight: w, filled: f }),
        span({ class: 'de-icon-preview-label' }, size)
      );
      sizesRow.appendChild(cell);
    }
    // Update usage snippets
    const wOpt = w !== 2 ? `, weight: ${w}` : '';
    const fOpt = f ? `, filled: true` : '';
    const optsStr = (wOpt || fOpt) ? `, {${wOpt}${fOpt} }` : '';
    usageBlock.textContent =
      `import { icon } from 'decantr/components';\n\n` +
      `// Default size (1.25em)\nicon('${iconName}'${optsStr})\n\n` +
      `// Custom size\nicon('${iconName}', { size: '2rem'${wOpt}${fOpt} })\n\n` +
      `// In a button\nButton({ 'aria-label': '${iconName}' }, icon('${iconName}'${optsStr}))`;
  }

  rebuildPreview();
  createEffect(() => { weight(); filled(); rebuildPreview(); });

  // SVG source
  const svgSource = div({ class: css('_flex _col _gap3') },
    h3({ class: css('_heading6') }, 'SVG Source'),
    pre({ class: 'de-icon-code' }, svgPath)
  );

  return div({ class: css('_flex _col _gap6') },
    div({ class: css('_flex _aic _gap4 _mb2') },
      previewBox,
      div({ class: css('_flex _col _gap1') },
        h2({ class: css('_heading4') }, iconName),
        isStructural
          ? span({ class: css('_caption _fgprimary') }, 'Structural \u2014 used by framework components')
          : null
      )
    ),
    iconControlBar(weightSignal, filledSignal),
    div({ class: css('_flex _col _gap3') },
      h3({ class: css('_heading6') }, 'Sizes'),
      sizesRow
    ),
    Separator({}),
    div({ class: css('_flex _col _gap3') },
      h3({ class: css('_heading6') }, 'Usage'),
      usageBlock
    ),
    Separator({}),
    svgSource
  );
}

// ─── Sidebar Data Loader ────────────────────────────────────────
export async function loadIconItems() {
  await ensureGroups();
  return ICON_GROUPS.map(g => ({
    id: g.id,
    label: g.label,
  }));
}
