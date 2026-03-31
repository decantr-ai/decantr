import { InputOTP } from '@decantr/ui/components';

export default {
  component: (props) => InputOTP(props),
  title: 'InputOTP',
  category: 'components/form',
  description: 'One-time password input with individual digit slots, paste support, and keyboard navigation.',
  variants: [
    { name: 'Default (6 digits)', props: {} },
    { name: '4 Digits', props: { length: 4 } },
    { name: 'With Separator', props: { length: 6, separator: 3 } },
    { name: 'Masked', props: { masked: true } },
    { name: 'Pre-filled', props: { value: '123456' } },
    { name: 'With Label', props: { label: 'Verification Code' } },
    { name: 'With Help', props: { label: 'Enter OTP', help: 'Check your email for the code' } },
    { name: 'Error', props: { error: true, label: 'OTP' } },
    { name: 'Success', props: { success: true, value: '123456' } },
    { name: 'Disabled', props: { disabled: true } },
    { name: 'Size SM', props: { size: 'sm' } },
    { name: 'Size LG', props: { size: 'lg' } },
  ],
  playground: {
    defaults: { length: 6 },
    controls: [
      { name: 'length', type: 'number' },
      { name: 'masked', type: 'boolean' },
      { name: 'separator', type: 'number' },
      { name: 'disabled', type: 'boolean' },
      { name: 'error', type: 'boolean' },
      { name: 'success', type: 'boolean' },
      { name: 'size', type: 'select', options: ['default', 'sm', 'lg'] },
      { name: 'label', type: 'text' },
      { name: 'help', type: 'text' },
    ],
  },
  usage: [
    {
      title: 'Basic',
      code: `import { InputOTP } from '@decantr/ui/components';

const otp = InputOTP({
  length: 6,
  onComplete: (code) => console.log('Code:', code)
});
document.body.appendChild(otp);`,
    },
    {
      title: 'With separator and masking',
      code: `import { InputOTP } from '@decantr/ui/components';

const otp = InputOTP({
  length: 6,
  separator: 3,
  masked: true,
  label: 'Security Code'
});`,
    },
  ],
};
