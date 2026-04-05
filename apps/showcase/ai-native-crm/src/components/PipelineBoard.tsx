import { useState } from 'react';
import { pipelineStages, type Deal, type DealStage } from '@/data/mock';
import { DealCard } from './DealCard';

interface Props {
  deals: Deal[];
  onMove?: (dealId: string, newStage: DealStage) => void;
}

export function PipelineBoard({ deals, onMove }: Props) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<DealStage | null>(null);
  const [localDeals, setLocalDeals] = useState(deals);

  function handleDrop(stage: DealStage) {
    if (!draggingId) return;
    setLocalDeals(ds => ds.map(d => (d.id === draggingId ? { ...d, stage } : d)));
    onMove?.(draggingId, stage);
    setDraggingId(null);
    setOverStage(null);
  }

  return (
    <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
      {pipelineStages.map(stage => {
        const stageDeals = localDeals.filter(d => d.stage === stage.key);
        const totalValue = stageDeals.reduce((s, d) => s + d.value, 0);
        return (
          <div
            key={stage.key}
            className="crm-pipeline-column"
            data-drag-over={overStage === stage.key ? 'true' : undefined}
            onDragOver={(e) => { e.preventDefault(); setOverStage(stage.key); }}
            onDragLeave={() => setOverStage(null)}
            onDrop={() => handleDrop(stage.key)}
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.25rem 0.25rem 0.625rem',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: stage.color, boxShadow: `0 0 8px ${stage.color}80` }} />
                <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stage.label}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', fontFamily: 'var(--d-font-mono)' }}>{stageDeals.length}</span>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)', fontFamily: 'var(--d-font-mono)' }}>
                ${(totalValue / 1000).toFixed(0)}k
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minHeight: 60 }}>
              {stageDeals.map(d => (
                <DealCard
                  key={d.id}
                  deal={d}
                  dragging={draggingId === d.id}
                  onDragStart={(id) => setDraggingId(id)}
                  onDragEnd={() => { setDraggingId(null); setOverStage(null); }}
                />
              ))}
              {stageDeals.length === 0 && (
                <div style={{ fontSize: '0.72rem', color: 'var(--d-text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                  No deals
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
