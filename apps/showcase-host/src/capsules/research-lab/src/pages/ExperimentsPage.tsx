import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Plus, Clock } from 'lucide-react';
import { experiments } from '../data/mock';
import { useState } from 'react';

type StatusFilter = 'all' | 'planned' | 'in-progress' | 'completed' | 'failed';

const statusColors: Record<string, { bg: string; color: string }> = {
  planned: { bg: 'color-mix(in srgb, var(--d-info) 12%, transparent)', color: 'var(--d-info)' },
  'in-progress': { bg: 'color-mix(in srgb, var(--d-primary) 12%, transparent)', color: 'var(--d-primary)' },
  completed: { bg: 'color-mix(in srgb, var(--d-success) 12%, transparent)', color: 'var(--d-success)' },
  failed: { bg: 'color-mix(in srgb, var(--d-error) 12%, transparent)', color: 'var(--d-error)' },
};

export function ExperimentsPage() {
  const [filter, setFilter] = useState<StatusFilter>('all');
  const filtered = filter === 'all' ? experiments : experiments.filter((e) => e.status === filter);

  return (
    <div>
      <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontWeight: 500, fontSize: '1.25rem' }}>Experiments</h1>
        <button className="d-interactive" data-variant="primary" style={{ borderRadius: 2, padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
          <Plus size={14} /> New Experiment
        </button>
      </div>

      {/* Filters */}
      <div className={css('_flex _aic _gap2')} style={{ marginBottom: '1rem' }}>
        {(['all', 'planned', 'in-progress', 'completed', 'failed'] as const).map((s) => (
          <button
            key={s}
            className="d-interactive"
            data-variant={filter === s ? undefined : 'ghost'}
            onClick={() => setFilter(s)}
            style={{
              padding: '0.25rem 0.625rem',
              fontSize: '0.75rem',
              borderRadius: 2,
              textTransform: 'capitalize',
              background: filter === s ? 'color-mix(in srgb, var(--d-primary) 10%, transparent)' : undefined,
              borderColor: filter === s ? 'var(--d-primary)' : undefined,
              color: filter === s ? 'var(--d-primary)' : undefined,
            }}
          >
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      {/* Kanban-style cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: '0.75rem' }}>
        {filtered.map((exp) => (
          <Link
            key={exp.id}
            to={`/experiments/${exp.id}`}
            className="lab-panel"
            style={{ display: 'block', textDecoration: 'none', color: 'inherit', padding: '1rem', transition: 'border-color 100ms linear' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--d-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--d-border)'; }}
          >
            <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  padding: '0.125rem 0.5rem',
                  borderRadius: 2,
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                  background: statusColors[exp.status]?.bg,
                  color: statusColors[exp.status]?.color,
                }}
              >
                {exp.status}
              </span>
              <span className="lab-reading" style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>{exp.id.toUpperCase()}</span>
            </div>
            <h3 style={{ fontWeight: 500, fontSize: '0.9375rem', marginBottom: '0.375rem' }}>{exp.title}</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', lineHeight: 1.5, marginBottom: '0.625rem' }}>{exp.description}</p>

            {/* Progress bar */}
            <div style={{ marginBottom: '0.5rem' }}>
              <div className={css('_flex _jcsb')} style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)', marginBottom: '0.25rem' }}>
                <span>Progress</span>
                <span className="lab-reading">{exp.progress}%</span>
              </div>
              <div style={{ height: 4, background: 'var(--d-surface-raised)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${exp.progress}%`, height: '100%', background: 'var(--d-primary)', borderRadius: 2, transition: 'width 300ms linear' }} />
              </div>
            </div>

            <div className={css('_flex _aic _jcsb')}>
              <span className={css('_flex _aic _gap1')} style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
                {exp.pi}
              </span>
              <span className={css('_flex _aic _gap1')} style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
                <Clock size={11} /> {exp.startDate}
              </span>
            </div>

            {/* Protocol chips */}
            <div className={css('_flex _aic _gap1')} style={{ marginTop: '0.5rem', flexWrap: 'wrap' }}>
              {exp.protocols.map((p) => (
                <span key={p} className="lab-chip" style={{ fontSize: '0.6875rem' }}>{p}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
