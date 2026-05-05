import { CheckCircle, XCircle, Clock, Minus } from 'lucide-react';
import { DataTable } from '@/components/DataTable';
import { complianceItems } from '@/data/mock';

const statusIcons: Record<string, React.ElementType> = {
  passed: CheckCircle,
  failed: XCircle,
  pending: Clock,
  na: Minus,
};

export function CompliancePage() {
  const passed = complianceItems.filter(c => c.status === 'passed').length;
  const failed = complianceItems.filter(c => c.status === 'failed').length;
  const pending = complianceItems.filter(c => c.status === 'pending').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)' }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Compliance</h1>

      {/* Compliance Checklist Summary */}
      <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
        <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '0.75rem' }}>
          Compliance Overview
        </div>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={16} style={{ color: 'var(--d-success)' }} />
            <span className="mono-data" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{passed}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>Passed</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <XCircle size={16} style={{ color: 'var(--d-error)' }} />
            <span className="mono-data" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{failed}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>Failed</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={16} style={{ color: 'var(--d-warning)' }} />
            <span className="mono-data" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{pending}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>Pending</span>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <div className="lp-gauge-track" style={{ width: 200 }}>
              <div className="lp-gauge-fill" data-level={failed > 0 ? 'warn' : 'safe'} style={{ width: `${(passed / complianceItems.length) * 100}%` }} />
            </div>
            <div className="mono-data" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', marginTop: '0.25rem', textAlign: 'right' }}>
              {((passed / complianceItems.length) * 100).toFixed(0)}% compliant
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Checklist */}
      <div className="d-surface" style={{ padding: 0, overflow: 'hidden' }}>
        {complianceItems.map((item, i) => {
          const Icon = statusIcons[item.status];
          return (
            <div
              key={item.id}
              className="d-data-row"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                padding: '0.875rem var(--d-surface-p)',
                gap: '0.75rem',
                borderTop: i === 0 ? 'none' : undefined,
              }}
            >
              <Icon size={18} className="lp-check-icon" data-status={item.status} style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{item.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', marginTop: '0.125rem' }}>{item.description}</div>
              </div>
              <span className="d-annotation">{item.category}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', minWidth: 60, textAlign: 'right' }}>{item.lastChecked}</span>
            </div>
          );
        })}
      </div>

      {/* Audit Log Table */}
      <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}>
        Recent Audit Events
      </div>
      <DataTable
        keyField="id"
        columns={[
          { key: 'time', label: 'Time', sortable: true },
          { key: 'actor', label: 'Actor', sortable: true },
          { key: 'action', label: 'Action' },
          { key: 'resource', label: 'Resource' },
          { key: 'result', label: 'Result', render: (row) => (
            <span className="d-annotation" data-status={row.result === 'allowed' ? 'success' : 'error'}>
              {String(row.result)}
            </span>
          )},
        ]}
        data={[
          { id: 'a1', time: '14:32:01', actor: 'Sarah Chen', action: 'deploy.create', resource: 'acme-web', result: 'allowed' },
          { id: 'a2', time: '14:18:45', actor: 'Marcus Johnson', action: 'env.update', resource: 'acme-api', result: 'allowed' },
          { id: 'a3', time: '13:45:12', actor: 'API Token (ci-deploy)', action: 'deploy.create', resource: 'dashboard-v2', result: 'allowed' },
          { id: 'a4', time: '12:30:00', actor: 'David Kim', action: 'settings.update', resource: 'org-settings', result: 'denied' },
          { id: 'a5', time: '11:15:33', actor: 'James Wilson', action: 'token.rotate', resource: 'ci-deploy-token', result: 'allowed' },
        ]}
      />
    </div>
  );
}
