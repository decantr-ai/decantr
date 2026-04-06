import { css } from '@decantr/css';
import { AlertTriangle } from 'lucide-react';
import { SettingsLayout } from '../components/SettingsLayout';

export function SettingsDangerPage() {
  return (
    <SettingsLayout>
      <h1 style={{ fontWeight: 500, fontSize: '1.25rem', marginBottom: '1.25rem' }}>Danger Zone</h1>

      <div className="lab-panel" style={{ padding: '1.25rem', borderColor: 'var(--d-error)' }}>
        <div className={css('_flex _aic _gap2')} style={{ marginBottom: '1rem' }}>
          <AlertTriangle size={18} style={{ color: 'var(--d-error)' }} />
          <h2 style={{ fontWeight: 500, fontSize: '0.9375rem', color: 'var(--d-error)' }}>Destructive Actions</h2>
        </div>

        <div className={css('_flex _col _gap6')}>
          {/* Export data */}
          <div className={css('_flex _aic _jcsb')}>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>Export All Data</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Download all your notebook entries, experiments, and datasets as a ZIP archive.</p>
            </div>
            <button className="d-interactive" style={{ borderRadius: 2, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
              Export Data
            </button>
          </div>

          {/* Transfer ownership */}
          <div className={css('_flex _aic _jcsb')} style={{ borderTop: '1px solid var(--d-border)', paddingTop: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>Transfer Notebook Ownership</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Transfer your lab notebook to another researcher. This action is irreversible.</p>
            </div>
            <button className="d-interactive" data-variant="danger" style={{ borderRadius: 2, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
              Transfer
            </button>
          </div>

          {/* Delete account */}
          <div className={css('_flex _aic _jcsb')} style={{ borderTop: '1px solid var(--d-border)', paddingTop: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>Delete Account</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Permanently delete your account and all associated data. This cannot be undone.</p>
            </div>
            <button className="d-interactive" data-variant="danger" style={{ borderRadius: 2, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </SettingsLayout>
  );
}
