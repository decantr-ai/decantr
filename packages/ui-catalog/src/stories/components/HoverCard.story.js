import { HoverCard } from '@decantr/ui/components';
import { h } from '@decantr/ui';

export default {
  component: (props) => HoverCard({
    trigger: () => h('span', { style: { textDecoration: 'underline', cursor: 'pointer' } }, props._triggerText || 'Hover me'),
    ...props,
  }, h('div', { style: { padding: '12px', maxWidth: '280px' } },
    h('div', { style: { fontWeight: 'bold', marginBottom: '4px' } }, 'Card Title'),
    h('div', null, 'This is the hover card content that appears when you hover over the trigger element.'),
  )),
  title: 'HoverCard',
  category: 'components/data-display',
  description: 'Content card that appears on hover over a trigger element. Supports configurable position and open/close delays.',
  variants: [
    { name: 'Default (Bottom)', props: {} },
    { name: 'Top', props: { position: 'top' } },
    { name: 'Left', props: { position: 'left' } },
    { name: 'Right', props: { position: 'right' } },
    { name: 'Fast Open', props: { openDelay: 100, closeDelay: 100 } },
    { name: 'Slow Open', props: { openDelay: 800, closeDelay: 400 } },
  ],
  playground: {
    defaults: { _triggerText: 'Hover me' },
    controls: [
      { name: 'position', type: 'select', options: ['top', 'bottom', 'left', 'right'] },
      { name: 'openDelay', type: 'number' },
      { name: 'closeDelay', type: 'number' },
      { name: '_triggerText', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Basic hover card',
      code: `import { HoverCard } from '@decantr/ui/components';
import { h } from '@decantr/ui';

const card = HoverCard(
  { trigger: () => h('a', { href: '#' }, '@username'), position: 'bottom' },
  h('div', null, 'User profile card content'),
);
document.body.appendChild(card);`,
    },
  ],
};
