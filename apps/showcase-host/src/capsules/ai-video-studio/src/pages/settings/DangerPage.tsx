import { AlertTriangle } from 'lucide-react';
import { SettingsLayout } from '@/components/SettingsLayout';

export function DangerPage() {
  return (
    <SettingsLayout>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--d-content-gap)' }}>Danger Zone</h2>
      <div className="d-surface" style={{ borderColor: 'var(--d-error)', display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <AlertTriangle size={20} style={{ color: 'var(--d-error)', flexShrink: 0, marginTop: 2 }} />
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Delete account</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)', lineHeight: 1.6 }}>
              Permanently delete your account and all associated projects, characters, prompts, and render history. This action cannot be undone.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>Type "DELETE" to confirm</label>
          <input className="d-control" placeholder='Type "DELETE"' style={{ borderColor: 'color-mix(in srgb, var(--d-error) 40%, var(--d-border))' }} />
        </div>
        <button className="d-interactive" data-variant="danger" style={{ alignSelf: 'flex-start', padding: '6px 16px', fontSize: '0.8rem' }}>
          Delete Account
        </button>
      </div>
    </SettingsLayout>
  );
}
