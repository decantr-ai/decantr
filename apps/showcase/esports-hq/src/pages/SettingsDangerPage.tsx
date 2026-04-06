import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

export function SettingsDangerPage() {
  const [confirmText, setConfirmText] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-gap-6)', maxWidth: 600 }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--d-error)' }}>Danger Zone</h1>
        <p style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem' }}>Irreversible actions. Proceed with caution.</p>
      </div>

      {/* Export Data */}
      <div className="d-surface" style={{ padding: 'var(--d-surface-p)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>Export Data</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>Download all your team data as JSON.</div>
        </div>
        <button className="d-interactive" style={{ fontSize: '0.8rem' }}>Export</button>
      </div>

      {/* Delete Account */}
      <div className="d-surface" style={{
        padding: 'var(--d-surface-p)',
        borderColor: 'color-mix(in srgb, var(--d-error) 30%, transparent)',
        display: 'flex', flexDirection: 'column', gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={18} style={{ color: 'var(--d-error)' }} />
          <span style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--d-error)' }}>Delete Account</span>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)', lineHeight: 1.5 }}>
          This will permanently delete your account and all associated data including team configurations, VOD annotations, and scrim history. This action cannot be undone.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>Type &quot;DELETE&quot; to confirm</label>
          <input
            className="d-control"
            placeholder="DELETE"
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
          />
        </div>
        <button
          className="d-interactive"
          data-variant="danger"
          disabled={confirmText !== 'DELETE'}
          style={{ fontSize: '0.8rem', width: 'fit-content' }}
        >
          Delete My Account
        </button>
      </div>
    </div>
  );
}
