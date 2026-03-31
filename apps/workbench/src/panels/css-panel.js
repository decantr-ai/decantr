import { h } from '@decantr/ui/runtime';
import { getInjectedClasses } from '@decantr/css';

export function CSSPanel() {
  const classes = getInjectedClasses();
  const content = Array.isArray(classes) ? classes.join('\n') : String(classes || '');

  return h('div', { style: 'padding: 12px' },
    h('h3', { style: 'margin: 0 0 8px; font-size: 14px' }, 'Injected CSS Atoms'),
    h('pre', {
      style: 'margin: 0; max-height: 300px; overflow: auto; font-size: 12px; white-space: pre-wrap; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px',
    }, content),
  );
}
