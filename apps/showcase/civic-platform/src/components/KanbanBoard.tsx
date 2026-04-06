import { css } from '@decantr/css';
import { serviceRequests, type ServiceRequest } from '@/data/mock';
import { Link } from 'react-router-dom';
import { AlertCircle, Clock, Wrench, CheckCircle } from 'lucide-react';

const columns: { status: ServiceRequest['status']; label: string; icon: typeof AlertCircle }[] = [
  { status: 'new', label: 'New', icon: AlertCircle },
  { status: 'assigned', label: 'Assigned', icon: Clock },
  { status: 'in-progress', label: 'In Progress', icon: Wrench },
  { status: 'resolved', label: 'Resolved', icon: CheckCircle },
];

const priorityColors: Record<string, string> = {
  urgent: 'var(--d-error)',
  high: 'var(--d-warning)',
  medium: 'var(--d-info)',
  low: 'var(--d-text-muted)',
};

export function KanbanBoard() {
  return (
    <div className={css('_flex _gap4')} style={{ overflowX: 'auto', minHeight: 300 }}>
      {columns.map(col => {
        const items = serviceRequests.filter(r => r.status === col.status);
        const Icon = col.icon;
        return (
          <div key={col.status} style={{ minWidth: 240, flex: 1 }}>
            <div className={css('_flex _aic _gap2 _mb3')} style={{ padding: '0.5rem 0' }}>
              <Icon size={16} style={{ color: 'var(--d-text-muted)' }} aria-hidden />
              <span className="d-label">{col.label}</span>
              <span className="gov-badge" style={{
                background: 'var(--d-surface-raised)',
                color: 'var(--d-text-muted)',
                fontSize: '0.6875rem',
                padding: '0.125rem 0.375rem',
                marginLeft: 'auto',
              }}>
                {items.length}
              </span>
            </div>
            <div className={css('_flex _col _gap2')}>
              {items.map(req => (
                <Link
                  key={req.id}
                  to={`/requests/${req.id}`}
                  className="d-surface gov-card"
                  data-interactive
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    padding: '0.75rem',
                    display: 'block',
                    borderLeft: `3px solid ${priorityColors[req.priority]}`,
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', marginBottom: '0.25rem' }}>
                    {req.id}
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                    {req.title}
                  </div>
                  <div className={css('_flex _jcsb _aic')} style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
                    <span>{req.category}</span>
                    <span className="d-annotation" data-status={req.priority === 'urgent' ? 'error' : req.priority === 'high' ? 'warning' : 'info'}>
                      {req.priority}
                    </span>
                  </div>
                </Link>
              ))}
              {items.length === 0 && (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--d-text-muted)', fontSize: '0.875rem' }}>
                  No requests
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
