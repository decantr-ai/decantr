interface Props {
  visualBrief?: string;
}

export function VisualBriefCard({ visualBrief }: Props) {
  if (!visualBrief) return null;

  // Highlight first sentence in accent color
  const firstPeriod = visualBrief.indexOf('.');
  const firstSentence = firstPeriod > 0 ? visualBrief.slice(0, firstPeriod + 1) : '';
  const rest = firstPeriod > 0 ? visualBrief.slice(firstPeriod + 1) : visualBrief;

  return (
    <div
      className="lum-bento-card col-span-2 flex flex-col gap-3"
      role="region"
      aria-label="Visual brief"
    >
      <h3 className="d-label accent-left-border">Visual Brief</h3>
      <blockquote className="lum-quote">
        {firstSentence && (
          <span className="accent-type-text">{firstSentence}</span>
        )}
        {rest}
      </blockquote>
    </div>
  );
}
