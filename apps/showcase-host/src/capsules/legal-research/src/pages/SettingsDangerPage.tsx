import { css } from '@decantr/css';
import { AlertTriangle } from 'lucide-react';

export function SettingsDangerPage() {
  return (
    <div className="d-surface" style={{ maxWidth: 600 }}>
      <div className={css('_flex _aic _gap3')} style={{ marginBottom: '1rem' }}>
        <AlertTriangle size={20} style={{ color: 'var(--d-error)' }} />
        <h2 className="counsel-header" style={{ fontSize: '1.125rem', color: 'var(--d-error)' }}>Danger Zone</h2>
      </div>
      <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', marginBottom: '1.25rem', fontFamily: 'Georgia, serif' }}>
        Once you delete your account, all of your data will be permanently removed. This action cannot be undone.
      </p>
      <div style={{ padding: '1rem', border: '1px solid var(--d-error)', borderRadius: 'var(--d-radius)', background: 'color-mix(in srgb, var(--d-error) 4%, transparent)' }}>
        <div className={css('_flex _aic _jcsb')}>
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>Delete Account</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Permanently delete your account and all associated data.</p>
          </div>
          <button className="d-interactive" data-variant="danger" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem', flexShrink: 0 }}>
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
