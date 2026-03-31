import { Skeleton } from '@decantr/ui/components';

export default {
  component: (props) => Skeleton(props),
  title: 'Skeleton',
  category: 'components/original',
  description: 'Loading placeholder with text, rectangle, and circle variants.',
  variants: [
    { name: 'Default (Text)', props: {} },
    { name: 'Rectangle', props: { variant: 'rect', width: '200px', height: '120px' } },
    { name: 'Circle', props: { variant: 'circle', width: '48px', height: '48px' } },
    { name: 'Multiple Lines', props: { lines: 3 } },
    { name: 'Five Lines', props: { lines: 5 } },
    { name: 'Custom Width', props: { width: '60%' } },
    { name: 'Custom Height', props: { variant: 'rect', width: '100%', height: '200px' } },
  ],
  playground: {
    defaults: { variant: 'text' },
    controls: [
      { name: 'variant', type: 'select', options: ['text', 'rect', 'circle'] },
      { name: 'width', type: 'text' },
      { name: 'height', type: 'text' },
      { name: 'lines', type: 'number' },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { Skeleton } from '@decantr/ui/components';

const skeleton = Skeleton({ variant: 'rect', width: '200px', height: '120px' });
document.body.appendChild(skeleton);`,
    },
  ],
};
