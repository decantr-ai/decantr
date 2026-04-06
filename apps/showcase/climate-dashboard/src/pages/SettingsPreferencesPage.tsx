import { useState } from 'react';
import { css } from '@decantr/css';
import { Palette, Bell, Globe, Save } from 'lucide-react';

export function SettingsPreferencesPage() {
  const [units, setUnits] = useState('metric');
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('en');

  return (
    <div className={css('_flex _col _gap6')}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Preferences</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>Customize your dashboard experience</p>
      </div>

      {/* Display */}
      <div className="d-surface earth-card">
        <div className={css('_flex _aic _gap2')} style={{ marginBottom: '1rem' }}>
          <Palette size={18} style={{ color: 'var(--d-primary)' }} />
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Display</h2>
        </div>
        <div className={css('_flex _col _gap4')}>
          <div className={css('_flex _jcsb _aic')}>
            <div>
              <div style={{ fontWeight: 500, fontSize: '0.9375rem' }}>Emission Units</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>Choose metric or imperial measurements</div>
            </div>
            <select className="d-control earth-input" value={units} onChange={e => setUnits(e.target.value)} style={{ width: 'auto' }}>
              <option value="metric">Metric (tCO2e)</option>
              <option value="imperial">Imperial (tons CO2)</option>
            </select>
          </div>
          <div className={css('_flex _jcsb _aic')}>
            <div>
              <div style={{ fontWeight: 500, fontSize: '0.9375rem' }}>Theme</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>Earth theme &middot; Light mode</div>
            </div>
            <span className="d-annotation" data-status="success">Active</span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="d-surface earth-card">
        <div className={css('_flex _aic _gap2')} style={{ marginBottom: '1rem' }}>
          <Bell size={18} style={{ color: 'var(--d-primary)' }} />
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Notifications</h2>
        </div>
        <div className={css('_flex _col _gap4')}>
          <div className={css('_flex _jcsb _aic')}>
            <div>
              <div style={{ fontWeight: 500, fontSize: '0.9375rem' }}>Email Notifications</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>Receive report updates and target alerts</div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input type="checkbox" checked={notifications} onChange={e => setNotifications(e.target.checked)} style={{ width: 18, height: 18 }} />
            </label>
          </div>
        </div>
      </div>

      {/* Language */}
      <div className="d-surface earth-card">
        <div className={css('_flex _aic _gap2')} style={{ marginBottom: '1rem' }}>
          <Globe size={18} style={{ color: 'var(--d-primary)' }} />
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Language & Region</h2>
        </div>
        <div className={css('_flex _col _gap1')}>
          <label style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Language</label>
          <select className="d-control earth-input" value={language} onChange={e => setLanguage(e.target.value)} style={{ maxWidth: 300 }}>
            <option value="en">English</option>
            <option value="de">Deutsch</option>
            <option value="fr">Francais</option>
            <option value="es">Espanol</option>
          </select>
        </div>
      </div>

      <div>
        <button className="d-interactive" data-variant="primary">
          <Save size={14} /> Save Preferences
        </button>
      </div>
    </div>
  );
}
