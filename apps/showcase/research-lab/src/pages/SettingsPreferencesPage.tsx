import { css } from '@decantr/css';
import { useState } from 'react';
import { SettingsLayout } from '../components/SettingsLayout';

export function SettingsPreferencesPage() {
  const [notifications, setNotifications] = useState(true);
  const [emailDigest, setEmailDigest] = useState('daily');

  return (
    <SettingsLayout>
      <h1 style={{ fontWeight: 500, fontSize: '1.25rem', marginBottom: '1.25rem' }}>Preferences</h1>

      {/* Notifications */}
      <div className="lab-panel" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
        <h2 style={{ fontWeight: 500, fontSize: '0.9375rem', marginBottom: '0.75rem' }}>Notifications</h2>
        <div className={css('_flex _col _gap4')}>
          <div className={css('_flex _aic _jcsb')}>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>Push Notifications</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Receive alerts for bookings, experiment updates, and sample expiry.</p>
            </div>
            <button
              className="d-interactive"
              data-variant={notifications ? 'primary' : 'ghost'}
              onClick={() => setNotifications(!notifications)}
              style={{ padding: '0.25rem 0.625rem', borderRadius: 2, fontSize: '0.75rem' }}
            >
              {notifications ? 'On' : 'Off'}
            </button>
          </div>
          <div className={css('_flex _aic _jcsb')}>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>Email Digest</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Summary of lab activity sent to your inbox.</p>
            </div>
            <select
              className="d-control"
              value={emailDigest}
              onChange={(e) => setEmailDigest(e.target.value)}
              style={{ width: 'auto', borderRadius: 2, fontSize: '0.8125rem' }}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="off">Off</option>
            </select>
          </div>
        </div>
      </div>

      {/* Display */}
      <div className="lab-panel" style={{ padding: '1.25rem' }}>
        <h2 style={{ fontWeight: 500, fontSize: '0.9375rem', marginBottom: '0.75rem' }}>Display</h2>
        <div className={css('_flex _col _gap4')}>
          <div className={css('_flex _aic _jcsb')}>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>Date Format</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>How dates appear across the platform.</p>
            </div>
            <select className="d-control" defaultValue="iso" style={{ width: 'auto', borderRadius: 2, fontSize: '0.8125rem' }}>
              <option value="iso">YYYY-MM-DD</option>
              <option value="us">MM/DD/YYYY</option>
              <option value="eu">DD/MM/YYYY</option>
            </select>
          </div>
          <div className={css('_flex _aic _jcsb')}>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>Temperature Unit</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Unit for temperature readings.</p>
            </div>
            <select className="d-control" defaultValue="celsius" style={{ width: 'auto', borderRadius: 2, fontSize: '0.8125rem' }}>
              <option value="celsius">Celsius</option>
              <option value="fahrenheit">Fahrenheit</option>
              <option value="kelvin">Kelvin</option>
            </select>
          </div>
        </div>
      </div>
    </SettingsLayout>
  );
}
