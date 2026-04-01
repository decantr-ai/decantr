import { Chart } from '@decantr/ui-chart';

export default {
  component: (props) => Chart({ type: 'candlestick', ...props }),
  title: 'Candlestick Chart',
  category: 'charts',
  description: 'Candlestick chart for financial OHLC data visualization.',
  variants: [
    {
      name: 'Basic',
      props: {
        data: [
          { date: 'Mon', open: 100, high: 110, low: 95, close: 108 },
          { date: 'Tue', open: 108, high: 115, low: 102, close: 104 },
          { date: 'Wed', open: 104, high: 112, low: 100, close: 110 },
          { date: 'Thu', open: 110, high: 118, low: 106, close: 115 },
          { date: 'Fri', open: 115, high: 120, low: 108, close: 112 },
        ],
        x: 'date',
        y: 'close',
        title: 'Stock Price (OHLC)',
      },
    },
    {
      name: 'Weekly View',
      props: {
        data: [
          { date: 'Week 1', open: 150, high: 165, low: 142, close: 160 },
          { date: 'Week 2', open: 160, high: 172, low: 155, close: 158 },
          { date: 'Week 3', open: 158, high: 168, low: 148, close: 165 },
          { date: 'Week 4', open: 165, high: 180, low: 160, close: 175 },
        ],
        x: 'date',
        y: 'close',
        title: 'Weekly Stock Movement',
      },
    },
  ],
  playground: {
    defaults: {
      data: [
        { date: 'Mon', open: 100, high: 110, low: 95, close: 108 },
        { date: 'Tue', open: 108, high: 115, low: 102, close: 104 },
        { date: 'Wed', open: 104, high: 112, low: 100, close: 110 },
      ],
      x: 'date',
      y: 'close',
      title: 'Candlestick',
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
      title: 'OHLC candlestick',
      code: `import { Chart } from '@decantr/ui-chart';

const chart = Chart({
  type: 'candlestick',
  data: [
    { date: 'Mon', open: 100, high: 110, low: 95, close: 108 },
    { date: 'Tue', open: 108, high: 115, low: 102, close: 104 },
  ],
  x: 'date',
  y: 'close',
});
document.body.appendChild(chart);`,
    },
  ],
};
