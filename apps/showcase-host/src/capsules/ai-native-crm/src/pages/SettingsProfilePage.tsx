import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { SettingsNav } from '@/components/SettingsNav';
import { useAuth } from '@/hooks/useAuth';

export function SettingsProfilePage() {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader title="Settings" description="Manage your account and workspace" />
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1.5rem' }}>
        <SettingsNav />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <SectionLabel style={{ marginBottom: '1rem' }}>Profile</SectionLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="crm-avatar" style={{ width: 56, height: 56, fontSize: '1rem' }}>{user?.avatar}</div>
              <button className="d-interactive" style={{ fontSize: '0.8rem' }}>Upload photo</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, marginBottom: '0.375rem' }}>Full name</label>
                <input className="glass-control" defaultValue={user?.name} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, marginBottom: '0.375rem' }}>Role</label>
                <input className="glass-control" defaultValue={user?.role} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, marginBottom: '0.375rem' }}>Email</label>
                <input className="glass-control" defaultValue={user?.email} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, marginBottom: '0.375rem' }}>Organization</label>
                <input className="glass-control" defaultValue={user?.org} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button className="crm-button-accent" style={{ fontSize: '0.8rem' }}>Save changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
