import { AuthForm, FormField, AuthLink } from '../../components/AuthForm';

export function ResetPassword() {
  return (
    <AuthForm
      title="Reset Password"
      description="Choose a new password for your account."
      submitLabel="Reset Password"
      footer={
        <>
          Back to{' '}
          <AuthLink to="/login">Sign in</AuthLink>
        </>
      }
    >
      <FormField label="New Password" type="password" placeholder="Enter new password" />
      <FormField label="Confirm Password" type="password" placeholder="Repeat new password" />
    </AuthForm>
  );
}
