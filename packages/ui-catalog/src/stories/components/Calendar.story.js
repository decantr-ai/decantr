import { Calendar } from '@decantr/ui/components';

export default {
  component: (props) => Calendar(props),
  title: 'Calendar',
  category: 'components/data-display',
  description: 'Full calendar display with day cells, navigation, and optional custom cell rendering. Supports month and year views.',
  variants: [
    { name: 'Default', props: {} },
    { name: 'Mini', props: { mini: true } },
    { name: 'Year Mode', props: { mode: 'year' } },
    { name: 'With Selected Date', props: { value: new Date() } },
  ],
  playground: {
    defaults: {},
    controls: [
      { name: 'mode', type: 'select', options: ['month', 'year'] },
      { name: 'mini', type: 'boolean' },
    ],
  },
  usage: [
    {
      title: 'Basic calendar',
      code: `import { Calendar } from '@decantr/ui/components';

const cal = Calendar({
  onSelect: (date) => console.log('Selected:', date),
});
document.body.appendChild(cal);`,
    },
    {
      title: 'Mini calendar',
      code: `import { Calendar } from '@decantr/ui/components';

const cal = Calendar({ mini: true, value: new Date() });`,
    },
  ],
};
