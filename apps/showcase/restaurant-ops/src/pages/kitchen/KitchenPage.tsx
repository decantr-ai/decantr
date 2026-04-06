import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Timer, AlertTriangle, CheckCircle, Flame } from 'lucide-react';
import { tickets, formatTime } from '../../data/mock';
import { KpiCard } from '../../components/KpiCard';

export function KitchenPage() {
  const active = tickets.filter(t => t.status !== 'done');
  const rushCount = tickets.filter(t => t.priority === 'rush' || t.priority === 'fire').length;
  const avgTime = Math.round(tickets.reduce((s, t) => s + t.elapsed, 0) / tickets.length);

  return (
    <div className={css('_flex _col _gap4')} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div className={css('_flex _aic _jcsb')}>
        <div>
          <h1 className="bistro-handwritten" style={{ fontSize: '1.5rem' }}>Kitchen Display</h1>
          <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Active ticket rail — all stations</p>
        </div>
        <Link to="/kitchen/stations" className="d-interactive" style={{ textDecoration: 'none', fontSize: '0.8125rem' }}>
          Station View
        </Link>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
        <KpiCard label="Active Tickets" value={String(active.length)} icon={Timer} />
        <KpiCard label="Rush / Fire" value={String(rushCount)} icon={AlertTriangle} trend={rushCount > 0 ? 'down' : 'neutral'} sub={rushCount > 0 ? 'Needs attention' : 'Clear'} />
        <KpiCard label="Avg Ticket Time" value={formatTime(avgTime)} icon={Timer} />
        <KpiCard label="Plating" value={String(tickets.filter(t => t.status === 'plating').length)} icon={CheckCircle} trend="up" sub="Ready soon" />
      </div>

      {/* Ticket Rail */}
      <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <div className={css('_flex _gap3')} style={{ minWidth: 'max-content' }}>
          {active.map(ticket => (
            <div key={ticket.id} className="kds-ticket" data-priority={ticket.priority}>
              <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '0.5rem' }}>
                <span className={css('_fontmedium')} style={{ fontSize: '0.8125rem' }}>Table {ticket.tableNumber}</span>
                <span className="d-annotation" data-status={
                  ticket.priority === 'fire' ? 'error' : ticket.priority === 'rush' ? 'warning' : 'info'
                }>
                  {ticket.priority === 'fire' && <Flame size={10} />}
                  {ticket.priority}
                </span>
              </div>

              <div className={css('_flex _col _gap1')} style={{ marginBottom: '0.5rem' }}>
                {ticket.items.map((item, i) => (
                  <div key={i} className={css('_flex _aic _jcsb')} style={{ fontSize: '0.8125rem' }}>
                    <span>{item.qty}x {item.name}</span>
                    {item.mods && <span style={{ fontSize: '0.6875rem', color: 'var(--d-warning)', fontStyle: 'italic' }}>{item.mods}</span>}
                  </div>
                ))}
              </div>

              <div className={css('_flex _aic _jcsb')} style={{ borderTop: '1px solid var(--d-border)', paddingTop: '0.375rem' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>{ticket.station}</span>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  fontFamily: 'var(--d-font-mono, monospace)',
                  color: ticket.elapsed > 600 ? 'var(--d-error)' : ticket.elapsed > 300 ? 'var(--d-warning)' : 'var(--d-success)',
                }}>
                  {formatTime(ticket.elapsed)}
                </span>
              </div>

              {/* Status bar */}
              <div className="depletion-bar" style={{ marginTop: '0.375rem' }}>
                <div className="depletion-bar-fill" style={{
                  width: ticket.status === 'new' ? '15%' : ticket.status === 'cooking' ? '55%' : '85%',
                  background: ticket.status === 'plating' ? 'var(--d-success)' : 'var(--d-primary)',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
