import { Title } from '@decantr/ui/components';

export default {
  component: (props) => Title(props, props._content || 'Title'),
  title: 'Title',
  category: 'components/general',
  description: 'Heading element (h1-h5) with consistent token-based sizing and semantic text decorations.',
  variants: [
    { name: 'Level 1', props: { level: 1, _content: 'Heading 1' } },
    { name: 'Level 2', props: { level: 2, _content: 'Heading 2' } },
    { name: 'Level 3', props: { level: 3, _content: 'Heading 3' } },
    { name: 'Level 4', props: { level: 4, _content: 'Heading 4' } },
    { name: 'Level 5', props: { level: 5, _content: 'Heading 5' } },
    { name: 'Secondary', props: { level: 3, type: 'secondary', _content: 'Secondary' } },
    { name: 'Success', props: { level: 3, type: 'success', _content: 'Success' } },
    { name: 'Warning', props: { level: 3, type: 'warning', _content: 'Warning' } },
    { name: 'Danger', props: { level: 3, type: 'danger', _content: 'Danger' } },
    { name: 'Marked', props: { level: 3, mark: true, _content: 'Marked Title' } },
    { name: 'Underline', props: { level: 3, underline: true, _content: 'Underlined' } },
    { name: 'Strikethrough', props: { level: 3, strikethrough: true, _content: 'Deleted' } },
    { name: 'Disabled', props: { level: 3, disabled: true, _content: 'Disabled' } },
  ],
  playground: {
    defaults: { level: 3, _content: 'Title Text' },
    controls: [
      { name: 'level', type: 'select', options: ['1', '2', '3', '4', '5'] },
      { name: 'type', type: 'select', options: ['default', 'secondary', 'success', 'warning', 'danger'] },
      { name: 'mark', type: 'boolean' },
      { name: 'underline', type: 'boolean' },
      { name: 'strikethrough', type: 'boolean' },
      { name: 'disabled', type: 'boolean' },
      { name: '_content', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Page heading',
      code: `import { Title } from '@decantr/ui/components';

const heading = Title({ level: 1 }, 'Welcome to Decantr');
document.body.appendChild(heading);`,
    },
    {
      title: 'Styled heading',
      code: `import { Title } from '@decantr/ui/components';

const heading = Title({ level: 2, type: 'success', mark: true }, 'Complete!');
document.body.appendChild(heading);`,
    },
  ],
};
