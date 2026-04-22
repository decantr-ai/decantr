import { useState } from 'react';
import { Smartphone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthCodePreview, AuthPanel } from '../../components/AuthPanel';
import { useAuth } from '../../App';

export function PhoneVerifyPage() {
  const [code, setCode] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  return (
    <AuthPanel
      eyebrow="Phone verify"
      icon={Smartphone}
      title="Confirm by phone"
      description="Phone verification is presented as the same auth surface with a different credential path, not as a new visual system."
      footer={<Link className="auth-link" to="/mfa-verify">Use authenticator code instead</Link>}
    >
      <div className="auth-status-card">
        <strong>Verification sent</strong>
        <p className="auth-helper">A test SMS code is staged for the showcase route.</p>
        <AuthCodePreview value="2 4 7 1 9 5" />
      </div>
      <form className="auth-form" onSubmit={(event) => { event.preventDefault(); login(); navigate('/agents'); }}>
        <label className="auth-field">
          <span>SMS code</span>
          <input className="d-control carbon-input mono-data" value={code} onChange={(event) => setCode(event.target.value)} placeholder="247195" />
        </label>
        <div className="auth-actions">
          <button type="submit" className="d-interactive" data-variant="primary">Verify and continue</button>
        </div>
      </form>
    </AuthPanel>
  );
}
