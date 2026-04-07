import { BentoCard } from './bento-card';

interface TagsCardProps {
  tags?: string[];
}

export function TagsCard({ tags }: TagsCardProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <BentoCard span={1} label="Tags">
      <p className="d-label mb-3">Tags</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className="d-annotation">
            {tag}
          </span>
        ))}
      </div>
    </BentoCard>
  );
}
