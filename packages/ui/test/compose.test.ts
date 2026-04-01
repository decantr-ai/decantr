import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRoot } from '../src/state/scheduler.js';
import { EssenceContext, type EssenceContextValue } from '../src/essence/context.js';
import {
  compose,
  composePage,
  EssenceApp,
  registerPattern,
  hasPattern,
  getPatternRenderer,
  fallbackRenderer,
} from '../src/compose/index.js';
import type { EssenceV3 } from '@decantr/essence-spec';

// ─── Test helpers ────────────────────────────────────────────

function makeMockContext(overrides?: Partial<EssenceContextValue>): EssenceContextValue {
  return {
    essence: null,
    style: 'clean',
    mode: 'light',
    shape: 'rounded',
    density: 'comfortable',
    contentGap: '4',
    guardMode: 'creative',
    dnaEnforcement: 'off',
    blueprintEnforcement: 'off',
    personality: [],
    wcagLevel: 'AA',
    validateGuard: () => [],
    ...overrides,
  };
}

function makeMockEssence(pages: Array<{ id: string; layout: string[]; shell_override?: string }>): EssenceV3 {
  return {
    version: '3.0.0',
    dna: {
      theme: { style: 'clean', mode: 'light' },
      radius: { philosophy: 'rounded' },
      spacing: { density: 'comfortable', content_gap: '4' },
      personality: ['professional'],
      accessibility: { wcag_level: 'AA' },
      typography: {} as any,
    } as any,
    blueprint: {
      shell: 'marketing',
      pages: pages.map(p => ({
        id: p.id,
        layout: p.layout,
        shell_override: p.shell_override || undefined,
      })),
      features: [],
    },
    meta: {
      project: 'test',
      archetype: 'marketing' as any,
      guard: {
        mode: 'creative' as const,
        dna_enforcement: 'off' as const,
        blueprint_enforcement: 'off' as const,
      },
    } as any,
  } as EssenceV3;
}

// ─── compose() ───────────────────────────────────────────────

describe('compose', () => {
  it('renders a hero pattern with correct structure', () => {
    let el!: HTMLElement;
    createRoot(() => {
      EssenceContext.Provider(makeMockContext());
      el = compose('hero', {
        props: { title: 'Hello World', subtitle: 'A test subtitle', ctaText: 'Get Started' },
      });
    });
    expect(el).toBeDefined();
    expect(el.tagName).toBe('SECTION');
    expect(el.getAttribute('data-pattern')).toBe('hero');
    expect(el.querySelector('h1')?.textContent).toBe('Hello World');
    expect(el.querySelector('p')?.textContent).toBe('A test subtitle');
    // CTA button should be rendered
    const btn = el.querySelector('button');
    expect(btn).not.toBeNull();
    expect(btn?.textContent).toContain('Get Started');
  });

  it('renders fallback for unregistered pattern', () => {
    let el!: HTMLElement;
    createRoot(() => {
      EssenceContext.Provider(makeMockContext());
      el = compose('nonexistent-pattern');
    });
    expect(el).toBeDefined();
    expect(el.tagName).toBe('SECTION');
    expect(el.getAttribute('data-pattern')).toBe('nonexistent-pattern');
    expect(el.textContent).toContain('No renderer registered');
  });

  it('renders feature-grid with cards', () => {
    let el!: HTMLElement;
    createRoot(() => {
      EssenceContext.Provider(makeMockContext());
      el = compose('feature-grid', {
        props: {
          features: [
            { title: 'Feature A', description: 'Description A' },
            { title: 'Feature B', description: 'Description B' },
          ],
        },
      });
    });
    expect(el.getAttribute('data-pattern')).toBe('feature-grid');
    // Should contain Card components (d-card class)
    const cards = el.querySelectorAll('.d-card');
    expect(cards.length).toBe(2);
  });

  it('renders cta-section with buttons', () => {
    let el!: HTMLElement;
    createRoot(() => {
      EssenceContext.Provider(makeMockContext());
      el = compose('cta-section', {
        props: {
          heading: 'Ready?',
          primaryText: 'Sign Up',
          secondaryText: 'Learn More',
        },
      });
    });
    expect(el.getAttribute('data-pattern')).toBe('cta-section');
    expect(el.querySelector('h2')?.textContent).toBe('Ready?');
    const buttons = el.querySelectorAll('button');
    expect(buttons.length).toBe(2);
  });

  it('renders nav-header with brand and links', () => {
    let el!: HTMLElement;
    createRoot(() => {
      EssenceContext.Provider(makeMockContext());
      el = compose('nav-header', {
        props: {
          brand: 'Decantr',
          links: [
            { label: 'Home', href: '/' },
            { label: 'About', href: '/about' },
          ],
        },
      });
    });
    expect(el.getAttribute('data-pattern')).toBe('nav-header');
    expect(el.textContent).toContain('Decantr');
    const linkEls = el.querySelectorAll('a');
    expect(linkEls.length).toBe(2);
  });

  it('renders footer with link groups and copyright', () => {
    let el!: HTMLElement;
    createRoot(() => {
      EssenceContext.Provider(makeMockContext());
      el = compose('footer', {
        props: {
          links: [
            { title: 'Product', links: [{ label: 'Features', href: '/features' }] },
          ],
          copyright: '2026 Decantr',
        },
      });
    });
    expect(el.getAttribute('data-pattern')).toBe('footer');
    expect(el.textContent).toContain('2026 Decantr');
    expect(el.textContent).toContain('Product');
  });

  it('renders content-section with heading and body', () => {
    let el!: HTMLElement;
    createRoot(() => {
      EssenceContext.Provider(makeMockContext());
      el = compose('content-section', {
        props: { heading: 'About Us', body: 'We build things.' },
      });
    });
    expect(el.getAttribute('data-pattern')).toBe('content-section');
    expect(el.querySelector('h2')?.textContent).toBe('About Us');
    expect(el.textContent).toContain('We build things.');
  });
});

