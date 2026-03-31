import { h } from '@decantr/ui/runtime';

export function IsolationView({ story }) {
  return h('div', { style: 'padding: 24px' }, `Isolation view for: ${story.title}`);
}
