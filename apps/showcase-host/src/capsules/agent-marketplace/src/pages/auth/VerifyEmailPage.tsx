import { useState } from 'react';
import { MailCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthCodePreview, AuthPanel } from '../../components/AuthPanel';

export function VerifyEmailPage() {
  const [code, setCode] = useState('');
  const [verified, setVerified] = useState(false);

  return (
    <AuthPanel
      eyebrow="Verification"
      icon={MailCheck}
      title={verified ? 'Email verified' : 'Confirm your email'}
      description={verified
        ? 'The email verification step is complete. Continue into MFA to finish the gateway flow.'
        : 'This route demonstrates the verification state without inventing another shell. Enter any six digits to proceed.'}
      footer={<Link className="auth-link" to="/login">Back to sign in</Link>}
    >
      {verified ? (
        <div className="auth-status-card">
          <MailCheck size={20} />
          <strong>Verification complete</strong>
          <p className="auth-helper">Move to MFA setup to finish the authenticated pathway.</p>
          <Link className="d-interactive" data-variant="primary" to="/mfa-setup">Continue to MFA setup</Link>
        </div>
      ) : (
        <form className="auth-form" onSubmit={(event) => { event.preventDefault(); setVerified(true); }}>
          <AuthCodePreview />
          <label className="auth-field">
            <span>Verification code</span>
            <input className="d-control carbon-input mono-data" value={code} onChange={(event) => setCode(event.target.value)} placeholder="684129" />
          </label>
          <div className="auth-actions">
            <button type="submit" className="d-interactive" data-variant="primary">Verify email</button>
          </div>
        </form>
      )}
    </AuthPanel>
  );
}
