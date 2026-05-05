import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Bot, FolderOpen, Plus } from 'lucide-react';
import { agents } from '@/data/mock';

export function AgentTreeAside() {
  const location = useLocation();
  const grouped = {
    active: agents.filter(a => a.status === 'active'),
    draft: agents.filter(a => a.status === 'draft'),
    other: agents.filter(a => a.status !== 'active' && a.status !== 'draft'),
  };

  return (
    <div style={{ padding: '0.5rem 0.25rem', fontFamily: 'var(--d-font-mono)' }}>
      <div style={{ display: 'flex', gap: 4, padding: '0 0.5rem 0.625rem', borderBottom: '1px solid var(--d-border)', marginBottom: '0.5rem' }}>
        <NavLink
          to="/agents"
          style={({ isActive }) => ({
            flex: 1,
            padding: '4px 8px',
            fontSize: '0.7rem',
            borderRadius: 3,
            textDecoration: 'none',
            textAlign: 'center',
            color: isActive && location.pathname === '/agents' ? 'var(--d-accent)' : 'var(--d-text-muted)',
            background: isActive && location.pathname === '/agents' ? 'color-mix(in srgb, var(--d-accent) 12%, transparent)' : 'transparent',
          })}
        >
          All
        </NavLink>
        <NavLink
          to="/agents/config"
          style={({ isActive }) => ({
            flex: 1,
            padding: '4px 8px',
            fontSize: '0.7rem',
            borderRadius: 3,
            textDecoration: 'none',
            textAlign: 'center',
            color: isActive ? 'var(--d-accent)' : 'var(--d-text-muted)',
            background: isActive ? 'color-mix(in srgb, var(--d-accent) 12%, transparent)' : 'transparent',
          })}
        >
          Config
        </NavLink>
        <NavLink
          to="/agents/tools"
          style={({ isActive }) => ({
            flex: 1,
            padding: '4px 8px',
            fontSize: '0.7rem',
            borderRadius: 3,
            textDecoration: 'none',
            textAlign: 'center',
            color: isActive ? 'var(--d-accent)' : 'var(--d-text-muted)',
            background: isActive ? 'color-mix(in srgb, var(--d-accent) 12%, transparent)' : 'transparent',
          })}
        >
          Tools
        </NavLink>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
        <GroupHeader label="active" count={grouped.active.length} />
        {grouped.active.map(a => (
          <AgentTreeRow key={a.id} id={a.id} name={a.name} active={location.pathname === `/agents/${a.id}`} />
        ))}
        <GroupHeader label="draft" count={grouped.draft.length} />
        {grouped.draft.map(a => (
          <AgentTreeRow key={a.id} id={a.id} name={a.name} active={location.pathname === `/agents/${a.id}`} />
        ))}
        {grouped.other.length > 0 && (
          <>
            <GroupHeader label="archived" count={grouped.other.length} />
            {grouped.other.map(a => (
              <AgentTreeRow key={a.id} id={a.id} name={a.name} active={location.pathname === `/agents/${a.id}`} />
            ))}
          </>
        )}
      </div>

      <button
        className="d-interactive"
        data-variant="ghost"
        style={{
          marginTop: '0.5rem',
          width: '100%',
          justifyContent: 'flex-start',
          padding: '4px 8px',
          fontSize: '0.75rem',
          color: 'var(--d-text-muted)',
          fontFamily: 'var(--d-font-mono)',
        }}
      >
        <Plus size={12} />
        New agent
      </button>
    </div>
  );
}

function GroupHeader({ label, count }: { label: string; count: number }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      padding: '0.375rem 0.5rem 0.125rem',
      fontSize: '0.6rem',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: 'var(--d-text-muted)',
    }}>
      <ChevronDown size={10} />
      <FolderOpen size={10} />
      <span>{label}</span>
      <span style={{ marginLeft: 'auto', opacity: 0.6 }}>{count}</span>
    </div>
  );
}

function AgentTreeRow({ id, name, active }: { id: string; name: string; active: boolean }) {
  return (
    <NavLink to={`/agents/${id}`} className="tree-row" data-active={active ? 'true' : undefined} style={{ textDecoration: 'none' }}>
      <Bot size={11} style={{ opacity: 0.7 }} />
      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
    </NavLink>
  );
}

