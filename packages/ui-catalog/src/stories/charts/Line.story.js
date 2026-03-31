import { Chart } from '@decantr/ui-chart';

export default {
  component: (props) => Chart({ type: 'line', ...props }),
  title: 'Line Chart',
  category: 'charts',
  description: 'Line chart for visualizing trends over time with optional smoothing and data points.',
  variants: [
    {
      name: 'Basic',
      props: {
        data: [
          { month: 'Jan', value: 30 },
          { month: 'Feb', value: 45 },
          { month: 'Mar', value: 38 },
          { month: 'Apr', value: 52 },
          { month: 'May', value: 61 },
          { month: 'Jun', value: 55 },
        ],
        x: 'month',
        y: 'value',
        title: 'Monthly Revenue',
      },
    },
    {
      name: 'Multi-Series',
      props: {
        data: [
          { month: 'Jan', revenue: 30, expenses: 20 },
          { month: 'Feb', revenue: 45, expenses: 28 },
          { month: 'Mar', revenue: 38, expenses: 25 },
          { month: 'Apr', revenue: 52, expenses: 30 },
          { month: 'May', revenue: 61, expenses: 35 },
          { month: 'Jun', revenue: 55, expenses: 32 },
        ],
        x: 'month',
        y: ['revenue', 'expenses'],
        title: 'Revenue vs Expenses',
      },
    },
    {
      name: 'Smooth with Dots',
      props: {
        data: [
          { month: 'Jan', value: 30 },
          { month: 'Feb', value: 45 },
          { month: 'Mar', value: 38 },
          { month: 'Apr', value: 52 },
          { month: 'May', value: 61 },
          { month: 'Jun', value: 55 },
        ],
        x: 'month',
        y: 'value',
        title: 'Smooth Line',
        smooth: true,
        dots: true,
      },
    },
    {
      name: 'No Animation',
      props: {
        data: [
          { month: 'Jan', value: 30 },
          { month: 'Feb', value: 45 },
          { month: 'Mar', value: 38 },
          { month: 'Apr', value: 52 },
        ],
        x: 'month',
        y: 'value',
        title: 'Static Line',
        animate: false,
        tooltip: false,
      },
    },
  ],
  playground: {
    defaults: {
      data: [
        { month: 'Jan', value: 30 },
        { month: 'Feb', value: 45 },
        { month: 'Mar', value: 38 },
        { month: 'Apr', value: 52 },
        { month: 'May', value: 61 },
        { month: 'Jun', value: 55 },
      ],
      x: 'month',
      y: 'value',
      title: 'Line Chart',
    },
    controls: [
      { name: 'height', type: 'text' },
      { name: 'animate', type: 'boolean' },
      { name: 'tooltip', type: 'boolean' },
      { name: 'legend', type: 'boolean' },
      { name: 'smooth', type: 'boolean' },
      { name: 'dots', type: 'boolean' },
    ],
  },
  usage: [
    {
      title: 'Basic line chart',
      code: `import { Chart } from '@decantr/ui-chart';

const chart = Chart({
  type: 'line',
  data: [
    { month: 'Jan', value: 30 },
    { month: 'Feb', value: 45 },
    { month: 'Mar', value: 38 },
  ],
  x: 'month',
  y: 'value',
  title: 'Monthly Trend',
});
document.body.appendChild(chart);`,
    },
  ],
};
