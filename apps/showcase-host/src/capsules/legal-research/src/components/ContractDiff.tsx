import { css } from '@decantr/css';
import { type DiffLine } from '../data/mock';

interface ContractDiffProps {
  lines: DiffLine[];
  title?: string;
}

export function ContractDiff({ lines, title }: ContractDiffProps) {
  return (
    <div style={{ border: '1px solid var(--d-border)', borderRadius: 'var(--d-radius)', overflow: 'hidden' }}>
      {title && (
        <div className={css('_flex _aic _jcsb')} style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--d-border)', background: 'var(--d-surface)' }}>
          <span className="d-label">{title}</span>
        </div>
      )}
      <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.8125rem', lineHeight: 1.8 }}>
        {lines.map((line, i) => (
          <div
            key={i}
            className={css('_flex')}
            style={{
              padding: '0.125rem 0.75rem',
              background: line.type === 'add'
                ? 'color-mix(in srgb, var(--d-success) 8%, transparent)'
                : line.type === 'remove'
                ? 'color-mix(in srgb, var(--d-error) 8%, transparent)'
                : undefined,
              borderLeft: line.type === 'add'
                ? '3px solid var(--d-success)'
                : line.type === 'remove'
                ? '3px solid var(--d-error)'
                : '3px solid transparent',
            }}
          >
            <span
              style={{
                width: 20,
                textAlign: 'center',
                color: line.type === 'add' ? 'var(--d-success)' : line.type === 'remove' ? 'var(--d-error)' : 'var(--d-text-muted)',
                flexShrink: 0,
                fontWeight: 600,
              }}
            >
              {line.type === 'add' ? '+' : line.type === 'remove' ? '\u2212' : ' '}
            </span>
            <span
              style={{
                flex: 1,
                textDecoration: line.type === 'remove' ? 'line-through' : undefined,
                color: line.type === 'remove' ? 'var(--d-error)' : line.type === 'add' ? 'var(--d-success)' : 'var(--d-text)',
              }}
            >
              {line.text}
            </span>
            {line.author && (
              <span className="counsel-margin" style={{ fontSize: '0.6875rem', marginLeft: '1rem', borderLeft: 'none', paddingLeft: 0, fontStyle: 'normal' }}>
                {line.author}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
