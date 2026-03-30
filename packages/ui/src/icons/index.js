/**
 * Icon data registry — internal API for icon path lookup.
 * Essential icons (~50) are always available.
 * Additional icons added via registerIcon() or bulk-imported via tools/icons.js.
 */
import { ESSENTIAL } from './essential.js';

const icons = new Map(Object.entries(ESSENTIAL));

/**
 * Get SVG inner content for an icon by name.
 * @param {string} name - Icon name (kebab-case)
 * @returns {string|null}
 */
export function getIconPath(name) {
  return icons.get(name) || null;
}

/**
 * Register a custom icon (or override an existing one).
 * @param {string} name - Icon name
 * @param {string} pathData - SVG inner content (e.g. '<path d="..."/>')
 */
export function registerIcon(name, pathData) {
  icons.set(name, pathData);
}

/**
 * Register multiple icons at once.
 * @param {Object<string, string>} iconMap - { name: svgInnerContent }
 */
export function registerIcons(iconMap) {
  for (const [k, v] of Object.entries(iconMap)) {
    icons.set(k, v);
  }
}

/**
 * Check if an icon is available.
 * @param {string} name
 * @returns {boolean}
 */
export function hasIcon(name) {
  return icons.has(name);
}

/**
 * Get all currently available icon names.
 * @returns {string[]}
 */
export function getIconNames() {
  return [...icons.keys()];
}
