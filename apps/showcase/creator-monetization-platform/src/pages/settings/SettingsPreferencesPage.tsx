import { css } from '@decantr/css';
import { Sun } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';

export function SettingsPreferencesPage() {
  return (
    <div>
      <PageHeader title="Preferences" subtitle="Notifications, theme, and language." />

      <div className={css('_flex _col _gap3')} style={{ maxWidth: 640 }}>
        <div className="studio-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.875rem', fontFamily: 'system-ui, sans-serif' }}>Appearance</h3>
          <div className={css('_flex _gap2')}>
            {[{ v: 'Light', sel: true, icon: Sun }, { v: 'Dark', sel: false, icon: Sun }, { v: 'System', sel: false, icon: Sun }].map((o) => (
              <button key={o.v} className="d-interactive" data-variant={o.sel ? 'primary' : 'ghost'}
                style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem' }}>
                <o.icon size={14} /> {o.v}
              </button>
            ))}
          </div>
        </div>

        <div className="studio-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.875rem', fontFamily: 'system-ui, sans-serif' }}>Email notifications</h3>
          <div className={css('_flex _col _gap3')}>
            {['New subscribers', 'New comments on my posts', 'Weekly summary', 'Product updates from Canvas'].map((n, i) => (
              <label key={n} className={css('_flex _aic _jcsb')} style={{ fontSize: '0.875rem', fontFamily: 'system-ui, sans-serif', cursor: 'pointer' }}>
                <span>{n}</span>
                <input type="checkbox" defaultChecked={i < 3} style={{ accentColor: 'var(--d-primary)', width: 16, height: 16 }} />
              </label>
            ))}
          </div>
        </div>

        <div className="studio-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.875rem', fontFamily: 'system-ui, sans-serif' }}>Language & Region</h3>
          <div className={css('_flex _col _gap3')}>
            <label className={css('_flex _col _gap1')} style={{ fontFamily: 'system-ui, sans-serif' }}>
              <span className={css('_textsm _fontmedium')}>Language</span>
              <select className="studio-input" defaultValue="en-US">
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="fr">Français</option>
                <option value="ja">日本語</option>
              </select>
            </label>
            <label className={css('_flex _col _gap1')} style={{ fontFamily: 'system-ui, sans-serif' }}>
              <span className={css('_textsm _fontmedium')}>Timezone</span>
              <select className="studio-input" defaultValue="America/New_York">
                <option>America/New_York</option>
                <option>America/Los_Angeles</option>
                <option>Europe/London</option>
              </select>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
