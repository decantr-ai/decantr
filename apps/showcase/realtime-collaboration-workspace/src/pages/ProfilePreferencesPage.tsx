import { SettingsLayout, profileNav } from '../components/SettingsLayout';

export function ProfilePreferencesPage() {
  return (
    <SettingsLayout title="Account" subtitle="Your personal profile and details." nav={profileNav}>
      <section className="paper-card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem' }}>Appearance</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Row label="Theme" value="Paper (light)">
            <div style={{ display: 'flex', gap: '0.375rem' }}>
              {['Light', 'System'].map(t => (
                <button key={t} className="d-interactive" style={{ padding: '0.3125rem 0.625rem', fontSize: '0.75rem', background: t === 'Light' ? 'var(--d-surface-raised)' : 'transparent' }}>{t}</button>
              ))}
            </div>
          </Row>
          <Row label="Density" value="Comfortable">
            <div style={{ display: 'flex', gap: '0.375rem' }}>
              {['Compact', 'Comfortable', 'Spacious'].map(d => (
                <button key={d} className="d-interactive" style={{ padding: '0.3125rem 0.625rem', fontSize: '0.75rem', background: d === 'Comfortable' ? 'var(--d-surface-raised)' : 'transparent' }}>{d}</button>
              ))}
            </div>
          </Row>
        </div>
      </section>

      <section className="paper-card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem' }}>Notifications</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {[
            { label: 'Mentions', desc: 'When someone @mentions you', on: true },
            { label: 'Comments', desc: 'Replies to your comments', on: true },
            { label: 'Shared documents', desc: 'When a document is shared with you', on: true },
            { label: 'Weekly digest', desc: 'Summary of workspace activity', on: false },
          ].map(n => (
            <Toggle key={n.label} label={n.label} desc={n.desc} on={n.on} />
          ))}
        </div>
      </section>

      <section className="paper-card" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem' }}>Language</h2>
        <select className="paper-input" defaultValue="en" style={{ maxWidth: 260 }}>
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
          <option value="ja">日本語</option>
        </select>
      </section>
    </SettingsLayout>
  );
}

function Row({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
      <div>
        <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{value}</div>
      </div>
      {children}
    </div>
  );
}

function Toggle({ label, desc, on }: { label: string; desc: string; on: boolean }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0', borderTop: '1px solid var(--d-border)', cursor: 'pointer' }}>
      <div>
        <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{desc}</div>
      </div>
      <div style={{
        position: 'relative', width: 32, height: 18, borderRadius: 9,
        background: on ? 'var(--d-primary)' : 'var(--d-border)', transition: 'background 150ms ease',
      }}>
        <div style={{
          position: 'absolute', top: 2, left: on ? 16 : 2, width: 14, height: 14, borderRadius: '50%',
          background: '#fff', transition: 'left 150ms ease', boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
        }} />
      </div>
      <input type="checkbox" defaultChecked={on} style={{ display: 'none' }} />
    </label>
  );
}
