import { Badge } from '@decantr/ui/components';

export default {
  component: (props) => Badge(props, props._content || ''),
  title: 'Badge',
  category: 'components/original',
  description: 'Label component for status indicators, counts, and category tags.',
  variants: [
    { name: 'Default', props: { _content: 'Badge' } },
    { name: 'Primary', props: { variant: 'primary', _content: 'Primary' } },
    { name: 'Success', props: { variant: 'success', _content: 'Success' } },
    { name: 'Error', props: { variant: 'error', _content: 'Error' } },
    { name: 'Warning', props: { variant: 'warning', _content: 'Warning' } },
    { name: 'Info', props: { variant: 'info', _content: 'Info' } },
    { name: 'Processing', props: { variant: 'processing', _content: 'Processing' } },
    { name: 'Solid Primary', props: { variant: 'primary', solid: true, _content: 'Solid' } },
    { name: 'Solid Success', props: { variant: 'success', solid: true, _content: 'Solid' } },
    { name: 'Solid Error', props: { variant: 'error', solid: true, _content: 'Solid' } },
    { name: 'Count', props: { count: 5 } },
    { name: 'Dot', props: { dot: true, variant: 'success' } },
    { name: 'Dot Error', props: { dot: true, variant: 'error' } },
    { name: 'Custom Color', props: { color: '#8b5cf6', _content: 'Custom' } },
  ],
  playground: {
    defaults: { variant: 'primary', _content: 'Badge' },
    controls: [
      { name: 'variant', type: 'select', options: ['primary', 'success', 'error', 'warning', 'info', 'processing'] },
      { name: '_content', type: 'text' },
      { name: 'count', type: 'number' },
      { name: 'dot', type: 'boolean' },
      { name: 'solid', type: 'boolean' },
      { name: 'color', type: 'color' },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { Badge } from '@decantr/ui/components';

const badge = Badge({ variant: 'success' }, 'Active');
document.body.appendChild(badge);`,
    },
  ],
};
