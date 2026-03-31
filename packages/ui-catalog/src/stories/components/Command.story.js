import { Command } from '@decantr/ui/components';
import { createSignal } from '@decantr/ui/state';

export default {
  component: (props) => {
    const [visible, setVisible] = createSignal(true);
    const items = props._items || [
      { label: 'New File', icon: 'file-plus', group: 'File', shortcut: 'Ctrl+N' },
      { label: 'Open File', icon: 'folder-open', group: 'File', shortcut: 'Ctrl+O' },
      { label: 'Save', icon: 'save', group: 'File', shortcut: 'Ctrl+S' },
      { label: 'Search', icon: 'search', group: 'Edit', shortcut: 'Ctrl+F' },
      { label: 'Replace', icon: 'replace', group: 'Edit', shortcut: 'Ctrl+H' },
      { label: 'Settings', icon: 'settings', group: 'Preferences' },
      { label: 'Theme', icon: 'palette', group: 'Preferences' },
    ];
    return Command({
      visible,
      items,
      placeholder: props.placeholder || 'Type a command or search...',
      onSelect: (item) => console.log('Selected:', item.label),
      onClose: () => setVisible(false),
      class: props.class,
    });
  },
  title: 'Command',
  category: 'components/feedback',
  description: 'Command palette / spotlight search dialog with keyboard navigation and grouped actions.',
  variants: [
    { name: 'Default', props: { placeholder: 'Type a command or search...' } },
    { name: 'Custom Placeholder', props: { placeholder: 'Search actions...' } },
  ],
  playground: {
    defaults: { placeholder: 'Type a command or search...' },
    controls: [
      { name: 'placeholder', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { Command } from '@decantr/ui/components';
import { createSignal } from '@decantr/ui/state';

const [visible, setVisible] = createSignal(false);
const cmd = Command({
  visible,
  items: [
    { label: 'New File', icon: 'file-plus', group: 'File', shortcut: 'Ctrl+N' },
    { label: 'Save', icon: 'save', group: 'File', shortcut: 'Ctrl+S' },
    { label: 'Settings', icon: 'settings', group: 'Preferences' },
  ],
  onSelect: (item) => console.log('Selected:', item.label),
  onClose: () => setVisible(false),
});
document.body.appendChild(cmd);

// Open with Ctrl+K
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'k') { e.preventDefault(); setVisible(true); }
});`,
    },
  ],
};
