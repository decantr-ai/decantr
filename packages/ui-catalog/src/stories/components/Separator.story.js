import { Separator } from '@decantr/ui/components';

export default {
  component: (props) => Separator(props),
  title: 'Separator',
  category: 'components/original',
  description: 'Visual divider for separating content, with optional label and vertical orientation.',
  variants: [
    { name: 'Default', props: {} },
    { name: 'With Label', props: { label: 'OR' } },
    { name: 'Vertical', props: { vertical: true } },
  ],
  playground: {
    defaults: {},
    controls: [
      { name: 'vertical', type: 'boolean' },
      { name: 'label', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { Separator } from '@decantr/ui/components';

const sep = Separator({ label: 'OR' });
document.body.appendChild(sep);`,
    },
  ],
};
