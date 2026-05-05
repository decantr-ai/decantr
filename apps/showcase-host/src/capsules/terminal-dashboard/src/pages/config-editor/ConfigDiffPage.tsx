import { useState } from 'react';
import { css } from '@decantr/css';
import { TerminalShell } from '@/components/TerminalShell';
import { SplitPane } from '@/components/SplitPane';

/* ── Diff data ── */
interface DiffLine {
  type: 'same' | 'add' | 'del' | 'mod-old' | 'mod-new';
  lineOld: number | null;
  lineNew: number | null;
  text: string;
}

const DIFF_FILENAME = 'decantr.essence.json';

const BEFORE_LINES = [
  '{',
  '  "version": 3,',
  '  "name": "terminal-dashboard",',
  '  "dna": {',
  '    "theme": "@official/phosphor-terminal",',
  '    "mode": "dark",',
  '    "density": "compact",',
  '    "shape": "sharp",',
  '    "motion": "instant",',
  '    "accessibility": "AA"',
  '  },',
  '  "blueprint": {',
  '    "archetype": "@official/dashboard",',
  '    "shell": "@official/sidebar-shell",',
  '    "pages": {',
  '      "/app": {',
  '        "title": "Home",',
  '        "layout": ["system-overview", "log-stream"],',
  '        "role": "primary"',
  '      },',
  '      "/app/config": {',
  '        "title": "Config Editor",',
  '        "layout": ["file-tree", "code-viewer"],',
  '        "role": "auxiliary"',
  '      },',
  '      "/app/logs": {',
  '        "title": "Log Viewer",',
  '        "layout": ["log-filters", "log-table"],',
  '        "role": "auxiliary"',
  '      },',
  '      "/app/metrics": {',
  '        "title": "Metrics",',
  '        "layout": ["metric-cards", "metric-charts"],',
  '        "role": "auxiliary"',
  '      }',
  '    }',
  '  },',
  '  "guard_mode": "strict",',
  '  "dna_enforcement": "error",',
  '  "blueprint_enforcement": "warn"',
  '}',
];

const AFTER_LINES = [
  '{',
  '  "version": 3,',
  '  "name": "terminal-dashboard",',
  '  "dna": {',
  '    "theme": "@official/phosphor-terminal",',
  '    "mode": "dark",',
  '    "density": "comfortable",',
  '    "shape": "sharp",',
  '    "motion": "smooth",',
  '    "accessibility": "AAA"',
  '  },',
  '  "blueprint": {',
  '    "archetype": "@official/dashboard",',
  '    "shell": "@official/sidebar-shell",',
  '    "pages": {',
  '      "/app": {',
  '        "title": "Home",',
  '        "layout": ["system-overview", "log-stream", "command-palette"],',
  '        "role": "primary"',
  '      },',
  '      "/app/config": {',
  '        "title": "Config Editor",',
  '        "layout": ["file-tree", "code-viewer", "diff-viewer"],',
  '        "role": "auxiliary"',
  '      },',
  '      "/app/logs": {',
  '        "title": "Log Viewer",',
  '        "layout": ["log-filters", "log-table"],',
  '        "role": "auxiliary"',
  '      },',
  '      "/app/metrics": {',
  '        "title": "Metrics",',
  '        "layout": ["metric-cards", "metric-charts"],',
  '        "role": "auxiliary"',
  '      },',
  '      "/app/alerts": {',
  '        "title": "Alerts",',
  '        "layout": ["alert-rules", "alert-history"],',
  '        "role": "auxiliary"',
  '      }',
  '    }',
  '  },',
  '  "guard_mode": "strict",',
  '  "dna_enforcement": "error",',
  '  "blueprint_enforcement": "error"',
  '}',
];

