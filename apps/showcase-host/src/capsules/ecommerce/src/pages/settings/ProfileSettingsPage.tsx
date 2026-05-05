import { useAuth } from '@/hooks/useAuth';
import { SettingsLayout, SettingsSection } from '@/components/SettingsLayout';

export function ProfileSettingsPage() {
  const { user } = useAuth();
  return (
    <SettingsLayout title="Profile" description="Update your personal information and how you appear on Vinea.">
      <SettingsSection
        title="Personal details"
        footer={<><button className="d-interactive" data-variant="ghost">Cancel</button><button className="ec-button-primary">Save changes</button></>}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <div style={{ width: 64, height: 64, borderRadius: 9999, background: 'linear-gradient(135deg, var(--d-primary), var(--d-accent))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.25rem' }}>
            {user?.avatar ?? 'MR'}
          </div>
          <div>
            <button className="d-interactive" style={{ background: 'var(--d-surface)' }}>Change photo</button>
            <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>JPG or PNG, max 2MB</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Field label="First name"><input className="ec-input" defaultValue="Maya" /></Field>
          <Field label="Last name"><input className="ec-input" defaultValue="Rivera" /></Field>
        </div>
        <Field label="Email"><input className="ec-input" type="email" defaultValue={user?.email ?? 'maya@vinea.shop'} /></Field>
        <Field label="Phone"><input className="ec-input" type="tel" defaultValue="+1 (555) 234-7891" /></Field>
      </SettingsSection>

      <SettingsSection title="Shipping address">
        <Field label="Street"><input className="ec-input" defaultValue="1428 Willow Lane" /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
          <Field label="City"><input className="ec-input" defaultValue="Brooklyn" /></Field>
          <Field label="State"><input className="ec-input" defaultValue="NY" /></Field>
          <Field label="ZIP"><input className="ec-input" defaultValue="11201" /></Field>
        </div>
      </SettingsSection>
    </SettingsLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--d-text-muted)' }}>{label}</span>
      {children}
    </label>
  );
}
