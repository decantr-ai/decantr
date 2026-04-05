import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { SettingsNav } from '@/components/SettingsNav';
import { useAuth } from '@/hooks/useAuth';

export function SettingsProfilePage() {
  const { user } = useAuth();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageHeader title="Settings" description="Manage your store admin account." />
      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 'var(--d-content-gap)' }}>
        <SettingsNav />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)' }}>
          <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
            <SectionLabel style={{ marginBottom: '1rem' }}>Profile</SectionLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="ea-avatar" style={{ width: 56, height: 56, fontSize: '1.125rem' }}>{user?.avatar}</div>
              <div>
                <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}>Change photo</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.25rem' }}>Full name</label>
                <input className="d-control" defaultValue={user?.name} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.25rem' }}>Email</label>
                <input className="d-control" type="email" defaultValue={user?.email} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.25rem' }}>Role</label>
                <input className="d-control" defaultValue={user?.role} disabled />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.25rem' }}>Store</label>
                <input className="d-control" defaultValue={user?.org} />
              </div>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="ea-button-accent" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
