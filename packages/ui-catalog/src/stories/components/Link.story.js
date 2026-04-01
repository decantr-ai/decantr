import { Link } from '@decantr/ui/components';

export default {
  component: (props) => Link(props, props._content || 'Link'),
  title: 'Link',
  category: 'components/general',
  description: 'Anchor element with consistent styling, semantic types, and accessibility support.',
  variants: [
    { name: 'Default', props: { href: '#', _content: 'Default link' } },
    { name: 'Secondary', props: { href: '#', type: 'secondary', _content: 'Secondary link' } },
    { name: 'Success', props: { href: '#', type: 'success', _content: 'Success link' } },
    { name: 'Warning', props: { href: '#', type: 'warning', _content: 'Warning link' } },
    { name: 'Danger', props: { href: '#', type: 'danger', _content: 'Danger link' } },
    { name: 'External', props: { href: 'https://example.com', target: '_blank', _content: 'External link' } },
    { name: 'Disabled', props: { href: '#', disabled: true, _content: 'Disabled link' } },
  ],
  playground: {
    defaults: { href: '#', _content: 'Click me' },
    controls: [
      { name: 'href', type: 'text' },
      { name: 'target', type: 'select', options: ['_self', '_blank'] },
      { name: 'type', type: 'select', options: ['default', 'secondary', 'success', 'warning', 'danger'] },
      { name: 'disabled', type: 'boolean' },
      { name: '_content', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Basic link',
      code: `import { Link } from '@decantr/ui/components';

const link = Link({ href: '/about' }, 'About us');
document.body.appendChild(link);`,
    },
    {
      title: 'External link with target',
      code: `import { Link } from '@decantr/ui/components';

const link = Link({ href: 'https://example.com', target: '_blank' }, 'Visit Example');
document.body.appendChild(link);`,
    },
  ],
};
