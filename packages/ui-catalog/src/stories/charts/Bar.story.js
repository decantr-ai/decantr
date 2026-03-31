import { Chart } from '@decantr/ui-chart';

export default {
  component: (props) => Chart({ type: 'bar', ...props }),
  title: 'Bar Chart',
  category: 'charts',
  description: 'Bar chart for comparing categorical data with optional stacking and grouping.',
  variants: [
    {
      name: 'Basic',
      props: {
        data: [
          { category: 'Electronics', value: 420 },
          { category: 'Clothing', value: 310 },
          { category: 'Food', value: 275 },
          { category: 'Books', value: 180 },
          { category: 'Sports', value: 220 },
        ],
        x: 'category',
        y: 'value',
        title: 'Sales by Category',
      },
    },
    {
      name: 'Grouped',
      props: {
        data: [
          { quarter: 'Q1', online: 150, inStore: 200 },
          { quarter: 'Q2', online: 210, inStore: 180 },
          { quarter: 'Q3', online: 280, inStore: 190 },
          { quarter: 'Q4', online: 320, inStore: 250 },
        ],
        x: 'quarter',
        y: ['online', 'inStore'],
        title: 'Online vs In-Store Sales',
      },
    },
    {
      name: 'Stacked',
      props: {
        data: [
          { quarter: 'Q1', online: 150, inStore: 200 },
          { quarter: 'Q2', online: 210, inStore: 180 },
          { quarter: 'Q3', online: 280, inStore: 190 },
          { quarter: 'Q4', online: 320, inStore: 250 },
        ],
        x: 'quarter',
        y: ['online', 'inStore'],
        title: 'Total Sales (Stacked)',
        stacked: true,
      },
    },
  ],
  playground: {
    defaults: {
      data: [
        { category: 'A', value: 420 },
        { category: 'B', value: 310 },
        { category: 'C', value: 275 },
        { category: 'D', value: 180 },
      ],
      x: 'category',
      y: 'value',
      title: 'Bar Chart',
    },
    controls: [
      { name: 'height', type: 'text' },
      { name: 'animate', type: 'boolean' },
      { name: 'tooltip', type: 'boolean' },
      { name: 'legend', type: 'boolean' },
      { name: 'stacked', type: 'boolean' },
    ],
  },
  usage: [
    {
      title: 'Basic bar chart',
      code: `import { Chart } from '@decantr/ui-chart';

const chart = Chart({
  type: 'bar',
  data: [
    { category: 'A', value: 100 },
    { category: 'B', value: 200 },
  ],
  x: 'category',
  y: 'value',
  title: 'Sales',
});
document.body.appendChild(chart);`,
    },
  ],
};
