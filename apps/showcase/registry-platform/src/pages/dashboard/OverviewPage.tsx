import { css } from '@decantr/css';
import { Activity } from 'lucide-react';
import { KPIGrid } from '@/components/KPIGrid';
import { ReputationBadge } from '@/components/ReputationBadge';
import { ActivityFeed } from '@/components/ActivityFeed';
import { DASHBOARD_KPIS, ACTIVITY_EVENTS } from '@/data/mock';

export function OverviewPage() {
  return (
    <div className={css('_flex _col _gap6')}>
      <h3 className={css('_textlg _fontsemi')}>Dashboard</h3>

      {/* Overview section */}
      <section className="d-section" data-density="compact">
        <span
          className={css('_db _mb4') + ' d-label'}
          style={{ paddingLeft: '0.75rem', borderLeft: '2px solid var(--d-accent)' }}
        >
          Overview
        </span>

        <KPIGrid kpis={DASHBOARD_KPIS} />
      </section>

      {/* Reputation */}
      <section className="d-section" data-density="compact">
        <div className={css('_flex _aic _gap4')}>
          <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>
            Your Reputation
          </span>
          <ReputationBadge score={142} level="Trusted" />
        </div>
      </section>

      {/* Recent Activity */}
      <section className="d-section" data-density="compact">
        <span
          className={css('_db _mb4') + ' d-label'}
          style={{ paddingLeft: '0.75rem', borderLeft: '2px solid var(--d-accent)' }}
        >
          Recent Activity
        </span>

        {ACTIVITY_EVENTS.length > 0 ? (
          <ActivityFeed events={ACTIVITY_EVENTS.slice(0, 5)} />
        ) : (
          <div className={css('_flex _col _aic _jcc _gap3')} style={{ padding: '3rem 0' }}>
            <Activity size={48} style={{ color: 'var(--d-text-muted)', opacity: 0.5 }} />
            <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>
              No recent activity yet.
            </p>
            <button className="d-interactive" data-variant="primary" style={{ fontSize: '0.875rem' }}>
              Browse Registry
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
