interface Props {
  presets?: Record<string, { description?: string }>;
  defaultPreset?: string;
}

export function PresetsCard({ presets, defaultPreset }: Props) {
  if (!presets || Object.keys(presets).length === 0) return null;

  return (
    <div
      className="lum-bento-card flex flex-col gap-3"
      role="region"
      aria-label="Presets"
    >
      <h3 className="d-label accent-left-border">Presets</h3>
      <div className="flex flex-wrap gap-2">
        {Object.entries(presets).map(([name, preset]) => (
          <span
            key={name}
            className={`d-annotation ${name === defaultPreset ? 'preset-active' : ''}`}
            title={preset.description || name}
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
