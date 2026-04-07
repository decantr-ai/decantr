interface Props {
  type: string;
}

function generateSinePoints(width: number, height: number, points: number): string {
  const coords: string[] = [];
  for (let i = 0; i <= points; i++) {
    const x = (i / points) * width;
    const y = height / 2 + Math.sin((i / points) * Math.PI * 3) * (height * 0.35);
    coords.push(`${x},${y}`);
  }
  return coords.join(' ');
}

export function SparklineCard({ type }: Props) {
  const width = 200;
  const height = 60;
  const points = generateSinePoints(width, height, 40);

  return (
    <div
      className="lum-bento-card flex flex-col gap-2"
      role="region"
      aria-label="Install trend"
    >
      <h3 className="d-label accent-left-border">30 day trend</h3>
      <div className="lum-sparkline">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id={`spark-fill-${type}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--lum-type-accent, var(--d-accent))" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--lum-type-accent, var(--d-accent))" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon
            points={`0,${height} ${points} ${width},${height}`}
            fill={`url(#spark-fill-${type})`}
          />
          <polyline
            points={points}
            fill="none"
            stroke="var(--lum-type-accent, var(--d-accent))"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  );
}
