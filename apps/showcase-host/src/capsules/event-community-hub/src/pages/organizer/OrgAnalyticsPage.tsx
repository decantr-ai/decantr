import { css } from '@decantr/css';
import { TrendingUp, DollarSign, Users, Eye } from 'lucide-react';

const kpis = [
  { label: 'Total Revenue', value: '$124,840', delta: '+24%', icon: DollarSign },
  { label: 'Tickets Sold', value: '3,842', delta: '+18%', icon: TrendingUp },
  { label: 'Attendees', value: '8,420', delta: '+32%', icon: Users },
  { label: 'Page Views', value: '142k', delta: '+12%', icon: Eye },
];

const bars = [38, 52, 48, 61, 72, 68, 85, 91, 78, 96, 102, 118];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const earnings = [
  { event: 'Neon Bloom Festival', gross: 48240, net: 41004, tickets: 742 },
  { event: 'Sunset Sessions Vol. 7', gross: 7000, net: 5950, tickets: 280 },
  { event: 'Bass Cathedral', gross: 10400, net: 8840, tickets: 520 },
  { event: 'Hypercolor', gross: 14420, net: 12257, tickets: 412 },
];

export function OrgAnalyticsPage() {
  const max = Math.max(...bars);

  return (
    <div className={css('_flex _col _gap5')} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <header>
        <span className="display-label">Analytics</span>
        <h1 className="display-heading" style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>Performance insights</h1>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {kpis.map((k) => (
          <div key={k.label} className="kpi-tile">
            <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '0.5rem' }}>
              <span className="display-label">{k.label}</span>
              <k.icon size={16} style={{ color: 'var(--d-primary)' }} />
            </div>
            <div className="display-heading gradient-pink-violet" style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{k.value}</div>
            <div className={css('_textsm')} style={{ color: 'var(--d-secondary)', fontWeight: 600 }}>{k.delta} vs last year</div>
          </div>
        ))}
      </div>

      <div className="feature-tile">
        <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '1.25rem' }}>
          <h2 className="display-heading section-title" style={{ fontSize: '1.125rem' }}>Revenue over time</h2>
          <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Last 12 months</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: 200, padding: '0 0.5rem' }}>
          {bars.map((v, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '100%',
                height: `${(v / max) * 100}%`,
                background: 'linear-gradient(180deg, var(--d-primary), #7a00ff)',
                borderRadius: '4px 4px 0 0',
                transition: 'opacity 200ms',
                boxShadow: '0 0 10px rgba(255, 0, 229, 0.3)',
              }} />
              <span style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>{months[i]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="feature-tile">
        <h2 className="display-heading section-title" style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Earnings by event</h2>
        <table className="d-data">
          <thead>
            <tr>
              <th className="d-data-header">Event</th>
              <th className="d-data-header">Tickets</th>
              <th className="d-data-header">Gross</th>
              <th className="d-data-header">Net</th>
            </tr>
          </thead>
          <tbody>
            {earnings.map((e) => (
              <tr key={e.event} className="d-data-row">
                <td className="d-data-cell"><span className={css('_fontmedium')} style={{ fontSize: '0.875rem' }}>{e.event}</span></td>
                <td className="d-data-cell" style={{ fontSize: '0.875rem' }}>{e.tickets.toLocaleString()}</td>
                <td className="d-data-cell" style={{ fontSize: '0.875rem' }}>${e.gross.toLocaleString()}</td>
                <td className="d-data-cell">
                  <span className="display-heading gradient-pink-violet" style={{ fontSize: '0.9375rem' }}>${e.net.toLocaleString()}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
