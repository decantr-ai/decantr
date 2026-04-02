import type { GuardMode, DensityLevel, ThemeStyle, ThemeMode, ThemeShape } from '@decantr/essence-spec';
import { EssenceContext, type EssenceContextValue } from './context.js';

export function useEssence(): EssenceContextValue {
  return EssenceContext.consume();
}

export function useDNA(): {
  style: ThemeStyle | string;
  mode: ThemeMode;
  shape: ThemeShape | string;
  density: DensityLevel;
  contentGap: string;
  personality: string[];
} {
  const ctx = EssenceContext.consume();
  return {
    style: ctx.style,
    mode: ctx.mode,
    shape: ctx.shape,
    density: ctx.density,
    contentGap: ctx.contentGap,
    personality: ctx.personality,
  };
}

export function useDensity(): DensityLevel {
  return EssenceContext.consume().density;
}

export function useGuardMode(): GuardMode {
  return EssenceContext.consume().guardMode;
}
