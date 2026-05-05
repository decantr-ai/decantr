import { AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { SettingsNav } from '@/components/SettingsNav';

export function SettingsDangerPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageHeader title="Settings" description="Irreversible account actions." />
      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 'var(--d-content-gap)' }}>
        <SettingsNav />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)' }}>
          <div className="d-surface" style={{ padding: 'var(--d-surface-p)', borderColor: 'color-mix(in srgb, var(--d-error) 40%, var(--d-border))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <AlertTriangle size={16} style={{ color: 'var(--d-error)' }} />
              <SectionLabel style={{ color: 'var(--d-error)' }}>Danger Zone</SectionLabel>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--d-surface-raised)', borderRadius: 'var(--d-radius-sm)' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Export all data</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Download a complete archive of your store data</div>
                </div>
                <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>Request Export</button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--d-surface-raised)', borderRadius: 'var(--d-radius-sm)' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Transfer ownership</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Move store admin rights to another user</div>
                </div>
                <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>Transfer</button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'color-mix(in srgb, var(--d-error) 8%, transparent)', borderRadius: 'var(--d-radius-sm)', border: '1px solid color-mix(in srgb, var(--d-error) 30%, transparent)' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--d-error)' }}>Delete account</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Permanently delete this admin account and all associated data</div>
                </div>
                <button className="d-interactive" data-variant="danger" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>Delete Account</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
