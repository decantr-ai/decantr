import { css } from '@decantr/css';
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
    navigate('/research');
  };

  return (
    <div className={css('_flex _col _gap6')} style={{ padding: '2rem' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 className="counsel-header" style={{ fontSize: '1.25rem' }}>Create your account</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginTop: '0.25rem', fontFamily: 'Georgia, serif' }}>
          Join the legal research platform
        </p>
      </div>
      <form onSubmit={handleSubmit} className={css('_flex _col _gap4')}>
        <div className={css('_flex _col _gap2')}>
          <label className={css('_textsm _fontmedium')} htmlFor="reg-name">Full Name</label>
          <input id="reg-name" type="text" className="d-control" placeholder="Jordan Chen" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>
        <div className={css('_flex _col _gap2')}>
          <label className={css('_textsm _fontmedium')} htmlFor="reg-email">Email</label>
          <input id="reg-email" type="email" className="d-control" placeholder="attorney@firm.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className={css('_flex _col _gap2')}>
          <label className={css('_textsm _fontmedium')} htmlFor="reg-password">Password</label>
          <input id="reg-password" type="password" className="d-control" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit" className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center' }}>
          Create Account
        </button>
      </form>
      <p className={css('_textsm')} style={{ textAlign: 'center', color: 'var(--d-text-muted)' }}>
        Already have an account? <a href="#/login" style={{ color: 'var(--d-primary)', textDecoration: 'none' }}>Sign in</a>
      </p>
    </div>
  );
}
