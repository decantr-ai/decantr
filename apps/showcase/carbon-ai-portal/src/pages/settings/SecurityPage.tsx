import { css } from '@decantr/css';
import { Shield, Smartphone, Monitor, Globe } from 'lucide-react';
import { Button, Card, Input, Badge, Toggle } from '@/components';
import { useState } from 'react';

const sessions = [
  { device: 'MacBook Pro', location: 'San Francisco, CA', active: true, icon: Monitor, lastActive: 'Now' },
  { device: 'iPhone 15', location: 'San Francisco, CA', active: false, icon: Smartphone, lastActive: '2 hours ago' },
  { device: 'Chrome on Windows', location: 'New York, NY', active: false, icon: Globe, lastActive: '3 days ago' },
];

export function SecurityPage() {
  const [mfaEnabled, setMfaEnabled] = useState(false);

  return (
    <div className={css('_flex _col _flex1 _overyauto _p6')}>
      <div style={{ maxWidth: 640, marginInline: 'auto', width: '100%' }}>
        <h1 className={css('_heading3 _mb1')}>Security</h1>
        <p className={css('_textsm _fgmuted _mb6')}>Manage your account security and sessions.</p>

        <div className={css('_flex _col _gap6')}>
          {/* Change password */}
          <Card>
            <h2 className={css('_fontsemi _textbase _mb4')}>Change password</h2>
            <form className={css('_flex _col _gap4')} onSubmit={(e) => e.preventDefault()}>
              <Input label="Current password" type="password" placeholder="Enter current password" />
              <Input label="New password" type="password" placeholder="Enter new password" />
              <Input label="Confirm password" type="password" placeholder="Confirm new password" />
              <div className={css('_flex _jcfe')}>
                <Button variant="primary">Update password</Button>
              </div>
            </form>
          </Card>

          {/* MFA */}
          <Card>
            <div className={css('_flex _aic _jcsb')}>
              <div className={css('_flex _aic _gap3')}>
                <Shield size={20} style={{ color: 'var(--d-primary)' }} />
                <div>
                  <h2 className={css('_fontsemi _textbase')}>Two-factor authentication</h2>
                  <p className={css('_textsm _fgmuted _mt1')}>Add an extra layer of security to your account.</p>
                </div>
              </div>
              <Toggle checked={mfaEnabled} onChange={setMfaEnabled} label="Toggle MFA" />
            </div>
          </Card>

          {/* Sessions */}
          <Card>
            <h2 className={css('_fontsemi _textbase _mb4')}>Active sessions</h2>
            <div className={css('_flex _col _gap3')}>
              {sessions.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.device}
                    className={css('_flex _aic _jcsb _py3')}
                    style={{ borderBottom: '1px solid var(--d-border)' }}
                  >
                    <div className={css('_flex _aic _gap3')}>
                      <Icon size={18} className={css('_fgmuted')} />
                      <div>
                        <div className={css('_textsm _fontsemi _flex _aic _gap2')}>
                          {s.device}
                          {s.active && <Badge variant="success">Active</Badge>}
                        </div>
                        <div className={css('_textxs _fgmuted')}>
                          {s.location} -- {s.lastActive}
                        </div>
                      </div>
                    </div>
                    {!s.active && (
                      <Button variant="ghost" size="sm">Revoke</Button>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
