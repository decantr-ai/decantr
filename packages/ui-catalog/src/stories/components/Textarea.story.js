import { Textarea } from '@decantr/ui/components';

export default {
  component: (props) => Textarea(props),
  title: 'Textarea',
  category: 'components/original',
  description: 'Multi-line text input with variants, sizes, resize control, and validation states.',
  variants: [
    { name: 'Default', props: { placeholder: 'Enter text...' } },
    { name: 'With Value', props: { value: 'Hello world' } },
    { name: 'Disabled', props: { placeholder: 'Disabled', disabled: true } },
    { name: 'Readonly', props: { value: 'Read only value', readonly: true } },
    { name: 'Error', props: { placeholder: 'Invalid input', error: true } },
    { name: 'Error Message', props: { placeholder: 'Invalid', error: 'This field is required', label: 'Description' } },
    { name: 'Success', props: { value: 'Valid input', success: true } },
    { name: 'With Label', props: { label: 'Bio', placeholder: 'Tell us about yourself' } },
    { name: 'With Help', props: { label: 'Notes', help: 'Max 500 characters', placeholder: 'Add notes...' } },
    { name: 'Required', props: { label: 'Comments', required: true, placeholder: 'Required field' } },
    { name: 'Size XS', props: { size: 'xs', placeholder: 'Extra small' } },
    { name: 'Size SM', props: { size: 'sm', placeholder: 'Small' } },
    { name: 'Size LG', props: { size: 'lg', placeholder: 'Large' } },
    { name: 'Filled Variant', props: { variant: 'filled', placeholder: 'Filled textarea' } },
    { name: 'Ghost Variant', props: { variant: 'ghost', placeholder: 'Ghost textarea' } },
    { name: 'Resize None', props: { placeholder: 'No resize', resize: 'none' } },
    { name: 'Resize Both', props: { placeholder: 'Resize both', resize: 'both' } },
    { name: 'Custom Rows', props: { rows: 6, placeholder: '6 rows tall' } },
  ],
  playground: {
    defaults: { placeholder: 'Type here...' },
    controls: [
      { name: 'placeholder', type: 'text' },
      { name: 'value', type: 'text' },
      { name: 'variant', type: 'select', options: ['outlined', 'filled', 'ghost'] },
      { name: 'size', type: 'select', options: ['xs', 'sm', 'default', 'lg'] },
      { name: 'resize', type: 'select', options: ['vertical', 'horizontal', 'both', 'none'] },
      { name: 'rows', type: 'number' },
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
      code: `import { Textarea } from '@decantr/ui/components';

const textarea = Textarea({ label: 'Description', placeholder: 'Enter description...', rows: 4 });
document.body.appendChild(textarea);`,
    },
  ],
};
