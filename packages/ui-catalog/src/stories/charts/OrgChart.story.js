import { Chart } from '@decantr/ui-chart';

export default {
  component: (props) => Chart({ type: 'org-chart', ...props }),
  title: 'Org Chart',
  category: 'charts',
  description: 'Organization chart for displaying hierarchical reporting structures.',
  variants: [
    {
      name: 'Basic',
      props: {
        data: [
          {
            name: 'CEO',
            value: 1,
            children: [
              {
                name: 'CTO',
                value: 1,
                children: [
                  { name: 'Engineering Lead', value: 1 },
                  { name: 'DevOps Lead', value: 1 },
                ],
              },
              {
                name: 'CFO',
                value: 1,
                children: [
                  { name: 'Finance Manager', value: 1 },
                ],
              },
            ],
          },
        ],
        x: 'name',
        y: 'value',
        title: 'Company Structure',
      },
    },
    {
      name: 'Team Hierarchy',
      props: {
        data: [
          {
            name: 'VP Engineering',
            value: 1,
            children: [
              {
                name: 'Frontend Team',
                value: 1,
                children: [
                  { name: 'Senior Dev', value: 1 },
                  { name: 'Junior Dev', value: 1 },
                ],
              },
              {
                name: 'Backend Team',
                value: 1,
                children: [
                  { name: 'Senior Dev', value: 1 },
                  { name: 'Mid Dev', value: 1 },
                ],
              },
            ],
          },
        ],
        x: 'name',
        y: 'value',
        title: 'Engineering Org',
      },
    },
  ],
  playground: {
    defaults: {
      data: [
        {
          name: 'Root',
          value: 1,
          children: [
            { name: 'Child A', value: 1 },
            { name: 'Child B', value: 1 },
          ],
        },
      ],
      x: 'name',
      y: 'value',
      title: 'Org Chart',
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
      title: 'Organization chart',
      code: `import { Chart } from '@decantr/ui-chart';

const chart = Chart({
  type: 'org-chart',
  data: [
    {
      name: 'CEO',
      value: 1,
      children: [
        { name: 'CTO', value: 1 },
        { name: 'CFO', value: 1 },
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
