/**
 * v2.1 Tier C4 — Experiential interaction verifier.
 *
 * Scans generated source files for evidence that declared `interactions[]`
 * (from pattern.v2.json) are actually implemented. This is the enforcement
 * layer that converts the structural-vs-experiential gap (user audit:
 * "experiential reads like guidance, nothing fails when I skip it") into
 * a hard-edged structural check, on par with the other guard rules.
 *
 * Scanner is intentionally simple: regex/substring signal matching, not
 * full AST analysis. Each interaction defines one or more signals that
 * MUST appear somewhere in the project source. A signal is either:
 *   - a CSS class name (e.g., `d-pulse` for status-pulse)
 *   - a regex (e.g., /onPointer(Down|Move)/ for drag-nodes)
 * If no signal matches, the interaction is marked as "missing" and the
 * guard rule emits a violation.
 *
 * Why grep, not AST: scaffolds use diverse file shapes (JSX, MDX, plain
 * HTML in marketing sites). A regex scan handles all of them; a real AST
 * matcher would need framework-specific parsers per blueprint kind. Grep
 * gets us 80% of the value at 10% of the complexity.
 */

/** Either a literal substring or a regex pattern. */
export type InteractionSignal = string | RegExp;

export interface InteractionRequirement {
  /** The interaction name from pattern.v2.json's enum. */
  interaction: string;
  /**
   * One or more signals; ANY match satisfies the requirement. Allows
   * authors flexibility — e.g., either `d-pulse` class OR a custom
   * `@keyframes pulse` declaration both count for status-pulse.
   */
  signals: InteractionSignal[];
  /** Human-readable suggestion when signals don't match. */
  suggestion: string;
}

/**
 * Mapping from canonical interaction name (pattern.v2.json enum) to its
 * required signals. Add entries as new interactions are introduced.
 */
