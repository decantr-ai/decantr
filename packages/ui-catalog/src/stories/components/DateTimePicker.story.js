import { DateTimePicker } from '@decantr/ui/components';

export default {
  component: (props) => DateTimePicker(props),
  title: 'DateTimePicker',
  category: 'components/form',
  description: 'Combined date and time selection returning an ISO datetime, with calendar and time spinners.',
  variants: [
    { name: 'Default', props: {} },
    { name: 'With Value', props: { value: new Date(2026, 2, 15, 14, 30) } },
    { name: 'Custom Placeholder', props: { placeholder: 'Pick a date...' } },
    { name: 'With Seconds', props: { seconds: true } },
    { name: '12-Hour Format', props: { use12h: true } },
    { name: '12-Hour + Seconds', props: { use12h: true, seconds: true } },
    { name: 'Disabled', props: { disabled: true } },
    { name: 'Pre-selected', props: { value: new Date(2026, 0, 1, 9, 0), use12h: true } },
  ],
  playground: {
    defaults: {},
    controls: [
      { name: 'placeholder', type: 'text' },
      { name: 'seconds', type: 'boolean' },
      { name: 'use12h', type: 'boolean' },
      { name: 'disabled', type: 'boolean' },
    ],
  },
  usage: [
    {
      title: 'Basic date-time picker',
      code: `import { DateTimePicker } from '@decantr/ui/components';

const picker = DateTimePicker({
  onchange: (date) => console.log('Selected:', date.toISOString()),
});
document.body.appendChild(picker);`,
    },
    {
      title: '12-hour format with seconds',
      code: `import { DateTimePicker } from '@decantr/ui/components';

const picker = DateTimePicker({
  use12h: true,
  seconds: true,
  value: new Date(),
  onchange: (date) => console.log(date),
});`,
    },
  ],
};
