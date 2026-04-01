import { getPatternRenderer, fallbackRenderer } from './pattern-renderer.js';
import { useDNA } from '../essence/hooks.js';

export interface ComposeOptions {
  props?: Record<string, unknown>;
  preset?: string;
  slots?: Record<string, () => HTMLElement>;
}

/**
 * Render a single pattern by ID using the current DNA context.
 * Must be called inside an EssenceProvider (or reactive root with EssenceContext).
 */
export function compose(patternId: string, options?: ComposeOptions): HTMLElement {
  const dna = useDNA();
  const renderer = getPatternRenderer(patternId);

  if (!renderer) {
    return fallbackRenderer(patternId);
  }

  return renderer({
    dna: {
      style: dna.style as string,
      mode: dna.mode as string,
      shape: dna.shape as string,
      density: dna.density as string,
      contentGap: dna.contentGap,
    },
    props: options?.props || {},
    slots: options?.slots || {},
  });
}
