import { SidebarAsideShell } from '@/components/SidebarAsideShell';
import { SettingsNav, SETTINGS_NAV_ITEMS } from './ProfilePage';

export function DangerPage() {
  return (
    <SidebarAsideShell navItems={SETTINGS_NAV_ITEMS} aside={<SettingsNav />}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 640 }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--d-text)', margin: 0 }}>Danger Zone</h1>

        <div className="d-surface" style={{ borderColor: 'var(--d-error)' }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--d-error)', margin: '0 0 0.5rem' }}>Export Data</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', margin: '0 0 1rem' }}>
            Download all your tracks, stems, splits, and session data.
          </p>
          <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
            Request Export
          </button>
        </div>

        <div className="d-surface" style={{ borderColor: 'var(--d-error)' }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--d-error)', margin: '0 0 0.5rem' }}>Delete Account</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', margin: '0 0 1rem' }}>
            Permanently delete your account and all associated data. This action cannot be undone. All tracks, sessions, and collaborations will be removed.
          </p>
          <button className="d-interactive" data-variant="danger" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
            Delete Account
          </button>
        </div>
      </div>
    </SidebarAsideShell>
  );
}
