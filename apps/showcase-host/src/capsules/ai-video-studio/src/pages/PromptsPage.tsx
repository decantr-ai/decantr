import { NavLink } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { prompts } from '@/data/mock';

export function PromptsPage() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? prompts : prompts.filter(p => p.status === filter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Prompts</h1>
        <button className="d-interactive" data-variant="primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
          <Plus size={14} /> New Prompt
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {['all', 'active', 'draft', 'archived'].map(s => (
          <button
            key={s}
            className="d-interactive"
            data-variant={filter === s ? undefined : 'ghost'}
            onClick={() => setFilter(s)}
            style={{ padding: '4px 10px', fontSize: '0.75rem', textTransform: 'capitalize', border: filter === s ? '1px solid var(--d-primary)' : undefined, background: filter === s ? 'color-mix(in srgb, var(--d-primary) 12%, transparent)' : undefined }}
          >{s}</button>
        ))}
      </div>

      <table className="d-data">
        <thead>
          <tr>
            <th className="d-data-header">Prompt</th>
            <th className="d-data-header">Scene</th>
            <th className="d-data-header">Version</th>
            <th className="d-data-header">Tokens</th>
            <th className="d-data-header">Status</th>
            <th className="d-data-header">Updated</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(p => (
            <tr key={p.id} className="d-data-row" style={{ cursor: 'pointer' }} onClick={() => window.location.hash = `/prompts/${p.id}`}>
              <td className="d-data-cell">
                <NavLink to={`/prompts/${p.id}`} style={{ textDecoration: 'none', color: 'var(--d-text)', fontWeight: 500, fontSize: '0.85rem' }}>{p.title}</NavLink>
              </td>
              <td className="d-data-cell"><span className="cinema-slate">{p.scene}</span></td>
              <td className="d-data-cell" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem' }}>v{p.version}</td>
              <td className="d-data-cell" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>{p.tokens}</td>
              <td className="d-data-cell">
                <span className="d-annotation" data-status={p.status === 'active' ? 'success' : p.status === 'draft' ? 'warning' : undefined}>{p.status}</span>
              </td>
              <td className="d-data-cell" style={{ color: 'var(--d-text-muted)', fontSize: '0.8rem' }}>{p.updatedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
