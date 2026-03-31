import { Form, Field, Input, Button } from '@decantr/ui/components';

export default {
  component: (props) => {
    if (props._type === 'field') {
      return Field(
        { label: props._fieldLabel || 'Username', error: props._fieldError, help: props._fieldHelp, required: props._fieldRequired },
        Input({ placeholder: 'Enter username' })
      );
    }
    return Form(
      { layout: props.layout },
      Field({ label: 'Name', required: true }, Input({ placeholder: 'Full name' })),
      Field({ label: 'Email', help: 'We will never share your email' }, Input({ placeholder: 'you@example.com' })),
      Field({ label: 'Password', error: props._formError || undefined }, Input({ type: 'password', placeholder: 'Password' })),
      Form.Actions({}, Button({ variant: 'primary' }, 'Submit'), Button({}, 'Cancel'))
    );
  },
  title: 'Form',
  category: 'components/form',
  description: 'Form container with vertical/horizontal/inline layouts, and Field wrapper for label, error, and help text.',
  variants: [
    { name: 'Vertical Layout', props: { layout: 'vertical' } },
    { name: 'Horizontal Layout', props: { layout: 'horizontal' } },
    { name: 'Inline Layout', props: { layout: 'inline' } },
    { name: 'With Error', props: { layout: 'vertical', _formError: 'Password is required' } },
    { name: 'Field Only', props: { _type: 'field', _fieldLabel: 'Username' } },
    { name: 'Field With Error', props: { _type: 'field', _fieldLabel: 'Email', _fieldError: 'Invalid email address' } },
    { name: 'Field With Help', props: { _type: 'field', _fieldLabel: 'Bio', _fieldHelp: 'Brief description about yourself' } },
    { name: 'Field Required', props: { _type: 'field', _fieldLabel: 'Name', _fieldRequired: true } },
  ],
  playground: {
    defaults: { layout: 'vertical' },
    controls: [
      { name: 'layout', type: 'select', options: ['vertical', 'horizontal', 'inline'] },
      { name: '_formError', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Basic form',
      code: `import { Form, Field, Input, Button } from '@decantr/ui/components';

const form = Form({ layout: 'vertical', onSubmit: (e) => console.log('submit') },
  Field({ label: 'Email', required: true },
    Input({ placeholder: 'you@example.com' })
  ),
  Form.Actions({},
    Button({ variant: 'primary' }, 'Submit')
  )
);
document.body.appendChild(form);`,
    },
    {
      title: 'Field with error',
      code: `import { Field, Input } from '@decantr/ui/components';

const field = Field({
  label: 'Email',
  error: 'Please enter a valid email',
  required: true
}, Input({ placeholder: 'you@example.com' }));`,
    },
  ],
};
