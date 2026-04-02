import { describe, it, expect } from 'vitest';
import { generateTokensCSS, generateDecoratorsCSS, generateDecoratorRule } from '../src/scaffold.js';

describe('generateDecoratorRule', () => {
  it('returns a CSS comment for empty description', () => {
    const result = generateDecoratorRule('test', '');
    expect(result).toContain('/*');
  });
});

describe('generateTokensCSS', () => {
  it('returns fallback CSS when themeData is undefined', () => {
    const result = generateTokensCSS(undefined, 'dark');
    expect(result).toContain('--d-primary');
    expect(result).toContain(':root');
  });
});

describe('generateDecoratorsCSS', () => {
  it('returns comment when no recipe data', () => {
    const result = generateDecoratorsCSS(undefined, 'test');
    expect(result).toContain('No recipe decorators');
  });
});
