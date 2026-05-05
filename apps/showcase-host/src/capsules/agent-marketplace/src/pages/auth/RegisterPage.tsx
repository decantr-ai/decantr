import { useState } from 'react';
import { Bot, Github, ShieldCheck, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthDivider, AuthPanel } from '../../components/AuthPanel';
import { useAuth } from '../../App';

export function RegisterPage() {
  const [name, setName] = useState('');
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
      eyebrow="Provisioning"
      icon={Bot}
      title="Create an operator account"
      description="Registering here drops straight into the authenticated workspace so the showcase can validate the full public → gateway → app path."
      footer={(
        <p>
          Already have access? <Link className="auth-link" to="/login">Sign in instead</Link>
        </p>
      )}
    >
      <div className="auth-provider-row">
        <button type="button" className="d-interactive auth-provider" data-variant="ghost" onClick={handleSubmit}>
          <Github size={14} />
          Continue with GitHub
        </button>
        <button type="button" className="d-interactive auth-provider" data-variant="ghost" onClick={handleSubmit}>
          <ShieldCheck size={14} />
          Continue with enterprise SSO
        </button>
      </div>
      <AuthDivider label="or create with email" />
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-field__row">
          <label className="auth-field">
            <span>Name</span>
            <input className="d-control carbon-input" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
          </label>
          <label className="auth-field">
            <span>Email</span>
            <input className="d-control carbon-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
          </label>
        </div>
        <label className="auth-field">
          <span>Password</span>
          <input className="d-control carbon-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" />
        </label>
        <div className="auth-actions">
          <button type="submit" className="d-interactive" data-variant="primary">
            <UserRound size={14} />
            Provision workspace
          </button>
        </div>
      </form>
    </AuthPanel>
  );
}
