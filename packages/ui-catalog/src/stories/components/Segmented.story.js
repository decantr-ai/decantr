import { Segmented } from '@decantr/ui/components';

const basicOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const withDisabledOptions = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'Extra Large', disabled: true },
];

export default {
  component: (props) => Segmented({
    options: props._options || basicOptions,
    value: props.value || basicOptions[0].value,
    block: props.block,
    disabled: props.disabled,
    size: props.size,
    class: props.class,
  }),
  title: 'Segmented',
  category: 'components/navigation',
  description: 'Segmented control (pill toggle group) for switching between options with keyboard navigation.',
  variants: [
    { name: 'Default', props: {} },
    { name: 'Preselected', props: { value: 'monthly' } },
    { name: 'Block', props: { block: true } },
    { name: 'Small', props: { size: 'sm' } },
    { name: 'Large', props: { size: 'lg' } },
    { name: 'Disabled', props: { disabled: true } },
    { name: 'With Disabled Option', props: { _options: withDisabledOptions } },
  ],
  playground: {
    defaults: { value: 'daily', block: false, disabled: false, size: '' },
    controls: [
      { name: 'value', type: 'select', options: ['daily', 'weekly', 'monthly'] },
      { name: 'block', type: 'boolean' },
      { name: 'disabled', type: 'boolean' },
      { name: 'size', type: 'select', options: ['', 'sm', 'lg'] },
    ],
  },
  usage: [
    {
      title: 'Basic segmented control',
      code: `import { Segmented } from '@decantr/ui/components';

const control = Segmented({
  options: [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ],
  value: 'daily',
  onchange: (val) => console.log('Selected:', val),
});
document.body.appendChild(control);`,
    },
    {
      title: 'Block layout with size',
      code: `import { Segmented } from '@decantr/ui/components';

const control = Segmented({
  options: [
    { value: 'list', label: 'List' },
    { value: 'grid', label: 'Grid' },
  ],
  value: 'list',
  block: true,
  size: 'lg',
});`,
    },
  ],
};
