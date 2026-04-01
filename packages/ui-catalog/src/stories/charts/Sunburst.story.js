import { Chart } from '@decantr/ui-chart';

export default {
  component: (props) => Chart({ type: 'sunburst', ...props }),
  title: 'Sunburst Chart',
  category: 'charts',
  description: 'Sunburst chart for visualizing hierarchical data as concentric rings.',
  variants: [
    {
      name: 'Basic',
      props: {
        data: [
          {
            name: 'Sales',
            value: 100,
            children: [
              { name: 'Online', value: 60 },
              { name: 'In-Store', value: 40 },
            ],
          },
          {
            name: 'Support',
            value: 50,
            children: [
              { name: 'Phone', value: 30 },
              { name: 'Email', value: 20 },
            ],
          },
        ],
        x: 'name',
        y: 'value',
        title: 'Department Breakdown',
      },
    },
    {
      name: 'File System',
      props: {
        data: [
          {
            name: 'src',
            value: 200,
            children: [
              { name: 'components', value: 80 },
              { name: 'utils', value: 40 },
              { name: 'pages', value: 80 },
            ],
          },
          {
            name: 'tests',
            value: 60,
            children: [
              { name: 'unit', value: 40 },
              { name: 'e2e', value: 20 },
            ],
          },
        ],
        x: 'name',
        y: 'value',
        title: 'Codebase Structure',
      },
    },
  ],
  playground: {
    defaults: {
      data: [
        {
          name: 'Group A',
          value: 100,
          children: [
            { name: 'Sub 1', value: 60 },
            { name: 'Sub 2', value: 40 },
          ],
        },
        { name: 'Group B', value: 50 },
      ],
      x: 'name',
      y: 'value',
      title: 'Sunburst',
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
      title: 'Hierarchical sunburst',
      code: `import { Chart } from '@decantr/ui-chart';

const chart = Chart({
  type: 'sunburst',
  data: [
    {
      name: 'Root',
      value: 100,
      children: [
        { name: 'Child A', value: 60 },
        { name: 'Child B', value: 40 },
      ],
    },
  ],
  x: 'name',
  y: 'value',
});
document.body.appendChild(chart);`,
    },
  ],
};
