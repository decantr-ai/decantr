import { AuthForm, AuthFooterLink } from '@/components/AuthForm';

export function PhoneVerifyPage() {
  return (
    <AuthForm
      title="Verify your phone"
      subtitle="We sent a code to +1 (•••) •••-4821"
      submitLabel="Verify"
      redirect="/agents"
      fields={[
        { name: 'code', label: 'SMS code', type: 'text', placeholder: '000000' },
      ]}
      footer={<AuthFooterLink prompt="Wrong number?" label="Update" to="/settings/security" />}
    />
  );
}
