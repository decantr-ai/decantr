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

describe('generateTokensCSS shadow tokens', () => {
  const darkTheme = {
    seed: { primary: '#7C93B0', secondary: '#A1A1AA', accent: '#6B8AAE' },
    palette: {
      background: { dark: '#18181B', light: '#FAFAFA' },
      surface: { dark: '#1F1F23', light: '#FFFFFF' },
      'surface-raised': { dark: '#27272A', light: '#F4F4F5' },
      border: { dark: '#3F3F46', light: '#E4E4E7' },
      text: { dark: '#FAFAFA', light: '#18181B' },
      'text-muted': { dark: '#A1A1AA', light: '#71717A' },
    },
  };

  it('uses high-opacity shadows for dark mode', () => {
    const css = generateTokensCSS(darkTheme, 'dark');
    const smMatch = css.match(/--d-shadow-sm:\s*([^;]+)/);
    expect(smMatch).toBeTruthy();
    const opacityMatch = smMatch![1].match(/rgba\(0,\s*0,\s*0,\s*([\d.]+)\)/);
    expect(opacityMatch).toBeTruthy();
    expect(parseFloat(opacityMatch![1])).toBeGreaterThanOrEqual(0.2);

    const lgMatch = css.match(/--d-shadow-lg:\s*([^;]+)/);
    expect(lgMatch).toBeTruthy();
    const lgOpacity = lgMatch![1].match(/rgba\(0,\s*0,\s*0,\s*([\d.]+)\)/);
    expect(lgOpacity).toBeTruthy();
    expect(parseFloat(lgOpacity![1])).toBeGreaterThanOrEqual(0.35);
  });

  it('uses low-opacity shadows for light mode', () => {
    const css = generateTokensCSS(darkTheme, 'light');
    const smMatch = css.match(/--d-shadow-sm:\s*([^;]+)/);
    expect(smMatch).toBeTruthy();
    const opacityMatch = smMatch![1].match(/rgba\(0,\s*0,\s*0,\s*([\d.]+)\)/);
    expect(opacityMatch).toBeTruthy();
    expect(parseFloat(opacityMatch![1])).toBeLessThanOrEqual(0.1);
  });

  it('uses high-opacity shadows in :root and low-opacity in light media query for auto mode', () => {
    const css = generateTokensCSS(darkTheme, 'auto');
    // :root block (dark default) should have high-opacity shadows
    const rootBlock = css.split('@media')[0];
    const rootSm = rootBlock.match(/--d-shadow-sm:\s*([^;]+)/);
    expect(rootSm).toBeTruthy();
    const rootSmOpacity = rootSm![1].match(/rgba\(0,\s*0,\s*0,\s*([\d.]+)\)/);
    expect(parseFloat(rootSmOpacity![1])).toBeGreaterThanOrEqual(0.2);

    // Light media query should have low-opacity shadows
    const lightBlock = css.split('@media')[1];
    expect(lightBlock).toBeTruthy();
    const lightSm = lightBlock!.match(/--d-shadow-sm:\s*([^;]+)/);
    expect(lightSm).toBeTruthy();
    const lightSmOpacity = lightSm![1].match(/rgba\(0,\s*0,\s*0,\s*([\d.]+)\)/);
    expect(parseFloat(lightSmOpacity![1])).toBeLessThanOrEqual(0.1);
  });
});

describe('generateDecoratorRule interactive states', () => {
  it('generates hover state for card decorators', () => {
    const css = generateDecoratorRule(
      'carbon-card',
      'Surface card with subtle border, rounded corners, shadow elevation, and hover shadow transition'
    );
    expect(css).toContain('.carbon-card:hover');
    expect(css).toContain('border-color');
  });

  it('generates focus and placeholder styles for input decorators', () => {
    const css = generateDecoratorRule(
      'carbon-input',
      'Input field with subtle border and gentle focus ring'
    );
    expect(css).toContain('.carbon-input:focus');
    expect(css).toContain('box-shadow');
    expect(css).toContain('background');
    expect(css).toContain('padding');
  });

  it('generates disabled state for input decorators', () => {
    const css = generateDecoratorRule(
      'carbon-input',
      'Input field with subtle border and gentle focus ring'
    );
    expect(css).toContain('.carbon-input:disabled');
    expect(css).toContain('opacity');
    expect(css).toContain('cursor: not-allowed');
  });

  it('generates transition property for interactive decorators', () => {
    const css = generateDecoratorRule(
      'carbon-card',
      'Surface card with subtle border, rounded corners, shadow elevation, and hover shadow transition'
    );
    expect(css).toContain('transition:');
  });

  it('does not generate interactive states for non-interactive decorators', () => {
    const css = generateDecoratorRule(
      'carbon-divider',
      'Horizontal divider line using border color'
    );
    expect(css).not.toContain(':hover');
    expect(css).not.toContain(':focus');
  });

  it('generates hover state for glass decorators', () => {
    const css = generateDecoratorRule(
      'carbon-glass',
      'Frosted glassmorphic panel with backdrop blur, semi-transparent background, subtle border'
    );
    expect(css).toContain('.carbon-glass:hover');
  });

  it('generates input base styles: background, padding, radius, color', () => {
    const css = generateDecoratorRule(
      'carbon-input',
      'Input field with subtle border and gentle focus ring'
    );
    expect(css).toContain('var(--d-surface)');
    expect(css).toContain('var(--d-text)');
    expect(css).toContain('padding:');
    expect(css).toContain('border-radius:');
  });
});

describe('generateDecoratorsCSS', () => {
  it('returns comment when no recipe data', () => {
    const result = generateDecoratorsCSS(undefined, 'test');
    expect(result).toContain('No recipe decorators');
  });
});
