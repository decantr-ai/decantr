import { Popover, Button } from '@decantr/ui/components';
import { h } from '@decantr/ui/runtime';

export default {
  component: (props) => Popover(
    { ...props, trigger: () => Button({ variant: 'outline' }, 'Open Popover') },
    h('div', { style: { padding: '12px' } },
      h('p', null, props._content || 'Popover content goes here.')
    )
  ),
  title: 'Popover',
  category: 'components/original',
  description: 'Floating content panel attached to a trigger element with configurable position and alignment.',
  variants: [
    { name: 'Default (Bottom)', props: { position: 'bottom' } },
    { name: 'Top', props: { position: 'top' } },
    { name: 'Left', props: { position: 'left' } },
    { name: 'Right', props: { position: 'right' } },
    { name: 'Align Start', props: { position: 'bottom', align: 'start' } },
    { name: 'Align End', props: { position: 'bottom', align: 'end' } },
  ],
  playground: {
    defaults: { position: 'bottom', align: 'center' },
    controls: [
      { name: 'position', type: 'select', options: ['top', 'bottom', 'left', 'right'] },
      { name: 'align', type: 'select', options: ['start', 'center', 'end'] },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { Popover, Button } from '@decantr/ui/components';
import { h } from '@decantr/ui/runtime';

const pop = Popover(
  { trigger: () => Button({ variant: 'outline' }, 'Info'), position: 'bottom' },
  h('p', { style: { padding: '12px' } }, 'Additional details here.')
);
document.body.appendChild(pop);`,
    },
  ],
};
