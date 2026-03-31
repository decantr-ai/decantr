import { Card } from '@decantr/ui/components';

export default {
  component: (props) => Card(props, props._content || 'Card content goes here.'),
  title: 'Card',
  category: 'components/original',
  description: 'Container component with optional title, cover, actions, and loading states.',
  variants: [
    { name: 'Default', props: {} },
    { name: 'With Title', props: { title: 'Card Title' } },
    { name: 'With Title and Content', props: { title: 'Card Title', _content: 'This is the card body with some descriptive text.' } },
    { name: 'Hoverable', props: { title: 'Hoverable Card', hoverable: true, _content: 'Hover over me for an effect.' } },
    { name: 'Borderless', props: { title: 'Borderless', bordered: false, _content: 'No border on this card.' } },
    { name: 'Small Size', props: { title: 'Compact Card', size: 'sm', _content: 'Smaller padding.' } },
    { name: 'Inner Type', props: { title: 'Inner Card', type: 'inner', _content: 'Nested card style.' } },
    { name: 'Loading', props: { loading: true } },
  ],
  playground: {
    defaults: { title: 'My Card', _content: 'Card body content.' },
    controls: [
      { name: 'title', type: 'text' },
      { name: '_content', type: 'text' },
      { name: 'hoverable', type: 'boolean' },
      { name: 'bordered', type: 'boolean' },
      { name: 'loading', type: 'boolean' },
      { name: 'size', type: 'select', options: ['default', 'sm'] },
      { name: 'type', type: 'select', options: ['default', 'inner'] },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { Card } from '@decantr/ui/components';

const card = Card({ title: 'Welcome' }, 'Hello, world!');
document.body.appendChild(card);`,
    },
  ],
};
