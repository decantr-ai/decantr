import { Placeholder } from '@decantr/ui/components';

export default {
  component: (props) => Placeholder(props),
  title: 'Placeholder',
  category: 'components/data-display',
  description: 'Branded visual placeholder for images, avatars, and icons with Decantr logo watermark and optional shimmer animation.',
  variants: [
    { name: 'Default (Image)', props: {} },
    { name: 'Avatar Variant', props: { variant: 'avatar' } },
    { name: 'Icon Variant', props: { variant: 'icon' } },
    { name: 'With Label', props: { label: '800 x 600' } },
    { name: 'Custom Dimensions', props: { width: '300px', height: '200px' } },
    { name: 'Custom Aspect Ratio', props: { aspectRatio: '16/9', width: '400px' } },
    { name: 'Animated', props: { animate: true, width: '300px', height: '200px' } },
  ],
  playground: {
    defaults: { width: '300px', height: '200px' },
    controls: [
      { name: 'variant', type: 'select', options: ['image', 'avatar', 'icon'] },
      { name: 'label', type: 'text' },
      { name: 'width', type: 'text' },
      { name: 'height', type: 'text' },
      { name: 'aspectRatio', type: 'text' },
      { name: 'animate', type: 'boolean' },
    ],
  },
  usage: [
    {
      title: 'Basic placeholder',
      code: `import { Placeholder } from '@decantr/ui/components';

const ph = Placeholder({ width: '400px', height: '300px', label: 'Preview' });
document.body.appendChild(ph);`,
    },
    {
      title: 'Avatar placeholder',
      code: `import { Placeholder } from '@decantr/ui/components';

const avatar = Placeholder({ variant: 'avatar' });`,
    },
  ],
};
