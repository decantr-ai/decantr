import { FilterBar } from '@/components/FilterBar';
import { ActivityFeed } from '@/components/ActivityFeed';
import { activityFeed } from '@/data/mock';

export function ActivityPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)' }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Activity</h1>

      <FilterBar
        placeholder="Search activity..."
        filters={[
          { label: 'Type', options: [
            { label: 'Deploy', value: 'deploy' },
            { label: 'Config', value: 'config' },
            { label: 'Team', value: 'team' },
            { label: 'Incident', value: 'incident' },
            { label: 'Security', value: 'security' },
          ]},
        ]}
      />

      <ActivityFeed events={activityFeed} />
    </div>
  );
}
