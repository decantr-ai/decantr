import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { SettingsNav } from '@/components/SettingsNav';
import { useAuth } from '@/hooks/useAuth';

export function SettingsProfilePage() {
  const { user } = useAuth();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageHeader title="Settings" description="Manage your account and preferences" />
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        <SettingsNav />
        <div className="pm-card" style={{ padding: 'var(--d-surface-p)' }}>
          <SectionLabel style={{ marginBottom: '1rem' }}>Profile</SectionLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="pm-avatar" style={{ width: 72, height: 72, fontSize: '1.5rem' }}>{user?.avatar}</div>
            <div>
              <button className="d-interactive" style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>Change photo</button>
              <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', marginTop: '0.375rem' }}>JPG or PNG, max 2 MB</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Full name</label>
              <input className="d-control" defaultValue={user?.name ?? ''} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Email</label>
              <input className="d-control" type="email" defaultValue={user?.email ?? ''} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Role</label>
              <input className="d-control" defaultValue={user?.role ?? ''} disabled />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Organization</label>
              <input className="d-control" defaultValue={user?.org ?? ''} />
            </div>
          </div>
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--d-border)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button className="d-interactive" style={{ padding: '0.4rem 0.875rem', fontSize: '0.825rem' }}>Cancel</button>
            <button className="pm-button-primary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.825rem' }}>Save changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}
