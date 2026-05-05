import { css } from '@decantr/css';
import { useState } from 'react';

export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  return (
    <div className={css('_flex _col _gap6')} style={{ padding: '2rem' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 className="counsel-header" style={{ fontSize: '1.25rem' }}>Reset password</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginTop: '0.25rem', fontFamily: 'Georgia, serif' }}>
          Choose a new password for your account
        </p>
      </div>
      <form onSubmit={(e) => e.preventDefault()} className={css('_flex _col _gap4')}>
        <div className={css('_flex _col _gap2')}>
          <label className={css('_textsm _fontmedium')} htmlFor="rp-password">New Password</label>
          <input id="rp-password" type="password" className="d-control" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
        </div>
        <div className={css('_flex _col _gap2')}>
          <label className={css('_textsm _fontmedium')} htmlFor="rp-confirm">Confirm Password</label>
          <input id="rp-confirm" type="password" className="d-control" placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        <button type="submit" className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center' }}>
          Reset Password
        </button>
      </form>
    </div>
  );
}
