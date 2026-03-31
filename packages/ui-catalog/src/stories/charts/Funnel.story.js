import { Chart } from '@decantr/ui-chart';

export default {
  component: (props) => Chart({ type: 'funnel', ...props }),
  title: 'Funnel Chart',
  category: 'charts',
  description: 'Funnel chart for visualizing progressive data reduction through stages.',
  variants: [
    {
      name: 'Basic',
      props: {
        data: [
          { stage: 'Visits', value: 10000 },
          { stage: 'Sign-ups', value: 4000 },
          { stage: 'Trials', value: 2000 },
          { stage: 'Paid', value: 800 },
          { stage: 'Retained', value: 500 },
        ],
        x: 'stage',
        y: 'value',
        title: 'Conversion Funnel',
      },
    },
    {
      name: 'Hiring Pipeline',
      props: {
        data: [
          { stage: 'Applications', value: 500 },
          { stage: 'Phone Screen', value: 200 },
          { stage: 'Interview', value: 80 },
          { stage: 'Offer', value: 25 },
          { stage: 'Hired', value: 15 },
        ],
        x: 'stage',
        y: 'value',
        title: 'Hiring Funnel',
      },
    },
  ],
  playground: {
    defaults: {
      data: [
        { stage: 'Step 1', value: 1000 },
        { stage: 'Step 2', value: 600 },
        { stage: 'Step 3', value: 300 },
        { stage: 'Step 4', value: 100 },
      ],
      x: 'stage',
      y: 'value',
      title: 'Funnel',
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
      title: 'Sales funnel',
      code: `import { Chart } from '@decantr/ui-chart';

const chart = Chart({
  type: 'funnel',
  data: [
    { stage: 'Visits', value: 10000 },
    { stage: 'Leads', value: 3000 },
    { stage: 'Sales', value: 500 },
  ],
  x: 'stage',
  y: 'value',
});
document.body.appendChild(chart);`,
    },
  ],
};
