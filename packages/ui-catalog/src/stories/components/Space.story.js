import { Space } from '@decantr/ui/components';

function renderSpace(props) {
  const { _items = 3, ...rest } = props;
  const children = [];
  for (let i = 0; i < _items; i++) {
    const box = document.createElement('div');
    box.textContent = `Item ${i + 1}`;
    box.style.padding = '8px 16px';
    box.style.background = 'var(--d-clr-surface-2, #e5e7eb)';
    box.style.borderRadius = '4px';
    children.push(box);
  }
  return Space(rest, ...children);
}

export default {
  component: renderSpace,
  title: 'Space',
  category: 'components/layout',
  description: 'Flex layout utility for consistent spacing between children. Supports horizontal/vertical direction, alignment, gap tokens, and wrapping.',
  variants: [
    { name: 'Horizontal', props: { direction: 'horizontal', gap: 3 } },
    { name: 'Vertical', props: { direction: 'vertical', gap: 3 } },
    { name: 'Gap 1', props: { gap: 1 } },
    { name: 'Gap 4', props: { gap: 4 } },
    { name: 'Gap 6', props: { gap: 6 } },
    { name: 'Custom Gap', props: { gap: '24px' } },
    { name: 'Align Center', props: { align: 'center', gap: 3 } },
    { name: 'Align Between', props: { align: 'between', gap: 3 } },
    { name: 'Align Evenly', props: { align: 'evenly', gap: 3 } },
    { name: 'Wrap', props: { wrap: true, gap: 3, _items: 8 } },
    { name: 'Vertical Centered', props: { direction: 'vertical', align: 'center', gap: 3 } },
  ],
  playground: {
    defaults: { direction: 'horizontal', gap: 3, _items: 3 },
    controls: [
      { name: 'direction', type: 'select', options: ['horizontal', 'vertical'] },
      { name: 'align', type: 'select', options: ['start', 'center', 'end', 'between', 'around', 'evenly'] },
      { name: 'gap', type: 'number' },
      { name: 'wrap', type: 'boolean' },
      { name: '_items', type: 'number' },
    ],
  },
  usage: [
    {
      title: 'Horizontal spacing',
      code: `import { Space } from '@decantr/ui/components';
import { tags } from '@decantr/ui/tags';

const { span } = tags;
const row = Space({ direction: 'horizontal', gap: 3 },
  span({}, 'One'),
  span({}, 'Two'),
  span({}, 'Three')
);
document.body.appendChild(row);`,
    },
    {
      title: 'Vertical stack',
      code: `import { Space } from '@decantr/ui/components';

const stack = Space({ direction: 'vertical', gap: 4 },
  document.createTextNode('First'),
  document.createTextNode('Second')
);`,
    },
  ],
};
