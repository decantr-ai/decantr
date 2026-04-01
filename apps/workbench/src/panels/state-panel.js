import { h } from '@decantr/ui/runtime';
import { createEffect } from '@decantr/ui/state';

/**
 * Signal state inspector — shows current playground props as live JSON.
 * @param {{ currentProps: Function }} params
 */
export function StatePanel({ currentProps }) {
  const pre = h('pre', {
    style:
      'margin: 0; max-height: 200px; overflow: auto; font-size: 11px; white-space: pre-wrap; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px',
  });

  createEffect(() => {
    pre.textContent = JSON.stringify(currentProps(), null, 2);
  });

  return h(
    'div',
    { style: 'padding: 12px' },
    h('h3', { style: 'margin: 0 0 8px; font-size: 14px' }, 'Signal State'),
    pre,
  );
}
