import { useState } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthPanel } from '../../components/AuthPanel';

export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [complete, setComplete] = useState(false);

  return (
    <AuthPanel
      eyebrow="Recovery"
      icon={ShieldCheck}
      title={complete ? 'Password updated' : 'Choose a new password'}
      description={complete
        ? 'Your gateway credentials have been refreshed. Continue through verification or head straight back to sign in.'
        : 'The reset route keeps the focus tight: new password, confirmation, and one clear next action.'}
      footer={<Link className="auth-link" to="/login">Back to sign in</Link>}
    >
      {complete ? (
        <div className="auth-status-card">
          <ShieldCheck size={20} />
          <strong>Recovery complete</strong>
          <p className="auth-helper">Move to the email verification route to complete the full gateway story.</p>
          <Link className="d-interactive" data-variant="primary" to="/verify-email">Continue to verification</Link>
        </div>
      ) : (
        <form className="auth-form" onSubmit={(event) => { event.preventDefault(); setComplete(true); }}>
          <label className="auth-field">
            <span>New password</span>
            <input className="d-control carbon-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" />
          </label>
          <label className="auth-field">
            <span>Confirm password</span>
            <input className="d-control carbon-input" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" />
          </label>
          <div className="auth-actions">
            <button type="submit" className="d-interactive" data-variant="primary">
              <Lock size={14} />
              Save new password
            </button>
          </div>
        </form>
      )}
    </AuthPanel>
  );
}
