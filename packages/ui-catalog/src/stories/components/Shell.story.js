import { Shell } from '@decantr/ui/components';

function renderShell(props) {
  const { _preset = 'sidebar-main', _showFooter, _showAside, ...rest } = props;
  const children = [
    Shell.Header({}, 'Header'),
    Shell.Nav({}, 'Nav'),
    Shell.Body({}, 'Main Content'),
  ];
  if (_showFooter) children.push(Shell.Footer({}, 'Footer'));
  if (_showAside) children.push(Shell.Aside({}, 'Aside'));
  const el = Shell({ config: _preset, ...rest }, ...children);
  el.style.height = '320px';
  el.style.border = '1px solid var(--d-clr-border, #ccc)';
  return el;
}

export default {
  component: renderShell,
  title: 'Shell',
  category: 'components/layout',
  description: 'Configurable grid layout system with named regions and 10 preset configurations. Supports sidebar, top-nav, centered, and custom layouts.',
  variants: [
    { name: 'Sidebar Main', props: { _preset: 'sidebar-main' } },
    { name: 'Sidebar Right', props: { _preset: 'sidebar-right' } },
    { name: 'Sidebar + Footer', props: { _preset: 'sidebar-main-footer', _showFooter: true } },
    { name: 'Sidebar + Aside', props: { _preset: 'sidebar-aside', _showAside: true } },
    { name: 'Top Nav', props: { _preset: 'top-nav-main' } },
    { name: 'Top Nav + Footer', props: { _preset: 'top-nav-footer', _showFooter: true } },
    { name: 'Centered', props: { _preset: 'centered' } },
    { name: 'Full Bleed', props: { _preset: 'full-bleed' } },
    { name: 'Minimal Header', props: { _preset: 'minimal-header' } },
    { name: 'Top Nav + Sidebar', props: { _preset: 'top-nav-sidebar' } },
    { name: 'Inset Mode', props: { _preset: 'sidebar-main', inset: true } },
  ],
  playground: {
    defaults: { _preset: 'sidebar-main' },
    controls: [
      { name: '_preset', type: 'select', options: ['sidebar-main', 'sidebar-right', 'sidebar-main-footer', 'sidebar-aside', 'top-nav-main', 'top-nav-footer', 'centered', 'full-bleed', 'minimal-header', 'top-nav-sidebar'] },
      { name: 'inset', type: 'boolean' },
      { name: '_showFooter', type: 'boolean' },
      { name: '_showAside', type: 'boolean' },
    ],
  },
  usage: [
    {
      title: 'Sidebar layout',
      code: `import { Shell } from '@decantr/ui/components';

const app = Shell({ config: 'sidebar-main' },
  Shell.Header({}, 'My App'),
  Shell.Nav({}, 'Navigation'),
  Shell.Body({}, 'Content')
);
document.body.appendChild(app);`,
    },
    {
      title: 'Top nav with footer',
      code: `import { Shell } from '@decantr/ui/components';

const app = Shell({ config: 'top-nav-footer' },
  Shell.Header({}, 'Header'),
  Shell.Body({}, 'Content'),
  Shell.Footer({}, 'Footer')
);`,
    },
  ],
};
