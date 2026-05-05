import { css } from '@decantr/css';
import { FlaskConical } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('researcher');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login();
    navigate('/notebook');
  };

  return (
    <div className={css('_flex _col _gap6')} style={{ padding: '2rem' }}>
      <div style={{ textAlign: 'center' }}>
        <div className={css('_flex _center')} style={{ marginBottom: '0.75rem' }}>
          <FlaskConical size={24} style={{ color: 'var(--d-primary)' }} />
        </div>
        <h1 style={{ fontWeight: 500, fontSize: '1.125rem' }}>Create your account</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>
          Join the research lab workspace
        </p>
      </div>

      <form onSubmit={handleSubmit} className={css('_flex _col _gap4')}>
        <div className={css('_flex _col _gap2')}>
          <label className={css('_textsm _fontmedium')} htmlFor="reg-name">Full Name</label>
          <input id="reg-name" type="text" className="d-control" placeholder="Dr. Jane Smith" value={name} onChange={(e) => setName(e.target.value)} style={{ borderRadius: 2 }} autoFocus />
        </div>
        <div className={css('_flex _col _gap2')}>
          <label className={css('_textsm _fontmedium')} htmlFor="reg-email">Institutional Email</label>
          <input id="reg-email" type="email" className="d-control" placeholder="jane.smith@lab.edu" value={email} onChange={(e) => setEmail(e.target.value)} style={{ borderRadius: 2 }} />
        </div>
        <div className={css('_flex _col _gap2')}>
          <label className={css('_textsm _fontmedium')} htmlFor="reg-password">Password</label>
          <input id="reg-password" type="password" className="d-control" placeholder="Min 12 characters" value={password} onChange={(e) => setPassword(e.target.value)} style={{ borderRadius: 2 }} />
        </div>
        <div className={css('_flex _col _gap2')}>
          <label className={css('_textsm _fontmedium')} htmlFor="reg-role">Role</label>
          <select id="reg-role" className="d-control" value={role} onChange={(e) => setRole(e.target.value)} style={{ borderRadius: 2 }}>
            <option value="researcher">Researcher</option>
            <option value="pi">Principal Investigator</option>
            <option value="technician">Lab Technician</option>
            <option value="student">Graduate Student</option>
          </select>
        </div>
        <button type="submit" className="d-interactive" data-variant="primary" style={{ width: '100%', justifyContent: 'center', borderRadius: 2 }}>
          Create Account
        </button>
      </form>

      <p className={css('_textsm')} style={{ textAlign: 'center', color: 'var(--d-text-muted)' }}>
        Already have an account? <a href="#/login" style={{ color: 'var(--d-primary)', textDecoration: 'none' }}>Sign in</a>
      </p>
    </div>
  );
}
