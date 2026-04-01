import { component } from '../runtime/component.js';
import { h } from '../runtime/index.js';
import type { EssenceV3, GuardContext } from '@decantr/essence-spec';
import { evaluateGuard } from '@decantr/essence-spec';
import { EssenceContext, type EssenceContextValue } from './context.js';
import { applyTokens } from './tokens.js';
import type { Child } from '../types.js';

export interface EssenceProviderProps {
  [key: string]: unknown;
  /** Full essence spec to provide */
  essence?: EssenceV3;
  /** Partial DNA overrides (for nested providers) */
  overrides?: Partial<EssenceContextValue>;
}

export const EssenceProvider = component<EssenceProviderProps>((props, ...children) => {
  const parent = EssenceContext.consume();
  const essence = props.essence || parent.essence;

  // Build context value from essence or merge overrides onto parent
  const value: EssenceContextValue = essence
    ? {
        essence,
        style: props.overrides?.style ?? essence.dna.theme.style ?? parent.style,
        mode: props.overrides?.mode ?? essence.dna.theme.mode ?? parent.mode,
        shape: props.overrides?.shape ?? essence.dna.radius.philosophy ?? parent.shape,
        density: props.overrides?.density ?? essence.dna.spacing.density ?? parent.density,
        contentGap:
          props.overrides?.contentGap ?? essence.dna.spacing.content_gap ?? parent.contentGap,
        guardMode: essence.meta.guard.mode ?? parent.guardMode,
        dnaEnforcement: essence.meta.guard.dna_enforcement ?? parent.dnaEnforcement,
        blueprintEnforcement:
          essence.meta.guard.blueprint_enforcement ?? parent.blueprintEnforcement,
        personality: essence.dna.personality ?? parent.personality,
        wcagLevel: essence.dna.accessibility.wcag_level ?? parent.wcagLevel,
        validateGuard: (ctx) => evaluateGuard(essence, ctx as GuardContext),
      }
    : { ...parent, ...props.overrides };

  // Provide to subtree
  EssenceContext.Provider(value);

  // Apply theme tokens to CSS custom properties
  applyTokens(value);

  // Render children in a display:contents wrapper
  const container = h('div', { style: 'display:contents' }, ...children);
  return container;
});
