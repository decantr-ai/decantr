import { Plus, Filter } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { PipelineBoard } from '@/components/PipelineBoard';
import { deals, pipelineStages } from '@/data/mock';

export function PipelinePage() {
  const totals = pipelineStages.map(s => ({
    ...s,
    count: deals.filter(d => d.stage === s.key).length,
    value: deals.filter(d => d.stage === s.key).reduce((sum, d) => sum + d.value, 0),
  }));
  const openValue = deals.filter(d => d.stage !== 'won' && d.stage !== 'lost').reduce((s, d) => s + d.value, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%' }}>
      <PageHeader
        title="Pipeline"
        description={`${deals.length} deals · $${(openValue / 1000).toFixed(0)}k in open pipeline · drag cards to move stage`}
        actions={
          <>
            <button className="d-interactive" data-variant="ghost" style={{ padding: '0.4rem 0.875rem', fontSize: '0.8rem' }}>
              <Filter size={14} /> Filter
            </button>
            <button className="crm-button-accent" style={{ padding: '0.4rem 0.875rem', fontSize: '0.8rem' }}>
              <Plus size={14} /> New deal
            </button>
          </>
        }
      />

      {/* Stage bar */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {totals.map(t => (
          <div key={t.key} style={{
            flex: 1,
            padding: '0.625rem 0.75rem',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 'var(--d-radius-sm)',
            borderTop: `2px solid ${t.color}`,
          }}>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--d-text-muted)', fontWeight: 600 }}>{t.label}</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--d-font-mono)', marginTop: '0.25rem' }}>${(t.value / 1000).toFixed(0)}k</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--d-text-muted)', fontFamily: 'var(--d-font-mono)' }}>{t.count} deals</div>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        <PipelineBoard deals={deals} />
      </div>
    </div>
  );
}
