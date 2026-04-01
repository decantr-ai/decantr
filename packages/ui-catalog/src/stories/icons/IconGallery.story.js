import { getIconNames, getIconPath } from '@decantr/ui/icons';
import { icon } from '@decantr/ui/components';
import { h } from '@decantr/ui/runtime';

export default {
  component: (props) => {
    const filter = (props.filter || '').toLowerCase();
    const names = getIconNames().filter(
      (n) => !filter || n.includes(filter),
    );

    const grid = h(
      'div',
      {
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: '16px',
          padding: '16px',
        },
      },
    );

    for (const name of names) {
      const cell = h(
        'div',
        {
          style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 8px',
            borderRadius: '8px',
            border: '1px solid var(--d-border, #333)',
            background: 'var(--d-bg-surface, transparent)',
          },
        },
        icon(name, { size: 24 }),
        h(
          'span',
          {
            style: {
              fontSize: '11px',
              color: 'var(--d-muted-fg, #999)',
              textAlign: 'center',
              wordBreak: 'break-all',
            },
          },
          name,
        ),
      );
      grid.appendChild(cell);
    }

    if (names.length === 0) {
      grid.appendChild(
        h('div', { style: { gridColumn: '1 / -1', textAlign: 'center', color: 'var(--d-muted-fg, #999)' } }, 'No icons match the filter.'),
      );
    }

    return grid;
  },
  title: 'Icon Gallery',
  category: 'icons',
  description: 'Browse all available icons in the Decantr icon set. Filter by name to find specific icons.',
  variants: [
    { name: 'All Icons', props: {} },
  ],
  playground: {
    defaults: {},
    controls: [
      { name: 'filter', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Render an icon',
      code: `import { icon } from '@decantr/ui/components';

const el = icon('check', { size: 24 });
document.body.appendChild(el);`,
    },
    {
      title: 'List all icon names',
      code: `import { getIconNames } from '@decantr/ui/icons';

console.log(getIconNames());`,
    },
  ],
};
