import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function SettingsProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState('coach@shadowlegion.gg');
  const [bio, setBio] = useState('Head coach of Shadow Legion. Former pro player turned strategist.');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-gap-6)', maxWidth: 600 }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Profile Settings</h1>
        <p style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem' }}>Manage your personal information.</p>
      </div>

      <div className="d-surface" style={{ padding: 'var(--d-surface-p)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 'var(--d-radius-full)',
            background: 'linear-gradient(135deg, var(--d-primary), var(--d-accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.25rem', fontWeight: 700, flexShrink: 0,
          }}>
            {user?.avatar || 'CV'}
          </div>
          <div>
            <button className="d-interactive" style={{ fontSize: '0.8rem' }}>Change Avatar</button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>Display Name</label>
          <input className="d-control" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>Email</label>
          <input className="d-control" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>Bio</label>
          <textarea className="d-control" rows={3} value={bio} onChange={e => setBio(e.target.value)} style={{ resize: 'vertical' }} />
        </div>
        <div>
          <button className="d-interactive" data-variant="primary" style={{ fontSize: '0.8rem' }}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}
