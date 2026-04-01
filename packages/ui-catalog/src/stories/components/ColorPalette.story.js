import { ColorPalette } from '@decantr/ui/components';

export default {
  component: (props) => ColorPalette(props),
  title: 'ColorPalette',
  category: 'components/form',
  description: 'Harmonious color palette generator with OKLCH color theory, shade strips, contrast badges, and drag reorder.',
  variants: [
    { name: 'Default (Complementary)', props: {} },
    { name: 'Monochromatic', props: { harmony: 'monochromatic' } },
    { name: 'Analogous', props: { harmony: 'analogous' } },
    { name: 'Triadic', props: { harmony: 'triadic' } },
    { name: 'Split Complementary', props: { harmony: 'split-complementary' } },
    { name: '3 Colors', props: { count: 3 } },
    { name: '8 Colors', props: { count: 8 } },
    { name: 'No Shades', props: { shades: false } },
    { name: 'Custom Colors', props: { colors: ['#E74C3C', '#3498DB', '#2ECC71', '#F1C40F', '#9B59B6'] } },
    { name: 'Size SM', props: { size: 'sm' } },
    { name: 'Size LG', props: { size: 'lg' } },
  ],
  playground: {
    defaults: { harmony: 'complementary', count: 5 },
    controls: [
      { name: 'harmony', type: 'select', options: ['monochromatic', 'analogous', 'complementary', 'split-complementary', 'triadic', 'tetradic', 'square', 'custom'] },
      { name: 'count', type: 'number' },
      { name: 'shades', type: 'boolean' },
      { name: 'size', type: 'select', options: ['default', 'sm', 'lg'] },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { ColorPalette } from '@decantr/ui/components';

const palette = ColorPalette({
  harmony: 'complementary',
  count: 5,
  onchange: (colors) => console.log(colors)
});
document.body.appendChild(palette);`,
    },
    {
      title: 'With initial colors',
      code: `import { ColorPalette } from '@decantr/ui/components';

const palette = ColorPalette({
  colors: ['#1366D9', '#E74C3C', '#2ECC71'],
  harmony: 'custom'
});`,
    },
  ],
};
