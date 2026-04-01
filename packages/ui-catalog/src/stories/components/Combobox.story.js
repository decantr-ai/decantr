import { Combobox } from '@decantr/ui/components';

const fruitOptions = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'grape', label: 'Grape' },
  { value: 'mango', label: 'Mango' },
  { value: 'orange', label: 'Orange' },
  { value: 'peach', label: 'Peach' },
];

const withDisabled = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'archived', label: 'Archived', disabled: true },
];

export default {
  component: (props) => Combobox({ ...props, options: props._options || fruitOptions }),
  title: 'Combobox',
  category: 'components/original',
  description: 'Searchable select with autocomplete filtering, keyboard navigation, and form field integration.',
  variants: [
    { name: 'Default', props: { _options: fruitOptions } },
    { name: 'With Value', props: { _options: fruitOptions, value: 'cherry' } },
    { name: 'With Label', props: { _options: fruitOptions, label: 'Fruit', placeholder: 'Pick a fruit...' } },
    { name: 'With Help', props: { _options: fruitOptions, label: 'Fruit', help: 'Choose your favorite' } },
    { name: 'Required', props: { _options: fruitOptions, label: 'Fruit', required: true } },
    { name: 'Disabled', props: { _options: fruitOptions, disabled: true } },
    { name: 'Error', props: { _options: fruitOptions, error: true, label: 'Fruit' } },
    { name: 'Error Message', props: { _options: fruitOptions, error: 'Selection required', label: 'Fruit' } },
    { name: 'Disabled Option', props: { _options: withDisabled, label: 'Status' } },
    { name: 'Size SM', props: { _options: fruitOptions, size: 'sm' } },
    { name: 'Size LG', props: { _options: fruitOptions, size: 'lg' } },
    { name: 'Filled Variant', props: { _options: fruitOptions, variant: 'filled' } },
    { name: 'Ghost Variant', props: { _options: fruitOptions, variant: 'ghost' } },
  ],
  playground: {
    defaults: { _options: fruitOptions, placeholder: 'Search...' },
    controls: [
      { name: 'placeholder', type: 'text' },
      { name: 'variant', type: 'select', options: ['outlined', 'filled', 'ghost'] },
      { name: 'size', type: 'select', options: ['default', 'xs', 'sm', 'lg'] },
      { name: 'disabled', type: 'boolean' },
      { name: 'error', type: 'boolean' },
      { name: 'required', type: 'boolean' },
      { name: 'label', type: 'text' },
      { name: 'help', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { Combobox } from '@decantr/ui/components';

const combo = Combobox({
  options: [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
  ],
  label: 'Fruit',
  placeholder: 'Search fruits...',
  onchange: (val) => console.log('selected:', val),
});
document.body.appendChild(combo);`,
    },
  ],
};
