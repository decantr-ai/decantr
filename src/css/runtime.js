/** @type {Set<string>} */
const injected = new Set();

/** @type {HTMLStyleElement|null} */
let styleEl = null;

function getStyleElement() {
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.setAttribute('data-decantr', '');
    document.head.appendChild(styleEl);
  }
  return styleEl;
}

/**
 * @param {string} className
 * @param {string} declaration
 */
export function inject(className, declaration) {
  if (injected.has(className)) return;
  injected.add(className);
  const style = getStyleElement();
  const rule = `.${className}{${declaration}}`;
  style.textContent = (style.textContent || '') + rule;
}

/**
 * @returns {string}
 */
export function extractCSS() {
  return styleEl ? styleEl.textContent || '' : '';
}

/**
 * @returns {Set<string>}
 */
export function getInjectedClasses() {
  return new Set(injected);
}

export function reset() {
  injected.clear();
  if (styleEl) {
    styleEl.textContent = '';
  }
}
