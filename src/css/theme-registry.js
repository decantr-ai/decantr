/**
 * Decantr Design System v2 — Style & Mode Registry
 * Manages style (visual personality) and mode (light/dark/auto) independently.
 * Replaces the old theme system with seed-derived, mode-aware styling.
 *
 * @module theme-registry
 */
import { createSignal, untrack } from '../state/index.js';
import { derive, densityCSS, getShapeTokens } from './derive.js';
import { componentCSS } from './components.js';
import { auradecantism } from './styles/auradecantism.js';

// ============================================================
// State
// ============================================================

/** @type {Map<string, Object>} Registered styles */
const styles = new Map();

const [_getStyleId, _setStyleId] = createSignal('auradecantism');
const [_getMode, _setMode] = createSignal('dark');
const [_getResolvedMode, _setResolvedMode] = createSignal('dark');
const [_getAnimations, _setAnimations] = createSignal(true);
const [_getShape, _setShape] = createSignal(null);
const [_getColorblind, _setColorblind] = createSignal('off');

const SHAPES = ['sharp', 'rounded', 'pill'];

/** @type {HTMLStyleElement|null} */
let styleEl = null;
let densityEl = null;
let animEl = null;
let mediaQuery = null;
let mediaHandler = null;

/** @type {Set<Function>} Mode change listeners */
const modeListeners = new Set();

const ANIM_OFF_CSS = '*{animation-duration:0.01ms !important;animation-iteration-count:1 !important;transition-duration:0.01ms !important}';

// ============================================================
// Built-in Styles
// ============================================================

const builtins = [auradecantism];
for (const s of builtins) styles.set(s.id, s);

// ============================================================
// Legacy Theme ID Mapping
// ============================================================

const LEGACY_THEME_MAP = {
  'light': { style: 'clean', mode: 'light' },
  'dark': { style: 'clean', mode: 'dark' },
  'retro': { style: 'retro', mode: 'auto' },
  'hot-lava': { style: 'clean', mode: 'dark' },
  'stormy-ai': { style: 'clean', mode: 'dark' },
  'ai': { style: 'clean', mode: 'dark' },
  'nature': { style: 'clean', mode: 'light' },
  'pastel': { style: 'clean', mode: 'light' },
  'spice': { style: 'clean', mode: 'dark' },
  'mono': { style: 'clean', mode: 'dark' },
  'lava': { style: 'clean', mode: 'dark' },
};

// ============================================================
// DOM Injection
// ============================================================

function getStyleElement() {
  if (!styleEl && typeof document !== 'undefined') {
    styleEl = document.createElement('style');
    styleEl.setAttribute('data-decantr-style', '');
    document.head.appendChild(styleEl);
  }
  return styleEl;
}

/** Apply token map to :root */
function applyTokens(tokens) {
  if (typeof document === 'undefined') return;
  const el = document.documentElement;
  for (const [key, value] of Object.entries(tokens)) {
    if (el.style.setProperty) el.style.setProperty(key, value);
    else el.style[key] = value;
  }
}

/** Clear all custom properties from :root */
function clearTokens(tokens) {
  if (typeof document === 'undefined') return;
  const el = document.documentElement;
  for (const key of Object.keys(tokens)) {
    el.style.removeProperty(key);
  }
}

// ============================================================
// Core: Apply Style + Mode
// ============================================================

/** Derive and apply all tokens for the current style + mode.
 *  Wrapped in untrack() so internal signal reads don't leak
 *  subscriptions into any calling effect (prevents infinite loops
 *  when setStyle/setMode/etc. are called from createEffect). */
function applyCurrentState() {
  untrack(() => {
    const styleId = _getStyleId();
    const style = styles.get(styleId);
    if (!style) return;

    const resolvedMode = _getResolvedMode();

    // Derive full token set
    const modeOverrides = style.overrides?.[resolvedMode] || {};
    const cbMode = _getColorblind();
    const tokens = derive(
      style.seed,
      style.personality,
      resolvedMode,
      style.typography,
      modeOverrides,
      cbMode !== 'off' ? { colorblind: cbMode } : undefined,
    );

    // Apply all tokens to :root
    applyTokens(tokens);

    // Inject density classes into d.base layer (once)
    if (!densityEl && typeof document !== 'undefined') {
      densityEl = document.createElement('style');
      densityEl.setAttribute('data-decantr-density', '');
      densityEl.textContent = `@layer d.base{${densityCSS()}}`;
      document.head.appendChild(densityEl);
    }

    // Apply shape override if set (re-apply after derive to win specificity)
    applyShape();

    // Inject shared + style-specific component CSS into d.theme layer
    const styleCSS = style.components || '';
    const el = getStyleElement();
    if (el) el.textContent = `@layer d.theme{${componentCSS}${styleCSS}}`;
  });
}

