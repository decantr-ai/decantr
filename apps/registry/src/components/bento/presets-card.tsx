import { BentoCard } from './bento-card';

interface PresetsCardProps {
  presets?: Record<string, { description?: string }>;
  defaultPreset?: string;
}

export function PresetsCard({ presets, defaultPreset }: PresetsCardProps) {
  if (!presets || Object.keys(presets).length === 0) return null;

  return (
    <BentoCard span={1} label="Presets">
      <p className="d-label mb-3">Presets</p>
      <div className="flex flex-wrap gap-2">
        {Object.entries(presets).map(([name, preset]) => (
          <span
            key={name}
            className={`d-annotation ${name === defaultPreset ? 'preset-active' : ''}`}
            title={preset.description || undefined}
          >
            {name}
            {name === defaultPreset && (
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-1"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </span>
        ))}
      </div>
    </BentoCard>
  );
}
