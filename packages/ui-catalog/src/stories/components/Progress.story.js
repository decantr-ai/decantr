import { Progress } from '@decantr/ui/components';

export default {
  component: (props) => Progress(props),
  title: 'Progress',
  category: 'components/original',
  description: 'Progress bar with variant colors, sizes, striped, and animated styles.',
  variants: [
    { name: 'Default (50%)', props: { value: 50 } },
    { name: 'Empty', props: { value: 0 } },
    { name: 'Full', props: { value: 100 } },
    { name: 'Primary', props: { value: 60, variant: 'primary' } },
    { name: 'Success', props: { value: 100, variant: 'success' } },
    { name: 'Warning', props: { value: 75, variant: 'warning' } },
    { name: 'Error', props: { value: 30, variant: 'error' } },
    { name: 'Size SM', props: { value: 50, size: 'sm' } },
    { name: 'Size MD', props: { value: 50, size: 'md' } },
    { name: 'Size LG', props: { value: 50, size: 'lg' } },
    { name: 'Striped', props: { value: 65, striped: true, variant: 'primary' } },
    { name: 'Animated', props: { value: 65, striped: true, animated: true, variant: 'primary' } },
    { name: 'With Label', props: { value: 72, label: '72%', size: 'md', variant: 'primary' } },
    { name: 'Custom Max', props: { value: 3, max: 10, label: '3/10', size: 'md' } },
  ],
  playground: {
    defaults: { value: 50, variant: 'primary' },
    controls: [
      { name: 'value', type: 'number' },
      { name: 'max', type: 'number' },
      { name: 'variant', type: 'select', options: ['primary', 'success', 'warning', 'error'] },
      { name: 'size', type: 'select', options: ['sm', 'default', 'md', 'lg'] },
      { name: 'striped', type: 'boolean' },
      { name: 'animated', type: 'boolean' },
      { name: 'label', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { Progress } from '@decantr/ui/components';

const bar = Progress({ value: 75, variant: 'success', label: '75%', size: 'md' });
document.body.appendChild(bar);`,
    },
  ],
};
