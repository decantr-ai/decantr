import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, RefreshCw, Settings } from 'lucide-react';
import { KpiGrid } from '@/components/KpiGrid';
import { DataTable } from '@/components/DataTable';
import { cloudApps, infraKpis, logEntries, requestTraceSteps } from '@/data/mock';

export function AppDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const app = cloudApps.find(a => a.id === id) || cloudApps[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)' }}>
      {/* Detail Header */}
      <div style={{ borderBottom: '1px solid var(--d-border)', paddingBottom: 'var(--d-content-gap)' }}>
        <button
          className="d-interactive"
          data-variant="ghost"
          onClick={() => navigate('/apps')}
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', marginBottom: '0.5rem' }}
        >
          <ArrowLeft size={14} /> Apps
        </button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{app.name}</h1>
            <span className="lp-status-dot" data-status={app.status} />
            <span className="d-annotation" data-status={app.status === 'healthy' ? 'success' : app.status === 'degraded' ? 'warning' : 'info'}>
              {app.status}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <a
              href={`https://${app.url}`}
              className="d-interactive"
              data-variant="ghost"
              style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem', textDecoration: 'none' }}
              target="_blank"
              rel="noopener"
            >
              <ExternalLink size={14} /> Visit
            </a>
            <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}>
              <RefreshCw size={14} /> Redeploy
            </button>
            <button className="d-interactive" data-variant="ghost" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}>
              <Settings size={14} />
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>
          <span>{app.framework}</span>
          <span style={{ color: 'var(--d-border)' }}>|</span>
          <span>{app.region}</span>
          <span style={{ color: 'var(--d-border)' }}>|</span>
          <span>{app.branch}</span>
          <span style={{ color: 'var(--d-border)' }}>|</span>
          <span>Deployed {app.lastDeploy}</span>
        </div>
      </div>

      {/* KPI Grid */}
      <KpiGrid items={infraKpis} />

      {/* Log Stream + Deployments Table */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--d-content-gap)' }}>
        {/* Log Stream */}
        <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}>
              Live Logs
            </div>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {(['info', 'warn', 'error'] as const).map(level => (
                <span key={level} className="d-annotation" data-status={level === 'error' ? 'error' : level === 'warn' ? 'warning' : undefined}>
                  {level}
                </span>
              ))}
            </div>
          </div>
          <div style={{ background: 'var(--d-bg)', borderRadius: 'var(--d-radius-sm)', padding: '0.75rem', maxHeight: 320, overflowY: 'auto' }}>
            {logEntries.map(log => (
              <div key={log.id} className="lp-log-line" data-level={log.level}>
                <span style={{ color: 'var(--d-text-muted)', marginRight: '0.5rem' }}>{log.timestamp}</span>
                <span style={{
                  display: 'inline-block',
                  width: 40,
                  textAlign: 'right',
                  marginRight: '0.5rem',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                }}>
                  {log.level}
                </span>
                {log.message}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Deploys Table */}
        <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
          <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '0.75rem' }}>
            Recent Deployments
          </div>
          <DataTable
            keyField="id"
            columns={[
              { key: 'id', label: 'ID', render: (row) => <span className="mono-data" style={{ fontSize: '0.8rem' }}>{String(row.id).slice(0, 8)}</span> },
              { key: 'branch', label: 'Branch' },
              { key: 'status', label: 'Status', render: (row) => <span className="d-annotation" data-status={row.status === 'success' ? 'success' : 'warning'}>{String(row.status)}</span> },
              { key: 'duration', label: 'Duration' },
              { key: 'time', label: 'Time' },
            ]}
            data={[
              { id: 'dpl_8f3a2b1e', branch: 'main', status: 'success', duration: '48s', time: '3m ago' },
              { id: 'dpl_7e2c9d4f', branch: 'feat/charts', status: 'success', duration: '52s', time: '1h ago' },
              { id: 'dpl_6d1b8c3e', branch: 'main', status: 'success', duration: '45s', time: '3h ago' },
              { id: 'dpl_5c0a7b2d', branch: 'fix/auth', status: 'success', duration: '41s', time: '6h ago' },
              { id: 'dpl_4b9f6a1c', branch: 'main', status: 'building', duration: '--', time: '8h ago' },
            ]}
          />
        </div>
      </div>

      {/* Request Trace */}
      <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
        <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '0.75rem' }}>
          Request Trace — GET /api/users
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexWrap: 'wrap' }}>
          {requestTraceSteps.map((step, i) => (
            <div key={step.name} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                padding: '0.375rem 0.75rem',
                background: step.status === 'warn' ? 'color-mix(in srgb, var(--d-warning) 15%, transparent)' : 'var(--d-surface-raised)',
                borderRadius: 'var(--d-radius-sm)',
                fontSize: '0.75rem',
                border: step.status === 'warn' ? '1px solid var(--d-warning)' : '1px solid var(--d-border)',
              }}>
                <div style={{ fontWeight: 500 }}>{step.name}</div>
                <div className="mono-data" style={{ color: 'var(--d-text-muted)', fontSize: '0.7rem' }}>{step.duration}</div>
              </div>
              {i < requestTraceSteps.length - 1 && (
                <div style={{ width: 16, height: 1, background: 'var(--d-border)' }} />
              )}
            </div>
          ))}
        </div>
        <div className="mono-data" style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>
          Total: 142ms | req_7f3a8b1e
        </div>
      </div>
    </div>
  );
}
