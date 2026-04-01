import { Transfer } from '@decantr/ui/components';

const SAMPLE_DATA = [
  { key: '1', label: 'JavaScript' },
  { key: '2', label: 'TypeScript' },
  { key: '3', label: 'Python' },
  { key: '4', label: 'Rust' },
  { key: '5', label: 'Go' },
  { key: '6', label: 'Ruby', disabled: true },
  { key: '7', label: 'Java' },
  { key: '8', label: 'C#' },
];

export default {
  component: (props) => Transfer({ dataSource: SAMPLE_DATA, ...props }),
  title: 'Transfer',
  category: 'components/form',
  description: 'Dual-list transfer component with search, select-all, and bidirectional movement.',
  variants: [
    { name: 'Default', props: {} },
    { name: 'With Targets', props: { targetKeys: ['2', '4'] } },
    { name: 'Searchable', props: { searchable: true } },
    { name: 'Custom Titles', props: { titles: ['Available', 'Selected'] } },
    { name: 'With Disabled Items', props: { targetKeys: ['6'] } },
  ],
  playground: {
    defaults: {},
    controls: [
      { name: 'searchable', type: 'boolean' },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { Transfer } from '@decantr/ui/components';

const transfer = Transfer({
  dataSource: [
    { key: '1', label: 'Item A' },
    { key: '2', label: 'Item B' },
    { key: '3', label: 'Item C' },
  ],
  targetKeys: ['2'],
  onchange: (keys, dir, moved) => console.log(keys)
});
document.body.appendChild(transfer);`,
    },
    {
      title: 'Searchable with custom titles',
      code: `import { Transfer } from '@decantr/ui/components';

const transfer = Transfer({
  dataSource: items,
  searchable: true,
  titles: ['Available', 'Assigned']
});`,
    },
  ],
};
