import { useAuth } from '@/hooks/useAuth';
import { SettingsLayout } from '@/components/SettingsLayout';

export function ProfilePage() {
  const { user } = useAuth();

  return (
    <SettingsLayout>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--d-content-gap)' }}>Profile</h2>
      <div className="d-surface" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 'var(--d-radius)',
            background: 'var(--d-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.25rem', fontWeight: 700, color: '#0a0a0a',
            fontFamily: "'JetBrains Mono', monospace",
          }}>{user?.avatar}</div>
          <div>
            <div style={{ fontWeight: 600 }}>{user?.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>{user?.role} at {user?.org}</div>
          </div>
          <button className="d-interactive" data-variant="ghost" style={{ marginLeft: 'auto', padding: '4px 12px', fontSize: '0.75rem' }}>Change avatar</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>Full name</label>
          <input className="d-control" defaultValue={user?.name} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>Email</label>
          <input className="d-control" type="email" defaultValue={user?.email} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>Bio</label>
          <textarea className="d-control" defaultValue="Creative director specializing in AI-generated cinematic content." style={{ minHeight: '6rem' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="d-interactive" data-variant="primary" style={{ padding: '6px 16px', fontSize: '0.8rem' }}>Save Changes</button>
        </div>
      </div>
    </SettingsLayout>
  );
}
