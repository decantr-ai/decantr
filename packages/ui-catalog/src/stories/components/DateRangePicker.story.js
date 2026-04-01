import { DateRangePicker } from '@decantr/ui/components';

export default {
  component: (props) => DateRangePicker(props),
  title: 'DateRangePicker',
  category: 'components/form',
  description: 'Two calendar panels for selecting a date range with preset shortcuts and hover preview.',
  variants: [
    { name: 'Default', props: {} },
    { name: 'With Value', props: { value: [new Date(2026, 2, 1), new Date(2026, 2, 15)] } },
    { name: 'Custom Placeholder', props: { placeholder: 'Pick date range' } },
    { name: 'With Label', props: { label: 'Date Range' } },
    { name: 'With Help', props: { label: 'Period', help: 'Select start and end dates' } },
    { name: 'Required', props: { label: 'Date Range', required: true } },
    { name: 'Error', props: { error: true, label: 'Date Range' } },
    { name: 'Success', props: { success: true, value: [new Date(2026, 2, 1), new Date(2026, 2, 31)] } },
    { name: 'Disabled', props: { disabled: true } },
    { name: 'Size SM', props: { size: 'sm' } },
    { name: 'Size LG', props: { size: 'lg' } },
    { name: 'Filled Variant', props: { variant: 'filled' } },
  ],
  playground: {
    defaults: { placeholder: 'Select range' },
    controls: [
      { name: 'placeholder', type: 'text' },
      { name: 'disabled', type: 'boolean' },
      { name: 'error', type: 'boolean' },
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
      code: `import { DateRangePicker } from '@decantr/ui/components';

const picker = DateRangePicker({
  label: 'Report Period',
  onchange: ([start, end]) => console.log(start, end)
});
document.body.appendChild(picker);`,
    },
  ],
};
