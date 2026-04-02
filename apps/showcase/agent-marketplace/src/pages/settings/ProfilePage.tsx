import { css } from '@decantr/css';
import { Camera } from 'lucide-react';
import { Button, Card, Input, Avatar } from '@/components';

export function ProfilePage() {
  return (
    <div className={css('_flex _col _flex1 _p6') + ' carbon-fade-slide'} style={{ maxWidth: 640 }}>
      <div className={css('_mb6')}>
        <h1 className={css('_heading3 _fontbold')}>Profile</h1>
        <p className={css('_textsm _fgmuted _mt1')}>Manage your personal information.</p>
      </div>

      {/* Avatar section */}
      <Card className={css('_mb4')}>
        <div className={css('_flex _row _aic _gap4')}>
          <div className={css('_rel _shrink0')}>
            <Avatar name="Alex Morgan" size="lg" />
            <button
              className={css('_abs _bottom0 _right0 _flex _aic _jcc _roundedfull _pointer _trans')}
              style={{
                width: 28,
                height: 28,
                background: 'var(--d-primary)',
                color: '#fff',
                border: '2px solid var(--d-surface)',
              }}
              aria-label="Change avatar"
            >
              <Camera size={12} />
            </button>
          </div>
          <div className={css('_flex _col')}>
            <span className={css('_fontsemi')}>Alex Morgan</span>
            <span className={css('_textsm _fgmuted')}>alex.morgan@agenthub.io</span>
          </div>
        </div>
      </Card>

      {/* Personal info form */}
      <Card>
        <div className={css('_flex _col _gap4')}>
          <span className={css('_fontsemi')}>Personal information</span>
          <div className={css('_grid _gc1 _sm:gc2 _gap4')}>
            <Input label="First name" defaultValue="Alex" />
            <Input label="Last name" defaultValue="Morgan" />
          </div>
          <Input label="Email" type="email" defaultValue="alex.morgan@agenthub.io" />
          <div className={css('_flex _col _gap1')}>
            <label className={css('_textsm _fontsemi _fgtext')}>Bio</label>
            <textarea
              className="carbon-input"
              rows={3}
              defaultValue="Platform engineer building with AI agents. Based in San Francisco."
              style={{ resize: 'vertical' }}
            />
          </div>
          <div className={css('_flex _jcfe')}>
            <Button variant="primary" size="md">Save changes</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
