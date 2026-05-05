import { NavLink } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';

const tabs = [
  { to: '/settings/profile', label: 'Profile' },
  { to: '/settings/security', label: 'Security' },
  { to: '/settings/preferences', label: 'Preferences' },
  { to: '/settings/danger', label: 'Danger Zone' },
];

export function SettingsTabs({ active }: { active: string }) {
  return (
    <div style={{ display: 'flex', gap: '0.25rem', borderBottom: '1px solid var(--d-border)', marginBottom: '1.5rem' }}>
      {tabs.map(t => (
        <NavLink
          key={t.to}
          to={t.to}
          style={{
            padding: '0.625rem 0.875rem',
            fontSize: '0.8rem',
            textDecoration: 'none',
            color: t.to === active ? 'var(--d-text)' : 'var(--d-text-muted)',
            borderBottom: t.to === active ? '2px solid var(--d-primary)' : '2px solid transparent',
            fontWeight: t.to === active ? 600 : 400,
            marginBottom: -1,
          }}
        >
          {t.label}
        </NavLink>
      ))}
    </div>
  );
}

export function ProfilePage() {
  return (
    <div style={{ maxWidth: 720 }}>
      <PageHeader title="Settings" description="Manage your account" />
      <SettingsTabs active="/settings/profile" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="d-surface" style={{ padding: '1.5rem' }}>
          <h3 className="d-label" style={{ marginBottom: '1rem' }}>Profile</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--d-primary), var(--d-accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', fontWeight: 700, color: '#fff',
            }}>SC</div>
            <button className="d-interactive" style={{ fontSize: '0.75rem' }}>Change photo</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Full name</span>
              <input className="d-control" defaultValue="Sarah Chen" />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Email</span>
              <input className="d-control" defaultValue="sarah@acmecorp.io" type="email" />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Title</span>
              <input className="d-control" defaultValue="Platform Engineering Lead" />
            </label>
            <div>
              <button className="lp-button-primary" style={{ fontSize: '0.8rem' }}>Save changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
