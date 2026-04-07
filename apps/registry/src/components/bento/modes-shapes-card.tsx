import { BentoCard } from './bento-card';

interface ModesShapesCardProps {
  modes?: string[];
  shapes?: string[];
}

export function ModesShapesCard({ modes, shapes }: ModesShapesCardProps) {
  if ((!modes || modes.length === 0) && (!shapes || shapes.length === 0)) {
    return null;
  }

  return (
    <BentoCard span={1} label="Modes and shapes">
      {modes && modes.length > 0 && (
        <div className="mb-4">
          <p className="d-label mb-2">Modes</p>
          <div className="flex gap-2">
            {modes.map((mode) => (
              <span key={mode} className="d-annotation">
                {mode}
              </span>
            ))}
          </div>
        </div>
      )}

      {shapes && shapes.length > 0 && (
        <div>
          <p className="d-label mb-2">Shapes</p>
          <div className="flex gap-3">
            {shapes.map((shape) => (
              <div key={shape} className="flex flex-col items-center gap-1">
                <div
                  className="shape-preview"
                  data-shape={shape}
                  aria-hidden="true"
                />
                <span className="text-[0.625rem] text-d-muted">{shape}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </BentoCard>
  );
}
