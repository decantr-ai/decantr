import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';
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
    navigate('/games');
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
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
          <Gamepad2 size={24} color="#fff" />
        </div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>
          {mode === 'login' ? 'Welcome back, warrior' : 'Join the guild'}
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>
          {mode === 'login' ? 'Enter the arena' : 'Create your legend'}
        </p>
      </div>

      {/* Fields */}
      {mode === 'register' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>Gamertag</label>
          <input
            className="d-control"
            type="text"
            placeholder="NightBlade"
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
          placeholder="warrior@guild.gg"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>Password</label>
        <input
          className="d-control"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </div>

      <button className="d-interactive" data-variant="primary" type="submit" style={{ width: '100%', justifyContent: 'center' }}>
        {mode === 'login' ? 'Enter Arena' : 'Claim Your Spot'}
      </button>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ flex: 1, height: 1, background: 'var(--d-border)' }} />
        <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>or continue with</span>
        <div style={{ flex: 1, height: 1, background: 'var(--d-border)' }} />
      </div>

      {/* OAuth */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button className="d-interactive" type="button" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSubmit}>
          Google
        </button>
        <button className="d-interactive" type="button" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSubmit}>
          Discord
        </button>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>
        {mode === 'login' ? (
          <>New recruit? <Link to="/register" style={{ color: 'var(--d-primary)', textDecoration: 'none' }}>Join the guild</Link></>
        ) : (
          <>Already a member? <Link to="/login" style={{ color: 'var(--d-primary)', textDecoration: 'none' }}>Enter arena</Link></>
        )}
      </div>
    </form>
  );
}
