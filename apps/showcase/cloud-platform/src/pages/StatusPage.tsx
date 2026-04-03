import { CheckCircle, AlertTriangle, XCircle, Wrench } from 'lucide-react';
import { statusServices } from '@/data/mock';

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  operational: { icon: CheckCircle, color: 'var(--d-success)', label: 'Operational' },
  degraded: { icon: AlertTriangle, color: 'var(--d-warning)', label: 'Degraded' },
  outage: { icon: XCircle, color: 'var(--d-error)', label: 'Outage' },
  maintenance: { icon: Wrench, color: 'var(--d-text-muted)', label: 'Maintenance' },
};

export function StatusPage() {
  const allOperational = statusServices.every(s => s.status === 'operational');
  const degradedCount = statusServices.filter(s => s.status === 'degraded').length;
  const maintenanceCount = statusServices.filter(s => s.status === 'maintenance').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)' }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Status</h1>

      {/* Overall Status Banner */}
      <div className="d-surface" style={{
        padding: '1.25rem var(--d-surface-p)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        borderLeft: `3px solid ${allOperational ? 'var(--d-success)' : 'var(--d-warning)'}`,
      }}>
        {allOperational ? (
          <CheckCircle size={24} style={{ color: 'var(--d-success)' }} />
        ) : (
          <AlertTriangle size={24} style={{ color: 'var(--d-warning)' }} />
        )}
        <div>
          <div style={{ fontWeight: 600 }}>
            {allOperational ? 'All Systems Operational' : `${degradedCount} service${degradedCount !== 1 ? 's' : ''} degraded, ${maintenanceCount} in maintenance`}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>
            Last updated: 2 minutes ago
          </div>
        </div>
      </div>

      {/* Service Status List */}
      <div className="d-surface" style={{ padding: 0, overflow: 'hidden' }}>
        {statusServices.map((svc, i) => {
          const cfg = statusConfig[svc.status];
          const Icon = cfg.icon;
          return (
            <div
              key={svc.name}
              className="d-data-row"
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.875rem var(--d-surface-p)',
                borderTop: i > 0 ? undefined : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                <Icon size={16} style={{ color: cfg.color, flexShrink: 0 }} />
                <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{svc.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <span className="mono-data" style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', minWidth: 80, textAlign: 'right' }}>
                  {svc.uptime}%
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', minWidth: 100, textAlign: 'right' }}>
                  {svc.incidents > 0 ? `${svc.incidents} incident${svc.incidents > 1 ? 's' : ''}` : 'No incidents'}
                </span>
                <span className="d-annotation" data-status={svc.status === 'operational' ? 'success' : svc.status === 'degraded' ? 'warning' : svc.status === 'outage' ? 'error' : undefined}>
                  {cfg.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Uptime Chart (90 days) */}
      <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
        <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '0.75rem' }}>
          90-Day Uptime
        </div>
        <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
          {Array.from({ length: 90 }, (_, i) => {
            const isIssue = i === 47 || i === 76 || i === 87;
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: isIssue ? 16 : 24,
                  background: isIssue ? 'var(--d-warning)' : 'var(--d-success)',
                  borderRadius: 1,
                  opacity: isIssue ? 0.8 : 0.4,
                }}
                title={`Day ${90 - i}: ${isIssue ? 'Incident' : 'Operational'}`}
              />
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.65rem', color: 'var(--d-text-muted)' }}>
          <span>90 days ago</span>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}
