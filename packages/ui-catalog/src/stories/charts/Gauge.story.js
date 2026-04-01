import { Chart } from '@decantr/ui-chart';

export default {
  component: (props) => Chart({ type: 'gauge', ...props }),
  title: 'Gauge Chart',
  category: 'charts',
  description: 'Gauge chart for displaying a single metric against a scale or threshold.',
  variants: [
    {
      name: 'Basic',
      props: {
        data: [{ value: 73 }],
        title: 'CPU Usage',
      },
    },
    {
      name: 'High Value',
      props: {
        data: [{ value: 92 }],
        title: 'Memory Usage',
      },
    },
    {
      name: 'Low Value',
      props: {
        data: [{ value: 28 }],
        title: 'Disk Usage',
      },
    },
  ],
  playground: {
    defaults: {
      data: [{ value: 73 }],
      title: 'Gauge',
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
      title: 'Simple gauge',
      code: `import { Chart } from '@decantr/ui-chart';

const chart = Chart({
  type: 'gauge',
  data: [{ value: 73 }],
  title: 'Server Load',
});
document.body.appendChild(chart);`,
    },
  ],
};
