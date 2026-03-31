import { Chart } from '@decantr/ui-chart';

export default {
  component: (props) => Chart({ type: 'scatter', ...props }),
  title: 'Scatter Chart',
  category: 'charts',
  description: 'Scatter plot for visualizing correlations between two numeric variables.',
  variants: [
    {
      name: 'Basic',
      props: {
        data: [
          { x: 10, y: 20 },
          { x: 15, y: 35 },
          { x: 22, y: 28 },
          { x: 30, y: 45 },
          { x: 35, y: 50 },
          { x: 42, y: 38 },
          { x: 50, y: 60 },
          { x: 58, y: 55 },
        ],
        x: 'x',
        y: 'y',
        title: 'Height vs Weight',
      },
    },
    {
      name: 'Multi-Group',
      props: {
        data: [
          { age: 25, income: 35, group: 'A' },
          { age: 30, income: 50, group: 'A' },
          { age: 35, income: 65, group: 'B' },
          { age: 40, income: 72, group: 'B' },
          { age: 28, income: 42, group: 'A' },
          { age: 45, income: 80, group: 'B' },
          { age: 33, income: 55, group: 'A' },
          { age: 50, income: 90, group: 'B' },
        ],
        x: 'age',
        y: 'income',
        title: 'Age vs Income',
      },
    },
  ],
  playground: {
    defaults: {
      data: [
        { x: 10, y: 20 },
        { x: 15, y: 35 },
        { x: 22, y: 28 },
        { x: 30, y: 45 },
        { x: 35, y: 50 },
      ],
      x: 'x',
      y: 'y',
      title: 'Scatter Plot',
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
      title: 'Basic scatter plot',
      code: `import { Chart } from '@decantr/ui-chart';

const chart = Chart({
  type: 'scatter',
  data: [
    { x: 10, y: 20 },
    { x: 15, y: 35 },
    { x: 22, y: 28 },
  ],
  x: 'x',
  y: 'y',
  title: 'Correlation',
});
document.body.appendChild(chart);`,
    },
  ],
};
