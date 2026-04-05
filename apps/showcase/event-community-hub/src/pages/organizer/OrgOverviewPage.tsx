import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { TrendingUp, Users, DollarSign, Calendar, Plus, ArrowRight } from 'lucide-react';
import { events } from '../../data/mock';

export function OrgOverviewPage() {
  const myEvents = events.slice(0, 4);
  const kpis = [
    { label: 'Revenue (30d)', value: '$48,240', delta: '+18%', icon: DollarSign },
    { label: 'Tickets sold', value: '1,284', delta: '+12%', icon: TrendingUp },
    { label: 'Total attendees', value: '3,420', delta: '+22%', icon: Users },
    { label: 'Upcoming events', value: '7', delta: 'Next: 4/18', icon: Calendar },
  ];

  return (
    <div className={css('_flex _col _gap6')} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <header className={css('_flex _aic _jcsb')}>
        <div>
          <span className="display-label">Overview</span>
          <h1 className="display-heading" style={{ fontSize: '2rem', marginTop: '0.25rem' }}>Welcome back, Juno</h1>
          <p style={{ color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>Here's how your events are performing.</p>
        </div>
        <button className="d-interactive cta-glossy" style={{ padding: '0.625rem 1rem' }}>
          <Plus size={15} /> New Event
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {kpis.map((k) => (
          <div key={k.label} className="kpi-tile">
            <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '0.5rem' }}>
              <span className="display-label">{k.label}</span>
              <k.icon size={16} style={{ color: 'var(--d-primary)' }} />
            </div>
            <div className="display-heading gradient-pink-violet" style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{k.value}</div>
            <div className={css('_textsm')} style={{ color: 'var(--d-secondary)', fontWeight: 600 }}>{k.delta}</div>
          </div>
        ))}
      </div>

      <section>
        <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '1rem' }}>
          <h2 className="display-heading section-title" style={{ fontSize: '1.25rem' }}>Upcoming events</h2>
          <Link to="/organizer/analytics" className={css('_textsm _fontmedium')} style={{ color: 'var(--d-primary)', textDecoration: 'none' }}>
            View all →
          </Link>
        </div>
        <div className={css('_flex _col _gap3')}>
          {myEvents.map((e) => {
            const d = new Date(e.date);
            const pct = Math.round((e.attendees / e.capacity) * 100);
            return (
              <Link key={e.id} to={`/organizer/events/${e.id}/edit`}
                className={css('_flex _aic _gap4')}
                style={{ padding: '1rem', background: 'var(--d-surface)', border: '1px solid var(--d-border)', borderRadius: 'var(--d-radius)', textDecoration: 'none', color: 'inherit' }}>
                <img src={e.image} alt="" style={{ width: 64, height: 64, borderRadius: 'var(--d-radius-sm)', objectFit: 'cover' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className={css('_fontmedium')} style={{ marginBottom: '0.25rem' }}>{e.title}</div>
                  <div className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>
                    {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {e.venue} · {e.city}
                  </div>
                </div>
                <div style={{ minWidth: 140 }}>
                  <div className={css('_flex _aic _jcsb')} style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--d-text-muted)' }}>{e.attendees}/{e.capacity}</span>
                    <span style={{ color: 'var(--d-primary)', fontWeight: 700 }}>{pct}%</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--d-surface-raised)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--d-primary), var(--d-accent))' }} />
                  </div>
                </div>
                <ArrowRight size={16} style={{ color: 'var(--d-text-muted)' }} />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