/* ── Compute unified diff ── */
function computeDiff(before: string[], after: string[]): DiffLine[] {
  const result: DiffLine[] = [];
  let oldIdx = 0;
  let newIdx = 0;

  // Simple LCS-based diff
  const lcs = computeLCS(before, after);
  let lcsIdx = 0;

  while (oldIdx < before.length || newIdx < after.length) {
    if (lcsIdx < lcs.length && oldIdx < before.length && before[oldIdx] === lcs[lcsIdx] && newIdx < after.length && after[newIdx] === lcs[lcsIdx]) {
      // Common line
      result.push({ type: 'same', lineOld: oldIdx + 1, lineNew: newIdx + 1, text: before[oldIdx] });
      oldIdx++;
      newIdx++;
      lcsIdx++;
    } else if (lcsIdx < lcs.length && oldIdx < before.length && before[oldIdx] !== lcs[lcsIdx]) {
      // Deleted line
      result.push({ type: 'del', lineOld: oldIdx + 1, lineNew: null, text: before[oldIdx] });
      oldIdx++;
    } else if (oldIdx >= before.length || (lcsIdx < lcs.length && newIdx < after.length && after[newIdx] !== lcs[lcsIdx])) {
      // Added line
      result.push({ type: 'add', lineOld: null, lineNew: newIdx + 1, text: after[newIdx] });
      newIdx++;
    } else if (lcsIdx >= lcs.length) {
      // Past LCS
      if (oldIdx < before.length) {
        result.push({ type: 'del', lineOld: oldIdx + 1, lineNew: null, text: before[oldIdx] });
        oldIdx++;
      }
      if (newIdx < after.length) {
        result.push({ type: 'add', lineOld: null, lineNew: newIdx + 1, text: after[newIdx] });
        newIdx++;
      }
    }
  }

  return result;
}

