import { PageHeader } from '@/components/PageHeader';

export function OrgSettingsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 720 }}>
      <PageHeader
        title="Organization"
        description="Manage organization-level settings"
      />

      <div className="d-surface" style={{ padding: '1.5rem' }}>
        <h3 className="d-label" style={{ marginBottom: '1rem' }}>General</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Organization name</span>
            <input className="d-control" defaultValue="Acme Corp" />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Slug</span>
            <input className="d-control mono-data" defaultValue="acme" />
            <span style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>
              Used in URLs: tenantly.dev/<span className="lp-code-inline">acme</span>
            </span>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Website</span>
            <input className="d-control" defaultValue="https://acmecorp.io" />
          </label>
          <div>
            <button className="lp-button-primary" style={{ fontSize: '0.8rem' }}>Save changes</button>
          </div>
        </div>
      </div>

      <div className="d-surface" style={{ padding: '1.5rem' }}>
        <h3 className="d-label" style={{ marginBottom: '1rem' }}>Account</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--d-border)' }}>
            <div>
              <div style={{ fontSize: '0.825rem', fontWeight: 500 }}>Plan</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Enterprise · billed annually</div>
            </div>
            <button className="d-interactive" style={{ fontSize: '0.75rem' }}>Manage plan</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--d-border)' }}>
            <div>
              <div style={{ fontSize: '0.825rem', fontWeight: 500 }}>Members</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>42 seats used of unlimited</div>
            </div>
            <button className="d-interactive" style={{ fontSize: '0.75rem' }}>View team</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0' }}>
            <div>
              <div style={{ fontSize: '0.825rem', fontWeight: 500 }}>Created</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>March 14, 2024 · 753 days ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
