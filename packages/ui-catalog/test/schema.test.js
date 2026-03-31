import { describe, it, expect } from 'vitest';
import { validateStory, CATEGORIES, CONTROL_TYPES } from '../src/schema.js';

function makeValidStory(overrides = {}) {
  return {
    component: () => {},
    title: 'Button',
    category: 'components/general',
    description: 'A general-purpose button component',
    variants: [{ name: 'Default', props: {} }],
    ...overrides,
  };
}

describe('validateStory', () => {
  it('rejects null', () => {
    const result = validateStory(null);
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(['story must be an object']);
  });

  it('rejects undefined', () => {
    const result = validateStory(undefined);
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(['story must be an object']);
  });

  it('rejects a primitive', () => {
    const result = validateStory('not an object');
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(['story must be an object']);
  });

  it('accepts a valid story', () => {
    const result = validateStory(makeValidStory());
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects missing title', () => {
    const result = validateStory(makeValidStory({ title: undefined }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('title'))).toBe(true);
  });

  it('rejects missing component', () => {
    const result = validateStory(makeValidStory({ component: undefined }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('component'))).toBe(true);
  });

  it('rejects invalid category', () => {
    const result = validateStory(makeValidStory({ category: 'invalid/cat' }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('category'))).toBe(true);
  });

  it('rejects empty variants', () => {
    const result = validateStory(makeValidStory({ variants: [] }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('variants'))).toBe(true);
  });

  it('rejects variant missing name', () => {
    const result = validateStory(makeValidStory({ variants: [{ props: {} }] }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('name'))).toBe(true);
  });

  it('accepts valid playground', () => {
    const result = validateStory(
      makeValidStory({
        playground: {
          controls: [
            { type: 'select', label: 'Size', options: ['sm', 'md', 'lg'] },
            { type: 'boolean', label: 'Disabled' },
          ],
        },
      })
    );
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects invalid playground control type', () => {
    const result = validateStory(
      makeValidStory({
        playground: {
          controls: [{ type: 'invalid-type', label: 'Bad' }],
        },
      })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('control type'))).toBe(true);
  });

  it('accepts valid usage', () => {
    const result = validateStory(
      makeValidStory({
        usage: [{ title: 'Basic', code: '<Button>Click</Button>' }],
      })
    );
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});
