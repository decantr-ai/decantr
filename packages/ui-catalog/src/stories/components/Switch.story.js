import { Switch } from '@decantr/ui/components';

export default {
  component: (props) => Switch(props),
  title: 'Switch',
  category: 'components/original',
  description: 'Toggle switch with accessible role="switch" and reactive checked state.',
  variants: [
    { name: 'Default', props: { label: 'Enable notifications' } },
    { name: 'Checked', props: { label: 'Enabled', checked: true } },
    { name: 'Disabled', props: { label: 'Disabled', disabled: true } },
    { name: 'Disabled Checked', props: { label: 'Disabled on', checked: true, disabled: true } },
    { name: 'Error', props: { label: 'Required toggle', error: true } },
    { name: 'Size XS', props: { label: 'Extra small', size: 'xs' } },
    { name: 'Size SM', props: { label: 'Small', size: 'sm' } },
    { name: 'Size LG', props: { label: 'Large', size: 'lg' } },
    { name: 'Without Label', props: { 'aria-label': 'Dark mode toggle' } },
  ],
  playground: {
    defaults: { label: 'Toggle me' },
    controls: [
      { name: 'label', type: 'text' },
      { name: 'checked', type: 'boolean' },
      { name: 'disabled', type: 'boolean' },
      { name: 'error', type: 'boolean' },
      { name: 'size', type: 'select', options: ['xs', 'sm', 'default', 'lg'] },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { Switch } from '@decantr/ui/components';

const toggle = Switch({
  label: 'Dark mode',
  checked: false,
  onchange: (checked) => console.log('toggled:', checked),
});
document.body.appendChild(toggle);`,
    },
  ],
};
