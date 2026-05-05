import { NavLink } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { traces } from '@/data/mock';

export function TracesPage() {
  return (
    <div>
      <PageHeader
        title="Traces"
        description={`${traces.length} recent executions · live`}
      />
      <div className="carbon-panel">
        <table className="d-data">
          <thead>
            <tr>
              <th className="d-data-header">Trace ID</th>
              <th className="d-data-header">Agent</th>
              <th className="d-data-header">User</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Duration</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Tokens</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>Cost</th>
              <th className="d-data-header" style={{ textAlign: 'right' }}>When</th>
            </tr>
          </thead>
          <tbody>
            {traces.map(t => (
              <tr key={t.id} className="d-data-row">
                <td className="d-data-cell">
                  <NavLink to={`/traces/${t.id}`} style={{ color: 'var(--d-text)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="status-dot" data-status={t.status} />
                    <span className="mono-inline" style={{ fontSize: '0.7rem', color: 'var(--d-accent)', borderColor: 'var(--d-border)' }}>{t.id}</span>
                  </NavLink>
                </td>
                <td className="d-data-cell" style={{ fontSize: '0.78rem' }}>{t.agent}</td>
                <td className="d-data-cell mono-data" style={{ fontSize: '0.72rem', color: 'var(--d-text-muted)' }}>{t.user}</td>
                <td className="d-data-cell mono-data" style={{ textAlign: 'right', fontSize: '0.78rem' }}>{t.duration}ms</td>
                <td className="d-data-cell mono-data" style={{ textAlign: 'right', fontSize: '0.78rem' }}>{t.tokens.toLocaleString()}</td>
                <td className="d-data-cell mono-data" style={{ textAlign: 'right', fontSize: '0.78rem' }}>${t.cost.toFixed(4)}</td>
                <td className="d-data-cell mono-data" style={{ textAlign: 'right', fontSize: '0.72rem', color: 'var(--d-text-muted)' }}>{t.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
