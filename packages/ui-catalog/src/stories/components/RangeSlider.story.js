import { RangeSlider } from '@decantr/ui/components';

export default {
  component: (props) => RangeSlider(props),
  title: 'RangeSlider',
  category: 'components/form',
  description: 'Dual-thumb slider for selecting a numeric range with keyboard and pointer support.',
  variants: [
    { name: 'Default', props: {} },
    { name: 'With Value', props: { value: [20, 80] } },
    { name: 'Small Range', props: { value: [40, 60] } },
    { name: 'Custom Min/Max', props: { min: 0, max: 1000, value: [200, 800] } },
    { name: 'Step 10', props: { step: 10, value: [30, 70] } },
    { name: 'Step 25', props: { step: 25, value: [25, 75] } },
    { name: 'Disabled', props: { disabled: true, value: [30, 70] } },
  ],
  playground: {
    defaults: { min: 0, max: 100, step: 1, value: [25, 75] },
    controls: [
      { name: 'min', type: 'number' },
      { name: 'max', type: 'number' },
      { name: 'step', type: 'number' },
      { name: 'disabled', type: 'boolean' },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { RangeSlider } from '@decantr/ui/components';

const slider = RangeSlider({
  value: [20, 80],
  onchange: ([low, high]) => console.log(low, high)
});
document.body.appendChild(slider);`,
    },
    {
      title: 'Price range filter',
      code: `import { RangeSlider } from '@decantr/ui/components';

const priceRange = RangeSlider({
  min: 0,
  max: 500,
  step: 10,
  value: [50, 200],
  onchange: ([min, max]) => filterProducts(min, max)
});`,
    },
  ],
};
