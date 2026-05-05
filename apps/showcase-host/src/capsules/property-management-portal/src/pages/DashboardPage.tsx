import { Link } from 'react-router-dom';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { KpiGrid } from '@/components/KpiGrid';
import { Chart } from '@/components/Chart';
import { ActivityFeed } from '@/components/ActivityFeed';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import { ownerKpis, ownerCharts, activityEvents, properties, maintenanceTickets, payments } from '@/data/mock';

export function DashboardPage() {
  const urgentTickets = maintenanceTickets.filter(t => t.priority === 'urgent' || t.priority === 'high').slice(0, 4);
  const topProperties = properties.slice(0, 4);
  const rentStatus = payments.slice(0, 6);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Portfolio Overview"
        description="April 2026 · 8 properties · 105 units · $142,820 monthly revenue"
        actions={
          <>
            <button className="d-interactive" style={{ padding: '0.4rem 0.875rem', fontSize: '0.825rem' }}>Export</button>
            <Link to="/properties/new" className="pm-button-primary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.825rem' }}>
              Add property <ArrowRight size={14} />
            </Link>
          </>
        }
      />

      <KpiGrid items={ownerKpis} />

      <div>
        <SectionLabel style={{ marginBottom: '0.75rem' }}>Trends</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--d-content-gap)' }}>
          {ownerCharts.map(chart => (
            <div key={chart.title} className="pm-card" style={{ padding: 'var(--d-surface-p)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--d-primary)' }}>{chart.title}</h3>
                <span className="d-annotation">Last 12 months</span>
              </div>
              <Chart chart={chart} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--d-content-gap)' }}>
        <div className="pm-card" style={{ padding: 'var(--d-surface-p)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <SectionLabel>Needs Attention</SectionLabel>
            <Link to="/maintenance" style={{ fontSize: '0.75rem', color: 'var(--d-accent)', textDecoration: 'none' }}>View all →</Link>
          </div>
          <table className="d-data">
            <thead>
              <tr>
                <th className="d-data-header">Ticket</th>
                <th className="d-data-header">Property / Unit</th>
                <th className="d-data-header">Priority</th>
                <th className="d-data-header">Status</th>
                <th className="d-data-header">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {urgentTickets.map(t => (
                <tr key={t.id} className="d-data-row">
                  <td className="d-data-cell" style={{ fontSize: '0.8rem' }}>
                    <Link to={`/maintenance/${t.id}`} style={{ color: 'var(--d-text)', textDecoration: 'none', fontWeight: 500 }}>{t.title}</Link>
                    <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>{t.number}</div>
                  </td>
                  <td className="d-data-cell" style={{ fontSize: '0.825rem' }}>
                    {t.propertyName}<br />
                    <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Unit {t.unitNumber}</span>
                  </td>
                  <td className="d-data-cell"><PriorityBadge priority={t.priority} /></td>
                  <td className="d-data-cell"><StatusBadge status={t.status} /></td>
                  <td className="d-data-cell" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{t.submitted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pm-card" style={{ padding: 'var(--d-surface-p)' }}>
          <SectionLabel style={{ marginBottom: '0.75rem' }}>Recent Activity</SectionLabel>
          <ActivityFeed events={activityEvents.slice(0, 6)} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--d-content-gap)' }}>
        <div className="pm-card" style={{ padding: 'var(--d-surface-p)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <SectionLabel>Occupancy Snapshot</SectionLabel>
            <Link to="/properties" style={{ fontSize: '0.75rem', color: 'var(--d-accent)', textDecoration: 'none' }}>All properties →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {topProperties.map(p => {
              const occ = (p.occupiedUnits / p.units) * 100;
              return (
                <div key={p.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div className="pm-property-thumb" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>{p.image}</div>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{p.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>{p.occupiedUnits}/{p.units} units</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--d-primary)' }}>{occ.toFixed(0)}%</span>
                  </div>
                  <div className="pm-occupancy-bar">
                    <div className="pm-occupancy-fill" style={{ width: `${occ}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pm-card" style={{ padding: 'var(--d-surface-p)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={14} style={{ color: 'var(--d-warning)' }} />
              <SectionLabel>April Rent Status</SectionLabel>
            </div>
            <Link to="/financials/rent-roll" style={{ fontSize: '0.75rem', color: 'var(--d-accent)', textDecoration: 'none' }}>Rent roll →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {rentStatus.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.625rem', background: 'var(--d-surface-raised)', borderRadius: 'var(--d-radius-sm)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.825rem', fontWeight: 500 }}>{p.tenantName}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>{p.propertyName} · {p.unitNumber}</div>
                </div>
                <span style={{ fontSize: '0.825rem', fontWeight: 600 }}>${p.amount.toLocaleString()}</span>
                <StatusBadge status={p.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
