import { css } from '@decantr/css';
import { Star } from 'lucide-react';

const LEVEL_STYLES: Record<string, { bg: string; color: string }> = {
  Newcomer: {
    bg: 'var(--d-surface)',
    color: 'var(--d-text-muted)',
  },
  Contributor: {
    bg: 'color-mix(in srgb, var(--d-info) 15%, transparent)',
    color: 'var(--d-info)',
  },
  Trusted: {
    bg: 'color-mix(in srgb, var(--d-warning) 15%, transparent)',
    color: 'var(--d-warning)',
  },
  Expert: {
    bg: 'color-mix(in srgb, var(--d-success) 15%, transparent)',
    color: 'var(--d-success)',
  },
};

interface Props {
  score: number;
  level: string;
}

export function ReputationBadge({ score, level }: Props) {
  const style = LEVEL_STYLES[level] || LEVEL_STYLES.Newcomer;

  return (
    <span
      className={css('_flex _aic _gap1')}
      style={{
        display: 'inline-flex',
        padding: '0.125rem 0.5rem',
        borderRadius: 'var(--d-radius-full)',
        background: style.bg,
        fontSize: '0.75rem',
        whiteSpace: 'nowrap',
      }}
    >
      <Star size={10} style={{ color: style.color }} />
      <span style={{ fontWeight: 600, color: style.color }}>{score}</span>
      <span style={{ color: 'var(--d-text-muted)' }}>{level}</span>
    </span>
  );
}
