/**
 * Decantr Dev Error Overlay
 *
 * Standalone DOM overlay (no framework dependency — works even when framework crashes).
 * Captures runtime errors, unhandled promise rejections, and console.error calls,
 * and displays them in an in-page panel with Decantr-specific diagnostics.
 *
 * Injected by the dev server when __DECANTR_DEV__ is set. Never included in production.
 */

// ─── Known Error Patterns ────────────────────────────────────────
const KNOWN_PATTERNS = [
  {
    test: /getter is not a function/i,
    hint: 'You likely passed a static value to text(). Wrap it in a getter function:\n  text(() => item.label)  // not text(item.label)',
    doc: 'llm/task-debug.md §16'
  },
  {
    test: /is not a function/i,
    hint: 'A value expected to be a function was not. Check that reactive getters are wrapped in () =>',
    doc: 'llm/task-debug.md §16'
  },
  {
    test: /Cannot read propert(y|ies) of (null|undefined)/i,
    hint: 'A DOM element or object is null/undefined. Common causes:\n  - mount() target not found (check #app exists in index.html)\n  - Accessing a signal value without calling it: use count(), not count',
    doc: 'llm/task-debug.md'
  },
  {
    test: /is not defined/i,
    hint: 'A variable or import is missing. Check:\n  - Import statement exists and path is correct\n  - Component name spelling matches the export',
    doc: 'llm/task-debug.md'
  },
  {
    test: /Failed to resolve module|Failed to fetch dynamically imported module/i,
    hint: 'Module import failed. Check:\n  - File path exists and is spelled correctly\n  - The import uses decantr/* not a relative path to node_modules\n  - The dev server is running',
    doc: 'llm/task-debug.md'
  },
];

// ─── Atom Typo Suggestions ──────────────────────────────────────
const COMMON_ATOMS = [
  '_flex', '_grid', '_col', '_row', '_aic', '_aifs', '_jcc', '_jcsb',
  '_center', '_wrap', '_flex1', '_gap1', '_gap2', '_gap3', '_gap4', '_gap6', '_gap8',
  '_p1', '_p2', '_p3', '_p4', '_p6', '_p8', '_px4', '_px6', '_py3', '_py4',
  '_m0', '_mt4', '_mb4', '_mxa', '_wfull', '_hfull', '_minhscreen',
  '_gc2', '_gc3', '_gc4', '_span2', '_span3',
  '_fgfg', '_fgmuted', '_fgmutedfg', '_fgprimary',
  '_bgbg', '_bgmuted', '_bgprimary', '_bgsuccess', '_bgerror', '_bgwarning',
  '_b1', '_r2', '_r4', '_rfull', '_bcborder', '_bcprimary',
  '_bold', '_tc', '_heading1', '_heading2', '_heading3', '_heading4', '_heading5',
  '_body', '_caption', '_label', '_textsm', '_textbase', '_textlg', '_textxl',
  '_shadow', '_shadowmd', '_trans', '_pointer', '_ohidden', '_overflow',
  '_relative', '_absolute', '_fixed', '_none', '_truncate', '_nounder',
  '_borderB', '_borderR', '_borderT',
];

function suggestAtom(unknown) {
  let best = null;
  let bestScore = 0;
  for (const atom of COMMON_ATOMS) {
    const score = similarity(unknown, atom);
    if (score > bestScore) {
      bestScore = score;
      best = atom;
    }
  }
  return bestScore > 0.6 ? best : null;
}

