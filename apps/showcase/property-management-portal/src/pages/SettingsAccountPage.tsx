import { AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { SettingsNav } from '@/components/SettingsNav';

export function SettingsAccountPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageHeader title="Settings" description="Manage your account and preferences" />
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        <SettingsNav />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="pm-card" style={{ padding: 'var(--d-surface-p)' }}>
            <SectionLabel style={{ marginBottom: '0.875rem' }}>Export Data</SectionLabel>
            <p style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)', marginBottom: '0.75rem' }}>
              Download a complete archive of your properties, residents, and financial data.
            </p>
            <button className="d-interactive" style={{ fontSize: '0.825rem', padding: '0.4rem 0.875rem' }}>Export account data</button>
          </div>

          <div className="pm-card" style={{ padding: 'var(--d-surface-p)', border: '1px solid color-mix(in srgb, var(--d-error) 35%, var(--d-border))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <AlertTriangle size={16} style={{ color: 'var(--d-error)' }} />
              <div className="d-label" style={{ color: 'var(--d-error)' }}>Danger Zone</div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)', marginBottom: '1rem', lineHeight: 1.55 }}>
              Deleting your account will permanently remove all properties, residents, leases, payments, and documents. This action cannot be undone.
            </p>
            <button className="d-interactive" data-variant="danger" style={{ fontSize: '0.825rem', padding: '0.4rem 0.875rem' }}>
              Delete account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
