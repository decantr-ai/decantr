import { TimePicker } from '@decantr/ui/components';

export default {
  component: (props) => TimePicker(props),
  title: 'TimePicker',
  category: 'components/form',
  description: 'Time selection with scrollable hour/minute/second columns and optional 12-hour mode.',
  variants: [
    { name: 'Default', props: {} },
    { name: 'With Value', props: { value: '14:30' } },
    { name: 'With Seconds', props: { seconds: true, value: '14:30:00' } },
    { name: '12-Hour Mode', props: { use12h: true, value: '14:30' } },
    { name: 'Custom Step', props: { minuteStep: 15 } },
    { name: 'With Label', props: { label: 'Start Time' } },
    { name: 'With Help', props: { label: 'Meeting Time', help: 'Select the meeting start time' } },
    { name: 'Required', props: { label: 'Time', required: true } },
    { name: 'Error', props: { error: true, label: 'Time' } },
    { name: 'Success', props: { success: true, value: '09:00' } },
    { name: 'Disabled', props: { disabled: true } },
    { name: 'Size SM', props: { size: 'sm' } },
    { name: 'Size LG', props: { size: 'lg' } },
    { name: 'Filled Variant', props: { variant: 'filled' } },
  ],
  playground: {
    defaults: { placeholder: 'Select time' },
    controls: [
      { name: 'placeholder', type: 'text' },
      { name: 'seconds', type: 'boolean' },
      { name: 'use12h', type: 'boolean' },
      { name: 'minuteStep', type: 'number' },
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
      code: `import { TimePicker } from '@decantr/ui/components';

const picker = TimePicker({
  label: 'Start Time',
  onchange: (time) => console.log(time)
});
document.body.appendChild(picker);`,
    },
    {
      title: '12-hour mode with seconds',
      code: `import { TimePicker } from '@decantr/ui/components';

const picker = TimePicker({
  use12h: true,
  seconds: true,
  label: 'Alarm'
});`,
    },
  ],
};
