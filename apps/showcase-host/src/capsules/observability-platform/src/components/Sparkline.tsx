interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: boolean;
}

export function Sparkline({ data, width = 80, height = 22, color = 'var(--d-primary)', fill = true }: SparklineProps) {
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1 || 1);
  const points = data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const path = 'M' + points.join(' L');
  const area = `${path} L${(data.length - 1) * step},${height} L0,${height} Z`;
  return (
    <svg className="fin-sparkline" width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="sparkline">
      {fill && <path d={area} fill={color} opacity={0.15} />}
      <path d={path} fill="none" stroke={color} strokeWidth={1.25} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
