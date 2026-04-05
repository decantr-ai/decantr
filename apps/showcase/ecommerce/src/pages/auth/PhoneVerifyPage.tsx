import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthForm, Field } from '@/components/AuthForm';

export function PhoneVerifyPage() {
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();
  return (
    <AuthForm
      title="Verify your phone"
      subtitle="We'll text you a code to confirm your number"
      onSubmit={e => { e.preventDefault(); navigate('/mfa-verify'); }}
      submitLabel="Send code"
      footer={<Link to="/shop" style={{ color: 'var(--d-primary)' }}>Skip for now</Link>}
    >
      <Field label="Phone number" hint="Standard rates may apply">
        <input className="ec-input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 123-4567" required />
      </Field>
    </AuthForm>
  );
}
