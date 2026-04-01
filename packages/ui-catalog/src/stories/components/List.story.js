import { List } from '@decantr/ui/components';

const sampleItems = [
  { title: 'Item One', description: 'First item description' },
  { title: 'Item Two', description: 'Second item description' },
  { title: 'Item Three', description: 'Third item description' },
  { title: 'Item Four', description: 'Fourth item description' },
];

export default {
  component: (props) => List({ items: sampleItems, ...props }),
  title: 'List',
  category: 'components/data-display',
  description: 'Data list with items, avatars, actions, and grid mode. Supports custom rendering and loading state.',
  variants: [
    { name: 'Default', props: {} },
    { name: 'Bordered', props: { bordered: true } },
    { name: 'With Header', props: { header: 'My List', bordered: true } },
    { name: 'With Footer', props: { header: 'People', footer: '4 items total', bordered: true } },
    { name: 'Grid (2 columns)', props: { grid: 2 } },
    { name: 'Grid (3 columns)', props: { grid: 3 } },
    { name: 'Loading', props: { loading: true } },
    { name: 'Empty', props: { items: [] } },
    { name: 'Custom Empty Text', props: { items: [], emptyText: 'No results found' } },
  ],
  playground: {
    defaults: { bordered: false },
    controls: [
      { name: 'bordered', type: 'boolean' },
      { name: 'header', type: 'text' },
      { name: 'footer', type: 'text' },
      { name: 'grid', type: 'number' },
      { name: 'loading', type: 'boolean' },
      { name: 'emptyText', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Basic list',
      code: `import { List } from '@decantr/ui/components';

const list = List({
  items: [
    { title: 'Alice', description: 'Engineer' },
    { title: 'Bob', description: 'Designer' },
  ],
  bordered: true,
  header: 'Team',
});
document.body.appendChild(list);`,
    },
    {
      title: 'Grid mode',
      code: `import { List } from '@decantr/ui/components';

const list = List({
  items: myItems,
  grid: 3,
});`,
    },
  ],
};
