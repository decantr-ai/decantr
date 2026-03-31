import { Chart } from '@decantr/ui-chart';

export default {
  component: (props) => Chart({ type: 'chord', ...props }),
  title: 'Chord Diagram',
  category: 'charts',
  description: 'Chord diagram for visualizing relationships and flows between groups.',
  variants: [
    {
      name: 'Basic',
      props: {
        data: [
          { source: 'Engineering', target: 'Design', value: 20 },
          { source: 'Engineering', target: 'Product', value: 35 },
          { source: 'Design', target: 'Product', value: 25 },
          { source: 'Design', target: 'Marketing', value: 15 },
          { source: 'Product', target: 'Marketing', value: 30 },
          { source: 'Marketing', target: 'Engineering', value: 10 },
        ],
        x: 'source',
        y: 'value',
        title: 'Team Collaboration',
      },
    },
    {
      name: 'Trade Flow',
      props: {
        data: [
          { source: 'USA', target: 'China', value: 120 },
          { source: 'USA', target: 'EU', value: 90 },
          { source: 'China', target: 'EU', value: 80 },
          { source: 'EU', target: 'USA', value: 70 },
          { source: 'China', target: 'USA', value: 100 },
          { source: 'EU', target: 'China', value: 60 },
        ],
        x: 'source',
        y: 'value',
        title: 'Trade Relationships',
      },
    },
  ],
  playground: {
    defaults: {
      data: [
        { source: 'A', target: 'B', value: 30 },
        { source: 'B', target: 'C', value: 20 },
        { source: 'C', target: 'A', value: 25 },
      ],
      x: 'source',
      y: 'value',
      title: 'Chord',
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
      title: 'Relationship chord',
      code: `import { Chart } from '@decantr/ui-chart';

const chart = Chart({
  type: 'chord',
  data: [
    { source: 'Eng', target: 'Design', value: 20 },
    { source: 'Design', target: 'Product', value: 15 },
  ],
  x: 'source',
  y: 'value',
});
document.body.appendChild(chart);`,
    },
  ],
};
