import { css } from '@decantr/css';
import { AlertTriangle, Trash2, Download } from 'lucide-react';
import { Button, Card } from '@/components';

export function DangerPage() {
  return (
    <div className={css('_flex _col _flex1 _overyauto _p6')}>
      <div style={{ maxWidth: 640, marginInline: 'auto', width: '100%' }}>
        <h1 className={css('_heading3 _mb1')}>Danger Zone</h1>
        <p className={css('_textsm _fgmuted _mb6')}>Irreversible account actions.</p>

        <div className={css('_flex _col _gap6')}>
          {/* Export data */}
          <Card>
            <div className={css('_flex _aic _jcsb')}>
              <div className={css('_flex _aic _gap3')}>
                <Download size={20} className={css('_fgmuted')} />
                <div>
                  <h2 className={css('_fontsemi _textbase')}>Export your data</h2>
                  <p className={css('_textsm _fgmuted _mt1')}>
                    Download all your conversations and account data as a ZIP file.
                  </p>
                </div>
              </div>
              <Button variant="secondary" size="sm">Export</Button>
            </div>
          </Card>

          {/* Delete account */}
          <Card
            style={{ border: '1px solid color-mix(in srgb, var(--d-error) 40%, var(--d-border))' }}
          >
            <div className={css('_flex _gap3')}>
              <AlertTriangle size={20} style={{ color: 'var(--d-error)', flexShrink: 0, marginTop: 2 }} />
              <div className={css('_flex _col _gap3 _flex1')}>
                <div>
                  <h2 className={css('_fontsemi _textbase')}>Delete account</h2>
                  <p className={css('_textsm _fgmuted _mt1')}>
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                </div>
                <div>
                  <Button variant="danger" size="sm">
                    <Trash2 size={14} />
                    Delete my account
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
