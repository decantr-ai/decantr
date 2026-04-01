import { InputNumber } from '@decantr/ui/components';

export default {
  component: (props) => InputNumber(props),
  title: 'InputNumber',
  category: 'components/form',
  description: 'Numeric input with increment/decrement buttons, min/max clamping, and step precision.',
  variants: [
    { name: 'Default', props: {} },
    { name: 'With Value', props: { value: 42 } },
    { name: 'Min/Max', props: { value: 5, min: 0, max: 10 } },
    { name: 'Step 0.1', props: { value: 1.5, step: 0.1, precision: 1 } },
    { name: 'No Controls', props: { controls: false, value: 10 } },
    { name: 'With Label', props: { label: 'Quantity', value: 1, min: 0 } },
    { name: 'With Help', props: { label: 'Amount', help: 'Enter a value between 0 and 100', min: 0, max: 100 } },
    { name: 'Size SM', props: { size: 'sm', value: 5 } },
    { name: 'Size LG', props: { size: 'lg', value: 5 } },
    { name: 'Error', props: { error: 'Invalid value', value: -1, label: 'Count' } },
    { name: 'Success', props: { success: true, value: 42 } },
    { name: 'Disabled', props: { disabled: true, value: 10 } },
    { name: 'Filled Variant', props: { variant: 'filled', value: 7 } },
    { name: 'Ghost Variant', props: { variant: 'ghost', value: 7 } },
  ],
  playground: {
    defaults: { value: 0, min: 0, max: 100, step: 1 },
    controls: [
      { name: 'value', type: 'number' },
      { name: 'min', type: 'number' },
      { name: 'max', type: 'number' },
      { name: 'step', type: 'number' },
      { name: 'precision', type: 'number' },
      { name: 'controls', type: 'boolean' },
      { name: 'disabled', type: 'boolean' },
      { name: 'variant', type: 'select', options: ['outlined', 'filled', 'ghost'] },
      { name: 'size', type: 'select', options: ['default', 'xs', 'sm', 'lg'] },
      { name: 'label', type: 'text' },
      { name: 'help', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { InputNumber } from '@decantr/ui/components';

const num = InputNumber({ value: 0, min: 0, max: 100, step: 1 });
document.body.appendChild(num);`,
    },
    {
      title: 'With label and precision',
      code: `import { InputNumber } from '@decantr/ui/components';

const price = InputNumber({
  label: 'Price',
  value: 9.99,
  step: 0.01,
  precision: 2,
  min: 0
});`,
    },
  ],
};
