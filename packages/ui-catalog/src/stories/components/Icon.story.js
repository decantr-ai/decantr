import { icon } from '@decantr/ui/components';

export default {
  component: (props) => icon(props._name || 'check', props),
  title: 'Icon',
  category: 'components/original',
  description: 'Function-based SVG icon with configurable size, stroke weight, and filled mode.',
  variants: [
    { name: 'Default (Check)', props: { _name: 'check' } },
    { name: 'Arrow Right', props: { _name: 'arrow-right' } },
    { name: 'Star', props: { _name: 'star' } },
    { name: 'Heart', props: { _name: 'heart' } },
    { name: 'Search', props: { _name: 'search' } },
    { name: 'Settings', props: { _name: 'settings' } },
    { name: 'Size 16px', props: { _name: 'check', size: '16px' } },
    { name: 'Size 32px', props: { _name: 'check', size: '32px' } },
    { name: 'Size 48px', props: { _name: 'check', size: '48px' } },
    { name: 'Weight Thin', props: { _name: 'star', weight: 'thin' } },
    { name: 'Weight Light', props: { _name: 'star', weight: 'light' } },
    { name: 'Weight Medium', props: { _name: 'star', weight: 'medium' } },
    { name: 'Weight Bold', props: { _name: 'star', weight: 'bold' } },
    { name: 'Filled', props: { _name: 'heart', filled: true } },
  ],
  playground: {
    defaults: { _name: 'check', size: '1.25em' },
    controls: [
      { name: '_name', type: 'text' },
      { name: 'size', type: 'text' },
      { name: 'weight', type: 'select', options: ['thin', 'light', 'regular', 'medium', 'bold'] },
      { name: 'filled', type: 'boolean' },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { icon } from '@decantr/ui/components';

const el = icon('check', { size: '24px', weight: 'medium' });
document.body.appendChild(el);`,
    },
  ],
};
