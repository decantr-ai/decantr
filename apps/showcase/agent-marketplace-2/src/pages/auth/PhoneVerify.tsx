import { AuthForm, FormField, AuthLink } from '../../components/AuthForm';

export function PhoneVerify() {
  return (
    <AuthForm
      title="Verify Phone"
      description="Enter the SMS code sent to your phone."
      submitLabel="Verify Phone"
      footer={
        <>
          Didn't receive it?{' '}
          <AuthLink to="/phone-verify">Resend code</AuthLink>
        </>
      }
    >
      <FormField label="Phone Number" type="tel" placeholder="+1 (555) 000-0000" />
      <FormField label="SMS Code" placeholder="Enter 6-digit code" />
    </AuthForm>
  );
}
