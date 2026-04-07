interface Props {
  tags?: string[];
}

export function TagsCard({ tags }: Props) {
  if (!tags || tags.length === 0) return null;

  return (
    <div
      className="lum-bento-card flex flex-col gap-3"
      role="region"
      aria-label="Tags"
    >
      <h3 className="d-label accent-left-border">Tags</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className="d-annotation">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
