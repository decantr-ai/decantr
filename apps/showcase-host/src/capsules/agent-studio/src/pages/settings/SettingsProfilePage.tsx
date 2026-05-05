import { PageHeader } from '@/components/PageHeader';
import { useAuth } from '@/hooks/useAuth';
import { Save } from 'lucide-react';

export function SettingsProfilePage() {
  const { user } = useAuth();
  return (
    <div style={{ maxWidth: 640 }}>
      <PageHeader title="Profile" description="Your public profile information" />
      <div className="carbon-panel">
        <div className="carbon-panel-header">account</div>
        <div style={{ padding: '1rem 1.125rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--d-border)' }}>
            <div style={{
              width: 56, height: 56, borderRadius: 6,
              background: 'var(--d-accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.125rem', fontWeight: 700, color: '#0a0a0a', fontFamily: 'var(--d-font-mono)',
            }}>{user?.avatar}</div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user?.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', fontFamily: 'var(--d-font-mono)' }}>{user?.email}</div>
            </div>
            <button className="d-interactive" data-variant="ghost" style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>Change</button>
          </div>
          <Field label="Full name" defaultValue={user?.name} />
          <Field label="Email" defaultValue={user?.email} type="email" />
          <Field label="Role" defaultValue={user?.role} />
          <Field label="Organization" defaultValue={user?.org} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button className="d-interactive" data-variant="primary" style={{ background: 'var(--d-accent)', borderColor: 'var(--d-accent)', color: '#0a0a0a', fontSize: '0.8rem' }}>
              <Save size={13} /> Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, defaultValue, type = 'text' }: { label: string; defaultValue?: string; type?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label className="d-label">{label}</label>
      <input type={type} defaultValue={defaultValue} className="d-control" style={{ fontFamily: 'var(--d-font-mono)', fontSize: '0.8rem' }} />
    </div>
  );
}
