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

// Theme stub — @decantr/ui-chart imports getTheme from @decantr/css
// The actual theme registry lives in @decantr/ui/css (theme-registry.js)
// This stub satisfies the import for environments where the full UI package isn't loaded
let _themeId: string | null = null;
export function getTheme(): string | null { return _themeId; }
export function setTheme(id: string | null): void { _themeId = id; }
