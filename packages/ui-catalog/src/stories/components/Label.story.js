import { Label } from '@decantr/ui/components';

export default {
  component: (props) => Label(props, props._content || 'Form Label'),
  title: 'Label',
  category: 'components/form',
  description: 'Form label with optional required indicator and htmlFor association.',
  variants: [
    { name: 'Default', props: {} },
    { name: 'Required', props: { required: true } },
    { name: 'With For', props: { for: 'email-input', _content: 'Email Address' } },
    { name: 'Custom Text', props: { _content: 'Username' } },
    { name: 'Required Custom', props: { required: true, _content: 'Password' } },
  ],
  playground: {
    defaults: { _content: 'Form Label' },
    controls: [
      { name: 'required', type: 'boolean' },
      { name: 'for', type: 'text' },
      { name: '_content', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { Label } from '@decantr/ui/components';

const label = Label({ for: 'email' }, 'Email Address');
document.body.appendChild(label);`,
    },
    {
      title: 'Required label',
      code: `import { Label } from '@decantr/ui/components';

const label = Label({ required: true, for: 'name' }, 'Full Name');`,
    },
  ],
};
