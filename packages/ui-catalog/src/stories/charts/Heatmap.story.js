import { Chart } from '@decantr/ui-chart';

export default {
  component: (props) => Chart({ type: 'heatmap', ...props }),
  title: 'Heatmap',
  category: 'charts',
  description: 'Heatmap for visualizing matrix data with color intensity encoding.',
  variants: [
    {
      name: 'Basic',
      props: {
        data: [
          { x: 'Mon', y: '9am', value: 5 },
          { x: 'Mon', y: '12pm', value: 12 },
          { x: 'Mon', y: '3pm', value: 8 },
          { x: 'Tue', y: '9am', value: 3 },
          { x: 'Tue', y: '12pm', value: 15 },
          { x: 'Tue', y: '3pm', value: 10 },
          { x: 'Wed', y: '9am', value: 7 },
          { x: 'Wed', y: '12pm', value: 18 },
          { x: 'Wed', y: '3pm', value: 6 },
        ],
        x: 'x',
        y: 'y',
        title: 'Activity Heatmap',
      },
    },
    {
      name: 'Weekly Schedule',
      props: {
        data: [
          { x: 'Mon', y: 'Morning', value: 8 },
          { x: 'Mon', y: 'Afternoon', value: 12 },
          { x: 'Mon', y: 'Evening', value: 4 },
          { x: 'Tue', y: 'Morning', value: 6 },
          { x: 'Tue', y: 'Afternoon', value: 14 },
          { x: 'Tue', y: 'Evening', value: 7 },
          { x: 'Wed', y: 'Morning', value: 10 },
          { x: 'Wed', y: 'Afternoon', value: 9 },
          { x: 'Wed', y: 'Evening', value: 3 },
          { x: 'Thu', y: 'Morning', value: 5 },
          { x: 'Thu', y: 'Afternoon', value: 16 },
          { x: 'Thu', y: 'Evening', value: 8 },
          { x: 'Fri', y: 'Morning', value: 11 },
          { x: 'Fri', y: 'Afternoon', value: 7 },
          { x: 'Fri', y: 'Evening', value: 2 },
        ],
        x: 'x',
        y: 'y',
        title: 'Meeting Load by Time',
      },
    },
  ],
  playground: {
    defaults: {
      data: [
        { x: 'Mon', y: '9am', value: 5 },
        { x: 'Mon', y: '12pm', value: 12 },
        { x: 'Tue', y: '9am', value: 3 },
        { x: 'Tue', y: '12pm', value: 15 },
      ],
      x: 'x',
      y: 'y',
      title: 'Heatmap',
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
      title: 'Activity heatmap',
      code: `import { Chart } from '@decantr/ui-chart';

const chart = Chart({
  type: 'heatmap',
  data: [
    { x: 'Mon', y: '9am', value: 5 },
    { x: 'Mon', y: '12pm', value: 12 },
    { x: 'Tue', y: '9am', value: 3 },
  ],
  x: 'x',
  y: 'y',
});
document.body.appendChild(chart);`,
    },
  ],
};
