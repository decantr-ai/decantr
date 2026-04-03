import { css } from '@decantr/css';
import { useNavigate, Link } from 'react-router-dom';
import { Layers, Github, Mail } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('designer@spatialops.io');
  const [password, setPassword] = useState('password');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login();
    navigate('/');
  }

  return (
    <div className="d-surface carbon-card carbon-fade-slide" style={{ padding: '2rem' }}>
      <div className={css('_flex _col _aic _gap1')} style={{ marginBottom: '1.5rem' }}>
        <Layers size={24} style={{ color: 'var(--d-accent)', marginBottom: '0.5rem' }} />
        <h1 className={css('_fontsemi _textxl')}>Welcome back</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Sign in to your spatial workspace</p>
      </div>

      <div className={css('_flex _col _gap2')} style={{ marginBottom: '1.5rem' }}>
        <button className="d-interactive" data-variant="ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={handleSubmit}>
          <Github size={16} /> Continue with GitHub
        </button>
        <button className="d-interactive" data-variant="ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={handleSubmit}>
          <Mail size={16} /> Continue with Google
        </button>
      </div>

      <div className={css('_flex _aic _gap3')} style={{ marginBottom: '1.5rem' }}>
        <hr className="carbon-divider" style={{ flex: 1 }} />
        <span className={css('_textxs')} style={{ color: 'var(--d-text-muted)' }}>OR</span>
        <hr className="carbon-divider" style={{ flex: 1 }} />
      </div>

      <form onSubmit={handleSubmit} className={css('_flex _col _gap4')} role="form">
        <div className={css('_flex _col _gap1')}>
          <label className={css('_textsm _fontmedium')}>Email</label>
          <input className="d-control carbon-input" type="email" placeholder="designer@spatialops.io" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className={css('_flex _col _gap1')}>
          <div className={css('_flex _jcsb _aic')}>
            <label className={css('_textsm _fontmedium')}>Password</label>
            <Link to="/forgot-password" className={css('_textxs')} style={{ color: 'var(--d-accent)', textDecoration: 'none' }}>Forgot password?</Link>
          </div>
          <input className="d-control carbon-input" type="password" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button className="d-interactive" data-variant="primary" type="submit" style={{ width: '100%', justifyContent: 'center' }}>
          Log In
        </button>
      </form>

      <p className={css('_textsm _textc')} style={{ color: 'var(--d-text-muted)', marginTop: '1.5rem' }}>
        No account? <Link to="/register" style={{ color: 'var(--d-accent)', textDecoration: 'none' }}>Create your workspace</Link>
      </p>
    </div>
  );
}
