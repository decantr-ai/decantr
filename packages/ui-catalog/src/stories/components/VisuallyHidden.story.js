import { VisuallyHidden } from '@decantr/ui/components';
import { h } from '@decantr/ui/core';

export default {
  component: (props) => {
    const wrapper = h('div', null);
    wrapper.appendChild(h('span', null, '[Visible label] '));
    wrapper.appendChild(VisuallyHidden(props, props._content || 'This text is only for screen readers'));
    wrapper.appendChild(h('span', { style: { color: '#999', fontStyle: 'italic', marginLeft: '8px' } }, '(hidden content exists in DOM)'));
    return wrapper;
  },
  title: 'VisuallyHidden',
  category: 'components/utility',
  description: 'Screen-reader-only content wrapper that is visually hidden but accessible to assistive technology.',
  variants: [
    { name: 'Default', props: { _content: 'Screen reader only text' } },
    { name: 'Form Label', props: { _content: 'Search the website' } },
    { name: 'Icon Description', props: { _content: 'Close dialog' } },
    { name: 'Status Message', props: { _content: '3 new notifications' } },
  ],
  playground: {
    defaults: { _content: 'This text is only for screen readers' },
    controls: [
      { name: '_content', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Accessible icon button',
      code: `import { VisuallyHidden } from '@decantr/ui/components';
import { h } from '@decantr/ui/core';

const btn = h('button', { type: 'button' },
  h('span', { 'aria-hidden': 'true' }, '\u2715'),
  VisuallyHidden({}, 'Close dialog')
);
document.body.appendChild(btn);`,
    },
    {
      title: 'Hidden form label',
      code: `import { VisuallyHidden } from '@decantr/ui/components';
import { h } from '@decantr/ui/core';

const label = h('label', null,
  VisuallyHidden({}, 'Search'),
  h('input', { type: 'search', placeholder: 'Search...' })
);`,
    },
  ],
};
