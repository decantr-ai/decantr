import { Carousel } from '@decantr/ui/components';
import { h } from '@decantr/ui';

function makeSlides(count) {
  const colors = ['#e2e8f0', '#c7d2fe', '#bbf7d0', '#fde68a', '#fecaca'];
  return Array.from({ length: count }, (_, i) => {
    const slide = h('div', {
      style: {
        background: colors[i % colors.length],
        height: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem',
        fontWeight: 'bold',
      },
    }, `Slide ${i + 1}`);
    return slide;
  });
}

export default {
  component: (props) => Carousel({ slides: makeSlides(props._slideCount || 4), ...props }),
  title: 'Carousel',
  category: 'components/data-display',
  description: 'Slide-based content carousel with navigation arrows, dot indicators, autoplay, and keyboard support.',
  variants: [
    { name: 'Default', props: { _slideCount: 4 } },
    { name: 'No Arrows', props: { arrows: false, _slideCount: 4 } },
    { name: 'No Dots', props: { dots: false, _slideCount: 4 } },
    { name: 'Autoplay', props: { autoplay: true, interval: 2000, _slideCount: 4 } },
    { name: 'No Loop', props: { loop: false, _slideCount: 3 } },
    { name: 'Single Slide', props: { _slideCount: 1 } },
  ],
  playground: {
    defaults: { _slideCount: 4 },
    controls: [
      { name: 'autoplay', type: 'boolean' },
      { name: 'interval', type: 'number' },
      { name: 'arrows', type: 'boolean' },
      { name: 'dots', type: 'boolean' },
      { name: 'loop', type: 'boolean' },
      { name: '_slideCount', type: 'number' },
    ],
  },
  usage: [
    {
      title: 'Basic carousel',
      code: `import { Carousel } from '@decantr/ui/components';
import { h } from '@decantr/ui';

const carousel = Carousel({
  slides: [
    h('div', null, 'Slide 1'),
    h('div', null, 'Slide 2'),
    h('div', null, 'Slide 3'),
  ],
  onChange: (idx) => console.log('Current slide:', idx),
});
document.body.appendChild(carousel);`,
    },
    {
      title: 'Autoplay carousel',
      code: `import { Carousel } from '@decantr/ui/components';

const carousel = Carousel({
  slides: mySlides,
  autoplay: true,
  interval: 5000,
});`,
    },
  ],
};
