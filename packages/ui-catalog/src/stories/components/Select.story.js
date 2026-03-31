import { Select } from '@decantr/ui/components';

const fruitOptions = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
];

export default {
  component: (props) => Select(props),
  title: 'Select',
  category: 'components/original',
  description: 'Custom dropdown select with listbox keyboard navigation and form field support.',
  variants: [
    { name: 'Default', props: { options: fruitOptions, placeholder: 'Choose a fruit' } },
    { name: 'With Value', props: { options: fruitOptions, value: 'banana' } },
    { name: 'Disabled', props: { options: fruitOptions, value: 'apple', disabled: true } },
    { name: 'Error', props: { options: fruitOptions, placeholder: 'Select...', error: true } },
    { name: 'Error Message', props: { options: fruitOptions, placeholder: 'Select...', error: 'Selection is required', label: 'Fruit' } },
    { name: 'Success', props: { options: fruitOptions, value: 'cherry', success: true } },
    { name: 'With Label', props: { options: fruitOptions, label: 'Favorite Fruit', placeholder: 'Pick one' } },
    { name: 'With Help', props: { options: fruitOptions, label: 'Fruit', help: 'Choose your favorite fruit', placeholder: 'Select...' } },
    { name: 'Required', props: { options: fruitOptions, label: 'Fruit', required: true, placeholder: 'Required' } },
    { name: 'Size SM', props: { options: fruitOptions, size: 'sm', placeholder: 'Small' } },
    { name: 'Size LG', props: { options: fruitOptions, size: 'lg', placeholder: 'Large' } },
    { name: 'Filled Variant', props: { options: fruitOptions, variant: 'filled', placeholder: 'Filled select' } },
    {
      name: 'With Disabled Option',
      props: {
        options: [
          { value: 'a', label: 'Option A' },
          { value: 'b', label: 'Option B (disabled)', disabled: true },
          { value: 'c', label: 'Option C' },
        ],
        placeholder: 'Choose...',
      },
    },
  ],
  playground: {
    defaults: { options: fruitOptions, placeholder: 'Select a fruit' },
    controls: [
      { name: 'placeholder', type: 'text' },
      { name: 'disabled', type: 'boolean' },
      { name: 'error', type: 'boolean' },
      { name: 'success', type: 'boolean' },
      { name: 'required', type: 'boolean' },
      { name: 'variant', type: 'select', options: ['outlined', 'filled', 'ghost'] },
      { name: 'size', type: 'select', options: ['xs', 'sm', 'default', 'lg'] },
      { name: 'label', type: 'text' },
      { name: 'help', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { Select } from '@decantr/ui/components';

const select = Select({
  label: 'Country',
  options: [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'ca', label: 'Canada' },
  ],
  placeholder: 'Choose a country',
  onchange: (val) => console.log('selected:', val),
});
document.body.appendChild(select);`,
    },
  ],
};
