import { useNavigate } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { FilterBar } from '@/components/FilterBar';
import { ActivityFeed } from '@/components/ActivityFeed';
import { cloudApps, activityFeed } from '@/data/mock';

export function AppsPage() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Apps</h1>
        <button className="lp-button-primary" style={{ padding: '0.375rem 1rem', fontSize: '0.875rem' }}>
          Create App
        </button>
      </div>

      <FilterBar
        placeholder="Search apps..."
        filters={[
          { label: 'Status', options: [{ label: 'Healthy', value: 'healthy' }, { label: 'Degraded', value: 'degraded' }, { label: 'Deploying', value: 'deploying' }] },
          { label: 'Framework', options: [{ label: 'Next.js', value: 'nextjs' }, { label: 'Vite', value: 'vite' }, { label: 'Astro', value: 'astro' }] },
        ]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--d-content-gap)' }}>
        {/* App Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--d-content-gap)' }}>
          {cloudApps.map(app => (
            <div
              key={app.id}
              className="lp-card-elevated"
              style={{ padding: 'var(--d-surface-p)', cursor: 'pointer' }}
              onClick={() => navigate(`/apps/${app.id}`)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="lp-status-dot" data-status={app.status} />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{app.name}</span>
                </div>
                <a
                  href={`https://${app.url}`}
                  onClick={e => e.stopPropagation()}
                  style={{ color: 'var(--d-text-muted)' }}
                  target="_blank"
                  rel="noopener"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span className="d-annotation">{app.framework}</span>
                <span className="d-annotation">{app.region}</span>
                <span className="d-annotation">{app.branch}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
                <span className="mono-data">{(app.requests24h / 1000).toFixed(0)}K req/24h</span>
                <span>Deployed {app.lastDeploy}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Activity Sidebar */}
        <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
          <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '0.75rem' }}>
            Recent Activity
          </div>
          <ActivityFeed events={activityFeed.slice(0, 6)} />
        </div>
      </div>
    </div>
  );
}
