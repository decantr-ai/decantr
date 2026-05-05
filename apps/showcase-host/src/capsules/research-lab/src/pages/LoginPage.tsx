import { css } from '@decantr/css';
import { FlaskConical } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login();
    navigate('/notebook');
  };

  return (
    <div className={css('_flex _col _gap6')} style={{ padding: '2rem' }}>
      <div style={{ textAlign: 'center' }}>
        <div className={css('_flex _center')} style={{ marginBottom: '0.75rem' }}>
          <FlaskConical size={24} style={{ color: 'var(--d-primary)' }} />
        </div>
        <h1 style={{ fontWeight: 500, fontSize: '1.125rem' }}>Sign in to Research Lab</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>
          Access your electronic lab notebook
        </p>
      </div>

      <form onSubmit={handleSubmit} className={css('_flex _col _gap4')}>
        <div className={css('_flex _col _gap2')}>
          <label className={css('_textsm _fontmedium')} htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            className="d-control"
            placeholder="researcher@lab.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ borderRadius: 2 }}
            autoFocus
          />
        </div>
        <div className={css('_flex _col _gap2')}>
          <label className={css('_textsm _fontmedium')} htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            className="d-control"
            placeholder="Enter any password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ borderRadius: 2 }}
          />
        </div>
        <button type="submit" className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center', borderRadius: 2 }}>
          Sign In
        </button>
      </form>

      <div className={css('_flex _aic _gap3')}>
        <div style={{ flex: 1, height: 1, background: 'var(--d-border)' }} />
        <span style={{ color: 'var(--d-text-muted)', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or</span>
        <div style={{ flex: 1, height: 1, background: 'var(--d-border)' }} />
      </div>

      <button
        className="d-interactive"
        style={{ width: '100%', justifyContent: 'center', borderRadius: 2 }}
        onClick={() => { login(); navigate('/notebook'); }}
        type="button"
      >
        Continue with Institutional SSO
      </button>

      <div className={css('_flex _jcsb _textsm')} style={{ color: 'var(--d-text-muted)' }}>
        <a href="#/register" style={{ color: 'var(--d-primary)', textDecoration: 'none', fontSize: '0.8125rem' }}>Create account</a>
        <a href="#/forgot-password" style={{ color: 'var(--d-text-muted)', textDecoration: 'none', fontSize: '0.8125rem' }}>Forgot password?</a>
      </div>
    </div>
  );
}
