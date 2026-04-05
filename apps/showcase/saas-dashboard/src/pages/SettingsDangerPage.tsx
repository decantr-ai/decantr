import { AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SettingsNav } from '@/components/SettingsNav';

export function SettingsDangerPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '42rem' }}>
      <PageHeader title="Settings" description="Manage your profile, security, and workspace." />
      <SettingsNav />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="d-surface" style={{ padding: 'var(--d-surface-p)', borderColor: 'color-mix(in srgb, var(--d-warning) 40%, var(--d-border))' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <AlertTriangle size={18} style={{ color: 'var(--d-warning)', flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Transfer ownership</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', marginBottom: '0.75rem' }}>
                Transfer this workspace to another admin. You will retain admin access unless you demote yourself.
              </p>
              <button className="d-interactive" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>
                Transfer ownership
              </button>
            </div>
          </div>
        </div>

        <div className="d-surface" style={{ padding: 'var(--d-surface-p)', borderColor: 'color-mix(in srgb, var(--d-error) 40%, var(--d-border))' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <AlertTriangle size={18} style={{ color: 'var(--d-error)', flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--d-error)' }}>Delete workspace</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', marginBottom: '0.75rem' }}>
                Permanently delete Northwind and all associated data: projects, team, billing history, and audit logs.
                This cannot be undone.
              </p>
              <button className="d-interactive" data-variant="danger" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>
                Delete workspace
              </button>
            </div>
          </div>
        </div>

        <div className="d-surface" style={{ padding: 'var(--d-surface-p)', borderColor: 'color-mix(in srgb, var(--d-error) 40%, var(--d-border))' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <AlertTriangle size={18} style={{ color: 'var(--d-error)', flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--d-error)' }}>Delete my account</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', marginBottom: '0.75rem' }}>
                Remove yourself from all workspaces and delete your user data.
              </p>
              <button className="d-interactive" data-variant="danger" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8rem' }}>
                Delete account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
