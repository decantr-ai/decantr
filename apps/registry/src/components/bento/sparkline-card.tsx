import { BentoCard } from './bento-card';

const TYPE_ACCENTS: Record<string, string> = {
  pattern: '#F58882',
  theme: '#FDA303',
  blueprint: '#0AF3EB',
  shell: '#00E0AB',
  archetype: '#6500C6',
};

interface SparklineCardProps {
  type: string;
}

export function SparklineCard({ type }: SparklineCardProps) {
  const accent = TYPE_ACCENTS[type] || '#FDA303';

  /* Generate placeholder sine wave points */
  const points: string[] = [];
  const areaPoints: string[] = [];
  const w = 200;
  const h = 50;

  for (let i = 0; i <= w; i += 4) {
    const y = h / 2 + Math.sin((i / w) * Math.PI * 3 + 1) * (h * 0.35);
    points.push(`${i},${y}`);
    areaPoints.push(`${i},${y}`);
  }
  areaPoints.push(`${w},${h}`, `0,${h}`);

  return (
    <BentoCard span={1} label="Install trend">
      <p className="d-label mb-2">30 day trend</p>
      <div className="lum-sparkline">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
          className="w-full h-full"
          aria-label="Install trend sparkline showing placeholder data"
        >
          <polygon
            points={areaPoints.join(' ')}
            fill={accent}
            opacity="0.1"
          />
          <polyline
            points={points.join(' ')}
            fill="none"
            stroke={accent}
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </BentoCard>
  );
}
