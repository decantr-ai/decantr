interface Props {
  palette?: Record<string, string>;
  seed?: Record<string, string>;
}

interface ColorGroup {
  label: string;
  colors: { name: string; value: string }[];
}

function groupColors(
  palette: Record<string, string>,
  seed: Record<string, string>
): ColorGroup[] {
  const merged = { ...seed, ...palette };
  const groups: ColorGroup[] = [];

  const brand: { name: string; value: string }[] = [];
  const surfaces: { name: string; value: string }[] = [];
  const text: { name: string; value: string }[] = [];
  const status: { name: string; value: string }[] = [];
  const other: { name: string; value: string }[] = [];

  for (const [name, value] of Object.entries(merged)) {
    const lower = name.toLowerCase();
    if (['primary', 'accent', 'secondary'].some((k) => lower.includes(k))) {
      brand.push({ name, value });
    } else if (['bg', 'surface'].some((k) => lower.includes(k))) {
      surfaces.push({ name, value });
    } else if (['text', 'muted'].some((k) => lower.includes(k))) {
      text.push({ name, value });
    } else if (['success', 'error', 'warning', 'info'].some((k) => lower.includes(k))) {
      status.push({ name, value });
    } else {
      other.push({ name, value });
    }
  }

  if (brand.length) groups.push({ label: 'Brand', colors: brand });
  if (surfaces.length) groups.push({ label: 'Surfaces', colors: surfaces });
  if (text.length) groups.push({ label: 'Text', colors: text });
  if (status.length) groups.push({ label: 'Status', colors: status });
  if (other.length) groups.push({ label: 'Other', colors: other });

  return groups;
}

export function PaletteCard({ palette, seed }: Props) {
  if ((!palette || Object.keys(palette).length === 0) && (!seed || Object.keys(seed).length === 0)) {
    return null;
  }

  const groups = groupColors(palette || {}, seed || {});

  return (
    <div
      className="lum-bento-card col-span-2 flex flex-col gap-4"
      role="region"
      aria-label="Color palette"
    >
      <h3 className="d-label accent-left-border">Palette</h3>
      {groups.map((group) => (
        <div key={group.label} className="flex flex-col gap-2">
          <span className="text-xs font-medium text-d-muted">{group.label}</span>
          <div className="flex flex-wrap gap-3">
            {group.colors.map(({ name, value }, i) => (
              <div
                key={name}
                className="flex flex-col items-center gap-1"
              >
                <span
                  className="palette-swatch palette-swatch-anim"
                  title={`${name}: ${value}`}
                  data-swatch-bg={value}
                >
                  <span className="sr-only">{name}: {value}</span>
                </span>
                <span className="text-[0.625rem] font-mono text-d-muted text-center max-w-[48px] truncate">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Inline style tag for dynamic swatch backgrounds */}
      <style>{`
        ${groups.flatMap((g) =>
          g.colors.map(
            ({ name, value }) =>
              `.palette-swatch[data-swatch-bg="${value}"] { background-color: ${value}; }`
          )
        ).join('\n')}
      `}</style>
    </div>
  );
}
