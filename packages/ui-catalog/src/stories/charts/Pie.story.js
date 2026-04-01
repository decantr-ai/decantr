import { Chart } from '@decantr/ui-chart';

export default {
  component: (props) => Chart({ type: 'pie', ...props }),
  title: 'Pie Chart',
  category: 'charts',
  description: 'Pie chart for displaying proportional data with optional donut mode.',
  variants: [
    {
      name: 'Basic',
      props: {
        data: [
          { label: 'Chrome', value: 65 },
          { label: 'Firefox', value: 15 },
          { label: 'Safari', value: 12 },
          { label: 'Edge', value: 8 },
        ],
        x: 'label',
        y: 'value',
        title: 'Browser Market Share',
      },
    },
    {
      name: 'Donut',
      props: {
        data: [
          { label: 'Chrome', value: 65 },
          { label: 'Firefox', value: 15 },
          { label: 'Safari', value: 12 },
          { label: 'Edge', value: 8 },
        ],
        x: 'label',
        y: 'value',
        title: 'Browser Share (Donut)',
        donut: true,
      },
    },
    {
      name: 'Revenue Breakdown',
      props: {
        data: [
          { label: 'Subscriptions', value: 45 },
          { label: 'One-time', value: 30 },
          { label: 'Enterprise', value: 20 },
          { label: 'Other', value: 5 },
        ],
        x: 'label',
        y: 'value',
        title: 'Revenue Sources',
        donut: true,
      },
    },
  ],
  playground: {
    defaults: {
      data: [
        { label: 'Chrome', value: 65 },
        { label: 'Firefox', value: 15 },
        { label: 'Safari', value: 12 },
        { label: 'Edge', value: 8 },
      ],
      x: 'label',
      y: 'value',
      title: 'Pie Chart',
    },
    controls: [
      { name: 'height', type: 'text' },
      { name: 'animate', type: 'boolean' },
      { name: 'tooltip', type: 'boolean' },
      { name: 'legend', type: 'boolean' },
      { name: 'donut', type: 'boolean' },
    ],
  },
  usage: [
    {
      title: 'Donut chart',
      code: `import { Chart } from '@decantr/ui-chart';

const chart = Chart({
  type: 'pie',
  data: [
    { label: 'Yes', value: 72 },
    { label: 'No', value: 28 },
  ],
  x: 'label',
  y: 'value',
  donut: true,
});
document.body.appendChild(chart);`,
    },
  ],
};
