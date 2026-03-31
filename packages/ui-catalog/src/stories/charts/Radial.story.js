import { Chart } from '@decantr/ui-chart';

export default {
  component: (props) => Chart({ type: 'radial', ...props }),
  title: 'Radial Chart',
  category: 'charts',
  description: 'Radial bar chart for displaying categorical data in a circular layout.',
  variants: [
    {
      name: 'Basic',
      props: {
        data: [
          { label: 'Running', value: 75 },
          { label: 'Cycling', value: 60 },
          { label: 'Swimming', value: 45 },
          { label: 'Yoga', value: 90 },
        ],
        x: 'label',
        y: 'value',
        title: 'Weekly Activity Goals',
      },
    },
    {
      name: 'Progress Rings',
      props: {
        data: [
          { label: 'Calories', value: 82 },
          { label: 'Steps', value: 65 },
          { label: 'Distance', value: 48 },
        ],
        x: 'label',
        y: 'value',
        title: 'Daily Progress (%)',
      },
    },
  ],
  playground: {
    defaults: {
      data: [
        { label: 'A', value: 75 },
        { label: 'B', value: 60 },
        { label: 'C', value: 45 },
      ],
      x: 'label',
      y: 'value',
      title: 'Radial Chart',
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
      title: 'Radial progress',
      code: `import { Chart } from '@decantr/ui-chart';

const chart = Chart({
  type: 'radial',
  data: [
    { label: 'Progress', value: 72 },
    { label: 'Target', value: 100 },
  ],
  x: 'label',
  y: 'value',
});
document.body.appendChild(chart);`,
    },
  ],
};
