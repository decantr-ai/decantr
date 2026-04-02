import { css } from '@decantr/css';
import { SettingsNav } from './ProfilePage';
import { Button } from '../components/Button';
import { AlertTriangle, Download, Trash2 } from 'lucide-react';

export function DangerPage() {
  return (
    <div className={css('_flex _flex1 _overauto')}>
      <div
        className={css('_flex _gap8 _p6')}
        style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}
      >
        <div className={css('_none _md:flex _col _shrink0')} style={{ width: '200px' }}>
          <SettingsNav />
        </div>

        <div className={css('_flex1 _flex _col _gap6')}>
          <div className={css('_flex _col _gap1')}>
            <h1 className={css('_heading3 _fgtext')}>Account</h1>
            <p className={css('_textsm _fgmuted')}>
              Export your data or permanently delete your account.
            </p>
          </div>

          {/* Export data */}
          <div className={css('_flex _col _gap4 _p5 _rounded') + ' carbon-card'}>
            <div className={css('_flex _aic _gap2')}>
              <Download size={18} style={{ color: 'var(--d-primary)' }} />
              <h2 className={css('_fontsemi _fgtext')}>Export data</h2>
            </div>
            <p className={css('_textsm _fgmuted')} style={{ lineHeight: 1.7 }}>
              Download a copy of all your conversations, settings, and account data. The export
              will be delivered as a ZIP file containing JSON and Markdown files.
            </p>
            <div className={css('_flex')}>
              <Button variant="secondary" icon={<Download size={16} />}>
                Request data export
              </Button>
            </div>
          </div>

          {/* Danger zone */}
          <div
            className={css('_flex _col _gap4 _p5 _rounded')}
            style={{
              background: 'var(--d-surface)',
              border: '1px solid var(--d-error)',
              borderRadius: 'var(--d-radius)',
            }}
          >
            <div className={css('_flex _aic _gap2')}>
              <AlertTriangle size={18} style={{ color: 'var(--d-error)' }} />
              <h2 className={css('_fontsemi _fgerror')}>Danger zone</h2>
            </div>
            <p className={css('_textsm _fgmuted')} style={{ lineHeight: 1.7 }}>
              Permanently delete your account and all associated data. This action cannot be undone.
              All conversations, files, and settings will be permanently removed.
            </p>
            <div className={css('_flex')}>
              <Button variant="danger" icon={<Trash2 size={16} />}>
                Delete my account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
