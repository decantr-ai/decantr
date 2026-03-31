import { Chart } from '@decantr/ui-chart';

export default {
  component: (props) => Chart({ type: 'range-bar', ...props }),
  title: 'Range Bar Chart',
  category: 'charts',
  description: 'Range bar chart for displaying data spans with start and end values.',
  variants: [
    {
      name: 'Basic',
      props: {
        data: [
          { task: 'Design', start: 0, end: 3 },
          { task: 'Development', start: 2, end: 7 },
          { task: 'Testing', start: 5, end: 8 },
          { task: 'Deployment', start: 7, end: 9 },
        ],
        x: 'task',
        y: ['start', 'end'],
        title: 'Project Timeline (Weeks)',
      },
    },
    {
      name: 'Temperature Range',
      props: {
        data: [
          { month: 'Jan', low: -5, high: 4 },
          { month: 'Feb', low: -3, high: 6 },
          { month: 'Mar', low: 2, high: 12 },
          { month: 'Apr', low: 6, high: 18 },
          { month: 'May', low: 10, high: 23 },
        ],
        x: 'month',
        y: ['low', 'high'],
        title: 'Monthly Temperature Range',
      },
    },
  ],
  playground: {
    defaults: {
      data: [
        { task: 'Phase 1', start: 0, end: 3 },
        { task: 'Phase 2', start: 2, end: 6 },
        { task: 'Phase 3', start: 5, end: 8 },
      ],
      x: 'task',
      y: ['start', 'end'],
      title: 'Range Bar',
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
      title: 'Project timeline',
      code: `import { Chart } from '@decantr/ui-chart';

const chart = Chart({
  type: 'range-bar',
  data: [
    { task: 'Design', start: 0, end: 3 },
    { task: 'Build', start: 2, end: 7 },
  ],
  x: 'task',
  y: ['start', 'end'],
});
document.body.appendChild(chart);`,
    },
  ],
};
