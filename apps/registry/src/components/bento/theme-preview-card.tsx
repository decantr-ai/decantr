import { BentoCard } from './bento-card';

interface ThemeInfo {
  id?: string;
  name?: string;
  mode?: string;
  shape?: string;
  seed?: Record<string, string>;
}

interface ThemePreviewCardProps {
  theme?: ThemeInfo;
}

export function ThemePreviewCard({ theme }: ThemePreviewCardProps) {
  if (!theme) return null;

  const seedColors = theme.seed
    ? Object.values(theme.seed).slice(0, 5)
    : [];

  return (
    <BentoCard span={1} label="Theme">
      <p className="d-label mb-3">Theme</p>
      <p className="text-sm font-medium text-d-text mb-2">
        {theme.name || theme.id || 'Default'}
      </p>

      {seedColors.length > 0 && (
        <div className="lum-swatch-strip mb-3">
          {seedColors.map((color, i) => (
            <span
              key={i}
              className="lum-swatch"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      )}

      <div className="flex gap-2">
        {theme.mode && (
          <span className="d-annotation">{theme.mode}</span>
        )}
        {theme.shape && (
          <span className="d-annotation">{theme.shape}</span>
        )}
      </div>
    </BentoCard>
  );
}
