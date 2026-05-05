import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { PriorityBadge } from '@/components/StatusBadge';
import { maintenanceTickets, ticketColumns } from '@/data/mock';

export function MaintenanceBoardPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%' }}>
      <PageHeader
        title="Maintenance Board"
        description={`${maintenanceTickets.filter(t => t.status !== 'resolved').length} open tickets across ${ticketColumns.length} stages`}
        actions={
          <button className="pm-button-primary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.825rem' }}>
            <Plus size={14} /> Submit request
          </button>
        }
      />

      <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {ticketColumns.map(col => {
          const colTickets = maintenanceTickets.filter(t => t.status === col.key);
          return (
            <div key={col.key} className="pm-kanban-column">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.25rem 0.25rem', borderBottom: `2px solid ${col.color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--d-primary)' }}>{col.label}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', fontWeight: 600 }}>{colTickets.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {colTickets.map(t => (
                  <Link key={t.id} to={`/maintenance/${t.id}`} className="pm-kanban-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', gap: '0.5rem' }}>
                      <div style={{ fontSize: '0.825rem', fontWeight: 600, lineHeight: 1.3 }}>{t.title}</div>
                      <PriorityBadge priority={t.priority} />
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--d-text-muted)', marginBottom: '0.5rem', lineHeight: 1.5 }}>
                      {t.propertyName} · Unit {t.unitNumber}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>
                      <span>{t.number}</span>
                      <span>{t.submitted}</span>
                    </div>
                    {t.assignee && (
                      <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--d-border)', fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>
                        → {t.assignee}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
