interface Props {
  components?: string[];
}

export function ComponentsCard({ components }: Props) {
  if (!components || components.length === 0) return null;

  return (
    <div
      className="lum-bento-card flex flex-col gap-3"
      role="region"
      aria-label="Components"
    >
      <h3 className="d-label accent-left-border">
        Components
        <span className="d-annotation ml-2">{components.length}</span>
      </h3>
      <div className="flex flex-col gap-1.5">
        {components.map((component) => (
          <div key={component} className="flex items-center gap-2 text-sm">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--lum-type-accent, var(--d-accent))"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            </svg>
            <span className="text-d-text">{component}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
