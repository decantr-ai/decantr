import { css } from '@decantr/css';

export function ProfilePage() {
  return (
    <div className={css('_flex _col _flex1 _overauto _px8 _py8')}>
      <div style={{ maxWidth: 640 }}>
        <h1 className={css('_heading2 _fgtext')} style={{ marginBottom: 'var(--d-gap-2)' }}>Profile</h1>
        <p className={css('_textsm _fgmuted')} style={{ marginBottom: 'var(--d-gap-8)' }}>
          Manage your personal information
        </p>

        <div className={css('_flex _col _gap8')}>
          {/* Avatar */}
          <div className={css('_flex _aic _gap6 _p6') + ' carbon-card'}>
            <div
              className={css('_flex _aic _jcc _fontsemi _fgprimary _textxl _shrink0')}
              style={{
                width: 64,
                height: 64,
                borderRadius: 'var(--d-radius-full)',
                background: 'var(--d-surface-raised)',
                border: '1px solid var(--d-border)',
              }}
            >
              JD
            </div>
            <div className={css('_flex1')}>
              <p className={css('_textsm _fontsemi _fgtext')}>Jane Doe</p>
              <p className={css('_textxs _fgmuted')}>jane@company.com</p>
            </div>
            <button
              className={css('_textsm _fgmuted _px4 _py2 _rounded _pointer')}
              style={{ border: '1px solid var(--d-border)', background: 'transparent' }}
            >
              Change
            </button>
          </div>

          {/* Name */}
          <div className={css('_p6 _flex _col _gap4') + ' carbon-card'}>
            <div className={css('_flex _jcsb _aic')}>
              <div>
                <p className={css('_textsm _fontsemi _fgtext')}>Display Name</p>
                <p className={css('_textxs _fgmuted')}>How others see you in conversations</p>
              </div>
            </div>
            <input
              type="text"
              defaultValue="Jane Doe"
              className={css('_px4 _py3 _rounded _textsm _fgtext') + ' carbon-input'}
              style={{ background: 'var(--d-bg)', outline: 'none' }}
            />
          </div>

          {/* Email */}
          <div className={css('_p6 _flex _col _gap4') + ' carbon-card'}>
            <div>
              <p className={css('_textsm _fontsemi _fgtext')}>Email Address</p>
              <p className={css('_textxs _fgmuted')}>Used for login and notifications</p>
            </div>
            <input
              type="email"
              defaultValue="jane@company.com"
              className={css('_px4 _py3 _rounded _textsm _fgtext') + ' carbon-input'}
              style={{ background: 'var(--d-bg)', outline: 'none' }}
            />
          </div>

          {/* Bio */}
          <div className={css('_p6 _flex _col _gap4') + ' carbon-card'}>
            <div>
              <p className={css('_textsm _fontsemi _fgtext')}>Bio</p>
              <p className={css('_textxs _fgmuted')}>Brief description for your profile</p>
            </div>
            <textarea
              rows={3}
              defaultValue="Full-stack developer working on distributed systems."
              className={css('_px4 _py3 _rounded _textsm _fgtext') + ' carbon-input'}
              style={{ background: 'var(--d-bg)', outline: 'none', resize: 'vertical' }}
            />
          </div>

          <button
            className={css('_bgprimary _fgtext _fontsemi _py3 _rounded _textbase _pointer')}
            style={{ border: 'none', width: 'fit-content', padding: '0.75rem 2rem' }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
