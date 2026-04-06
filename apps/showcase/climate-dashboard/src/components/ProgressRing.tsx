import { useAnimatedValue } from '@/hooks/useAnimatedValue';

interface ProgressRingProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  status: 'on-track' | 'at-risk' | 'behind';
}

const statusColors: Record<string, string> = {
  'on-track': 'var(--d-success)',
  'at-risk': 'var(--d-warning)',
  'behind': 'var(--d-error)',
};

export function ProgressRing({ value, max, size = 120, strokeWidth = 10, label, status }: ProgressRingProps) {
  const percentage = max > 0 ? Math.min(((max - value) / max) * 100, 100) : 0;
  const animated = useAnimatedValue(percentage);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animated / 100) * circumference;
  const color = statusColors[status];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--d-border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.3s ease' }}
        />
      </svg>
      <div style={{ position: 'relative', marginTop: -size - 8, height: size, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--d-text)' }}>{Math.round(animated)}%</span>
      </div>
      <div style={{ textAlign: 'center', marginTop: '0.25rem' }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--d-text)' }}>{label}</div>
        <span className="d-annotation" data-status={status === 'on-track' ? 'success' : status === 'at-risk' ? 'warning' : 'error'} style={{ marginTop: '0.25rem' }}>
          {status.replace('-', ' ')}
        </span>
      </div>
    </div>
  );
}
