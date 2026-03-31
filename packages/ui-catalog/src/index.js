import { validateStory } from './schema.js';

/** @type {Map<string, Object>} */
const stories = new Map();

/**
 * Register a story (internal / testing use).
 * @param {string} slug
 * @param {Object} story
 */
export function _register(slug, story) {
  const result = validateStory(story);
  if (!result.valid) {
    throw new Error(`Invalid story "${slug}": ${result.errors.join('; ')}`);
  }
  stories.set(slug, { ...story, slug });
}

/**
 * Clear all registered stories (testing use).
 */
export function _reset() {
  stories.clear();
}

/**
 * Get all registered stories as an array.
 * @returns {Object[]}
 */
export function getAllStories() {
  return Array.from(stories.values());
}

/**
 * Get a single story by slug.
 * @param {string} slug
 * @returns {Object|null}
 */
export function getStory(slug) {
  return stories.get(slug) ?? null;
}

/**
 * Get stories grouped by category.
 * @returns {{ category: string, stories: Object[] }[]}
 */
export function getCategories() {
  const groups = new Map();
  for (const story of stories.values()) {
    if (!groups.has(story.category)) {
      groups.set(story.category, []);
    }
    groups.get(story.category).push(story);
  }
  return Array.from(groups.entries()).map(([category, stories]) => ({
    category,
    stories,
  }));
}

/**
 * Search stories by case-insensitive substring match on title and description.
 * @param {string} query
 * @returns {Object[]}
 */
export function searchStories(query) {
  const q = query.toLowerCase();
  return getAllStories().filter(
    (s) =>
      s.title.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q)
  );
}

/**
 * Derive a slug from a story filename.
 * "Button.story.js" → "button"
 * "DatePicker.story.js" → "date-picker"
 */
function filenameToSlug(filename) {
  const base = filename.replace(/\.story\.js$/, '');
  return base
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

// Auto-register all story files found via import.meta.glob
const storyModules = import.meta.glob('./stories/**/*.story.js', { eager: true });
for (const [path, mod] of Object.entries(storyModules)) {
  const filename = path.split('/').pop();
  const slug = filenameToSlug(filename);
  if (mod.default) {
    _register(slug, mod.default);
  }
}
