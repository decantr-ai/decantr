// @decantr/css - Framework-agnostic CSS atoms runtime

export { css, define } from './css.js';
export {
  extractCSS,
  reset,
  inject,
  injectResponsive,
  injectPseudo,
  injectContainer,
  injectGroupPeer,
  injectMediaQuery,
  getInjectedClasses,
  BREAKPOINTS,
  CQ_WIDTHS,
} from './runtime.js';
export { resolveAtomDecl } from './atoms.js';

// Animation preference helper — returns true if animations are enabled
let _animations = true;
export function getAnimations(): boolean { return _animations; }
export function setAnimations(v: boolean): void { _animations = v; }
