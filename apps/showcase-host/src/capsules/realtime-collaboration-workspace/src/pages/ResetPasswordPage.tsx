import { useNavigate } from 'react-router-dom';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  return (
    <div>
      <h1 style={{ fontSize: '1.375rem', fontWeight: 600, marginBottom: '0.375rem' }}>Set a new password</h1>
      <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', marginBottom: '1.25rem' }}>Pick something you'll remember.</p>
      <form onSubmit={(e) => { e.preventDefault(); navigate('/login'); }} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>New password</label>
          <input className="paper-input" type="password" placeholder="8+ characters" required />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>Confirm password</label>
          <input className="paper-input" type="password" required />
        </div>
        <button type="submit" className="d-interactive" style={{ justifyContent: 'center', padding: '0.5rem 1rem', fontSize: '0.875rem', background: 'var(--d-primary)', color: '#fff', borderColor: 'var(--d-primary)' }}>
          Update password
        </button>
      </form>
    </div>
  );
}
