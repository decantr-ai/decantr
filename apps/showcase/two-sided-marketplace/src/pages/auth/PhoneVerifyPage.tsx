import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone } from 'lucide-react';
import { AuthForm, Field } from '@/components/AuthForm';

export function PhoneVerifyPage() {
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();
  return (
    <AuthForm
      title="Verify your phone"
      subtitle="We'll text you a code to confirm"
      onSubmit={e => { e.preventDefault(); navigate('/mfa-verify'); }}
      submitLabel="Send code"
    >
      <Field label="Phone number">
        <div style={{ position: 'relative' }}>
          <Phone size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--d-text-muted)' }} />
          <input className="nm-input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 555 123 4567" style={{ paddingLeft: 36 }} required />
        </div>
      </Field>
    </AuthForm>
  );
}
