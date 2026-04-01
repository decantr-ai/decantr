import { Empty } from '@decantr/ui/components';

export default {
  component: (props, ...children) => Empty(props),
  title: 'Empty',
  category: 'components/data-display',
  description: 'Placeholder for empty states such as no data, no results, or blank sections.',
  variants: [
    { name: 'Default', props: {} },
    { name: 'Custom Description', props: { description: 'No results match your search' } },
    { name: 'Custom Icon', props: { icon: '🔍', description: 'Nothing found' } },
    { name: 'No Description', props: { description: '' } },
  ],
  playground: {
    defaults: { description: 'No data' },
    controls: [
      { name: 'description', type: 'text' },
      { name: 'icon', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Basic empty state',
      code: `import { Empty } from '@decantr/ui/components';

const empty = Empty({ description: 'No data available' });
document.body.appendChild(empty);`,
    },
    {
      title: 'With custom icon and action',
      code: `import { Empty, Button } from '@decantr/ui/components';

const empty = Empty(
  { icon: '📭', description: 'Your inbox is empty' },
  Button({ variant: 'primary' }, 'Compose'),
);`,
    },
  ],
};
