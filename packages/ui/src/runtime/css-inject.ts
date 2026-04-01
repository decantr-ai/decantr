/**
 * Per-component CSS injection utility.
 * Each component registers its structural CSS once on first render.
 * Replaces the _base.js monolith pattern.
 */

const injected = new Set<string>();

/**
 * Inject CSS for a component, idempotent — only injects once per component ID.
 * CSS is injected into a @layer d.base style element.
 * @param id — unique component identifier (e.g., 'button', 'modal')
 * @param css — the CSS string to inject
 */
export function injectCSS(id: string, css: string): void {
  if (injected.has(id)) return;
  injected.add(id);

  if (typeof document === 'undefined') return;

  let styleEl = document.querySelector('style[data-decantr-components]') as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.setAttribute('data-decantr-components', '');
    document.head.appendChild(styleEl);
  }

  styleEl.textContent += `/* ${id} */\n${css}\n`;
}

/**
 * Check if a component's CSS has been injected.
 */
export function isInjected(id: string): boolean {
  return injected.has(id);
}

/**
 * Reset all injected CSS (for testing).
 */
export function resetCSS(): void {
  injected.clear();
  if (typeof document !== 'undefined') {
    const el = document.querySelector('style[data-decantr-components]');
    if (el) el.textContent = '';
  }
}
