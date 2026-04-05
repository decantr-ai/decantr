import { css } from '@decantr/css';
import { useState } from 'react';

export function SettingsPreferencesPage() {
  const [emailWeekly, setEmailWeekly] = useState(true);
  const [emailComments, setEmailComments] = useState(true);
  const [emailFollows, setEmailFollows] = useState(false);

  return (
    <div className={css('_flex _col _gap4')} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <header>
        <h1 className="serif-display" style={{ fontSize: '1.5rem' }}>Preferences</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Tune Gather to taste.</p>
      </header>

      <div className="feature-tile">
        <h2 className="serif-display" style={{ fontSize: '1.0625rem', marginBottom: '0.875rem' }}>Language & region</h2>
        <div className={css('_flex _col _gap3')}>
          <label className={css('_flex _col _gap1')}>
            <span className={css('_textsm _fontmedium')}>Language</span>
            <select className="d-control" defaultValue="en">
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
              <option value="ja">日本語</option>
            </select>
          </label>
          <label className={css('_flex _col _gap1')}>
            <span className={css('_textsm _fontmedium')}>Measurements</span>
            <select className="d-control" defaultValue="metric">
              <option value="metric">Metric (g, ml)</option>
              <option value="imperial">Imperial (oz, cups)</option>
            </select>
          </label>
        </div>
      </div>

      <div className="feature-tile">
        <h2 className="serif-display" style={{ fontSize: '1.0625rem', marginBottom: '0.875rem' }}>Email</h2>
        <ul className={css('_flex _col _gap2')} style={{ listStyle: 'none' }}>
          <Toggle label="Weekly recipe digest" checked={emailWeekly} onChange={setEmailWeekly} />
          <Toggle label="Comments on my recipes" checked={emailComments} onChange={setEmailComments} />
          <Toggle label="New followers" checked={emailFollows} onChange={setEmailFollows} />
        </ul>
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <li className={css('_flex _aic _jcsb')} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--d-border)' }}>
      <span className={css('_textsm')}>{label}</span>
      <button type="button" onClick={() => onChange(!checked)}
        aria-pressed={checked}
        style={{
          width: 36, height: 20, borderRadius: 'var(--d-radius-full)',
          background: checked ? 'var(--d-primary)' : 'var(--d-surface-raised)',
          border: '1px solid var(--d-border)', position: 'relative', cursor: 'pointer',
          transition: 'background 150ms ease',
        }}>
        <span style={{
          position: 'absolute', top: 1, left: checked ? 17 : 1, width: 16, height: 16,
          background: '#fff', borderRadius: '50%', transition: 'left 150ms ease',
          boxShadow: 'var(--d-shadow-sm)',
        }} />
      </button>
    </li>
  );
}
