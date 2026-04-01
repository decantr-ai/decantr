import { h } from '@decantr/ui/runtime';
import { Button, Input } from '@decantr/ui/components';
import { css } from '@decantr/css';

export default {
  component: (props) => {
    return h('div', { class: css('_flex _col _gap2 _p4 _bgsurface') },
      h('div', { class: css('_flex _gap2 _aic') },
        h('textarea', {
          class: css('_flex1 _p3 _bgbg _border _rounded'),
          placeholder: props.placeholder || 'Type a message...',
          rows: 1,
        }),
        h(Button, { variant: 'ghost', size: 'sm' }, '\u{1F4CE}'),
        h(Button, { variant: 'primary', size: 'sm' }, '\u2192'),
      ),
    );
  },
  title: 'Chat Input',
  category: 'components/form',
  description: 'Chat message input with auto-expanding textarea, file attachment, and send button. Maps to the Decantr chat-input pattern.',
  variants: [
    { name: 'Standard', props: { placeholder: 'Type a message...' } },
    { name: 'With Mentions', props: { placeholder: 'Type @ to mention...' } },
  ],
  usage: [
    { title: 'Basic Chat Input', code: `h(ChatInput, { placeholder: 'Ask anything...' })` },
  ],
};
