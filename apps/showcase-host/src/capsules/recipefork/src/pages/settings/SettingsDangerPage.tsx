import { css } from '@decantr/css';
import { AlertTriangle, Download } from 'lucide-react';

export function SettingsDangerPage() {
  return (
    <div className={css('_flex _col _gap4')} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <header>
        <h1 className="serif-display" style={{ fontSize: '1.5rem' }}>Danger Zone</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Irreversible account actions.</p>
      </header>

      <div className="feature-tile">
        <div className={css('_flex _aic _jcsb _gap4')}>
          <div>
            <h2 className="serif-display" style={{ fontSize: '1.0625rem' }}>Export your recipes</h2>
            <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>
              Download all your recipes as a JSON archive.
            </p>
          </div>
          <button className="d-interactive">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      <div className="feature-tile" style={{ borderColor: 'color-mix(in srgb, var(--d-error) 30%, var(--d-border))' }}>
        <div className={css('_flex _aic _gap2')} style={{ marginBottom: '0.5rem' }}>
          <AlertTriangle size={18} style={{ color: 'var(--d-error)' }} />
          <h2 className="serif-display" style={{ fontSize: '1.0625rem', color: 'var(--d-error)' }}>Delete account</h2>
        </div>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginBottom: '1rem' }}>
          This permanently deletes your account, recipes, collections, and followers. We can't recover any of it.
        </p>
        <button className="d-interactive" data-variant="danger">
          Delete account
        </button>
      </div>
    </div>
  );
}
