import { BrowserFrame } from '@decantr/ui/components';
import { h } from '@decantr/ui/core';

function sampleContent(text) {
  return h('div', { style: { padding: '24px', textAlign: 'center', color: '#666' } }, text || 'Page content goes here');
}

export default {
  component: (props) => BrowserFrame(props, sampleContent(props._content)),
  title: 'BrowserFrame',
  category: 'components/media',
  description: 'Decorative browser chrome wrapper with macOS-style title bar for showcasing demos.',
  variants: [
    { name: 'Default', props: {} },
    { name: 'With URL', props: { url: 'https://example.com' } },
    { name: 'Dashboard Preview', props: { url: 'https://app.decantr.dev/dashboard', _content: 'Dashboard Preview' } },
    { name: 'Landing Page', props: { url: 'https://mysite.com', _content: 'Landing Page Screenshot' } },
    { name: 'No URL', props: { _content: 'Untitled window' } },
    { name: 'Long URL', props: { url: 'https://app.example.com/settings/account/billing?tab=invoices' } },
  ],
  playground: {
    defaults: { url: 'https://example.com', _content: 'Page content goes here' },
    controls: [
      { name: 'url', type: 'text' },
      { name: '_content', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Basic browser frame',
      code: `import { BrowserFrame } from '@decantr/ui/components';
import { h } from '@decantr/ui/core';

const frame = BrowserFrame(
  { url: 'https://example.com' },
  h('div', { style: { padding: '24px' } }, 'Hello World')
);
document.body.appendChild(frame);`,
    },
    {
      title: 'Wrapping a screenshot',
      code: `import { BrowserFrame } from '@decantr/ui/components';
import { h } from '@decantr/ui/core';

const frame = BrowserFrame(
  { url: 'https://myapp.dev' },
  h('img', { src: '/screenshot.png', style: { width: '100%' } })
);`,
    },
  ],
};
