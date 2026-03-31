import { Drawer, Button } from '@decantr/ui/components';
import { createSignal } from '@decantr/ui/state';
import { h } from '@decantr/ui/core';

export default {
  component: (props) => {
    const [visible, setVisible] = createSignal(false);
    const trigger = Button({ variant: 'primary', onclick: () => setVisible(true) }, 'Open Drawer');
    const drawer = Drawer(
      { ...props, visible, onClose: () => setVisible(false), title: props.title || 'Drawer Title' },
      h('p', null, 'Drawer content goes here.')
    );
    const wrap = h('div', null, trigger, drawer);
    return wrap;
  },
  title: 'Drawer',
  category: 'components/original',
  description: 'Slide-over panel from any screen edge with focus trap and animated transitions.',
  variants: [
    { name: 'Right (Default)', props: { side: 'right', title: 'Right Drawer' } },
    { name: 'Left', props: { side: 'left', title: 'Left Drawer' } },
    { name: 'Top', props: { side: 'top', title: 'Top Drawer' } },
    { name: 'Bottom', props: { side: 'bottom', title: 'Bottom Drawer' } },
    { name: 'Custom Size', props: { side: 'right', title: 'Wide Drawer', size: '480px' } },
  ],
  playground: {
    defaults: { side: 'right', title: 'Drawer Title' },
    controls: [
      { name: 'side', type: 'select', options: ['left', 'right', 'top', 'bottom'] },
      { name: 'title', type: 'text' },
      { name: 'size', type: 'text' },
      { name: 'closeOnOutside', type: 'boolean' },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { Drawer } from '@decantr/ui/components';
import { createSignal } from '@decantr/ui/state';
import { h } from '@decantr/ui/core';

const [visible, setVisible] = createSignal(false);
const drawer = Drawer(
  { visible, onClose: () => setVisible(false), title: 'Settings', side: 'right' },
  h('p', null, 'Settings content here.')
);
document.body.appendChild(drawer);`,
    },
  ],
};
