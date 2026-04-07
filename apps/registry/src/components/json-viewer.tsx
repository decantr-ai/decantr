'use client';

import { useState, useCallback } from 'react';

interface Props {
  data: unknown;
  title?: string;
}

function syntaxHighlight(json: string): string {
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = 'jv-number'; // cyan
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'jv-key'; // coral
        } else {
          cls = 'jv-string'; // amber
        }
      } else if (/true|false/.test(match)) {
        cls = 'jv-boolean'; // green
      } else if (/null/.test(match)) {
        cls = 'jv-null'; // muted
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

export function JsonViewer({ data, title = 'Preview' }: Props) {
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const jsonStr = JSON.stringify(data, null, 2);
  const lines = jsonStr.split('\n');

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [jsonStr]);

  return (
    <div className="lum-code-block">
      {/* Header toolbar */}
      <div
        className="flex items-center justify-between"
        style={{
          padding: '0.5rem 1rem',
          borderBottom: '1px solid var(--d-border)',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{title}</span>
          <span className="d-annotation">JSON</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="d-interactive"
            data-variant="ghost"
            onClick={() => setCollapsed(!collapsed)}
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
          >
            {collapsed ? 'Expand' : 'Collapse'}
          </button>
          <button
            className="d-interactive"
            data-variant="ghost"
            onClick={handleCopy}
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
          >
            {copied ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
            )}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Code content */}
      {!collapsed && (
        <div style={{ display: 'flex', overflow: 'auto', padding: '0.75rem 0' }}>
          {/* Line numbers */}
          <div
            style={{
              paddingRight: '0.75rem',
              paddingLeft: '1rem',
              textAlign: 'right',
              userSelect: 'none',
              color: 'var(--d-text-muted)',
              fontSize: '0.75rem',
              lineHeight: 1.6,
              flexShrink: 0,
              borderRight: '1px solid var(--d-border)',
            }}
          >
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          {/* JSON content */}
          <pre
            style={{
              padding: '0 1rem',
              margin: 0,
              lineHeight: 1.6,
              fontSize: '0.8125rem',
              whiteSpace: 'pre',
            }}
            dangerouslySetInnerHTML={{ __html: syntaxHighlight(jsonStr) }}
          />
        </div>
      )}

      {collapsed && (
        <div style={{ padding: '0.75rem 1rem', color: 'var(--d-text-muted)', fontSize: '0.8125rem' }}>
          {'{'}...{'}'} ({lines.length} lines)
        </div>
      )}

      <style>{`
        .jv-key { color: var(--d-coral, #F58882); }
        .jv-string { color: var(--d-amber, #FDA303); }
        .jv-number { color: var(--d-cyan, #0AF3EB); }
        .jv-boolean { color: var(--d-green, #00E0AB); }
        .jv-null { color: var(--d-text-muted, #A1A1AA); }
      `}</style>
    </div>
  );
}
