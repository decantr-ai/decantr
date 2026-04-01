import { h } from '@decantr/ui/runtime';
import { createSignal, createEffect } from '@decantr/ui/state';
import { setStyle, setMode, setShape, getStyleList } from '@decantr/ui/css';
import { Button, Card, Badge, Input } from '@decantr/ui/components';

const PAGE = 'max-width: 960px; margin: 0 auto; padding: 48px 24px';
const H1 = 'font-size: 32px; font-weight: 700; margin: 0 0 8px';
const SUB = 'font-size: 14px; color: var(--d-muted-fg, rgba(255,255,255,0.5)); margin: 0 0 32px';
const H2 = 'font-size: 22px; font-weight: 600; margin: 32px 0 16px; padding-bottom: 8px; border-bottom: 1px solid var(--d-border, rgba(255,255,255,0.1))';
const H3 = 'font-size: 16px; font-weight: 600; margin: 24px 0 12px; color: var(--d-fg, #fff)';
const ROW = 'display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px';
const ATOM = 'padding: 8px 12px; border-radius: var(--d-radius-sm, 6px); background: var(--d-surface-1, rgba(255,255,255,0.04)); font-family: ui-monospace, SFMono-Regular, monospace; font-size: 12px; color: var(--d-fg, #fff); border: 1px solid var(--d-border, rgba(255,255,255,0.08))';
const CODE_BLOCK = 'background: var(--d-surface-1, rgba(255,255,255,0.04)); border-radius: var(--d-radius-md, 8px); padding: 16px 20px; font-family: ui-monospace, SFMono-Regular, monospace; font-size: 13px; line-height: 1.6; color: var(--d-fg, #fff); overflow-x: auto; border: 1px solid var(--d-border, rgba(255,255,255,0.08)); white-space: pre; margin-bottom: 24px';
const CONTROLS = 'display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 24px; align-items: flex-end';
const CTRL_GROUP = 'display: flex; flex-direction: column; gap: 4px';
const CTRL_LABEL = 'font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--d-muted-fg, rgba(255,255,255,0.5))';
const SELECT_STYLE = 'padding: 6px 12px; border-radius: var(--d-radius-sm, 6px); border: 1px solid var(--d-border, rgba(255,255,255,0.15)); background: var(--d-surface-1, rgba(255,255,255,0.04)); color: var(--d-fg, #fff); font-size: 13px; outline: none; min-width: 120px';
const SAMPLE_PANEL = 'padding: 24px; border-radius: var(--d-radius-md, 8px); background: var(--d-surface-1, rgba(255,255,255,0.04)); border: 1px solid var(--d-border, rgba(255,255,255,0.08)); display: flex; flex-wrap: wrap; gap: 12px; align-items: center';

function atomChip(label, demoStyle) {
  const el = h('div', { style: ATOM + (demoStyle ? '; ' + demoStyle : '') }, label);
  return el;
}

function section(title, children) {
  const s = h('div', null);
  s.appendChild(h('h3', { style: H3 }, title));
  const row = h('div', { style: ROW });
  for (const child of children) row.appendChild(child);
  s.appendChild(row);
  return s;
}

