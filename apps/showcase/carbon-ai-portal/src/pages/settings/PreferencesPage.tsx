import { css } from '@decantr/css';
import { useState } from 'react';
import { ChatPortalShell } from '@/layouts/ChatPortalShell';
import { Card, Toggle, Button } from '@/components';

export function PreferencesPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(false);
  const [markdown, setMarkdown] = useState(true);
  const [codeHighlight, setCodeHighlight] = useState(true);
  const [compactMode, setCompactMode] = useState(false);

  return (
    <ChatPortalShell mode="settings">
      <div className={css('_flex1 _overyauto _p6')}>
        <div className={css('_flex _col _gap6')} style={{ maxWidth: '680px' }}>
          <div className={css('_flex _col _gap1')}>
            <h2 className={css('_text2xl _fontsemi _fgtext')}>Preferences</h2>
            <p className={css('_textsm _fgmuted')}>Customize your experience with theme, notifications, and display settings.</p>
          </div>

          {/* Appearance */}
          <Card>
            <div className={css('_flex _col _gap4')}>
              <h3 className={css('_textlg _fontsemi _fgtext')}>Appearance</h3>
              <SettingRow
                label="Dark mode"
                description="Use dark theme throughout the application"
                checked={darkMode}
                onChange={setDarkMode}
              />
              <SettingRow
                label="Compact mode"
                description="Reduce spacing and padding for a denser layout"
                checked={compactMode}
                onChange={setCompactMode}
              />
            </div>
          </Card>

          {/* Notifications */}
          <Card>
            <div className={css('_flex _col _gap4')}>
              <h3 className={css('_textlg _fontsemi _fgtext')}>Notifications</h3>
              <SettingRow
                label="Push notifications"
                description="Receive notifications for new messages and updates"
                checked={notifications}
                onChange={setNotifications}
              />
              <SettingRow
                label="Sound effects"
                description="Play sounds for incoming messages"
                checked={sounds}
                onChange={setSounds}
              />
            </div>
          </Card>

          {/* Chat */}
          <Card>
            <div className={css('_flex _col _gap4')}>
              <h3 className={css('_textlg _fontsemi _fgtext')}>Chat display</h3>
              <SettingRow
                label="Markdown rendering"
                description="Render markdown formatting in AI responses"
                checked={markdown}
                onChange={setMarkdown}
              />
              <SettingRow
                label="Code highlighting"
                description="Syntax highlight code blocks in responses"
                checked={codeHighlight}
                onChange={setCodeHighlight}
              />
            </div>
          </Card>

          <div className={css('_flex _col _gap1')}>
            <label className={css('_textsm _fontmedium _fgtext')}>Language</label>
            <select
              className={css('_wfull _px3 _py2 _textbase _rounded _bgbg _fgtext _bw1 _pointer') + ' carbon-input'}
              defaultValue="en"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="ja">Japanese</option>
            </select>
          </div>

          <div className={css('_flex _jcfe _gap3')}>
            <Button variant="ghost">Reset to defaults</Button>
            <Button variant="primary">Save preferences</Button>
          </div>
        </div>
      </div>
    </ChatPortalShell>
  );
}

function SettingRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className={css('_flex _aic _jcsb _gap4')}>
      <div className={css('_flex _col _gap1')}>
        <span className={css('_textsm _fontmedium _fgtext')}>{label}</span>
        <span className={css('_textxs _fgmuted')}>{description}</span>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}
