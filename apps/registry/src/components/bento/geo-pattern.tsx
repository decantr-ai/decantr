interface GeoPatternProps {
  type: string;
  dataCount?: number;
  accentColor?: string;
}

function PatternNodes({ count, color }: { count: number; color: string }) {
  const n = Math.min(Math.max(count, 3), 12);
  const nodes: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    const angle = (2 * Math.PI * i) / n;
    const r = 120 + (i % 3) * 30;
    nodes.push({
      x: 200 + r * Math.cos(angle),
      y: 200 + r * Math.sin(angle),
    });
  }
  return (
    <>
      {nodes.map((a, i) =>
        nodes.slice(i + 1).map((b, j) => (
          <line
            key={`${i}-${j}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={color}
            strokeWidth="0.5"
            opacity="0.3"
          />
        ))
      )}
      {nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r="4" fill={color} opacity="0.5" />
      ))}
    </>
  );
}

function ThemeCircles({ count, color }: { count: number; color: string }) {
  const n = Math.min(Math.max(count, 3), 10);
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <circle
          key={i}
          cx="200"
          cy="200"
          r={40 + i * 25}
          fill="none"
          stroke={color}
          strokeWidth="0.5"
          opacity={0.4 - i * 0.03}
        />
      ))}
    </>
  );
}

function BlueprintCircles({ count, color }: { count: number; color: string }) {
  const n = Math.min(Math.max(count, 2), 8);
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const angle = (2 * Math.PI * i) / n;
        const cx = 200 + 60 * Math.cos(angle);
        const cy = 200 + 60 * Math.sin(angle);
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r="80"
            fill="none"
            stroke={color}
            strokeWidth="0.5"
            opacity="0.35"
          />
        );
      })}
    </>
  );
}

function ShellRects({ color }: { color: string }) {
  return (
    <>
      <rect x="60" y="60" width="280" height="280" rx="4" fill="none" stroke={color} strokeWidth="0.5" opacity="0.4" />
      <rect x="70" y="70" width="100" height="260" rx="2" fill="none" stroke={color} strokeWidth="0.5" opacity="0.3" />
      <rect x="180" y="70" width="150" height="40" rx="2" fill="none" stroke={color} strokeWidth="0.5" opacity="0.3" />
      <rect x="180" y="120" width="150" height="210" rx="2" fill="none" stroke={color} strokeWidth="0.5" opacity="0.3" />
    </>
  );
}

function ArchetypeSpokes({ count, color }: { count: number; color: string }) {
  const n = Math.min(Math.max(count, 3), 12);
  return (
    <>
      <circle cx="200" cy="200" r="6" fill={color} opacity="0.5" />
      {Array.from({ length: n }, (_, i) => {
        const angle = (2 * Math.PI * i) / n;
        const x2 = 200 + 140 * Math.cos(angle);
        const y2 = 200 + 140 * Math.sin(angle);
        return (
          <g key={i}>
            <line x1="200" y1="200" x2={x2} y2={y2} stroke={color} strokeWidth="0.5" opacity="0.3" />
            <circle cx={x2} cy={y2} r="3" fill={color} opacity="0.4" />
          </g>
        );
      })}
    </>
  );
}

export function GeoPattern({ type, dataCount = 5, accentColor }: GeoPatternProps) {
  const color = accentColor || '#FDA303';

  return (
    <svg
      className="lum-backdrop-geo"
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {type === 'pattern' && <PatternNodes count={dataCount} color={color} />}
      {type === 'theme' && <ThemeCircles count={dataCount} color={color} />}
      {type === 'blueprint' && <BlueprintCircles count={dataCount} color={color} />}
      {type === 'shell' && <ShellRects color={color} />}
      {type === 'archetype' && <ArchetypeSpokes count={dataCount} color={color} />}
    </svg>
  );
}