export function CSS() {
  const container = h('div', { style: PAGE });

  // Header
  container.appendChild(h('h1', { style: H1 }, 'Atomic CSS'));
  container.appendChild(h('p', { style: SUB }, 'Theme-aware utility atoms and design token system powered by @decantr/css.'));

  // ── Section 1: Atoms Reference ──
  container.appendChild(h('h2', { style: H2 }, 'Atoms Reference'));

  container.appendChild(section('Layout', [
    atomChip('_flex', 'display: flex'),
    atomChip('_grid', 'display: grid'),
    atomChip('_col', 'flex-direction: column'),
    atomChip('_row', 'flex-direction: row'),
    atomChip('_gap4', 'gap: 16px'),
  ]));

  container.appendChild(section('Spacing', [
    atomChip('_p2', 'padding: 8px'),
    atomChip('_p4', 'padding: 16px'),
    atomChip('_m2', 'margin: 8px'),
    atomChip('_px4', 'padding-left: 16px; padding-right: 16px'),
  ]));

  container.appendChild(section('Typography', [
    atomChip('_text-xs', 'font-size: 12px'),
    atomChip('_text-sm', 'font-size: 14px'),
    atomChip('_text-base', 'font-size: 16px'),
    atomChip('_text-lg', 'font-size: 18px'),
    atomChip('_text-xl', 'font-size: 20px'),
    atomChip('_font-bold', 'font-weight: 700'),
    atomChip('_font-mono', 'font-family: monospace'),
  ]));

  container.appendChild(section('Colors', [
    atomChip('_text-muted', 'color: var(--d-muted-fg, rgba(255,255,255,0.5))'),
    atomChip('_bg-surface', 'background: var(--d-surface-1, rgba(255,255,255,0.04))'),
    atomChip('_border-subtle', 'border-color: var(--d-border, rgba(255,255,255,0.1))'),
  ]));

  // ── Section 2: Theme Playground ──
  container.appendChild(h('h2', { style: H2 }, 'Theme Playground'));

  const controls = h('div', { style: CONTROLS });

  // Style selector
  const styleGroup = h('div', { style: CTRL_GROUP });
  styleGroup.appendChild(h('span', { style: CTRL_LABEL }, 'Style'));
  const styleSelect = h('select', { style: SELECT_STYLE });
  const styleList = getStyleList();
  for (const s of styleList) {
    const opt = h('option', { value: s.id }, s.name);
    styleSelect.appendChild(opt);
  }
  styleSelect.value = 'auradecantism';
  styleSelect.onchange = () => { setStyle(styleSelect.value); };
  styleGroup.appendChild(styleSelect);
  controls.appendChild(styleGroup);

  // Mode selector
  const modeGroup = h('div', { style: CTRL_GROUP });
  modeGroup.appendChild(h('span', { style: CTRL_LABEL }, 'Mode'));
  const modeSelect = h('select', { style: SELECT_STYLE });
  for (const m of ['light', 'dark', 'auto']) {
    modeSelect.appendChild(h('option', { value: m }, m.charAt(0).toUpperCase() + m.slice(1)));
  }
  modeSelect.value = 'dark';
  modeSelect.onchange = () => { setMode(modeSelect.value); };
  modeGroup.appendChild(modeSelect);
  controls.appendChild(modeGroup);

  // Shape selector
  const shapeGroup = h('div', { style: CTRL_GROUP });
  shapeGroup.appendChild(h('span', { style: CTRL_LABEL }, 'Shape'));
  const shapeSelect = h('select', { style: SELECT_STYLE });
  for (const s of ['sharp', 'rounded', 'pill']) {
    shapeSelect.appendChild(h('option', { value: s }, s.charAt(0).toUpperCase() + s.slice(1)));
  }
  shapeSelect.value = 'rounded';
  shapeSelect.onchange = () => { setShape(shapeSelect.value); };
  shapeGroup.appendChild(shapeSelect);
  controls.appendChild(shapeGroup);

  container.appendChild(controls);

  // Sample component panel
  const panel = h('div', { style: SAMPLE_PANEL });
  panel.appendChild(Button({ variant: 'solid' }, 'Primary'));
  panel.appendChild(Button({ variant: 'outline' }, 'Outline'));
  panel.appendChild(Button({ variant: 'ghost' }, 'Ghost'));
  panel.appendChild(Badge({ color: 'accent' }, 'Badge'));
  panel.appendChild(Input({ placeholder: 'Input field...', size: 'sm' }));
  panel.appendChild(Card({ title: 'Card', bordered: true }, h('span', { style: 'font-size: 13px' }, 'Theme-aware card component.')));
  container.appendChild(panel);

  // ── Usage ──
  container.appendChild(h('h2', { style: H2 }, 'Usage'));

  const usage = `import { css } from '@decantr/css';

// Combine atom classes
const className = css('_flex', '_col', '_gap4', '_p4');

// Use with h()
h('div', { class: className }, ...)`;

  container.appendChild(h('pre', { style: CODE_BLOCK }, usage));

  return container;
}
