import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Users, Clock, ArrowUpRight, CalendarDays } from 'lucide-react';
import { tables } from '../../data/mock';
import { KpiCard } from '../../components/KpiCard';

export function FloorPage() {
  const occupied = tables.filter(t => t.status === 'occupied').length;
  const available = tables.filter(t => t.status === 'available').length;
  const reserved = tables.filter(t => t.status === 'reserved').length;
  const totalCovers = tables.filter(t => t.status === 'occupied').reduce((s, t) => s + (t.partySize ?? 0), 0);

  return (
    <div className={css('_flex _col _gap4')} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div className={css('_flex _aic _jcsb')}>
        <div>
          <h1 className="bistro-handwritten" style={{ fontSize: '1.5rem' }}>Floor Map</h1>
          <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Live table status — dinner service</p>
        </div>
        <div className={css('_flex _aic _gap2')}>
          <Link to="/floor/reservations" className="d-interactive" style={{ textDecoration: 'none', fontSize: '0.8125rem' }}>
            <CalendarDays size={14} /> Reservations
          </Link>
          <Link to="/floor/reservations/new" className="d-interactive" data-variant="primary" style={{ textDecoration: 'none', fontSize: '0.8125rem' }}>
            + Walk-in
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
        <KpiCard label="Covers" value={String(totalCovers)} sub={`of ${tables.reduce((s, t) => s + t.seats, 0)} capacity`} icon={Users} />
        <KpiCard label="Tables Occupied" value={`${occupied} / ${tables.length}`} icon={ArrowUpRight} trend="up" />
        <KpiCard label="Available" value={String(available)} icon={Clock} trend="neutral" />
        <KpiCard label="Reserved Tonight" value={String(reserved)} icon={CalendarDays} />
      </div>

      {/* Floor Map */}
      <div className="bistro-warm-card" style={{ padding: '1.25rem', cursor: 'default', overflow: 'auto' }}>
        <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '0.75rem' }}>
          <span className="bistro-handwritten" style={{ fontSize: '1rem' }}>Dining Room</span>
          <div className={css('_flex _aic _gap3')}>
            {(['available', 'occupied', 'reserved', 'cleaning'] as const).map(s => (
              <div key={s} className={css('_flex _aic _gap1')}>
                <div style={{ width: 10, height: 10, borderRadius: '50%',
                  background: s === 'available' ? 'var(--d-success)' : s === 'occupied' ? 'var(--d-primary)' : s === 'reserved' ? 'var(--d-info)' : 'var(--d-warning)' }} />
                <span style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)', textTransform: 'capitalize' }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: 'relative', width: 540, height: 320, background: 'var(--d-surface-raised)', borderRadius: 'var(--d-radius)', border: '1px solid var(--d-border)' }}>
          {/* Kitchen label */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 24, background: 'var(--d-border)', borderRadius: 'var(--d-radius-sm) var(--d-radius-sm) 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--d-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Kitchen</span>
          </div>
          {/* Bar label */}
          <div style={{ position: 'absolute', bottom: 8, left: 260, fontSize: '0.6rem', color: 'var(--d-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Bar</div>

          {tables.map(t => (
            <div key={t.id} className="table-shape" data-status={t.status}
              title={t.guestName ? `${t.guestName} (${t.partySize})` : `Table ${t.number} — ${t.status}`}
              style={{
                position: 'absolute',
                left: t.x, top: t.y + 24,
                width: t.width, height: t.height,
                borderRadius: t.shape === 'round' ? '50%' : 'var(--d-radius-sm)',
                flexDirection: 'column',
                gap: '0.125rem',
                fontSize: '0.6875rem',
              }}>
              <span style={{ fontWeight: 700 }}>T{t.number}</span>
              {t.partySize != null && <span style={{ fontSize: '0.5625rem', opacity: 0.8 }}>{t.partySize}/{t.seats}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Activity feed */}
      <div className="bistro-warm-card" style={{ cursor: 'default' }}>
        <span className="d-label" style={{ marginBottom: '0.75rem', display: 'block' }}>Recent Activity</span>
        <div className={css('_flex _col _gap2')}>
          {[
            { time: '6:45 PM', text: 'Table 13 seated — 1 guest (bar)', type: 'info' as const },
            { time: '6:30 PM', text: 'Table 5 seated — Garcia party of 2', type: 'success' as const },
            { time: '6:22 PM', text: 'Order fired for Table 1 — 2 items', type: 'warning' as const },
            { time: '6:15 PM', text: 'Table 1 seated — Johnson party of 2', type: 'success' as const },
            { time: '6:10 PM', text: 'Table 6 cleared — ready for cleaning', type: 'info' as const },
          ].map((a, i) => (
            <div key={i} className={css('_flex _aic _gap3')} style={{ padding: '0.375rem 0', borderBottom: i < 4 ? '1px solid var(--d-border)' : undefined }}>
              <span className="d-annotation" data-status={a.type} style={{ minWidth: 68, justifyContent: 'center' }}>{a.time}</span>
              <span className={css('_textsm')} style={{ color: 'var(--d-text)' }}>{a.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
