import { Descriptions } from '@decantr/ui/components';

const sampleItems = [
  { label: 'Name', value: 'Alice Johnson' },
  { label: 'Email', value: 'alice@example.com' },
  { label: 'Role', value: 'Engineer' },
  { label: 'Department', value: 'Product' },
  { label: 'Location', value: 'San Francisco' },
  { label: 'Status', value: 'Active' },
];

export default {
  component: (props) => Descriptions({ items: sampleItems, ...props }),
  title: 'Descriptions',
  category: 'components/data-display',
  description: 'Key-value pair display for detail panels. Supports horizontal/vertical layout and configurable columns.',
  variants: [
    { name: 'Default (Horizontal)', props: {} },
    { name: 'With Title', props: { title: 'User Details' } },
    { name: 'Vertical Layout', props: { layout: 'vertical', title: 'Profile' } },
    { name: '2 Columns', props: { columns: 2, title: 'Details' } },
    { name: '4 Columns', props: { columns: 4 } },
    { name: 'Bordered', props: { bordered: true, title: 'Account Info' } },
    { name: 'Item Span', props: { title: 'With Span', items: [
      { label: 'Name', value: 'Alice Johnson' },
      { label: 'Bio', value: 'A software engineer with 10 years of experience.', span: 2 },
      { label: 'Email', value: 'alice@example.com' },
    ] } },
  ],
  playground: {
    defaults: { title: 'User Details', columns: 3 },
    controls: [
      { name: 'title', type: 'text' },
      { name: 'columns', type: 'number' },
      { name: 'layout', type: 'select', options: ['horizontal', 'vertical'] },
      { name: 'bordered', type: 'boolean' },
    ],
  },
  usage: [
    {
      title: 'Basic descriptions',
      code: `import { Descriptions } from '@decantr/ui/components';

const desc = Descriptions({
  title: 'User Info',
  items: [
    { label: 'Name', value: 'Alice' },
    { label: 'Email', value: 'alice@example.com' },
    { label: 'Role', value: 'Admin' },
  ],
});
document.body.appendChild(desc);`,
    },
  ],
};
