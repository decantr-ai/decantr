import { TimeRangePicker } from '@decantr/ui/components';

export default {
  component: (props) => TimeRangePicker(props),
  title: 'TimeRangePicker',
  category: 'components/form',
  description: 'Two time selectors for selecting a start/end time range with validation.',
  variants: [
    { name: 'Default', props: {} },
    { name: 'With Value', props: { value: ['09:00', '17:00'] } },
    { name: 'Custom Placeholder', props: { placeholder: 'Select hours' } },
    { name: 'With Label', props: { label: 'Working Hours' } },
    { name: 'With Help', props: { label: 'Shift', help: 'Select start and end time' } },
    { name: 'Required', props: { label: 'Hours', required: true } },
    { name: 'Error', props: { error: true, label: 'Time Range' } },
    { name: 'Success', props: { success: true, value: ['08:00', '16:00'] } },
    { name: 'Disabled', props: { disabled: true } },
    { name: 'Size SM', props: { size: 'sm' } },
    { name: 'Size LG', props: { size: 'lg' } },
    { name: 'Filled Variant', props: { variant: 'filled' } },
  ],
  playground: {
    defaults: { placeholder: 'Select time range' },
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
      code: `import { TimeRangePicker } from '@decantr/ui/components';

const picker = TimeRangePicker({
  label: 'Business Hours',
  value: ['09:00', '17:00'],
  onchange: ([start, end]) => console.log(start, end)
});
document.body.appendChild(picker);`,
    },
  ],
};
