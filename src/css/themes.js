import { createSignal } from '../state/index.js';

/**
 * Color variable semantics (consistent across all themes):
 *   --c0: background       --c5: border
 *   --c1: primary          --c6: primary-hover
 *   --c2: surface          --c7: success
 *   --c3: foreground       --c8: warning
 *   --c4: muted            --c9: destructive
 *
 * @type {Map<string, {id:string, name:string, colors:Object, meta:Object}>}
 */
const themes = new Map();
const [_getTheme, _setTheme] = createSignal('light');

const builtins = [
  {
    id: 'light', name: 'Light',
    colors: {
      '--c0': '#ffffff', '--c1': '#3b82f6', '--c2': '#f8fafc',
      '--c3': '#0f172a', '--c4': '#64748b', '--c5': '#e2e8f0',
      '--c6': '#2563eb', '--c7': '#22c55e', '--c8': '#f59e0b', '--c9': '#ef4444'
    },
    meta: { isDark: false, contrastText: '#ffffff', surfaceAlpha: 'rgba(255,255,255,0.8)' }
  },
  {
    id: 'dark', name: 'Dark',
    colors: {
      '--c0': '#0f172a', '--c1': '#3b82f6', '--c2': '#1e293b',
      '--c3': '#f1f5f9', '--c4': '#94a3b8', '--c5': '#334155',
      '--c6': '#60a5fa', '--c7': '#4ade80', '--c8': '#fbbf24', '--c9': '#f87171'
    },
    meta: { isDark: true, contrastText: '#ffffff', surfaceAlpha: 'rgba(15,23,42,0.8)' }
  },
  {
    id: 'ai', name: 'AI',
    colors: {
      '--c0': '#0a0a1a', '--c1': '#8b5cf6', '--c2': '#1a1a2e',
      '--c3': '#e0e7ff', '--c4': '#818cf8', '--c5': '#312e81',
      '--c6': '#a78bfa', '--c7': '#34d399', '--c8': '#fbbf24', '--c9': '#f472b6'
    },
    meta: { isDark: true, contrastText: '#ffffff', surfaceAlpha: 'rgba(26,26,46,0.85)' }
  },
  {
    id: 'nature', name: 'Nature',
    colors: {
      '--c0': '#fefce8', '--c1': '#16a34a', '--c2': '#f0fdf4',
      '--c3': '#1a2e05', '--c4': '#4d7c0f', '--c5': '#d9f99d',
      '--c6': '#15803d', '--c7': '#22c55e', '--c8': '#eab308', '--c9': '#dc2626'
    },
    meta: { isDark: false, contrastText: '#ffffff', surfaceAlpha: 'rgba(240,253,244,0.8)' }
  },
  {
    id: 'pastel', name: 'Pastel',
    colors: {
      '--c0': '#fdf2f8', '--c1': '#ec4899', '--c2': '#fce7f3',
      '--c3': '#831843', '--c4': '#be185d', '--c5': '#fbcfe8',
      '--c6': '#db2777', '--c7': '#86efac', '--c8': '#fde68a', '--c9': '#fca5a5'
    },
    meta: { isDark: false, contrastText: '#ffffff', surfaceAlpha: 'rgba(252,231,243,0.8)' }
  },
  {
    id: 'spice', name: 'Spice',
    colors: {
      '--c0': '#1c1917', '--c1': '#ea580c', '--c2': '#292524',
      '--c3': '#fef3c7', '--c4': '#d97706', '--c5': '#44403c',
      '--c6': '#f97316', '--c7': '#4ade80', '--c8': '#fbbf24', '--c9': '#ef4444'
    },
    meta: { isDark: true, contrastText: '#ffffff', surfaceAlpha: 'rgba(41,37,36,0.85)' }
  },
  {
    id: 'mono', name: 'Monochromatic',
    colors: {
      '--c0': '#ffffff', '--c1': '#171717', '--c2': '#f5f5f5',
      '--c3': '#171717', '--c4': '#737373', '--c5': '#d4d4d4',
      '--c6': '#404040', '--c7': '#525252', '--c8': '#737373', '--c9': '#a3a3a3'
    },
    meta: { isDark: false, contrastText: '#ffffff', surfaceAlpha: 'rgba(245,245,245,0.8)' }
  },
  {
    id: 'lava', name: 'Hot Lava',
    colors: {
      '--c0': '#0c0a09', '--c1': '#f97316', '--c2': '#1c1410',
      '--c3': '#fef2e8', '--c4': '#a8907a', '--c5': '#3d2c20',
      '--c6': '#fb923c', '--c7': '#4ade80', '--c8': '#fbbf24', '--c9': '#ef4444'
    },
    meta: { isDark: true, contrastText: '#ffffff', surfaceAlpha: 'rgba(28,20,16,0.9)' }
  }
];

for (const t of builtins) themes.set(t.id, t);

function applyColors(colors) {
  if (typeof document === 'undefined') return;
  const el = document.documentElement;
  for (const [key, value] of Object.entries(colors)) {
    if (el.style.setProperty) el.style.setProperty(key, value);
    else el.style[key] = value;
  }
}

/**
 * @param {string} id
 */
export function setTheme(id) {
  const theme = themes.get(id);
  if (!theme) throw new Error(`Unknown theme: ${id}`);
  _setTheme(id);
  applyColors(theme.colors);
}

/** @returns {() => string} */
export function getTheme() { return _getTheme; }

/** @returns {{ isDark: boolean, contrastText: string, surfaceAlpha: string } | null} */
export function getThemeMeta() {
  const theme = themes.get(_getTheme());
  return theme ? { ...theme.meta } : null;
}

/**
 * @param {{ id: string, name: string, colors: Object, meta: Object }} theme
 */
export function registerTheme(theme) {
  themes.set(theme.id, theme);
}

/** @returns {{ id: string, name: string }[]} */
export function getThemeList() {
  return [...themes.values()].map(t => ({ id: t.id, name: t.name }));
}
