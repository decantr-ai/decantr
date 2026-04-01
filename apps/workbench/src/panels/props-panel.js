import { h } from '@decantr/ui/runtime';
import { css } from '@decantr/css';
import { createEffect } from '@decantr/ui/state';

/**
 * Auto-generated props panel from a story's playground field.
 * @param {{ playground: Object, currentProps: Function, onChange: Function }} params
 */
export function PropsPanel({ playground, currentProps, onChange }) {
  if (!playground || !playground.controls) {
    return h('div', { class: css('_p-3'), style: 'opacity: 0.5' }, 'No playground controls defined.');
  }

  // Normalize controls — handle both array and object formats
  const controls = Array.isArray(playground.controls)
    ? playground.controls
    : Object.entries(playground.controls).map(([key, ctrl]) => ({
        ...ctrl,
        name: ctrl.name || key,
      }));

  const inputStyle =
    'padding: 4px 6px; font-size: 12px; background: rgba(0,0,0,0.2); color: inherit; border: 1px solid rgba(255,255,255,0.15); border-radius: 4px; width: 100%';

  const controlEls = controls.map((ctrl) => {
    const key = ctrl.name || ctrl.key;
    const label = ctrl.label || key;

    const labelEl = h(
      'label',
      { class: css('_flex _col _gap-1 _text-xs') },
      h('span', { style: 'opacity: 0.7; text-transform: capitalize' }, label),
    );

    let input;

    if (ctrl.type === 'select') {
      input = h(
        'select',
        { style: inputStyle },
        ...(ctrl.options || []).map((opt) =>
          h('option', { value: opt }, String(opt)),
        ),
      );
      createEffect(() => {
        const val = currentProps()[key];
        input.value = val !== undefined ? String(val) : '';
      });
      input.addEventListener('change', () => {
        onChange(key, input.value);
      });
    } else if (ctrl.type === 'boolean') {
      input = h('input', {
        type: 'checkbox',
        style: 'width: 16px; height: 16px; accent-color: var(--color-primary, #3b82f6)',
      });
      createEffect(() => {
        input.checked = !!currentProps()[key];
      });
      input.addEventListener('change', () => {
        onChange(key, input.checked);
      });
    } else if (ctrl.type === 'number') {
      input = h('input', {
        type: 'number',
        style: inputStyle,
      });
      createEffect(() => {
        const val = currentProps()[key];
        input.value = val !== undefined ? String(val) : '';
      });
      input.addEventListener('input', () => {
        const v = input.value === '' ? undefined : Number(input.value);
        onChange(key, v);
      });
    } else if (ctrl.type === 'color') {
      input = h('input', {
        type: 'color',
        style: 'width: 32px; height: 24px; border: none; background: none; cursor: pointer',
      });
      createEffect(() => {
        const val = currentProps()[key];
        input.value = val || '#000000';
      });
      input.addEventListener('input', () => {
        onChange(key, input.value);
      });
    } else {
      // Default: text
      input = h('input', {
        type: 'text',
        style: inputStyle,
      });
      createEffect(() => {
        const val = currentProps()[key];
        input.value = val !== undefined ? String(val) : '';
      });
      input.addEventListener('input', () => {
        onChange(key, input.value);
      });
    }

    labelEl.appendChild(input);
    return labelEl;
  });

  return h(
    'div',
    { class: css('_p-3 _flex _col _gap-2') },
    h('h3', { style: 'margin: 0 0 4px; font-size: 14px' }, 'Props'),
    ...controlEls,
  );
}
