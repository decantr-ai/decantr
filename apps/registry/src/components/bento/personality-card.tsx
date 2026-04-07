interface Props {
  personality?: string;
}

export function PersonalityCard({ personality }: Props) {
  if (!personality) return null;

  // Highlight first sentence in accent color
  const firstPeriod = personality.indexOf('.');
  const firstSentence = firstPeriod > 0 ? personality.slice(0, firstPeriod + 1) : '';
  const rest = firstPeriod > 0 ? personality.slice(firstPeriod + 1) : personality;

  // Spans 2 columns if text is long (>200 chars)
  const spanClass = personality.length > 200 ? 'col-span-2' : '';

  return (
    <div
      className={`lum-bento-card ${spanClass} flex flex-col gap-3`}
      role="region"
      aria-label="Personality"
    >
      <h3 className="d-label accent-left-border">Personality</h3>
      <blockquote className="lum-quote">
        {firstSentence && (
          <span className="accent-type-text">{firstSentence}</span>
        )}
        {rest}
      </blockquote>
    </div>
  );
}
