import { Spinner } from '@decantr/ui/components';

export default {
  component: (props) => Spinner(props),
  title: 'Spinner',
  category: 'components/original',
  description: 'Loading indicator with ring, dots, pulse, bars, and orbit animation variants.',
  variants: [
    { name: 'Ring (Default)', props: {} },
    { name: 'Dots', props: { variant: 'dots' } },
    { name: 'Pulse', props: { variant: 'pulse' } },
    { name: 'Bars', props: { variant: 'bars' } },
    { name: 'Orbit', props: { variant: 'orbit' } },
    { name: 'Size XS', props: { size: 'xs' } },
    { name: 'Size SM', props: { size: 'sm' } },
    { name: 'Size LG', props: { size: 'lg' } },
    { name: 'Size XL', props: { size: 'xl' } },
    { name: 'Primary Color', props: { color: 'primary' } },
    { name: 'Success Color', props: { color: 'success' } },
    { name: 'Warning Color', props: { color: 'warning' } },
    { name: 'Destructive Color', props: { color: 'destructive' } },
    { name: 'Muted Color', props: { color: 'muted' } },
    { name: 'Custom Label', props: { label: 'Processing...' } },
  ],
  playground: {
    defaults: { variant: 'ring' },
    controls: [
      { name: 'variant', type: 'select', options: ['ring', 'dots', 'pulse', 'bars', 'orbit'] },
      { name: 'size', type: 'select', options: ['xs', 'sm', 'default', 'lg', 'xl'] },
      { name: 'color', type: 'select', options: ['primary', 'success', 'warning', 'destructive', 'info', 'muted'] },
      { name: 'label', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { Spinner } from '@decantr/ui/components';

const spinner = Spinner({ variant: 'ring', size: 'lg', color: 'primary' });
document.body.appendChild(spinner);`,
    },
  ],
};
