export function Sparkline({ data, width = 80, height = 24 }: { data: number[]; width?: number; height?: number }) {
  const max = Math.max(...data, 1);
  return (
    <div className="ea-sparkline" style={{ width, height }}>
      {data.map((v, i) => (
        <div
          key={i}
          className="ea-sparkline-bar"
          style={{ height: `${Math.max((v / max) * 100, 8)}%` }}
        />
      ))}
    </div>
  );
}
