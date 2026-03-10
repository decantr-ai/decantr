import { atomMap } from './atoms.js';
import { inject, injectResponsive, injectContainer, BREAKPOINTS, CQ_WIDTHS } from './runtime.js';
export { extractCSS, reset, BREAKPOINTS, CQ_WIDTHS } from './runtime.js';
export {
  setTheme, getTheme, getThemeMeta, registerTheme, getThemeList,
  getActiveCSS, resetStyles, setAnimations, getAnimations,
  setStyle, getStyle, getStyleList, registerStyle,
  setMode, getMode, getResolvedMode, onModeChange
} from './theme-registry.js';

/** @type {Map<string, string>} */
const customAtoms = new Map();

/** Regex to detect responsive prefix: _sm:, _md:, _lg:, _xl: */
const BP_RE = /^_(sm|md|lg|xl):(.+)$/;

/** Regex to detect container query prefix: _cq320:, _cq480:, _cq640:, _cq768:, _cq1024: */
const CQ_RE = /^_cq(\d+):(.+)$/;

/** Valid container query widths as a Set for fast lookup */
const CQ_SET = new Set(CQ_WIDTHS);

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
      // Check for responsive prefix: _sm:gc3 → atom _gc3 at breakpoint sm
      const bpMatch = part.match(BP_RE);
      if (bpMatch) {
        const [, bp, atomName] = bpMatch;
        const decl = atomMap.get(`_${atomName}`) || customAtoms.get(`_${atomName}`);
        if (decl) {
          injectResponsive(part, decl, bp);
          result.push(part);
        } else {
          result.push(part);
        }
        continue;
      }
      // Check for container query prefix: _cq640:gc3 → atom _gc3 at container min-width 640px
      const cqMatch = part.match(CQ_RE);
      if (cqMatch) {
        const width = Number(cqMatch[1]);
        const atomName = cqMatch[2];
        if (CQ_SET.has(width)) {
          const decl = atomMap.get(`_${atomName}`) || customAtoms.get(`_${atomName}`);
          if (decl) {
            injectContainer(part, decl, width);
            result.push(part);
          } else {
            result.push(part);
          }
        } else {
          result.push(part);
        }
        continue;
      }
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

/**
 * Sanitizes a string for safe use in HTML attributes.
 * Escapes <, >, ", ', & characters.
 * @param {string} str
 * @returns {string}
 */
export function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
}
