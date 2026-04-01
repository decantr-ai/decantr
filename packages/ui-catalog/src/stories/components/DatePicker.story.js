import { DatePicker } from '@decantr/ui/components';

export default {
  component: (props) => DatePicker(props),
  title: 'DatePicker',
  category: 'components/form',
  description: 'Calendar-based date selection with day/month/year views, min/max constraints, and overlay panel.',
  variants: [
    { name: 'Default', props: {} },
    { name: 'With Value', props: { value: '2026-03-15' } },
    { name: 'Custom Placeholder', props: { placeholder: 'Pick a date' } },
    { name: 'With Label', props: { label: 'Start Date' } },
    { name: 'With Help', props: { label: 'Birthday', help: 'Select your date of birth' } },
    { name: 'Required', props: { label: 'Date', required: true } },
    { name: 'Error', props: { error: true, label: 'Date' } },
    { name: 'Success', props: { success: true, value: '2026-03-15' } },
    { name: 'Disabled', props: { disabled: true } },
    { name: 'Size SM', props: { size: 'sm' } },
    { name: 'Size LG', props: { size: 'lg' } },
    { name: 'Filled Variant', props: { variant: 'filled' } },
  ],
  playground: {
    defaults: { placeholder: 'Select date' },
    controls: [
      { name: 'placeholder', type: 'text' },
      { name: 'disabled', type: 'boolean' },
      { name: 'error', type: 'boolean' },
      { name: 'success', type: 'boolean' },
      { name: 'required', type: 'boolean' },
      { name: 'variant', type: 'select', options: ['outlined', 'filled', 'ghost'] },
      { name: 'size', type: 'select', options: ['default', 'xs', 'sm', 'lg'] },
      { name: 'label', type: 'text' },
      { name: 'help', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { DatePicker } from '@decantr/ui/components';

const picker = DatePicker({
  label: 'Start Date',
  onchange: (date) => console.log(date)
});
document.body.appendChild(picker);`,
    },
    {
      title: 'With min/max constraints',
      code: `import { DatePicker } from '@decantr/ui/components';

const picker = DatePicker({
  min: new Date(2026, 0, 1),
  max: new Date(2026, 11, 31),
  label: 'Date in 2026'
});`,
    },
  ],
};
