import { BentoCard } from './bento-card';

interface PaletteCardProps {
  palette?: Record<string, string>;
  seed?: Record<string, string>;
}

const ROLE_GROUPS: Record<string, string[]> = {
  Brand: ['primary', 'accent', 'secondary'],
  Surfaces: ['bg', 'surface', 'surface-raised', 'surface_raised'],
  Text: ['text', 'text-muted', 'text_muted'],
  Border: ['border'],
  Status: ['success', 'error', 'warning', 'info'],
};

export function PaletteCard({ palette, seed }: PaletteCardProps) {
  const colors = { ...seed, ...palette };
  if (!colors || Object.keys(colors).length === 0) return null;

  return (
    <BentoCard span={2} label="Color palette">
      <p className="d-label mb-3">Palette</p>
      <div className="flex flex-col gap-4">
        {Object.entries(ROLE_GROUPS).map(([group, keys]) => {
          const groupColors = keys
            .filter((k) => colors[k])
            .map((k) => ({ name: k, value: colors[k] }));
          if (groupColors.length === 0) return null;
          return (
            <div key={group}>
              <p className="text-xs font-medium text-d-muted mb-2">{group}</p>
              <div className="flex flex-wrap gap-3">
                {groupColors.map(({ name, value }) => (
                  <div key={name} className="flex flex-col items-center gap-1">
                    <div
                      className="palette-swatch"
                      style={{ backgroundColor: value }}
                      aria-hidden="true"
                    />
                    <span className="sr-only">{name}: {value}</span>
                    <span className="text-[0.625rem] text-d-muted">{name}</span>
                    <span className="text-[0.625rem] font-mono text-d-muted">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Show remaining colors not in groups */}
        {(() => {
          const grouped = new Set(Object.values(ROLE_GROUPS).flat());
          const remaining = Object.entries(colors).filter(([k]) => !grouped.has(k));
          if (remaining.length === 0) return null;
          return (
            <div>
              <p className="text-xs font-medium text-d-muted mb-2">Other</p>
              <div className="flex flex-wrap gap-3">
                {remaining.map(([name, value]) => (
                  <div key={name} className="flex flex-col items-center gap-1">
                    <div
                      className="palette-swatch"
                      style={{ backgroundColor: value }}
                      aria-hidden="true"
                    />
                    <span className="sr-only">{name}: {value}</span>
                    <span className="text-[0.625rem] text-d-muted">{name}</span>
                    <span className="text-[0.625rem] font-mono text-d-muted">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </BentoCard>
  );
}
