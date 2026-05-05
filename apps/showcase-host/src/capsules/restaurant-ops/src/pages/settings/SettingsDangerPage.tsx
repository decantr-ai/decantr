import { css } from '@decantr/css';
import { AlertTriangle, Trash2 } from 'lucide-react';

export function SettingsDangerPage() {
  return (
    <div className={css('_flex _col _gap4')} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <header>
        <h1 className="bistro-handwritten" style={{ fontSize: '1.5rem' }}>Danger Zone</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Irreversible actions. Be careful.</p>
      </header>

      <div className="bistro-feature-tile" style={{ borderColor: 'color-mix(in srgb, var(--d-error) 30%, var(--d-border))' }}>
        <div className={css('_flex _aic _gap2')} style={{ marginBottom: '0.75rem' }}>
          <AlertTriangle size={18} style={{ color: 'var(--d-error)' }} />
          <h3 className={css('_fontmedium')}>Export Data</h3>
        </div>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
          Download all your restaurant data including menus, customers, inventory, and reports in CSV format.
        </p>
        <button className="d-interactive" style={{ fontSize: '0.8125rem' }}>Export All Data</button>
      </div>

      <div className="bistro-feature-tile" style={{ borderColor: 'color-mix(in srgb, var(--d-error) 30%, var(--d-border))' }}>
        <div className={css('_flex _aic _gap2')} style={{ marginBottom: '0.75rem' }}>
          <Trash2 size={18} style={{ color: 'var(--d-error)' }} />
          <h3 className={css('_fontmedium')}>Delete Account</h3>
        </div>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
          Permanently delete your Tavola account and all associated restaurant data.
          This action cannot be undone.
        </p>
        <button className="d-interactive" data-variant="danger" style={{ fontSize: '0.8125rem' }}>
          <Trash2 size={14} /> Delete Account
        </button>
      </div>
    </div>
  );
}
