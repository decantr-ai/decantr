import { TreeSelect } from '@decantr/ui/components';

const SAMPLE_OPTIONS = [
  {
    value: 'engineering',
    label: 'Engineering',
    children: [
      { value: 'frontend', label: 'Frontend' },
      { value: 'backend', label: 'Backend' },
      {
        value: 'infra',
        label: 'Infrastructure',
        children: [
          { value: 'cloud', label: 'Cloud' },
          { value: 'devops', label: 'DevOps' },
        ],
      },
    ],
  },
  {
    value: 'design',
    label: 'Design',
    children: [
      { value: 'ux', label: 'UX Design' },
      { value: 'visual', label: 'Visual Design' },
    ],
  },
  {
    value: 'product',
    label: 'Product',
    children: [
      { value: 'pm', label: 'Product Management' },
      { value: 'analytics', label: 'Analytics', disabled: true },
    ],
  },
];

export default {
  component: (props) => TreeSelect({ options: SAMPLE_OPTIONS, ...props }),
  title: 'TreeSelect',
  category: 'components/form',
  description: 'Dropdown with hierarchical tree selection supporting single/multiple, checkboxes, and search.',
  variants: [
    { name: 'Default', props: {} },
    { name: 'With Value', props: { value: 'frontend' } },
    { name: 'Multiple', props: { multiple: true, value: ['frontend', 'ux'] } },
    { name: 'Checkable', props: { checkable: true } },
    { name: 'With Label', props: { label: 'Department' } },
    { name: 'With Help', props: { label: 'Team', help: 'Select your team' } },
    { name: 'Required', props: { label: 'Team', required: true } },
    { name: 'Error', props: { error: true, label: 'Department' } },
    { name: 'Success', props: { success: true, value: 'frontend' } },
    { name: 'Disabled', props: { disabled: true } },
    { name: 'Size SM', props: { size: 'sm' } },
    { name: 'Size LG', props: { size: 'lg' } },
    { name: 'Filled Variant', props: { variant: 'filled' } },
  ],
  playground: {
    defaults: { placeholder: 'Select' },
    controls: [
      { name: 'placeholder', type: 'text' },
      { name: 'multiple', type: 'boolean' },
      { name: 'checkable', type: 'boolean' },
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
      code: `import { TreeSelect } from '@decantr/ui/components';

const select = TreeSelect({
  options: [
    { value: 'eng', label: 'Engineering', children: [
      { value: 'fe', label: 'Frontend' },
      { value: 'be', label: 'Backend' },
    ]}
  ],
  label: 'Team',
  onchange: (val) => console.log(val)
});
document.body.appendChild(select);`,
    },
    {
      title: 'Multiple with checkboxes',
      code: `import { TreeSelect } from '@decantr/ui/components';

const select = TreeSelect({
  options: treeData,
  multiple: true,
  checkable: true,
  label: 'Select Teams'
});`,
    },
  ],
};
