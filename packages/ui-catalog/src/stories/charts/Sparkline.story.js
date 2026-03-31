import { Sparkline } from '@decantr/ui-chart';

export default {
  component: (props) => Sparkline(props),
  title: 'Sparkline',
  category: 'charts',
  description: 'Compact inline sparkline for embedding small trend indicators in text or tables.',
  variants: [
    {
      name: 'Basic',
      props: {
        data: [1, 5, 3, 8, 2, 7, 4],
        height: '32',
        width: '120',
      },
    },
    {
      name: 'Upward Trend',
      props: {
        data: [2, 4, 3, 6, 8, 7, 10, 12],
        height: '32',
        width: '120',
      },
    },
    {
      name: 'Downward Trend',
      props: {
        data: [15, 12, 14, 10, 8, 9, 5, 3],
        height: '32',
        width: '120',
      },
    },
    {
      name: 'Wide',
      props: {
        data: [3, 7, 2, 9, 4, 6, 1, 8, 5, 10],
        height: '48',
        width: '200',
      },
    },
  ],
  playground: {
    defaults: {
      data: [1, 5, 3, 8, 2, 7, 4],
      height: '32',
      width: '120',
    },
    controls: [
      { name: 'height', type: 'text' },
      { name: 'width', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Inline sparkline',
      code: `import { Sparkline } from '@decantr/ui-chart';

const spark = Sparkline({
  data: [1, 5, 3, 8, 2],
  height: '32',
  width: '120',
});
document.body.appendChild(spark);`,
    },
  ],
};
