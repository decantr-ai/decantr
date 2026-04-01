import { h } from '@decantr/ui/runtime';

export function Nav() {
  return h('nav', { style: 'height: 56px; display: flex; align-items: center; padding: 0 16px; border-bottom: 1px solid rgba(255,255,255,0.1); background: var(--color-surface, #111)' }, 'Decantr UI');
}
