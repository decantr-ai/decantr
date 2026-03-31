import { Input } from '@decantr/ui/components';

export default {
  component: (props) => Input(props),
  title: 'Input',
  category: 'components/original',
  description: 'Text input field with variants, sizes, prefix/suffix, and validation states.',
  variants: [
    { name: 'Default', props: { placeholder: 'Enter text...' } },
    { name: 'With Value', props: { value: 'Hello world' } },
    { name: 'Disabled', props: { placeholder: 'Disabled', disabled: true } },
    { name: 'Readonly', props: { value: 'Read only value', readonly: true } },
    { name: 'Error', props: { placeholder: 'Invalid input', error: true } },
    { name: 'Error Message', props: { placeholder: 'Invalid', error: 'This field is required', label: 'Email' } },
    { name: 'Success', props: { value: 'Valid input', success: true } },
    { name: 'With Label', props: { label: 'Username', placeholder: 'Enter username' } },
    { name: 'With Help', props: { label: 'Password', help: 'Must be at least 8 characters', placeholder: 'Enter password', type: 'password' } },
    { name: 'Required', props: { label: 'Email', required: true, placeholder: 'you@example.com' } },
    { name: 'Size XS', props: { size: 'xs', placeholder: 'Extra small' } },
    { name: 'Size SM', props: { size: 'sm', placeholder: 'Small' } },
    { name: 'Size LG', props: { size: 'lg', placeholder: 'Large' } },
    { name: 'Filled Variant', props: { variant: 'filled', placeholder: 'Filled input' } },
    { name: 'Ghost Variant', props: { variant: 'ghost', placeholder: 'Ghost input' } },
    { name: 'With Prefix', props: { prefix: '$', placeholder: '0.00' } },
    { name: 'With Suffix', props: { suffix: '.com', placeholder: 'domain' } },
  ],
  playground: {
    defaults: { placeholder: 'Type here...' },
    controls: [
      { name: 'placeholder', type: 'text' },
      { name: 'value', type: 'text' },
      { name: 'type', type: 'select', options: ['text', 'password', 'email', 'number', 'search', 'url'] },
      { name: 'variant', type: 'select', options: ['outlined', 'filled', 'ghost'] },
      { name: 'size', type: 'select', options: ['xs', 'sm', 'default', 'lg'] },
      { name: 'disabled', type: 'boolean' },
      { name: 'readonly', type: 'boolean' },
      { name: 'error', type: 'boolean' },
      { name: 'required', type: 'boolean' },
      { name: 'label', type: 'text' },
      { name: 'help', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { Input } from '@decantr/ui/components';

const input = Input({ label: 'Email', placeholder: 'you@example.com', required: true });
document.body.appendChild(input);`,
    },
  ],
};
