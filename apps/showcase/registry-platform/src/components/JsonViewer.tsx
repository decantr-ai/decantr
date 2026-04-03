import { css } from '@decantr/css';
import { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';

interface Props {
  data: unknown;
  title?: string;
}

function JsonNode({ value, depth = 0 }: { value: unknown; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);

  if (value === null) {
    return <span style={{ color: 'var(--d-text-muted)' }}>null</span>;
  }

  if (typeof value === 'string') {
    return <span style={{ color: 'var(--d-success)' }}>"{value}"</span>;
  }

  if (typeof value === 'number') {
    return <span style={{ color: 'var(--d-amber)' }}>{value}</span>;
  }

  if (typeof value === 'boolean') {
    return <span style={{ color: 'var(--d-cyan)' }}>{String(value)}</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return <span style={{ color: 'var(--d-text-muted)' }}>[]</span>;

    return (
      <span>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--d-text-muted)',
            cursor: 'pointer',
            padding: 0,
            verticalAlign: 'middle',
          }}
        >
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>
        <span style={{ color: 'var(--d-text-muted)' }}>[</span>
        {expanded ? (
          <div style={{ paddingLeft: '1.25rem' }}>
            {value.map((item, i) => (
              <div key={i}>
                <JsonNode value={item} depth={depth + 1} />
                {i < value.length - 1 && <span style={{ color: 'var(--d-text-muted)' }}>,</span>}
              </div>
            ))}
          </div>
        ) : (
          <span style={{ color: 'var(--d-text-muted)' }}> {value.length} items </span>
        )}
        <span style={{ color: 'var(--d-text-muted)' }}>]</span>
      </span>
    );
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return <span style={{ color: 'var(--d-text-muted)' }}>{'{}'}</span>;

    return (
      <span>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--d-text-muted)',
            cursor: 'pointer',
            padding: 0,
            verticalAlign: 'middle',
          }}
        >
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>
        <span style={{ color: 'var(--d-text-muted)' }}>{'{'}</span>
        {expanded ? (
          <div style={{ paddingLeft: '1.25rem' }}>
            {entries.map(([key, val], i) => (
              <div key={key}>
                <span style={{ color: 'var(--d-coral)' }}>"{key}"</span>
                <span style={{ color: 'var(--d-text-muted)' }}>: </span>
                <JsonNode value={val} depth={depth + 1} />
                {i < entries.length - 1 && <span style={{ color: 'var(--d-text-muted)' }}>,</span>}
              </div>
            ))}
          </div>
        ) : (
          <span style={{ color: 'var(--d-text-muted)' }}> {entries.length} keys </span>
        )}
        <span style={{ color: 'var(--d-text-muted)' }}>{'}'}</span>
      </span>
    );
  }

  return <span>{String(value)}</span>;
}

export function JsonViewer({ data, title = 'JSON Preview' }: Props) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="lum-code-block">
      {/* Header */}
      <div
        className={css('_flex _aic _jcsb')}
        style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--d-border)' }}
      >
        <span className="d-label">{title}</span>
        <button
          className="d-interactive"
          data-variant="ghost"
          onClick={handleCopy}
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* JSON content */}
      <div
        style={{
          padding: '1rem',
          fontFamily: 'var(--d-font-mono, ui-monospace, monospace)',
          fontSize: '0.8125rem',
          lineHeight: 1.6,
          overflowX: 'auto',
        }}
      >
        <JsonNode value={data} />
      </div>
    </div>
  );
}
