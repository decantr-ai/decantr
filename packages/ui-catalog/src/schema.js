export const CATEGORIES = [
  'components/original',
  'components/general',
  'components/layout',
  'components/navigation',
  'components/form',
  'components/data-display',
  'components/feedback',
  'components/media',
  'components/utility',
  'charts',
  'icons',
  'css',
];

export const CONTROL_TYPES = ['select', 'boolean', 'text', 'number', 'color'];

/**
 * Validate a story definition object.
 * @param {Object} story
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateStory(story) {
  if (!story || typeof story !== 'object') {
    return { valid: false, errors: ['story must be an object'] };
  }

  const errors = [];

  if (typeof story.component !== 'function') {
    errors.push('component must be a function');
  }

  if (typeof story.title !== 'string' || story.title.length === 0) {
    errors.push('title must be a non-empty string');
  }

  if (!CATEGORIES.includes(story.category)) {
    errors.push(`category must be one of: ${CATEGORIES.join(', ')}`);
  }

  if (typeof story.description !== 'string' || story.description.length === 0) {
    errors.push('description must be a non-empty string');
  }

  if (!Array.isArray(story.variants) || story.variants.length === 0) {
    errors.push('variants must be a non-empty array');
  } else {
    for (let i = 0; i < story.variants.length; i++) {
      const v = story.variants[i];
      if (typeof v.name !== 'string' || v.name.length === 0) {
        errors.push(`variants[${i}].name must be a non-empty string`);
      }
      if (typeof v.props !== 'object' || v.props === null) {
        errors.push(`variants[${i}].props must be an object`);
      }
    }
  }

  if (story.playground !== undefined) {
    if (typeof story.playground !== 'object' || story.playground === null) {
      errors.push('playground must be an object');
    } else if (Array.isArray(story.playground.controls)) {
      for (let i = 0; i < story.playground.controls.length; i++) {
        const ctrl = story.playground.controls[i];
        if (!CONTROL_TYPES.includes(ctrl.type)) {
          errors.push(
            `playground.controls[${i}].type has invalid control type "${ctrl.type}". Must be one of: ${CONTROL_TYPES.join(', ')}`
          );
        }
      }
    }
  }

  if (story.usage !== undefined) {
    if (!Array.isArray(story.usage)) {
      errors.push('usage must be an array');
    } else {
      for (let i = 0; i < story.usage.length; i++) {
        const u = story.usage[i];
        if (typeof u.title !== 'string' || u.title.length === 0) {
          errors.push(`usage[${i}].title must be a non-empty string`);
        }
        if (typeof u.code !== 'string' || u.code.length === 0) {
          errors.push(`usage[${i}].code must be a non-empty string`);
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
