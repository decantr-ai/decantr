import { Marquee } from '@decantr/ui/components';
import { h } from '@decantr/ui/runtime';

function makeItems(texts) {
  return texts.map(t => h('span', { style: { padding: '4px 12px', background: '#f0f0f0', borderRadius: '4px', whiteSpace: 'nowrap' } }, t));
}

export default {
  component: (props) => {
    const items = makeItems(props._items || ['Breaking News', 'Latest Updates', 'Featured Story', 'Trending Now']);
    return Marquee(props, ...items);
  },
  title: 'Marquee',
  category: 'components/media',
  description: 'Continuously scrolling content strip with seamless loop using CSS animation.',
  variants: [
    { name: 'Default', props: {} },
    { name: 'Slow', props: { speed: 60 } },
    { name: 'Fast', props: { speed: 10 } },
    { name: 'Right Direction', props: { direction: 'right' } },
    { name: 'No Pause on Hover', props: { pauseOnHover: false } },
    { name: 'Wide Gap', props: { gap: 12 } },
    { name: 'More Repeats', props: { repeat: 6 } },
    { name: 'Ticker', props: { speed: 20, _items: ['AAPL +2.3%', 'GOOG -0.5%', 'MSFT +1.1%', 'AMZN +0.8%'] } },
  ],
  playground: {
    defaults: { speed: 30, direction: 'left', pauseOnHover: true, gap: 8, repeat: 4 },
    controls: [
      { name: 'speed', type: 'number' },
      { name: 'direction', type: 'select', options: ['left', 'right'] },
      { name: 'pauseOnHover', type: 'boolean' },
      { name: 'gap', type: 'number' },
      { name: 'repeat', type: 'number' },
    ],
  },
  usage: [
    {
      title: 'News ticker',
      code: `import { Marquee } from '@decantr/ui/components';
import { h } from '@decantr/ui/runtime';

const ticker = Marquee(
  { speed: 20, pauseOnHover: true },
  h('span', null, 'Breaking: Major event'),
  h('span', null, 'Sports: Team wins'),
  h('span', null, 'Weather: Sunny today'),
);
document.body.appendChild(ticker);`,
    },
    {
      title: 'Logo carousel',
      code: `import { Marquee } from '@decantr/ui/components';
import { h } from '@decantr/ui/runtime';

const logos = Marquee(
  { speed: 40, direction: 'right' },
  h('img', { src: '/logo1.svg', height: '40' }),
  h('img', { src: '/logo2.svg', height: '40' }),
);`,
    },
  ],
};
