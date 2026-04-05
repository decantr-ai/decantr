import { css } from '@decantr/css';
import { AlertTriangle, Trash2, Download } from 'lucide-react';

export function SettingsDangerPage() {
  return (
    <div className={css('_flex _col _gap4')} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <header>
        <h1 className="display-heading" style={{ fontSize: '1.5rem' }}>Danger Zone</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Be careful — these actions are permanent.</p>
      </header>

      <div className="feature-tile">
        <div className={css('_flex _aic _gap2')} style={{ marginBottom: '0.5rem' }}>
          <Download size={16} style={{ color: 'var(--d-primary)' }} />
          <h2 className="display-heading" style={{ fontSize: '1rem' }}>Export your data</h2>
        </div>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginBottom: '0.875rem' }}>
          Download everything — events, posts, tickets, and messages.
        </p>
        <button className="d-interactive" data-variant="ghost">
          <Download size={14} /> Request Export
        </button>
      </div>

      <div className="feature-tile" style={{ border: '1px solid var(--d-error)' }}>
        <div className={css('_flex _aic _gap2')} style={{ marginBottom: '0.5rem' }}>
          <AlertTriangle size={16} style={{ color: 'var(--d-error)' }} />
          <h2 className="display-heading" style={{ fontSize: '1rem', color: 'var(--d-error)' }}>Delete account</h2>
        </div>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginBottom: '0.875rem' }}>
          This can't be undone. All your events, posts, and tickets will be gone.
        </p>
        <button className="d-interactive" data-variant="danger">
          <Trash2 size={14} /> Delete Account
        </button>
      </div>
    </div>
  );
}
