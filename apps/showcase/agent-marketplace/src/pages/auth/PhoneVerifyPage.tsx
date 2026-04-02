import { AuthForm } from '../../components/AuthForm';

export function PhoneVerifyPage() {
  return (
    <AuthForm
      title="Phone Verification"
      description="Enter the code sent to your phone number."
      fields={[
        { name: 'code', label: 'SMS Code', type: 'text', placeholder: '000000' },
      ]}
      submitLabel="Verify Phone"
      secondaryLink={{ label: 'Resend code', to: '/phone-verify' }}
    />
  );
}
