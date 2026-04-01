import { AuthForm } from '../components/AuthForm';

export function PhoneVerifyPage() {
  return (
    <AuthForm
      title="Verify Phone Number"
      description="Enter the code we sent to your phone"
      fields={[
        { id: 'phone-code', label: 'SMS Code', type: 'text', placeholder: '000000' },
      ]}
      submitLabel="Verify Phone"
      secondaryLink={{ to: '/login', label: 'Back to sign in' }}
    />
  );
}
