import { useState } from 'react';
import { css } from '@decantr/css';
import { Lock, Eye, EyeOff } from 'lucide-react';

export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form
      className={css('_flex _col _gap4')}
      onSubmit={(e) => e.preventDefault()}
    >
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--d-text)', margin: 0 }}>
        New Password
      </h1>

      {/* New Password */}
      <div className={css('_flex _col _gap1')}>
        <label className="d-label" htmlFor="reset-password">
          New Password
        </label>
        <div className={css('_flex _aic')} style={{ position: 'relative' }}>
          <Lock
            size={16}
            style={{
              position: 'absolute',
              left: '0.75rem',
              color: 'var(--d-text-muted)',
              pointerEvents: 'none',
            }}
          />
          <input
            id="reset-password"
            type={showPassword ? 'text' : 'password'}
            className="d-control carbon-input"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            style={{
              position: 'absolute',
              right: '0.75rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--d-text-muted)',
              padding: 0,
              display: 'flex',
            }}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div className={css('_flex _col _gap1')}>
        <label className="d-label" htmlFor="reset-confirm">
          Confirm Password
        </label>
        <div className={css('_flex _aic')} style={{ position: 'relative' }}>
          <Lock
            size={16}
            style={{
              position: 'absolute',
              left: '0.75rem',
              color: 'var(--d-text-muted)',
              pointerEvents: 'none',
            }}
          />
          <input
            id="reset-confirm"
            type={showPassword ? 'text' : 'password'}
            className="d-control carbon-input"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.5rem' }}
          />
        </div>
      </div>

      {/* Submit */}
      <button type="submit" className="d-interactive neon-glow" style={{ width: '100%' }}>
        Update Password
      </button>
    </form>
  );
}
