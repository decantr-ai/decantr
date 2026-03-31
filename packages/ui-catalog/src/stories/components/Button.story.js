import { Button } from '@decantr/ui/components';

export default {
  component: (props) => Button(props, props._content || 'Button'),
  title: 'Button',
  category: 'components/original',
  description: 'Versatile button component with multiple variants, sizes, and states.',
  variants: [
    { name: 'Default', props: {} },
    { name: 'Primary', props: { variant: 'primary' } },
    { name: 'Secondary', props: { variant: 'secondary' } },
    { name: 'Tertiary', props: { variant: 'tertiary' } },
    { name: 'Destructive', props: { variant: 'destructive' } },
    { name: 'Success', props: { variant: 'success' } },
    { name: 'Warning', props: { variant: 'warning' } },
    { name: 'Outline', props: { variant: 'outline' } },
    { name: 'Ghost', props: { variant: 'ghost' } },
    { name: 'Link', props: { variant: 'link' } },
    { name: 'Size XS', props: { variant: 'primary', size: 'xs', _content: 'Tiny' } },
    { name: 'Size SM', props: { variant: 'primary', size: 'sm', _content: 'Small' } },
    { name: 'Size LG', props: { variant: 'primary', size: 'lg', _content: 'Large' } },
    { name: 'Disabled', props: { variant: 'primary', disabled: true } },
    { name: 'Loading', props: { variant: 'primary', loading: true } },
    { name: 'Block', props: { variant: 'primary', block: true, _content: 'Full Width' } },
    { name: 'Rounded', props: { variant: 'primary', rounded: true } },
    { name: 'Icon Size', props: { variant: 'primary', size: 'icon', _content: '+' } },
  ],
  playground: {
    defaults: { variant: 'primary', _content: 'Click me' },
    controls: [
      { name: 'variant', type: 'select', options: ['default', 'primary', 'secondary', 'tertiary', 'destructive', 'success', 'warning', 'outline', 'ghost', 'link'] },
      { name: 'size', type: 'select', options: ['default', 'xs', 'sm', 'lg', 'icon', 'icon-xs', 'icon-sm', 'icon-lg'] },
      { name: 'disabled', type: 'boolean' },
      { name: 'loading', type: 'boolean' },
      { name: 'block', type: 'boolean' },
      { name: 'rounded', type: 'boolean' },
      { name: '_content', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { Button } from '@decantr/ui/components';

const btn = Button({ variant: 'primary' }, 'Save');
document.body.appendChild(btn);`,
    },
    {
      title: 'With loading state',
      code: `import { Button } from '@decantr/ui/components';

const btn = Button({ variant: 'primary', loading: true }, 'Saving...');`,
    },
  ],
};
