import { h } from '@decantr/ui/runtime';
import { renderVariants, renderUsage } from '@decantr/ui-catalog/renderer';

export function IsolationView({ story }) {
  const children = [
    // Header
    h('div', { style: 'margin-bottom: 16px' },
      h('h2', { style: 'margin: 0 0 4px' }, story.title),
      story.description ? h('p', { style: 'margin: 0 0 4px; opacity: 0.8' }, story.description) : null,
      h('span', { style: 'font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.5' }, story.category),
    ),

    // Variants
    h('div', null,
      h('h3', { style: 'margin: 0 0 8px' }, 'Variants'),
      renderVariants(story),
    ),
  ];

  // Usage (only if story has usage)
  const usage = renderUsage(story);
  if (usage) {
    children.push(
      h('div', null,
        h('h3', { style: 'margin: 0 0 8px' }, 'Usage'),
        usage,
      )
    );
  }

  return h('div', { style: 'padding: 24px; display: flex; flex-direction: column; gap: 24px' }, ...children);
}
