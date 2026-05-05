import { useEffect, useMemo, useState } from 'react';
import { PageHeader, SectionHeader } from '../../components/PageHeader';
import { StatsOverview } from '../../components/StatsOverview';
import { confidenceStats, confidenceVectors } from '../../data/mock';

const CATEGORY_COLORS = {
  action: 'var(--d-accent)',
  tool: 'var(--d-secondary)',
  decision: 'var(--d-success)',
} as const;

export function ConfidenceExplorer() {
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null);
  const [visibleVectors, setVisibleVectors] = useState<typeof confidenceVectors>([]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setVisibleVectors(confidenceVectors), 100);
    return () => window.clearTimeout(timeout);
  }, []);

  const rankedVectors = useMemo(
    () => [...confidenceVectors].sort((a, b) => b.confidence - a.confidence),
    [],
  );

  const cx = 180;
  const cy = 180;
  const maxRadius = 148;

  function intentSlug(label: string) {
    return label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }

  return (
    <div className="page-stack">
      <PageHeader
        label="Confidence explorer"
        title="Intent confidence distribution"
        description="The radar stays a focused exploration surface. The ranked list carries the detailed readout while the visualization stays responsible for shape and direction."
      />

      <div className="page-stack">
        <SectionHeader
          label="Confidence distribution"
          title="Radial confidence field"
          description="The center is the active query, vectors carry direction and confidence, and the action edge stays secondary until intent is strong enough to execute."
        />

        <div className="intent-layout">
          <article className="d-surface carbon-card intent-panel">
            <svg className="intent-radar" viewBox="0 0 360 360" role="img" aria-label="Intent confidence radar">
              {[0.25, 0.5, 0.75, 1].map((scale) => (
                <circle
                  key={scale}
                  cx={cx}
                  cy={cy}
                  r={maxRadius * scale}
                  fill="none"
                  stroke="var(--d-border)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.3"
                />
              ))}

              {visibleVectors.map((vector) => {
                const radians = (vector.angle * Math.PI) / 180;
                const radius = (vector.confidence / 100) * maxRadius;
                const x = cx + Math.cos(radians) * radius;
                const y = cy + Math.sin(radians) * radius;
                const color = CATEGORY_COLORS[vector.category];
                const selected = selectedIntent === vector.label;

                return (
                  <g key={vector.label} className="intent-radar__vector" onClick={() => setSelectedIntent(selected ? null : vector.label)}>
                    <line
                      x1={cx}
                      y1={cy}
                      x2={x}
                      y2={y}
                      stroke={color}
                      strokeWidth={selected ? 2.5 : 1.5}
                      opacity={selected ? 1 : 0.65}
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r={selected ? 6 : 4}
                      fill={color}
                    />
                    <text
                      x={cx + Math.cos(radians) * (maxRadius + 18)}
                      y={cy + Math.sin(radians) * (maxRadius + 18)}
                      fill={selected ? 'var(--d-text)' : 'var(--d-text-muted)'}
                      fontSize="10"
                      fontFamily="var(--d-font-mono)"
                      textAnchor={vector.angle > 90 && vector.angle < 270 ? 'end' : 'start'}
                      dominantBaseline="middle"
                    >
                      {vector.label}
                    </text>
                  </g>
                );
              })}

              <circle cx={cx} cy={cy} r="8" fill="var(--d-accent)" opacity="0.85" />
              <circle cx={cx} cy={cy} r="24" fill="none" stroke="color-mix(in srgb, var(--d-accent) 20%, transparent)" strokeWidth="1.5" />
            </svg>
          </article>

          <div className="intent-list">
            {rankedVectors.map((vector) => (
              <button
                key={vector.label}
                type="button"
                className="d-surface carbon-card intent-list-item"
                data-selected={selectedIntent === vector.label}
                data-category={vector.category}
                aria-pressed={selectedIntent === vector.label}
                onClick={() => setSelectedIntent(selectedIntent === vector.label ? null : vector.label)}
              >
                <div className="intent-list-item__head">
                  <div className="intent-list-item__meta">
                    <strong>{vector.label}</strong>
                    <span className="d-annotation" data-status={vector.category === 'decision' ? 'success' : vector.category === 'tool' ? 'info' : 'warning'}>
                      {vector.category}
                    </span>
                  </div>
                  <strong className="mono-data">{vector.confidence}%</strong>
                </div>
                <div className="intent-list-item__bar">
                  <span className={`intent-list-item__bar-fill--${intentSlug(vector.label)}`} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="page-stack">
        <SectionHeader label="Metric breakdown" title="Supporting telemetry" description="The stat row stays compact and subordinate so the explorer remains about interpretation rather than chrome." />
        <StatsOverview stats={confidenceStats} />
      </div>
    </div>
  );
}
