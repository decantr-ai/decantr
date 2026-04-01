import { Banner } from '@decantr/ui/components';

export default {
  component: (props) => Banner(props, props._content || 'This is a banner message.'),
  title: 'Banner',
  category: 'components/feedback',
  description: 'Full-width announcement bar for cookie consent, maintenance notices, and promotions.',
  variants: [
    { name: 'Info', props: { variant: 'info' } },
    { name: 'Success', props: { variant: 'success', _content: 'Changes saved successfully!' } },
    { name: 'Warning', props: { variant: 'warning', _content: 'Scheduled maintenance tonight.' } },
    { name: 'Error', props: { variant: 'error', _content: 'Service temporarily unavailable.' } },
    { name: 'With Icon', props: { variant: 'info', icon: '\u2139\uFE0F' } },
    { name: 'Dismissible', props: { variant: 'info', dismissible: true } },
    { name: 'Sticky Top', props: { variant: 'warning', sticky: 'top', _content: 'Pinned to top.' } },
    { name: 'Sticky Bottom', props: { variant: 'info', sticky: 'bottom', _content: 'Pinned to bottom.' } },
    { name: 'With Action', props: { variant: 'info', action: 'Learn more', _content: 'We use cookies.' } },
    { name: 'Dismissible + Icon', props: { variant: 'success', icon: '\u2705', dismissible: true, _content: 'Done!' } },
  ],
  playground: {
    defaults: { variant: 'info', _content: 'This is a banner message.' },
    controls: [
      { name: 'variant', type: 'select', options: ['info', 'success', 'warning', 'error'] },
      { name: 'dismissible', type: 'boolean' },
      { name: 'sticky', type: 'select', options: ['false', 'top', 'bottom'] },
      { name: 'icon', type: 'text' },
      { name: 'action', type: 'text' },
      { name: '_content', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Cookie consent banner',
      code: `import { Banner } from '@decantr/ui/components';

const banner = Banner(
  { variant: 'info', dismissible: true, action: 'Accept' },
  'We use cookies to improve your experience.'
);
document.body.prepend(banner);`,
    },
    {
      title: 'Error notification',
      code: `import { Banner } from '@decantr/ui/components';

const banner = Banner(
  { variant: 'error', icon: '\u26A0\uFE0F' },
  'Service is currently unavailable.'
);`,
    },
  ],
};
