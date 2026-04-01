import { DataTable } from '@decantr/ui/components';

const sampleColumns = [
  { key: 'name', label: 'Name', sortable: true, filterable: true },
  { key: 'age', label: 'Age', sortable: true, align: 'right' },
  { key: 'email', label: 'Email' },
];

const sampleData = [
  { name: 'Alice Johnson', age: 28, email: 'alice@example.com' },
  { name: 'Bob Smith', age: 34, email: 'bob@example.com' },
  { name: 'Carol White', age: 45, email: 'carol@example.com' },
  { name: 'Dave Brown', age: 22, email: 'dave@example.com' },
  { name: 'Eve Davis', age: 31, email: 'eve@example.com' },
];

export default {
  component: (props) => DataTable({
    columns: sampleColumns,
    data: sampleData,
    ...props,
  }),
  title: 'DataTable',
  category: 'components/data-display',
  description: 'Enterprise data grid with sorting, pagination, selection, column pinning, cell editing, row expansion, filtering, export, and virtual scrolling.',
  variants: [
    { name: 'Default', props: {} },
    { name: 'Striped', props: { striped: true } },
    { name: 'Sticky Header', props: { stickyHeader: true } },
    { name: 'No Hover', props: { hoverable: false } },
    { name: 'Single Selection', props: { selection: 'single' } },
    { name: 'Multi Selection', props: { selection: 'multi' } },
    { name: 'Pagination', props: { pagination: { pageSize: 2 } } },
    { name: 'Exportable', props: { exportable: true } },
    { name: 'Expandable', props: { expandable: true, expandRender: (row) => `Details for ${row.name}` } },
    { name: 'Empty', props: { data: [] } },
    { name: 'Custom Empty Text', props: { data: [], emptyText: 'Nothing to show' } },
  ],
  playground: {
    defaults: {},
    controls: [
      { name: 'striped', type: 'boolean' },
      { name: 'hoverable', type: 'boolean' },
      { name: 'stickyHeader', type: 'boolean' },
      { name: 'selection', type: 'select', options: ['none', 'single', 'multi'] },
      { name: 'exportable', type: 'boolean' },
      { name: 'expandable', type: 'boolean' },
      { name: 'emptyText', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Basic data table',
      code: `import { DataTable } from '@decantr/ui/components';

const table = DataTable({
  columns: [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'age', label: 'Age', sortable: true },
  ],
  data: [
    { name: 'Alice', age: 28 },
    { name: 'Bob', age: 34 },
  ],
});
document.body.appendChild(table);`,
    },
    {
      title: 'With pagination and selection',
      code: `import { DataTable } from '@decantr/ui/components';

const table = DataTable({
  columns: [{ key: 'name', label: 'Name' }],
  data: myData,
  pagination: { pageSize: 10 },
  selection: 'multi',
  onSelectionChange: (rows) => console.log('Selected:', rows),
});`,
    },
  ],
};
