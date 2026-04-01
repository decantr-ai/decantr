import { css } from '@decantr/css';
import { h } from '@decantr/ui/runtime';

function box(label) {
  return h(
    'div',
    {
      style: {
        padding: '8px 12px',
        background: 'var(--d-primary, #6366f1)',
        color: '#fff',
        borderRadius: '4px',
        fontSize: '13px',
      },
    },
    label,
  );
}

export default {
  component: (props) => {
    const variant = props._variant || 'flex';

    if (variant === 'flex') {
      return h(
        'div',
        { class: css('_flex _gap4 _items-center') },
        box('A'),
        box('B'),
        box('C'),
      );
    }

    if (variant === 'grid') {
      const grid = h('div', { class: css('_grid _gap4'), style: { gridTemplateColumns: 'repeat(3, 1fr)' } });
      for (let i = 1; i <= 6; i++) {
        grid.appendChild(box(`Cell ${i}`));
      }
      return grid;
    }

    if (variant === 'spacing') {
      return h(
        'div',
        { style: { border: '1px dashed var(--d-border, #444)' } },
        h(
          'div',
          { class: css('_p4 _m2'), style: { background: 'var(--d-bg-surface, rgba(255,255,255,0.05))' } },
          h('span', null, 'Padding (_p4) + Margin (_m2)'),
        ),
      );
    }

    if (variant === 'typography') {
      return h(
        'div',
        { class: css('_flex'), style: { flexDirection: 'column', gap: '8px' } },
        h('span', { class: css('_text-xl _font-bold') }, 'Bold XL Text'),
        h('span', { class: css('_text-xl') }, 'Regular XL Text'),
        h('span', { class: css('_font-bold') }, 'Bold Default Text'),
      );
    }

    if (variant === 'colors') {
      return h(
        'div',
        { class: css('_bg-surface _text-muted'), style: { padding: '16px', borderRadius: '8px' } },
        h('p', null, 'Surface background with muted text color.'),
      );
    }

    return h('div', null, 'Unknown variant');
  },
  title: 'Atoms',
  category: 'css',
  description: 'Demonstrates the css() atom utility for common layout, spacing, typography, and color patterns.',
  variants: [
    { name: 'Flex Layout', props: { _variant: 'flex' } },
    { name: 'Grid Layout', props: { _variant: 'grid' } },
    { name: 'Spacing', props: { _variant: 'spacing' } },
    { name: 'Typography', props: { _variant: 'typography' } },
    { name: 'Colors', props: { _variant: 'colors' } },
  ],
  playground: {
    defaults: { _variant: 'flex' },
    controls: [
      { name: '_variant', type: 'select', options: ['flex', 'grid', 'spacing', 'typography', 'colors'] },
    ],
  },
  usage: [
    {
      title: 'Flex layout with gap',
      code: `import { css } from '@decantr/css';
import { h } from '@decantr/ui/runtime';

const row = h('div', { class: css('_flex _gap4 _items-center') },
  h('span', null, 'A'),
  h('span', null, 'B'),
);`,
    },
    {
      title: 'Grid layout',
      code: `import { css } from '@decantr/css';
import { h } from '@decantr/ui/runtime';

const grid = h('div', { class: css('_grid _gap4') });`,
    },
  ],
};
