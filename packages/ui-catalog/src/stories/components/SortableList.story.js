import { SortableList } from '@decantr/ui/components';
import { h } from '@decantr/ui/runtime';

const fruits = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];
const tasks = ['Design mockups', 'Write tests', 'Review PR', 'Deploy'];

function simpleRender(item, index, handle) {
  const row = h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', border: '1px solid #e0e0e0', borderRadius: '4px', marginBottom: '4px', background: '#fff' } });
  row.appendChild(handle);
  row.appendChild(h('span', null, `${index + 1}. ${item}`));
  return row;
}

export default {
  component: (props) => SortableList({
    ...props,
    items: props.items || fruits,
    renderFn: props.renderFn || simpleRender,
  }),
  title: 'SortableList',
  category: 'components/data-display',
  description: 'Drag-to-reorder list with keyboard support and drop indicators.',
  variants: [
    { name: 'Default', props: { items: fruits, renderFn: simpleRender } },
    { name: 'Tasks', props: { items: tasks, renderFn: simpleRender } },
    { name: 'Horizontal', props: { items: fruits, direction: 'horizontal', renderFn: simpleRender } },
    { name: 'Disabled', props: { items: fruits, disabled: true, renderFn: simpleRender } },
    { name: 'Two Items', props: { items: ['First', 'Second'], renderFn: simpleRender } },
  ],
  playground: {
    defaults: { direction: 'vertical', disabled: false },
    controls: [
      { name: 'direction', type: 'select', options: ['vertical', 'horizontal'] },
      { name: 'disabled', type: 'boolean' },
    ],
  },
  usage: [
    {
      title: 'Basic sortable list',
      code: `import { SortableList } from '@decantr/ui/components';
import { h } from '@decantr/ui/runtime';

const list = SortableList({
  items: ['Apple', 'Banana', 'Cherry'],
  renderFn: (item, i, handle) => {
    const row = h('div', { style: { display: 'flex', gap: '8px', padding: '8px' } });
    row.appendChild(handle);
    row.appendChild(h('span', null, item));
    return row;
  },
  onReorder: (newItems) => console.log('New order:', newItems),
});
document.body.appendChild(list);`,
    },
    {
      title: 'Horizontal layout',
      code: `import { SortableList } from '@decantr/ui/components';
import { h } from '@decantr/ui/runtime';

const list = SortableList({
  items: ['A', 'B', 'C'],
  direction: 'horizontal',
  renderFn: (item, i, handle) => h('div', null, handle, h('span', null, item)),
});`,
    },
  ],
};
