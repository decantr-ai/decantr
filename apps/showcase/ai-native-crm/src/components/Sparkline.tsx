export function Sparkline({ data, height = 28 }: { data: number[]; height?: number }) {
  const max = Math.max(...data, 1);
  return (
    <div className="crm-sparkline" style={{ height }}>
      {data.map((v, i) => (
        <div key={i} className="crm-sparkline-bar" style={{ height: `${(v / max) * 100}%` }} />
      ))}
    </div>
  );
}
