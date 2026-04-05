import { SettingsNav } from '@/components/SettingsNav';
import { AlertTriangle } from 'lucide-react';

export function SettingsDangerPage() {
  return (
    <div>
      <h1 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12 }}>Settings</h1>
      <SettingsNav />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div className="fin-alert" data-severity="critical">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <AlertTriangle size={14} style={{ color: 'var(--d-error)' }} />
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Delete Workspace</div>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--d-text-muted)', lineHeight: 1.55, marginBottom: 10 }}>
            Permanently delete this workspace, all metrics, logs, traces, and alert rules.
            This action cannot be undone. Data retention policies will be bypassed.
          </p>
          <button className="d-interactive" data-variant="danger" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
            Delete workspace
          </button>
        </div>
        <div className="fin-alert" data-severity="high">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <AlertTriangle size={14} style={{ color: 'var(--d-error)' }} />
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Export & Delete Account</div>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--d-text-muted)', lineHeight: 1.55, marginBottom: 10 }}>
            Request a full data export, then permanently delete your account.
            All active sessions will be revoked immediately.
          </p>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="d-interactive" data-variant="ghost" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Request export</button>
            <button className="d-interactive" data-variant="danger" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Delete account</button>
          </div>
        </div>
        <div className="fin-alert" data-severity="medium">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <AlertTriangle size={14} style={{ color: 'var(--d-warning)' }} />
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Reset API Tokens</div>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--d-text-muted)', lineHeight: 1.55, marginBottom: 10 }}>
            Revoke all API tokens and generate new keys. Active integrations will need reconfiguration.
          </p>
          <button className="d-interactive" data-variant="ghost" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Rotate all tokens</button>
        </div>
      </div>
    </div>
  );
}
