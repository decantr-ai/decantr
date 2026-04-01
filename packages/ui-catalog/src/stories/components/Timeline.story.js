import { Timeline } from '@decantr/ui/components';

const sampleItems = [
  { content: 'Application submitted', time: '2024-01-15', status: 'success' },
  { content: 'Technical interview', time: '2024-01-20', status: 'success' },
  { content: 'Team interview scheduled', time: '2024-01-25', status: 'info' },
  { content: 'Decision pending', time: '2024-02-01' },
];

export default {
  component: (props) => Timeline({ items: sampleItems, ...props }),
  title: 'Timeline',
  category: 'components/data-display',
  description: 'Vertical or horizontal sequence of events with connecting lines, status dots, alternate modes, and skeleton loading.',
  variants: [
    { name: 'Default (Left)', props: {} },
    { name: 'Right Mode', props: { mode: 'right' } },
    { name: 'Alternate', props: { mode: 'alternate', items: [
      { content: 'Step 1', time: '09:00', label: 'Morning' },
      { content: 'Step 2', time: '12:00', label: 'Noon' },
      { content: 'Step 3', time: '15:00', label: 'Afternoon' },
    ] } },
    { name: 'Pending', props: { pending: 'Awaiting approval...' } },
    { name: 'With Icons', props: { items: [
      { content: 'Created', icon: '📝' },
      { content: 'Reviewed', icon: '👀' },
      { content: 'Approved', icon: '✅' },
    ] } },
    { name: 'Branded', props: { variant: 'branded' } },
    { name: 'Gradient', props: { gradient: true } },
    { name: 'Glass', props: { glass: true } },
    { name: 'Small', props: { size: 'sm' } },
    { name: 'Large', props: { size: 'lg' } },
    { name: 'Reversed', props: { reverse: true } },
    { name: 'Horizontal', props: { direction: 'horizontal' } },
    { name: 'Loading', props: { loading: true } },
    { name: 'Active Item', props: { active: 1 } },
  ],
  playground: {
    defaults: {},
    controls: [
      { name: 'mode', type: 'select', options: ['left', 'right', 'alternate', 'custom'] },
      { name: 'variant', type: 'select', options: ['default', 'branded'] },
      { name: 'direction', type: 'select', options: ['vertical', 'horizontal'] },
      { name: 'size', type: 'select', options: ['sm', 'lg'] },
      { name: 'gradient', type: 'boolean' },
      { name: 'glass', type: 'boolean' },
      { name: 'reverse', type: 'boolean' },
      { name: 'loading', type: 'boolean' },
      { name: 'active', type: 'number' },
    ],
  },
  usage: [
    {
      title: 'Basic timeline',
      code: `import { Timeline } from '@decantr/ui/components';

const tl = Timeline({
  items: [
    { content: 'Order placed', time: 'Jan 1', status: 'success' },
    { content: 'Shipped', time: 'Jan 3', status: 'info' },
    { content: 'Delivered', time: 'Jan 5' },
  ],
});
document.body.appendChild(tl);`,
    },
    {
      title: 'Alternate with pending',
      code: `import { Timeline } from '@decantr/ui/components';

const tl = Timeline({
  items: myEvents,
  mode: 'alternate',
  pending: 'Processing...',
});`,
    },
  ],
};
