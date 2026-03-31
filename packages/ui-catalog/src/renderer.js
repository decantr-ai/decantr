import { h } from '@decantr/ui/runtime';
import { css } from '@decantr/css';

/**
 * Render all variants of a story as a grid of labeled component instances.
 * @param {Object} story
 * @returns {HTMLElement}
 */
export function renderVariants(story) {
  const cells = story.variants.map((variant) => {
    const rendered = story.component(variant.props);
    const label = h('span', { class: css('_text-xs _text-muted') }, variant.name);
    return h('div', { class: css('_flex _col _gap2 _p4 _rounded _border _border-subtle _bg-surface') }, rendered, label);
  });

  return h('div', {
    class: css('_grid _gap4'),
    style: 'grid-template-columns: repeat(auto-fill, minmax(240px, 1fr))',
  }, ...cells);
}

/**
 * Render a single variant by index.
 * @param {Object} story
 * @param {number} variantIndex
 * @returns {HTMLElement}
 */
export function renderVariant(story, variantIndex) {
  const variant = story.variants[variantIndex];
  if (!variant) {
    throw new RangeError(
      `Variant index ${variantIndex} out of range (story has ${story.variants.length} variant${story.variants.length === 1 ? '' : 's'})`
    );
  }
  return story.component(variant.props);
}

/**
 * Render code usage examples for a story.
 * @param {Object} story
 * @returns {HTMLElement|null}
 */
export function renderUsage(story) {
  if (!story.usage || story.usage.length === 0) {
    return null;
  }

  const blocks = story.usage.map((example) => {
    const title = h('span', { class: css('_text-sm _font-medium') }, example.title);
    const code = h('code', null, example.code);
    const pre = h('pre', {
      class: css('_p3 _rounded _bg-surface _text-xs _font-mono _overflow-x-auto _border _border-subtle'),
    }, code);
    return h('div', null, title, pre);
  });

  return h('div', { class: css('_flex _col _gap3') }, ...blocks);
}
