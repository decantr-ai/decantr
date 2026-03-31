import { Slider } from '@decantr/ui/components';

export default {
  component: (props) => Slider(props),
  title: 'Slider',
  category: 'components/original',
  description: 'Range slider with drag, click-to-jump, keyboard control, and optional value display.',
  variants: [
    { name: 'Default', props: {} },
    { name: 'With Value', props: { value: 50 } },
    { name: 'Show Value', props: { value: 75, showValue: true } },
    { name: 'Custom Range', props: { min: 0, max: 10, step: 1, value: 5, showValue: true } },
    { name: 'Decimal Step', props: { min: 0, max: 1, step: 0.1, value: 0.5, showValue: true } },
    { name: 'Disabled', props: { value: 40, disabled: true } },
    { name: 'Full Range', props: { value: 100, showValue: true } },
    { name: 'Zero Value', props: { value: 0, showValue: true } },
  ],
  playground: {
    defaults: { value: 50, min: 0, max: 100, step: 1 },
    controls: [
      { name: 'value', type: 'number' },
      { name: 'min', type: 'number' },
      { name: 'max', type: 'number' },
      { name: 'step', type: 'number' },
      { name: 'disabled', type: 'boolean' },
      { name: 'showValue', type: 'boolean' },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { Slider } from '@decantr/ui/components';

const slider = Slider({
  value: 50,
  min: 0,
  max: 100,
  showValue: true,
  onchange: (val) => console.log('value:', val),
});
document.body.appendChild(slider);`,
    },
  ],
};
