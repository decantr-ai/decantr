import { SettingsLayout, profileNav } from '../components/SettingsLayout';

export function ProfilePage() {
  return (
    <SettingsLayout title="Account" subtitle="Your personal profile and details." nav={profileNav}>
      <section className="paper-card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem' }}>Profile</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <span className="presence-avatar presence-avatar-lg" style={{ background: '#2E8B8B' }}>MC</span>
          <div>
            <button className="d-interactive" style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem', marginRight: '0.375rem' }}>Change photo</button>
            <button style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem', background: 'transparent', border: 'none', color: 'var(--d-text-muted)', cursor: 'pointer' }}>Remove</button>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Field label="Full name" defaultValue="Mira Chen" />
          <Field label="Display name" defaultValue="Mira" />
          <Field label="Email" defaultValue="mira@lumen.team" type="email" />
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>About you</label>
            <textarea className="paper-input" rows={3} defaultValue="Co-founder at Lumen. Care about craft and quiet interfaces." style={{ resize: 'vertical', fontFamily: 'inherit' }} />
          </div>
        </div>
      </section>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="d-interactive" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', background: 'var(--d-primary)', color: '#fff', borderColor: 'var(--d-primary)' }}>Save changes</button>
      </div>
    </SettingsLayout>
  );
}

function Field({ label, defaultValue, type }: { label: string; defaultValue: string; type?: string }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>{label}</label>
      <input className="paper-input" defaultValue={defaultValue} type={type} />
    </div>
  );
}
