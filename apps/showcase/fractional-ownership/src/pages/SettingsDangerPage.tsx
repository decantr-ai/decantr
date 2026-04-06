import { PageHeader } from '@/components/PageHeader';
import { SettingsNav } from '@/components/SettingsNav';

export function SettingsDangerPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '42rem' }}>
      <PageHeader title="Settings" description="Manage your profile, security, and investment preferences." />
      <SettingsNav />

      <div className="d-surface" style={{ padding: 'var(--d-surface-p)', borderColor: 'color-mix(in srgb, var(--d-error) 30%, var(--d-border))' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--d-error)' }}>Danger Zone</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', marginBottom: '1rem' }}>Irreversible actions. Liquidation of positions required before account closure.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--d-surface-raised)', borderRadius: 'var(--d-radius)' }}>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>Export all data</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Download positions, trades, and tax documents</div>
            </div>
            <button className="d-interactive" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>Export</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--d-surface-raised)', borderRadius: 'var(--d-radius)' }}>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>Freeze account</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Prevent all trading and governance activity</div>
            </div>
            <button className="d-interactive" data-variant="danger" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>Freeze</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--d-surface-raised)', borderRadius: 'var(--d-radius)' }}>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>Delete account</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Permanently delete your Fractionel account</div>
            </div>
            <button className="d-interactive" data-variant="danger" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}
