import { createSignal } from '../state/index.js';
import { light } from './themes/light.js';
import { dark } from './themes/dark.js';
import { retro } from './themes/retro.js';
import { hotLava } from './themes/hot-lava.js';
import { stormyAi } from './themes/stormy-ai.js';

/** @type {Map<string, Object>} */
const themes = new Map();
const [_getTheme, _setTheme] = createSignal('light');

/** @type {HTMLStyleElement|null} */
let styleEl = null;

const [_getAnimations, _setAnimations] = createSignal(true);
let animEl = null;

const ANIM_OFF_CSS = '.d-btn,.d-card,.d-input-wrap,.d-badge,.d-badge-dot,.d-modal-overlay,.d-modal-content,.d-btn-loading::after,.d-accordion-icon,.d-accordion-region{animation-duration:0.01ms !important;animation-iteration-count:1 !important;transition-duration:0.01ms !important}';

const LEGACY_MAP = {
  'ai': 'stormy-ai',
  'nature': 'light',
  'pastel': 'light',
  'spice': 'hot-lava',
  'mono': 'dark',
  'lava': 'hot-lava'
};

const builtins = [light, dark, retro, hotLava, stormyAi];
for (const t of builtins) themes.set(t.id, t);

function applyColors(colors) {
  if (typeof document === 'undefined') return;
  const el = document.documentElement;
  for (const [key, value] of Object.entries(colors)) {
    if (el.style.setProperty) el.style.setProperty(key, value);
    else el.style[key] = value;
  }
}

function applyTokens(tokens) {
  if (typeof document === 'undefined') return;
  const el = document.documentElement;
  for (const [key, value] of Object.entries(tokens)) {
    if (el.style.setProperty) el.style.setProperty(key, value);
    else el.style[key] = value;
  }
}

function getStyleElement() {
  if (!styleEl && typeof document !== 'undefined') {
    styleEl = document.createElement('style');
    styleEl.setAttribute('data-decantr-style', '');
    document.head.appendChild(styleEl);
  }
  return styleEl;
}

/**
 * @param {Object} theme
 * @returns {string}
 */
function buildCSS(theme) {
  let base = '';
  let comp = '';
  if (theme.global) base += theme.global;
  if (theme.components) {
    for (const rules of Object.values(theme.components)) {
      if (Array.isArray(rules)) comp += rules.join('');
      else comp += rules;
    }
  }
  return `@layer d.theme{${base}${comp}}`;
}

/**
 * @param {string} id
 */
export function setTheme(id) {
  // Legacy ID mapping
  if (LEGACY_MAP[id]) {
    console.warn(`[decantr] Theme "${id}" has been removed. Falling back to "${LEGACY_MAP[id]}". Update your code to use the new theme ID.`);
    id = LEGACY_MAP[id];
  }
  const theme = themes.get(id);
  if (!theme) throw new Error(`Unknown theme: ${id}`);
  _setTheme(id);
  applyColors(theme.colors);
  if (theme.tokens) applyTokens(theme.tokens);
  const el = getStyleElement();
  if (el) el.textContent = buildCSS(theme);
}

/** @returns {() => string} */
export function getTheme() { return _getTheme; }

/** @returns {{ isDark: boolean, contrastText: string, surfaceAlpha: string } | null} */
export function getThemeMeta() {
  const theme = themes.get(_getTheme());
  return theme ? { ...theme.meta } : null;
}

/**
 * @param {{ id: string, name: string, colors: Object, meta?: Object, tokens?: Object, global?: string, components?: Object }} theme
 */
export function registerTheme(theme) {
  // Fill defaults for missing optional fields
  if (!theme.meta) theme.meta = { isDark: false, contrastText: '#ffffff', surfaceAlpha: 'rgba(255,255,255,0.8)' };
  if (!theme.tokens) theme.tokens = {
    '--d-radius': '8px', '--d-radius-lg': '16px', '--d-shadow': 'none', '--d-transition': 'all 0.2s ease', '--d-pad': '1.25rem',
    '--d-font': 'Inter,"Inter Fallback",system-ui,sans-serif', '--d-font-mono': 'ui-monospace,"JetBrains Mono",monospace',
    '--d-text-xs': '0.625rem', '--d-text-sm': '0.75rem', '--d-text-base': '0.875rem', '--d-text-md': '1rem',
    '--d-text-lg': '1.125rem', '--d-text-xl': '1.25rem', '--d-text-2xl': '1.5rem', '--d-text-3xl': '2rem', '--d-text-4xl': '2.5rem',
    '--d-lh-none': '1', '--d-lh-tight': '1.1', '--d-lh-snug': '1.25', '--d-lh-normal': '1.5', '--d-lh-relaxed': '1.6', '--d-lh-loose': '1.75',
    '--d-fw-heading': '700', '--d-fw-title': '600', '--d-fw-medium': '500', '--d-ls-heading': '-0.025em',
    '--d-sp-1': '0.25rem', '--d-sp-1-5': '0.375rem', '--d-sp-2': '0.5rem', '--d-sp-2-5': '0.625rem', '--d-sp-3': '0.75rem', '--d-sp-4': '1rem', '--d-sp-5': '1.25rem',
    '--d-sp-6': '1.5rem', '--d-sp-8': '2rem', '--d-sp-10': '2.5rem', '--d-sp-12': '3rem', '--d-sp-16': '4rem'
  };
  if (!theme.global) theme.global = '';
  if (!theme.components) theme.components = {};
  themes.set(theme.id, theme);
}

/** @returns {{ id: string, name: string }[]} */
export function getThemeList() {
  return [...themes.values()].map(t => ({ id: t.id, name: t.name }));
}

/** @returns {string} */
export function getActiveCSS() {
  const theme = themes.get(_getTheme());
  return theme ? buildCSS(theme) : '';
}

export function resetStyles() {
  if (styleEl && styleEl.parentNode) styleEl.parentNode.removeChild(styleEl);
  styleEl = null;
  _setTheme('light');
  if (animEl && animEl.parentNode) animEl.parentNode.removeChild(animEl);
  animEl = null;
  _setAnimations(true);
}

export function setAnimations(enabled) {
  _setAnimations(!!enabled);
  if (typeof document === 'undefined') return;
  if (!enabled) {
    if (!animEl) {
      animEl = document.createElement('style');
      animEl.setAttribute('data-decantr-anim', '');
      document.head.appendChild(animEl);
    }
    animEl.textContent = ANIM_OFF_CSS;
  } else if (animEl) {
    animEl.textContent = '';
  }
}

export function getAnimations() { return _getAnimations; }

// Deprecated stubs — kept for backward compatibility
/** @deprecated Use setTheme() instead */
export function setStyle(id) {
  console.warn(`[decantr] setStyle() is deprecated. Styles are now part of unified themes. Use setTheme() instead.`);
}

/** @deprecated Use getTheme() instead */
export function getStyle() {
  console.warn(`[decantr] getStyle() is deprecated. Styles are now part of unified themes. Use getTheme() instead.`);
  return _getTheme;
}

/** @deprecated Use getThemeList() instead */
export function getStyleList() {
  console.warn(`[decantr] getStyleList() is deprecated. Styles are now part of unified themes. Use getThemeList() instead.`);
  return [];
}

/** @deprecated Use registerTheme() instead */
export function registerStyle(style) {
  console.warn(`[decantr] registerStyle() is deprecated. Use registerTheme() with the unified theme object instead.`);
}
