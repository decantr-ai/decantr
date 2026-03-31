import { Steps } from '@decantr/ui/components';

const basicItems = [
  { title: 'Account', description: 'Create your account' },
  { title: 'Profile', description: 'Set up your profile' },
  { title: 'Review', description: 'Review and confirm' },
];

const errorItems = [
  { title: 'Upload', description: 'Upload your files' },
  { title: 'Validate', description: 'Check file format', status: 'error' },
  { title: 'Complete', description: 'Finish processing' },
];

const iconItems = [
  { title: 'Cart', icon: 'shopping-cart' },
  { title: 'Payment', icon: 'credit-card' },
  { title: 'Shipping', icon: 'truck' },
  { title: 'Done', icon: 'check-circle' },
];

export default {
  component: (props) => Steps({
    items: props._items || basicItems,
    current: props.current ?? 1,
    direction: props.direction,
    clickable: props.clickable,
    class: props.class,
  }),
  title: 'Steps',
  category: 'components/navigation',
  description: 'Step-by-step navigation indicator showing progress through a multi-step process.',
  variants: [
    { name: 'Default', props: { current: 1 } },
    { name: 'First Step', props: { current: 0 } },
    { name: 'Last Step', props: { current: 2 } },
    { name: 'Vertical', props: { current: 1, direction: 'vertical' } },
    { name: 'With Error', props: { _items: errorItems, current: 1 } },
    { name: 'With Icons', props: { _items: iconItems, current: 2 } },
    { name: 'Clickable', props: { current: 1, clickable: true } },
  ],
  playground: {
    defaults: { current: 1, direction: 'horizontal', clickable: false },
    controls: [
      { name: 'current', type: 'number' },
      { name: 'direction', type: 'select', options: ['horizontal', 'vertical'] },
      { name: 'clickable', type: 'boolean' },
    ],
  },
  usage: [
    {
      title: 'Basic steps',
      code: `import { Steps } from '@decantr/ui/components';

const steps = Steps({
  items: [
    { title: 'Account', description: 'Create your account' },
    { title: 'Profile', description: 'Set up your profile' },
    { title: 'Review', description: 'Review and confirm' },
  ],
  current: 1,
});
document.body.appendChild(steps);`,
    },
    {
      title: 'Clickable vertical steps',
      code: `import { Steps } from '@decantr/ui/components';

const steps = Steps({
  items: [
    { title: 'Step 1' },
    { title: 'Step 2' },
    { title: 'Step 3' },
  ],
  current: 0,
  direction: 'vertical',
  clickable: true,
  onChange: (index) => console.log('Step:', index),
});`,
    },
  ],
};
