'use client';

import { useCallback, useState } from 'react';

interface JsonViewerProps {
  data: unknown;
  title?: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may not be available
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="d-interactive py-1 px-2.5 text-xs"
      data-variant="ghost"
    >
      {copied ? (
        <span className="flex items-center gap-1.5 text-d-green">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copied
        </span>
      ) : (
        <span className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          Copy
        </span>
      )}
    </button>
  );
}

interface NodeProps {
  keyName?: string;
  value: unknown;
  depth: number;
  lineCounter: { current: number };
  isLast: boolean;
}

function LineNum({ num }: { num: number }) {
  return (
    <span className="inline-block w-8 text-right mr-4 text-d-muted text-xs font-mono select-none opacity-50">
      {num}
    </span>
  );
}

function Indent({ depth }: { depth: number }) {
  return <span style={{ paddingLeft: `${depth * 1.25}rem` }} />;
}

function JsonNode({ keyName, value, depth, lineCounter, isLast }: NodeProps) {
  const [collapsed, setCollapsed] = useState(depth >= 3);
  const comma = isLast ? '' : ',';

  const keyEl = keyName !== undefined ? (
    <span>
      <span className="text-d-coral">&quot;{keyName}&quot;</span>
      <span className="text-d-muted">: </span>
    </span>
  ) : null;

  // Primitives
  if (value === null) {
    const line = lineCounter.current++;
    return (
      <div className="leading-relaxed">
        <LineNum num={line} />
        <Indent depth={depth} />
        {keyEl}
        <span className="text-d-muted italic">null</span>
        {comma}
      </div>
    );
  }

  if (typeof value === 'boolean') {
    const line = lineCounter.current++;
    return (
      <div className="leading-relaxed">
        <LineNum num={line} />
        <Indent depth={depth} />
        {keyEl}
        <span className="text-d-green">{String(value)}</span>
        {comma}
      </div>
    );
  }

  if (typeof value === 'number') {
    const line = lineCounter.current++;
    return (
      <div className="leading-relaxed">
        <LineNum num={line} />
        <Indent depth={depth} />
        {keyEl}
        <span className="text-d-cyan">{String(value)}</span>
        {comma}
      </div>
    );
  }

  if (typeof value === 'string') {
    const line = lineCounter.current++;
    return (
      <div className="leading-relaxed">
        <LineNum num={line} />
        <Indent depth={depth} />
        {keyEl}
        <span className="text-d-amber">&quot;{value}&quot;</span>
        {comma}
      </div>
    );
  }

  // Arrays
  if (Array.isArray(value)) {
    const openLine = lineCounter.current++;

    if (collapsed) {
      return (
        <div className="leading-relaxed">
          <LineNum num={openLine} />
          <Indent depth={depth} />
          {keyEl}
          <button
            onClick={() => setCollapsed(false)}
            className="text-d-muted hover:text-d-text cursor-pointer bg-transparent border-none font-mono text-inherit p-0"
            aria-label={`Expand array${keyName ? ` ${keyName}` : ''}`}
          >
            <span className="text-d-text">[</span>
            <span className="text-xs mx-1 d-annotation">{value.length}</span>
            <span className="text-d-text">]</span>
          </button>
          {comma}
        </div>
      );
    }

    return (
      <>
        <div className="leading-relaxed">
          <LineNum num={openLine} />
          <Indent depth={depth} />
          {keyEl}
          <button
            onClick={() => setCollapsed(true)}
            className="text-d-muted hover:text-d-text cursor-pointer bg-transparent border-none font-mono text-inherit p-0"
            aria-label={`Collapse array${keyName ? ` ${keyName}` : ''}`}
          >
            <span className="text-d-text">[</span>
          </button>
        </div>
        {value.map((item, i) => (
          <JsonNode
            key={i}
            value={item}
            depth={depth + 1}
            lineCounter={lineCounter}
            isLast={i === value.length - 1}
          />
        ))}
        <div className="leading-relaxed">
          <LineNum num={lineCounter.current++} />
          <Indent depth={depth} />
          <span className="text-d-text">]</span>
          {comma}
        </div>
      </>
    );
  }

  // Objects
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    const openLine = lineCounter.current++;

    if (collapsed) {
      return (
        <div className="leading-relaxed">
          <LineNum num={openLine} />
          <Indent depth={depth} />
          {keyEl}
          <button
            onClick={() => setCollapsed(false)}
            className="text-d-muted hover:text-d-text cursor-pointer bg-transparent border-none font-mono text-inherit p-0"
            aria-label={`Expand object${keyName ? ` ${keyName}` : ''}`}
          >
            <span className="text-d-text">{'{'}</span>
            <span className="text-xs mx-1 d-annotation">{entries.length}</span>
            <span className="text-d-text">{'}'}</span>
          </button>
          {comma}
        </div>
      );
    }

    return (
      <>
        <div className="leading-relaxed">
          <LineNum num={openLine} />
          <Indent depth={depth} />
          {keyEl}
          <button
            onClick={() => setCollapsed(true)}
            className="text-d-muted hover:text-d-text cursor-pointer bg-transparent border-none font-mono text-inherit p-0"
            aria-label={`Collapse object${keyName ? ` ${keyName}` : ''}`}
          >
            <span className="text-d-text">{'{'}</span>
          </button>
        </div>
        {entries.map(([k, v], i) => (
          <JsonNode
            key={k}
            keyName={k}
            value={v}
            depth={depth + 1}
            lineCounter={lineCounter}
            isLast={i === entries.length - 1}
          />
        ))}
        <div className="leading-relaxed">
          <LineNum num={lineCounter.current++} />
          <Indent depth={depth} />
          <span className="text-d-text">{'}'}</span>
          {comma}
        </div>
      </>
    );
  }

  // Fallback
  const line = lineCounter.current++;
  return (
    <div className="leading-relaxed">
      <LineNum num={line} />
      <Indent depth={depth} />
      {keyEl}
      <span className="text-d-text">{String(value)}</span>
      {comma}
    </div>
  );
}

export function JsonViewer({ data, title = 'Preview' }: JsonViewerProps) {
  const jsonString = JSON.stringify(data, null, 2);
  const lineCounter = { current: 1 };

  return (
    <div className="lum-code-block overflow-hidden">
      {/* Header toolbar */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-d-border/50">
        <span className="text-xs font-medium text-d-muted">{title}</span>
        <CopyButton text={jsonString} />
      </div>

      {/* JSON content */}
      <div className="overflow-x-auto text-sm font-mono">
        <JsonNode
          value={data}
          depth={0}
          lineCounter={lineCounter}
          isLast
        />
      </div>
    </div>
  );
}
