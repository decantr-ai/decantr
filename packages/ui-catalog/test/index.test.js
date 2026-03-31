import { describe, it, expect, beforeEach } from 'vitest';
import {
  _register,
  _reset,
  getAllStories,
  getStory,
  getCategories,
  searchStories,
  filenameToSlug,
} from '../src/index.js';

function makeStory(overrides = {}) {
  return {
    component: () => {},
    title: 'Button',
    category: 'components/general',
    description: 'A general-purpose button component',
    variants: [{ name: 'Default', props: {} }],
    ...overrides,
  };
}

describe('Query API', () => {
  beforeEach(() => {
    _reset();
  });

  it('getAllStories returns all registered stories', () => {
    _register('button', makeStory({ title: 'Button' }));
    _register('input', makeStory({ title: 'Input', category: 'components/form' }));
    const all = getAllStories();
    expect(all).toHaveLength(2);
    expect(all.map((s) => s.slug)).toEqual(['button', 'input']);
  });

  it('getStory returns story by slug', () => {
    _register('button', makeStory({ title: 'Button' }));
    const story = getStory('button');
    expect(story).not.toBeNull();
    expect(story.title).toBe('Button');
    expect(story.slug).toBe('button');
  });

  it('getStory returns null for unknown slug', () => {
    expect(getStory('nonexistent')).toBeNull();
  });

  it('getCategories groups stories correctly', () => {
    _register('button', makeStory({ title: 'Button', category: 'components/general' }));
    _register('input', makeStory({ title: 'Input', category: 'components/form' }));
    _register('badge', makeStory({ title: 'Badge', category: 'components/general' }));

    const categories = getCategories();
    const general = categories.find((c) => c.category === 'components/general');
    const form = categories.find((c) => c.category === 'components/form');

    expect(general.stories).toHaveLength(2);
    expect(form.stories).toHaveLength(1);
  });

  it('searchStories matches title substring', () => {
    _register('button', makeStory({ title: 'Button', description: 'Click me' }));
    _register('input', makeStory({ title: 'Input', description: 'Type here' }));
    const results = searchStories('but');
    expect(results).toHaveLength(1);
    expect(results[0].slug).toBe('button');
  });

  it('searchStories matches description substring', () => {
    _register('button', makeStory({ title: 'Button', description: 'Click me' }));
    const results = searchStories('click');
    expect(results).toHaveLength(1);
    expect(results[0].slug).toBe('button');
  });

  it('searchStories is case-insensitive', () => {
    _register('button', makeStory({ title: 'Button', description: 'Click me' }));
    const results = searchStories('BUTTON');
    expect(results).toHaveLength(1);
  });

  it('searchStories returns empty for no match', () => {
    _register('button', makeStory({ title: 'Button', description: 'Click me' }));
    const results = searchStories('zzzzz');
    expect(results).toHaveLength(0);
  });
});

describe('filenameToSlug', () => {
  it('converts simple PascalCase to lowercase', () => {
    expect(filenameToSlug('Button.story.js')).toBe('button');
  });

  it('converts multi-word PascalCase to kebab-case', () => {
    expect(filenameToSlug('DatePicker.story.js')).toBe('date-picker');
  });

  it('handles single-word with no camelCase boundary', () => {
    expect(filenameToSlug('Checkbox.story.js')).toBe('checkbox');
  });

  it('converts DataTable to data-table', () => {
    expect(filenameToSlug('DataTable.story.js')).toBe('data-table');
  });
});
