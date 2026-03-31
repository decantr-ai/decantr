import { Chart } from '@decantr/ui-chart';

export default {
  component: (props) => Chart({ type: 'histogram', ...props }),
  title: 'Histogram',
  category: 'charts',
  description: 'Histogram for showing frequency distribution of continuous data.',
  variants: [
    {
      name: 'Basic',
      props: {
        data: [
          { bin: '0-10', value: 5 },
          { bin: '10-20', value: 12 },
          { bin: '20-30', value: 25 },
          { bin: '30-40', value: 32 },
          { bin: '40-50', value: 28 },
          { bin: '50-60', value: 18 },
          { bin: '60-70', value: 10 },
          { bin: '70-80', value: 4 },
        ],
        x: 'bin',
        y: 'value',
        title: 'Test Score Distribution',
      },
    },
    {
      name: 'Age Distribution',
      props: {
        data: [
          { bin: '18-24', value: 150 },
          { bin: '25-34', value: 280 },
          { bin: '35-44', value: 220 },
          { bin: '45-54', value: 170 },
          { bin: '55-64', value: 90 },
          { bin: '65+', value: 45 },
        ],
        x: 'bin',
        y: 'value',
        title: 'User Age Distribution',
      },
    },
  ],
  playground: {
    defaults: {
      data: [
        { bin: '0-10', value: 5 },
        { bin: '10-20', value: 12 },
        { bin: '20-30', value: 25 },
        { bin: '30-40', value: 32 },
        { bin: '40-50', value: 28 },
      ],
      x: 'bin',
      y: 'value',
      title: 'Histogram',
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
      title: 'Basic histogram',
      code: `import { Chart } from '@decantr/ui-chart';

const chart = Chart({
  type: 'histogram',
  data: [
    { bin: '0-10', value: 5 },
    { bin: '10-20', value: 12 },
    { bin: '20-30', value: 25 },
  ],
  x: 'bin',
  y: 'value',
  title: 'Distribution',
});
document.body.appendChild(chart);`,
    },
  ],
};
