import { h } from '@decantr/ui/runtime';
import { css } from '@decantr/css';
import { setStyle, setMode, setShape, getStyleList, setAnimations, getAnimations } from '@decantr/ui/css';

export function Toolbar() {
  const styles = getStyleList();

  const selectStyle = 'margin-left: 8px; padding: 2px 4px; font-size: 13px';

  const styleSelect = h('select', {
    style: selectStyle,
    onchange: (e) => setStyle(e.target.value),
  });
  for (const s of styles) {
    styleSelect.appendChild(h('option', { value: s }, s));
  }

  const modeSelect = h('select', {
    style: selectStyle,
    onchange: (e) => setMode(e.target.value),
  });
  for (const [label, value] of [['Dark', 'dark'], ['Light', 'light'], ['Auto', 'auto']]) {
    modeSelect.appendChild(h('option', { value }, label));
  }

  const shapeSelect = h('select', {
    style: selectStyle,
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

  const labelClass = css('_text-xs _flex _items-center');

  return h('div', {
    class: css('_flex _items-center _border-b _border-subtle _bg-surface _gap-3 _px-4'),
    style: 'height: 48px',
  },
    h('span', { style: 'font-weight: bold; margin-right: auto' }, '\u2B21 Workbench'),
    h('label', { class: labelClass }, 'Style', styleSelect),
    h('label', { class: labelClass }, 'Mode', modeSelect),
    h('label', { class: labelClass }, 'Shape', shapeSelect),
    h('label', { class: labelClass, style: 'cursor: pointer' }, animCheckbox, ' Animations'),
  );
}
