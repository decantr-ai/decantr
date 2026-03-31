import { Chart } from '@decantr/ui-chart';

export default {
  component: (props) => Chart({ type: 'sankey', ...props }),
  title: 'Sankey Diagram',
  category: 'charts',
  description: 'Sankey diagram for visualizing flow and magnitude between nodes.',
  variants: [
    {
      name: 'Basic',
      props: {
        data: [
          { source: 'Organic', target: 'Homepage', value: 500 },
          { source: 'Paid', target: 'Homepage', value: 300 },
          { source: 'Referral', target: 'Homepage', value: 200 },
          { source: 'Homepage', target: 'Sign Up', value: 400 },
          { source: 'Homepage', target: 'Pricing', value: 350 },
          { source: 'Homepage', target: 'Docs', value: 250 },
        ],
        x: 'source',
        y: 'value',
        title: 'Traffic Flow',
      },
    },
    {
      name: 'Energy Flow',
      props: {
        data: [
          { source: 'Solar', target: 'Grid', value: 40 },
          { source: 'Wind', target: 'Grid', value: 30 },
          { source: 'Gas', target: 'Grid', value: 50 },
          { source: 'Grid', target: 'Residential', value: 60 },
          { source: 'Grid', target: 'Commercial', value: 35 },
          { source: 'Grid', target: 'Industrial', value: 25 },
        ],
        x: 'source',
        y: 'value',
        title: 'Energy Distribution',
      },
    },
  ],
  playground: {
    defaults: {
      data: [
        { source: 'A', target: 'X', value: 50 },
        { source: 'B', target: 'X', value: 30 },
        { source: 'X', target: 'Y', value: 80 },
      ],
      x: 'source',
      y: 'value',
      title: 'Sankey',
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
      title: 'Traffic flow diagram',
      code: `import { Chart } from '@decantr/ui-chart';

const chart = Chart({
  type: 'sankey',
  data: [
    { source: 'Organic', target: 'Landing', value: 500 },
    { source: 'Landing', target: 'Signup', value: 200 },
  ],
  x: 'source',
  y: 'value',
});
document.body.appendChild(chart);`,
    },
  ],
};
