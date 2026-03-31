import { Chart } from '@decantr/ui-chart';

export default {
  component: (props) => Chart({ type: 'box-plot', ...props }),
  title: 'Box Plot',
  category: 'charts',
  description: 'Box plot for displaying statistical distribution with quartiles and outliers.',
  variants: [
    {
      name: 'Basic',
      props: {
        data: [
          { group: 'Team A', min: 20, q1: 35, median: 45, q3: 58, max: 72 },
          { group: 'Team B', min: 15, q1: 28, median: 40, q3: 52, max: 68 },
          { group: 'Team C', min: 30, q1: 42, median: 55, q3: 65, max: 80 },
        ],
        x: 'group',
        y: 'median',
        title: 'Performance Distribution',
      },
    },
    {
      name: 'Salary Comparison',
      props: {
        data: [
          { group: 'Engineering', min: 60, q1: 80, median: 95, q3: 120, max: 160 },
          { group: 'Design', min: 50, q1: 65, median: 80, q3: 100, max: 130 },
          { group: 'Marketing', min: 45, q1: 60, median: 72, q3: 90, max: 120 },
          { group: 'Sales', min: 40, q1: 55, median: 70, q3: 95, max: 150 },
        ],
        x: 'group',
        y: 'median',
        title: 'Salary by Department (K)',
      },
    },
  ],
  playground: {
    defaults: {
      data: [
        { group: 'A', min: 20, q1: 35, median: 45, q3: 58, max: 72 },
        { group: 'B', min: 15, q1: 28, median: 40, q3: 52, max: 68 },
      ],
      x: 'group',
      y: 'median',
      title: 'Box Plot',
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
      title: 'Basic box plot',
      code: `import { Chart } from '@decantr/ui-chart';

const chart = Chart({
  type: 'box-plot',
  data: [
    { group: 'A', min: 20, q1: 35, median: 45, q3: 58, max: 72 },
    { group: 'B', min: 15, q1: 28, median: 40, q3: 52, max: 68 },
  ],
  x: 'group',
  y: 'median',
});
document.body.appendChild(chart);`,
    },
  ],
};