function similarity(a, b) {
  if (a === b) return 1;
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  if (longer.length === 0) return 1;
  const editDist = levenshtein(longer, shorter);
  return (longer.length - editDist) / longer.length;
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

// ─── Error Stack Parsing ────────────────────────────────────────
function parseStack(stack) {
  if (!stack) return [];
  return stack.split('\n').slice(1).map(line => {
    const match = line.match(/at\s+(.+?)\s*\((.+?):(\d+):(\d+)\)/);
    if (match) return { fn: match[1], file: match[2], line: +match[3], col: +match[4] };
    const match2 = line.match(/at\s+(.+?):(\d+):(\d+)/);
    if (match2) return { fn: '(anonymous)', file: match2[1], line: +match2[2], col: +match2[3] };
    return null;
  }).filter(Boolean);
}

// ─── Overlay State ──────────────────────────────────────────────
let overlayEl = null;
let errors = [];
let collapsed = false;

// ─── Overlay Styles ─────────────────────────────────────────────
const OVERLAY_STYLES = `
  .d-error-overlay {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    max-height: 60vh;
    background: #1a1a2e;
    color: #e0e0e0;
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
    font-size: 13px;
    z-index: 2147483647;
    border-top: 3px solid #D80F4A;
    overflow-y: auto;
    box-shadow: 0 -4px 24px rgba(0,0,0,0.5);
  }
  .d-error-overlay-collapsed {
    max-height: 40px;
    overflow: hidden;
  }
  .d-error-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    background: #D80F4A;
    color: #fff;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    user-select: none;
    position: sticky;
    top: 0;
    z-index: 1;
  }
  .d-error-header-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .d-error-header-btn {
    background: rgba(255,255,255,0.2);
    border: none;
    color: #fff;
    padding: 2px 8px;
    border-radius: 4px;
    cursor: pointer;
    font-family: inherit;
    font-size: 12px;
  }
  .d-error-header-btn:hover {
    background: rgba(255,255,255,0.3);
  }
  .d-error-entry {
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .d-error-entry:last-child {
    border-bottom: none;
  }
  .d-error-message {
    color: #ff6b6b;
    font-weight: 600;
    margin-bottom: 6px;
    word-break: break-word;
  }
  .d-error-hint {
    background: rgba(100,200,255,0.08);
    border-left: 3px solid #6dc8ff;
    padding: 8px 12px;
    margin: 8px 0;
    color: #6dc8ff;
    white-space: pre-wrap;
    line-height: 1.5;
  }
  .d-error-hint-doc {
    color: #888;
    font-size: 11px;
    margin-top: 4px;
  }
  .d-error-stack {
    margin-top: 6px;
    color: #888;
    font-size: 12px;
    line-height: 1.6;
  }
  .d-error-stack-frame {
    padding: 1px 0;
  }
  .d-error-stack-fn {
    color: #aaa;
  }
  .d-error-stack-file {
    color: #6dc8ff;
  }
  .d-error-stack-loc {
    color: #666;
  }
  .d-error-type {
    display: inline-block;
    padding: 1px 6px;
    border-radius: 3px;
    font-size: 11px;
    font-weight: 600;
    margin-right: 8px;
    text-transform: uppercase;
  }
  .d-error-type-error { background: #D80F4A; color: #fff; }
  .d-error-type-warning { background: #FDA303; color: #1a1a2e; }
  .d-error-type-atom { background: #6500C6; color: #fff; }
  .d-error-atom-suggestion {
    color: #00C388;
    font-weight: 600;
  }
`;

// ─── Overlay DOM ────────────────────────────────────────────────
function ensureOverlay() {
  if (overlayEl) return overlayEl;

  // Inject styles
  const style = document.createElement('style');
  style.setAttribute('data-decantr-error-overlay', '');
  style.textContent = OVERLAY_STYLES;
  document.head.appendChild(style);

  // Create overlay
  overlayEl = document.createElement('div');
  overlayEl.className = 'd-error-overlay';
  document.body.appendChild(overlayEl);

  return overlayEl;
}

function renderOverlay() {
  if (!errors.length) {
    if (overlayEl) {
      overlayEl.remove();
      overlayEl = null;
    }
    return;
  }

  const el = ensureOverlay();
  el.className = 'd-error-overlay' + (collapsed ? ' d-error-overlay-collapsed' : '');

  const errorCount = errors.filter(e => e.type === 'error').length;
  const warnCount = errors.filter(e => e.type !== 'error').length;
  const countText = [
    errorCount ? `${errorCount} error${errorCount > 1 ? 's' : ''}` : '',
    warnCount ? `${warnCount} warning${warnCount > 1 ? 's' : ''}` : '',
  ].filter(Boolean).join(', ');

  el.innerHTML = '';

  // Header
  const header = document.createElement('div');
  header.className = 'd-error-header';
  header.innerHTML = `
    <span>decantr ${countText}</span>
    <span class="d-error-header-actions">
      <button class="d-error-header-btn" data-action="toggle">${collapsed ? 'expand' : 'collapse'}</button>
      <button class="d-error-header-btn" data-action="clear">clear</button>
      <button class="d-error-header-btn" data-action="dismiss">x</button>
    </span>
  `;
  header.addEventListener('click', (e) => {
    const action = e.target.dataset?.action;
    if (action === 'toggle' || !action) {
      collapsed = !collapsed;
      renderOverlay();
    } else if (action === 'clear') {
      errors = [];
      renderOverlay();
    } else if (action === 'dismiss') {
      errors = [];
      if (overlayEl) { overlayEl.remove(); overlayEl = null; }
    }
  });
  el.appendChild(header);

  if (collapsed) return;

  // Error entries
  for (const err of errors) {
    const entry = document.createElement('div');
    entry.className = 'd-error-entry';

    const typeClass = err.type === 'error' ? 'd-error-type-error'
      : err.type === 'atom' ? 'd-error-type-atom'
      : 'd-error-type-warning';

    let html = `<span class="d-error-type ${typeClass}">${err.type}</span>`;
    html += `<span class="d-error-message">${escapeHtml(err.message)}</span>`;

    // Hint
    if (err.hint) {
      html += `<div class="d-error-hint">${escapeHtml(err.hint)}`;
      if (err.doc) {
        html += `<div class="d-error-hint-doc">See: ${escapeHtml(err.doc)}</div>`;
      }
      html += '</div>';
    }

    // Atom suggestion
    if (err.suggestion) {
      html += `<div class="d-error-hint">Did you mean: <span class="d-error-atom-suggestion">${escapeHtml(err.suggestion)}</span>?</div>`;
    }

    // Stack trace
    if (err.frames && err.frames.length) {
      html += '<div class="d-error-stack">';
      for (const f of err.frames.slice(0, 8)) {
        const shortFile = f.file.replace(/^https?:\/\/[^/]+/, '');
        html += `<div class="d-error-stack-frame">`;
        html += `<span class="d-error-stack-fn">${escapeHtml(f.fn)}</span> `;
        html += `<span class="d-error-stack-file">${escapeHtml(shortFile)}</span>`;
        html += `<span class="d-error-stack-loc">:${f.line}:${f.col}</span>`;
        html += '</div>';
      }
      html += '</div>';
    }

    entry.innerHTML = html;
    el.appendChild(entry);
  }
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ─── Error Capture ──────────────────────────────────────────────
function addError(entry) {
  // Deduplicate by message
  if (errors.some(e => e.message === entry.message && e.type === entry.type)) return;
  errors.push(entry);
  renderOverlay();
}

function matchKnownPattern(message) {
  for (const p of KNOWN_PATTERNS) {
    if (p.test.test(message)) return p;
  }
  return null;
}

// Global error handler
function handleError(event) {
  const err = event.error || event.reason || {};
  const message = event.message || err.message || String(err);
  const stack = err.stack || '';

  // Skip overlay's own errors
  if (message.includes('d-error-overlay')) return;

  const pattern = matchKnownPattern(message);
  addError({
    type: 'error',
    message,
    frames: parseStack(stack),
    hint: pattern?.hint || null,
    doc: pattern?.doc || null,
  });
}

// Console.warn interceptor for atom warnings
function interceptAtomWarnings() {
  const origWarn = console.warn;
  console.warn = function (...args) {
    origWarn.apply(console, args);
    const msg = args.join(' ');
    if (msg.includes('[decantr] Unknown atom:')) {
      const atomMatch = msg.match(/Unknown atom:\s*"([^"]+)"/);
      const atomName = atomMatch ? atomMatch[1] : null;
      const suggestion = atomName ? suggestAtom(atomName) : null;
      addError({
        type: 'atom',
        message: msg.replace('[decantr] ', ''),
        hint: null,
        suggestion,
        frames: [],
      });
    }
  };
}

// Console.error interceptor
function interceptConsoleErrors() {
  const origError = console.error;
  console.error = function (...args) {
    origError.apply(console, args);
    const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
    // Skip React-style internal warnings, HMR noise
    if (msg.includes('d-error-overlay') || msg.includes('__decantr_hmr')) return;
    const pattern = matchKnownPattern(msg);
    addError({
      type: 'error',
      message: msg.length > 500 ? msg.slice(0, 500) + '...' : msg,
      frames: [],
      hint: pattern?.hint || null,
      doc: pattern?.doc || null,
    });
  };
}

// SSE error messages from dev server
function handleSSEError(data) {
  const pattern = matchKnownPattern(data.message || '');
  addError({
    type: data.severity || 'error',
    message: data.message || 'Unknown server error',
    frames: data.stack ? parseStack(data.stack) : [],
    hint: data.hint || pattern?.hint || null,
    doc: data.doc || pattern?.doc || null,
  });
}

// ─── HMR Integration ────────────────────────────────────────────
function clearOnHMR() {
  // Clear errors on successful HMR update
  errors = errors.filter(e => e.type === 'atom'); // keep atom warnings
  renderOverlay();
}

// ─── Init ───────────────────────────────────────────────────────
export function initErrorOverlay() {
  if (typeof window === 'undefined') return;
  if (!globalThis.__DECANTR_DEV__) return;

  window.addEventListener('error', handleError);
  window.addEventListener('unhandledrejection', handleError);
  interceptAtomWarnings();
  interceptConsoleErrors();

  // Expose for HMR client and SSE integration
  window.__d_error_overlay = {
    addError,
    handleSSEError,
    clear: clearOnHMR,
  };
}
