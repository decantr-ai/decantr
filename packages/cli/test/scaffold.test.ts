import { describe, it, expect } from 'vitest';
import { generateTokensCSS, generateDecoratorsCSS, generateGlobalCSS, generateSectionContext } from '../src/scaffold.js';
import type { SectionContextInput } from '../src/scaffold.js';

describe('generateTokensCSS', () => {
  it('returns fallback CSS when themeData is undefined', () => {
    const result = generateTokensCSS(undefined, 'dark');
    expect(result).toContain('--d-primary');
    expect(result).toContain(':root');
  });
});

describe('generateTokensCSS spatial tokens', () => {
  const sampleSpatialTokens: Record<string, string> = {
    '--d-section-py': '4rem',
    '--d-interactive-py': '0.625rem',
    '--d-interactive-px': '1rem',
    '--d-surface-p': '1.5rem',
    '--d-data-py': '0.75rem',
    '--d-control-py': '0.375rem',
    '--d-content-gap': '1.5rem',
  };

  it('appends spatial tokens to :root block when provided', () => {
    const css = generateTokensCSS(undefined, 'dark', sampleSpatialTokens);
    expect(css).toContain('--d-section-py: 4rem;');
    expect(css).toContain('--d-interactive-py: 0.625rem;');
    expect(css).toContain('--d-content-gap: 1.5rem;');
    // Spatial tokens should be inside the :root block (before closing brace)
    const rootBlock = css.split('}')[0];
    expect(rootBlock).toContain('--d-section-py');
  });

  it('does not include spatial tokens when not provided', () => {
    const css = generateTokensCSS(undefined, 'dark');
    expect(css).not.toContain('--d-section-py');
    expect(css).not.toContain('--d-content-gap');
  });

  it('appends spatial tokens when themeData is provided', () => {
    const themeData = {
      seed: { primary: '#7C93B0', secondary: '#A1A1AA', accent: '#6B8AAE' },
      palette: {
        background: { dark: '#18181B', light: '#FAFAFA' },
        surface: { dark: '#1F1F23', light: '#FFFFFF' },
      },
    };
    const css = generateTokensCSS(themeData, 'dark', sampleSpatialTokens);
    expect(css).toContain('--d-primary: #7C93B0;');
    expect(css).toContain('--d-section-py: 4rem;');
    expect(css).toContain('--d-content-gap: 1.5rem;');
  });

  it('includes spatial tokens in :root for auto mode', () => {
    const themeData = {
      seed: { primary: '#7C93B0' },
      palette: {},
    };
    const css = generateTokensCSS(themeData, 'auto', sampleSpatialTokens);
    // Spatial tokens should be in the :root block (before @media)
    const rootBlock = css.split('@media')[0];
    expect(rootBlock).toContain('--d-section-py: 4rem;');
    expect(rootBlock).toContain('--d-content-gap: 1.5rem;');
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


describe('generateDecoratorsCSS', () => {
  it('returns comment when no theme data', () => {
    const result = generateDecoratorsCSS(undefined, 'test');
    expect(result).toContain('No theme decorators');
  });
});

describe('generateGlobalCSS', () => {
  it('includes box-sizing reset', () => {
    const css = generateGlobalCSS([]);
    expect(css).toContain('box-sizing: border-box');
    expect(css).toContain('*, *::before, *::after');
  });

  it('includes body styles with theme tokens', () => {
    const css = generateGlobalCSS([]);
    expect(css).toContain('var(--d-bg)');
    expect(css).toContain('var(--d-text)');
    expect(css).toContain('font-family');
  });

  it('includes color-scheme declaration', () => {
    const css = generateGlobalCSS([]);
    expect(css).toContain('color-scheme');
  });

  it('includes font-smoothing for dark mode', () => {
    const css = generateGlobalCSS([]);
    expect(css).toContain('-webkit-font-smoothing: antialiased');
  });

  it('includes focus-visible base style', () => {
    const css = generateGlobalCSS([]);
    expect(css).toContain(':focus-visible');
    expect(css).toContain('outline');
  });

  it('includes sr-only utility', () => {
    const css = generateGlobalCSS([]);
    expect(css).toContain('.sr-only');
  });

  it('extracts font family from personality when mentioned', () => {
    const css = generateGlobalCSS(['Polished UI with Inter typeface and monospace for code']);
    expect(css).toContain('Inter');
  });
});

describe('generateSectionContext pattern deduplication', () => {
  function makeInput(overrides?: Partial<SectionContextInput>): SectionContextInput {
    return {
      section: {
        id: 'auth-full',
        role: 'gateway',
        shell: 'centered',
        features: ['auth'],
        description: 'Authentication section',
        pages: [
          {
            id: 'login',
            route: '/login',
            layout: ['form', 'social-login'],
            patterns: [],
          },
          {
            id: 'register',
            route: '/register',
            layout: ['form', 'social-login'],
            patterns: [],
          },
          {
            id: 'forgot-password',
            route: '/forgot-password',
            layout: ['form'],
            patterns: [],
          },
        ],
      },
      themeTokens: '',
      decorators: [],
      guardConfig: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
      personality: ['clean', 'modern'],
      themeName: 'luminarum',
      recipeName: 'carbon',
      zoneContext: '',
      patternSpecs: {
        'form': {
          description: 'A form pattern',
          components: ['Input', 'Button', 'Label'],
          slots: { header: 'Form title', body: 'Form fields', actions: 'Submit/cancel buttons' },
        },
        'social-login': {
          description: 'Social login buttons',
          components: ['Button', 'Icon'],
          slots: { providers: 'OAuth provider buttons' },
        },
      },
      ...overrides,
    };
  }

  it('lists each pattern spec only once even when used by multiple pages', () => {
    const result = generateSectionContext(makeInput());

    // "form" pattern appears on 3 pages but spec should only appear once
    const formSpecCount = (result.match(/### form\b/g) || []).length;
    expect(formSpecCount).toBe(1);

    // "social-login" appears on 2 pages but spec should only appear once
    const socialCount = (result.match(/### social-login\b/g) || []).length;
    expect(socialCount).toBe(1);
  });

  it('emits pattern specs in a Pattern Reference section before Pages', () => {
    const result = generateSectionContext(makeInput());

    const patternRefIdx = result.indexOf('## Pattern Reference');
    const pagesIdx = result.indexOf('## Pages');
    expect(patternRefIdx).toBeGreaterThan(-1);
    expect(pagesIdx).toBeGreaterThan(patternRefIdx);
  });

  it('does not repeat pattern specs inside individual page entries', () => {
    const result = generateSectionContext(makeInput());

    // After "## Pages", there should be no "**Components:**" or "**Layout slots:**"
    const afterPages = result.substring(result.indexOf('## Pages'));
    expect(afterPages).not.toContain('**Components:**');
    expect(afterPages).not.toContain('**Layout slots:**');
  });

  it('materializes personality inline with Visual Direction heading', () => {
    const result = generateSectionContext(makeInput());
    expect(result).toContain('## Visual Direction');
    expect(result).toContain('**Personality:** clean. modern');
  });
});
