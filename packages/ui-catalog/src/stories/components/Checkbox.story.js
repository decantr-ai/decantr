import { Checkbox } from '@decantr/ui/components';

export default {
  component: (props) => Checkbox(props),
  title: 'Checkbox',
  category: 'components/original',
  description: 'Checkbox input with label, indeterminate state, and validation support.',
  variants: [
    { name: 'Default', props: { label: 'Accept terms' } },
    { name: 'Checked', props: { label: 'Checked', checked: true } },
    { name: 'Disabled', props: { label: 'Disabled', disabled: true } },
    { name: 'Disabled Checked', props: { label: 'Disabled checked', checked: true, disabled: true } },
    { name: 'Indeterminate', props: { label: 'Indeterminate', indeterminate: true } },
    { name: 'Error', props: { label: 'Must agree', error: true } },
    { name: 'Success', props: { label: 'Verified', checked: true, success: true } },
    { name: 'Required', props: { label: 'Required field', required: true } },
    { name: 'With Help', props: { label: 'Newsletter', help: 'We will not spam you.', checked: true } },
    { name: 'Size XS', props: { label: 'Extra small', size: 'xs' } },
    { name: 'Size SM', props: { label: 'Small', size: 'sm' } },
    { name: 'Size LG', props: { label: 'Large', size: 'lg' } },
  ],
  playground: {
    defaults: { label: 'Check me' },
    controls: [
      { name: 'label', type: 'text' },
      { name: 'checked', type: 'boolean' },
      { name: 'disabled', type: 'boolean' },
      { name: 'indeterminate', type: 'boolean' },
      { name: 'error', type: 'boolean' },
      { name: 'success', type: 'boolean' },
      { name: 'required', type: 'boolean' },
      { name: 'size', type: 'select', options: ['xs', 'sm', 'default', 'lg'] },
      { name: 'help', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { Checkbox } from '@decantr/ui/components';

const checkbox = Checkbox({
  label: 'I agree to the terms',
  onchange: (checked) => console.log('checked:', checked),
});
document.body.appendChild(checkbox);`,
    },
  ],
};
