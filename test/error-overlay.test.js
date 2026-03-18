import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const overlayPath = resolve(__dirname, '..', 'src', 'dev', 'error-overlay.js');

describe('Error Overlay', () => {
  it('exports initErrorOverlay function', async () => {
    const source = await readFile(overlayPath, 'utf-8');
    assert.ok(source.includes('export function initErrorOverlay'));
  });

  it('defines KNOWN_PATTERNS with getter error', async () => {
    const source = await readFile(overlayPath, 'utf-8');
    assert.ok(source.includes('getter is not a function'));
  });

  it('defines KNOWN_PATTERNS with module resolution error', async () => {
    const source = await readFile(overlayPath, 'utf-8');
    assert.ok(source.includes('Failed to resolve module'));
  });

  it('includes atom typo suggestion via levenshtein', async () => {
    const source = await readFile(overlayPath, 'utf-8');
    assert.ok(source.includes('function levenshtein'));
    assert.ok(source.includes('function suggestAtom'));
  });

  it('includes common atoms for suggestion matching', async () => {
    const source = await readFile(overlayPath, 'utf-8');
    assert.ok(source.includes("'_flex'"));
    assert.ok(source.includes("'_bgmuted'"));
    assert.ok(source.includes("'_fgprimary'"));
    assert.ok(source.includes("'_heading4'"));
  });

  it('handles SSE error messages', async () => {
    const source = await readFile(overlayPath, 'utf-8');
    assert.ok(source.includes('function handleSSEError'));
  });

  it('exposes window.__d_error_overlay interface', async () => {
    const source = await readFile(overlayPath, 'utf-8');
    assert.ok(source.includes('window.__d_error_overlay'));
    assert.ok(source.includes('addError'));
    assert.ok(source.includes('handleSSEError'));
    assert.ok(source.includes('clear'));
  });

  it('captures unhandled rejections', async () => {
    const source = await readFile(overlayPath, 'utf-8');
    assert.ok(source.includes("'unhandledrejection'"));
  });

  it('intercepts console.warn for atom warnings', async () => {
    const source = await readFile(overlayPath, 'utf-8');
    assert.ok(source.includes('function interceptAtomWarnings'));
    assert.ok(source.includes('[decantr] Unknown atom:'));
  });

  it('intercepts console.error', async () => {
    const source = await readFile(overlayPath, 'utf-8');
    assert.ok(source.includes('function interceptConsoleErrors'));
  });

  it('guards against non-browser environments', async () => {
    const source = await readFile(overlayPath, 'utf-8');
    assert.ok(source.includes("typeof window === 'undefined'"));
    assert.ok(source.includes('__DECANTR_DEV__'));
  });

  it('clears non-atom errors on HMR', async () => {
    const source = await readFile(overlayPath, 'utf-8');
    assert.ok(source.includes('function clearOnHMR'));
    assert.ok(source.includes("e.type === 'atom'"));
  });

  it('deduplicates errors by message', async () => {
    const source = await readFile(overlayPath, 'utf-8');
    assert.ok(source.includes('e.message === entry.message'));
  });

  it('parses stack traces', async () => {
    const source = await readFile(overlayPath, 'utf-8');
    assert.ok(source.includes('function parseStack'));
  });

  it('escapes HTML in error messages', async () => {
    const source = await readFile(overlayPath, 'utf-8');
    assert.ok(source.includes('function escapeHtml'));
    assert.ok(source.includes('&amp;'));
    assert.ok(source.includes('&lt;'));
  });
});

describe('Dev Server Overlay Integration', () => {
  it('dev server includes error overlay script injection', async () => {
    const serverSource = await readFile(resolve(__dirname, '..', 'tools', 'dev-server.js'), 'utf-8');
    assert.ok(serverSource.includes('ERROR_OVERLAY_SCRIPT'));
    assert.ok(serverSource.includes('error-overlay.js'));
  });

  it('dev server HMR client handles error SSE type', async () => {
    const serverSource = await readFile(resolve(__dirname, '..', 'tools', 'dev-server.js'), 'utf-8');
    assert.ok(serverSource.includes("d.type === 'error'"));
    assert.ok(serverSource.includes("d.type === 'warning'"));
    assert.ok(serverSource.includes('handleSSEError'));
  });

  it('dev server pushes file serve errors via SSE', async () => {
    const serverSource = await readFile(resolve(__dirname, '..', 'tools', 'dev-server.js'), 'utf-8');
    assert.ok(serverSource.includes('Push error to overlay via SSE'));
    assert.ok(serverSource.includes('errorPayload'));
  });

  it('HMR client clears overlay on successful updates', async () => {
    const serverSource = await readFile(resolve(__dirname, '..', 'tools', 'dev-server.js'), 'utf-8');
    // Should clear on css-tokens, css-components, and hmr success
    const clearCount = (serverSource.match(/overlay\(\)\.clear\(\)/g) || []).length;
    assert.ok(clearCount >= 3, `Expected at least 3 overlay().clear() calls, got ${clearCount}`);
  });

  it('HMR client shows error on module import failure instead of reload', async () => {
    const serverSource = await readFile(resolve(__dirname, '..', 'tools', 'dev-server.js'), 'utf-8');
    assert.ok(serverSource.includes('HMR module load failed'));
  });
});
