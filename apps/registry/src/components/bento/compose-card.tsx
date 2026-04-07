import { BentoCard } from './bento-card';

interface ComposeItem {
  id?: string;
  archetype?: string;
  role?: string;
  description?: string;
}

interface ComposeCardProps {
  compose?: ComposeItem[];
}

export function ComposeCard({ compose }: ComposeCardProps) {
  if (!compose || compose.length === 0) return null;

  return (
    <BentoCard span={2} label="Composition">
      <p className="d-label mb-3">Archetypes</p>
      <div className="flex flex-col gap-3">
        {compose.map((item, i) => (
          <div
            key={item.id || item.archetype || i}
            className="flex items-start gap-3 pb-3 border-b border-d-border last:border-b-0 last:pb-0"
          >
            {item.role && (
              <span
                className="d-annotation role-badge shrink-0 mt-0.5"
                data-role={item.role}
              >
                {item.role}
              </span>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-d-text">
                {item.archetype || item.id || `Archetype ${i + 1}`}
              </p>
              {item.description && (
                <p className="text-xs text-d-muted truncate mt-0.5">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </BentoCard>
  );
}
