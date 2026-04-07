import { BentoCard } from './bento-card';

interface FeaturesCardProps {
  features?: string[];
}

export function FeaturesCard({ features }: FeaturesCardProps) {
  if (!features || features.length === 0) return null;

  return (
    <BentoCard span={1} label="Features">
      <p className="d-label mb-3">Features</p>
      <div className="flex flex-wrap gap-2">
        {features.map((f) => (
          <span key={f} className="d-annotation">
            {f}
          </span>
        ))}
      </div>
    </BentoCard>
  );
}
