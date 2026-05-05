import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  return (
    <div>
      <h1 style={{ fontSize: '1.375rem', fontWeight: 600, marginBottom: '0.375rem' }}>Create your workspace</h1>
      <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', marginBottom: '1.25rem' }}>Free for up to 5 teammates.</p>
      <form onSubmit={(e) => { e.preventDefault(); login(); navigate('/home'); }} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>Your name</label>
          <input className="paper-input" placeholder="Mira Chen" required />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>Workspace name</label>
          <input className="paper-input" placeholder="Acme Team" required />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>Work email</label>
          <input className="paper-input" type="email" placeholder="you@team.com" required />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>Password</label>
          <input className="paper-input" type="password" placeholder="8+ characters" required />
        </div>
        <button type="submit" className="d-interactive" style={{ justifyContent: 'center', padding: '0.5rem 1rem', fontSize: '0.875rem', background: 'var(--d-primary)', color: '#fff', borderColor: 'var(--d-primary)' }}>
          Create workspace
        </button>
      </form>
      <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', textAlign: 'center', marginTop: '1.25rem' }}>
        Already have one? <Link to="/login" style={{ color: 'var(--d-primary)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
      </p>
    </div>
  );
}
