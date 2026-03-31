import { Menu } from '@decantr/ui/components';

const sampleItems = [
  { label: 'Dashboard', value: 'dashboard', icon: 'layout-dashboard' },
  { label: 'Profile', value: 'profile', icon: 'user' },
  { separator: true },
  { group: 'Settings' },
  { label: 'General', value: 'general', icon: 'settings' },
  { label: 'Security', value: 'security', icon: 'shield' },
  { label: 'Notifications', value: 'notifications', icon: 'bell', disabled: true },
];

const submenuItems = [
  { label: 'Home', value: 'home', icon: 'home' },
  {
    label: 'Products',
    value: 'products',
    icon: 'package',
    children: [
      { label: 'All Products', value: 'all-products' },
      { label: 'Categories', value: 'categories' },
      { label: 'Inventory', value: 'inventory' },
    ],
  },
  { label: 'Orders', value: 'orders', icon: 'shopping-cart' },
];

const menubarMenus = [
  {
    label: 'File',
    items: [
      { label: 'New', value: 'new' },
      { label: 'Open', value: 'open' },
      { separator: true },
      { label: 'Save', value: 'save' },
      { label: 'Save As...', value: 'save-as' },
    ],
  },
  {
    label: 'Edit',
    items: [
      { label: 'Undo', value: 'undo' },
      { label: 'Redo', value: 'redo', disabled: true },
      { separator: true },
      { label: 'Cut', value: 'cut' },
      { label: 'Copy', value: 'copy' },
      { label: 'Paste', value: 'paste' },
    ],
  },
];

export default {
  component: (props) => {
    if (props._variant === 'menubar') {
      return Menu.Bar({ menus: menubarMenus, class: props.class });
    }
    return Menu({
      items: props._items || sampleItems,
      selected: props.selected,
      collapsed: props.collapsed,
      class: props.class,
    });
  },
  title: 'Menu',
  category: 'components/navigation',
  description: 'Vertical navigation menu with items, groups, submenus, separators, and a horizontal menubar variant.',
  variants: [
    { name: 'Default', props: { _items: sampleItems } },
    { name: 'Selected', props: { _items: sampleItems, selected: 'profile' } },
    { name: 'Collapsed', props: { _items: sampleItems, collapsed: true } },
    { name: 'With Submenu', props: { _items: submenuItems } },
    { name: 'Menubar', props: { _variant: 'menubar' } },
  ],
  playground: {
    defaults: { selected: 'dashboard', collapsed: false },
    controls: [
      { name: 'selected', type: 'select', options: ['dashboard', 'profile', 'general', 'security', 'notifications'] },
      { name: 'collapsed', type: 'boolean' },
    ],
  },
  usage: [
    {
      title: 'Basic menu',
      code: `import { Menu } from '@decantr/ui/components';

const menu = Menu({
  items: [
    { label: 'Dashboard', value: 'dashboard', icon: 'layout-dashboard' },
    { label: 'Profile', value: 'profile', icon: 'user' },
    { separator: true },
    { label: 'Settings', value: 'settings', icon: 'settings' },
  ],
  selected: 'dashboard',
  onSelect: (value) => console.log('Selected:', value),
});
document.body.appendChild(menu);`,
    },
    {
      title: 'Menubar',
      code: `import { Menu } from '@decantr/ui/components';

const bar = Menu.Bar({
  menus: [
    { label: 'File', items: [{ label: 'New' }, { label: 'Open' }] },
    { label: 'Edit', items: [{ label: 'Undo' }, { label: 'Redo' }] },
  ],
});
document.body.appendChild(bar);`,
    },
  ],
};
