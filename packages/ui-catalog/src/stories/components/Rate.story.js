import { Rate } from '@decantr/ui/components';

export default {
  component: (props) => Rate(props),
  title: 'Rate',
  category: 'components/form',
  description: 'Star rating component with half-star, custom character, and keyboard navigation support.',
  variants: [
    { name: 'Default', props: {} },
    { name: '3 Stars Selected', props: { value: 3 } },
    { name: 'Half Star', props: { half: true, value: 3.5 } },
    { name: 'Custom Count', props: { count: 10, value: 7 } },
    { name: 'Custom Character', props: { character: '\u2665', value: 3 } },
    { name: 'With Label', props: { label: 'Rating', value: 4 } },
    { name: 'With Help', props: { label: 'Your Rating', help: 'Rate from 1 to 5 stars' } },
    { name: 'Required', props: { label: 'Rating', required: true } },
    { name: 'Error', props: { error: true, label: 'Rating' } },
    { name: 'Success', props: { success: true, value: 5 } },
    { name: 'Readonly', props: { readonly: true, value: 4 } },
    { name: 'Disabled', props: { disabled: true, value: 3 } },
    { name: 'Size SM', props: { size: 'sm', value: 3 } },
    { name: 'Size LG', props: { size: 'lg', value: 3 } },
  ],
  playground: {
    defaults: { value: 3, count: 5 },
    controls: [
      { name: 'value', type: 'number' },
      { name: 'count', type: 'number' },
      { name: 'half', type: 'boolean' },
      { name: 'readonly', type: 'boolean' },
      { name: 'disabled', type: 'boolean' },
      { name: 'character', type: 'text' },
      { name: 'size', type: 'select', options: ['default', 'sm', 'lg'] },
      { name: 'label', type: 'text' },
      { name: 'help', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { Rate } from '@decantr/ui/components';

const rating = Rate({ value: 3, onchange: (v) => console.log(v) });
document.body.appendChild(rating);`,
    },
    {
      title: 'Half-star with label',
      code: `import { Rate } from '@decantr/ui/components';

const rating = Rate({
  half: true,
  value: 3.5,
  label: 'Product Rating'
});`,
    },
  ],
};
