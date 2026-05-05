/** Simple SVG bar chart — no dependencies */
export function MiniBarChart({ data, height = 120, barColor = 'var(--d-primary)' }: {
  data: { label: string; value: number }[];
  height?: number;
  barColor?: string;
}) {
  const max = Math.max(...data.map(d => d.value), 1);
  const barW = Math.max(12, Math.min(36, 600 / data.length - 8));
  const chartW = data.length * (barW + 8);

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={chartW} height={height + 24} style={{ display: 'block' }}>
        {data.map((d, i) => {
          const barH = (d.value / max) * height;
          const x = i * (barW + 8) + 4;
          return (
            <g key={d.label}>
              <rect
                x={x} y={height - barH}
                width={barW} height={barH}
                rx={3}
                fill={barColor}
                opacity={0.85}
              >
                <animate attributeName="height" from="0" to={barH} dur="0.6s" fill="freeze" />
                <animate attributeName="y" from={height} to={height - barH} dur="0.6s" fill="freeze" />
              </rect>
              <text x={x + barW / 2} y={height + 14} textAnchor="middle"
                fill="var(--d-text-muted)" fontSize="9" fontFamily="system-ui, sans-serif">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
