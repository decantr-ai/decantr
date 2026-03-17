import { tags } from 'decantr/tags';
import { css } from 'decantr/css';
import { Chip } from 'decantr/components';

const { div, span, h4 } = tags;

// Reverse indexes built on init
let componentToPatterns = {};
let patternToArchetypes = {};
let initialized = false;

/**
 * Build reverse indexes from registry data.
 * Call once after registry is loaded.
 */
export function initUsageIndex(patterns, archetypes) {
  componentToPatterns = {};
  patternToArchetypes = {};

  // Component → Patterns
  for (const [patternId, pattern] of Object.entries(patterns)) {
    for (const comp of (pattern.components || [])) {
      if (!componentToPatterns[comp]) componentToPatterns[comp] = [];
      componentToPatterns[comp].push({ id: patternId, name: pattern.name || patternId });
    }
  }

  // Pattern → Archetypes
  for (const [archId, arch] of Object.entries(archetypes)) {
    for (const page of (arch.pages || [])) {
      for (const pat of (page.patterns || [])) {
        if (!patternToArchetypes[pat]) patternToArchetypes[pat] = [];
        patternToArchetypes[pat].push({ archetype: archId, page: page.id });
      }
    }
  }

  initialized = true;
}

/**
 * Render "Used in patterns" chips for a component.
 */
export function ComponentUsageLinks(componentName, navigateTo) {
  const patterns = componentToPatterns[componentName] || [];
  if (patterns.length === 0) {
    return span({ class: css('_fgmutedfg _caption') }, 'Not referenced by any patterns.');
  }

  return div({ class: css('_flex _col _gap2') },
    h4({ class: css('_heading6') }, `Used in ${patterns.length} pattern${patterns.length > 1 ? 's' : ''}`),
    div({ class: css('_flex _gap2 _wrap') },
      ...patterns.map(pat =>
        Chip({
          label: pat.name,
          variant: 'outline',
          size: 'sm',
          onclick: () => navigateTo(`/patterns/${pat.id}`)
        })
      )
    )
  );
}

/**
 * Render "Used in archetypes" chips for a pattern.
 */
export function PatternUsageLinks(patternId, navigateTo) {
  const archs = patternToArchetypes[patternId] || [];
  if (archs.length === 0) {
    return span({ class: css('_fgmutedfg _caption') }, 'Not referenced by any archetypes.');
  }

  return div({ class: css('_flex _col _gap2') },
    h4({ class: css('_heading6') }, `Used in ${archs.length} archetype page${archs.length > 1 ? 's' : ''}`),
    div({ class: css('_flex _gap2 _wrap') },
      ...archs.map(ref =>
        Chip({
          label: `${ref.archetype} / ${ref.page}`,
          variant: 'outline',
          size: 'sm',
          onclick: () => navigateTo(`/archetypes/${ref.archetype}`)
        })
      )
    )
  );
}
