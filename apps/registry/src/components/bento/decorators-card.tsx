import { BentoCard } from './bento-card';

interface DecoratorDef {
  description?: string;
}

interface DecoratorsCardProps {
  decorators?: Record<string, DecoratorDef>;
}

export function DecoratorsCard({ decorators }: DecoratorsCardProps) {
  if (!decorators || Object.keys(decorators).length === 0) return null;

  return (
    <BentoCard span={1} label="Decorators">
      <p className="d-label mb-3">Decorators</p>
      <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
        {Object.entries(decorators).map(([name, def]) => (
          <div key={name} className="flex flex-col gap-0.5">
            <span className="text-xs font-mono font-medium accent-type-text">
              .{name}
            </span>
            {def.description && (
              <span className="text-xs text-d-muted line-clamp-2">
                {def.description}
              </span>
            )}
          </div>
        ))}
      </div>
    </BentoCard>
  );
}