// ============================================================
// Mode System
// ============================================================

/** Resolve 'auto' mode to 'light' or 'dark' based on system preference */
function resolveAutoMode() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Set up or tear down the prefers-color-scheme listener */
function updateMediaListener() {
  // Clean up existing listener
  if (mediaQuery && mediaHandler) {
    mediaQuery.removeEventListener('change', mediaHandler);
    mediaQuery = null;
    mediaHandler = null;
  }

  if (_getMode() === 'auto' && typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaHandler = () => {
      const newMode = resolveAutoMode();
      const prev = _getResolvedMode();
      if (newMode !== prev) {
        _setResolvedMode(newMode);
        applyCurrentState();
        for (const fn of modeListeners) fn(newMode);
      }
    };
    mediaQuery.addEventListener('change', mediaHandler);
  }
}

// ============================================================
// Public API: Style
// ============================================================

/**
 * Set the visual style (personality).
 * @param {string} id - Style ID ('clean', 'retro', or custom registered style)
 */
export function setStyle(id) {
  if (!styles.has(id)) throw new Error(`[decantr] Unknown style: "${id}". Available: ${[...styles.keys()].join(', ')}`);
  _setStyleId(id);
  applyCurrentState();
}

/** @returns {() => string} Signal getter for current style ID */
export function getStyle() { return _getStyleId; }

/** @returns {{ id: string, name: string }[]} List of registered styles */
export function getStyleList() {
  return [...styles.values()].map(s => ({ id: s.id, name: s.name }));
}

/**
 * Register a custom style.
 * @param {Object} style - Style definition { id, name, seed, personality, typography?, overrides?, components? }
 */
export function registerStyle(style) {
  if (!style.id || !style.name) throw new Error('[decantr] Style must have id and name');
  if (!style.seed) throw new Error('[decantr] Style must have seed colors');
  if (!style.personality) style.personality = {};
  if (!style.overrides) style.overrides = {};
  styles.set(style.id, style);
}

/**
 * Merge a Map of plugin-provided styles into the registry.
 * Used by the plugin system to wire addon styles without individual registerStyle calls.
 * @param {Map<string, Object>} pluginStyles - Map of style id -> style definition
 */
export function mergePluginStyles(pluginStyles) {
  for (const [id, style] of pluginStyles) {
    if (!style.id || !style.name) throw new Error(`[decantr] Plugin style must have id and name (got id="${id}")`);
    if (!style.seed) throw new Error(`[decantr] Plugin style "${id}" must have seed colors`);
    if (!style.personality) style.personality = {};
    if (!style.overrides) style.overrides = {};
    styles.set(id, style);
  }
}

// ============================================================
// Public API: Mode
// ============================================================

/**
 * Set color mode.
 * @param {'light'|'dark'|'auto'} mode
 */
export function setMode(mode) {
  if (mode !== 'light' && mode !== 'dark' && mode !== 'auto') {
    throw new Error(`[decantr] Invalid mode: "${mode}". Use 'light', 'dark', or 'auto'.`);
  }
  _setMode(mode);
  const resolved = mode === 'auto' ? resolveAutoMode() : mode;
  const prev = untrack(() => _getResolvedMode());
  _setResolvedMode(resolved);
  untrack(() => updateMediaListener());
  applyCurrentState();
  if (resolved !== prev) {
    for (const fn of modeListeners) fn(resolved);
  }
}

/** @returns {() => string} Signal getter for current mode setting ('light'|'dark'|'auto') */
export function getMode() { return _getMode; }

/** @returns {'light'|'dark'} Resolved mode (never 'auto') */
export function getResolvedMode() { return _getResolvedMode(); }

/**
 * Register a callback for mode changes (fires when resolved mode changes).
 * @param {Function} fn - Callback receiving the new resolved mode ('light'|'dark')
 * @returns {Function} Unsubscribe function
 */
export function onModeChange(fn) {
  modeListeners.add(fn);
  return () => modeListeners.delete(fn);
}

// ============================================================
// Public API: Theme (convenience / backward compat)
// ============================================================

/**
 * Set theme — convenience API combining setStyle + setMode.
 * @param {string} id - Style ID or legacy theme ID
 * @param {'light'|'dark'|'auto'} [mode='auto'] - Color mode
 */
