import { atomMap } from './atoms.js';
import { inject } from './runtime.js';
export { extractCSS, reset } from './runtime.js';
export { setTheme, getTheme, getThemeMeta, registerTheme, getThemeList } from './themes.js';
export { setStyle, getStyle, getStyleList, registerStyle, getActiveCSS, resetStyles, setAnimations, getAnimations } from './styles.js';

/** @type {Map<string, string>} */
const customAtoms = new Map();

/**
 * @param {...string} classes
 * @returns {string}
 */
export function css(...classes) {
  const result = [];
  for (let i = 0; i < classes.length; i++) {
    const cls = classes[i];
    if (!cls) continue;
    // Support space-separated classes in a single string
    const parts = cls.split(/\s+/);
    for (const part of parts) {
      if (!part) continue;
      const decl = atomMap.get(part) || customAtoms.get(part);
      if (decl) {
        inject(part, decl);
        result.push(part);
      } else {
        // Pass through unknown classes (user CSS)
        result.push(part);
      }
    }
  }
  return result.join(' ');
}

/**
 * @param {string} name
 * @param {string} declaration
 */
export function define(name, declaration) {
  customAtoms.set(name, declaration);
}
