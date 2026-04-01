import { Chart } from '@decantr/ui-chart';

export default {
  component: (props) => Chart({ type: 'treemap', ...props }),
  title: 'Treemap',
  category: 'charts',
  description: 'Treemap for displaying hierarchical data as nested rectangles sized by value.',
  variants: [
    {
      name: 'Basic',
      props: {
        data: [
          { name: 'Technology', value: 400 },
          { name: 'Healthcare', value: 250 },
          { name: 'Finance', value: 300 },
          { name: 'Energy', value: 150 },
          { name: 'Consumer', value: 200 },
        ],
        x: 'name',
        y: 'value',
        title: 'Market Sectors',
      },
    },
    {
      name: 'Nested',
      props: {
        data: [
          {
            name: 'Frontend',
            value: 100,
            children: [
              { name: 'React', value: 45 },
              { name: 'Vue', value: 30 },
              { name: 'Angular', value: 25 },
            ],
          },
          {
            name: 'Backend',
            value: 80,
            children: [
              { name: 'Node', value: 40 },
              { name: 'Python', value: 25 },
              { name: 'Go', value: 15 },
            ],
          },
        ],
        x: 'name',
        y: 'value',
        title: 'Tech Stack Usage',
      },
    },
  ],
  playground: {
    defaults: {
      data: [
        { name: 'A', value: 100 },
        { name: 'B', value: 80 },
        { name: 'C', value: 60 },
        { name: 'D', value: 40 },
      ],
      x: 'name',
      y: 'value',
      title: 'Treemap',
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
      title: 'Disk usage treemap',
      code: `import { Chart } from '@decantr/ui-chart';

const chart = Chart({
  type: 'treemap',
  data: [
    { name: 'Documents', value: 50 },
    { name: 'Photos', value: 120 },
    { name: 'Videos', value: 200 },
  ],
  x: 'name',
  y: 'value',
});
document.body.appendChild(chart);`,
    },
  ],
};
