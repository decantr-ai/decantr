import { css } from '@decantr/css';
import { Scale } from 'lucide-react';
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
    navigate('/research');
  };

  return (
    <div className={css('_flex _col _gap6')} style={{ padding: '2rem' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="counsel-seal" style={{ margin: '0 auto 1rem', width: 44, height: 44, fontSize: '0.9375rem' }}>LR</div>
        <h1 className="counsel-header" style={{ fontSize: '1.25rem' }}>Welcome back</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginTop: '0.25rem', fontFamily: 'Georgia, serif' }}>
          Sign in to your legal workspace
        </p>
      </div>

      <form onSubmit={handleSubmit} className={css('_flex _col _gap4')}>
        <div className={css('_flex _col _gap2')}>
          <label className={css('_textsm _fontmedium')} htmlFor="login-email">Email</label>
          <input id="login-email" type="email" className="d-control" placeholder="attorney@firm.com" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
        </div>
        <div className={css('_flex _col _gap2')}>
          <label className={css('_textsm _fontmedium')} htmlFor="login-password">Password</label>
          <input id="login-password" type="password" className="d-control" placeholder="Enter any password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit" className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center' }}>
          Sign In
        </button>
      </form>

      <div className={css('_flex _aic _gap3')}>
        <div style={{ flex: 1, height: 1, background: 'var(--d-border)' }} />
        <span style={{ color: 'var(--d-text-muted)', fontSize: '0.75rem' }}>or continue with</span>
        <div style={{ flex: 1, height: 1, background: 'var(--d-border)' }} />
      </div>

      <button className="d-interactive" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { login(); navigate('/research'); }} type="button">
        <Scale size={16} /> SSO / SAML
      </button>

      <div className={css('_flex _jcsb _textsm')} style={{ color: 'var(--d-text-muted)' }}>
        <a href="#/register" style={{ color: 'var(--d-primary)', textDecoration: 'none' }}>Create account</a>
        <a href="#/forgot-password" style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Forgot password?</a>
      </div>
    </div>
  );
}
