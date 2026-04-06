import { css } from '@decantr/css';
import { FlaskConical } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/login');
  };

  return (
    <div className={css('_flex _col _gap6')} style={{ padding: '2rem' }}>
      <div style={{ textAlign: 'center' }}>
        <div className={css('_flex _center')} style={{ marginBottom: '0.75rem' }}>
          <FlaskConical size={24} style={{ color: 'var(--d-primary)' }} />
        </div>
        <h1 style={{ fontWeight: 500, fontSize: '1.125rem' }}>Set new password</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>
          Choose a strong password for your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className={css('_flex _col _gap4')}>
        <div className={css('_flex _col _gap2')}>
          <label className={css('_textsm _fontmedium')} htmlFor="reset-pw">New Password</label>
          <input id="reset-pw" type="password" className="d-control" placeholder="Min 12 characters" value={password} onChange={(e) => setPassword(e.target.value)} style={{ borderRadius: 2 }} autoFocus />
        </div>
        <div className={css('_flex _col _gap2')}>
          <label className={css('_textsm _fontmedium')} htmlFor="reset-confirm">Confirm Password</label>
          <input id="reset-confirm" type="password" className="d-control" placeholder="Re-enter password" value={confirm} onChange={(e) => setConfirm(e.target.value)} style={{ borderRadius: 2 }} />
        </div>
        <button type="submit" className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center', borderRadius: 2 }}>
          Reset Password
        </button>
      </form>
    </div>
  );
}
