interface SparklineProps {
  data: number[];
}

export function Sparkline({ data }: SparklineProps) {
  const max = Math.max(...data);
  return (
    <div className="sd-sparkline">
      {data.map((v, i) => (
        <div
          key={i}
          className="sd-sparkline-bar"
          style={{ height: `${(v / max) * 100}%` }}
        />
      ))}
    </div>
  );
}
