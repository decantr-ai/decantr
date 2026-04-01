import { Tag } from '@decantr/ui/components';

export default {
  component: (props) => Tag(props, props._content || 'Tag'),
  title: 'Tag',
  category: 'components/data-display',
  description: 'Categorization label with optional close and checkable behavior. Supports preset and custom colors.',
  variants: [
    { name: 'Default', props: {} },
    { name: 'Primary', props: { color: 'primary' } },
    { name: 'Success', props: { color: 'success' } },
    { name: 'Warning', props: { color: 'warning' } },
    { name: 'Danger', props: { color: 'danger' } },
    { name: 'Custom Color', props: { color: '#7c3aed', _content: 'Purple' } },
    { name: 'Closable', props: { closable: true, color: 'primary' } },
    { name: 'Checkable', props: { checked: false, _content: 'Click me' } },
    { name: 'Checkable Checked', props: { checked: true, _content: 'Checked' } },
  ],
  playground: {
    defaults: { _content: 'Tag', color: 'primary' },
    controls: [
      { name: 'color', type: 'select', options: ['primary', 'success', 'warning', 'danger'] },
      { name: 'closable', type: 'boolean' },
      { name: '_content', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Basic tag',
      code: `import { Tag } from '@decantr/ui/components';

const tag = Tag({ color: 'success' }, 'Published');
document.body.appendChild(tag);`,
    },
    {
      title: 'Closable tag',
      code: `import { Tag } from '@decantr/ui/components';

const tag = Tag({ color: 'danger', closable: true, onClose: () => console.log('closed') }, 'Remove me');`,
    },
    {
      title: 'Checkable group',
      code: `import { Tag } from '@decantr/ui/components';

const group = Tag.CheckableGroup({
  options: [
    { value: 'js', label: 'JavaScript' },
    { value: 'ts', label: 'TypeScript' },
  ],
  value: ['js'],
  onchange: (vals) => console.log(vals),
});`,
    },
  ],
};
