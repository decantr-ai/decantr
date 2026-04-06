import { css } from '@decantr/css';
import { SettingsNav } from './SettingsProfilePage';

export function SettingsPreferencesPage() {
  return (
    <div className={css('_flex _col _gap6')} style={{ maxWidth: 900 }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Settings</h1>

      <div className={css('_flex _gap6')}>
        <SettingsNav />

        <div style={{ flex: 1 }}>
          <div className="d-surface gov-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem' }}>Preferences</h2>

            <div className={css('_flex _col _gap5')}>
              {/* Notifications */}
              <div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.75rem' }}>Notifications</h3>
                <div className={css('_flex _col _gap3')}>
                  {[
                    { label: 'Petition updates', description: 'Get notified when petitions you signed get updates' },
                    { label: 'Meeting reminders', description: 'Receive reminders before scheduled meetings' },
                    { label: 'Service request status', description: 'Updates on your service request progress' },
                    { label: 'Community announcements', description: 'Important city-wide announcements' },
                  ].map(n => (
                    <div key={n.label} className={css('_flex _jcsb _aic')} style={{ padding: '0.5rem 0' }}>
                      <div>
                        <div style={{ fontSize: '0.9375rem', fontWeight: 500 }}>{n.label}</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>{n.description}</div>
                      </div>
                      <label style={{ position: 'relative', display: 'inline-block', width: 40, height: 22, cursor: 'pointer' }}>
                        <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                        <span style={{
                          position: 'absolute', inset: 0, borderRadius: 11,
                          background: 'var(--d-primary)', transition: 'background 0.2s',
                        }}>
                          <span style={{
                            position: 'absolute', left: 20, top: 2, width: 18, height: 18,
                            borderRadius: '50%', background: '#fff', transition: 'left 0.2s',
                          }} />
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.75rem' }}>Language</h3>
                <select className="d-control gov-input" defaultValue="en" style={{ maxWidth: 280, appearance: 'none' }}>
                  <option value="en">English</option>
                  <option value="es">Espanol</option>
                  <option value="zh">Chinese (Simplified)</option>
                  <option value="vi">Vietnamese</option>
                </select>
              </div>
            </div>

            <div className={css('_flex _jcfe')} style={{ marginTop: '1.5rem', borderTop: '1px solid var(--d-border)', paddingTop: '1rem' }}>
              <button className="d-interactive" data-variant="primary">Save Preferences</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
