import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Sparkles, Plus, ChevronDown, ChevronRight, MessageSquare, Share2, Bell, LogOut, FileText, X } from 'lucide-react';
import { pageTree, collaborators, comments } from '../data/mock';
import { useAuth } from '../hooks/useAuth';

export function WorkspaceAside() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    product: true, design: false, engineering: false, meetings: false, 'getting-started': false,
  });
  const [commentsOpen, setCommentsOpen] = useState(true);

  const active = collaborators.filter(c => c.status === 'active');

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `248px 1fr ${commentsOpen ? '300px' : '0px'}`,
        gridTemplateRows: '56px 1fr',
        height: '100vh',
        transition: 'grid-template-columns 200ms ease',
      }}
    >
      {/* Page tree sidebar — full height */}
      <aside
        className="paper-surface"
        style={{
          gridRow: '1 / 3',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid var(--d-border)',
          overflow: 'hidden',
        }}
      >
        <div style={{ height: 56, padding: '0 1rem', borderBottom: '1px solid var(--d-border)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <Sparkles size={18} style={{ color: 'var(--d-primary)' }} />
          <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Lumen</span>
        </div>
        <nav style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
          {pageTree.map(node => (
            <div key={node.id}>
              <button
                onClick={() => setExpanded(s => ({ ...s, [node.id]: !s[node.id] }))}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.25rem', width: '100%', padding: '0.3125rem 0.375rem',
                  fontSize: '0.8125rem', fontWeight: 500, color: 'var(--d-text)', background: 'transparent',
                  border: 'none', borderRadius: 'var(--d-radius-sm)', cursor: 'pointer', textAlign: 'left',
                }}
              >
                {expanded[node.id] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                <span style={{ fontSize: '0.875rem' }}>{node.icon}</span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.title}</span>
              </button>
              {expanded[node.id] && node.children && (
                <div style={{ marginLeft: '0.75rem', display: 'flex', flexDirection: 'column' }}>
                  {node.children.map(child => (
                    <Link
                      key={child.id}
                      to={`/doc/${child.id}`}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.3125rem 0.625rem',
                        textDecoration: 'none', borderRadius: 'var(--d-radius-sm)', fontSize: '0.8125rem',
                        color: 'var(--d-text-muted)',
                      }}
                    >
                      <span style={{ fontSize: '0.8125rem' }}>{child.icon}</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{child.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div style={{ padding: '0.5rem', borderTop: '1px solid var(--d-border)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <button className="d-interactive" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.4375rem 0.625rem', fontSize: '0.8125rem' }}>
            <Plus size={14} /><span style={{ marginLeft: '0.5rem' }}>New page</span>
          </button>
          <Link to="/home" className="d-interactive" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.4375rem 0.625rem', fontSize: '0.8125rem', textDecoration: 'none', color: 'var(--d-text-muted)', border: 'none' }}>
            <FileText size={14} /><span style={{ marginLeft: '0.5rem' }}>Workspace home</span>
          </Link>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="d-interactive"
            style={{ width: '100%', justifyContent: 'flex-start', padding: '0.4375rem 0.625rem', fontSize: '0.8125rem', color: 'var(--d-text-muted)', border: 'none' }}
          >
            <LogOut size={14} /><span style={{ marginLeft: '0.5rem' }}>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Header spanning body + aside */}
      <header
        style={{
          gridColumn: '2 / 4',
          height: 56,
          padding: '0 1.5rem',
          borderBottom: '1px solid var(--d-border)',
          background: 'var(--d-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>
          <Link to="/home" style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}>Workspace</Link>
          <span>/</span>
          <span style={{ color: 'var(--d-text)', fontWeight: 500 }}>Document</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="presence-stack">
            {active.slice(0, 4).map(c => (
              <span key={c.id} className="presence-avatar" style={{ background: c.color }} title={c.name}>
                {c.initials}
                <span className="presence-dot active" />
              </span>
            ))}
            {active.length > 4 && (
              <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>+{active.length - 4}</span>
            )}
          </div>
          <button className="d-interactive" style={{ padding: '0.4375rem 0.75rem', fontSize: '0.8125rem' }}>
            <Share2 size={14} /> <span>Share</span>
          </button>
          <button className="d-interactive" style={{ padding: '0.375rem', border: 'none', background: 'transparent' }} aria-label="Notifications">
            <Bell size={16} />
          </button>
          {!commentsOpen && (
            <button
              onClick={() => setCommentsOpen(true)}
              className="d-interactive"
              style={{ padding: '0.375rem', border: 'none', background: 'transparent' }}
              aria-label="Open comments"
            >
              <MessageSquare size={16} />
            </button>
          )}
        </div>
      </header>

      {/* Document body — scrollable */}
      <main className="entrance-fade paper-canvas" style={{ overflowY: 'auto' }}>
        <Outlet />
      </main>

      {/* Comment aside */}
      {commentsOpen && (
        <aside
          className="paper-surface"
          style={{
            display: 'flex', flexDirection: 'column',
            borderLeft: '1px solid var(--d-border)', overflow: 'hidden',
          }}
        >
          <div style={{ height: 44, padding: '0 1rem', borderBottom: '1px solid var(--d-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Comments</span>
            <button onClick={() => setCommentsOpen(false)} style={{ background: 'transparent', border: 'none', padding: '0.25rem', cursor: 'pointer', color: 'var(--d-text-muted)', borderRadius: 'var(--d-radius-sm)' }} aria-label="Close comments">
              <X size={14} />
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {comments.filter(c => !c.resolved).map(c => (
              <div key={c.id} className="paper-card" style={{ padding: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                  <span className="presence-avatar presence-avatar-sm" style={{ background: c.color }}>{c.initials}</span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{c.author}</span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)', marginLeft: 'auto' }}>{c.timestamp}</span>
                </div>
                <p style={{ fontSize: '0.8125rem', lineHeight: 1.55, color: 'var(--d-text)' }}>{c.body}</p>
                {c.replies && c.replies.map((r, i) => (
                  <div key={i} style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--d-border)', display: 'flex', gap: '0.5rem' }}>
                    <span className="presence-avatar presence-avatar-sm" style={{ background: r.color, flexShrink: 0 }}>{r.initials}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.125rem' }}>{r.author} <span style={{ fontWeight: 400, color: 'var(--d-text-muted)', marginLeft: '0.375rem' }}>{r.timestamp}</span></div>
                      <p style={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>{r.body}</p>
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                  <button style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', background: 'transparent', border: 'none', padding: '0.25rem 0', cursor: 'pointer' }}>Reply</button>
                  <button style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', background: 'transparent', border: 'none', padding: '0.25rem 0', cursor: 'pointer' }}>Resolve</button>
                </div>
              </div>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}
