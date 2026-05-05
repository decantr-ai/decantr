import { css } from '@decantr/css';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login();
    navigate('/projects');
  };

  return (
    <div className={css('_flex _col _gap6')} style={{ padding: '2rem' }}>
      <div style={{ textAlign: 'center' }}>
        <div className={css('_flex _center')} style={{ marginBottom: '1rem' }}>
          <Sparkles size={28} style={{ color: 'var(--d-accent)' }} />
        </div>
        <h1 className={css('_fontsemi _textlg')}>Create an account</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>
          Join the portfolio
        </p>
      </div>

      <form onSubmit={handleSubmit} className={css('_flex _col _gap4')}>
        <div className={css('_flex _col _gap2')}>
          <label className={css('_textsm _fontmedium')} htmlFor="reg-name">Full Name</label>
          <input
            id="reg-name"
            type="text"
            className="d-control"
            placeholder="Alex Mercer"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>
        <div className={css('_flex _col _gap2')}>
          <label className={css('_textsm _fontmedium')} htmlFor="reg-email">Email</label>
          <input
            id="reg-email"
            type="email"
            className="d-control"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className={css('_flex _col _gap2')}>
          <label className={css('_textsm _fontmedium')} htmlFor="reg-password">Password</label>
          <input
            id="reg-password"
            type="password"
            className="d-control"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center' }}>
          Create Account
        </button>
      </form>

      <div className={css('_flex _center _textsm')} style={{ color: 'var(--d-text-muted)' }}>
        Already have an account?{' '}
        <a href="#/login" style={{ color: 'var(--d-primary)', textDecoration: 'none', marginLeft: '0.25rem' }}>Sign in</a>
      </div>
    </div>
  );
}
