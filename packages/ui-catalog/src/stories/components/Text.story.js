import { Text } from '@decantr/ui/components';

export default {
  component: (props) => Text(props, props._content || 'Text'),
  title: 'Text',
  category: 'components/general',
  description: 'Inline text with semantic variants, decorations, and special code/keyboard modes.',
  variants: [
    { name: 'Default', props: { _content: 'Default text' } },
    { name: 'Secondary', props: { type: 'secondary', _content: 'Secondary text' } },
    { name: 'Success', props: { type: 'success', _content: 'Success text' } },
    { name: 'Warning', props: { type: 'warning', _content: 'Warning text' } },
    { name: 'Danger', props: { type: 'danger', _content: 'Danger text' } },
    { name: 'Strong', props: { strong: true, _content: 'Strong text' } },
    { name: 'Italic', props: { italic: true, _content: 'Italic text' } },
    { name: 'Underline', props: { underline: true, _content: 'Underlined text' } },
    { name: 'Strikethrough', props: { strikethrough: true, _content: 'Deleted text' } },
    { name: 'Code', props: { code: true, _content: 'const x = 42' } },
    { name: 'Keyboard', props: { keyboard: true, _content: 'Ctrl+S' } },
    { name: 'Marked', props: { mark: true, _content: 'Highlighted text' } },
    { name: 'Disabled', props: { disabled: true, _content: 'Disabled text' } },
  ],
  playground: {
    defaults: { _content: 'Sample text' },
    controls: [
      { name: 'type', type: 'select', options: ['default', 'secondary', 'success', 'warning', 'danger'] },
      { name: 'strong', type: 'boolean' },
      { name: 'italic', type: 'boolean' },
      { name: 'underline', type: 'boolean' },
      { name: 'strikethrough', type: 'boolean' },
      { name: 'code', type: 'boolean' },
      { name: 'keyboard', type: 'boolean' },
      { name: 'mark', type: 'boolean' },
      { name: 'disabled', type: 'boolean' },
      { name: '_content', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Inline text with semantic type',
      code: `import { Text } from '@decantr/ui/components';

const el = Text({ type: 'success', strong: true }, 'Saved successfully');
document.body.appendChild(el);`,
    },
    {
      title: 'Code snippet',
      code: `import { Text } from '@decantr/ui/components';

const code = Text({ code: true }, 'npm install @decantr/ui');
document.body.appendChild(code);`,
    },
  ],
};
