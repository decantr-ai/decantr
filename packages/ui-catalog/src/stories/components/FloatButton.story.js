import { FloatButton } from '@decantr/ui/components';

export default {
  component: (props) => {
    return FloatButton({
      icon: props.icon || '+',
      tooltip: props.tooltip,
      shape: props.shape || 'circle',
      type: props.type || 'default',
      position: props.position || 'right-bottom',
      onClick: () => console.log('FloatButton clicked'),
    });
  },
  title: 'FloatButton',
  category: 'components/feedback',
  description: 'Floating action button (FAB) fixed to viewport corner. Supports expandable group.',
  variants: [
    { name: 'Default', props: { icon: '+' } },
    { name: 'Primary', props: { icon: '+', type: 'primary' } },
    { name: 'Circle', props: { icon: '?', shape: 'circle', tooltip: 'Help' } },
    { name: 'Square', props: { icon: '+', shape: 'square' } },
    { name: 'With Tooltip', props: { icon: '+', tooltip: 'Add new item' } },
    { name: 'Top Right', props: { icon: '+', position: 'right-top' } },
    { name: 'Bottom Left', props: { icon: '+', position: 'left-bottom' } },
  ],
  playground: {
    defaults: { icon: '+', shape: 'circle', type: 'default', position: 'right-bottom', tooltip: '' },
    controls: [
      { name: 'icon', type: 'text' },
      { name: 'shape', type: 'select', options: ['circle', 'square'] },
      { name: 'type', type: 'select', options: ['default', 'primary'] },
      { name: 'position', type: 'select', options: ['right-bottom', 'right-top', 'left-bottom', 'left-top'] },
      { name: 'tooltip', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { FloatButton } from '@decantr/ui/components';

const fab = FloatButton({
  icon: '+',
  type: 'primary',
  tooltip: 'Add item',
  onClick: () => console.log('clicked'),
});
document.body.appendChild(fab);`,
    },
    {
      title: 'Group',
      code: `import { FloatButton } from '@decantr/ui/components';

const group = FloatButton.Group(
  { icon: '+', direction: 'top' },
  FloatButton({ icon: '✎', tooltip: 'Edit' }),
  FloatButton({ icon: '🔗', tooltip: 'Share' }),
  FloatButton({ icon: '⭐', tooltip: 'Favorite' }),
);
document.body.appendChild(group);`,
    },
  ],
};
