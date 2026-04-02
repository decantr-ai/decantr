import { css } from '@decantr/css';
import { Download, Trash2, AlertTriangle } from 'lucide-react';
import { Button, Card } from '@/components';

export function DangerPage() {
  return (
    <div className={css('_flex _col _flex1 _p6 _gap4') + ' carbon-fade-slide'} style={{ maxWidth: 640 }}>
      <div>
        <h1 className={css('_heading3 _fontbold')}>Danger Zone</h1>
        <p className={css('_textsm _fgmuted _mt1')}>Irreversible account actions.</p>
      </div>

      {/* Export data */}
      <Card>
        <div className={css('_flex _row _aic _jcsb')}>
          <div className={css('_flex _col _gap1 _flex1')}>
            <span className={css('_fontsemi')}>Export data</span>
            <p className={css('_textsm _fgmuted')}>
              Download a copy of all your data including agent configurations, chat history, and account settings.
            </p>
          </div>
          <Button variant="secondary" size="md">
            <Download size={14} />
            Export data
          </Button>
        </div>
      </Card>

      {/* Delete account */}
      <Card
        style={{
          border: '1px solid color-mix(in srgb, var(--d-error, #ef4444) 40%, transparent)',
        }}
      >
        <div className={css('_flex _col _gap4')}>
          <div className={css('_flex _row _aic _gap3')}>
            <div
              className={css('_flex _aic _jcc _rounded _shrink0')}
              style={{
                width: 36,
                height: 36,
                background: 'color-mix(in srgb, var(--d-error, #ef4444) 12%, var(--d-surface))',
              }}
            >
              <AlertTriangle size={16} style={{ color: 'var(--d-error, #ef4444)' }} />
            </div>
            <div className={css('_flex _col _gap1')}>
              <span className={css('_fontsemi')}>Delete account</span>
              <p className={css('_textsm _fgmuted')}>
                Permanently remove your account and all associated data. This action cannot be undone.
              </p>
            </div>
          </div>
          <div className={css('_flex _row _aic _jcsb')}>
            <p className={css('_textxs _fgmuted')}>
              All deployed agents will be terminated immediately.
            </p>
            <Button variant="danger" size="md">
              <Trash2 size={14} />
              Delete account
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
