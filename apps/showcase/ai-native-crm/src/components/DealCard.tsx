import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import type { Deal } from '@/data/mock';

interface Props {
  deal: Deal;
  onDragStart?: (id: string) => void;
  onDragEnd?: () => void;
  dragging?: boolean;
}

export function DealCard({ deal, onDragStart, onDragEnd, dragging }: Props) {
  return (
    <Link
      to={`/deals/${deal.id}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', deal.id);
        e.dataTransfer.effectAllowed = 'move';
        onDragStart?.(deal.id);
      }}
      onDragEnd={onDragEnd}
      className="crm-pipeline-card"
      data-dragging={dragging ? 'true' : undefined}
      style={{ textDecoration: 'none', color: 'var(--d-text)' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {deal.name}
        </span>
      </div>
      <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>{deal.company}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.125rem' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 700, fontFamily: 'var(--d-font-mono)', color: 'var(--d-accent)' }}>
          ${(deal.value / 1000).toFixed(0)}k
        </span>
        <span style={{ fontSize: '0.65rem', color: 'var(--d-text-muted)', fontFamily: 'var(--d-font-mono)' }}>
          {deal.probability}%
        </span>
      </div>
      <div className="crm-prob-track">
        <div className="crm-prob-fill" style={{ width: `${deal.probability}%` }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.65rem', color: 'var(--d-text-muted)', marginTop: '0.125rem' }}>
        <Sparkles size={9} style={{ color: 'var(--d-accent)', flexShrink: 0 }} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{deal.aiInsight.split('.')[0]}</span>
      </div>
    </Link>
  );
}
