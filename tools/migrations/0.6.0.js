/**
 * Migration: 0.6.0
 *
 * Breaking changes in v0.6.0:
 * - 13 domain-specific patterns consolidated into presets on generic patterns
 * - Pattern references in blend arrays must use { pattern, preset, as } format
 */

export const version = '0.6.0';

/**
 * Map of old pattern names to their v2 preset equivalents.
 * Keys are the old string references found in blend arrays.
 * Values are the new { pattern, preset?, as? } objects.
 */
const PATTERN_RENAMES = {
  'recipe-hero':         { pattern: 'hero', preset: 'image-overlay', as: 'recipe-hero' },
  'cookbook-hero':        { pattern: 'hero', preset: 'image-overlay-compact', as: 'cookbook-hero' },
  'product-grid':        { pattern: 'card-grid', preset: 'product', as: 'product-grid' },
  'recipe-card-grid':    { pattern: 'card-grid', preset: 'content', as: 'recipe-card-grid' },
  'cookbook-grid':        { pattern: 'card-grid', preset: 'collection', as: 'cookbook-grid' },
  'feature-grid':        { pattern: 'card-grid', preset: 'icon', as: 'feature-grid' },
  'profile-header':      { pattern: 'detail-header', preset: 'profile', as: 'profile-header' },
  'recipe-stats-bar':    { pattern: 'stats-bar' },
  'recipe-ingredients':  { pattern: 'checklist-card' },
  'recipe-instructions': { pattern: 'steps-card' },
  'nutrition-card':      { pattern: 'stat-card' },
  'recipe-form-simple':  { pattern: 'form-sections', preset: 'creation', as: 'recipe-form-simple' },
  'recipe-form-chef':    { pattern: 'form-sections', preset: 'structured', as: 'recipe-form-chef' },
};

/**
 * Convert a single blend item if it matches an old pattern name.
 */
function migrateBlendItem(item) {
  if (typeof item === 'string' && item in PATTERN_RENAMES) {
    return { ...PATTERN_RENAMES[item] };
  }

  // Handle cols arrays — migrate column references inside
  if (item && typeof item === 'object' && Array.isArray(item.cols)) {
    const newCols = item.cols.map(col =>
      (typeof col === 'string' && col in PATTERN_RENAMES) ? col : col
    );
    // Check if any col references need migrating (they stay as strings in cols)
    // Cols are identifiers, not pattern references — no migration needed
    return item;
  }

  return item;
}

/**
 * Migrate all blend arrays in a structure array.
 */
function migrateStructure(structure) {
  if (!Array.isArray(structure)) return structure;

  return structure.map(page => {
    if (!page.blend && !page.patterns) return page;

    const blendKey = page.blend ? 'blend' : 'patterns';
    const blend = page[blendKey];

    if (!Array.isArray(blend)) return page;

    return {
      ...page,
      [blendKey]: blend.map(migrateBlendItem),
    };
  });
}

export function migrate(essence) {
  const result = { ...essence };

  // Migrate top-level structure
  if (Array.isArray(result.structure)) {
    result.structure = migrateStructure(result.structure);
  }

  // Migrate sectioned essences
  if (Array.isArray(result.sections)) {
    result.sections = result.sections.map(section => {
      if (!Array.isArray(section.structure)) return section;
      return {
        ...section,
        structure: migrateStructure(section.structure),
      };
    });
  }

  result.version = '0.6.0';
  return result;
}
