import { SettingsLayout, workspaceNav } from '../components/SettingsLayout';

export function SettingsGeneralPage() {
  return (
    <SettingsLayout title="Workspace settings" subtitle="Manage your team's shared space." nav={workspaceNav}>
      <section className="paper-card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem' }}>General</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Field label="Workspace name" defaultValue="Acme Team" />
          <Field label="Workspace URL" defaultValue="acme.lumen.team" />
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>Description</label>
            <textarea className="paper-input" rows={3} defaultValue="A collaborative workspace for the Acme product team." style={{ resize: 'vertical', fontFamily: 'inherit' }} />
          </div>
        </div>
      </section>
      <section className="paper-card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem' }}>Workspace icon</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: 'var(--d-radius)', background: 'var(--d-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 600 }}>A</div>
          <button className="d-interactive" style={{ padding: '0.4375rem 0.75rem', fontSize: '0.8125rem' }}>Upload image</button>
        </div>
      </section>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="d-interactive" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', background: 'var(--d-primary)', color: '#fff', borderColor: 'var(--d-primary)' }}>
          Save changes
        </button>
      </div>
    </SettingsLayout>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>{label}</label>
      <input className="paper-input" defaultValue={defaultValue} />
    </div>
  );
}
