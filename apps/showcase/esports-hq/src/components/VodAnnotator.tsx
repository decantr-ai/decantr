import { useState } from 'react';
import { MessageSquare, AlertTriangle, Zap, Target } from 'lucide-react';
import type { VodAnnotation } from '@/data/mock';

const typeConfig: Record<string, { icon: typeof MessageSquare; color: string; label: string }> = {
  callout: { icon: MessageSquare, color: 'var(--d-info)', label: 'Callout' },
  mistake: { icon: AlertTriangle, color: 'var(--d-error)', label: 'Mistake' },
  highlight: { icon: Zap, color: 'var(--d-success)', label: 'Highlight' },
  strategy: { icon: Target, color: 'var(--d-accent)', label: 'Strategy' },
};

interface VodAnnotatorProps {
  annotations: VodAnnotation[];
  vodTitle: string;
  vodDuration: string;
  vodThumbnail: string;
}

export function VodAnnotator({ annotations, vodTitle, vodDuration, vodThumbnail }: VodAnnotatorProps) {
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('');

  const totalSeconds = 5000;
  const filtered = annotations.filter(a => !filterType || a.type === filterType);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Video player placeholder */}
      <div style={{
        width: '100%',
        aspectRatio: '16/9',
        background: vodThumbnail,
        borderRadius: 'var(--d-radius-lg)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}>
            <div style={{ width: 0, height: 0, borderLeft: '18px solid white', borderTop: '11px solid transparent', borderBottom: '11px solid transparent', marginLeft: 4 }} />
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1rem 1.25rem', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{vodTitle}</div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>{vodDuration}</div>
        </div>

        {/* Annotation markers on timeline */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: 'rgba(255,255,255,0.1)' }}>
          {annotations.map(a => (
            <div
              key={a.id}
              style={{
                position: 'absolute',
                left: `${(a.seconds / totalSeconds) * 100}%`,
                top: -2,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: typeConfig[a.type]?.color || 'var(--d-primary)',
                cursor: 'pointer',
                transform: selectedAnnotation === a.id ? 'scale(1.5)' : 'scale(1)',
                transition: 'transform 150ms ease',
              }}
              onClick={() => setSelectedAnnotation(a.id)}
              title={a.text}
            />
          ))}
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          className="d-interactive"
          data-variant={!filterType ? 'primary' : 'ghost'}
          style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
          onClick={() => setFilterType('')}
        >
          All ({annotations.length})
        </button>
        {Object.entries(typeConfig).map(([key, cfg]) => {
          const count = annotations.filter(a => a.type === key).length;
          return (
            <button
              key={key}
              className="d-interactive"
              data-variant={filterType === key ? 'primary' : 'ghost'}
              style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
              onClick={() => setFilterType(key)}
            >
              <cfg.icon size={12} />
              {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Annotations list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {filtered.map(annotation => {
          const cfg = typeConfig[annotation.type];
          const Icon = cfg?.icon || MessageSquare;
          const isSelected = selectedAnnotation === annotation.id;

          return (
            <div
              key={annotation.id}
              className="d-surface"
              data-interactive
              onClick={() => setSelectedAnnotation(isSelected ? null : annotation.id)}
              style={{
                padding: '0.75rem 1rem',
                borderLeft: `3px solid ${cfg?.color || 'var(--d-border)'}`,
                background: isSelected ? 'var(--d-surface-raised)' : undefined,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                <Icon size={14} style={{ color: cfg?.color }} />
                <span style={{
                  fontFamily: 'var(--d-font-mono, monospace)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: cfg?.color,
                }}>
                  {annotation.timestamp}
                </span>
                <span className="d-annotation" style={{ fontSize: '0.6rem' }}>{cfg?.label}</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>
                  {annotation.author}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--d-text)' }}>
                {annotation.text}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
