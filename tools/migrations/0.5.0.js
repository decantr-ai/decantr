/**
 * Migration: 0.5.0
 *
 * Breaking changes in v0.5.0:
 * - "organs" renamed to "tannins"
 * - "anatomy" renamed to "structure"
 */

export const version = '0.5.0';

export function migrate(essence) {
  const result = { ...essence };

  // Rename organs → tannins (top-level)
  if ('organs' in result && !('tannins' in result)) {
    result.tannins = result.organs;
    delete result.organs;
  }

  // Rename anatomy → structure (top-level)
  if ('anatomy' in result && !('structure' in result)) {
    result.structure = result.anatomy;
    delete result.anatomy;
  }

  // Handle sectioned essences
  if (Array.isArray(result.sections)) {
    result.sections = result.sections.map(section => {
      const s = { ...section };

      if ('organs' in s && !('tannins' in s)) {
        s.tannins = s.organs;
        delete s.organs;
      }

      if ('anatomy' in s && !('structure' in s)) {
        s.structure = s.anatomy;
        delete s.anatomy;
      }

      return s;
    });
  }

  // Rename shared_organs → shared_tannins
  if ('shared_organs' in result && !('shared_tannins' in result)) {
    result.shared_tannins = result.shared_organs;
    delete result.shared_organs;
  }

  result.version = '0.5.0';
  return result;
}
