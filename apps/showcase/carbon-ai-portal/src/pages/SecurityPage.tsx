import { css } from '@decantr/css';
import { Button } from '../components/Button';
import { InputField } from '../components/InputField';
import { SettingsNav } from './ProfilePage';
import {
  Save,
  ShieldCheck,
  Monitor,
  Smartphone,
  Trash2,
} from 'lucide-react';

const sessions = [
  { device: 'MacBook Pro', icon: <Monitor size={16} />, location: 'San Francisco, CA', lastActive: 'Now', current: true },
  { device: 'iPhone 15', icon: <Smartphone size={16} />, location: 'San Francisco, CA', lastActive: '2h ago', current: false },
  { device: 'Chrome on Windows', icon: <Monitor size={16} />, location: 'New York, NY', lastActive: '3 days ago', current: false },
];

export function SecurityPage() {
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
            <h1 className={css('_heading3 _fgtext')}>Security</h1>
            <p className={css('_textsm _fgmuted')}>
              Manage your password, two-factor authentication, and active sessions.
            </p>
          </div>

          {/* Change password */}
          <form
            className={css('_flex _col _gap4 _p5 _rounded') + ' carbon-card'}
            onSubmit={(e) => e.preventDefault()}
          >
            <h2 className={css('_fontsemi _fgtext')}>Change password</h2>
            <InputField label="Current password" type="password" placeholder="Enter current password" />
            <InputField label="New password" type="password" placeholder="Enter new password" />
            <InputField label="Confirm new password" type="password" placeholder="Confirm new password" />
            <div className={css('_flex _jcfe')}>
              <Button variant="primary" icon={<Save size={16} />} type="submit">
                Update password
              </Button>
            </div>
          </form>

          {/* MFA */}
          <div className={css('_flex _col _gap4 _p5 _rounded') + ' carbon-card'}>
            <div className={css('_flex _jcsb _aic')}>
              <div className={css('_flex _col _gap1')}>
                <h2 className={css('_fontsemi _fgtext')}>Two-factor authentication</h2>
                <p className={css('_textsm _fgmuted')}>
                  Add an extra layer of security to your account.
                </p>
              </div>
              <div className={css('_flex _aic _gap2')}>
                <ShieldCheck size={16} style={{ color: 'var(--d-success)' }} />
                <span className={css('_textsm _fgsuccess _fontsemi')}>Enabled</span>
              </div>
            </div>
            <div className={css('_flex _gap3')}>
              <Button variant="secondary" size="sm">
                Reconfigure
              </Button>
              <Button variant="ghost" size="sm">
                Disable
              </Button>
            </div>
          </div>

          {/* Sessions */}
          <div className={css('_flex _col _gap4 _p5 _rounded') + ' carbon-card'}>
            <h2 className={css('_fontsemi _fgtext')}>Active sessions</h2>
            <div className={css('_flex _col')}>
              {sessions.map((s, i) => (
                <div
                  key={i}
                  className={css('_flex _aic _jcsb _py3 _px1') + ' session-row'}
                >
                  <div className={css('_flex _aic _gap3')}>
                    <span style={{ color: 'var(--d-text-muted)' }}>{s.icon}</span>
                    <div className={css('_flex _col _gap0')}>
                      <div className={css('_flex _aic _gap2')}>
                        <span className={css('_textsm _fontsemi _fgtext')}>{s.device}</span>
                        {s.current && (
                          <span
                            className={css('_textxs _fontsemi _fgsuccess _px2 _rounded')}
                            style={{ background: 'rgba(34,197,94,0.1)' }}
                          >
                            Current
                          </span>
                        )}
                      </div>
                      <span className={css('_textxs _fgmuted')}>
                        {s.location} -- {s.lastActive}
                      </span>
                    </div>
                  </div>
                  {!s.current && (
                    <button
                      className={css('_flex _aic _jcc _p1 _rounded _bordernone _trans _pointer _fgerror') + ' btn-ghost'}
                      aria-label={`Revoke session on ${s.device}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
