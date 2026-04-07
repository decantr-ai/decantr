interface ThemeRef {
  id?: string;
  mode?: string;
  shape?: string;
  seed?: Record<string, string>;
}

interface Props {
  theme?: ThemeRef;
}

export function ThemePreviewCard({ theme }: Props) {
  if (!theme) return null;

  const seedColors = theme.seed ? Object.entries(theme.seed).slice(0, 5) : [];

  return (
    <div
      className="lum-bento-card flex flex-col gap-3"
      role="region"
      aria-label="Theme preview"
    >
      <h3 className="d-label accent-left-border">Theme</h3>
      <span className="text-sm font-medium text-d-text">{theme.id || 'Unknown'}</span>

      {seedColors.length > 0 && (
        <div className="lum-swatch-strip">
          {seedColors.map(([name, color]) => (
            <span
              key={name}
              className="lum-swatch palette-swatch-anim"
              title={`${name}: ${color}`}
              data-swatch-bg={color}
            />
          ))}
        </div>
      )}

      <div className="flex gap-2">
        {theme.mode && (
          <span className="d-annotation">{theme.mode}</span>
        )}
        {theme.shape && (
          <>
            <span className="d-annotation">{theme.shape}</span>
            <span className="shape-preview" data-shape={theme.shape} />
          </>
        )}
      </div>

      {/* Dynamic swatch background colors */}
      {seedColors.length > 0 && (
        <style>{`
          ${seedColors.map(
            ([, color]) =>
              `.lum-swatch[data-swatch-bg="${color}"] { background-color: ${color}; }`
          ).join('\n')}
        `}</style>
      )}
    </div>
  );
}
