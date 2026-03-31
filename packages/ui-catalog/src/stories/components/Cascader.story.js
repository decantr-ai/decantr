import { Cascader } from '@decantr/ui/components';

const SAMPLE_OPTIONS = [
  {
    value: 'us',
    label: 'United States',
    children: [
      {
        value: 'ca',
        label: 'California',
        children: [
          { value: 'sf', label: 'San Francisco' },
          { value: 'la', label: 'Los Angeles' },
        ],
      },
      {
        value: 'ny',
        label: 'New York',
        children: [
          { value: 'nyc', label: 'New York City' },
          { value: 'buf', label: 'Buffalo' },
        ],
      },
    ],
  },
  {
    value: 'uk',
    label: 'United Kingdom',
    children: [
      { value: 'lon', label: 'London' },
      { value: 'man', label: 'Manchester' },
    ],
  },
  {
    value: 'jp',
    label: 'Japan',
    children: [
      { value: 'tok', label: 'Tokyo' },
      { value: 'osa', label: 'Osaka' },
    ],
  },
];

export default {
  component: (props) => Cascader({ options: SAMPLE_OPTIONS, ...props }),
  title: 'Cascader',
  category: 'components/form',
  description: 'Multi-level selection dropdown with cascading columns, search, and clearable selection.',
  variants: [
    { name: 'Default', props: {} },
    { name: 'With Value', props: { value: ['us', 'ca', 'sf'] } },
    { name: 'Searchable', props: { searchable: true } },
    { name: 'Hover Expand', props: { expandTrigger: 'hover' } },
    { name: 'Custom Separator', props: { separator: ' > ' } },
    { name: 'Not Clearable', props: { clearable: false, value: ['uk', 'lon'] } },
    { name: 'With Label', props: { label: 'Location' } },
    { name: 'With Help', props: { label: 'Region', help: 'Select country, state, and city' } },
    { name: 'Required', props: { label: 'Location', required: true } },
    { name: 'Error', props: { error: true, label: 'Location' } },
    { name: 'Disabled', props: { disabled: true } },
    { name: 'Size SM', props: { size: 'sm' } },
    { name: 'Size LG', props: { size: 'lg' } },
  ],
  playground: {
    defaults: { placeholder: 'Select' },
    controls: [
      { name: 'placeholder', type: 'text' },
      { name: 'searchable', type: 'boolean' },
      { name: 'clearable', type: 'boolean' },
      { name: 'disabled', type: 'boolean' },
      { name: 'expandTrigger', type: 'select', options: ['click', 'hover'] },
      { name: 'separator', type: 'text' },
      { name: 'variant', type: 'select', options: ['outlined', 'filled', 'ghost'] },
      { name: 'size', type: 'select', options: ['default', 'xs', 'sm', 'lg'] },
      { name: 'label', type: 'text' },
      { name: 'help', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { Cascader } from '@decantr/ui/components';

const cascader = Cascader({
  options: [
    { value: 'us', label: 'USA', children: [
      { value: 'ca', label: 'California' }
    ]}
  ],
  onChange: (path, opts) => console.log(path)
});
document.body.appendChild(cascader);`,
    },
  ],
};
