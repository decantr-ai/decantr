'use client';

import { useState } from 'react';
import { CopyButton } from './copy-button';

export function JsonViewer({ data }: { data: Record<string, unknown> }) {
  const [expanded, setExpanded] = useState(false);
  const jsonString = JSON.stringify(data, null, 2);
  const previewLines = jsonString.split('\n').slice(0, 20).join('\n');
  const isLong = jsonString.split('\n').length > 20;

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2">
        <span className="text-xs font-medium text-[var(--fg-muted)]">JSON</span>
        <CopyButton text={jsonString} label="Copy JSON" />
      </div>
      <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-[var(--fg)]" style={{ fontFamily: 'var(--font-mono)' }}>
        <code>{expanded || !isLong ? jsonString : previewLines + '\n...'}</code>
      </pre>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full border-t border-[var(--border)] py-2 text-xs text-[var(--secondary)] hover:bg-[var(--bg-surface)] transition-colors"
        >
          {expanded ? 'Collapse' : 'Expand all'}
        </button>
      )}
    </div>
  );
}
