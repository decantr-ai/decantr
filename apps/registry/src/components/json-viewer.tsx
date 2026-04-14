'use client';

import { useCallback, useMemo, useState } from 'react';
import styles from './json-viewer.module.css';

interface JsonViewerProps {
  data: unknown;
  title?: string;
  defaultTab?: 'json' | 'overview' | 'commands' | 'evidence';
  commands?: Array<{
    label: string;
    command: string;
    hint?: string;
  }>;
  evidence?: Array<{
    title: string;
    items: string[];
  }>;
}

const INDENT_CLASSES = [
  styles.depth0,
  styles.depth1,
  styles.depth2,
  styles.depth3,
  styles.depth4,
  styles.depth5,
  styles.depth6,
];

function getIndentClass(depth: number) {
  return INDENT_CLASSES[Math.min(depth, INDENT_CLASSES.length - 1)];
}

function summarizeValue(value: unknown) {
  if (Array.isArray(value)) {
    return `${value.length} items`;
  }
  if (value && typeof value === 'object') {
    return `${Object.keys(value as Record<string, unknown>).length} keys`;
  }
  return typeof value;
}

function getTopLevelEntries(value: unknown): Array<{ key: string; value: unknown }> {
  if (Array.isArray(value)) {
    return value.map((entry, index) => ({ key: `[${index}]`, value: entry }));
  }
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).map(([key, entry]) => ({
      key,
      value: entry,
    }));
  }
  return [];
}

