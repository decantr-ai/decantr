import { css } from '@decantr/css';

const sessions = [
  { device: 'Chrome on macOS', location: 'San Francisco, US', lastActive: 'Now', current: true },
  { device: 'Firefox on Windows', location: 'New York, US', lastActive: '2 hours ago', current: false },
  { device: 'Safari on iPhone', location: 'San Francisco, US', lastActive: '1 day ago', current: false },
];

export function SecurityPage() {
  return (
    <div className={css('_flex _col _flex1 _overauto _px8 _py8')}>
      <div style={{ maxWidth: 640 }}>
        <h1 className={css('_heading2 _fgtext')} style={{ marginBottom: 'var(--d-gap-2)' }}>Security</h1>
        <p className={css('_textsm _fgmuted')} style={{ marginBottom: 'var(--d-gap-8)' }}>
          Manage your password, MFA, and active sessions
        </p>

        <div className={css('_flex _col _gap8')}>
          {/* Password */}
          <div className={css('_p6 _flex _col _gap4') + ' carbon-card'}>
            <div className={css('_flex _jcsb _aic')}>
              <div>
                <p className={css('_textsm _fontsemi _fgtext')}>Password</p>
                <p className={css('_textxs _fgmuted')}>Last changed 30 days ago</p>
              </div>
              <button
                className={css('_textsm _fgmuted _px4 _py2 _rounded _pointer')}
                style={{ border: '1px solid var(--d-border)', background: 'transparent' }}
              >
                Change
              </button>
            </div>
          </div>

          {/* MFA */}
          <div className={css('_p6 _flex _col _gap4') + ' carbon-card'}>
            <div className={css('_flex _jcsb _aic')}>
              <div>
                <p className={css('_textsm _fontsemi _fgtext')}>Two-Factor Authentication</p>
                <p className={css('_textxs _fgmuted')}>Add an extra layer of security</p>
              </div>
              <span
                className={css('_textxs _fontsemi _px3 _py1 _rounded')}
                style={{ background: 'color-mix(in srgb, var(--d-success) 15%, transparent)', color: 'var(--d-success)' }}
              >
                Enabled
              </span>
            </div>
            <button
              className={css('_textsm _fgmuted _px4 _py2 _rounded _pointer')}
              style={{ border: '1px solid var(--d-border)', background: 'transparent', width: 'fit-content' }}
            >
              Manage
            </button>
          </div>

          {/* Sessions */}
          <div className={css('_flex _col _gap4')}>
            <div>
              <h2 className={css('_textlg _fontsemi _fgtext')} style={{ marginBottom: 'var(--d-gap-1)' }}>
                Active Sessions
              </h2>
              <p className={css('_textxs _fgmuted')}>Devices currently signed in to your account</p>
            </div>
            {sessions.map((s, i) => (
              <div key={i} className={css('_flex _aic _jcsb _p4') + ' carbon-glass'}>
                <div>
                  <p className={css('_textsm _fgtext _flex _aic _gap2')}>
                    {s.device}
                    {s.current && (
                      <span
                        className={css('_textxs _fontsemi _px2 _py0 _rounded')}
                        style={{ background: 'color-mix(in srgb, var(--d-primary) 15%, transparent)', color: 'var(--d-primary)' }}
                      >
                        Current
                      </span>
                    )}
                  </p>
                  <p className={css('_textxs _fgmuted')}>{s.location} &middot; {s.lastActive}</p>
                </div>
                {!s.current && (
                  <button
                    className={css('_textxs _fgerror _pointer')}
                    style={{ border: 'none', background: 'transparent' }}
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
