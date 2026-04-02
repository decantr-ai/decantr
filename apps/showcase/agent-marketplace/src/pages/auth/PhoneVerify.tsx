import { AuthForm } from '../../components/AuthForm';

export function PhoneVerify() {
  return (
    <AuthForm
      title="Phone Verification"
      description="Enter the code sent to your phone number."
      fields={[
        { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+1 (555) 000-0000', required: true },
        { name: 'code', label: 'Verification Code', type: 'text', placeholder: '000000', required: true },
      ]}
      submitLabel="Verify Phone"
      footerLinks={[
        { label: 'Resend code', to: '/phone-verify' },
        { label: 'Back to sign in', to: '/login' },
      ]}
    />
  );
}