function formatBytes(bytes: number) {
  if (bytes >= 1_000_000) {
    return `${(bytes / 1_000_000).toFixed(2)} MB`;
  }
  if (bytes >= 1_000) {
    return `${(bytes / 1_000).toFixed(1)} KB`;
  }
  return `${bytes} B`;
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
      {copied ? 'Copied' : 'Copy JSON'}
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

function JsonNode({ keyName, value, depth, lineCounter, isLast }: NodeProps) {
  const [collapsed, setCollapsed] = useState(depth >= 3);
  const comma = isLast ? '' : ',';

  const keyEl = keyName !== undefined ? (
    <span>
      <span className={styles.tokenKey}>"{keyName}"</span>
      <span className={styles.tokenPunctuation}>: </span>
    </span>
  ) : null;

  if (value === null) {
    const line = lineCounter.current++;
    return (
      <div className={styles.row}>
        <span className={styles.lineNum}>{line}</span>
        <div className={`${styles.content} ${getIndentClass(depth)}`}>
          {keyEl}
          <span className={styles.tokenNull}>null</span>
          {comma}
        </div>
      </div>
    );
  }

  if (typeof value === 'boolean') {
    const line = lineCounter.current++;
    return (
      <div className={styles.row}>
        <span className={styles.lineNum}>{line}</span>
        <div className={`${styles.content} ${getIndentClass(depth)}`}>
          {keyEl}
          <span className={styles.tokenBoolean}>{String(value)}</span>
          {comma}
        </div>
      </div>
    );
  }

  if (typeof value === 'number') {
    const line = lineCounter.current++;
    return (
      <div className={styles.row}>
        <span className={styles.lineNum}>{line}</span>
        <div className={`${styles.content} ${getIndentClass(depth)}`}>
          {keyEl}
          <span className={styles.tokenNumber}>{String(value)}</span>
          {comma}
        </div>
      </div>
    );
  }

  if (typeof value === 'string') {
    const line = lineCounter.current++;
    return (
      <div className={styles.row}>
        <span className={styles.lineNum}>{line}</span>
        <div className={`${styles.content} ${getIndentClass(depth)}`}>
          {keyEl}
          <span className={styles.tokenString}>"{value}"</span>
          {comma}
        </div>
      </div>
    );
  }

  if (Array.isArray(value)) {
    const openLine = lineCounter.current++;

    if (collapsed) {
      return (
        <div className={styles.row}>
          <span className={styles.lineNum}>{openLine}</span>
          <div className={`${styles.content} ${getIndentClass(depth)}`}>
            {keyEl}
            <button
              onClick={() => setCollapsed(false)}
              className={styles.toggleButton}
              aria-label={`Expand array${keyName ? ` ${keyName}` : ''}`}
            >
              <span className={styles.tokenPunctuation}>[</span>
              <span className="d-annotation">{value.length}</span>
              <span className={styles.tokenPunctuation}>]</span>
            </button>
            {comma}
          </div>
        </div>
      );
    }

    return (
      <>
        <div className={styles.row}>
          <span className={styles.lineNum}>{openLine}</span>
          <div className={`${styles.content} ${getIndentClass(depth)}`}>
            {keyEl}
            <button
              onClick={() => setCollapsed(true)}
              className={styles.toggleButton}
              aria-label={`Collapse array${keyName ? ` ${keyName}` : ''}`}
            >
              <span className={styles.tokenPunctuation}>[</span>
            </button>
          </div>
        </div>
        {value.map((item, index) => (
          <JsonNode
            key={index}
            value={item}
            depth={depth + 1}
            lineCounter={lineCounter}
            isLast={index === value.length - 1}
          />
        ))}
        <div className={styles.row}>
          <span className={styles.lineNum}>{lineCounter.current++}</span>
          <div className={`${styles.content} ${getIndentClass(depth)}`}>
            <span className={styles.tokenPunctuation}>]</span>
            {comma}
          </div>
        </div>
      </>
    );
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    const openLine = lineCounter.current++;

    if (collapsed) {
      return (
        <div className={styles.row}>
          <span className={styles.lineNum}>{openLine}</span>
          <div className={`${styles.content} ${getIndentClass(depth)}`}>
            {keyEl}
            <button
              onClick={() => setCollapsed(false)}
              className={styles.toggleButton}
              aria-label={`Expand object${keyName ? ` ${keyName}` : ''}`}
            >
              <span className={styles.tokenPunctuation}>{'{'}</span>
              <span className="d-annotation">{entries.length}</span>
              <span className={styles.tokenPunctuation}>{'}'}</span>
            </button>
            {comma}
          </div>
        </div>
      );
    }

    return (
      <>
        <div className={styles.row}>
          <span className={styles.lineNum}>{openLine}</span>
          <div className={`${styles.content} ${getIndentClass(depth)}`}>
            {keyEl}
            <button
              onClick={() => setCollapsed(true)}
              className={styles.toggleButton}
              aria-label={`Collapse object${keyName ? ` ${keyName}` : ''}`}
            >
              <span className={styles.tokenPunctuation}>{'{'}</span>
            </button>
          </div>
        </div>
        {entries.map(([entryKey, entryValue], index) => (
          <JsonNode
            key={entryKey}
            keyName={entryKey}
            value={entryValue}
            depth={depth + 1}
            lineCounter={lineCounter}
            isLast={index === entries.length - 1}
          />
        ))}
        <div className={styles.row}>
          <span className={styles.lineNum}>{lineCounter.current++}</span>
          <div className={`${styles.content} ${getIndentClass(depth)}`}>
            <span className={styles.tokenPunctuation}>{'}'}</span>
            {comma}
          </div>
        </div>
      </>
    );
  }

  const line = lineCounter.current++;
  return (
    <div className={styles.row}>
      <span className={styles.lineNum}>{line}</span>
      <div className={`${styles.content} ${getIndentClass(depth)}`}>
        {keyEl}
        <span>{String(value)}</span>
        {comma}
      </div>
    </div>
  );
}

export function JsonViewer({
  data,
  title = 'Preview',
  defaultTab = 'json',
  commands = [],
  evidence = [],
}: JsonViewerProps) {
  const initialTab = useMemo(() => {
    if (defaultTab === 'commands' && commands.length > 0) return 'commands';
    if (defaultTab === 'evidence' && evidence.length > 0) return 'evidence';
    if (defaultTab === 'overview') return 'overview';
    return 'json';
  }, [commands.length, defaultTab, evidence.length]);
  const [tab, setTab] = useState<'json' | 'overview' | 'commands' | 'evidence'>(initialTab);
  const jsonString = JSON.stringify(data, null, 2);
  const lineCount = jsonString.split('\n').length;
  const topLevelEntries = useMemo(() => getTopLevelEntries(data), [data]);
  const schemaId =
    data && typeof data === 'object' && '$schema' in (data as Record<string, unknown>)
      ? String((data as Record<string, unknown>)['$schema'])
      : null;
  const lineCounter = { current: 1 };

  return (
    <div className={`lum-code-block ${styles.viewer}`}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarMeta}>
          <span className={styles.title}>{title}</span>
          <div className={styles.summaryRow}>
            <span className={`d-annotation ${styles.metaChip}`}>{lineCount} lines</span>
            <span className={`d-annotation ${styles.metaChip}`}>{formatBytes(jsonString.length)}</span>
            <span className={`d-annotation ${styles.metaChip}`}>{topLevelEntries.length} root entries</span>
            {schemaId ? <span className={`d-annotation ${styles.metaChip}`}>schema</span> : null}
          </div>
        </div>
        <CopyButton text={jsonString} />
      </div>

      <div className={styles.tabs}>
        <button
          type="button"
          className={`d-interactive ${styles.tabButton}`}
          data-variant={tab === 'overview' ? 'primary' : 'ghost'}
          onClick={() => setTab('overview')}
        >
          Overview
        </button>
        <button
          type="button"
          className={`d-interactive ${styles.tabButton}`}
          data-variant={tab === 'json' ? 'primary' : 'ghost'}
          onClick={() => setTab('json')}
        >
          JSON
        </button>
        {commands.length > 0 ? (
          <button
            type="button"
            className={`d-interactive ${styles.tabButton}`}
            data-variant={tab === 'commands' ? 'primary' : 'ghost'}
            onClick={() => setTab('commands')}
          >
            Commands
          </button>
        ) : null}
        {evidence.length > 0 ? (
          <button
            type="button"
            className={`d-interactive ${styles.tabButton}`}
            data-variant={tab === 'evidence' ? 'primary' : 'ghost'}
            onClick={() => setTab('evidence')}
          >
            Evidence
          </button>
        ) : null}
      </div>

      {tab === 'overview' ? (
        <div className={`${styles.pane} ${styles.outlineGrid}`}>
          {topLevelEntries.map((entry) => (
            <div key={entry.key} className={styles.outlineItem}>
              <div className={styles.outlineKey}>{entry.key}</div>
              <div className={styles.outlineMeta}>
                <span>{typeof entry.value}</span>
                <span>{summarizeValue(entry.value)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : tab === 'json' ? (
        <div className={`${styles.pane} ${styles.jsonPane}`}>
          <JsonNode value={data} depth={0} lineCounter={lineCounter} isLast />
        </div>
      ) : tab === 'commands' ? (
        <div className={`${styles.pane} ${styles.stackGrid}`}>
          {commands.map((entry) => (
            <div key={entry.label} className={styles.commandCard}>
              <div className={styles.commandHeader}>
                <div>
                  <div className={styles.commandLabel}>{entry.label}</div>
                  {entry.hint ? <div className={styles.commandHint}>{entry.hint}</div> : null}
                </div>
                <CopyButton text={entry.command} />
              </div>
              <code className={styles.commandCode}>{entry.command}</code>
            </div>
          ))}
        </div>
      ) : (
        <div className={`${styles.pane} ${styles.stackGrid}`}>
          {evidence.map((section) => (
            <div key={section.title} className={styles.evidenceCard}>
              <div className={styles.evidenceTitle}>{section.title}</div>
              <ul className={styles.evidenceList}>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <div className={styles.footer}>
        {tab === 'commands'
          ? 'Use the commands tab as the fastest path into Decantr, then switch to JSON only when you need raw contract detail.'
          : schemaId
            ? 'This artifact is schema-backed and can be copied directly into your workflow or inspected in detail.'
            : 'This artifact can be copied directly into your workflow or inspected in detail.'}
      </div>
    </div>
  );
}
