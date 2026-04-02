import { css } from '@decantr/css';
import { Camera } from 'lucide-react';
import { Button, Card, Input, Avatar } from '@/components';

export function ProfilePage() {
  return (
    <div className={css('_flex _col _flex1 _overyauto _p6')}>
      <div style={{ maxWidth: 640, marginInline: 'auto', width: '100%' }}>
        <h1 className={css('_heading3 _mb1')}>Profile</h1>
        <p className={css('_textsm _fgmuted _mb6')}>Manage your personal information.</p>

        <div className={css('_flex _col _gap6')}>
          {/* Avatar section */}
          <Card>
            <div className={css('_flex _aic _gap4')}>
              <div className={css('_rel')}>
                <Avatar name="Jane Doe" size="lg" />
                <button
                  className={css('_abs _bottom0 _right0 _flex _aic _jcc _roundedfull _p1') + ' btn-secondary'}
                  style={{ width: 24, height: 24 }}
                  aria-label="Change avatar"
                >
                  <Camera size={12} />
                </button>
              </div>
              <div>
                <div className={css('_fontsemi')}>Jane Doe</div>
                <div className={css('_textsm _fgmuted')}>jane@example.com</div>
              </div>
            </div>
          </Card>

          {/* Personal info */}
          <Card>
            <h2 className={css('_fontsemi _textbase _mb4')}>Personal information</h2>
            <form className={css('_flex _col _gap4')} onSubmit={(e) => e.preventDefault()}>
              <div className={css('_grid _gc1 _sm:gc2 _gap4')}>
                <Input label="First name" defaultValue="Jane" />
                <Input label="Last name" defaultValue="Doe" />
              </div>
              <Input label="Email" type="email" defaultValue="jane@example.com" />
              <Input label="Bio" placeholder="Tell us about yourself" />
              <div className={css('_flex _jcfe')}>
                <Button variant="primary">Save changes</Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
