interface Props {
  modes?: string[];
  shapes?: string[];
}

export function ModesShapesCard({ modes, shapes }: Props) {
  if ((!modes || modes.length === 0) && (!shapes || shapes.length === 0)) return null;

  return (
    <div
      className="lum-bento-card flex flex-col gap-4"
      role="region"
      aria-label="Modes and shapes"
    >
      {modes && modes.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="d-label accent-left-border">Modes</h3>
          <div className="flex flex-wrap gap-2">
            {modes.map((mode) => (
              <span key={mode} className="d-annotation">
                {mode}
              </span>
            ))}
          </div>
        </div>
      )}

      {shapes && shapes.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="d-label accent-left-border">Shapes</h3>
          <div className="flex flex-wrap gap-2">
            {shapes.map((shape) => (
              <div key={shape} className="flex items-center gap-2">
                <span className="shape-preview" data-shape={shape} />
                <span className="d-annotation">{shape}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