export const INTERACTION_SIGNALS: Record<string, InteractionRequirement> = {
  'animate-on-mount': {
    interaction: 'animate-on-mount',
    signals: ['d-enter-fade', 'd-enter-slide-up', 'd-enter-scale', 'animate-on-mount'],
    suggestion: 'Add `d-enter-fade`, `d-enter-slide-up`, or `d-enter-scale` to the pattern root.',
  },
  'stagger-children': {
    interaction: 'stagger-children',
    signals: ['d-stagger-children', '--d-stagger-index'],
    suggestion:
      'Apply `d-stagger-children` to the parent and `style={{ "--d-stagger-index": i }}` to each child.',
  },
  'status-pulse': {
    interaction: 'status-pulse',
    signals: ['d-pulse', 'd-pulse-ring', /@keyframes\s+pulse/],
    suggestion: 'Apply `d-pulse` or `d-pulse-ring` to the status indicator element.',
  },
  'shimmer-skeleton': {
    interaction: 'shimmer-skeleton',
    signals: ['d-shimmer', /@keyframes\s+shimmer/],
    suggestion: 'Apply `d-shimmer` to the skeleton/loading element.',
  },
  'float-idle': {
    interaction: 'float-idle',
    signals: ['d-float'],
    suggestion: 'Apply `d-float` to the floating decorative element.',
  },
  'glow-hover': {
    interaction: 'glow-hover',
    signals: ['d-glow-hover'],
    suggestion: 'Apply `d-glow-hover` to the interactive surface.',
  },
  'lift-hover': {
    interaction: 'lift-hover',
    signals: ['d-lift-hover'],
    suggestion: 'Apply `d-lift-hover` to the interactive card/tile.',
  },
  'scale-hover': {
    interaction: 'scale-hover',
    signals: ['d-scale-hover'],
    suggestion: 'Apply `d-scale-hover` to the interactive element.',
  },
  'ripple-click': {
    interaction: 'ripple-click',
    signals: ['d-ripple'],
    suggestion: 'Apply `d-ripple` to the button or interactive surface.',
  },
  'drag-nodes': {
    interaction: 'drag-nodes',
    signals: [/onPointer(Down|Move|Up)/i, /onMouse(Down|Move|Up)/i, /'?cursor.*?grab/i],
    suggestion:
      'Implement pointer event handlers (onPointerDown/Move/Up) with a 4px movement threshold before drag engages. Apply cursor: grab/grabbing.',
  },
  'drag-reorder': {
    interaction: 'drag-reorder',
    signals: [/onPointer(Down|Move)/i, /draggable/i, /dnd|drag.{0,10}drop/i],
    suggestion: 'Implement drag-to-reorder via pointer events or a dnd library.',
  },
  'pan-background': {
    interaction: 'pan-background',
    signals: [/onPointer(Down|Move)/i, /transform.*?translate/i, /viewBox/],
    suggestion:
      'Implement pointer handlers on the canvas BACKGROUND only (not nodes); update a viewport translate transform on drag.',
  },
  'zoom-scroll': {
    interaction: 'zoom-scroll',
    signals: [/onWheel/i, /transform.*?scale/i],
    suggestion:
      'Implement an onWheel handler that adjusts a `scale` transform, clamped to [0.25, 4]. Show a zoom indicator.',
  },
  'zoom-pinch': {
    interaction: 'zoom-pinch',
    signals: [/touchstart|touchmove|gesturechange/i, /pinch/i],
    suggestion: 'Implement pinch-to-zoom via touch events or gestureend.',
  },
  'click-select': {
    interaction: 'click-select',
    signals: [/onClick/i, /selected/i, /aria-selected/i],
    suggestion:
      'Implement click-to-select state via onClick handlers; reflect selection via aria-selected or a "selected" class.',
  },
  'click-connect': {
    interaction: 'click-connect',
    signals: [/onClick.*?port|connect/i, /connections?\s*[:\[=]/i],
    suggestion:
      'Implement a two-click state machine: first click selects a port, second click on another port creates a connection. Store connections in component state.',
  },
  'inline-edit': {
    interaction: 'inline-edit',
    signals: [/contenteditable|input.*?onBlur|onKeyDown.*?Enter/i, 'isEditing'],
    suggestion:
      'Replace static text with a controlled <input> on click; commit on blur or Enter keyDown.',
  },
  'hover-tooltip': {
    interaction: 'hover-tooltip',
    signals: [/data-tooltip|onMouseEnter|tooltip/i, 'role="tooltip"'],
    suggestion:
      'Implement a hover-triggered tooltip: data-tooltip attribute or onMouseEnter/Leave handlers showing/hiding a popover.',
  },
  'hover-reveal': {
    interaction: 'hover-reveal',
    signals: [/:hover/i, /onMouseEnter/i, /group-hover/i],
    suggestion:
      'Implement hover-triggered content reveal via :hover CSS or onMouseEnter handlers.',
  },
  'live-simulation': {
    interaction: 'live-simulation',
    signals: [/setInterval|setTimeout|requestAnimationFrame/i, /useEffect/i],
    suggestion:
      'Implement live data simulation via setInterval (2-4 second cadence) updating mock state; animate changes with `d-pulse` on the changed element.',
  },
  'real-time-updates': {
    interaction: 'real-time-updates',
    signals: [/setInterval|WebSocket|EventSource|subscribe/i],
    suggestion:
      'Implement real-time updates via WebSocket, EventSource, or polling with setInterval.',
  },
  'scroll-reveal': {
    interaction: 'scroll-reveal',
    signals: [/IntersectionObserver/i, /onScroll/i],
    suggestion: 'Implement scroll-triggered reveal via IntersectionObserver (once: true).',
  },
  'keyboard-navigation': {
    interaction: 'keyboard-navigation',
    signals: [/onKeyDown|onKeyUp/i, /ArrowUp|ArrowDown|ArrowLeft|ArrowRight/],
    suggestion:
      'Implement arrow-key navigation via onKeyDown handlers (ArrowUp/Down/Left/Right).',
  },
  'focus-trap': {
    interaction: 'focus-trap',
    signals: [/focusTrap|tabindex|aria-modal/i, /useFocusTrap/],
    suggestion:
      'Implement focus trap inside modal/dialog — listen for Tab key, cycle focus within the dialog, restore focus on close.',
  },
};

export interface InteractionMissingFinding {
  interaction: string;
  suggestion: string;
}

/**
 * Scan a source-tree map (file path → file contents) for evidence of each
 * declared interaction. Returns a list of interactions whose signals were
 * not found anywhere in the source.
 *
 * @param interactions Declared interactions from one or more page packs.
 *                     Duplicates collapse to a single check.
 * @param sources Map of file path → file contents to scan.
 * @returns List of interactions that have no matching signal.
 */
export function verifyInteractionsInSource(
  interactions: string[],
  sources: Map<string, string>,
): InteractionMissingFinding[] {
  if (interactions.length === 0 || sources.size === 0) return [];

  // Concat all source files into one large string for scanning. This is
  // simpler than per-file scanning and sufficient for the "is this
  // interaction implemented anywhere?" question. Trade-off: we lose the
  // ability to report which specific file is missing it. That's
  // acceptable for the v1 scope — the goal is binary: is it present or
  // absent across the project?
  const combined = Array.from(sources.values()).join('\n\n');

  const unique = Array.from(new Set(interactions));
  const missing: InteractionMissingFinding[] = [];

  for (const interaction of unique) {
    const requirement = INTERACTION_SIGNALS[interaction];
    if (!requirement) {
      // Unknown interaction — skip silently. Forward-compatible with
      // future enum additions that this scanner doesn't yet recognize.
      continue;
    }

    const matched = requirement.signals.some((signal) => {
      if (typeof signal === 'string') {
        return combined.includes(signal);
      }
      return signal.test(combined);
    });

    if (!matched) {
      missing.push({
        interaction,
        suggestion: requirement.suggestion,
      });
    }
  }

  return missing;
}

/**
 * Convenience: list every recognized interaction name. Useful for
 * documentation, validation, and surfacing the canonical enum.
 */
export function listKnownInteractions(): string[] {
  return Object.keys(INTERACTION_SIGNALS).sort();
}
