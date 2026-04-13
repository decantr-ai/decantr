import { useMemo } from 'react';

interface ReputationBadgeProps {
  score: number;
}

function getLevel(score: number) {
  if (score >= 201) return { label: 'Expert', icon: '\u2605', color: '#FE4474', bg: 'rgba(254, 68, 116, 0.12)' };
  if (score >= 51) return { label: 'Trusted', icon: '\u2713', color: '#FDA303', bg: 'rgba(253, 163, 3, 0.12)' };
  if (score >= 11) return { label: 'Contributor', icon: '\u2605', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)' };
  return { label: 'Newcomer', icon: '\u25CF', color: '#A1A1AA', bg: 'rgba(161, 161, 170, 0.10)' };
}

export default function ReputationBadge({ score }: ReputationBadgeProps) {
  const level = useMemo(() => getLevel(score), [score]);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.1875rem 0.625rem',
        borderRadius: '9999px',
        background: level.bg,
        border: `1px solid ${level.color}25`,
        fontSize: '0.75rem',
        lineHeight: 1,
        whiteSpace: 'nowrap',
        transition: 'background 0.15s ease',
      }}
    >
      <span style={{ color: level.color, fontSize: '0.6875rem' }}>{level.icon}</span>
      <span style={{ fontWeight: 600, color: level.color }}>{score}</span>
      <span style={{ color: 'var(--d-text-muted)', fontWeight: 400 }}>{level.label}</span>
    </span>
  );
}
