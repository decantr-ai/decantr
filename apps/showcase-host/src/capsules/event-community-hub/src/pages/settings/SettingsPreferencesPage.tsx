import { css } from '@decantr/css';
import { Moon, Sun, Bell, Globe } from 'lucide-react';

export function SettingsPreferencesPage() {
  return (
    <div className={css('_flex _col _gap4')} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <header>
        <h1 className="display-heading" style={{ fontSize: '1.5rem' }}>Preferences</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Make Pulse feel like yours.</p>
      </header>

      <div className="feature-tile">
        <div className={css('_flex _aic _gap2')} style={{ marginBottom: '0.75rem' }}>
          <Moon size={16} style={{ color: 'var(--d-primary)' }} />
          <h2 className="display-heading" style={{ fontSize: '1rem' }}>Appearance</h2>
        </div>
        <div className={css('_flex _gap2')}>
          <label className={css('_flex _aic _gap2')} style={{ flex: 1, padding: '0.875rem', background: 'var(--d-bg)', border: '2px solid var(--d-primary)', borderRadius: 'var(--d-radius)', cursor: 'pointer' }}>
            <input type="radio" name="theme" defaultChecked style={{ accentColor: 'var(--d-primary)' }} />
            <Moon size={14} /> Dark
          </label>
          <label className={css('_flex _aic _gap2')} style={{ flex: 1, padding: '0.875rem', background: 'var(--d-bg)', border: '1px solid var(--d-border)', borderRadius: 'var(--d-radius)', cursor: 'pointer' }}>
            <input type="radio" name="theme" style={{ accentColor: 'var(--d-primary)' }} />
            <Sun size={14} /> Light
          </label>
        </div>
      </div>

      <div className="feature-tile">
        <div className={css('_flex _aic _gap2')} style={{ marginBottom: '0.75rem' }}>
          <Bell size={16} style={{ color: 'var(--d-primary)' }} />
          <h2 className="display-heading" style={{ fontSize: '1rem' }}>Notifications</h2>
        </div>
        <div className={css('_flex _col _gap3')}>
          <ToggleRow label="New events from organizers I follow" defaultChecked />
          <ToggleRow label="Reminders 24h before events" defaultChecked />
          <ToggleRow label="Community replies and mentions" defaultChecked />
          <ToggleRow label="Weekly digest" />
        </div>
      </div>

      <div className="feature-tile">
        <div className={css('_flex _aic _gap2')} style={{ marginBottom: '0.75rem' }}>
          <Globe size={16} style={{ color: 'var(--d-primary)' }} />
          <h2 className="display-heading" style={{ fontSize: '1rem' }}>Language</h2>
        </div>
        <select className="d-control" defaultValue="en">
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
        </select>
      </div>
    </div>
  );
}

function ToggleRow({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <label className="_flex _aic _jcsb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
      <span style={{ fontSize: '0.875rem' }}>{label}</span>
      <input type="checkbox" defaultChecked={defaultChecked} style={{ accentColor: 'var(--d-primary)', width: 18, height: 18 }} />
    </label>
  );
}
