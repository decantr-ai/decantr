interface DecoratorDef {
  description?: string;
  intent?: string;
}

interface Props {
  decorators?: Record<string, DecoratorDef>;
}

export function DecoratorsCard({ decorators }: Props) {
  if (!decorators || Object.keys(decorators).length === 0) return null;

  const entries = Object.entries(decorators);

  return (
    <div
      className="lum-bento-card flex flex-col gap-3"
      role="region"
      aria-label="Decorator classes"
    >
      <h3 className="d-label accent-left-border">
        Decorators
        <span className="d-annotation ml-2">{entries.length}</span>
      </h3>
      <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
        {entries.map(([name, def]) => (
          <div key={name} className="flex flex-col gap-0.5">
            <span className="text-xs font-mono accent-type-text">.{name}</span>
            <span className="text-xs text-d-muted line-clamp-2">
              {def.description || def.intent || ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
