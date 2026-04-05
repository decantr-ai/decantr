import { AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SettingsTabs } from './ProfilePage';

export function DangerPage() {
  return (
    <div style={{ maxWidth: 720 }}>
      <PageHeader title="Settings" description="Manage your account" />
      <SettingsTabs active="/settings/danger" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="d-surface" style={{ padding: '1.5rem', borderColor: 'color-mix(in srgb, var(--d-warning) 40%, var(--d-border))' }}>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <AlertTriangle size={18} style={{ color: 'var(--d-warning)', flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem' }}>Export your data</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>
                Download all your personal data as JSON. Organization data stays with the org.
              </p>
            </div>
          </div>
          <button className="d-interactive" style={{ fontSize: '0.75rem' }}>Request data export</button>
        </div>

        <div className="d-surface" style={{ padding: '1.5rem', borderColor: 'color-mix(in srgb, var(--d-warning) 40%, var(--d-border))' }}>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <AlertTriangle size={18} style={{ color: 'var(--d-warning)', flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem' }}>Leave organization</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>
                Remove yourself from Acme Corp. You will lose access immediately.
              </p>
            </div>
          </div>
          <button className="d-interactive" style={{ fontSize: '0.75rem' }}>Leave Acme Corp</button>
        </div>

        <div className="d-surface" style={{ padding: '1.5rem', borderColor: 'color-mix(in srgb, var(--d-error) 40%, var(--d-border))' }}>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <AlertTriangle size={18} style={{ color: 'var(--d-error)', flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--d-error)' }}>Delete account</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
          </div>
          <button className="d-interactive" data-variant="danger" style={{ fontSize: '0.75rem' }}>
            Delete my account
          </button>
        </div>
      </div>
    </div>
  );
}
