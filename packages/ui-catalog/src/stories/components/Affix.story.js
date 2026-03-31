import { Affix } from '@decantr/ui/components';
import { tags } from '@decantr/ui/tags';

const { div } = tags;

function makeContent(text) {
  return div({ style: 'padding: 8px 16px; background: var(--d-color-surface-alt, #f0f0f0); border: 1px solid var(--d-color-border, #ccc); border-radius: 4px;' }, text);
}

export default {
  component: (props) => Affix(
    { offsetTop: props.offsetTop, offsetBottom: props.offsetBottom, class: props.class },
    makeContent(props._content || 'Affix content'),
  ),
  title: 'Affix',
  category: 'components/navigation',
  description: 'Pins content to the viewport on scroll (sticky wrapper) with configurable top or bottom offset.',
  variants: [
    { name: 'Default (top)', props: { offsetTop: 0, _content: 'Pinned to top' } },
    { name: 'Offset Top 50', props: { offsetTop: 50, _content: 'Pinned 50px from top' } },
    { name: 'Offset Bottom 20', props: { offsetBottom: 20, _content: 'Pinned 20px from bottom' } },
  ],
  playground: {
    defaults: { offsetTop: 0, _content: 'Affix content' },
    controls: [
      { name: 'offsetTop', type: 'number' },
      { name: 'offsetBottom', type: 'number' },
      { name: '_content', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Pin to top on scroll',
      code: `import { Affix } from '@decantr/ui/components';

const el = Affix(
  { offsetTop: 10, onChange: (fixed) => console.log('Fixed:', fixed) },
  document.createTextNode('I stick to the top'),
);
document.body.appendChild(el);`,
    },
    {
      title: 'Pin to bottom',
      code: `import { Affix } from '@decantr/ui/components';

const el = Affix(
  { offsetBottom: 20 },
  document.createTextNode('I stick to the bottom'),
);`,
    },
  ],
};
