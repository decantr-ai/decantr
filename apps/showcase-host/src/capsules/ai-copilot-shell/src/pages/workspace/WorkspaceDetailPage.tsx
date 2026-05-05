import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, GitBranch, MoreHorizontal } from 'lucide-react';
import { workspaceItems, workspaceDetailMessages } from '@/data/mock';
import { ChatThread } from '@/components/ChatThread';

export function WorkspaceDetailPage() {
  const { id } = useParams();
  const item = workspaceItems.find(w => w.id === id) || workspaceItems[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      {/* Detail header */}
      <div>
        {/* Breadcrumb */}
        <Link
          to="/workspace"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--d-text-muted)', textDecoration: 'none', marginBottom: '1rem' }}
        >
          <ArrowLeft size={14} />
          Back to Workspace
        </Link>

        {/* Title row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{item.title}</h1>
              <span
                className="d-annotation"
                data-status={item.status === 'active' ? 'success' : item.status === 'draft' ? 'warning' : undefined}
              >
                {item.status}
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', lineHeight: 1.6 }}>
              {item.description}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="d-interactive" data-variant="ghost" style={{ border: 'none', padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
              <GitBranch size={14} />
              Branch
            </button>
            <button className="d-interactive" data-variant="ghost" style={{ border: 'none', padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
              <ExternalLink size={14} />
              Open
            </button>
            <button className="d-interactive" data-variant="ghost" style={{ border: 'none', padding: '0.375rem' }}>
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>

        {/* Meta row */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
          <span className="mono-data">ID: {item.id}</span>
          <span>Updated {item.updatedAt}</span>
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            {item.tags.map(t => (
              <span key={t} className="d-annotation" style={{ fontSize: '0.625rem' }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      <hr className="carbon-divider" />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {[
          { label: 'Tasks', value: '12', sub: '3 open' },
          { label: 'Commits', value: '47', sub: 'this week' },
          { label: 'Coverage', value: '84%', sub: '+2% from last' },
          { label: 'AI Interactions', value: '28', sub: 'today' },
        ].map(stat => (
          <div key={stat.label} className="d-surface carbon-card" style={{ textAlign: 'center' }}>
            <div className="mono-data" style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--d-primary)' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 500, marginTop: '0.25rem' }}>{stat.label}</div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Chat thread */}
      <div style={{ flex: 1, minHeight: 300 }}>
        <h2 className="d-label" style={{
          borderLeft: '2px solid var(--d-accent)',
          paddingLeft: '0.5rem',
          marginBottom: '0.75rem',
        }}>
          COPILOT THREAD
        </h2>
        <div className="d-surface carbon-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <ChatThread messages={workspaceDetailMessages} />
        </div>
      </div>
    </div>
  );
}
