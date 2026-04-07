interface Props {
  slots?: Record<string, string>;
}

export function SlotsCard({ slots }: Props) {
  if (!slots || Object.keys(slots).length === 0) return null;

  return (
    <div
      className="lum-bento-card col-span-2 flex flex-col gap-3"
      role="region"
      aria-label="Layout slots"
    >
      <h3 className="d-label accent-left-border">
        Slots
        <span className="d-annotation ml-2">{Object.keys(slots).length}</span>
      </h3>
      <div className="flex flex-col divide-y divide-d-border">
        {Object.entries(slots).map(([name, description]) => (
          <div key={name} className="flex flex-col gap-1 py-2.5 first:pt-0 last:pb-0">
            <span className="text-sm font-mono font-medium accent-type-text">
              {name}
            </span>
            <span className="text-xs text-d-muted">
              {description}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
