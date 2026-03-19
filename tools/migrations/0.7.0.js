/**
 * Migration: 0.7.0
 *
 * Recipe v2 schema support:
 * - Recipes gain spatial_hints, skeleton, animation, pattern_preferences fields
 * - These fields live in framework recipe JSON files, not in user essences
 * - Essence gains optional clarity, _impression, and cork.mode fields
 * - cork.mode defaults to "maintenance" (preserves existing strict behavior)
 */

export const version = '0.7.0';

export function migrate(essence) {
  const result = { ...essence };

  // Ensure cork object exists with mode field
  if (!result.cork) {
    result.cork = { enforce_style: true, enforce_recipe: true, mode: 'maintenance' };
  } else if (!result.cork.mode) {
    result.cork = { ...result.cork, mode: 'maintenance' };
  }

  // Warn about custom recipe files (they should add v2 fields manually)
  const recipeId = result.vintage?.recipe;
  const builtInRecipes = ['auradecantism', 'clean', 'launchpad', 'gaming-guild'];
  if (recipeId && !builtInRecipes.includes(recipeId)) {
    console.log(`  ⚠ Custom recipe "${recipeId}" detected. Add spatial_hints, skeleton, animation sections for full v2 support.`);
    console.log('    Run `decantr migrate --dry-run` to preview changes.');
  }

  // Bump version
  result.version = '0.7.0';
  return result;
}
