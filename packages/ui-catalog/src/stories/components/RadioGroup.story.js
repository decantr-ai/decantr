import { RadioGroup } from '@decantr/ui/components';

const sampleOptions = [
  { value: 'opt1', label: 'Option One' },
  { value: 'opt2', label: 'Option Two' },
  { value: 'opt3', label: 'Option Three' },
];

const withDisabled = [
  { value: 'a', label: 'Available' },
  { value: 'b', label: 'Unavailable', disabled: true },
  { value: 'c', label: 'Available too' },
];

export default {
  component: (props) => RadioGroup({ ...props, options: props._options || sampleOptions }),
  title: 'RadioGroup',
  category: 'components/original',
  description: 'Radio button group with keyboard navigation, orientation, and validation states.',
  variants: [
    { name: 'Default', props: { _options: sampleOptions } },
    { name: 'With Value', props: { _options: sampleOptions, value: 'opt2' } },
    { name: 'Horizontal', props: { _options: sampleOptions, orientation: 'horizontal' } },
    { name: 'Disabled', props: { _options: sampleOptions, disabled: true } },
    { name: 'Disabled Option', props: { _options: withDisabled } },
    { name: 'Error', props: { _options: sampleOptions, error: true } },
    { name: 'Error Message', props: { _options: sampleOptions, error: 'Please select an option' } },
    { name: 'Size XS', props: { _options: sampleOptions, size: 'xs' } },
    { name: 'Size SM', props: { _options: sampleOptions, size: 'sm' } },
    { name: 'Size LG', props: { _options: sampleOptions, size: 'lg' } },
  ],
  playground: {
    defaults: { _options: sampleOptions, orientation: 'vertical' },
    controls: [
      { name: 'orientation', type: 'select', options: ['vertical', 'horizontal'] },
      { name: 'size', type: 'select', options: ['default', 'xs', 'sm', 'lg'] },
      { name: 'disabled', type: 'boolean' },
      { name: 'error', type: 'boolean' },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { RadioGroup } from '@decantr/ui/components';

const group = RadioGroup({
  options: [
    { value: 'sm', label: 'Small' },
    { value: 'md', label: 'Medium' },
    { value: 'lg', label: 'Large' },
  ],
  value: 'md',
  onchange: (val) => console.log('selected:', val),
});
document.body.appendChild(group);`,
    },
  ],
};
