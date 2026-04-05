import { PageHeader } from '@/components/PageHeader';
import { SettingsNav } from '@/components/SettingsNav';
import { SectionLabel } from '@/components/SectionLabel';
import { useAuth } from '@/hooks/useAuth';

export function SettingsProfilePage() {
  const { user } = useAuth();
  return (
    <div style={{ maxWidth: 800 }}>
      <PageHeader title="Settings" description="Manage your profile, security, and preferences." />
      <div style={{ marginTop: '1.5rem' }}>
        <SettingsNav />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <section className="hw-card" style={{ padding: '1.5rem' }}>
            <SectionLabel style={{ marginBottom: '1rem' }}>Profile Photo</SectionLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div className="hw-avatar" style={{ width: 72, height: 72, fontSize: '1.5rem' }}>{user?.avatar}</div>
              <div>
                <button className="d-interactive" style={{ padding: '0.5rem 0.875rem', fontSize: '0.875rem' }}>Upload Photo</button>
                <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', marginTop: '0.5rem' }}>JPG or PNG, at least 400×400 px.</p>
              </div>
            </div>
          </section>
          <section className="hw-card" style={{ padding: '1.5rem' }}>
            <SectionLabel style={{ marginBottom: '1rem' }}>Personal Information</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Field label="Full name" value={user?.name ?? ''} />
              <Field label="Date of birth" value={user?.dob ?? ''} />
              <Field label="Email" value={user?.email ?? ''} />
              <Field label="Phone" value="(555) 123-4567" />
              <div style={{ gridColumn: '1 / -1' }}>
                <Field label="Home address" value="1428 Evergreen Terrace, Seattle, WA 98101" />
              </div>
            </div>
            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.625rem' }}>
              <button className="hw-button-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Save Changes</button>
              <button className="d-interactive" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Cancel</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--d-text-muted)' }}>
        {label}
      </label>
      <input type="text" className="d-control" defaultValue={value} />
    </div>
  );
}
