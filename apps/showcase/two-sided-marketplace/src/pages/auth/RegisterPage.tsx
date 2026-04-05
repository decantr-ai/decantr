import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AuthForm, Field } from '@/components/AuthForm';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <AuthForm
      title="Create your account"
      subtitle="Book stays or host your space — both sides welcome"
      onSubmit={e => { e.preventDefault(); register(email, password, name); navigate('/verify-email'); }}
      submitLabel="Create account"
      footer={<>Have one? <Link to="/login" style={{ color: 'var(--d-primary)' }}>Sign in</Link></>}
    >
      <Field label="Full name">
        <div style={{ position: 'relative' }}>
          <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--d-text-muted)' }} />
          <input className="nm-input" value={name} onChange={e => setName(e.target.value)} style={{ paddingLeft: 36 }} required />
        </div>
      </Field>
      <Field label="Email">
        <div style={{ position: 'relative' }}>
          <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--d-text-muted)' }} />
          <input className="nm-input" type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ paddingLeft: 36 }} required />
        </div>
      </Field>
      <Field label="Password" hint="At least 8 characters">
        <div style={{ position: 'relative' }}>
          <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--d-text-muted)' }} />
          <input className="nm-input" type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingLeft: 36 }} minLength={8} required />
        </div>
      </Field>
    </AuthForm>
  );
}
