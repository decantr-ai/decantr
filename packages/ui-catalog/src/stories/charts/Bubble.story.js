import { Chart } from '@decantr/ui-chart';

export default {
  component: (props) => Chart({ type: 'bubble', ...props }),
  title: 'Bubble Chart',
  category: 'charts',
  description: 'Bubble chart for three-dimensional data using position and size encoding.',
  variants: [
    {
      name: 'Basic',
      props: {
        data: [
          { x: 10, y: 20, size: 15 },
          { x: 25, y: 35, size: 30 },
          { x: 40, y: 28, size: 20 },
          { x: 55, y: 45, size: 40 },
          { x: 70, y: 50, size: 25 },
        ],
        x: 'x',
        y: 'y',
        title: 'Market Analysis',
      },
    },
    {
      name: 'Country GDP',
      props: {
        data: [
          { x: 80, y: 78, size: 330, label: 'USA' },
          { x: 20, y: 76, size: 1400, label: 'China' },
          { x: 45, y: 83, size: 126, label: 'Japan' },
          { x: 55, y: 81, size: 83, label: 'Germany' },
          { x: 10, y: 69, size: 1380, label: 'India' },
        ],
        x: 'x',
        y: 'y',
        title: 'GDP per Capita vs Life Expectancy',
      },
    },
  ],
  playground: {
    defaults: {
      data: [
        { x: 10, y: 20, size: 15 },
        { x: 25, y: 35, size: 30 },
        { x: 40, y: 28, size: 20 },
      ],
      x: 'x',
      y: 'y',
      title: 'Bubble Chart',
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
      title: 'Basic bubble chart',
      code: `import { Chart } from '@decantr/ui-chart';

const chart = Chart({
  type: 'bubble',
  data: [
    { x: 10, y: 20, size: 15 },
    { x: 25, y: 35, size: 30 },
  ],
  x: 'x',
  y: 'y',
});
document.body.appendChild(chart);`,
    },
  ],
};
