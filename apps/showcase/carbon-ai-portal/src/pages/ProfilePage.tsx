import { css } from '@decantr/css';
import { Link, useLocation } from 'react-router-dom';
import { InputField } from '../components/InputField';
import { Button } from '../components/Button';
import {
  User,
  Shield,
  Palette,
  AlertTriangle,
  Save,
  Camera,
} from 'lucide-react';

const settingsNav = [
  { to: '/settings/profile', label: 'Profile', icon: <User size={16} /> },
  { to: '/settings/security', label: 'Security', icon: <Shield size={16} /> },
  { to: '/settings/preferences', label: 'Preferences', icon: <Palette size={16} /> },
  { to: '/settings/account', label: 'Account', icon: <AlertTriangle size={16} /> },
];

function SettingsNav() {
  const location = useLocation();
  return (
    <nav className={css('_flex _col _gap1')}>
      {settingsNav.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={
            css('_flex _aic _gap2 _px3 _py2 _textsm _rounded _pointer _trans') +
            ' settings-nav-item' +
            (location.pathname === item.to ? ' active' : '')
          }
        >
          {item.icon}
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export { SettingsNav };

export function ProfilePage() {
  return (
    <div className={css('_flex _flex1 _overauto')}>
      <div
        className={css('_flex _gap8 _p6')}
        style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}
      >
        {/* Sidebar nav */}
        <div className={css('_none _md:flex _col _shrink0')} style={{ width: '200px' }}>
          <SettingsNav />
        </div>

        {/* Content */}
        <div className={css('_flex1 _flex _col _gap6')}>
          <div className={css('_flex _col _gap1')}>
            <h1 className={css('_heading3 _fgtext')}>Profile</h1>
            <p className={css('_textsm _fgmuted')}>
              Manage your personal information and public profile.
            </p>
          </div>

          {/* Avatar section */}
          <div className={css('_flex _aic _gap4 _p5 _rounded') + ' carbon-card'}>
            <div
              className={css('_flex _aic _jcc _roundedfull _rel')}
              style={{
                width: '72px',
                height: '72px',
                background: 'rgba(124,147,176,0.12)',
                color: 'var(--d-primary)',
              }}
            >
              <User size={28} />
              <button
                className={css('_abs _flex _aic _jcc _roundedfull _bordernone _pointer')}
                style={{
                  width: '28px',
                  height: '28px',
                  bottom: '-2px',
                  right: '-2px',
                  background: 'var(--d-surface-raised)',
                  border: '2px solid var(--d-bg)',
                  color: 'var(--d-text-muted)',
                }}
                aria-label="Change avatar"
              >
                <Camera size={12} />
              </button>
            </div>
            <div className={css('_flex _col _gap0')}>
              <span className={css('_fontsemi _fgtext')}>Jane Doe</span>
              <span className={css('_textsm _fgmuted')}>jane@example.com</span>
            </div>
          </div>

          {/* Form */}
          <form
            className={css('_flex _col _gap4 _p5 _rounded') + ' carbon-card'}
            onSubmit={(e) => e.preventDefault()}
          >
            <div className={css('_grid _gc1 _md:gc2 _gap4')}>
              <InputField label="First name" defaultValue="Jane" />
              <InputField label="Last name" defaultValue="Doe" />
            </div>
            <InputField label="Email" type="email" defaultValue="jane@example.com" />
            <InputField label="Display name" defaultValue="janedoe" />
            <div className={css('_flex _col _gap1')}>
              <label htmlFor="bio" className={css('_textsm _fontsemi _fgtext')}>
                Bio
              </label>
              <textarea
                id="bio"
                rows={3}
                className={css('_textbase _rounded _trans') + ' carbon-input'}
                defaultValue="Software engineer working with React and TypeScript."
                style={{ resize: 'vertical' }}
              />
            </div>
            <div className={css('_flex _jcfe')}>
              <Button variant="primary" icon={<Save size={16} />} type="submit">
                Save changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
