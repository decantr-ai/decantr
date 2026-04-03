import { useEffect, useRef, useState, useCallback } from 'react';
import { css } from '@decantr/css';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { MetricSnapshot } from '../../data/types';

interface NeuralFeedbackLoopProps {
  metric: MetricSnapshot;
  processingState: 'idle' | 'active' | 'complete';
  size?: number;
}

const PARTICLE_COUNT = 6;

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mql.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);
  return reduced;
}

export function NeuralFeedbackLoop({
  metric,
  processingState,
  size = 240,
}: NeuralFeedbackLoopProps) {
  const reducedMotion = useReducedMotion();
  const particlesRef = useRef<SVGCircleElement[]>([]);
  const animFrameRef = useRef<number>(0);
  const angleRef = useRef(0);
  const [hovered, setHovered] = useState(false);

  const radius = size / 2 - 10;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Normalize value for fill (assume percentage if unit is %, otherwise normalize to 100)
  const fillRatio =
    metric.unit === '%'
      ? metric.value / 100
      : Math.min(metric.value / 100, 1);

  const dashOffset = circumference * (1 - fillRatio);

  // Particle animation
  const animateParticles = useCallback(() => {
    if (reducedMotion || processingState === 'complete') return;

    const speed = processingState === 'active' ? 0.02 : 0.005;
    angleRef.current += speed;

    particlesRef.current.forEach((el, i) => {
      if (!el) return;
      const offset = (i / PARTICLE_COUNT) * Math.PI * 2;
      const angle = angleRef.current + offset;
      const x = center + Math.cos(angle) * radius;
      const y = center + Math.sin(angle) * radius;
      el.setAttribute('cx', String(x));
      el.setAttribute('cy', String(y));
    });

    animFrameRef.current = requestAnimationFrame(animateParticles);
  }, [reducedMotion, processingState, center, radius]);

  useEffect(() => {
    if (!reducedMotion && processingState !== 'complete') {
      animFrameRef.current = requestAnimationFrame(animateParticles);
    }
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [animateParticles, reducedMotion, processingState]);

  const trendPositive = metric.trend >= 0;

  // Tooltip interpretation
  const interpretation =
    fillRatio >= 0.8
      ? 'High'
      : fillRatio >= 0.5
        ? 'Moderate'
        : 'Low';

  const trendDescription = trendPositive
    ? `Up ${metric.trend}% from previous`
    : `Down ${Math.abs(metric.trend)}% from previous`;

  return (
    <div
      className="neural-container"
      style={{ width: size, height: size }}
      role="status"
      aria-label={`${metric.label}: ${metric.value}${metric.unit}, ${trendDescription}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setHovered((h) => !h);
        }
        if (e.key === 'Escape') setHovered(false);
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ display: 'block' }}
      >
        {/* Background ring track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--d-border)"
          strokeWidth={4}
          opacity={0.3}
        />

        {/* IntensityRing */}
        <circle
          className="intensity-ring"
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={4}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />

        {/* PulseCore */}
        {!reducedMotion ? (
          <circle
            className="pulse-core"
            data-state={processingState}
            cx={center}
            cy={center}
            r={size * 0.12}
          />
        ) : (
          <circle
            cx={center}
            cy={center}
            r={size * 0.12}
            fill="var(--d-accent)"
            opacity={0.5}
          />
        )}

        {/* FlowTrack particles */}
        {!reducedMotion &&
          processingState !== 'complete' &&
          Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
            const offset = (i / PARTICLE_COUNT) * Math.PI * 2;
            const x = center + Math.cos(offset) * radius;
            const y = center + Math.sin(offset) * radius;
            return (
              <circle
                key={i}
                ref={(el) => {
                  if (el) particlesRef.current[i] = el;
                }}
                className="flow-particle"
                cx={x}
                cy={y}
                r={3}
              />
            );
          })}

        {/* MetricDisplay */}
        <text
          x={center}
          y={center - 8}
          textAnchor="middle"
          dominantBaseline="central"
          className="mono-data"
          style={{
            fill: 'var(--d-text)',
            fontSize: size * 0.14,
            fontWeight: 700,
          }}
        >
          {metric.value}
        </text>
        <text
          x={center}
          y={center + size * 0.08}
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fill: 'var(--d-text-muted)',
            fontSize: size * 0.06,
          }}
        >
          {metric.unit}
        </text>
      </svg>

      {/* Trend arrow overlay */}
      <div
        className={css('_abs _flex _aic _gap1')}
        style={{
          bottom: size * 0.12,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        {trendPositive ? (
          <TrendingUp size={14} style={{ color: 'var(--d-success)' }} />
        ) : (
          <TrendingDown size={14} style={{ color: 'var(--d-error)' }} />
        )}
        <span
          className="mono-data"
          style={{
            fontSize: '0.7rem',
            color: trendPositive ? 'var(--d-success)' : 'var(--d-error)',
          }}
        >
          {trendPositive ? '+' : ''}
          {metric.trend}%
        </span>
      </div>

      {/* Tooltip */}
      {hovered && (
        <div
          className={css('_abs _p3 _flex _col _gap2') + ' d-surface carbon-card'}
          style={{
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: 8,
            minWidth: 200,
            zIndex: 10,
          }}
        >
          <div className={css('_flex _jcsb _aic')}>
            <span className="d-label">{metric.label}</span>
            <span className="mono-data" style={{ fontSize: '0.875rem', fontWeight: 700 }}>
              {metric.value}
              {metric.unit}
            </span>
          </div>
          <div className={css('_flex _jcsb _aic')}>
            <span style={{ color: 'var(--d-text-muted)', fontSize: '0.75rem' }}>
              Range: {interpretation}
            </span>
            <span
              className="d-annotation"
              data-status={trendPositive ? 'success' : 'error'}
            >
              {trendPositive ? (
                <TrendingUp size={10} />
              ) : (
                <TrendingDown size={10} />
              )}
              {Math.abs(metric.trend)}%
            </span>
          </div>
          <span style={{ color: 'var(--d-text-muted)', fontSize: '0.7rem' }}>
            {trendDescription}
          </span>
        </div>
      )}
    </div>
  );
}
