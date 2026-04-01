import { h } from '@decantr/ui/runtime';
import { createSignal, createEffect } from '@decantr/ui/state';
import { setStyle, getStyleList, getStyle } from '@decantr/ui/css';
import { Button, Card, Badge, Input } from '@decantr/ui/components';
import { getAllStories } from '@decantr/ui-catalog';
import { getIconNames } from '@decantr/ui/icons';
import { icon } from '@decantr/ui/components';

// ============================================================
// Shared styles
// ============================================================

const SECTION_HEADING = 'margin: 0 0 12px; font-size: 18px; font-weight: 600';
const SECTION_WRAP = 'padding: 0 0 24px; border-bottom: 1px solid rgba(255,255,255,0.08)';
const CARD_GRID = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px';
const H_STRIP = 'display: flex; gap: 16px; flex-wrap: wrap';
const LABEL_STYLE = 'font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.6; margin: 0 0 8px';

// ============================================================
// Helpers
// ============================================================

/** Render a small sample set of components for comparison panels */
function sampleComponents() {
  return h('div', { style: 'display: flex; flex-direction: column; gap: 10px' },
    Button({ label: 'Primary', variant: 'primary', size: 'sm' }),
    Button({ label: 'Secondary', variant: 'secondary', size: 'sm' }),
    Badge({ label: 'Badge' }),
    Input({ placeholder: 'Input field...', size: 'sm' }),
  );
}

/** Create a labelled panel wrapper */
function labelledPanel(label, child, extraStyle) {
  return h('div', { style: `flex: 1; min-width: 200px; ${extraStyle || ''}` },
    h('p', { style: LABEL_STYLE }, label),
    child,
  );
}

// ============================================================
// Section: Theme Gallery
// ============================================================

function ThemeGallery() {
  const styleList = getStyleList();
  const currentStyleSignal = getStyle();

  const cards = styleList.map((s) => {
    const card = h('div', {
      style: 'padding: 16px; border-radius: 8px; border: 2px solid transparent; cursor: pointer; background: rgba(255,255,255,0.04); transition: border-color 0.15s',
    },
      h('h4', { style: 'margin: 0 0 12px; font-size: 14px' }, s.name),
      sampleComponents(),
    );

    card.addEventListener('click', () => setStyle(s.id));

    createEffect(() => {
      const active = currentStyleSignal() === s.id;
      card.style.borderColor = active ? 'var(--color-primary, #3b82f6)' : 'transparent';
    });

    return card;
  });

  return h('section', { style: SECTION_WRAP },
    h('h3', { style: SECTION_HEADING }, 'Theme Gallery'),
    h('div', { style: CARD_GRID }, ...cards),
  );
}

// ============================================================
// Section: Mode Comparison
// ============================================================

function ModeComparison() {
  const lightPanel = h('div', { 'data-mode': 'light', style: 'flex: 1; min-width: 240px; padding: 16px; border-radius: 8px; background: #f8f8f8; color: #1a1a1a' },
    sampleComponents(),
  );

  const darkPanel = h('div', { 'data-mode': 'dark', style: 'flex: 1; min-width: 240px; padding: 16px; border-radius: 8px; background: #1a1a1a; color: #f0f0f0' },
    sampleComponents(),
  );

  return h('section', { style: SECTION_WRAP },
    h('h3', { style: SECTION_HEADING }, 'Mode Comparison'),
    h('div', { style: H_STRIP },
      labelledPanel('Light', lightPanel),
      labelledPanel('Dark', darkPanel),
    ),
  );
}

// ============================================================
// Section: Density Comparison
// ============================================================

function DensityComparison() {
  const densities = [
    { label: 'Compact', cls: 'd-density-compact' },
    { label: 'Comfortable', cls: 'd-density-comfortable' },
    { label: 'Spacious', cls: 'd-density-spacious' },
  ];

  const panels = densities.map((d) => {
    const panel = h('div', { class: d.cls, style: 'flex: 1; min-width: 200px; padding: 16px; border-radius: 8px; background: rgba(255,255,255,0.04)' },
      sampleComponents(),
    );
    return labelledPanel(d.label, panel);
  });

  return h('section', { style: SECTION_WRAP },
    h('h3', { style: SECTION_HEADING }, 'Density Comparison'),
    h('div', { style: H_STRIP }, ...panels),
  );
}

