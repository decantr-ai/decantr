import { PageHeader } from '@/components/PageHeader';
import { deals, pipelineSummary } from '@/data/mock';

const stageOrder = ['sourcing', 'due-diligence', 'negotiation', 'closing', 'closed', 'passed'] as const;
const stageLabels: Record<string, string> = {
  'sourcing': 'Sourcing',
  'due-diligence': 'Due Diligence',
  'negotiation': 'Negotiation',
  'closing': 'Closing',
  'closed': 'Closed',
  'passed': 'Passed',
};
const stageColors: Record<string, string> = {
  'sourcing': 'var(--d-info)',
  'due-diligence': 'var(--d-warning)',
  'negotiation': 'var(--d-primary)',
  'closing': 'var(--d-success)',
  'closed': 'var(--d-text-muted)',
  'passed': 'var(--d-error)',
};

export function PipelinePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader title="Deal Pipeline" description="Visual overview of all active and historical deals." />

      {/* Summary bar */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {pipelineSummary.map(s => (
          <div key={s.stage} className="dr-card" style={{ padding: '1rem', flex: '1 1 180px', minWidth: 150 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
              <span style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.stage}</span>
            </div>
            <div className="serif-display" style={{ fontSize: '1.25rem', fontWeight: 600 }}>{s.count} deals</div>
            <div className="mono-data" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{s.value} total</div>
          </div>
        ))}
      </div>

      {/* Pipeline columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {stageOrder.filter(s => deals.some(d => d.stage === s)).map(stage => (
          <div key={stage}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: stageColors[stage] }} />
              <span className="d-label">{stageLabels[stage]}</span>
              <span className="d-annotation" style={{ marginLeft: 'auto' }}>{deals.filter(d => d.stage === stage).length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {deals.filter(d => d.stage === stage).map(deal => (
                <div key={deal.id} className="dr-card" data-interactive style={{ padding: '1rem', cursor: 'pointer' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, fontFamily: 'var(--d-font-display)', marginBottom: '0.25rem' }}>{deal.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--d-text-muted)', marginBottom: '0.5rem' }}>{deal.company}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                    <span className="mono-data" style={{ color: 'var(--d-primary)' }}>{deal.targetSize}</span>
                    <span style={{ color: 'var(--d-text-muted)' }}>{deal.multiple}</span>
                  </div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--d-text-muted)', marginTop: '0.5rem' }}>
                    {deal.lead} · {deal.lastActivity}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
