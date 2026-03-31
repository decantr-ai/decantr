import { ColorPicker } from '@decantr/ui/components';

export default {
  component: (props) => ColorPicker(props),
  title: 'ColorPicker',
  category: 'components/form',
  description: 'Color selection with OKLCH lightness/chroma panel, hue slider, hex input, and optional presets.',
  variants: [
    { name: 'Default', props: {} },
    { name: 'Custom Value', props: { value: '#E74C3C' } },
    { name: 'With Alpha', props: { alpha: true } },
    { name: 'With Presets', props: { presets: ['#E74C3C', '#3498DB', '#2ECC71', '#F1C40F', '#9B59B6', '#1ABC9C'] } },
    { name: 'With Label', props: { label: 'Brand Color', value: '#1366D9' } },
    { name: 'With Help', props: { label: 'Color', help: 'Choose a brand color' } },
    { name: 'Error', props: { error: true, label: 'Color' } },
    { name: 'Success', props: { success: true, value: '#2ECC71' } },
    { name: 'Disabled', props: { disabled: true } },
    { name: 'Size SM', props: { size: 'sm' } },
    { name: 'Size LG', props: { size: 'lg' } },
    { name: 'Filled Variant', props: { variant: 'filled' } },
  ],
  playground: {
    defaults: { value: '#1366D9' },
    controls: [
      { name: 'value', type: 'color' },
      { name: 'alpha', type: 'boolean' },
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
      code: `import { ColorPicker } from '@decantr/ui/components';

const picker = ColorPicker({
  value: '#1366D9',
  onchange: (hex) => console.log(hex)
});
document.body.appendChild(picker);`,
    },
    {
      title: 'With alpha and presets',
      code: `import { ColorPicker } from '@decantr/ui/components';

const picker = ColorPicker({
  alpha: true,
  presets: ['#E74C3C', '#3498DB', '#2ECC71', '#F1C40F'],
  label: 'Theme Color'
});`,
    },
  ],
};
