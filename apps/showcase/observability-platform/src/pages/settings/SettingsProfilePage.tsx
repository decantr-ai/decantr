import { SettingsNav } from '@/components/SettingsNav';
import { useAuth } from '@/hooks/useAuth';

export function SettingsProfilePage() {
  const { user } = useAuth();
  return (
    <div>
      <h1 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12 }}>Settings</h1>
      <SettingsNav />
      <div className="fin-card">
        <div className="fin-label" style={{ marginBottom: 10 }}>Profile</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          <label><div className="fin-label" style={{ marginBottom: 4 }}>Name</div><input className="fin-input" defaultValue={user?.name ?? ''} /></label>
          <label><div className="fin-label" style={{ marginBottom: 4 }}>Email</div><input className="fin-input" defaultValue={user?.email ?? ''} /></label>
          <label><div className="fin-label" style={{ marginBottom: 4 }}>Role</div><input className="fin-input" defaultValue={user?.role ?? ''} disabled /></label>
          <label><div className="fin-label" style={{ marginBottom: 4 }}>Organization</div><input className="fin-input" defaultValue={user?.org ?? ''} disabled /></label>
          <label style={{ gridColumn: '1 / -1' }}>
            <div className="fin-label" style={{ marginBottom: 4 }}>Bio</div>
            <textarea className="fin-input" rows={3} defaultValue="SRE lead. Focused on reducing MTTR and shipping fast." />
          </label>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
          <button className="d-interactive" data-variant="primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Save changes</button>
          <button className="d-interactive" data-variant="ghost" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
