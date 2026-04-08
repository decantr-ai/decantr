import { useState, useCallback } from 'react';

interface JsonViewerProps {
  data: unknown;
  title?: string;
}

const COLORS = {
  key: '#F58882',
  string: '#FDA303',
  number: '#0AF3EB',
  boolean: '#00E0AB',
  null: '#A1A1AA',
  bracket: '#A1A1AA',
  punctuation: '#6B7280',
};

function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

interface JsonNodeProps {
  keyName?: string;
  value: unknown;
  depth: number;
  isLast: boolean;
  lineStart: number;
}

function countLines(value: unknown): number {
  if (value === null || value === undefined) return 1;
  if (typeof value !== 'object') return 1;
  if (Array.isArray(value)) {
    if (value.length === 0) return 1;
    return 2 + value.reduce((sum: number, v) => sum + countLines(v), 0);
  }
  const keys = Object.keys(value as Record<string, unknown>);
  if (keys.length === 0) return 1;
  return 2 + keys.reduce((sum, k) => sum + countLines((value as Record<string, unknown>)[k]), 0);
}

function JsonNode({ keyName, value, depth, isLast, lineStart }: JsonNodeProps) {
  const [collapsed, setCollapsed] = useState(depth > 2);
  const indent = depth * 1.5;

  const isObject = value !== null && typeof value === 'object' && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isCollapsible = isObject || isArray;

  const comma = isLast ? '' : ',';

  // Primitive rendering
  if (!isCollapsible) {
    let rendered: React.ReactNode;
    let color: string;

    if (value === null || value === undefined) {
      color = COLORS.null;
      rendered = 'null';
    } else if (typeof value === 'string') {
      color = COLORS.string;
      rendered = `"${value}"`;
    } else if (typeof value === 'number') {
      color = COLORS.number;
      rendered = String(value);
    } else if (typeof value === 'boolean') {
      color = COLORS.boolean;
      rendered = String(value);
    } else {
      color = COLORS.null;
      rendered = String(value);
    }

    return (
      <div style={{ display: 'flex', minHeight: '1.6em' }}>
        <span
          style={{
            width: '3rem',
            flexShrink: 0,
            textAlign: 'right',
            paddingRight: '1rem',
            color: 'var(--d-text-muted)',
            opacity: 0.4,
            fontSize: '0.75rem',
            userSelect: 'none',
            fontFamily: 'ui-monospace, monospace',
            lineHeight: '1.6',
          }}
        >
          {lineStart}
        </span>
        <span style={{ paddingLeft: `${indent}rem` }}>
          {keyName !== undefined && (
            <>
              <span style={{ color: COLORS.key }}>"{keyName}"</span>
              <span style={{ color: COLORS.punctuation }}>: </span>
            </>
          )}
          <span style={{ color }}>{rendered}</span>
          <span style={{ color: COLORS.punctuation }}>{comma}</span>
        </span>
      </div>
    );
  }

  // Collapsible object/array
  const entries = isArray
    ? (value as unknown[]).map((v, i) => [String(i), v] as [string | undefined, unknown])
    : Object.entries(value as Record<string, unknown>);
  const openBracket = isArray ? '[' : '{';
  const closeBracket = isArray ? ']' : '}';
  const isEmpty = entries.length === 0;
  const totalLines = countLines(value);

  if (isEmpty) {
    return (
      <div style={{ display: 'flex', minHeight: '1.6em' }}>
        <span
          style={{
            width: '3rem',
            flexShrink: 0,
            textAlign: 'right',
            paddingRight: '1rem',
            color: 'var(--d-text-muted)',
            opacity: 0.4,
            fontSize: '0.75rem',
            userSelect: 'none',
            fontFamily: 'ui-monospace, monospace',
            lineHeight: '1.6',
          }}
        >
          {lineStart}
        </span>
        <span style={{ paddingLeft: `${indent}rem` }}>
          {keyName !== undefined && (
            <>
              <span style={{ color: COLORS.key }}>"{keyName}"</span>
              <span style={{ color: COLORS.punctuation }}>: </span>
            </>
          )}
          <span style={{ color: COLORS.bracket }}>
            {openBracket}{closeBracket}
          </span>
          <span style={{ color: COLORS.punctuation }}>{comma}</span>
        </span>
      </div>
    );
  }

  if (collapsed) {
    return (
      <div style={{ display: 'flex', minHeight: '1.6em' }}>
        <span
          style={{
            width: '3rem',
            flexShrink: 0,
            textAlign: 'right',
            paddingRight: '1rem',
            color: 'var(--d-text-muted)',
            opacity: 0.4,
            fontSize: '0.75rem',
            userSelect: 'none',
            fontFamily: 'ui-monospace, monospace',
            lineHeight: '1.6',
          }}
        >
          {lineStart}
        </span>
        <span style={{ paddingLeft: `${indent}rem` }}>
          <span
            onClick={() => setCollapsed(false)}
            style={{
              cursor: 'pointer',
              userSelect: 'none',
              display: 'inline-block',
              width: '1em',
              color: 'var(--d-text-muted)',
              transition: 'color 0.15s',
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCollapsed(false);
              }
            }}
            aria-label={`Expand ${keyName ?? (isArray ? 'array' : 'object')}`}
          >
            ▶
          </span>
          {keyName !== undefined && (
            <>
              <span style={{ color: COLORS.key }}>"{keyName}"</span>
              <span style={{ color: COLORS.punctuation }}>: </span>
            </>
          )}
          <span style={{ color: COLORS.bracket }}>{openBracket}</span>
          <span
            style={{
              color: 'var(--d-text-muted)',
              fontSize: '0.75rem',
              padding: '0 0.375rem',
            }}
          >
            {entries.length} {entries.length === 1 ? 'item' : 'items'}
          </span>
          <span style={{ color: COLORS.bracket }}>{closeBracket}</span>
          <span style={{ color: COLORS.punctuation }}>{comma}</span>
        </span>
      </div>
    );
  }

  // Expanded
  let currentLine = lineStart + 1; // line after opening bracket

  return (
    <>
      {/* Opening line */}
      <div style={{ display: 'flex', minHeight: '1.6em' }}>
        <span
          style={{
            width: '3rem',
            flexShrink: 0,
            textAlign: 'right',
            paddingRight: '1rem',
            color: 'var(--d-text-muted)',
            opacity: 0.4,
            fontSize: '0.75rem',
            userSelect: 'none',
            fontFamily: 'ui-monospace, monospace',
            lineHeight: '1.6',
          }}
        >
          {lineStart}
        </span>
        <span style={{ paddingLeft: `${indent}rem` }}>
          <span
            onClick={() => setCollapsed(true)}
            style={{
              cursor: 'pointer',
              userSelect: 'none',
              display: 'inline-block',
              width: '1em',
              color: 'var(--d-text-muted)',
              transition: 'color 0.15s',
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCollapsed(true);
              }
            }}
            aria-label={`Collapse ${keyName ?? (isArray ? 'array' : 'object')}`}
          >
            ▼
          </span>
          {keyName !== undefined && (
            <>
              <span style={{ color: COLORS.key }}>"{keyName}"</span>
              <span style={{ color: COLORS.punctuation }}>: </span>
            </>
          )}
          <span style={{ color: COLORS.bracket }}>{openBracket}</span>
        </span>
      </div>

      {/* Children */}
      {entries.map(([k, v], i) => {
        const childKey = isArray ? undefined : k;
        const childLineStart = currentLine;
        const childLines = countLines(v);
        currentLine += childLines;

        return (
          <JsonNode
            key={isArray ? i : k}
            keyName={childKey}
            value={v}
            depth={depth + 1}
            isLast={i === entries.length - 1}
            lineStart={childLineStart}
          />
        );
      })}

      {/* Closing bracket */}
      <div style={{ display: 'flex', minHeight: '1.6em' }}>
        <span
          style={{
            width: '3rem',
            flexShrink: 0,
            textAlign: 'right',
            paddingRight: '1rem',
            color: 'var(--d-text-muted)',
            opacity: 0.4,
            fontSize: '0.75rem',
            userSelect: 'none',
            fontFamily: 'ui-monospace, monospace',
            lineHeight: '1.6',
          }}
        >
          {currentLine}
        </span>
        <span style={{ paddingLeft: `${indent}rem` }}>
          <span style={{ color: COLORS.bracket }}>{closeBracket}</span>
          <span style={{ color: COLORS.punctuation }}>{comma}</span>
        </span>
      </div>
    </>
  );
}

export function JsonViewer({ data, title }: JsonViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    copyToClipboard(JSON.stringify(data, null, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [data]);

  return (
    <div className="lum-code-block" style={{ overflow: 'hidden' }}>
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.625rem 1rem',
          borderBottom: '1px solid var(--d-border)',
          background: 'rgba(255,255,255,0.02)',
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--d-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {title ?? 'JSON'}
        </span>
        <button
          className="d-interactive"
          data-variant="ghost"
          onClick={handleCopy}
          style={{
            fontSize: '0.75rem',
            padding: '0.25rem 0.5rem',
            borderRadius: 'var(--d-radius-sm)',
          }}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>

      {/* Code body */}
      <div
        style={{
          padding: '0.75rem 0',
          overflowX: 'auto',
          fontSize: '0.8125rem',
          lineHeight: 1.6,
        }}
      >
        <JsonNode
          value={data}
          depth={0}
          isLast={true}
          lineStart={1}
        />
      </div>
    </div>
  );
}
