import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cloud } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === 'login') {
      login(email, password);
    } else {
      register(email, password, name);
    }
    navigate('/apps');
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        <Cloud size={32} style={{ color: 'var(--d-primary)', margin: '0 auto 0.75rem' }} />
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
          {mode === 'login' ? 'Sign in to CloudDeck' : 'Create your account'}
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>
          {mode === 'login' ? 'Deploy and manage your infrastructure' : 'Start deploying in minutes'}
        </p>
      </div>

      {/* OAuth */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="button" className="d-interactive" style={{ flex: 1, justifyContent: 'center', padding: '0.5rem' }}>
          GitHub
        </button>
        <button type="button" className="d-interactive" style={{ flex: 1, justifyContent: 'center', padding: '0.5rem' }}>
          Google
        </button>
      </div>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ flex: 1, height: 1, background: 'var(--d-border)' }} />
        <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>or continue with email</span>
        <div style={{ flex: 1, height: 1, background: 'var(--d-border)' }} />
      </div>

      {/* Fields */}
      {mode === 'register' && (
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Name</label>
          <input className="d-control" type="text" placeholder="Sarah Chen" value={name} onChange={e => setName(e.target.value)} />
        </div>
      )}
      <div>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Email</label>
        <input className="d-control" type="email" placeholder="you@company.io" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Password</label>
        <input className="d-control" type="password" placeholder="********" value={password} onChange={e => setPassword(e.target.value)} />
      </div>

      <button className="lp-button-primary" type="submit" style={{ width: '100%', justifyContent: 'center', marginTop: '0.25rem' }}>
        {mode === 'login' ? 'Sign In' : 'Create Account'}
      </button>

      {/* Footer */}
      <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>
        {mode === 'login' ? (
          <>Don't have an account? <a href="#/register" style={{ color: 'var(--d-accent)' }}>Register</a></>
        ) : (
          <>Already have an account? <a href="#/login" style={{ color: 'var(--d-accent)' }}>Sign in</a></>
        )}
      </p>
    </form>
  );
}
