import { Tooltip } from '@decantr/ui/components';

export default {
  component: (props) => {
    const trigger = props._content || 'Hover me';
    return Tooltip(props, trigger);
  },
  title: 'Tooltip',
  category: 'components/original',
  description: 'Informational popup that appears on hover or focus with configurable position and delay.',
  variants: [
    { name: 'Top (Default)', props: { content: 'Tooltip on top', _content: 'Hover me (top)' } },
    { name: 'Bottom', props: { content: 'Tooltip on bottom', position: 'bottom', _content: 'Hover me (bottom)' } },
    { name: 'Left', props: { content: 'Tooltip on left', position: 'left', _content: 'Hover me (left)' } },
    { name: 'Right', props: { content: 'Tooltip on right', position: 'right', _content: 'Hover me (right)' } },
    { name: 'No Delay', props: { content: 'Instant tooltip', delay: 0, _content: 'Hover (no delay)' } },
    { name: 'Long Delay', props: { content: 'Slow tooltip', delay: 500, _content: 'Hover (500ms delay)' } },
  ],
  playground: {
    defaults: { content: 'Helpful tooltip text', position: 'top', _content: 'Hover me' },
    controls: [
      { name: 'content', type: 'text' },
      { name: 'position', type: 'select', options: ['top', 'bottom', 'left', 'right'] },
      { name: 'delay', type: 'number' },
      { name: '_content', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { Tooltip } from '@decantr/ui/components';
import { Button } from '@decantr/ui/components';

const tip = Tooltip(
  { content: 'Save your changes', position: 'bottom' },
  Button({ variant: 'primary' }, 'Save')
);
document.body.appendChild(tip);`,
    },
  ],
};
