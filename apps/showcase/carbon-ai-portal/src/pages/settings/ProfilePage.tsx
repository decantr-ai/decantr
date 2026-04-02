import { css } from '@decantr/css';
import { Camera } from 'lucide-react';
import { ChatPortalShell } from '@/layouts/ChatPortalShell';
import { Input, Button, Card, Avatar } from '@/components';

export function ProfilePage() {
  return (
    <ChatPortalShell mode="settings">
      <div className={css('_flex1 _overyauto _p6')}>
        <div className={css('_flex _col _gap6')} style={{ maxWidth: '680px' }}>
          <div className={css('_flex _col _gap1')}>
            <h2 className={css('_text2xl _fontsemi _fgtext')}>Profile</h2>
            <p className={css('_textsm _fgmuted')}>Manage your personal information and profile picture.</p>
          </div>

          <Card>
            <div className={css('_flex _col _gap6')}>
              {/* Avatar section */}
              <div className={css('_flex _aic _gap4')}>
                <div className={css('_rel')}>
                  <Avatar size="lg" />
                  <button
                    className={css('_abs _flex _aic _jcc _roundedfull _bgprimary _trans')}
                    style={{ bottom: 0, right: 0, width: '28px', height: '28px' }}
                    title="Change avatar"
                  >
                    <Camera size={14} color="#fff" />
                  </button>
                </div>
                <div className={css('_flex _col _gap1')}>
                  <span className={css('_fontmedium _fgtext')}>Profile picture</span>
                  <span className={css('_textxs _fgmuted')}>PNG, JPG, or GIF. Max 2MB.</span>
                </div>
              </div>

              <div className={css('_wfull')} style={{ height: '1px', background: 'var(--d-border)' }} />

              {/* Form fields */}
              <div className={css('_flex _col _gap4')}>
                <div className={css('_grid _gap4')} style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <Input label="First name" defaultValue="John" />
                  <Input label="Last name" defaultValue="Doe" />
                </div>
                <Input label="Email" type="email" defaultValue="john@example.com" />
                <Input label="Username" defaultValue="johndoe" />
                <div className={css('_flex _col _gap1')}>
                  <label className={css('_textsm _fontmedium _fgtext')}>Bio</label>
                  <textarea
                    className={css('_wfull _px3 _py2 _textbase _rounded _bgbg _fgtext _bw1') + ' carbon-input'}
                    rows={3}
                    placeholder="Tell us about yourself..."
                    defaultValue="Software engineer interested in AI and developer tools."
                  />
                </div>
              </div>

              <div className={css('_flex _jcfe _gap3')}>
                <Button variant="ghost">Cancel</Button>
                <Button variant="primary">Save changes</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </ChatPortalShell>
  );
}
