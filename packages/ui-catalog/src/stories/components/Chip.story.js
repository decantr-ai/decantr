import { Chip } from '@decantr/ui/components';

export default {
  component: (props) => Chip(props),
  title: 'Chip',
  category: 'components/original',
  description: 'Compact element for tags, labels, and selections with optional icon and dismiss button.',
  variants: [
    { name: 'Default', props: { label: 'Chip' } },
    { name: 'Outline', props: { label: 'Outline', variant: 'outline' } },
    { name: 'Filled', props: { label: 'Filled', variant: 'filled' } },
    { name: 'With Icon', props: { label: 'Star', icon: 'star' } },
    { name: 'Removable', props: { label: 'Removable', removable: true } },
    { name: 'Selected', props: { label: 'Selected', selected: true } },
    { name: 'Size XS', props: { label: 'Extra small', size: 'xs' } },
    { name: 'Size SM', props: { label: 'Small', size: 'sm' } },
    { name: 'Size LG', props: { label: 'Large', size: 'lg' } },
    { name: 'Success', props: { label: 'Success', color: 'success' } },
    { name: 'Error', props: { label: 'Error', color: 'error' } },
    { name: 'Warning', props: { label: 'Warning', color: 'warning' } },
    { name: 'Info', props: { label: 'Info', color: 'info' } },
    { name: 'Clickable', props: { label: 'Click me', onClick: () => {} } },
  ],
  playground: {
    defaults: { label: 'Chip' },
    controls: [
      { name: 'label', type: 'text' },
      { name: 'variant', type: 'select', options: ['default', 'outline', 'filled'] },
      { name: 'color', type: 'select', options: ['default', 'success', 'error', 'warning', 'info'] },
      { name: 'size', type: 'select', options: ['default', 'xs', 'sm', 'lg'] },
      { name: 'removable', type: 'boolean' },
      { name: 'selected', type: 'boolean' },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { Chip } from '@decantr/ui/components';

const chip = Chip({ label: 'React', icon: 'code', removable: true, onRemove: () => console.log('removed') });
document.body.appendChild(chip);`,
    },
  ],
};
