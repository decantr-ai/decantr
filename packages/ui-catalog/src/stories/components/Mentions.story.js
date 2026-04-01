import { Mentions } from '@decantr/ui/components';

const SAMPLE_OPTIONS = [
  { value: 'alice', label: 'Alice Johnson' },
  { value: 'bob', label: 'Bob Smith' },
  { value: 'carol', label: 'Carol Williams' },
  { value: 'dave', label: 'Dave Brown' },
  { value: 'eve', label: 'Eve Davis' },
];

export default {
  component: (props) => Mentions({ options: SAMPLE_OPTIONS, ...props }),
  title: 'Mentions',
  category: 'components/form',
  description: 'Textarea with @mention autocomplete dropdown for tagging users or entities.',
  variants: [
    { name: 'Default', props: {} },
    { name: 'Custom Placeholder', props: { placeholder: 'Type @ to mention someone...' } },
    { name: 'Custom Prefix', props: { prefix: '#' } },
    { name: 'With Label', props: { label: 'Comment' } },
    { name: 'With Help', props: { label: 'Message', help: 'Type @ to mention a team member' } },
    { name: 'Required', props: { label: 'Comment', required: true } },
    { name: 'More Rows', props: { rows: 6 } },
    { name: 'Error', props: { error: true, label: 'Comment' } },
    { name: 'Success', props: { success: true } },
    { name: 'Disabled', props: { disabled: true } },
    { name: 'Size SM', props: { size: 'sm' } },
    { name: 'Size LG', props: { size: 'lg' } },
    { name: 'Filled Variant', props: { variant: 'filled' } },
  ],
  playground: {
    defaults: { placeholder: 'Type @ to mention...' },
    controls: [
      { name: 'placeholder', type: 'text' },
      { name: 'prefix', type: 'text' },
      { name: 'rows', type: 'number' },
      { name: 'disabled', type: 'boolean' },
      { name: 'error', type: 'boolean' },
      { name: 'variant', type: 'select', options: ['outlined', 'filled', 'ghost'] },
      { name: 'size', type: 'select', options: ['default', 'xs', 'sm', 'lg'] },
      { name: 'label', type: 'text' },
      { name: 'help', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { Mentions } from '@decantr/ui/components';

const mentions = Mentions({
  options: [
    { value: 'alice', label: 'Alice' },
    { value: 'bob', label: 'Bob' },
  ],
  placeholder: 'Type @ to mention...',
  onSelect: (user) => console.log('Mentioned:', user)
});
document.body.appendChild(mentions);`,
    },
  ],
};
