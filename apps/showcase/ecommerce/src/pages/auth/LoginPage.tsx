import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AuthForm, Field } from '@/components/AuthForm';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('maya@vinea.shop');
  const [password, setPassword] = useState('');

  return (
    <AuthForm
      title="Welcome back"
      subtitle="Sign in to continue shopping"
      onSubmit={e => { e.preventDefault(); login(email, password); navigate('/shop'); }}
      submitLabel="Sign in"
      footer={<>New here? <Link to="/register" style={{ color: 'var(--d-primary)' }}>Create an account</Link></>}
    >
      <Field label="Email">
        <div style={{ position: 'relative' }}>
          <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--d-text-muted)' }} />
          <input className="ec-input" type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ paddingLeft: 36 }} required />
        </div>
      </Field>
      <Field label="Password">
        <div style={{ position: 'relative' }}>
          <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--d-text-muted)' }} />
          <input className="ec-input" type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingLeft: 36 }} required />
        </div>
      </Field>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--d-text-muted)' }}>
          <input type="checkbox" /> Remember me
        </label>
        <Link to="/forgot-password" style={{ color: 'var(--d-primary)' }}>Forgot?</Link>
      </div>
    </AuthForm>
  );
}
