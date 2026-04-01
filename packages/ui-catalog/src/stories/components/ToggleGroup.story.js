import { ToggleGroup } from '@decantr/ui/components';

const defaultItems = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];

export default {
  component: (props) => ToggleGroup({ ...props, items: props.items || defaultItems }),
  title: 'ToggleGroup',
  category: 'components/general',
  description: 'Group of toggles supporting single or multi-select with keyboard navigation and sliding indicator.',
  variants: [
    { name: 'Default (Single)', props: { value: 'center' } },
    { name: 'Multiple', props: { type: 'multiple', value: ['left', 'right'] } },
    { name: 'Size SM', props: { size: 'sm', value: 'left' } },
    { name: 'Size LG', props: { size: 'lg', value: 'center' } },
    { name: 'Block', props: { block: true, value: 'center' } },
    { name: 'Disabled', props: { disabled: true, value: 'center' } },
  ],
  playground: {
    defaults: { value: 'center' },
    controls: [
      { name: 'type', type: 'select', options: ['single', 'multiple'] },
      { name: 'size', type: 'select', options: ['default', 'sm', 'lg'] },
      { name: 'block', type: 'boolean' },
      { name: 'disabled', type: 'boolean' },
    ],
  },
  usage: [
    {
      title: 'Single-select alignment group',
      code: `import { ToggleGroup } from '@decantr/ui/components';

const group = ToggleGroup({
  items: [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' },
  ],
  value: 'left',
  onchange: (val) => console.log(val),
});
document.body.appendChild(group);`,
    },
    {
      title: 'Multi-select group',
      code: `import { ToggleGroup } from '@decantr/ui/components';

const group = ToggleGroup({
  type: 'multiple',
  items: [
    { value: 'bold', label: 'B' },
    { value: 'italic', label: 'I' },
    { value: 'underline', label: 'U' },
  ],
  value: ['bold'],
  onchange: (vals) => console.log(vals),
});
document.body.appendChild(group);`,
    },
  ],
};
