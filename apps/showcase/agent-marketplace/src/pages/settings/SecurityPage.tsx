import { useState } from 'react';
import { css } from '@decantr/css';
import { Monitor, Globe, Smartphone } from 'lucide-react';
import { Button, Card, Input, Badge, Toggle } from '@/components';

const sessions = [
  { id: 1, icon: Monitor, device: 'Chrome on macOS', location: 'San Francisco, CA', time: 'Active now', current: true },
  { id: 2, icon: Globe, device: 'Firefox on Windows', location: 'New York, NY', time: '2 hours ago', current: false },
  { id: 3, icon: Smartphone, device: 'Mobile App on iOS', location: 'Chicago, IL', time: '1 day ago', current: false },
];

export function SecurityPage() {
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <div className={css('_flex _col _flex1 _p6 _gap4') + ' carbon-fade-slide'} style={{ maxWidth: 640 }}>
      <div>
        <h1 className={css('_heading3 _fontbold')}>Security</h1>
        <p className={css('_textsm _fgmuted _mt1')}>Manage your account security settings.</p>
      </div>

      {/* Password */}
      <Card>
        <div className={css('_flex _col _gap4')}>
          <span className={css('_fontsemi')}>Change password</span>
          <Input label="Current password" type="password" placeholder="Enter current password" />
          <Input label="New password" type="password" placeholder="Enter new password" />
          <Input label="Confirm password" type="password" placeholder="Confirm new password" />
          <div className={css('_flex _jcfe')}>
            <Button variant="primary" size="md">Update password</Button>
          </div>
        </div>
      </Card>

      {/* Two-factor authentication */}
      <Card>
        <div className={css('_flex _row _aic _jcsb')}>
          <div className={css('_flex _col _gap1')}>
            <span className={css('_fontsemi')}>Two-factor authentication</span>
            <p className={css('_textsm _fgmuted')}>
              Add an extra layer of security by requiring a verification code on each login.
            </p>
          </div>
          <Toggle checked={twoFactor} onChange={setTwoFactor} label="Enable 2FA" />
        </div>
      </Card>

      {/* Active sessions */}
      <Card>
        <div className={css('_flex _col _gap4')}>
          <span className={css('_fontsemi')}>Active sessions</span>
          {sessions.map((session) => {
            const Icon = session.icon;
            return (
              <div
                key={session.id}
                className={css('_flex _row _aic _gap3')}
                style={{
                  paddingBottom: 12,
                  borderBottom: '1px solid color-mix(in srgb, var(--d-muted) 12%, var(--d-surface))',
                }}
              >
                <div
                  className={css('_flex _aic _jcc _rounded _shrink0')}
                  style={{
                    width: 36,
                    height: 36,
                    background: 'color-mix(in srgb, var(--d-muted) 12%, var(--d-surface))',
                  }}
                >
                  <Icon size={16} style={{ color: 'var(--d-muted)' }} />
                </div>
                <div className={css('_flex _col _flex1 _minh0')}>
                  <span className={css('_textsm _fontsemi')}>{session.device}</span>
                  <span className={css('_textxs _fgmuted')}>
                    {session.location} -- {session.time}
                  </span>
                </div>
                {session.current ? (
                  <Badge variant="success">Current session</Badge>
                ) : (
                  <Button variant="ghost" size="sm">Revoke</Button>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
