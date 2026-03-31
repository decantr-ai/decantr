import { Modal } from '@decantr/ui/components';

export default {
  component: (props) => {
    const content = props._content || 'This is the modal body content.';
    return Modal(props, content);
  },
  title: 'Modal',
  category: 'components/original',
  description: 'Dialog overlay with focus trap, backdrop click, and animated close.',
  variants: [
    { name: 'Default', props: { title: 'Modal Title', _content: 'Modal body content goes here.' } },
    { name: 'Without Title', props: { _content: 'A modal without a title header.' } },
    { name: 'Custom Width', props: { title: 'Wide Modal', width: '720px', _content: 'This modal has a custom width.' } },
    { name: 'Narrow', props: { title: 'Confirm', width: '320px', _content: 'Are you sure?' } },
  ],
  playground: {
    defaults: { title: 'Dialog', width: '480px', _content: 'Modal content here.' },
    controls: [
      { name: 'title', type: 'text' },
      { name: 'width', type: 'text' },
      { name: '_content', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { Modal } from '@decantr/ui/components';
import { createSignal } from '@decantr/ui/state';

const [visible, setVisible] = createSignal(false);
const modal = Modal({ title: 'Confirm', visible, onClose: () => setVisible(false) },
  'Are you sure you want to proceed?'
);
document.body.appendChild(modal);
setVisible(true);`,
    },
  ],
};