export function setTheme(id, mode) {
  // Handle legacy theme IDs
  const legacy = LEGACY_THEME_MAP[id];
  if (legacy && !styles.has(id)) {
    const targetStyle = legacy.style;
    const targetMode = mode || legacy.mode;
    if (_getStyleId() !== targetStyle) _setStyleId(targetStyle);
    setMode(targetMode);
    return;
  }

  // New-style: id is a style, mode defaults to 'auto'
  if (styles.has(id)) {
    _setStyleId(id);
    setMode(mode || 'auto');
  } else {
    throw new Error(`[decantr] Unknown theme/style: "${id}". Available: ${[...styles.keys()].join(', ')}`);
  }
}

/** @returns {() => string} Signal getter for current style ID (backward compat alias) */
export function getTheme() { return _getStyleId; }

/**
 * Get metadata about current style + mode.
 * @returns {{ isDark: boolean, style: string, mode: string, resolvedMode: string }}
 */
export function getThemeMeta() {
  return {
    isDark: _getResolvedMode() === 'dark',
    style: _getStyleId(),
    mode: _getMode(),
    resolvedMode: _getResolvedMode(),
  };
}

/** @returns {{ id: string, name: string }[]} List of registered styles */
export function getThemeList() { return getStyleList(); }

/**
 * Legacy registerTheme — wraps registerStyle.
 * @param {Object} theme - Old theme object or new style object
 */
export function registerTheme(theme) {
  // If it has seed + personality, it's a new-style definition
  if (theme.seed) {
    registerStyle(theme);
    return;
  }
  // Legacy theme object — wrap it as a minimal style
  console.warn(`[decantr] registerTheme() with old format is deprecated. Use registerStyle() with seed + personality.`);
  registerStyle({
    id: theme.id,
    name: theme.name || theme.id,
    seed: {},
    personality: {},
    components: theme.global || '',
  });
}

// ============================================================
// Public API: Animations
// ============================================================

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

// ============================================================
// Public API: Shape
// ============================================================

/**
 * Set the shape (border-radius preset), independent of style.
 * @param {string|null} shape - 'sharp', 'rounded', 'pill', or null for style default
 */
export function setShape(shape) {
  if (shape !== null && !SHAPES.includes(shape)) {
    throw new Error(`[decantr] Invalid shape: "${shape}". Use 'sharp', 'rounded', 'pill', or null for style default.`);
  }
  _setShape(shape);
  // Re-derive to restore style defaults, then applyShape() overrides if shape is set
  applyCurrentState();
}

/** @returns {() => string|null} Signal getter for current shape (null = style default) */
export function getShape() { return _getShape; }

/** @returns {{ id: string, label: string }[]} List of available shape presets */
export function getShapeList() {
  return SHAPES.map(s => ({ id: s, label: s.charAt(0).toUpperCase() + s.slice(1) }));
}

/** Apply shape tokens to :root inline styles (overrides derive output) */
function applyShape() {
  if (typeof document === 'undefined') return;
  const shape = _getShape();
  if (!shape) return; // null = style default, already set by derive()
  const tokens = getShapeTokens(shape);
  if (tokens) applyTokens(tokens);
}

// ============================================================
// Public API: Colorblind Mode
// ============================================================

const CB_MODES = ['off', 'protanopia', 'deuteranopia', 'tritanopia'];

/**
 * Set colorblind mode. Transforms seed colors and chart palettes for CVD safety.
 * Orthogonal to style × mode × shape — all four axes are independent.
 * @param {'off'|'protanopia'|'deuteranopia'|'tritanopia'} type
 */
export function setColorblindMode(type) {
  if (!CB_MODES.includes(type)) {
    throw new Error(`[decantr] Invalid colorblind mode: "${type}". Use ${CB_MODES.map(m => `'${m}'`).join(', ')}.`);
  }
  _setColorblind(type);
  applyCurrentState();
}

/** @returns {() => string} Signal getter for current colorblind mode */
export function getColorblindMode() { return _getColorblind; }

// ============================================================
// Public API: CSS Extraction & Reset
// ============================================================

/** @returns {string} Active theme layer CSS */
export function getActiveCSS() {
  const style = styles.get(_getStyleId());
  return style ? `@layer d.theme{${componentCSS}${style.components || ''}}` : '';
}

export function resetStyles() {
  if (styleEl && styleEl.parentNode) styleEl.parentNode.removeChild(styleEl);
  styleEl = null;
  if (densityEl && densityEl.parentNode) densityEl.parentNode.removeChild(densityEl);
  densityEl = null;
  if (animEl && animEl.parentNode) animEl.parentNode.removeChild(animEl);
  animEl = null;
  if (mediaQuery && mediaHandler) {
    mediaQuery.removeEventListener('change', mediaHandler);
    mediaQuery = null;
    mediaHandler = null;
  }
  modeListeners.clear();
  _setStyleId('auradecantism');
  _setMode('dark');
  _setResolvedMode('dark');
  _setAnimations(true);
  _setShape(null);
  _setColorblind('off');
}
