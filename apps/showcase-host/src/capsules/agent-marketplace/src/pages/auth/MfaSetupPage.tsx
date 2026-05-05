import { useState } from 'react';
import { Fingerprint } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthCodePreview, AuthPanel } from '../../components/AuthPanel';

export function MfaSetupPage() {
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  return (
    <AuthPanel
      eyebrow="MFA setup"
      icon={Fingerprint}
      title="Connect an authenticator app"
      description="The setup route keeps the state focused: scan the secret, confirm a code, then move into MFA verification."
      footer={<Link className="auth-link" to="/login">Back to sign in</Link>}
    >
      <div className="auth-status-card">
        <strong>Authenticator secret</strong>
        <div className="carbon-code mono-kicker">otpauth://totp/agentops:operator?secret=JBSWY3DPEHPK3PXP</div>
        <p className="auth-helper">Use any authenticator app, or just continue in dev mode with the preview code below.</p>
        <AuthCodePreview value="1 9 2 4 6 8" />
      </div>
      <form className="auth-form" onSubmit={(event) => { event.preventDefault(); navigate('/mfa-verify'); }}>
        <label className="auth-field">
          <span>Setup confirmation code</span>
          <input className="d-control carbon-input mono-data" value={code} onChange={(event) => setCode(event.target.value)} placeholder="192468" />
        </label>
        <div className="auth-actions">
          <button type="submit" className="d-interactive" data-variant="primary">Continue to MFA verify</button>
        </div>
      </form>
    </AuthPanel>
  );
}
