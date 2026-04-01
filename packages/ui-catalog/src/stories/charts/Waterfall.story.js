import { Chart } from '@decantr/ui-chart';

export default {
  component: (props) => Chart({ type: 'waterfall', ...props }),
  title: 'Waterfall Chart',
  category: 'charts',
  description: 'Waterfall chart for showing cumulative effect of sequential positive and negative values.',
  variants: [
    {
      name: 'Basic',
      props: {
        data: [
          { label: 'Start', value: 100 },
          { label: 'Revenue', value: 50 },
          { label: 'Costs', value: -30 },
          { label: 'Tax', value: -15 },
          { label: 'Profit', value: 5 },
        ],
        x: 'label',
        y: 'value',
        title: 'Profit Waterfall',
      },
    },
    {
      name: 'Budget Analysis',
      props: {
        data: [
          { label: 'Budget', value: 500 },
          { label: 'Salaries', value: -200 },
          { label: 'Marketing', value: -80 },
          { label: 'New Sales', value: 120 },
          { label: 'Operations', value: -60 },
          { label: 'Final', value: 280 },
        ],
        x: 'label',
        y: 'value',
        title: 'Budget Breakdown',
      },
    },
  ],
  playground: {
    defaults: {
      data: [
        { label: 'Start', value: 100 },
        { label: 'Add', value: 50 },
        { label: 'Remove', value: -30 },
        { label: 'End', value: 120 },
      ],
      x: 'label',
      y: 'value',
      title: 'Waterfall',
    },
    controls: [
      { name: 'height', type: 'text' },
      { name: 'animate', type: 'boolean' },
      { name: 'tooltip', type: 'boolean' },
      { name: 'legend', type: 'boolean' },
    ],
  },
  usage: [
    {
      title: 'Profit waterfall',
      code: `import { Chart } from '@decantr/ui-chart';

const chart = Chart({
  type: 'waterfall',
  data: [
    { label: 'Revenue', value: 200 },
    { label: 'Costs', value: -80 },
    { label: 'Profit', value: 120 },
  ],
  x: 'label',
  y: 'value',
});
document.body.appendChild(chart);`,
    },
  ],
};
