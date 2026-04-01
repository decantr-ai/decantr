import { SkipLink } from '@decantr/ui/components';
import { h } from '@decantr/ui/core';

export default {
  component: (props) => {
    const wrapper = h('div', { style: { position: 'relative', minHeight: '60px' } });
    wrapper.appendChild(SkipLink(props));
    wrapper.appendChild(h('p', { style: { color: '#999', fontStyle: 'italic', marginTop: '8px' } }, 'Tab into this area to see the skip link appear.'));
    return wrapper;
  },
  title: 'SkipLink',
  category: 'components/utility',
  description: 'Accessible skip navigation link, visually hidden by default and visible on keyboard focus.',
  variants: [
    { name: 'Default', props: {} },
    { name: 'Custom Target', props: { target: '#content' } },
    { name: 'Custom Label', props: { label: 'Skip to navigation' } },
    { name: 'Skip to Footer', props: { target: '#footer', label: 'Skip to footer' } },
  ],
  playground: {
    defaults: { target: '#main-content', label: 'Skip to main content' },
    controls: [
      { name: 'target', type: 'text' },
      { name: 'label', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Basic skip link',
      code: `import { SkipLink } from '@decantr/ui/components';

const skip = SkipLink({ target: '#main-content' });
document.body.prepend(skip);`,
    },
    {
      title: 'Multiple skip links',
      code: `import { SkipLink } from '@decantr/ui/components';
import { h } from '@decantr/ui/core';

const nav = h('div', null,
  SkipLink({ target: '#main', label: 'Skip to main content' }),
  SkipLink({ target: '#nav', label: 'Skip to navigation' }),
);
document.body.prepend(nav);`,
    },
  ],
};
