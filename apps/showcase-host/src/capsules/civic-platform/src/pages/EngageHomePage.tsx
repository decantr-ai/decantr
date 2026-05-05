import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { TrendingUp, TrendingDown, FileText, Vote, MessageSquare, Wrench, Calendar } from 'lucide-react';
import { civicMetrics, petitions, activityFeed } from '@/data/mock';

const trendIcons = { up: TrendingUp, down: TrendingDown };
const activityIcons = { petition: FileText, vote: Vote, meeting: Calendar, request: Wrench };

export function EngageHomePage() {
  return (
    <div className={css('_flex _col _gap6')}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Engagement Hub</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>Your civic participation dashboard</p>
      </div>

      {/* Civic Metrics */}
      <div className="d-section" data-density="compact">
        <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}>
          CIVIC METRICS
        </div>
        <div className={css('_grid')} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {civicMetrics.map((m, i) => {
            const TrendIcon = trendIcons[m.trend];
            return (
              <div
                key={m.label}
                className="d-surface gov-card"
                style={{
                  padding: '1.25rem',
                  opacity: 0,
                  animation: `decantr-entrance 0.3s ease forwards`,
                  animationDelay: `${i * 60}ms`,
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', marginBottom: '0.375rem' }}>{m.label}</div>
                <div className={css('_flex _aic _gap2')}>
                  <span style={{ fontSize: '1.75rem', fontWeight: 700 }}>{m.value.toLocaleString()}</span>
                  <span className="d-annotation" data-status={m.trend === 'up' ? 'success' : 'warning'}>
                    <TrendIcon size={12} /> {m.change}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="d-section" data-density="compact">
        <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}>
          RECENT ACTIVITY
        </div>
        <div className="d-surface gov-card" style={{ padding: 0 }}>
          {activityFeed.map((item, i) => {
            const Icon = activityIcons[item.type];
            return (
              <div
                key={item.id}
                className={css('_flex _aic _gap3')}
                style={{
                  padding: '0.875rem 1.25rem',
                  borderBottom: i < activityFeed.length - 1 ? '1px solid var(--d-border)' : 'none',
                  opacity: 0,
                  animation: `decantr-entrance 0.3s ease forwards`,
                  animationDelay: `${i * 50}ms`,
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 2,
                  background: 'color-mix(in srgb, var(--d-primary) 10%, transparent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={16} style={{ color: 'var(--d-primary)' }} aria-hidden />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.875rem' }}>{item.text}</div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', flexShrink: 0 }}>{item.time}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Items */}
      <div className="d-section" data-density="compact">
        <div className={css('_flex _jcsb _aic _mb3')}>
          <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}>
            ACTIVE PETITIONS
          </div>
          <Link to="/engage/petitions" className="d-interactive" data-variant="ghost" style={{ fontSize: '0.8125rem', textDecoration: 'none', border: 'none', padding: '0.25rem 0.5rem' }}>
            View All
          </Link>
        </div>
        <div className={css('_grid')} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {petitions.filter(p => p.status === 'active').slice(0, 3).map((p, i) => {
            const pct = Math.min(100, Math.round((p.signatures / p.goal) * 100));
            return (
              <Link
                key={p.id}
                to={`/engage/petitions/${p.id}`}
                className="d-surface gov-card"
                data-interactive
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  padding: '1.25rem',
                  display: 'block',
                  opacity: 0,
                  animation: `decantr-entrance 0.3s ease forwards`,
                  animationDelay: `${i * 80}ms`,
                }}
              >
                <div className={css('_flex _jcsb _aic _mb2')}>
                  <span className="gov-badge" style={{
                    background: 'color-mix(in srgb, var(--d-primary) 10%, transparent)',
                    color: 'var(--d-primary)',
                    fontSize: '0.6875rem',
                    padding: '0.125rem 0.5rem',
                  }}>{p.category}</span>
                  <span className="d-annotation" data-status="success">{p.status}</span>
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{p.title}</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                  {p.description.slice(0, 100)}...
                </p>
                {/* Signature progress */}
                <div style={{ marginBottom: '0.375rem' }}>
                  <div className={css('_flex _jcsb')} style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600 }}>{p.signatures.toLocaleString()} signatures</span>
                    <span style={{ color: 'var(--d-text-muted)' }}>{pct}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--d-surface-raised)', borderRadius: 1, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: 'var(--d-primary)',
                      borderRadius: 1,
                      transition: 'width 0.8s ease',
                    }} />
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>
                    Goal: {p.goal.toLocaleString()}
                  </div>
                </div>
                <div className={css('_flex _gap3')} style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
                  <span className={css('_flex _aic _gap1')}><MessageSquare size={12} /> {p.comments.length}</span>
                  <span className={css('_flex _aic _gap1')}><Vote size={12} /> {p.votes.yes + p.votes.no + p.votes.abstain}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
