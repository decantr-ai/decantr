import { useAuth } from '@/hooks/useAuth';
import { SettingsLayout, SettingsSection, FieldRow } from '@/components/SettingsLayout';

export function ProfileSettingsPage() {
  const { user } = useAuth();
  return (
    <SettingsLayout title="Profile" description="How you appear to hosts and guests on Nestable.">
      <SettingsSection
        title="Personal details"
        footer={<><button className="d-interactive" data-variant="ghost">Cancel</button><button className="nm-button-primary">Save changes</button></>}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <div className="nm-avatar" style={{ width: 64, height: 64, fontSize: '1.25rem' }}>{user?.avatar ?? 'JA'}</div>
          <div>
            <button className="d-interactive" style={{ background: 'var(--d-surface)' }}>Change photo</button>
            <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>JPG or PNG, max 2MB</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <FieldRow label="First name"><input className="nm-input" defaultValue="Jordan" /></FieldRow>
          <FieldRow label="Last name"><input className="nm-input" defaultValue="Alvarez" /></FieldRow>
        </div>
        <FieldRow label="Email"><input className="nm-input" type="email" defaultValue={user?.email ?? 'jordan@nestable.co'} /></FieldRow>
        <FieldRow label="Phone"><input className="nm-input" type="tel" defaultValue="+1 (555) 234-7891" /></FieldRow>
        <FieldRow label="Bio">
          <textarea className="nm-input" rows={3} defaultValue="Frequent traveler. Occasional host. Always looking for quiet places with good light." style={{ resize: 'vertical', fontFamily: 'inherit' }} />
        </FieldRow>
      </SettingsSection>

      <SettingsSection title="Verification">
        <VerificationRow label="Email" value="jordan@nestable.co" verified />
        <VerificationRow label="Phone" value="+1 (555) 234-7891" verified />
        <VerificationRow label="Government ID" value="Not submitted" />
      </SettingsSection>
    </SettingsLayout>
  );
}

function VerificationRow({ label, value, verified }: { label: string; value: string; verified?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--d-border)', fontSize: '0.875rem' }}>
      <div>
        <div style={{ fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--d-text-muted)' }}>{value}</div>
      </div>
      {verified
        ? <span className="nm-badge" data-tone="success">Verified</span>
        : <button className="d-interactive" style={{ fontSize: '0.78rem' }}>Verify</button>}
    </div>
  );
}