function computeLCS(a: string[], b: string[]): string[] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const result: string[] = [];
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      result.unshift(a[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return result;
}

/* ── Diff stats ── */
function getDiffStats(diff: DiffLine[]) {
  let additions = 0;
  let deletions = 0;
  for (const line of diff) {
    if (line.type === 'add') additions++;
    if (line.type === 'del') deletions++;
  }
  return { additions, deletions, total: additions + deletions };
}

/* ── Side panel renderer ── */
function DiffPanel({
  lines,
  title,
  side,
  diff,
}: {
  lines: string[];
  title: string;
  side: 'old' | 'new';
  diff: DiffLine[];
}) {
  const gutterWidth = String(lines.length).length;

  // Build a map: lineNumber -> diffType for this side
  const lineStyles = new Map<number, DiffLine['type']>();
  for (const d of diff) {
    if (side === 'old' && d.lineOld !== null) {
      if (d.type === 'del') lineStyles.set(d.lineOld, 'del');
    }
    if (side === 'new' && d.lineNew !== null) {
      if (d.type === 'add') lineStyles.set(d.lineNew, 'add');
    }
  }

  return (
    <div className={css('_flex _col')} style={{ height: '100%' }}>
      {/* Panel header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--d-border)',
          paddingBottom: '0.25rem',
          marginBottom: '0.5rem',
          flexShrink: 0,
        }}
      >
        <span className="d-label">{title}</span>
        <span style={{ fontSize: '0.65rem', color: 'var(--d-text-muted)' }}>
          {lines.length} lines
        </span>
      </div>

      {/* Code block */}
      <div
        className="term-canvas"
        style={{
          flex: 1,
          overflow: 'auto',
          border: '1px solid var(--d-border)',
          fontSize: '0.72rem',
          lineHeight: 1.65,
          minHeight: 0,
        }}
      >
        <pre style={{ margin: 0, padding: '0.5rem' }}>
          {lines.map((line, i) => {
            const lineNum = i + 1;
            const diffType = lineStyles.get(lineNum);
            let bgColor = 'transparent';
            let textColor = 'var(--d-text)';
            let gutterChar = ' ';
            let className = '';

            if (diffType === 'del') {
              bgColor = 'rgba(255, 0, 0, 0.08)';
              textColor = 'var(--d-error)';
              gutterChar = '-';
              className = 'term-diff-del';
            } else if (diffType === 'add') {
              bgColor = 'rgba(0, 255, 0, 0.08)';
              textColor = 'var(--d-success)';
              gutterChar = '+';
              className = 'term-diff-add';
            }

            return (
              <div
                key={i}
                className={className}
                style={{
                  display: 'flex',
                  background: bgColor,
                  borderLeft: diffType ? `2px solid ${diffType === 'add' ? 'var(--d-success)' : 'var(--d-error)'}` : '2px solid transparent',
                }}
              >
                <span
                  style={{
                    color: diffType ? textColor : 'var(--d-text-muted)',
                    width: '1.2ch',
                    textAlign: 'center',
                    flexShrink: 0,
                    fontWeight: diffType ? 700 : 400,
                    opacity: diffType ? 1 : 0.3,
                    userSelect: 'none',
                  }}
                >
                  {gutterChar}
                </span>
                <span
                  style={{
                    color: 'var(--d-text-muted)',
                    width: `${gutterWidth + 1}ch`,
                    textAlign: 'right',
                    paddingRight: '1ch',
                    flexShrink: 0,
                    userSelect: 'none',
                    opacity: 0.5,
                  }}
                >
                  {lineNum}
                </span>
                <span style={{ flex: 1, color: diffType ? textColor : 'var(--d-text)' }}>{line}</span>
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
}

/* ── Unified diff view ── */
function UnifiedDiffView({ diff }: { diff: DiffLine[] }) {
  return (
    <div
      className="term-canvas"
      style={{
        flex: 1,
        overflow: 'auto',
        border: '1px solid var(--d-border)',
        fontSize: '0.72rem',
        lineHeight: 1.65,
        minHeight: 0,
      }}
    >
      <pre style={{ margin: 0, padding: '0.5rem' }}>
        {diff.map((line, i) => {
          let bgColor = 'transparent';
          let textColor = 'var(--d-text)';
          let prefix = ' ';
          let className = '';

          if (line.type === 'add') {
            bgColor = 'rgba(0, 255, 0, 0.08)';
            textColor = 'var(--d-success)';
            prefix = '+';
            className = 'term-diff-add';
          } else if (line.type === 'del') {
            bgColor = 'rgba(255, 0, 0, 0.08)';
            textColor = 'var(--d-error)';
            prefix = '-';
            className = 'term-diff-del';
          }

          return (
            <div
              key={i}
              className={className}
              style={{
                display: 'flex',
                background: bgColor,
                borderLeft: line.type !== 'same' ? `2px solid ${line.type === 'add' ? 'var(--d-success)' : 'var(--d-error)'}` : '2px solid transparent',
              }}
            >
              <span
                style={{
                  color: textColor,
                  width: '1.5ch',
                  textAlign: 'center',
                  flexShrink: 0,
                  fontWeight: line.type !== 'same' ? 700 : 400,
                  userSelect: 'none',
                }}
              >
                {prefix}
              </span>
              <span
                style={{
                  color: 'var(--d-text-muted)',
                  width: '4ch',
                  textAlign: 'right',
                  paddingRight: '0.5ch',
                  flexShrink: 0,
                  userSelect: 'none',
                  opacity: 0.4,
                }}
              >
                {line.lineOld ?? ''}
              </span>
              <span
                style={{
                  color: 'var(--d-text-muted)',
                  width: '4ch',
                  textAlign: 'right',
                  paddingRight: '1ch',
                  flexShrink: 0,
                  userSelect: 'none',
                  opacity: 0.4,
                }}
              >
                {line.lineNew ?? ''}
              </span>
              <span style={{ flex: 1, color: textColor }}>{line.text}</span>
            </div>
          );
        })}
      </pre>
    </div>
  );
}

/* ── Page Component ── */
export function ConfigDiffPage() {
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');
  const diff = computeDiff(BEFORE_LINES, AFTER_LINES);
  const stats = getDiffStats(diff);

  return (
    <TerminalShell title="CONFIG DIFF">
      <div className={css('_flex _col')} style={{ flex: 1, minHeight: 0 }}>
        {/* Diff header bar */}
        <div
          className="term-panel"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.4rem 0.75rem',
            marginBottom: '0.5rem',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="d-label" style={{ color: 'var(--d-accent)' }}>
              DIFF
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--d-text)' }}>
              {DIFF_FILENAME}
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--d-text-muted)' }}>
              (config change)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Stats */}
            <span className="d-annotation" data-status="success" style={{ fontSize: '0.6rem' }}>
              +{stats.additions} addition{stats.additions !== 1 ? 's' : ''}
            </span>
            <span className="d-annotation" data-status="error" style={{ fontSize: '0.6rem' }}>
              -{stats.deletions} deletion{stats.deletions !== 1 ? 's' : ''}
            </span>

            {/* View mode toggle */}
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button
                className="d-interactive"
                data-variant={viewMode === 'split' ? 'primary' : 'ghost'}
                onClick={() => setViewMode('split')}
                style={{ padding: '0.15rem 0.5rem', fontSize: '0.65rem', borderRadius: 0 }}
              >
                SPLIT
              </button>
              <button
                className="d-interactive"
                data-variant={viewMode === 'unified' ? 'primary' : 'ghost'}
                onClick={() => setViewMode('unified')}
                style={{ padding: '0.15rem 0.5rem', fontSize: '0.65rem', borderRadius: 0 }}
              >
                UNIFIED
              </button>
            </div>
          </div>
        </div>

        {/* Change summary */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            padding: '0.3rem 0.75rem',
            marginBottom: '0.5rem',
            fontSize: '0.68rem',
            color: 'var(--d-text-muted)',
            flexShrink: 0,
            borderBottom: '1px solid var(--d-border)',
          }}
        >
          <span>
            <span style={{ color: 'var(--d-accent)' }}>density</span>: "compact" {'→'} "comfortable"
          </span>
          <span>
            <span style={{ color: 'var(--d-accent)' }}>motion</span>: "instant" {'→'} "smooth"
          </span>
          <span>
            <span style={{ color: 'var(--d-accent)' }}>accessibility</span>: "AA" {'→'} "AAA"
          </span>
          <span>
            <span style={{ color: 'var(--d-accent)' }}>pages</span>: +1 new page, +2 patterns added
          </span>
          <span>
            <span style={{ color: 'var(--d-accent)' }}>blueprint_enforcement</span>: "warn" {'→'} "error"
          </span>
        </div>

        {/* Diff content */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
          {viewMode === 'split' ? (
            <SplitPane
              left={
                <DiffPanel
                  lines={BEFORE_LINES}
                  title="BEFORE (HEAD~1)"
                  side="old"
                  diff={diff}
                />
              }
              right={
                <DiffPanel
                  lines={AFTER_LINES}
                  title="AFTER (HEAD)"
                  side="new"
                  diff={diff}
                />
              }
              direction="horizontal"
              initialRatio={0.5}
            />
          ) : (
            <div className={css('_flex _col')} style={{ flex: 1, padding: '0 0.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid var(--d-border)',
                  paddingBottom: '0.25rem',
                  marginBottom: '0.5rem',
                  flexShrink: 0,
                }}
              >
                <span className="d-label">UNIFIED VIEW</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--d-text-muted)' }}>
                  {diff.length} lines
                </span>
              </div>
              <UnifiedDiffView diff={diff} />
            </div>
          )}
        </div>

        {/* Footer info */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.3rem 0.75rem',
            fontSize: '0.62rem',
            color: 'var(--d-text-muted)',
            borderTop: '1px solid var(--d-border)',
            marginTop: '0.5rem',
            flexShrink: 0,
          }}
        >
          <span>commit abc1234..def5678</span>
          <span>author: admin@terminal-dash.internal</span>
          <span>2026-04-03T09:14:22Z</span>
          <span>{stats.total} changes across {BEFORE_LINES.length} {'→'} {AFTER_LINES.length} lines</span>
        </div>
      </div>
    </TerminalShell>
  );
}
