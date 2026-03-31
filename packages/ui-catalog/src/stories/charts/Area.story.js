import { Chart } from '@decantr/ui-chart';

export default {
  component: (props) => Chart({ type: 'area', ...props }),
  title: 'Area Chart',
  category: 'charts',
  description: 'Area chart for showing volume and trends over time with filled regions.',
  variants: [
    {
      name: 'Basic',
      props: {
        data: [
          { month: 'Jan', value: 40 },
          { month: 'Feb', value: 55 },
          { month: 'Mar', value: 48 },
          { month: 'Apr', value: 62 },
          { month: 'May', value: 71 },
          { month: 'Jun', value: 65 },
        ],
        x: 'month',
        y: 'value',
        title: 'Website Traffic',
      },
    },
    {
      name: 'Stacked Multi-Series',
      props: {
        data: [
          { month: 'Jan', organic: 30, paid: 10, referral: 8 },
          { month: 'Feb', organic: 35, paid: 15, referral: 10 },
          { month: 'Mar', organic: 42, paid: 12, referral: 14 },
          { month: 'Apr', organic: 50, paid: 18, referral: 12 },
          { month: 'May', organic: 55, paid: 22, referral: 16 },
          { month: 'Jun', organic: 48, paid: 20, referral: 15 },
        ],
        x: 'month',
        y: ['organic', 'paid', 'referral'],
        title: 'Traffic Sources',
        stacked: true,
      },
    },
    {
      name: 'Smooth',
      props: {
        data: [
          { month: 'Jan', value: 40 },
          { month: 'Feb', value: 55 },
          { month: 'Mar', value: 48 },
          { month: 'Apr', value: 62 },
          { month: 'May', value: 71 },
          { month: 'Jun', value: 65 },
        ],
        x: 'month',
        y: 'value',
        title: 'Smooth Area',
        smooth: true,
      },
    },
  ],
  playground: {
    defaults: {
      data: [
        { month: 'Jan', value: 40 },
        { month: 'Feb', value: 55 },
        { month: 'Mar', value: 48 },
        { month: 'Apr', value: 62 },
        { month: 'May', value: 71 },
      ],
      x: 'month',
      y: 'value',
      title: 'Area Chart',
    },
    controls: [
      { name: 'height', type: 'text' },
      { name: 'animate', type: 'boolean' },
      { name: 'tooltip', type: 'boolean' },
      { name: 'legend', type: 'boolean' },
      { name: 'smooth', type: 'boolean' },
      { name: 'stacked', type: 'boolean' },
    ],
  },
  usage: [
    {
      title: 'Stacked area chart',
      code: `import { Chart } from '@decantr/ui-chart';

const chart = Chart({
  type: 'area',
  data: [
    { month: 'Jan', organic: 30, paid: 10 },
    { month: 'Feb', organic: 35, paid: 15 },
  ],
  x: 'month',
  y: ['organic', 'paid'],
  stacked: true,
});
document.body.appendChild(chart);`,
    },
  ],
};
