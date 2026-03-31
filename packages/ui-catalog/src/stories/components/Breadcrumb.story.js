import { Breadcrumb } from '@decantr/ui/components';

const sampleItems = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Widget', href: '/products/widget' },
];

const longItems = [
  { label: 'Home', href: '/' },
  { label: 'Category', href: '/category' },
  { label: 'Subcategory', href: '/category/sub' },
  { label: 'Section', href: '/category/sub/section' },
  { label: 'Current Page' },
];

export default {
  component: (props) => Breadcrumb({ ...props, items: props._items || sampleItems }),
  title: 'Breadcrumb',
  category: 'components/original',
  description: 'Navigation breadcrumbs with separator options, collapsible overflow, and icon support.',
  variants: [
    { name: 'Default', props: { _items: sampleItems } },
    { name: 'Slash Separator', props: { _items: sampleItems, separator: 'slash' } },
    { name: 'Dot Separator', props: { _items: sampleItems, separator: 'dot' } },
    { name: 'Size SM', props: { _items: sampleItems, size: 'sm' } },
    { name: 'Size LG', props: { _items: sampleItems, size: 'lg' } },
    { name: 'Collapsed', props: { _items: longItems, maxItems: 3 } },
    { name: 'With Icons', props: { _items: [{ label: 'Home', href: '/', icon: 'home' }, { label: 'Settings', href: '/settings', icon: 'settings' }, { label: 'Profile' }] } },
    { name: 'Disabled Item', props: { _items: [{ label: 'Home', href: '/' }, { label: 'Archived', disabled: true }, { label: 'Current' }] } },
  ],
  playground: {
    defaults: { _items: sampleItems, separator: 'chevron' },
    controls: [
      { name: 'separator', type: 'select', options: ['chevron', 'slash', 'dot'] },
      { name: 'size', type: 'select', options: ['default', 'sm', 'lg'] },
      { name: 'maxItems', type: 'number' },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { Breadcrumb } from '@decantr/ui/components';

const bc = Breadcrumb({
  items: [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Widget' },
  ],
  separator: 'chevron',
});
document.body.appendChild(bc);`,
    },
  ],
};
