import { BentoCard } from './bento-card';

interface SlotsCardProps {
  slots?: Record<string, string>;
}

export function SlotsCard({ slots }: SlotsCardProps) {
  if (!slots || Object.keys(slots).length === 0) return null;

  const entries = Object.entries(slots);

  return (
    <BentoCard span={2} label="Layout slots">
      <p className="d-label mb-3">Slots</p>
      <div className="flex flex-col">
        {entries.map(([name, desc], i) => (
          <div
            key={name}
            className={`flex flex-col gap-1 py-2 ${i < entries.length - 1 ? 'border-b border-d-border' : ''}`}
          >
            <span className="text-sm font-mono font-medium text-d-text">
              {name}
            </span>
            <span className="text-xs text-d-muted">{desc}</span>
          </div>
        ))}
      </div>
    </BentoCard>
  );
}
