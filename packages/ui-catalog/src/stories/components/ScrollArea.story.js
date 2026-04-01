import { ScrollArea } from '@decantr/ui/components';

function renderScrollArea(props) {
  const { _itemCount = 20, ...rest } = props;
  const children = [];
  for (let i = 0; i < _itemCount; i++) {
    const item = document.createElement('div');
    item.textContent = `Item ${i + 1}`;
    item.style.padding = '8px 12px';
    if (i % 2 === 0) item.style.background = 'var(--d-clr-surface-2, #f3f4f6)';
    children.push(item);
  }
  return ScrollArea(rest, ...children);
}

export default {
  component: renderScrollArea,
  title: 'ScrollArea',
  category: 'components/layout',
  description: 'Custom scrollable container with thin scrollbar styling. Supports vertical, horizontal, and bidirectional scrolling with configurable dimensions.',
  variants: [
    { name: 'Vertical', props: { height: '200px', direction: 'vertical' } },
    { name: 'Horizontal', props: { width: '300px', height: '60px', direction: 'horizontal' } },
    { name: 'Both Directions', props: { height: '200px', width: '300px', direction: 'both' } },
    { name: 'Tall List', props: { height: '300px', _itemCount: 50 } },
    { name: 'Short List', props: { height: '150px', _itemCount: 8 } },
  ],
  playground: {
    defaults: { height: '200px', direction: 'vertical', _itemCount: 20 },
    controls: [
      { name: 'direction', type: 'select', options: ['vertical', 'horizontal', 'both'] },
      { name: 'height', type: 'text' },
      { name: 'width', type: 'text' },
      { name: '_itemCount', type: 'number' },
    ],
  },
  usage: [
    {
      title: 'Scrollable list',
      code: `import { ScrollArea } from '@decantr/ui/components';

const items = Array.from({ length: 30 }, (_, i) => {
  const el = document.createElement('div');
  el.textContent = \`Row \${i + 1}\`;
  return el;
});
const area = ScrollArea({ height: '200px' }, ...items);
document.body.appendChild(area);`,
    },
    {
      title: 'Horizontal scroll',
      code: `import { ScrollArea } from '@decantr/ui/components';

const row = document.createElement('div');
row.style.display = 'flex';
row.style.gap = '8px';
row.style.width = '800px';
for (let i = 0; i < 10; i++) {
  const card = document.createElement('div');
  card.textContent = \`Card \${i + 1}\`;
  card.style.minWidth = '120px';
  row.appendChild(card);
}
const area = ScrollArea({ width: '300px', direction: 'horizontal' }, row);`,
    },
  ],
};
