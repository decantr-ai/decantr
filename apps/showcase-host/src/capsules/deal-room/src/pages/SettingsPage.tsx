import { PageHeader } from '@/components/PageHeader';
import { useAuth } from '@/hooks/useAuth';

export function SettingsPage() {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader title="Account Settings" description="Manage your profile and preferences." />

      <div className="dr-card" style={{ padding: '1.5rem' }}>
        <h2 className="serif-display" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Profile</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {[
            { label: 'Full Name', value: user?.name || '', type: 'text' },
            { label: 'Email', value: user?.email || '', type: 'email' },
            { label: 'Role', value: user?.role || '', type: 'text' },
            { label: 'Firm', value: user?.firm || '', type: 'text' },
          ].map(f => (
            <div key={f.label}>
              <label className="d-label" style={{ display: 'block', marginBottom: '0.35rem' }}>{f.label}</label>
              <input className="d-control" type={f.type} defaultValue={f.value} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: '1.25rem' }}>
          <button className="d-interactive" data-variant="primary" style={{ fontSize: '0.8rem' }}>Save Changes</button>
        </div>
      </div>

      <div className="dr-card" style={{ padding: '1.5rem' }}>
        <h2 className="serif-display" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Notification Preferences</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {['New documents uploaded', 'Q&A responses', 'Stage gate approvals', 'Investor access alerts', 'Weekly digest'].map(pref => (
            <label key={pref} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ accentColor: 'var(--d-primary)' }} />
              {pref}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
