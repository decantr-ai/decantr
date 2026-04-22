import { useState } from 'react';
import { Github, Mail, Shield, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthDivider, AuthPanel } from '../../components/AuthPanel';
import { useAuth } from '../../App';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    login();
    navigate('/agents');
  }

  return (
    <AuthPanel
      eyebrow="Gateway"
      icon={Zap}
      title="Sign into the operator workspace"
      description="Use any credentials in dev mode. The route exists to validate the gateway flow, not to block the showcase."
      footer={(
        <p>
          No account yet? <Link className="auth-link" to="/register">Deploy your first agent</Link>
        </p>
      )}
    >
      <div className="auth-provider-row">
        <button type="button" className="d-interactive auth-provider" data-variant="ghost" onClick={handleSubmit}>
          <Github size={14} />
          Continue with GitHub
        </button>
        <button type="button" className="d-interactive auth-provider" data-variant="ghost" onClick={handleSubmit}>
          <Shield size={14} />
          Continue with SSO
        </button>
      </div>
      <AuthDivider />
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-field">
          <span>Email</span>
          <input className="d-control carbon-input" type="email" placeholder="operator@agentops.dev" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
        </label>
        <label className="auth-field">
          <span>Password</span>
          <input className="d-control carbon-input" type="password" placeholder="Enter any password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
        </label>
        <div className="auth-actions">
          <button type="submit" className="d-interactive" data-variant="primary">
            <Mail size={14} />
            Enter workspace
          </button>
          <Link className="auth-link" to="/forgot-password">Forgot password?</Link>
        </div>
      </form>
    </AuthPanel>
  );
}