// ─── registerPattern ─────────────────────────────────────────

describe('registerPattern', () => {
  it('registers a custom pattern and makes it available', () => {
    const customRenderer = vi.fn(({ props }) => {
      const el = document.createElement('div');
      el.setAttribute('data-pattern', 'custom');
      el.textContent = (props.text as string) || 'custom';
      return el;
    });

    registerPattern('custom-test', customRenderer);
    expect(hasPattern('custom-test')).toBe(true);
    expect(getPatternRenderer('custom-test')).toBe(customRenderer);

    let el!: HTMLElement;
    createRoot(() => {
      EssenceContext.Provider(makeMockContext());
      el = compose('custom-test', { props: { text: 'Hello Custom' } });
    });

    expect(customRenderer).toHaveBeenCalled();
    expect(el.textContent).toBe('Hello Custom');
  });

  it('hasPattern returns false for unregistered patterns', () => {
    expect(hasPattern('does-not-exist-xyz')).toBe(false);
  });
});

// ─── fallbackRenderer ────────────────────────────────────────

describe('fallbackRenderer', () => {
  it('creates a section with pattern name and message', () => {
    const el = fallbackRenderer('unknown-pattern');
    expect(el.tagName).toBe('SECTION');
    expect(el.getAttribute('data-pattern')).toBe('unknown-pattern');
    expect(el.textContent).toContain('Pattern: unknown-pattern');
    expect(el.textContent).toContain('No renderer registered');
  });
});

// ─── DNA flow ────────────────────────────────────────────────

describe('DNA values flow through to patterns', () => {
  it('passes density and contentGap from context to pattern renderer', () => {
    const spy = vi.fn(({ dna }) => {
      const el = document.createElement('div');
      el.setAttribute('data-density', dna.density);
      el.setAttribute('data-gap', dna.contentGap);
      return el;
    });

    registerPattern('dna-test', spy);

    let el!: HTMLElement;
    createRoot(() => {
      EssenceContext.Provider(makeMockContext({ density: 'compact', contentGap: '2' }));
      el = compose('dna-test');
    });

    expect(spy).toHaveBeenCalled();
    const receivedDna = spy.mock.calls[0][0].dna;
    expect(receivedDna.density).toBe('compact');
    expect(receivedDna.contentGap).toBe('2');
    expect(receivedDna.style).toBe('clean');
    expect(receivedDna.mode).toBe('light');
  });

  it('hero respects compact density', () => {
    let el!: HTMLElement;
    createRoot(() => {
      EssenceContext.Provider(makeMockContext({ density: 'compact' }));
      el = compose('hero', { props: { title: 'Compact Hero' } });
    });
    // Compact density uses _text-3xl for heading
    const h1 = el.querySelector('h1');
    expect(h1).not.toBeNull();
    expect(h1!.className).toContain('_text-3xl');
  });
});

// ─── composePage ─────────────────────────────────────────────

