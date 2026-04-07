import { BentoCard } from './bento-card';

interface ComponentsCardProps {
  components?: string[];
}

export function ComponentsCard({ components }: ComponentsCardProps) {
  if (!components || components.length === 0) return null;

  return (
    <BentoCard span={1} label="Components">
      <div className="flex items-center justify-between mb-3">
        <p className="d-label">Components</p>
        <span className="d-annotation">{components.length}</span>
      </div>
      <div className="flex flex-col gap-2">
        {components.map((c) => (
          <div key={c} className="flex items-center gap-2">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--d-text-muted)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
            </svg>
            <span className="text-sm text-d-text">{c}</span>
          </div>
        ))}
      </div>
    </BentoCard>
  );
}
