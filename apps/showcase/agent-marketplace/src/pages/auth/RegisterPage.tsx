import { css } from '@decantr/css';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Github, Mail } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../App';

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login();
    navigate('/agents');
  }

  return (
    <div className="d-surface carbon-card carbon-fade-slide" style={{ padding: '2rem' }}>
      <div className={css('_flex _col _aic _gap1')} style={{ marginBottom: '1.5rem' }}>
        <Zap size={24} style={{ color: 'var(--d-accent)', marginBottom: '0.5rem' }} />
        <h1 className={css('_fontsemi _textxl')}>Create your account</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Deploy your first autonomous agent</p>
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
          <label className={css('_textsm _fontmedium')}>Name</label>
          <input className="d-control carbon-input" type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className={css('_flex _col _gap1')}>
          <label className={css('_textsm _fontmedium')}>Email</label>
          <input className="d-control carbon-input" type="email" placeholder="operator@company.dev" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className={css('_flex _col _gap1')}>
          <label className={css('_textsm _fontmedium')}>Password</label>
          <input className="d-control carbon-input" type="password" placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button className="d-interactive neon-glow-hover" data-variant="primary" type="submit" style={{ width: '100%', justifyContent: 'center' }}>
          Activate Account
        </button>
      </form>

      <p className={css('_textsm _textc')} style={{ color: 'var(--d-text-muted)', marginTop: '1.5rem' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--d-accent)', textDecoration: 'none' }}>Log in</Link>
      </p>
    </div>
  );
}
