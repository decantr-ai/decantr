import { SettingsLayout, workspaceNav } from '../components/SettingsLayout';

const permissions = [
  { role: 'Owner', description: 'Full workspace control, billing, and member management.', can: ['Everything'] },
  { role: 'Admin', description: 'Manage members, pages, and settings (except billing).', can: ['Invite members', 'Change permissions', 'Delete pages', 'Edit all content'] },
  { role: 'Editor', description: 'Create, edit, and comment on pages.', can: ['Create pages', 'Edit content', 'Comment', 'Share externally'] },
  { role: 'Viewer', description: 'Read-only access with commenting.', can: ['View pages', 'Comment'] },
];

export function SettingsPermissionsPage() {
  return (
    <SettingsLayout title="Workspace settings" subtitle="Manage your team's shared space." nav={workspaceNav}>
      <section>
        <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.375rem' }}>Roles & permissions</h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', marginBottom: '1rem' }}>Define what each role can do in your workspace.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {permissions.map(p => (
            <div key={p.role} className="paper-card" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600 }}>{p.role}</h3>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', marginBottom: '0.625rem' }}>{p.description}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {p.can.map(c => <span key={c} className="chip">{c}</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </SettingsLayout>
  );
}
