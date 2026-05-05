import { useState } from 'react';
import { TerminalSplitShell } from '@/components/TerminalSplitShell';
import { SettingsNav } from './ProfilePage';

export function PreferencesPage() {
  const [theme, setTheme] = useState('terminal-phosphor');
  const [lang, setLang] = useState('en');
  const [notif, setNotif] = useState({ email: true, slack: true, page: false });
  const [tz, setTz] = useState('UTC');

  return (
    <TerminalSplitShell title="SETTINGS // preferences">
      <div style={{ flex: 1, display: 'flex', gap: '0.5rem', overflow: 'auto' }}>
        <SettingsNav />
        <div style={{ flex: 1, maxWidth: 680 }}>
          <h1 className="term-glow" style={{ fontSize: '1rem', color: 'var(--d-primary)', margin: '0 0 1rem' }}>
            $ preferences
          </h1>

          <section className="term-panel" style={{ padding: '0.875rem 1rem', marginBottom: '0.75rem' }}>
            <div className="d-label" style={{ color: 'var(--d-accent)', marginBottom: '0.5rem' }}>// THEME</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {[
                { id: 'terminal-phosphor', label: 'Phosphor Green (default)' },
                { id: 'terminal-amber', label: 'Amber CRT' },
                { id: 'terminal-mono', label: 'Monochrome' },
              ].map((t) => (
                <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
                  <input type="radio" name="theme" checked={theme === t.id} onChange={() => setTheme(t.id)} style={{ accentColor: 'var(--d-primary)' }} />
                  <span>{t.label}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="term-panel" style={{ padding: '0.875rem 1rem', marginBottom: '0.75rem' }}>
            <div className="d-label" style={{ color: 'var(--d-accent)', marginBottom: '0.5rem' }}>// NOTIFICATIONS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
                <input type="checkbox" checked={notif.email} onChange={(e) => setNotif({ ...notif, email: e.target.checked })} style={{ accentColor: 'var(--d-primary)' }} />
                <span>email alerts on failure</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
                <input type="checkbox" checked={notif.slack} onChange={(e) => setNotif({ ...notif, slack: e.target.checked })} style={{ accentColor: 'var(--d-primary)' }} />
                <span>slack #data-oncall</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
                <input type="checkbox" checked={notif.page} onChange={(e) => setNotif({ ...notif, page: e.target.checked })} style={{ accentColor: 'var(--d-primary)' }} />
                <span>pagerduty on severity ≥ p2</span>
              </label>
            </div>
          </section>

          <section className="term-panel" style={{ padding: '0.875rem 1rem' }}>
            <div className="d-label" style={{ color: 'var(--d-accent)', marginBottom: '0.5rem' }}>// LOCALE</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
              <div>
                <label className="d-label">LANGUAGE</label>
                <select value={lang} onChange={(e) => setLang(e.target.value)} style={{ width: '100%', padding: '0.375rem', background: 'var(--d-bg)', border: '1px solid var(--d-border)', color: 'var(--d-text)', fontFamily: 'inherit', fontSize: '0.8125rem', borderRadius: 0, marginTop: '0.25rem' }}>
                  <option value="en">English (US)</option>
                  <option value="de">Deutsch</option>
                  <option value="ja">日本語</option>
                </select>
              </div>
              <div>
                <label className="d-label">TIMEZONE</label>
                <select value={tz} onChange={(e) => setTz(e.target.value)} style={{ width: '100%', padding: '0.375rem', background: 'var(--d-bg)', border: '1px solid var(--d-border)', color: 'var(--d-text)', fontFamily: 'inherit', fontSize: '0.8125rem', borderRadius: 0, marginTop: '0.25rem' }}>
                  <option value="UTC">UTC</option>
                  <option value="America/Los_Angeles">America/Los_Angeles</option>
                  <option value="Europe/Berlin">Europe/Berlin</option>
                </select>
              </div>
            </div>
          </section>
        </div>
      </div>
    </TerminalSplitShell>
  );
}
