import { css } from '@decantr/css';
import { useState } from 'react';
import { Monitor, Smartphone, Globe, Trash2 } from 'lucide-react';
import { ChatPortalShell } from '@/layouts/ChatPortalShell';
import { Input, Button, Card, Toggle, Badge } from '@/components';

const sessions = [
  { id: '1', device: 'MacBook Pro', browser: 'Chrome 120', location: 'San Francisco, US', lastActive: 'Now', current: true, icon: Monitor },
  { id: '2', device: 'iPhone 15', browser: 'Safari', location: 'San Francisco, US', lastActive: '2 hours ago', current: false, icon: Smartphone },
  { id: '3', device: 'Windows PC', browser: 'Firefox 121', location: 'New York, US', lastActive: '3 days ago', current: false, icon: Globe },
];

export function SecurityPage() {
  const [mfaEnabled, setMfaEnabled] = useState(true);

  return (
    <ChatPortalShell mode="settings">
      <div className={css('_flex1 _overyauto _p6')}>
        <div className={css('_flex _col _gap6')} style={{ maxWidth: '680px' }}>
          <div className={css('_flex _col _gap1')}>
            <h2 className={css('_text2xl _fontsemi _fgtext')}>Security</h2>
            <p className={css('_textsm _fgmuted')}>Manage your password, two-factor authentication, and active sessions.</p>
          </div>

          {/* Password change */}
          <Card>
            <div className={css('_flex _col _gap4')}>
              <div className={css('_flex _col _gap1')}>
                <h3 className={css('_textlg _fontsemi _fgtext')}>Change password</h3>
                <p className={css('_textsm _fgmuted')}>Update your password regularly to keep your account secure.</p>
              </div>
              <Input label="Current password" type="password" placeholder="Enter current password" />
              <Input label="New password" type="password" placeholder="Enter new password" />
              <Input label="Confirm new password" type="password" placeholder="Confirm new password" />
              <div className={css('_flex _jcfe')}>
                <Button variant="primary">Update password</Button>
              </div>
            </div>
          </Card>

          {/* MFA */}
          <Card>
            <div className={css('_flex _aic _jcsb')}>
              <div className={css('_flex _col _gap1')}>
                <h3 className={css('_textlg _fontsemi _fgtext')}>Two-factor authentication</h3>
                <p className={css('_textsm _fgmuted')}>Add an extra layer of security to your account.</p>
              </div>
              <Toggle checked={mfaEnabled} onChange={setMfaEnabled} />
            </div>
            {mfaEnabled && (
              <div className={css('_mt4 _pt4')} style={{ borderTop: '1px solid var(--d-border)' }}>
                <div className={css('_flex _aic _gap3')}>
                  <Badge variant="success">Active</Badge>
                  <span className={css('_textsm _fgmuted')}>Authenticator app configured</span>
                </div>
              </div>
            )}
          </Card>

          {/* Sessions */}
          <Card>
            <div className={css('_flex _col _gap4')}>
              <div className={css('_flex _col _gap1')}>
                <h3 className={css('_textlg _fontsemi _fgtext')}>Active sessions</h3>
                <p className={css('_textsm _fgmuted')}>Manage your active sessions and revoke access on other devices.</p>
              </div>
              <div className={css('_flex _col _gap3')}>
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={css('_flex _aic _jcsb _p3 _rounded')}
                    style={{ background: 'var(--d-bg)', border: '1px solid var(--d-border)' }}
                  >
                    <div className={css('_flex _aic _gap3')}>
                      <session.icon size={20} className={css('_fgmuted')} />
                      <div className={css('_flex _col _gap1')}>
                        <div className={css('_flex _aic _gap2')}>
                          <span className={css('_textsm _fontmedium _fgtext')}>{session.device}</span>
                          <span className={css('_textxs _fgmuted')}>{session.browser}</span>
                          {session.current && <Badge variant="primary">Current</Badge>}
                        </div>
                        <span className={css('_textxs _fgmuted')}>
                          {session.location} -- {session.lastActive}
                        </span>
                      </div>
                    </div>
                    {!session.current && (
                      <button className={css('_flex _aic _jcc _p2 _rounded _trans') + ' btn-ghost'} title="Revoke session">
                        <Trash2 size={14} className={css('_fgerror')} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </ChatPortalShell>
  );
}
