import { Dropdown, Button } from '@decantr/ui/components';

const sampleItems = [
  { label: 'Edit', value: 'edit', icon: 'pencil' },
  { label: 'Duplicate', value: 'duplicate', icon: 'copy' },
  { separator: true },
  { label: 'Archive', value: 'archive', icon: 'archive' },
  { label: 'Delete', value: 'delete', icon: 'trash', disabled: true },
];

export default {
  component: (props) => Dropdown({
    ...props,
    trigger: props._trigger || (() => Button({ variant: 'outline' }, 'Open Menu')),
    items: props._items || sampleItems,
  }),
  title: 'Dropdown',
  category: 'components/original',
  description: 'Menu triggered by a button with keyboard navigation, icons, shortcuts, and separators.',
  variants: [
    { name: 'Default', props: { _items: sampleItems } },
    { name: 'Align Right', props: { _items: sampleItems, align: 'right' } },
    { name: 'With Shortcuts', props: { _items: [{ label: 'Undo', value: 'undo', shortcut: 'Ctrl+Z' }, { label: 'Redo', value: 'redo', shortcut: 'Ctrl+Y' }, { separator: true }, { label: 'Cut', value: 'cut', shortcut: 'Ctrl+X' }, { label: 'Copy', value: 'copy', shortcut: 'Ctrl+C' }, { label: 'Paste', value: 'paste', shortcut: 'Ctrl+V' }] } },
    { name: 'Block', props: { _items: sampleItems, block: true } },
    { name: 'Simple Items', props: { _items: [{ label: 'Option A', value: 'a' }, { label: 'Option B', value: 'b' }, { label: 'Option C', value: 'c' }] } },
  ],
  playground: {
    defaults: { align: 'left' },
    controls: [
      { name: 'align', type: 'select', options: ['left', 'right'] },
      { name: 'block', type: 'boolean' },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { Dropdown, Button } from '@decantr/ui/components';

const menu = Dropdown({
  trigger: () => Button({ variant: 'outline' }, 'Actions'),
  items: [
    { label: 'Edit', value: 'edit', onclick: () => console.log('edit') },
    { label: 'Delete', value: 'delete' },
  ],
});
document.body.appendChild(menu);`,
    },
  ],
};
