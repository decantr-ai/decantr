import { component } from '../runtime/component.js';
import { EssenceProvider } from '../essence/provider.js';
import type { EssenceV3 } from '@decantr/essence-spec';
import type { Child } from '../types.js';

export interface EssenceAppProps {
  essence: EssenceV3;
  [key: string]: unknown;
}

/**
 * Top-level convenience component that wraps children in an EssenceProvider.
 * Provides the full essence context to all descendant compose() calls.
 */
export const EssenceApp = component<EssenceAppProps>((props, ...children) => {
  return EssenceProvider({ essence: props.essence }, ...children);
});
