import { css } from '@decantr/css';
import { SettingsNav } from './ProfilePage';
import { Button } from '../components/Button';
import { Save, Moon, Sun, Bell, Globe } from 'lucide-react';
import { useState } from 'react';

function Toggle({ active, onToggle, label }: { active: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={'toggle-track' + (active ? ' active' : '')}
      role="switch"
      aria-checked={active}
      aria-label={label}
    >
      <div className="toggle-thumb" />
    </button>
  );
}

export function PreferencesPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);
  const [chatSounds, setChatSounds] = useState(true);

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
            <h1 className={css('_heading3 _fgtext')}>Preferences</h1>
            <p className={css('_textsm _fgmuted')}>
              Customize your experience, notifications, and display settings.
            </p>
          </div>

          {/* Appearance */}
          <div className={css('_flex _col _gap4 _p5 _rounded') + ' carbon-card'}>
            <div className={css('_flex _aic _gap2')}>
              {darkMode ? <Moon size={18} style={{ color: 'var(--d-primary)' }} /> : <Sun size={18} style={{ color: 'var(--d-primary)' }} />}
              <h2 className={css('_fontsemi _fgtext')}>Appearance</h2>
            </div>
            <div className={css('_flex _jcsb _aic _py2')}>
              <div className={css('_flex _col _gap0')}>
                <span className={css('_textsm _fgtext')}>Dark mode</span>
                <span className={css('_textxs _fgmuted')}>Use a dark color scheme throughout the interface</span>
              </div>
              <Toggle active={darkMode} onToggle={() => setDarkMode(!darkMode)} label="Dark mode" />
            </div>

            <div className={css('_flex _jcsb _aic _py2')}>
              <div className={css('_flex _col _gap0')}>
                <span className={css('_textsm _fgtext')}>Language</span>
                <span className={css('_textxs _fgmuted')}>Select your preferred display language</span>
              </div>
              <div className={css('_flex _aic _gap2')}>
                <Globe size={14} style={{ color: 'var(--d-text-muted)' }} />
                <select
                  className={css('_textsm _rounded _trans') + ' carbon-input'}
                  style={{ width: 'auto', paddingRight: '2rem' }}
                  defaultValue="en"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="ja">Japanese</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className={css('_flex _col _gap4 _p5 _rounded') + ' carbon-card'}>
            <div className={css('_flex _aic _gap2')}>
              <Bell size={18} style={{ color: 'var(--d-primary)' }} />
              <h2 className={css('_fontsemi _fgtext')}>Notifications</h2>
            </div>

            <div className={css('_flex _jcsb _aic _py2')}>
              <div className={css('_flex _col _gap0')}>
                <span className={css('_textsm _fgtext')}>Email notifications</span>
                <span className={css('_textxs _fgmuted')}>Receive updates about your conversations via email</span>
              </div>
              <Toggle active={emailNotifs} onToggle={() => setEmailNotifs(!emailNotifs)} label="Email notifications" />
            </div>

            <div className={css('_flex _jcsb _aic _py2')}>
              <div className={css('_flex _col _gap0')}>
                <span className={css('_textsm _fgtext')}>Push notifications</span>
                <span className={css('_textxs _fgmuted')}>Get browser push notifications for new messages</span>
              </div>
              <Toggle active={pushNotifs} onToggle={() => setPushNotifs(!pushNotifs)} label="Push notifications" />
            </div>

            <div className={css('_flex _jcsb _aic _py2')}>
              <div className={css('_flex _col _gap0')}>
                <span className={css('_textsm _fgtext')}>Chat sounds</span>
                <span className={css('_textxs _fgmuted')}>Play a sound when a new message arrives</span>
              </div>
              <Toggle active={chatSounds} onToggle={() => setChatSounds(!chatSounds)} label="Chat sounds" />
            </div>
          </div>

          <div className={css('_flex _jcfe')}>
            <Button variant="primary" icon={<Save size={16} />}>
              Save preferences
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
