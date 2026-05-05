import { css } from '@decantr/css';

export function SettingsPreferencesPage() {
  return (
    <div className={css('_flex _col _gap4')} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <header>
        <h1 className="bistro-handwritten" style={{ fontSize: '1.5rem' }}>Preferences</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Customize your Tavola experience.</p>
      </header>

      <div className="bistro-feature-tile">
        <h3 className={css('_fontmedium')} style={{ marginBottom: '0.75rem' }}>Appearance</h3>
        <div className={css('_flex _col _gap3')}>
          <label className={css('_flex _aic _jcsb')}>
            <div>
              <div className={css('_textsm _fontmedium')}>Theme</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Light mode is the default for Tavola</div>
            </div>
            <select className="d-control" style={{ width: 'auto' }}>
              <option>Light</option>
              <option>System</option>
            </select>
          </label>
          <label className={css('_flex _aic _jcsb')}>
            <div>
              <div className={css('_textsm _fontmedium')}>Compact Mode</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Reduce spacing for smaller screens</div>
            </div>
            <input type="checkbox" style={{ accentColor: 'var(--d-primary)', width: 18, height: 18 }} />
          </label>
        </div>
      </div>

      <div className="bistro-feature-tile">
        <h3 className={css('_fontmedium')} style={{ marginBottom: '0.75rem' }}>Notifications</h3>
        <div className={css('_flex _col _gap3')}>
          {[
            { label: 'Low stock alerts', desc: 'When inventory falls below par level', defaultChecked: true },
            { label: 'Reservation reminders', desc: '30 minutes before a booking', defaultChecked: true },
            { label: 'Shift summaries', desc: 'Daily tip and sales summary after shift', defaultChecked: false },
            { label: 'Weekly reports', desc: 'P&L and performance email', defaultChecked: true },
          ].map(n => (
            <label key={n.label} className={css('_flex _aic _jcsb')}>
              <div>
                <div className={css('_textsm _fontmedium')}>{n.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{n.desc}</div>
              </div>
              <input type="checkbox" defaultChecked={n.defaultChecked} style={{ accentColor: 'var(--d-primary)', width: 18, height: 18 }} />
            </label>
          ))}
        </div>
      </div>

      <div className="bistro-feature-tile">
        <h3 className={css('_fontmedium')} style={{ marginBottom: '0.75rem' }}>Language & Region</h3>
        <div className={css('_flex _col _gap3')}>
          <label className={css('_flex _col _gap1')}>
            <span className={css('_textsm _fontmedium')}>Language</span>
            <select className="d-control">
              <option>English (US)</option>
              <option>Spanish</option>
              <option>French</option>
              <option>Italian</option>
            </select>
          </label>
          <label className={css('_flex _col _gap1')}>
            <span className={css('_textsm _fontmedium')}>Time Zone</span>
            <select className="d-control">
              <option>Eastern (ET)</option>
              <option>Central (CT)</option>
              <option>Pacific (PT)</option>
            </select>
          </label>
        </div>
      </div>

      <button className="d-interactive" data-variant="primary" style={{ alignSelf: 'flex-start' }}>Save Preferences</button>
    </div>
  );
}
