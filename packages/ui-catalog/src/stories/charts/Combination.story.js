import { Chart } from '@decantr/ui-chart';

export default {
  component: (props) => Chart({ type: 'combination', ...props }),
  title: 'Combination Chart',
  category: 'charts',
  description: 'Combination chart mixing bar and line series for multi-metric comparison.',
  variants: [
    {
      name: 'Bar + Line',
      props: {
        data: [
          { month: 'Jan', revenue: 120, growth: 5 },
          { month: 'Feb', revenue: 150, growth: 8 },
          { month: 'Mar', revenue: 135, growth: 6 },
          { month: 'Apr', revenue: 180, growth: 12 },
          { month: 'May', revenue: 200, growth: 15 },
          { month: 'Jun', revenue: 190, growth: 10 },
        ],
        x: 'month',
        y: ['revenue', 'growth'],
        title: 'Revenue & Growth Rate',
      },
    },
    {
      name: 'Sales Overview',
      props: {
        data: [
          { quarter: 'Q1', units: 500, avgPrice: 45 },
          { quarter: 'Q2', units: 620, avgPrice: 48 },
          { quarter: 'Q3', units: 580, avgPrice: 50 },
          { quarter: 'Q4', units: 750, avgPrice: 52 },
        ],
        x: 'quarter',
        y: ['units', 'avgPrice'],
        title: 'Units Sold & Avg Price',
      },
    },
  ],
  playground: {
    defaults: {
      data: [
        { month: 'Jan', revenue: 120, growth: 5 },
        { month: 'Feb', revenue: 150, growth: 8 },
        { month: 'Mar', revenue: 135, growth: 6 },
      ],
      x: 'month',
      y: ['revenue', 'growth'],
      title: 'Combination',
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
      title: 'Bar and line combo',
      code: `import { Chart } from '@decantr/ui-chart';

const chart = Chart({
  type: 'combination',
  data: [
    { month: 'Jan', revenue: 120, growth: 5 },
    { month: 'Feb', revenue: 150, growth: 8 },
  ],
  x: 'month',
  y: ['revenue', 'growth'],
});
document.body.appendChild(chart);`,
    },
  ],
};
