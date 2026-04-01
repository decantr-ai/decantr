import { css } from '@decantr/css';

export function PreferencesPage() {
  return (
    <div className={css('_flex _col _flex1 _overauto _px8 _py8')}>
      <div style={{ maxWidth: 640 }}>
        <h1 className={css('_heading2 _fgtext')} style={{ marginBottom: 'var(--d-gap-2)' }}>Preferences</h1>
        <p className={css('_textsm _fgmuted')} style={{ marginBottom: 'var(--d-gap-8)' }}>
          Customize your Carbon AI experience
        </p>

        <div className={css('_flex _col _gap8')}>
          {/* Theme */}
          <div className={css('_p6 _flex _col _gap4') + ' carbon-card'}>
            <div>
              <p className={css('_textsm _fontsemi _fgtext')}>Theme</p>
              <p className={css('_textxs _fgmuted')}>Choose your preferred color scheme</p>
            </div>
            <div className={css('_flex _gap3')}>
              {['Dark', 'Light', 'System'].map((t) => (
                <button
                  key={t}
                  className={css(
                    '_textsm _px4 _py2 _rounded _pointer',
                    t === 'Dark' ? '_bgprimary _fgtext' : '_fgmuted',
                  )}
                  style={{
                    border: t === 'Dark' ? 'none' : '1px solid var(--d-border)',
                    background: t === 'Dark' ? undefined : 'transparent',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className={css('_p6 _flex _col _gap4') + ' carbon-card'}>
            <div>
              <p className={css('_textsm _fontsemi _fgtext')}>Language</p>
              <p className={css('_textxs _fgmuted')}>Set your preferred language for the interface</p>
            </div>
            <select
              className={css('_px4 _py3 _rounded _textsm _fgtext _pointer') + ' carbon-input'}
              style={{ background: 'var(--d-bg)', outline: 'none' }}
              defaultValue="en"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="ja">Japanese</option>
            </select>
          </div>

          {/* Notifications */}
          <div className={css('_p6 _flex _col _gap4') + ' carbon-card'}>
            <div>
              <p className={css('_textsm _fontsemi _fgtext')}>Notifications</p>
              <p className={css('_textxs _fgmuted')}>Control what emails you receive</p>
            </div>
            <div className={css('_flex _col _gap3')}>
              {[
                { label: 'Product updates', desc: 'New features and improvements' },
                { label: 'Security alerts', desc: 'Login from new devices' },
                { label: 'Usage reports', desc: 'Weekly activity summary' },
              ].map((n) => (
                <label key={n.label} className={css('_flex _aic _jcsb _pointer')}>
                  <div>
                    <p className={css('_textsm _fgtext')}>{n.label}</p>
                    <p className={css('_textxs _fgmuted')}>{n.desc}</p>
                  </div>
                  <input type="checkbox" defaultChecked style={{ accentColor: 'var(--d-primary)' }} />
                </label>
              ))}
            </div>
          </div>

          {/* Code preferences */}
          <div className={css('_p6 _flex _col _gap4') + ' carbon-card'}>
            <div>
              <p className={css('_textsm _fontsemi _fgtext')}>Code Style</p>
              <p className={css('_textxs _fgmuted')}>Default settings for AI-generated code</p>
            </div>
            <div className={css('_flex _gap3')}>
              <div className={css('_flex _col _gap2 _flex1')}>
                <label className={css('_textxs _fgmuted')}>Tab Width</label>
                <select
                  className={css('_px4 _py3 _rounded _textsm _fgtext') + ' carbon-input'}
                  style={{ background: 'var(--d-bg)', outline: 'none' }}
                  defaultValue="2"
                >
                  <option value="2">2 spaces</option>
                  <option value="4">4 spaces</option>
                  <option value="tab">Tabs</option>
                </select>
              </div>
              <div className={css('_flex _col _gap2 _flex1')}>
                <label className={css('_textxs _fgmuted')}>Quotes</label>
                <select
                  className={css('_px4 _py3 _rounded _textsm _fgtext') + ' carbon-input'}
                  style={{ background: 'var(--d-bg)', outline: 'none' }}
                  defaultValue="single"
                >
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                </select>
              </div>
            </div>
          </div>

          <button
            className={css('_bgprimary _fgtext _fontsemi _py3 _rounded _textbase _pointer')}
            style={{ border: 'none', width: 'fit-content', padding: '0.75rem 2rem' }}
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
