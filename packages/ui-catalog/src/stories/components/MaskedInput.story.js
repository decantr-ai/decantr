import { MaskedInput } from '@decantr/ui/components';

export default {
  component: (props) => MaskedInput(props),
  title: 'MaskedInput',
  category: 'components/form',
  description: 'Format-masked text input for phone numbers, credit cards, dates, and custom patterns.',
  variants: [
    { name: 'Phone', props: { mask: '(###) ###-####' } },
    { name: 'Credit Card', props: { mask: '####-####-####-####' } },
    { name: 'Date', props: { mask: '##/##/####' } },
    { name: 'Time', props: { mask: '##:##' } },
    { name: 'Custom Placeholder', props: { mask: '(###) ###-####', placeholder: '*' } },
    { name: 'With Value', props: { mask: '(###) ###-####', value: '5551234567' } },
    { name: 'Disabled', props: { mask: '(###) ###-####', disabled: true } },
    { name: 'Readonly', props: { mask: '(###) ###-####', value: '5551234567', readonly: true } },
    { name: 'Error State', props: { mask: '(###) ###-####', error: 'Invalid phone number' } },
    { name: 'Letter Mask', props: { mask: 'AAA-####' } },
    { name: 'Alphanumeric', props: { mask: '***-***-***' } },
  ],
  playground: {
    defaults: { mask: '(###) ###-####' },
    controls: [
      { name: 'mask', type: 'text' },
      { name: 'placeholder', type: 'text' },
      { name: 'value', type: 'text' },
      { name: 'disabled', type: 'boolean' },
      { name: 'readonly', type: 'boolean' },
      { name: 'error', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Phone number input',
      code: `import { MaskedInput } from '@decantr/ui/components';

const phone = MaskedInput({
  mask: '(###) ###-####',
  onchange: (raw) => console.log('Digits:', raw),
  oncomplete: (raw) => console.log('Complete:', raw),
});
document.body.appendChild(phone);`,
    },
    {
      title: 'Credit card input',
      code: `import { MaskedInput } from '@decantr/ui/components';

const card = MaskedInput({
  mask: '####-####-####-####',
  placeholder: '_',
});`,
    },
  ],
};
