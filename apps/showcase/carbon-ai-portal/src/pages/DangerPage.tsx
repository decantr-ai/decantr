import { css } from '@decantr/css';

export function DangerPage() {
  return (
    <div className={css('_flex _col _flex1 _overauto _px8 _py8')}>
      <div style={{ maxWidth: 640 }}>
        <h1 className={css('_heading2 _fgtext')} style={{ marginBottom: 'var(--d-gap-2)' }}>Account</h1>
        <p className={css('_textsm _fgmuted')} style={{ marginBottom: 'var(--d-gap-8)' }}>
          Manage your account data and settings
        </p>

        <div className={css('_flex _col _gap8')}>
          {/* Export data */}
          <div className={css('_p6 _flex _col _gap4') + ' carbon-card'}>
            <div>
              <p className={css('_textsm _fontsemi _fgtext')}>Export Data</p>
              <p className={css('_textxs _fgmuted')}>
                Download all your conversations and account data as a JSON archive
              </p>
            </div>
            <button
              className={css('_textsm _fgtext _px4 _py2 _rounded _pointer')}
              style={{ border: '1px solid var(--d-border)', background: 'transparent', width: 'fit-content' }}
            >
              Request Export
            </button>
          </div>

          {/* Danger zone */}
          <div
            className={css('_p6 _flex _col _gap4')}
            style={{
              border: '1px solid var(--d-error)',
              borderRadius: 'var(--d-radius)',
              background: 'color-mix(in srgb, var(--d-error) 5%, var(--d-surface))',
            }}
          >
            <div>
              <p className={css('_textsm _fontsemi _fgerror')}>Danger Zone</p>
              <p className={css('_textxs _fgmuted')}>
                These actions are irreversible. Please proceed with caution.
              </p>
            </div>

            <div className={css('_flex _col _gap4')} style={{ borderTop: '1px solid var(--d-border)', paddingTop: 'var(--d-gap-4)' }}>
              <div className={css('_flex _jcsb _aic')}>
                <div>
                  <p className={css('_textsm _fgtext')}>Delete all conversations</p>
                  <p className={css('_textxs _fgmuted')}>Permanently remove all chat history</p>
                </div>
                <button
                  className={css('_textsm _fgerror _px4 _py2 _rounded _pointer')}
                  style={{ border: '1px solid var(--d-error)', background: 'transparent' }}
                >
                  Delete
                </button>
              </div>

              <div className={css('_flex _jcsb _aic')}>
                <div>
                  <p className={css('_textsm _fgtext')}>Delete account</p>
                  <p className={css('_textxs _fgmuted')}>Remove your account and all associated data</p>
                </div>
                <button
                  className={css('_textsm _fgtext _px4 _py2 _rounded _pointer')}
                  style={{ border: 'none', background: 'var(--d-error)' }}
                >
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
