import { NavigationMenu } from '@decantr/ui/components';

const basicItems = [
  { label: 'Home', href: '#home' },
  {
    label: 'Products',
    children: [
      { label: 'Analytics', href: '#analytics', description: 'Track your metrics and KPIs' },
      { label: 'Integrations', href: '#integrations', description: 'Connect with third-party tools' },
      { label: 'Automation', href: '#automation', description: 'Streamline your workflows' },
    ],
  },
  {
    label: 'Resources',
    children: [
      { label: 'Documentation', href: '#docs', description: 'Guides and API reference' },
      { label: 'Blog', href: '#blog', description: 'Latest news and tutorials' },
    ],
  },
  { label: 'Pricing', href: '#pricing' },
];

const simpleItems = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

export default {
  component: (props) => NavigationMenu({
    items: props._items || basicItems,
    class: props.class,
  }),
  title: 'NavigationMenu',
  category: 'components/navigation',
  description: 'Horizontal navigation bar with hover-triggered dropdown panels supporting grid layouts and descriptions.',
  variants: [
    { name: 'Default', props: {} },
    { name: 'Simple Links', props: { _items: simpleItems } },
    { name: 'With Dropdowns', props: { _items: basicItems } },
  ],
  playground: {
    defaults: {},
    controls: [],
  },
  usage: [
    {
      title: 'Basic navigation menu',
      code: `import { NavigationMenu } from '@decantr/ui/components';

const nav = NavigationMenu({
  items: [
    { label: 'Home', href: '/' },
    {
      label: 'Products',
      children: [
        { label: 'Analytics', href: '/analytics', description: 'Track metrics' },
        { label: 'Integrations', href: '/integrations', description: 'Connect tools' },
      ],
    },
    { label: 'Pricing', href: '/pricing' },
  ],
});
document.body.appendChild(nav);`,
    },
    {
      title: 'Simple link navigation',
      code: `import { NavigationMenu } from '@decantr/ui/components';

const nav = NavigationMenu({
  items: [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
});`,
    },
  ],
};