describe('composePage', () => {
  it('renders patterns from blueprint pages', () => {
    const essence = makeMockEssence([
      { id: 'home', layout: ['hero', 'feature-grid', 'cta-section'] },
    ]);
    const ctx = makeMockContext({ essence });

    let el!: HTMLElement;
    createRoot(() => {
      EssenceContext.Provider(ctx);
      el = composePage('home');
    });

    expect(el).toBeDefined();
    expect(el.getAttribute('data-shell')).toBe('marketing');
    // Should contain all three patterns
    const patterns = el.querySelectorAll('[data-pattern]');
    expect(patterns.length).toBe(3);
    expect(patterns[0].getAttribute('data-pattern')).toBe('hero');
    expect(patterns[1].getAttribute('data-pattern')).toBe('feature-grid');
    expect(patterns[2].getAttribute('data-pattern')).toBe('cta-section');
  });

  it('renders error message when no essence is provided', () => {
    let el!: HTMLElement;
    createRoot(() => {
      EssenceContext.Provider(makeMockContext());
      el = composePage('home');
    });
    expect(el.textContent).toContain('No essence provided');
  });

  it('renders error message for missing page', () => {
    const essence = makeMockEssence([{ id: 'about', layout: ['content-section'] }]);
    const ctx = makeMockContext({ essence });

    let el!: HTMLElement;
    createRoot(() => {
      EssenceContext.Provider(ctx);
      el = composePage('nonexistent');
    });
    expect(el.textContent).toContain('Page not found');
  });

  it('respects shell override on page', () => {
    const essence = makeMockEssence([
      { id: 'docs', layout: ['nav-header', 'content-section'], shell_override: 'sidebar-detail' },
    ]);
    const ctx = makeMockContext({ essence });

    let el!: HTMLElement;
    createRoot(() => {
      EssenceContext.Provider(ctx);
      el = composePage('docs');
    });
    expect(el.getAttribute('data-shell')).toBe('sidebar-detail');
  });

  it('uses centered shell', () => {
    const essence = makeMockEssence([
      { id: 'blog', layout: ['content-section'], shell_override: 'centered' },
    ]);
    const ctx = makeMockContext({ essence });

    let el!: HTMLElement;
    createRoot(() => {
      EssenceContext.Provider(ctx);
      el = composePage('blog');
    });
    expect(el.getAttribute('data-shell')).toBe('centered');
  });
});

// ─── EssenceApp ──────────────────────────────────────────────

function makeMockEssenceWithDefaults(pages: Array<{ id: string; layout: string[]; shell_override?: string }>): EssenceV3 {
  return {
    version: '3.0.0',
    dna: {
      theme: { style: 'auradecantism', mode: 'dark' },
      radius: { philosophy: 'rounded' },
      spacing: { density: 'comfortable', content_gap: '4' },
      personality: ['professional'],
      accessibility: { wcag_level: 'AA' },
      typography: {} as any,
    } as any,
    blueprint: {
      shell: 'marketing',
      pages: pages.map(p => ({
        id: p.id,
        layout: p.layout,
        shell_override: p.shell_override || undefined,
      })),
      features: [],
    },
    meta: {
      project: 'test',
      archetype: 'marketing' as any,
      guard: {
        mode: 'creative' as const,
        dna_enforcement: 'off' as const,
        blueprint_enforcement: 'off' as const,
      },
    } as any,
  } as EssenceV3;
}

describe('EssenceApp', () => {
  it('wraps children with essence context', () => {
    const essence = makeMockEssenceWithDefaults([{ id: 'home', layout: ['hero'] }]);

    let el!: HTMLElement;
    createRoot(() => {
      el = EssenceApp({ essence },
        compose('hero', { props: { title: 'App Hero' } }),
      );
    });

    // EssenceApp returns a display:contents div from EssenceProvider
    expect(el).toBeDefined();
    expect(el.tagName).toBe('DIV');
    // It should contain the hero section
    const hero = el.querySelector('[data-pattern="hero"]');
    expect(hero).not.toBeNull();
    expect(hero!.querySelector('h1')?.textContent).toBe('App Hero');
  });

  it('provides essence context so composePage works', () => {
    const essence = makeMockEssenceWithDefaults([{ id: 'home', layout: ['hero'] }]);

    // composePage must be called INSIDE the EssenceProvider scope,
    // so we use a function child that the runtime evaluates lazily.
    let el!: HTMLElement;
    createRoot(() => {
      el = EssenceApp({ essence },
        (() => composePage('home')) as any,
      );
    });

    expect(el).toBeDefined();
    const patterns = el.querySelectorAll('[data-pattern]');
    expect(patterns.length).toBe(1);
    expect(patterns[0].getAttribute('data-pattern')).toBe('hero');
  });
});
