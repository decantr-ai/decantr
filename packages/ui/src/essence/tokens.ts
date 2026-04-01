import { setStyle, setMode, setShape } from '../css/theme-registry.js';
import type { EssenceContextValue } from './context.js';

export function applyTokens(ctx: EssenceContextValue): void {
  setStyle(ctx.style);
  setMode(ctx.mode);
  if (ctx.shape) setShape(ctx.shape);
}
