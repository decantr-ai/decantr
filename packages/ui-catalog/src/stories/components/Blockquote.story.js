import { Blockquote } from '@decantr/ui/components';

export default {
  component: (props) => Blockquote(props, props._content || 'This is a blockquote.'),
  title: 'Blockquote',
  category: 'components/general',
  description: 'Styled quotation block for highlighting excerpts and citations.',
  variants: [
    { name: 'Default', props: { _content: 'Design is not just what it looks like and feels like. Design is how it works.' } },
    { name: 'Short', props: { _content: 'Less is more.' } },
    { name: 'Long', props: { _content: 'The best way to predict the future is to invent it. The second best way is to build something that solves a real problem for real people, and let the future come to you.' } },
  ],
  playground: {
    defaults: { _content: 'A blockquote for the playground.' },
    controls: [
      { name: '_content', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Basic blockquote',
      code: `import { Blockquote } from '@decantr/ui/components';

const quote = Blockquote({}, 'Design is not just what it looks like. Design is how it works.');
document.body.appendChild(quote);`,
    },
  ],
};
