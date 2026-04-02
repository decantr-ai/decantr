import { css } from '@decantr/css';
import { useState } from 'react';
import { Button, Card, Toggle } from '@/components';

export function PreferencesPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(false);
  const [compactMode, setCompactMode] = useState(false);

  return (
    <div className={css('_flex _col _flex1 _overyauto _p6')}>
      <div style={{ maxWidth: 640, marginInline: 'auto', width: '100%' }}>
        <h1 className={css('_heading3 _mb1')}>Preferences</h1>
        <p className={css('_textsm _fgmuted _mb6')}>Customize your experience.</p>

        <div className={css('_flex _col _gap6')}>
          {/* Appearance */}
          <Card>
            <h2 className={css('_fontsemi _textbase _mb4')}>Appearance</h2>
            <div className={css('_flex _col _gap4')}>
              <div className={css('_flex _aic _jcsb')}>
                <div>
                  <div className={css('_textsm _fontsemi')}>Dark mode</div>
                  <div className={css('_textxs _fgmuted')}>Use the dark color scheme</div>
                </div>
                <Toggle checked={darkMode} onChange={setDarkMode} label="Dark mode" />
              </div>
              <div className="carbon-divider" />
              <div className={css('_flex _aic _jcsb')}>
                <div>
                  <div className={css('_textsm _fontsemi')}>Compact mode</div>
                  <div className={css('_textxs _fgmuted')}>Reduce spacing for denser layouts</div>
                </div>
                <Toggle checked={compactMode} onChange={setCompactMode} label="Compact mode" />
              </div>
            </div>
          </Card>

          {/* Notifications */}
          <Card>
            <h2 className={css('_fontsemi _textbase _mb4')}>Notifications</h2>
            <div className={css('_flex _col _gap4')}>
              <div className={css('_flex _aic _jcsb')}>
                <div>
                  <div className={css('_textsm _fontsemi')}>Email notifications</div>
                  <div className={css('_textxs _fgmuted')}>Receive updates via email</div>
                </div>
                <Toggle checked={notifications} onChange={setNotifications} label="Email notifications" />
              </div>
              <div className="carbon-divider" />
              <div className={css('_flex _aic _jcsb')}>
                <div>
                  <div className={css('_textsm _fontsemi')}>Sound effects</div>
                  <div className={css('_textxs _fgmuted')}>Play sounds for new messages</div>
                </div>
                <Toggle checked={sounds} onChange={setSounds} label="Sound effects" />
              </div>
            </div>
          </Card>

          {/* Language */}
          <Card>
            <h2 className={css('_fontsemi _textbase _mb4')}>Language & Region</h2>
            <div className={css('_flex _col _gap4')}>
              <div className={css('_flex _aic _jcsb')}>
                <div>
                  <div className={css('_textsm _fontsemi')}>Language</div>
                  <div className={css('_textxs _fgmuted')}>English (US)</div>
                </div>
                <Button variant="ghost" size="sm">Change</Button>
              </div>
              <div className="carbon-divider" />
              <div className={css('_flex _aic _jcsb')}>
                <div>
                  <div className={css('_textsm _fontsemi')}>Timezone</div>
                  <div className={css('_textxs _fgmuted')}>Pacific Time (PT)</div>
                </div>
                <Button variant="ghost" size="sm">Change</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
