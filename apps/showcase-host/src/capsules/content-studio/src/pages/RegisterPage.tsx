import { css } from '@decantr/css';
import { BookOpen } from 'lucide-react';
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
    navigate('/articles');
  };

  return (
    <div className={css('_flex _col _gap6')} style={{ padding: '2rem' }}>
      <div style={{ textAlign: 'center' }}>
        <div className={css('_flex _center')} style={{ marginBottom: '1rem' }}>
          <BookOpen size={28} style={{ color: 'var(--d-accent)' }} />
        </div>
        <h1 style={{ fontWeight: 600, fontSize: '1.25rem' }}>Create your account</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginTop: '0.25rem', fontFamily: 'system-ui, sans-serif' }}>
          Join The Paragraph community
        </p>
      </div>

      <form onSubmit={handleSubmit} className={css('_flex _col _gap4')}>
        <div className={css('_flex _col _gap2')}>
          <label className={css('_textsm _fontmedium')} htmlFor="reg-name" style={{ fontFamily: 'system-ui, sans-serif' }}>Name</label>
          <input id="reg-name" type="text" className="d-control" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} style={{ fontFamily: 'system-ui, sans-serif' }} />
        </div>
        <div className={css('_flex _col _gap2')}>
          <label className={css('_textsm _fontmedium')} htmlFor="reg-email" style={{ fontFamily: 'system-ui, sans-serif' }}>Email</label>
          <input id="reg-email" type="email" className="d-control" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ fontFamily: 'system-ui, sans-serif' }} />
        </div>
        <div className={css('_flex _col _gap2')}>
          <label className={css('_textsm _fontmedium')} htmlFor="reg-password" style={{ fontFamily: 'system-ui, sans-serif' }}>Password</label>
          <input id="reg-password" type="password" className="d-control" placeholder="Choose a password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ fontFamily: 'system-ui, sans-serif' }} />
        </div>
        <button type="submit" className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
          Create Account
        </button>
      </form>

      <p className={css('_textsm')} style={{ textAlign: 'center', color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>
        Already have an account? <a href="#/login" style={{ color: 'var(--d-accent)', textDecoration: 'none' }}>Sign in</a>
      </p>
    </div>
  );
}
