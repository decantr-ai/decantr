import { NavLink } from 'react-router-dom';
import { Plus, GitCompareArrows } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { prompts } from '@/data/mock';

export function PromptsPage() {
  return (
    <div>
      <PageHeader
        title="Prompt Library"
        description={`${prompts.length} prompts · version-controlled`}
        actions={
          <>
            <NavLink to="/prompts/compare" className="d-interactive" data-variant="ghost" style={{ fontSize: '0.8rem' }}>
              <GitCompareArrows size={14} /> Compare
            </NavLink>
            <button className="d-interactive" data-variant="primary" style={{ background: 'var(--d-accent)', borderColor: 'var(--d-accent)', color: '#0a0a0a', fontSize: '0.8rem' }}>
              <Plus size={14} /> New prompt
            </button>
          </>
        }
      />
      <div className="carbon-panel">
        <table className="d-data">
          <thead>
            <tr>
              <th className="d-data-header">Name</th>
              <th className="d-data-header">Description</th>
              <th className="d-data-header">Tags</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Version</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Updated</th>
            </tr>
          </thead>
          <tbody>
            {prompts.map(p => (
              <tr key={p.id} className="d-data-row">
                <td className="d-data-cell">
                  <NavLink to={`/prompts/${p.id}`} style={{ color: 'var(--d-text)', textDecoration: 'none', fontFamily: 'var(--d-font-mono)', fontWeight: 500 }}>
                    {p.name}
                  </NavLink>
                </td>
                <td className="d-data-cell" style={{ color: 'var(--d-text-muted)', fontSize: '0.8rem' }}>{p.description}</td>
                <td className="d-data-cell">
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {p.tags.map(t => (
                      <span key={t} className="mono-inline" style={{ fontSize: '0.62rem', color: 'var(--d-text-muted)', borderColor: 'var(--d-border)' }}>{t}</span>
                    ))}
                  </div>
                </td>
                <td className="d-data-cell mono-data" style={{ textAlign: 'right', fontSize: '0.78rem', color: 'var(--d-accent)' }}>{p.currentVersion}</td>
                <td className="d-data-cell mono-data" style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{p.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
