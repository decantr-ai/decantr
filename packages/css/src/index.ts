// @decantr/css - Framework-agnostic CSS atoms runtime

export { resolveAtomDecl } from './atoms.js';
export { css, define } from './css.js';
export {
  BREAKPOINTS,
  CQ_WIDTHS,
  extractCSS,
  getInjectedClasses,
  inject,
  injectContainer,
  injectGroupPeer,
  injectMediaQuery,
  injectPseudo,
  injectResponsive,
  injectResponsiveMax,
  injectResponsiveMaxPseudo,
  injectResponsivePseudo,
  reset,
} from './runtime.js';

// Animation preference helper — returns true if animations are enabled
let _animations = true;
export function getAnimations(): boolean {
  return _animations;
}
export function setAnimations(v: boolean): void {
  _animations = v;
}

// Theme stub for optional consumers that want a shared current-theme pointer.
// The registry/control-plane packages do not own a full theme runtime here.
let _themeId: string | null = null;
export function getTheme(): string | null {
  return _themeId;
}
export function setTheme(id: string | null): void {
  _themeId = id;
}
