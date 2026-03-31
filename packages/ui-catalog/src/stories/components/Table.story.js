import { Table } from '@decantr/ui/components';

const sampleColumns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
];

const sampleData = [
  { name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin' },
  { name: 'Bob Smith', email: 'bob@example.com', role: 'Editor' },
  { name: 'Carol Davis', email: 'carol@example.com', role: 'Viewer' },
];

export default {
  component: (props) => Table(props),
  title: 'Table',
  category: 'components/original',
  description: 'Data table with columns, striped rows, hover highlighting, and compact mode.',
  variants: [
    { name: 'Default', props: { columns: sampleColumns, data: sampleData } },
    { name: 'Striped', props: { columns: sampleColumns, data: sampleData, striped: true } },
    { name: 'Hoverable', props: { columns: sampleColumns, data: sampleData, hoverable: true } },
    { name: 'Compact', props: { columns: sampleColumns, data: sampleData, compact: true } },
    { name: 'Striped Hoverable', props: { columns: sampleColumns, data: sampleData, striped: true, hoverable: true } },
    {
      name: 'With Column Widths',
      props: {
        columns: [
          { key: 'name', label: 'Name', width: '200px' },
          { key: 'email', label: 'Email', width: '250px' },
          { key: 'role', label: 'Role', width: '100px' },
        ],
        data: sampleData,
      },
    },
    { name: 'Empty', props: { columns: sampleColumns, data: [] } },
  ],
  playground: {
    defaults: { columns: sampleColumns, data: sampleData },
    controls: [
      { name: 'striped', type: 'boolean' },
      { name: 'hoverable', type: 'boolean' },
      { name: 'compact', type: 'boolean' },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { Table } from '@decantr/ui/components';

const table = Table({
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status' },
  ],
  data: [
    { name: 'Item 1', status: 'Active' },
    { name: 'Item 2', status: 'Inactive' },
  ],
  striped: true,
});
document.body.appendChild(table);`,
    },
  ],
};
