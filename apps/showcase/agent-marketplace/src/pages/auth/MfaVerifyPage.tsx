import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthCodePreview, AuthPanel } from '../../components/AuthPanel';
import { useAuth } from '../../App';

export function MfaVerifyPage() {
  const [code, setCode] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  return (
    <AuthPanel
      eyebrow="MFA verify"
      icon={ShieldCheck}
      title="Confirm your second factor"
      description="This route is intentionally compact. It should feel like a continuation of the auth surface, not a brand new page system."
      footer={<Link className="auth-link" to="/phone-verify">Use phone verification instead</Link>}
    >
      <AuthCodePreview value="4 8 1 2 0 6" />
      <form className="auth-form" onSubmit={(event) => { event.preventDefault(); login(); navigate('/agents'); }}>
        <label className="auth-field">
          <span>Authenticator code</span>
          <input className="d-control carbon-input mono-data" value={code} onChange={(event) => setCode(event.target.value)} placeholder="481206" />
        </label>
        <div className="auth-actions">
          <button type="submit" className="d-interactive" data-variant="primary">Enter workspace</button>
        </div>
      </form>
    </AuthPanel>
  );
}
