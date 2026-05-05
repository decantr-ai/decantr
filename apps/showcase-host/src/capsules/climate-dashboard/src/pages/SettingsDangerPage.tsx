import { useState } from 'react';
import { css } from '@decantr/css';
import { AlertTriangle, Trash2, Download } from 'lucide-react';

export function SettingsDangerPage() {
  const [confirmText, setConfirmText] = useState('');

  return (
    <div className={css('_flex _col _gap6')}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Danger Zone</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>Irreversible account actions</p>
      </div>

      {/* Export Data */}
      <div className="d-surface earth-card">
        <div className={css('_flex _jcsb _aic')}>
          <div>
            <div className={css('_flex _aic _gap2')} style={{ marginBottom: '0.25rem' }}>
              <Download size={18} style={{ color: 'var(--d-primary)' }} />
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Export All Data</h2>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>
              Download all your emissions data, reports, and supplier records as a ZIP archive.
            </p>
          </div>
          <button className="d-interactive">Export</button>
        </div>
      </div>

      {/* Delete Account */}
      <div className="d-surface" style={{ borderColor: 'var(--d-error)', padding: 'var(--d-surface-p)' }}>
        <div className={css('_flex _aic _gap2')} style={{ marginBottom: '0.75rem' }}>
          <AlertTriangle size={18} style={{ color: 'var(--d-error)' }} />
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--d-error)' }}>Delete Account</h2>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', marginBottom: '1rem' }}>
          Permanently delete your account, all emissions data, supplier records, reports, and offset purchase history. This action cannot be undone.
        </p>
        <div className={css('_flex _col _gap3')}>
          <div className={css('_flex _col _gap1')}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
              Type <strong>DELETE</strong> to confirm
            </label>
            <input
              className="d-control"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder="DELETE"
              style={{ maxWidth: 300 }}
            />
          </div>
          <div>
            <button
              className="d-interactive"
              data-variant="danger"
              disabled={confirmText !== 'DELETE'}
            >
              <Trash2 size={14} /> Delete Account Permanently
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
