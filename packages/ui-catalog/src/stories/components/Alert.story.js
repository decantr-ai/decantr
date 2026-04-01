import { Alert } from '@decantr/ui/components';

export default {
  component: (props) => Alert(props, props._content || 'This is an alert message.'),
  title: 'Alert',
  category: 'components/original',
  description: 'Feedback banner for info, success, warning, and error messages.',
  variants: [
    { name: 'Info', props: { variant: 'info', _content: 'This is an informational message.' } },
    { name: 'Success', props: { variant: 'success', _content: 'Operation completed successfully.' } },
    { name: 'Warning', props: { variant: 'warning', _content: 'Please review before proceeding.' } },
    { name: 'Error', props: { variant: 'error', _content: 'Something went wrong. Please try again.' } },
    { name: 'Dismissible', props: { variant: 'info', dismissible: true, _content: 'You can dismiss this alert.' } },
    { name: 'With Icon', props: { variant: 'success', icon: '\u2713', _content: 'Changes saved.' } },
    { name: 'Dismissible Warning', props: { variant: 'warning', dismissible: true, _content: 'Your session will expire soon.' } },
  ],
  playground: {
    defaults: { variant: 'info', _content: 'Alert message here.' },
    controls: [
      { name: 'variant', type: 'select', options: ['info', 'success', 'warning', 'error'] },
      { name: '_content', type: 'text' },
      { name: 'dismissible', type: 'boolean' },
      { name: 'icon', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { Alert } from '@decantr/ui/components';

const alert = Alert({ variant: 'success', dismissible: true }, 'File uploaded!');
document.body.appendChild(alert);`,
    },
    {
      title: 'With EssenceProvider',
      code: `import { mount } from '@decantr/ui/runtime'
import { EssenceProvider } from '@decantr/ui/essence'
import { Alert } from '@decantr/ui/components'
import essence from './essence.json'

mount(root, () =>
  EssenceProvider({ essence },
    Alert({ variant: 'success' }, 'Themed Alert')
  )
)`,
    },
  ],
};
