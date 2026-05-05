import { css } from '@decantr/css';
import { useNavigate } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { useState } from 'react';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigate('/login');
  }

  return (
    <div className="d-surface carbon-card carbon-fade-slide" style={{ padding: '2rem' }}>
      <div className={css('_flex _col _aic _gap1')} style={{ marginBottom: '1.5rem' }}>
        <Layers size={24} style={{ color: 'var(--d-accent)', marginBottom: '0.5rem' }} />
        <h1 className={css('_fontsemi _textxl')}>Set new password</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Choose a strong password for your account</p>
      </div>

      <form onSubmit={handleSubmit} className={css('_flex _col _gap4')} role="form">
        <div className={css('_flex _col _gap1')}>
          <label className={css('_textsm _fontmedium')}>New Password</label>
          <input className="d-control carbon-input" type="password" placeholder="Enter new password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <div className={css('_flex _col _gap1')}>
          <label className={css('_textsm _fontmedium')}>Confirm Password</label>
          <input className="d-control carbon-input" type="password" placeholder="Confirm new password" value={confirm} onChange={e => setConfirm(e.target.value)} />
        </div>
        <button className="d-interactive" data-variant="primary" type="submit" style={{ width: '100%', justifyContent: 'center' }}>
          Reset Password
        </button>
      </form>
    </div>
  );
}
