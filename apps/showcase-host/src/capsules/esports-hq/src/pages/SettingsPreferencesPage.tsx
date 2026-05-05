import { useState } from 'react';

export function SettingsPreferencesPage() {
  const [theme, setTheme] = useState('dark');
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('en');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-gap-6)', maxWidth: 600 }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Preferences</h1>
        <p style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem' }}>Customize your experience.</p>
      </div>

      <div className="d-surface" style={{ padding: 'var(--d-surface-p)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Theme */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>Theme</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>Choose dark or light mode.</div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['dark', 'light'].map(t => (
              <button
                key={t}
                className="d-interactive"
                data-variant={theme === t ? 'primary' : 'ghost'}
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', textTransform: 'capitalize' }}
                onClick={() => setTheme(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--d-border)' }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>Email Notifications</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>Receive scrim reminders and team updates.</div>
          </div>
          <button
            className="d-interactive"
            data-variant={notifications ? 'primary' : 'ghost'}
            style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
            onClick={() => setNotifications(!notifications)}
          >
            {notifications ? 'On' : 'Off'}
          </button>
        </div>

        {/* Language */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--d-border)' }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>Language</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>Display language for the interface.</div>
          </div>
          <select
            className="d-control"
            value={language}
            onChange={e => setLanguage(e.target.value)}
            style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="ko">Korean</option>
            <option value="ja">Japanese</option>
          </select>
        </div>
      </div>
    </div>
  );
}
