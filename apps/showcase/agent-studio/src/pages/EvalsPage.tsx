import { NavLink } from 'react-router-dom';
import { Plus, GitCompareArrows } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { evals } from '@/data/mock';

export function EvalsPage() {
  return (
    <div>
      <PageHeader
        title="Eval Suite"
        description={`${evals.length} runs · regression detection enabled`}
        actions={
          <>
            <NavLink to="/evals/compare" className="d-interactive" data-variant="ghost" style={{ fontSize: '0.8rem' }}>
              <GitCompareArrows size={14} /> Compare
            </NavLink>
            <NavLink to="/evals/create" className="d-interactive" data-variant="primary" style={{ background: 'var(--d-accent)', borderColor: 'var(--d-accent)', color: '#0a0a0a', fontSize: '0.8rem' }}>
              <Plus size={14} /> New run
            </NavLink>
          </>
        }
      />
      <div className="carbon-panel">
        <table className="d-data">
          <thead>
            <tr>
              <th className="d-data-header">Run</th>
              <th className="d-data-header">Agent</th>
              <th className="d-data-header">Model</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Score</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Pass</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Duration</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>When</th>
            </tr>
          </thead>
          <tbody>
            {evals.map(e => (
              <tr key={e.id} className="d-data-row">
                <td className="d-data-cell">
                  <NavLink to={`/evals/${e.id}`} style={{ color: 'var(--d-text)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="status-dot" data-status={e.status} />
                    <span style={{ fontFamily: 'var(--d-font-mono)', fontSize: '0.8rem' }}>{e.name}</span>
                  </NavLink>
                </td>
                <td className="d-data-cell" style={{ fontSize: '0.78rem' }}>{e.agent}</td>
                <td className="d-data-cell mono-data" style={{ fontSize: '0.74rem', color: 'var(--d-text-muted)' }}>{e.model}</td>
                <td className="d-data-cell mono-data" style={{ textAlign: 'right', fontSize: '0.82rem', fontWeight: 600, color: e.status === 'passed' ? 'var(--d-success)' : e.status === 'failed' ? 'var(--d-error)' : e.status === 'regression' ? 'var(--d-warning)' : 'var(--d-text-muted)' }}>
                  {e.score > 0 ? `${e.score}%` : '—'}
                </td>
                <td className="d-data-cell mono-data" style={{ textAlign: 'right', fontSize: '0.78rem' }}>
                  {e.passed}/{e.total}
                </td>
                <td className="d-data-cell mono-data" style={{ textAlign: 'right', fontSize: '0.74rem', color: 'var(--d-text-muted)' }}>
                  {(e.duration / 1000).toFixed(1)}s
                </td>
                <td className="d-data-cell mono-data" style={{ textAlign: 'right', fontSize: '0.72rem', color: 'var(--d-text-muted)' }}>{e.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
