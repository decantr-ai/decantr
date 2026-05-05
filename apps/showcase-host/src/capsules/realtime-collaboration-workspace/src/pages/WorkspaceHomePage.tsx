import { Link } from 'react-router-dom';
import { FileText, Star, Plus, Clock, MessageSquare, AtSign, Share2, UserPlus, Edit3 } from 'lucide-react';
import { recentDocs, activity, collaborators, kanban } from '../data/mock';

const activityIcon: Record<string, any> = {
  edit: Edit3, comment: MessageSquare, mention: AtSign, share: Share2, create: Plus,
};

export function WorkspaceHomePage() {
  return (
    <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '1.75rem 2rem' }}>
      <header style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 600, marginBottom: '0.25rem' }}>Good afternoon, Mira</h1>
        <p style={{ color: 'var(--d-text-muted)', fontSize: '0.9375rem' }}>
          {collaborators.filter(c => c.status === 'active').length} teammates are working alongside you right now.
        </p>
      </header>

      {/* Recent documents */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--d-text-muted)' }}>
            <Clock size={14} style={{ display: 'inline', marginRight: '0.375rem', verticalAlign: '-2px' }} />
            Recent
          </h2>
          <button className="d-interactive" style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem' }}>
            <Plus size={13} /> New document
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {recentDocs.map(d => (
            <Link key={d.id} to={`/doc/${d.id}`} className="paper-card" style={{ padding: '1rem', textDecoration: 'none', color: 'var(--d-text)', display: 'block', transition: 'border-color 120ms ease' }}>
              <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{d.icon}</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.625rem' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>{d.updatedAt}</span>
                <div className="presence-stack">
                  {d.collaborators.slice(0, 3).map((init, i) => {
                    const c = collaborators.find(x => x.initials === init);
                    return (
                      <span key={i} className="presence-avatar presence-avatar-sm" style={{ background: c?.color || 'var(--d-text-muted)' }}>{init}</span>
                    );
                  })}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Favorites */}
        <section>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--d-text-muted)', marginBottom: '0.75rem' }}>
            <Star size={14} style={{ display: 'inline', marginRight: '0.375rem', verticalAlign: '-2px' }} />
            Favorites
          </h2>
          <div className="paper-card" style={{ padding: '0.5rem' }}>
            {['Q2 Roadmap', 'Design System', 'Architecture Notes'].map((t, i) => (
              <Link key={t} to="/doc/roadmap" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.625rem 0.75rem', textDecoration: 'none', color: 'var(--d-text)', fontSize: '0.875rem', borderRadius: 'var(--d-radius-sm)', borderTop: i === 0 ? 'none' : '1px solid var(--d-border)' }}>
                <FileText size={14} style={{ color: 'var(--d-text-muted)' }} />
                <span style={{ flex: 1 }}>{t}</span>
                <Star size={12} style={{ color: 'var(--d-accent)', fill: 'var(--d-accent)' }} />
              </Link>
            ))}
          </div>
        </section>

        {/* Activity feed */}
        <section>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--d-text-muted)', marginBottom: '0.75rem' }}>Activity</h2>
          <div className="paper-card" style={{ padding: '0.5rem' }}>
            {activity.slice(0, 6).map((a, i) => {
              const Icon = activityIcon[a.type] || Edit3;
              const label = { edit: 'edited', comment: 'commented on', share: 'shared', create: 'created', mention: 'mentioned you in' }[a.type];
              return (
                <div key={a.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', padding: '0.625rem 0.75rem', borderTop: i === 0 ? 'none' : '1px solid var(--d-border)' }}>
                  <span className="presence-avatar presence-avatar-sm" style={{ background: a.color, flexShrink: 0 }}>{a.initials}</span>
                  <div style={{ flex: 1, fontSize: '0.8125rem', lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 500 }}>{a.actor}</span>
                    <span style={{ color: 'var(--d-text-muted)' }}> {label} </span>
                    <span style={{ fontWeight: 500 }}>{a.target}</span>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)', marginTop: '0.125rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Icon size={10} /> {a.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Roadmap board */}
      <section style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--d-text-muted)' }}>Roadmap board</h2>
          <Link to="/doc/roadmap" style={{ fontSize: '0.75rem', color: 'var(--d-primary)', textDecoration: 'none' }}>Open roadmap doc →</Link>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {kanban.map(col => (
            <div key={col.id} className="kanban-column">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem', padding: '0 0.25rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{col.title}</span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>{col.cards.length}</span>
              </div>
              {col.cards.map(card => (
                <div key={card.id} className="kanban-card">
                  <div style={{ fontSize: '0.8125rem', lineHeight: 1.45, marginBottom: '0.5rem' }}>{card.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                      {card.labels.map(l => (
                        <span key={l} className="chip">{l}</span>
                      ))}
                    </div>
                    <span className="presence-avatar presence-avatar-sm" style={{ background: card.color }}>{card.initials}</span>
                  </div>
                </div>
              ))}
              <button style={{ width: '100%', padding: '0.375rem', fontSize: '0.75rem', color: 'var(--d-text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 'var(--d-radius-sm)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Plus size={12} /> Add task
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
