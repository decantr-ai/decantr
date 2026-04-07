interface Props {
  features?: string[];
}

export function FeaturesCard({ features }: Props) {
  if (!features || features.length === 0) return null;

  return (
    <div
      className="lum-bento-card flex flex-col gap-3"
      role="region"
      aria-label="Features"
    >
      <h3 className="d-label accent-left-border">
        Features
        <span className="d-annotation ml-2">{features.length}</span>
      </h3>
      <div className="flex flex-wrap gap-2">
        {features.map((feature) => (
          <span
            key={feature}
            className="d-annotation accent-left-border"
          >
            {feature}
          </span>
        ))}
      </div>
    </div>
  );
}
