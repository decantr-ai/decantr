import { Kbd } from '@decantr/ui/components';

export default {
  component: (props) => Kbd(props, props._content),
  title: 'Kbd',
  category: 'components/general',
  description: 'Keyboard shortcut display component that renders keys with proper styling and combination support.',
  variants: [
    { name: 'Single Key', props: { keys: 'Enter' } },
    { name: 'Modifier', props: { keys: 'Ctrl' } },
    { name: 'Combination', props: { keys: ['Ctrl', 'S'] } },
    { name: 'Three Keys', props: { keys: ['Ctrl', 'Shift', 'P'] } },
    { name: 'Arrow Key', props: { keys: 'Esc' } },
    { name: 'Custom Separator', props: { keys: ['Cmd', 'K'], separator: ' + ' } },
    { name: 'Child Content', props: { _content: 'Space' } },
  ],
  playground: {
    defaults: { keys: ['Ctrl', 'C'] },
    controls: [
      { name: 'separator', type: 'text' },
      { name: '_content', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Single key',
      code: `import { Kbd } from '@decantr/ui/components';

const key = Kbd({ keys: 'Enter' });
document.body.appendChild(key);`,
    },
    {
      title: 'Keyboard shortcut combination',
      code: `import { Kbd } from '@decantr/ui/components';

const shortcut = Kbd({ keys: ['Ctrl', 'Shift', 'P'] });
document.body.appendChild(shortcut);`,
    },
  ],
};
