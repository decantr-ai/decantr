import { css } from '@decantr/css';
import { SettingsNav } from './SettingsProfilePage';
import { AlertTriangle } from 'lucide-react';

export function SettingsDangerPage() {
  return (
    <div className={css('_flex _col _gap6')} style={{ maxWidth: 900 }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Settings</h1>

      <div className={css('_flex _gap6')}>
        <SettingsNav />

        <div style={{ flex: 1 }}>
          <div className="d-surface gov-card" style={{ padding: '1.5rem', borderColor: 'var(--d-error)' }}>
            <div className={css('_flex _aic _gap3 _mb4')}>
              <AlertTriangle size={20} style={{ color: 'var(--d-error)' }} />
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--d-error)' }}>Danger Zone</h2>
            </div>

            <div className={css('_flex _col _gap5')}>
              {/* Export Data */}
              <div className={css('_flex _jcsb _aic')} style={{ padding: '1rem 0', borderBottom: '1px solid var(--d-border)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Export Your Data</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>
                    Download all your civic engagement data including petitions, votes, and comments
                  </div>
                </div>
                <button className="d-interactive" style={{ fontSize: '0.8125rem', flexShrink: 0 }}>
                  Export Data
                </button>
              </div>

              {/* Deactivate */}
              <div className={css('_flex _jcsb _aic')} style={{ padding: '1rem 0', borderBottom: '1px solid var(--d-border)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Deactivate Account</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>
                    Temporarily disable your account. You can reactivate it anytime.
                  </div>
                </div>
                <button className="d-interactive" data-variant="danger" style={{ fontSize: '0.8125rem', flexShrink: 0 }}>
                  Deactivate
                </button>
              </div>

              {/* Delete */}
              <div className={css('_flex _jcsb _aic')} style={{ padding: '1rem 0' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--d-error)' }}>Delete Account</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </div>
                </div>
                <button className="d-interactive" data-variant="danger" style={{ fontSize: '0.8125rem', flexShrink: 0 }}>
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
