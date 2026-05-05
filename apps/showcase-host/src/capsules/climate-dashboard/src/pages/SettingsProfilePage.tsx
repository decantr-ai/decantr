import { useState } from 'react';
import { css } from '@decantr/css';
import { useAuth } from '@/hooks/useAuth';
import { User, Building, Mail, Save } from 'lucide-react';

export function SettingsProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [org, setOrg] = useState(user?.org ?? '');

  return (
    <div className={css('_flex _col _gap6')}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Profile</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>Manage your account details</p>
      </div>

      <div className="d-surface earth-card">
        <div className={css('_flex _aic _gap4')} style={{ marginBottom: '1.5rem' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 'var(--d-radius)',
            background: 'var(--d-primary)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.25rem', fontWeight: 700,
          }}>
            {user?.avatar}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>{user?.name}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>{user?.role}</div>
          </div>
        </div>

        <form className={css('_flex _col _gap4')} onSubmit={e => e.preventDefault()}>
          <div className={css('_flex _col _gap1')}>
            <label className={css('_flex _aic _gap2')} style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
              <User size={14} /> Full Name
            </label>
            <input className="d-control earth-input" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className={css('_flex _col _gap1')}>
            <label className={css('_flex _aic _gap2')} style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
              <Mail size={14} /> Email
            </label>
            <input className="d-control earth-input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className={css('_flex _col _gap1')}>
            <label className={css('_flex _aic _gap2')} style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
              <Building size={14} /> Organization
            </label>
            <input className="d-control earth-input" value={org} onChange={e => setOrg(e.target.value)} />
          </div>
          <div>
            <button type="submit" className="d-interactive" data-variant="primary">
              <Save size={14} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