// ============================================================
// Section: Shape Comparison
// ============================================================

function ShapeComparison() {
  const shapes = ['sharp', 'rounded', 'pill'];

  const panels = shapes.map((shape) => {
    const radiusMap = { sharp: '0px', rounded: '8px', pill: '999px' };
    const r = radiusMap[shape];
    const panel = h('div', { style: `flex: 1; min-width: 200px; padding: 16px; border-radius: 8px; background: rgba(255,255,255,0.04)` },
      h('div', { style: 'display: flex; flex-direction: column; gap: 10px' },
        h('button', { style: `padding: 8px 16px; border: 1px solid rgba(255,255,255,0.2); border-radius: ${r}; background: var(--color-primary, #3b82f6); color: white; cursor: pointer; font-size: 13px` }, 'Button'),
        h('div', { style: `padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: ${r}; background: rgba(255,255,255,0.04); font-size: 13px` }, 'Card content'),
        h('input', { placeholder: 'Input...', style: `padding: 6px 10px; border: 1px solid rgba(255,255,255,0.2); border-radius: ${r}; background: rgba(0,0,0,0.2); color: inherit; font-size: 13px; width: 100%; box-sizing: border-box` }),
      ),
    );
    return labelledPanel(shape.charAt(0).toUpperCase() + shape.slice(1), panel);
  });

  return h('section', { style: SECTION_WRAP },
    h('h3', { style: SECTION_HEADING }, 'Shape Comparison'),
    h('div', { style: H_STRIP }, ...panels),
  );
}

// ============================================================
// Section: Icon Gallery
// ============================================================

function IconGallery() {
  const names = getIconNames();

  const items = names.map((name) => {
    return h('div', { style: 'display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px; border-radius: 6px; background: rgba(255,255,255,0.04); min-width: 72px' },
      icon(name, { size: 20 }),
      h('span', { style: 'font-size: 10px; opacity: 0.6; text-align: center; word-break: break-all' }, name),
    );
  });

  return h('section', { style: SECTION_WRAP },
    h('h3', { style: SECTION_HEADING }, `Icon Gallery (${names.length})`),
    h('div', { style: 'display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 8px' }, ...items),
  );
}

// ============================================================
// Section: Statistics
// ============================================================

function Statistics() {
  const stories = getAllStories();
  const iconNames = getIconNames();
  const styleList = getStyleList();

  const stats = [
    { label: 'Components', value: stories.length },
    { label: 'Icons', value: iconNames.length },
    { label: 'Styles', value: styleList.length },
  ];

  const cards = stats.map((s) =>
    h('div', { style: 'flex: 1; min-width: 120px; padding: 16px; border-radius: 8px; background: rgba(255,255,255,0.04); text-align: center' },
      h('div', { style: 'font-size: 28px; font-weight: 700; margin-bottom: 4px' }, String(s.value)),
      h('div', { style: 'font-size: 12px; opacity: 0.6; text-transform: uppercase; letter-spacing: 0.05em' }, s.label),
    ),
  );

  return h('section', { style: SECTION_WRAP },
    h('h3', { style: SECTION_HEADING }, 'Statistics'),
    h('div', { style: 'display: flex; gap: 16px; flex-wrap: wrap' }, ...cards),
  );
}

// ============================================================
// Explorer View (root)
// ============================================================

export function ExplorerView() {
  return h('div', { style: 'padding: 24px; overflow: auto; display: flex; flex-direction: column; gap: 28px' },
    h('h2', { style: 'margin: 0; font-size: 22px; font-weight: 700' }, 'Design System Explorer'),
    Statistics(),
    ThemeGallery(),
    ModeComparison(),
    DensityComparison(),
    ShapeComparison(),
    IconGallery(),
  );
}
