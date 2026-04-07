import { BentoCard } from './bento-card';

interface PersonalityCardProps {
  personality?: string;
}

export function PersonalityCard({ personality }: PersonalityCardProps) {
  if (!personality) return null;

  const span = personality.length > 200 ? 2 : 1;

  /* Highlight the first sentence */
  const dotIdx = personality.indexOf('.');
  const firstSentence = dotIdx > 0 ? personality.slice(0, dotIdx + 1) : '';
  const rest = dotIdx > 0 ? personality.slice(dotIdx + 1) : personality;

  return (
    <BentoCard span={span as 1 | 2} label="Personality">
      <p className="d-label mb-3">Personality</p>
      <div className="lum-quote">
        {firstSentence ? (
          <p>
            <span className="accent-type-text">
              {firstSentence}
            </span>
            {rest}
          </p>
        ) : (
          <p>{personality}</p>
        )}
      </div>
    </BentoCard>
  );
}
