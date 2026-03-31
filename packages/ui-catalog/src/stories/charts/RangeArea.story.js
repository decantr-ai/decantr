import { Chart } from '@decantr/ui-chart';

export default {
  component: (props) => Chart({ type: 'range-area', ...props }),
  title: 'Range Area Chart',
  category: 'charts',
  description: 'Range area chart for showing a band of values between upper and lower bounds.',
  variants: [
    {
      name: 'Basic',
      props: {
        data: [
          { month: 'Jan', low: 10, high: 25 },
          { month: 'Feb', low: 12, high: 28 },
          { month: 'Mar', low: 18, high: 35 },
          { month: 'Apr', low: 22, high: 40 },
          { month: 'May', low: 25, high: 42 },
          { month: 'Jun', low: 20, high: 38 },
        ],
        x: 'month',
        y: ['low', 'high'],
        title: 'Temperature Range',
      },
    },
    {
      name: 'Confidence Interval',
      props: {
        data: [
          { day: 'Day 1', lower: 90, upper: 110 },
          { day: 'Day 2', lower: 95, upper: 120 },
          { day: 'Day 3', lower: 88, upper: 115 },
          { day: 'Day 4', lower: 92, upper: 125 },
          { day: 'Day 5', lower: 100, upper: 130 },
        ],
        x: 'day',
        y: ['lower', 'upper'],
        title: 'Forecast Confidence Band',
        smooth: true,
      },
    },
  ],
  playground: {
    defaults: {
      data: [
        { month: 'Jan', low: 10, high: 25 },
        { month: 'Feb', low: 12, high: 28 },
        { month: 'Mar', low: 18, high: 35 },
      ],
      x: 'month',
      y: ['low', 'high'],
      title: 'Range Area',
    },
    controls: [
      { name: 'height', type: 'text' },
      { name: 'animate', type: 'boolean' },
      { name: 'tooltip', type: 'boolean' },
      { name: 'legend', type: 'boolean' },
      { name: 'smooth', type: 'boolean' },
    ],
  },
  usage: [
    {
      title: 'Range area with smooth curves',
      code: `import { Chart } from '@decantr/ui-chart';

const chart = Chart({
  type: 'range-area',
  data: [
    { month: 'Jan', low: 10, high: 25 },
    { month: 'Feb', low: 12, high: 28 },
  ],
  x: 'month',
  y: ['low', 'high'],
  smooth: true,
});
document.body.appendChild(chart);`,
    },
  ],
};
