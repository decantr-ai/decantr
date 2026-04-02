import { useState } from 'react';
import { css } from '@decantr/css';
import { ChevronDown } from 'lucide-react';
import { Card, Toggle } from '@/components';

export function PreferencesPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [agentAlerts, setAgentAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  return (
    <div className={css('_flex _col _flex1 _p6 _gap4') + ' carbon-fade-slide'} style={{ maxWidth: 640 }}>
      <div>
        <h1 className={css('_heading3 _fontbold')}>Preferences</h1>
        <p className={css('_textsm _fgmuted _mt1')}>Customize your AgentHub experience.</p>
      </div>

      {/* Appearance */}
      <Card>
        <div className={css('_flex _col _gap4')}>
          <span className={css('_fontsemi')}>Appearance</span>
          <div className={css('_flex _row _aic _jcsb')}>
            <div className={css('_flex _col')}>
              <span className={css('_textsm')}>Dark mode</span>
              <span className={css('_textxs _fgmuted')}>Use a dark color scheme across the interface</span>
            </div>
            <Toggle checked={darkMode} onChange={setDarkMode} label="Dark mode" />
          </div>
          <div className={css('_flex _row _aic _jcsb')}>
            <div className={css('_flex _col')}>
              <span className={css('_textsm')}>Compact mode</span>
              <span className={css('_textxs _fgmuted')}>Reduce spacing and padding for denser layouts</span>
            </div>
            <Toggle checked={compactMode} onChange={setCompactMode} label="Compact mode" />
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <div className={css('_flex _col _gap4')}>
          <span className={css('_fontsemi')}>Notifications</span>
          <div className={css('_flex _row _aic _jcsb')}>
            <div className={css('_flex _col')}>
              <span className={css('_textsm')}>Email notifications</span>
              <span className={css('_textxs _fgmuted')}>Receive email updates about agent activity</span>
            </div>
            <Toggle checked={emailNotifications} onChange={setEmailNotifications} label="Email notifications" />
          </div>
          <div className={css('_flex _row _aic _jcsb')}>
            <div className={css('_flex _col')}>
              <span className={css('_textsm')}>Agent alerts</span>
              <span className={css('_textxs _fgmuted')}>Get notified when deployed agents encounter issues</span>
            </div>
            <Toggle checked={agentAlerts} onChange={setAgentAlerts} label="Agent alerts" />
          </div>
          <div className={css('_flex _row _aic _jcsb')}>
            <div className={css('_flex _col')}>
              <span className={css('_textsm')}>Marketing emails</span>
              <span className={css('_textxs _fgmuted')}>Receive product updates and promotional content</span>
            </div>
            <Toggle checked={marketingEmails} onChange={setMarketingEmails} label="Marketing emails" />
          </div>
        </div>
      </Card>

      {/* Language */}
      <Card>
        <div className={css('_flex _col _gap4')}>
          <span className={css('_fontsemi')}>Language</span>
          <div className={css('_flex _row _aic _jcsb')}>
            <span className={css('_textsm')}>Display language</span>
            <div
              className={css('_flex _row _aic _gap2 _px3 _py2 _rounded _textsm') + ' carbon-card'}
              style={{ cursor: 'default' }}
            >
              <span>English (US)</span>
              <ChevronDown size={14} style={{ color: 'var(--d-muted)' }} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
