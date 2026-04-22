import { useState } from 'react';
import { KeyRound, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthPanel } from '../../components/AuthPanel';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <AuthPanel
      eyebrow="Recovery"
      icon={KeyRound}
      title={sent ? 'Check your email' : 'Reset your password'}
      description={sent
        ? 'A recovery link is ready in dev mode. Move to the reset route to continue the flow.'
        : 'Enter any email and continue. This step exists to validate the full password-reset route family.'}
      footer={<Link className="auth-link" to="/login">Back to sign in</Link>}
    >
      {sent ? (
        <div className="auth-status-card">
          <Mail size={20} />
          <strong>Reset instructions staged</strong>
          <p className="auth-helper">Continue to the reset route and confirm a fresh password.</p>
          <Link className="d-interactive" data-variant="primary" to="/reset-password">Continue to reset</Link>
        </div>
      ) : (
        <form className="auth-form" onSubmit={(event) => { event.preventDefault(); setSent(true); }}>
          <label className="auth-field">
            <span>Email</span>
            <input className="d-control carbon-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="operator@agentops.dev" autoComplete="email" />
          </label>
          <div className="auth-actions">
            <button type="submit" className="d-interactive" data-variant="primary">Send reset instructions</button>
          </div>
        </form>
      )}
    </AuthPanel>
  );
}
