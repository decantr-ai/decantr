/**
 * Explorer CSS — single source of truth for all `de-*` content styles.
 * Follows the injectBase() pattern from src/components/_base.js.
 *
 * Shell-specific CSS (header, sidebar, HUD, search modal, viewport sim)
 * remains in workbench/public/index.html — it is not shared.
 */

let injected = false;

const EXPLORER_CSS = [
  // ── Content tokens ─────────────────────────────────────────────
  ':root{',
    '--de-swatch-size:2rem;',
    '--de-motion-box-size:3rem;',
    '--de-spacing-bar-h:1rem;',
    '--de-decorator-preview-w:200px;',
    '--de-spec-desc-max-w:300px;',
    '--de-decorator-preview-min-h:3rem;',
    '--de-surface-card-min-h:5rem;',
    '--de-card-grid-min:200px;',
    '--de-token-grid-min:200px;',
    '--de-atom-grid-min:180px;',
    '--de-chart-grid-min:400px;',
    '--de-chart-card-min-h:280px;',
    '--de-icon-grid-min:88px;',
    '--de-showcase-grid-min:160px;',
    '--de-showcase-grid-md-min:320px;',
    '--de-type-label-w:8rem;',
    '--de-spacing-label-w:5rem;',
    '--de-hover-lift:-1px;',
    '--de-shell-rail-w:64px;',
    // Theme Studio tokens
    '--de-ts-seed-grid-min:150px;',
    '--de-ts-contrast-grid-min:280px;',
    '--de-ts-preview-grid-min:200px;',
    '--de-ts-label-w:6rem;',
    '--de-ts-token-name-w:10rem;',
    '--de-ts-export-max-h:24rem;',
    '--de-ts-section-max-h:32rem;',
  '}',

  // ── Demo box ───────────────────────────────────────────────────
  '.de-demo-box{padding:var(--d-sp-6);border:1px solid var(--d-border);border-radius:var(--d-radius-panel);background:var(--d-surface-0)}',
  '.de-decorator-preview{width:var(--de-decorator-preview-w);flex-shrink:0;min-height:var(--de-decorator-preview-min-h);display:flex;align-items:center;justify-content:center}',

  // ── Example cards ──────────────────────────────────────────────
  '.de-example-card{display:flex;align-items:center;gap:var(--d-sp-4);padding:var(--d-sp-4);border:1px solid var(--d-border);border-radius:var(--d-radius-panel);background:var(--d-surface-0)}',
  '.de-example-demo{flex:1;min-width:0;max-height:400px;overflow:auto}',
  '.de-example-meta{flex:1;min-width:0}',

  // ── Card grid ──────────────────────────────────────────────────
  '.de-card-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(var(--de-card-grid-min),1fr));gap:var(--d-sp-3)}',
  '.de-card-item{padding:var(--d-sp-3);border-radius:var(--d-radius-panel);border:1px solid var(--d-border);background:var(--d-surface-0);cursor:pointer;transition:border-color var(--d-duration-fast) ease,transform var(--d-duration-fast) ease}',
  '.de-card-item:hover{border-color:var(--d-primary);transform:translateY(var(--de-hover-lift))}',

  // ── Adaptive showcase grids ────────────────────────────────────
  '.de-showcase-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(var(--de-showcase-grid-min),1fr));gap:var(--d-sp-3);align-items:start}',
  '.de-showcase-grid-md{display:grid;grid-template-columns:repeat(auto-fill,minmax(var(--de-showcase-grid-md-min),1fr));gap:var(--d-sp-4);align-items:start}',
  '.de-showcase-stack{display:flex;flex-direction:column;gap:var(--d-sp-4);max-height:600px;overflow-y:auto}',
  '.de-specimen{display:flex;flex-direction:column;align-items:center;gap:var(--d-sp-1)}',
  '.de-specimen-label{font-size:var(--d-text-xs);color:var(--d-muted)}',

  // ── Spec table ─────────────────────────────────────────────────
  '.de-spec-table-wrap{overflow-x:auto}',
  '.de-spec-table{width:100%;border-collapse:collapse;font-size:var(--d-text-xs)}',
  '.de-spec-table th{text-align:left;padding:var(--d-sp-2) var(--d-sp-3);border-bottom:2px solid var(--d-border);font-weight:var(--d-fw-title);color:var(--d-fg);font-size:var(--d-text-xs);text-transform:uppercase;letter-spacing:var(--d-ls-caps)}',
  '.de-spec-table td{padding:var(--d-sp-2) var(--d-sp-3);border-bottom:1px solid var(--d-border);color:var(--d-fg);vertical-align:top}',
  '.de-spec-name code{font-weight:var(--d-fw-title);color:var(--d-primary);font-size:var(--d-text-xs)}',
  '.de-spec-type code{color:var(--d-accent);font-size:var(--d-text-xs)}',
  '.de-spec-default{color:var(--d-muted);font-size:var(--d-text-xs)}',
  '.de-spec-desc{color:var(--d-muted-fg);font-size:var(--d-text-xs);max-width:var(--de-spec-desc-max-w)}',

  // ── Token inspector ────────────────────────────────────────────
  '.de-section-block{display:flex;flex-direction:column;gap:var(--d-sp-4);margin-bottom:var(--d-sp-8)}',
  '.de-section-title{font-size:var(--d-text-lg);font-weight:var(--d-fw-title);color:var(--d-fg);margin-bottom:var(--d-sp-3)}',
  '.de-token-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(var(--de-token-grid-min),1fr));gap:var(--d-sp-3)}',
  '.de-swatch{display:flex;align-items:center;gap:var(--d-sp-2);padding:var(--d-sp-2);border-radius:var(--d-radius-panel);border:1px solid var(--d-border);background:var(--d-surface-0)}',
  '.de-swatch-color{width:var(--de-swatch-size);height:var(--de-swatch-size);border-radius:var(--d-radius);border:1px solid var(--d-border);flex-shrink:0}',
  '.de-swatch-label{font-size:var(--d-text-sm);color:var(--d-fg);font-weight:var(--d-fw-medium)}',
  '.de-swatch-value{font-size:var(--d-text-xs);color:var(--d-muted);font-family:var(--d-font-mono)}',
  '.de-surface-card{padding:var(--d-sp-4);border-radius:var(--d-radius-panel);text-align:center;font-size:var(--d-text-xs);min-height:var(--de-surface-card-min-h);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:var(--d-sp-1)}',
  '.de-type-sample{padding:var(--d-sp-1-5) 0;border-bottom:1px solid var(--d-border);display:flex;align-items:baseline;gap:var(--d-sp-4)}',
  '.de-type-label{font-size:var(--d-text-xs);color:var(--d-muted);font-family:var(--d-font-mono);min-width:var(--de-type-label-w);flex-shrink:0}',
  '.de-spacing-row{display:flex;align-items:center;gap:var(--d-sp-3);padding:var(--d-sp-1) 0}',
  '.de-spacing-bar{height:var(--de-spacing-bar-h);background:var(--d-primary-subtle);border:1px solid var(--d-primary-border);border-radius:var(--d-radius-sm)}',
  '.de-spacing-label{font-size:var(--d-text-xs);color:var(--d-muted);font-family:var(--d-font-mono);min-width:var(--de-spacing-label-w)}',
  '.de-elevation-box{padding:var(--d-sp-6);border-radius:var(--d-radius-panel);background:var(--d-surface-1);border:1px solid var(--d-border);text-align:center;font-size:var(--d-text-xs);color:var(--d-muted)}',
  '.de-motion-box{width:var(--de-motion-box-size);height:var(--de-motion-box-size);border-radius:var(--d-radius);background:var(--d-primary);cursor:pointer}',
  '.de-motion-box:hover{transform:scale(1.3)}',

  // ── Atom explorer ──────────────────────────────────────────────
  '.de-atom-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(var(--de-atom-grid-min),1fr));gap:var(--d-sp-3)}',
  '.de-atom-card{padding:var(--d-sp-3);border:1px solid var(--d-border);border-radius:var(--d-radius-panel);background:var(--d-surface-0)}',
  '.de-atom-name{display:block;font-size:var(--d-text-sm);font-weight:var(--d-fw-title);color:var(--d-primary);margin-bottom:var(--d-sp-1)}',
  '.de-atom-hint{display:block;font-size:var(--d-text-xs);color:var(--d-muted-fg);font-family:var(--d-font-mono);margin-bottom:var(--d-sp-2);opacity:0.7}',
  '.de-atom-card:hover{border-color:var(--d-primary);transform:translateY(var(--de-hover-lift))}',
  '.de-atom-preview{border-radius:var(--d-radius-inner);overflow:hidden}',

  // ── Icon explorer ──────────────────────────────────────────────
  '.de-icon-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(var(--de-icon-grid-min),1fr));gap:var(--d-sp-2)}',
  '.de-icon-cell{display:flex;flex-direction:column;align-items:center;gap:var(--d-sp-1-5);padding:var(--d-sp-3);border:1px solid var(--d-border);border-radius:var(--d-radius-panel);background:var(--d-surface-0);cursor:pointer;transition:border-color var(--d-duration-fast) ease,transform var(--d-duration-fast) ease}',
  '.de-icon-cell:hover{border-color:var(--d-primary);transform:translateY(var(--de-hover-lift))}',
  '.de-icon-cell .d-i{color:var(--d-fg)}',
  '.de-icon-cell-name{font-size:var(--d-text-xs);color:var(--d-muted);text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}',
  '.de-icon-cell.de-structural{border-color:var(--d-primary-border)}',
  '.de-icon-preview-sizes{display:flex;align-items:flex-end;gap:var(--d-sp-6)}',
  '.de-icon-preview-size{display:flex;flex-direction:column;align-items:center;gap:var(--d-sp-2)}',
  '.de-icon-preview-label{font-size:var(--d-text-xs);color:var(--d-muted);font-family:var(--d-font-mono)}',
  '.de-icon-code{padding:var(--d-sp-3);background:var(--d-surface-1);border:1px solid var(--d-border);border-radius:var(--d-radius-panel);font-family:var(--d-font-mono);font-size:var(--d-text-sm);color:var(--d-fg);overflow-x:auto;white-space:pre-wrap;word-break:break-all}',

  // ── Chart showcase ─────────────────────────────────────────────
  '.de-chart-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(var(--de-chart-grid-min),1fr));gap:var(--d-sp-4)}',
  '.de-chart-card{border:1px solid var(--d-border);border-radius:var(--d-radius-panel);background:var(--d-surface-0);overflow:hidden;transition:border-color var(--d-duration-fast) ease}',
  '.de-chart-card:hover{border-color:var(--d-primary)}',
  '.de-chart-demo{padding:var(--d-sp-4);min-height:var(--de-chart-card-min-h)}',
  '.de-chart-meta{padding:var(--d-sp-3) var(--d-sp-4);border-top:1px solid var(--d-border)}',

  // ── Theme Studio / Tools ───────────────────────────────────────
  '.de-ts-toolbar{display:flex;flex-wrap:wrap;gap:var(--d-sp-3);align-items:center;padding-bottom:var(--d-sp-4);border-bottom:var(--d-border-width) var(--d-border-style) var(--d-border);margin-bottom:var(--d-sp-4)}',
  '.de-ts-seed-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(var(--de-ts-seed-grid-min),1fr));gap:var(--d-sp-3)}',
  '.de-ts-seed-well{display:flex;flex-direction:column;gap:var(--d-sp-2)}',
  '.de-ts-seed-swatch{width:100%;aspect-ratio:1;border-radius:var(--d-radius-panel);border:var(--d-border-width) var(--d-border-style) var(--d-border)}',
  '.de-ts-seed-label{font-size:var(--d-text-xs);font-weight:var(--d-fw-title);color:var(--d-muted-fg);text-transform:capitalize}',
  '.de-ts-seed-hex{font-size:var(--d-text-xs);font-family:var(--d-font-mono);color:var(--d-muted)}',
  '.de-ts-personality-row{display:flex;align-items:center;gap:var(--d-sp-4);padding:var(--d-sp-3) 0;border-bottom:var(--d-border-width) var(--d-border-style) var(--d-border)}',
  '.de-ts-personality-label{min-width:var(--de-ts-label-w);font-weight:var(--d-fw-title);font-size:var(--d-text-sm);color:var(--d-fg)}',
  '.de-ts-contrast-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(var(--de-ts-contrast-grid-min),1fr));gap:var(--d-sp-3)}',
  '.de-ts-contrast-card{display:flex;align-items:center;gap:var(--d-sp-3);padding:var(--d-sp-3);background:var(--d-surface-0);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel)}',
  '.de-ts-contrast-swatch{width:var(--d-sp-6);height:var(--d-sp-6);border-radius:var(--d-radius-sm);border:var(--d-border-width) var(--d-border-style) var(--d-border);flex-shrink:0}',
  '.de-ts-contrast-info{display:flex;flex-direction:column;gap:var(--d-sp-0-5);font-size:var(--d-text-xs)}',
  '.de-ts-contrast-label{font-family:var(--d-font-mono);color:var(--d-muted-fg)}',
  '.de-ts-contrast-ratio{font-weight:var(--d-fw-title)}',
  '.de-ts-preview-strip{display:grid;grid-template-columns:repeat(auto-fill,minmax(var(--de-ts-preview-grid-min),1fr));gap:var(--d-sp-4)}',
  '.de-ts-preview-cell{display:flex;flex-direction:column;gap:var(--d-sp-3);padding:var(--d-sp-4);background:var(--d-surface-0);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel)}',
  '.de-ts-preview-label{font-size:var(--d-text-xs);color:var(--d-muted);font-weight:var(--d-fw-title)}',
  '.de-ts-token-section{display:flex;flex-direction:column;gap:var(--d-sp-2)}',
  '.de-ts-token-row{display:flex;align-items:center;gap:var(--d-sp-2);font-size:var(--d-text-xs);font-family:var(--d-font-mono)}',
  '.de-ts-token-swatch{width:var(--d-sp-5);height:var(--d-sp-5);border-radius:var(--d-radius-sm);border:var(--d-border-width) var(--d-border-style) var(--d-border);flex-shrink:0}',
  '.de-ts-token-name{color:var(--d-muted-fg);min-width:var(--de-ts-token-name-w)}',
  '.de-ts-token-value{color:var(--d-fg)}',
  '.de-ts-export-code{padding:var(--d-sp-4);background:var(--d-surface-1);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-panel);font-family:var(--d-font-mono);font-size:var(--d-text-sm);color:var(--d-fg);overflow-x:auto;white-space:pre-wrap;word-break:break-all;max-height:var(--de-ts-export-max-h);overflow-y:auto}',

  // ── Reduced motion ─────────────────────────────────────────────
  '@media (prefers-reduced-motion:reduce){.de-card-item{transition:none!important}}'
].join('\n');

export function injectExplorerCSS() {
  if (injected) return;
  if (typeof document === 'undefined') return;
  injected = true;
  let el = document.querySelector('[data-decantr-explorer]');
  if (!el) {
    el = document.createElement('style');
    el.setAttribute('data-decantr-explorer', '');
    document.head.appendChild(el);
  }
  el.textContent = `@layer d.user{${EXPLORER_CSS}}`;
}

export function resetExplorerCSS() { injected = false; }
