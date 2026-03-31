import { h } from '@decantr/ui/runtime';
import { setStyle, setMode, setShape, getStyleList, setAnimations, getAnimations } from '@decantr/ui/css';

export function Toolbar() {
  const styles = getStyleList();

  const styleSelect = h('select', {
    style: 'margin-left: 8px; padding: 2px 4px; font-size: 13px',
    onchange: (e) => setStyle(e.target.value),
  });
  for (const s of styles) {
    styleSelect.appendChild(h('option', { value: s }, s));
  }

  const modeSelect = h('select', {
    style: 'margin-left: 8px; padding: 2px 4px; font-size: 13px',
    onchange: (e) => setMode(e.target.value),
  });
  for (const [label, value] of [['Dark', 'dark'], ['Light', 'light'], ['Auto', 'auto']]) {
    modeSelect.appendChild(h('option', { value }, label));
  }

  const shapeSelect = h('select', {
    style: 'margin-left: 8px; padding: 2px 4px; font-size: 13px',
    onchange: (e) => setShape(e.target.value || null),
  });
  for (const [label, value] of [['Default', ''], ['Sharp', 'sharp'], ['Rounded', 'rounded'], ['Pill', 'pill']]) {
    shapeSelect.appendChild(h('option', { value }, label));
  }

  const animCheckbox = h('input', {
    type: 'checkbox',
    checked: true,
    style: 'margin-left: 8px',
    onchange: (e) => setAnimations(e.target.checked),
  });

  return h('div', {
    style: 'height: 48px; padding: 0 16px; display: flex; align-items: center; border-bottom: 1px solid var(--color-border, rgba(255,255,255,0.1)); background: var(--color-surface, #1a1a1a); gap: 12px',
  },
    h('span', { style: 'font-weight: bold; margin-right: auto' }, '\u2B21 Workbench'),
    h('label', { style: 'font-size: 12px; display: flex; align-items: center' }, 'Style', styleSelect),
    h('label', { style: 'font-size: 12px; display: flex; align-items: center' }, 'Mode', modeSelect),
    h('label', { style: 'font-size: 12px; display: flex; align-items: center' }, 'Shape', shapeSelect),
    h('label', { style: 'font-size: 12px; display: flex; align-items: center; cursor: pointer' }, animCheckbox, ' Animations'),
  );
}
