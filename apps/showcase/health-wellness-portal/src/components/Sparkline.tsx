interface SparklineProps {
  data: number[];
  label?: string;
}

export function Sparkline({ data, label }: SparklineProps) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  return (
    <div
      className="hw-sparkline"
      role="img"
      aria-label={label ? `${label} trend` : 'Trend sparkline'}
    >
      {data.map((v, i) => {
        const pct = ((v - min) / range) * 100;
        return (
          <div
            key={i}
            className="hw-sparkline-bar"
            style={{ height: `${Math.max(pct, 12)}%` }}
            aria-hidden
          />
        );
      })}
    </div>
  );
}
