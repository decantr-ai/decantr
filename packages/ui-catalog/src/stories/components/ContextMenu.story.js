import { ContextMenu } from '@decantr/ui/components';
import { tags } from '@decantr/ui/tags';

const { div } = tags;

const sampleItems = [
  { label: 'Cut', value: 'cut', shortcut: 'Ctrl+X' },
  { label: 'Copy', value: 'copy', shortcut: 'Ctrl+C' },
  { label: 'Paste', value: 'paste', shortcut: 'Ctrl+V' },
  { separator: true },
  { label: 'Select All', value: 'select-all', shortcut: 'Ctrl+A' },
  { separator: true },
  { label: 'Delete', value: 'delete', disabled: true },
];

function makeTarget(text) {
  return div({
    style: 'padding: 32px; border: 2px dashed var(--d-color-border, #ccc); border-radius: 8px; text-align: center; color: var(--d-color-text-muted, #888); user-select: none;',
  }, text);
}

export default {
  component: (props) => {
    const target = makeTarget(props._content || 'Right-click here');
    ContextMenu({
      target,
      items: props._items || sampleItems,
      onSelect: (val) => console.log('Selected:', val),
      class: props.class,
    });
    return target;
  },
  title: 'ContextMenu',
  category: 'components/navigation',
  description: 'Right-click context menu overlay with keyboard navigation, shortcuts, and disabled items.',
  variants: [
    { name: 'Default', props: { _content: 'Right-click here for context menu' } },
    { name: 'With Disabled Item', props: { _content: 'Right-click (Delete is disabled)' } },
  ],
  playground: {
    defaults: { _content: 'Right-click this area' },
    controls: [
      { name: '_content', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Attach to an element',
      code: `import { ContextMenu } from '@decantr/ui/components';

const target = document.getElementById('my-area');
ContextMenu({
  target,
  items: [
    { label: 'Cut', value: 'cut', shortcut: 'Ctrl+X' },
    { label: 'Copy', value: 'copy', shortcut: 'Ctrl+C' },
    { label: 'Paste', value: 'paste', shortcut: 'Ctrl+V' },
    { separator: true },
    { label: 'Delete', value: 'delete', disabled: true },
  ],
  onSelect: (value) => console.log('Action:', value),
});`,
    },
  ],
};
