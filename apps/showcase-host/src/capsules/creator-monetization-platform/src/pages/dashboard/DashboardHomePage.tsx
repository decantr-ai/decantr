import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { TrendingUp, Users, DollarSign, FileText, Plus, Zap, Download } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { currentCreator, revenueSeries, activity } from '../../data/mock';

const kpis = [
  { label: 'Monthly Revenue', value: '$8,340', delta: '+6.4%', icon: DollarSign, color: '#9A3412', bg: 'linear-gradient(135deg, #FED7AA, #FDBA74)' },
  { label: 'Active Subscribers', value: '5,987', delta: '+128', icon: Users, color: '#5B21B6', bg: 'linear-gradient(135deg, #DDD6FE, #C4B5FD)' },
  { label: 'Posts This Month', value: '12', delta: '3 drafts', icon: FileText, color: '#9D174D', bg: 'linear-gradient(135deg, #F9A8D4, #F472B6)' },
  { label: '30-day Growth', value: '+14.2%', delta: 'vs. last month', icon: TrendingUp, color: 'var(--d-success)', bg: 'linear-gradient(135deg, #BBF7D0, #86EFAC)' },
];

export function DashboardHomePage() {
  const max = Math.max(...revenueSeries.map((r) => r.amount));
  return (
    <div>
      <PageHeader
        title={`Good morning, ${currentCreator.name.split(' ')[0]}`}
        subtitle="Here's how your work is landing this month."
        actions={
          <>
            <Link to="/dashboard/content/new" className="d-interactive studio-glow" data-variant="primary"
              style={{ textDecoration: 'none', fontSize: '0.8125rem', padding: '0.5rem 0.875rem' }}>
              <Plus size={14} /> New post
            </Link>
          </>
        }
      />

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {kpis.map((k, i) => (
          <div key={k.label} className="studio-card studio-fade-up" style={{ padding: '1.25rem', animationDelay: `${i * 40}ms` }}>
            <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '0.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <k.icon size={16} style={{ color: k.color }} />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--d-success)', fontWeight: 600, fontFamily: 'system-ui, sans-serif' }}>{k.delta}</span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.125rem' }}>{k.value}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Chart + Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }} className="dashboard-grid">
        <div className="studio-card" style={{ padding: '1.5rem' }}>
          <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '1.25rem' }}>
            <div>
              <h3 className="serif-display" style={{ fontSize: '1.125rem' }}>Revenue trend</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>Last 6 months</p>
            </div>
            <button className="d-interactive" data-variant="ghost" style={{ fontSize: '0.75rem', padding: '0.375rem 0.625rem' }}>
              <Download size={12} /> Export
            </button>
          </div>
          <div className={css('_flex _aife _gap3')} style={{ height: 180 }}>
            {revenueSeries.map((r, i) => {
              const h = (r.amount / max) * 100;
              return (
                <div key={r.month} className={css('_flex _col _aic _gap2')} style={{ flex: 1 }}>
                  <div style={{ width: '100%', height: `${h}%`, background: i === revenueSeries.length - 1 ? 'linear-gradient(180deg, #F97316, #FDBA74)' : 'linear-gradient(180deg, #FDBA74, #FED7AA)', borderRadius: '8px 8px 0 0', transition: 'all 300ms ease', animation: `grow 600ms ease-out ${i * 60}ms both` }} />
                  <span style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>{r.month}</span>
                </div>
              );
            })}
          </div>
          <style>{`@keyframes grow { from { height: 0 !important; } }`}</style>
        </div>

        <div className="studio-card" style={{ padding: '1.5rem' }}>
          <h3 className="serif-display" style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Recent activity</h3>
          <div className={css('_flex _col _gap3')}>
            {activity.slice(0, 5).map((a) => (
              <div key={a.id} className={css('_flex _aifs _gap3')}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.color === 'patron' ? '#F472B6' : a.color === 'super' ? '#C4B5FD' : '#FDBA74', marginTop: 6, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.8125rem', fontFamily: 'system-ui, sans-serif', lineHeight: 1.4 }}>{a.text}</p>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)', fontFamily: 'system-ui, sans-serif' }}>{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="studio-card" style={{ padding: '1.5rem' }}>
        <h3 className="serif-display" style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Quick actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
          {[
            { label: 'Publish new post', href: '/dashboard/content/new', icon: Plus },
            { label: 'Create a tier', href: '/dashboard/tiers', icon: Zap },
            { label: 'Message subscribers', href: '/dashboard/subscribers', icon: Users },
            { label: 'View earnings', href: '/dashboard/earnings', icon: DollarSign },
          ].map((a) => (
            <Link key={a.href} to={a.href} className="d-interactive" data-variant="ghost"
              style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', textDecoration: 'none', fontFamily: 'system-ui, sans-serif', justifyContent: 'flex-start' }}>
              <a.icon size={14} />{a.label}
            </Link>
          ))}
        </div>
      </div>

      <style>{`@media (max-width: 900px) { .dashboard-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
