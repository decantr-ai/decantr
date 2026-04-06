import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'register') {
      register(email, password, name);
    } else {
      login(email, password);
    }
    navigate('/team');
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 'var(--d-radius)',
          background: 'linear-gradient(135deg, var(--d-primary), var(--d-accent))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem',
        }}>
          <Trophy size={24} color="#fff" />
        </div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>
          {mode === 'login' ? 'Welcome back, Coach' : 'Join the Team'}
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>
          {mode === 'login' ? 'Access your operations hub' : 'Create your staff account'}
        </p>
      </div>

      {mode === 'register' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>Display Name</label>
          <input
            className="d-control"
            type="text"
            placeholder="Coach Viper"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>Email</label>
        <input
          className="d-control"
          type="email"
          placeholder="coach@shadowlegion.gg"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>Password</label>
          {mode === 'login' && (
            <Link to="/forgot-password" style={{ fontSize: '0.75rem', color: 'var(--d-primary)', textDecoration: 'none' }}>
              Forgot?
            </Link>
          )}
        </div>
        <input
          className="d-control"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </div>

      <button className="d-interactive" data-variant="primary" type="submit" style={{ width: '100%', justifyContent: 'center' }}>
        {mode === 'login' ? 'Sign In' : 'Create Account'}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ flex: 1, height: 1, background: 'var(--d-border)' }} />
        <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>or continue with</span>
        <div style={{ flex: 1, height: 1, background: 'var(--d-border)' }} />
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button className="d-interactive" type="button" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSubmit}>
          Google
        </button>
        <button className="d-interactive" type="button" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSubmit}>
          Discord
        </button>
      </div>

      <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>
        {mode === 'login' ? (
          <>New to the team? <Link to="/register" style={{ color: 'var(--d-primary)', textDecoration: 'none' }}>Create account</Link></>
        ) : (
          <>Already have an account? <Link to="/login" style={{ color: 'var(--d-primary)', textDecoration: 'none' }}>Sign in</Link></>
        )}
      </div>
    </form>
  );
}
