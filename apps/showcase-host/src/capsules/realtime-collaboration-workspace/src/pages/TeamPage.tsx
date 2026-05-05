import { members, collaborators } from '../data/mock';

export function TeamPage() {
  return (
    <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '1.75rem 2rem' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 600, marginBottom: '0.25rem' }}>Team</h1>
        <p style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem' }}>Everyone collaborating in your workspace.</p>
      </header>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--d-text-muted)', marginBottom: '0.75rem' }}>Active now · {collaborators.filter(c => c.status === 'active').length}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {collaborators.filter(c => c.status === 'active').map(c => (
            <div key={c.id} className="paper-card" style={{ padding: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="presence-avatar" style={{ background: c.color }}>
                {c.initials}
                <span className="presence-dot active" />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--d-success)' }}>Editing now</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--d-text-muted)', marginBottom: '0.75rem' }}>All members</h2>
        <div className="paper-card">
          {members.map((m, i) => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem 1rem', borderTop: i === 0 ? 'none' : '1px solid var(--d-border)' }}>
              <span className="presence-avatar" style={{ background: m.color }}>{m.initials}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{m.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{m.email}</div>
              </div>
              <span className="chip">{m.role}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', width: 100, textAlign: 'right' }}>{m.lastActive}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
