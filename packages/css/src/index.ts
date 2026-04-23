// @decantr/css - Framework-agnostic CSS atoms runtime

export { css, define } from './css.js';
export {
  extractCSS,
  reset,
  inject,
  injectResponsive,
  injectResponsiveMax,
  injectResponsivePseudo,
  injectResponsiveMaxPseudo,
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

// Theme stub for optional consumers that want a shared current-theme pointer.
// The registry/control-plane packages do not own a full theme runtime here.
let _themeId: string | null = null;
export function getTheme(): string | null { return _themeId; }
export function setTheme(id: string | null): void { _themeId = id; }
