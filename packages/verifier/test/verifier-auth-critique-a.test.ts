import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { critiqueFile, critiqueSource, extractRouteHintsFromEssence } from '../src/index.js';

function createProjectRoot(): string {
  return mkdtempSync(join(tmpdir(), 'decantr-verifier-'));
}

describe('verifier auth critique evidence A', () => {
  it('extracts normalized route hints from v3 essence files', () => {
    const hints = extractRouteHintsFromEssence({
      version: '4.0.0',
      dna: {
        theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
        spacing: { base_unit: 4, scale: 'linear', density: 'comfortable', content_gap: '_gap4' },
        typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
        color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
        radius: { philosophy: 'rounded', base: 8 },
        elevation: { system: 'layered', max_levels: 3 },
        motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
        accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
        personality: ['professional'],
      },
      blueprint: {
        shell: 'sidebar-main',
        sections: [
          {
            id: 'main',
            role: 'primary',
            pages: [
              { id: 'overview', route: '/overview', layout: ['hero'] },
              { id: 'record', route: '/records/:id', layout: ['hero'] },
            ],
          },
        ],
        routes: {
          '/settings/profile': { page: 'overview' },
        },
        features: [],
      },
      meta: {
        archetype: 'marketing',
        target: 'react',
        platform: { type: 'spa', routing: 'pathname' },
        guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
      },
    } as never);

    expect(hints).toContain('/');
    expect(hints).toContain('/overview');
    expect(hints).toContain('/records/');
    expect(hints).toContain('/settings/profile');
  });

  it('critiques files against the compiled review contract', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, '.decantr', 'context'), { recursive: true });
      mkdirSync(join(projectRoot, 'src', 'styles'), { recursive: true });
      writeFileSync(
        join(projectRoot, '.decantr', 'context', 'review-pack.json'),
        JSON.stringify(
          {
            $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
            packVersion: '1.0.0',
            packType: 'review',
            objective: 'Review generated output against the compiled Decantr contract.',
            target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
            preset: null,
            scope: { appId: 'app', pageIds: ['home'], patternIds: ['hero'] },
            requiredSetup: [],
            allowedVocabulary: [],
            examples: [],
            antiPatterns: [
              {
                id: 'inline-styles',
                summary: 'Avoid inline style literals as the primary styling path.',
                guidance:
                  'Move visual styling into tokens.css and treatments.css instead of component-local style objects.',
              },
              {
                id: 'hardcoded-colors',
                summary: 'Avoid hardcoded color literals.',
                guidance:
                  'Use CSS variables and theme decorators instead of hex, rgb, or hsl values.',
              },
              {
                id: 'utility-framework-leakage',
                summary: 'Avoid letting utility-framework classes carry the primary visual system.',
                guidance:
                  'Prefer Decantr treatments and decorators as the primary styling contract.',
              },
            ],
            successChecks: [
              {
                id: 'theme-consistency',
                label: 'Theme identity and mode remain consistent across scaffolded routes.',
                severity: 'warn',
              },
            ],
            tokenBudget: { target: 1400, max: 2200, strategy: [] },
            data: {
              reviewType: 'app',
              shell: 'sidebar-main',
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              routing: 'hash',
              features: [],
              routes: [{ pageId: 'home', path: '/', patternIds: ['hero'] }],
              focusAreas: [
                'theme-consistency',
                'accessibility',
                'responsive-design',
                'treatment-usage',
              ],
              workflow: [],
            },
            renderedMarkdown: '# Review Pack\n',
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'styles', 'treatments.css'),
        '.brand-accent { color: var(--d-primary); }\n',
      );
      const filePath = join(projectRoot, 'Example.tsx');
      writeFileSync(
        filePath,
        '<button className="hover:bg-pink-500" style={{ color: "#ff00ff" }}>Click me</button>\n',
      );

      const report = await critiqueFile(filePath, projectRoot);
      expect(report.reviewPack?.packType).toBe('review');
      expect(report.focusAreas).toContain('accessibility');
      expect(report.findings.some((finding) => finding.id === 'theme-consistency-weak')).toBe(true);
      expect(report.findings.some((finding) => finding.id === 'anti-pattern-inline-styles')).toBe(
        true,
      );
      expect(
        report.findings.some((finding) => finding.id === 'anti-pattern-hardcoded-colors'),
      ).toBe(true);
      expect(
        report.findings.some((finding) => finding.id === 'anti-pattern-utility-framework-leakage'),
      ).toBe(true);
      expect(report.findings.some((finding) => finding.id === 'treatment-usage-missing')).toBe(
        true,
      );
      expect(report.findings.some((finding) => finding.id === 'accessibility-aria-missing')).toBe(
        true,
      );
      expect(
        report.findings.some((finding) => finding.id === 'accessibility-keyboard-missing'),
      ).toBe(true);
      expect(report.findings.some((finding) => finding.id === 'responsive-signals-missing')).toBe(
        true,
      );
      expect(report.scores.some((score) => score.category === 'Topology Context')).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('rejects critique file reads outside the project root', async () => {
    const projectRoot = createProjectRoot();
    const outsideName = `outside-${Date.now()}.tsx`;
    const outsideFile = join(projectRoot, '..', outsideName);

    try {
      writeFileSync(outsideFile, '<button>Outside</button>\n');

      await expect(critiqueFile(outsideFile, projectRoot)).rejects.toThrow(
        'Path escapes the project root',
      );
      await expect(critiqueFile(`../${outsideName}`, projectRoot)).rejects.toThrow(
        'Path escapes the project root',
      );
    } finally {
      await rm(outsideFile, { force: true });
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('critiques inline source with a provided hosted review contract', () => {
    const report = critiqueSource({
      filePath: 'src/pages/Home.tsx',
      code: '<button className="plain" style={{ color: "#ff00ff" }}>Click me</button>\n',
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['home'], patternIds: ['hero'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [
          {
            id: 'inline-styles',
            summary: 'Avoid inline style literals as the primary styling path.',
            guidance:
              'Move visual styling into tokens.css and treatments.css instead of component-local style objects.',
          },
          {
            id: 'hardcoded-colors',
            summary: 'Avoid hardcoded color literals.',
            guidance: 'Use CSS variables and theme decorators instead of hex, rgb, or hsl values.',
          },
        ],
        successChecks: [
          {
            id: 'theme-consistency',
            label: 'Theme identity and mode remain consistent across scaffolded routes.',
            severity: 'warn',
          },
        ],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: [],
          routes: [{ pageId: 'home', path: '/', patternIds: ['hero'] }],
          focusAreas: ['theme-consistency', 'accessibility', 'responsive-design'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
      packManifest: {
        $schema: 'https://decantr.ai/schemas/pack-manifest.v1.json',
        version: '1.0.0',
        generatedAt: '2026-04-09T00:00:00.000Z',
        scaffold: null,
        review: { id: 'review', markdown: 'review-pack.md', json: 'review-pack.json' },
        sections: [],
        pages: [
          {
            id: 'home',
            markdown: 'page-home-pack.md',
            json: 'page-home-pack.json',
            sectionId: 'main',
            sectionRole: 'primary',
          },
        ],
        mutations: [],
      },
      treatmentsCss: '.brand-accent { color: var(--d-primary); }\n',
    });

    expect(report.file).toBe('src/pages/Home.tsx');
    expect(report.reviewPack?.packType).toBe('review');
    expect(report.findings.some((finding) => finding.id === 'anti-pattern-inline-styles')).toBe(
      true,
    );
    expect(report.findings.some((finding) => finding.id === 'anti-pattern-hardcoded-colors')).toBe(
      true,
    );
  });

  it('flags critique runs that only have a pack manifest and no compiled review pack', () => {
    const report = critiqueSource({
      filePath: 'src/pages/Home.tsx',
      code: '<a href="#">Go</a>\n',
      packManifest: {
        $schema: 'https://decantr.ai/schemas/pack-manifest.v1.json',
        version: '1.0.0',
        generatedAt: '2026-04-09T00:00:00.000Z',
        scaffold: { id: 'scaffold', markdown: 'scaffold-pack.md', json: 'scaffold-pack.json' },
        review: null,
        sections: [],
        pages: [
          {
            id: 'home',
            markdown: 'page-home-pack.md',
            json: 'page-home-pack.json',
            sectionId: 'main',
            sectionRole: 'primary',
          },
        ],
        mutations: [],
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'review-pack-missing-for-critique'),
    ).toBe(true);
  });

  it('flags dangerous HTML injection and dynamic evaluation patterns during critique', () => {
    const report = critiqueSource({
      filePath: 'src/pages/Danger.tsx',
      code: `
        export function Danger({ html, expression }: { html: string; expression: string }) {
          const output = eval(expression);
          setTimeout("console.log('bad')", 100);
          return (
            <section>
              <div dangerouslySetInnerHTML={{ __html: html }} />
              <button onClick={() => document.body.innerHTML = "<p>bad</p>"}>{output}</button>
            </section>
          );
        }
      `,
    });

    expect(report.scores.some((score) => score.category === 'Security Hygiene')).toBe(true);
    expect(report.findings.some((finding) => finding.id === 'security-dangerously-set-html')).toBe(
      true,
    );
    expect(report.findings.some((finding) => finding.id === 'security-raw-html-injection')).toBe(
      true,
    );
    expect(report.findings.some((finding) => finding.id === 'security-dynamic-code-eval')).toBe(
      true,
    );
  });

  it('flags unlabeled icon buttons and clickable non-semantic containers during critique', () => {
    const report = critiqueSource({
      filePath: 'src/components/Toolbar.tsx',
      code: `
        export function Toolbar() {
          return (
            <div>
              <button><IconMenu /></button>
              <div onClick={() => openPanel()}>Open</div>
            </div>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['toolbar'], patternIds: ['nav'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: [],
          routes: [{ pageId: 'toolbar', path: '/', patternIds: ['nav'] }],
          focusAreas: ['accessibility'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'accessibility-icon-button-label-missing'),
    ).toBe(true);
    expect(
      report.findings.some((finding) => finding.id === 'accessibility-clickable-non-semantic'),
    ).toBe(true);
  });

  it('flags missing image alt text and insecure target blank links during critique', () => {
    const report = critiqueSource({
      filePath: 'src/components/MarketingCard.tsx',
      code: `
        export function MarketingCard() {
          return (
            <section>
              <img src="/hero.png" />
              <a href="https://example.com/docs" target="_blank">Docs</a>
            </section>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['marketing'], patternIds: ['hero'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: [],
          routes: [{ pageId: 'marketing', path: '/', patternIds: ['hero'] }],
          focusAreas: ['accessibility', 'security-hygiene'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'accessibility-image-alt-missing'),
    ).toBe(true);
    expect(
      report.findings.some((finding) => finding.id === 'security-target-blank-rel-missing'),
    ).toBe(true);
  });

  it('flags external Link targets without rel protections during critique', () => {
    const report = critiqueSource({
      filePath: 'src/components/DocsLink.tsx',
      code: `
        import { Link } from 'react-router-dom';

        export function DocsLink() {
          return <Link to="https://example.com/docs" target="_blank">Docs</Link>;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['docs'], patternIds: ['nav'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: [],
          routes: [{ pageId: 'docs', path: '/', patternIds: ['nav'] }],
          focusAreas: ['security-hygiene'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-target-blank-rel-missing'),
    ).toBe(true);
  });

  it('flags insecure remote image transport during critique', () => {
    const report = critiqueSource({
      filePath: 'src/components/LegacyHero.tsx',
      code: `
        export function LegacyHero() {
          return (
            <section>
              <img src="http://cdn.example.com/hero.jpg" alt="Legacy hero" />
            </section>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['marketing'], patternIds: ['hero'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: [],
          routes: [{ pageId: 'marketing', path: '/', patternIds: ['hero'] }],
          focusAreas: ['security-hygiene'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-image-transport-insecure'),
    ).toBe(true);
  });

  it('flags Next-style Image components without alt text during critique', () => {
    const report = critiqueSource({
      filePath: 'src/components/HeroImage.tsx',
      code: `
        import Image from 'next/image';

        export function HeroImage() {
          return <Image src="/hero.jpg" width={1200} height={630} />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['marketing'], patternIds: ['hero'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: [],
          routes: [{ pageId: 'marketing', path: '/', patternIds: ['hero'] }],
          focusAreas: ['accessibility'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'accessibility-image-alt-missing'),
    ).toBe(true);
  });

  it('flags insecure remote transport on Next-style Image components during critique', () => {
    const report = critiqueSource({
      filePath: 'src/components/LegacyImage.tsx',
      code: `
        import Image from 'next/image';

        export function LegacyImage() {
          return <Image src="http://cdn.example.com/hero.jpg" alt="Legacy hero" width={1200} height={630} />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['marketing'], patternIds: ['hero'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: [],
          routes: [{ pageId: 'marketing', path: '/', patternIds: ['hero'] }],
          focusAreas: ['security-hygiene'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-image-transport-insecure'),
    ).toBe(true);
  });

  it('flags insecure remote picture sources during critique', () => {
    const report = critiqueSource({
      filePath: 'src/components/ResponsiveHero.tsx',
      code: `
        export function ResponsiveHero() {
          return (
            <picture>
              <source media="(min-width: 768px)" srcSet="http://cdn.example.com/hero@2x.jpg 2x, https://cdn.example.com/hero.jpg 1x" />
              <img src="/hero-mobile.jpg" alt="Responsive hero" />
            </picture>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['marketing'], patternIds: ['hero'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: [],
          routes: [{ pageId: 'marketing', path: '/', patternIds: ['hero'] }],
          focusAreas: ['security-hygiene'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-image-transport-insecure'),
    ).toBe(true);
  });

  it('does not flag secure remote image transport during critique', () => {
    const report = critiqueSource({
      filePath: 'src/components/ModernHero.tsx',
      code: `
        export function ModernHero() {
          return (
            <section>
              <img src="https://cdn.example.com/hero.jpg" alt="Modern hero" />
            </section>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['marketing'], patternIds: ['hero'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: [],
          routes: [{ pageId: 'marketing', path: '/', patternIds: ['hero'] }],
          focusAreas: ['security-hygiene'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-image-transport-insecure'),
    ).toBe(false);
  });

  it('flags unlabeled icon-only links during critique', () => {
    const report = critiqueSource({
      filePath: 'src/components/AppNav.tsx',
      code: `
        export function AppNav() {
          return (
            <nav>
              <a href="/settings"><svg aria-hidden="true" viewBox="0 0 16 16"><path d="M0 0h16v16H0z" /></svg></a>
            </nav>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['nav'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: [],
          routes: [{ pageId: 'nav', path: '/settings', patternIds: ['sidebar'] }],
          focusAreas: ['accessibility'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'accessibility-icon-link-label-missing'),
    ).toBe(true);
  });

  it('flags unlabeled icon-only Link components during critique', () => {
    const report = critiqueSource({
      filePath: 'src/components/AppNav.tsx',
      code: `
        import { Link } from 'react-router-dom';

        export function AppNav() {
          return (
            <nav>
              <Link to="/settings"><svg aria-hidden="true" viewBox="0 0 16 16"><path d="M0 0h16v16H0z" /></svg></Link>
            </nav>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['nav'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: [],
          routes: [{ pageId: 'nav', path: '/settings', patternIds: ['sidebar'] }],
          focusAreas: ['accessibility'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'accessibility-icon-link-label-missing'),
    ).toBe(true);
  });

  it('flags iframes without titles during critique', () => {
    const report = critiqueSource({
      filePath: 'src/components/AnalyticsEmbed.tsx',
      code: `
        export function AnalyticsEmbed() {
          return (
            <section>
              <iframe src="https://example.com/embed" />
            </section>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['analytics'], patternIds: ['chart-grid'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: [],
          routes: [{ pageId: 'analytics', path: '/analytics', patternIds: ['chart-grid'] }],
          focusAreas: ['accessibility'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'accessibility-iframe-title-missing'),
    ).toBe(true);
    expect(
      report.findings.some((finding) => finding.id === 'security-iframe-sandbox-missing'),
    ).toBe(true);
    expect(
      report.findings.some((finding) => finding.id === 'security-iframe-transport-insecure'),
    ).toBe(false);
  });

  it('flags insecure external iframe transport during critique', () => {
    const report = critiqueSource({
      filePath: 'src/components/LegacyEmbed.tsx',
      code: `
        export function LegacyEmbed() {
          return (
            <section>
              <iframe title="Legacy analytics" src="http://example.com/embed" sandbox="" />
            </section>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['analytics'], patternIds: ['chart-grid'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: [],
          routes: [{ pageId: 'analytics', path: '/analytics', patternIds: ['chart-grid'] }],
          focusAreas: ['security-hygiene'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-iframe-transport-insecure'),
    ).toBe(true);
  });

  it('flags dialogs without accessible labels or modal hints during critique', () => {
    const report = critiqueSource({
      filePath: 'src/components/AccountDialog.tsx',
      code: `
        export function AccountDialog() {
          return (
            <div role="dialog">
              <h2>Account settings</h2>
              <button type="button">Close</button>
            </div>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['settings'], patternIds: ['dialog'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: [],
          routes: [{ pageId: 'settings', path: '/settings', patternIds: ['dialog'] }],
          focusAreas: ['accessibility'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'accessibility-dialog-label-missing'),
    ).toBe(true);
    expect(
      report.findings.some((finding) => finding.id === 'accessibility-dialog-modal-hint-missing'),
    ).toBe(true);
  });

  it('does not flag dialogs when label and modal hints are present', () => {
    const report = critiqueSource({
      filePath: 'src/components/AccountDialog.tsx',
      code: `
        export function AccountDialog() {
          return (
            <div role="dialog" aria-modal="true" aria-labelledby="account-dialog-title">
              <h2 id="account-dialog-title">Account settings</h2>
              <button type="button">Close</button>
            </div>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['settings'], patternIds: ['dialog'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: [],
          routes: [{ pageId: 'settings', path: '/settings', patternIds: ['dialog'] }],
          focusAreas: ['accessibility'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'accessibility-dialog-label-missing'),
    ).toBe(false);
    expect(
      report.findings.some((finding) => finding.id === 'accessibility-dialog-modal-hint-missing'),
    ).toBe(false);
  });

  it('flags tables without headers or captions during critique', () => {
    const report = critiqueSource({
      filePath: 'src/components/DataTable.tsx',
      code: `
        export function DataTable() {
          return (
            <table>
              <tbody>
                <tr>
                  <td>Revenue</td>
                  <td>$420k</td>
                </tr>
              </tbody>
            </table>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['data-table'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: [],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['data-table'] }],
          focusAreas: ['accessibility'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'accessibility-table-headers-missing'),
    ).toBe(true);
    expect(
      report.findings.some((finding) => finding.id === 'accessibility-table-caption-missing'),
    ).toBe(true);
  });

  it('flags multiple navigation landmarks without labels during critique', () => {
    const report = critiqueSource({
      filePath: 'src/components/AppShell.tsx',
      code: `
        export function AppShell() {
          return (
            <>
              <nav>
                <a href="/dashboard">Dashboard</a>
              </nav>
              <nav>
                <a href="/settings">Settings</a>
              </nav>
            </>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: [],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['accessibility'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some(
        (finding) => finding.id === 'accessibility-navigation-landmark-label-missing',
      ),
    ).toBe(true);
  });

  it('flags multiple main landmarks during critique', () => {
    const report = critiqueSource({
      filePath: 'src/components/AppShell.tsx',
      code: `
        export function AppShell() {
          return (
            <>
              <main>
                <section>Primary</section>
              </main>
              <main>
                <section>Secondary</section>
              </main>
            </>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['shell'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: [],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['shell'] }],
          focusAreas: ['accessibility'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'accessibility-multiple-main-landmarks'),
    ).toBe(true);
  });

  it('does not flag a single main landmark during critique', () => {
    const report = critiqueSource({
      filePath: 'src/components/AppShell.tsx',
      code: `
        export function AppShell() {
          return (
            <main>
              <section>Primary</section>
            </main>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['shell'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: [],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['shell'] }],
          focusAreas: ['accessibility'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'accessibility-multiple-main-landmarks'),
    ).toBe(false);
  });

  it('does not flag navigation landmarks when multiple nav regions are labeled', () => {
    const report = critiqueSource({
      filePath: 'src/components/AppShell.tsx',
      code: `
        export function AppShell() {
          return (
            <>
              <nav aria-label="Primary">
                <a href="/dashboard">Dashboard</a>
              </nav>
              <nav aria-label="Secondary">
                <a href="/settings">Settings</a>
              </nav>
            </>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: [],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['accessibility'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some(
        (finding) => finding.id === 'accessibility-navigation-landmark-label-missing',
      ),
    ).toBe(false);
  });

  it('does not flag tables when headers and caption are present', () => {
    const report = critiqueSource({
      filePath: 'src/components/DataTable.tsx',
      code: `
        export function DataTable() {
          return (
            <table>
              <caption>Revenue by month</caption>
              <thead>
                <tr>
                  <th scope="col">Metric</th>
                  <th scope="col">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Revenue</td>
                  <td>$420k</td>
                </tr>
              </tbody>
            </table>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['data-table'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: [],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['data-table'] }],
          focusAreas: ['accessibility'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'accessibility-table-headers-missing'),
    ).toBe(false);
    expect(
      report.findings.some((finding) => finding.id === 'accessibility-table-caption-missing'),
    ).toBe(false);
  });

  it('flags insecure or unsafe form actions during critique', () => {
    const report = critiqueSource({
      filePath: 'src/components/LegacyCheckout.tsx',
      code: `
        export function LegacyCheckout() {
          return (
            <form action="http://legacy.example.com/checkout" method="post">
              <input type="email" name="email" />
              <button type="submit">Pay now</button>
            </form>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['billing'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['billing'],
          routes: [{ pageId: 'billing', path: '/billing', patternIds: ['form'] }],
          focusAreas: ['security-hygiene'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(report.findings.some((finding) => finding.id === 'security-form-action-insecure')).toBe(
      true,
    );
  });

  it('flags javascript form actions during critique', () => {
    const report = critiqueSource({
      filePath: 'src/components/UnsafeAction.tsx',
      code: `
        export function UnsafeAction() {
          return (
            <form action="javascript:alert('owned')" method="post">
              <input type="email" name="email" />
              <button type="submit">Continue</button>
            </form>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['billing'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['billing'],
          routes: [{ pageId: 'billing', path: '/billing', patternIds: ['form'] }],
          focusAreas: ['security-hygiene'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(report.findings.some((finding) => finding.id === 'security-form-action-insecure')).toBe(
      true,
    );
  });

  it('flags insecure client transport endpoints during critique', () => {
    const report = critiqueSource({
      filePath: 'src/lib/legacy-auth.ts',
      code: `
        export async function loadProfile() {
          await fetch('http://legacy.example.com/api/profile');
          window.location.assign('http://legacy.example.com/login');
          return new WebSocket('ws://legacy.example.com/live');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['panel'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['panel'] }],
          focusAreas: ['security-hygiene'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-transport-endpoint-insecure'),
    ).toBe(true);
  });

  it('flags localhost-style endpoints during critique', () => {
    const report = critiqueSource({
      filePath: 'src/lib/api.ts',
      code: `
        export const apiBase = 'http://localhost:3000/api';
        export const streamBase = 'ws://127.0.0.1:4000/live';
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['home'], patternIds: ['hero'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: [],
          routes: [{ pageId: 'home', path: '/', patternIds: ['hero'] }],
          focusAreas: ['security-hygiene'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-localhost-endpoint-present'),
    ).toBe(true);
  });

  it('flags auth-like forms that default to GET semantics during critique', () => {
    const report = critiqueSource({
      filePath: 'src/components/LoginForm.tsx',
      code: `
        export function LoginForm() {
          return (
            <form>
              <input type="email" name="email" autoComplete="email" />
              <input type="password" name="password" autoComplete="current-password" />
              <button type="submit">Sign in</button>
            </form>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-form-method-insecure'),
    ).toBe(true);
  });

  it('flags auth-like forms without submit controls during critique', () => {
    const report = critiqueSource({
      filePath: 'src/components/LoginForm.tsx',
      code: `
        export function LoginForm() {
          return (
            <form method="post">
              <input type="email" name="email" autoComplete="email" />
              <input type="password" name="password" autoComplete="current-password" />
            </form>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['motion-interaction'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'interaction-auth-submit-missing'),
    ).toBe(true);
  });

  it('flags auth-like inputs without name attributes during critique', () => {
    const report = critiqueSource({
      filePath: 'src/components/LoginForm.tsx',
      code: `
        export function LoginForm() {
          return (
            <form method="post">
              <input type="email" autoComplete="email" />
              <input type="password" autoComplete="current-password" />
              <button type="submit">Sign in</button>
            </form>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['motion-interaction'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'interaction-auth-input-name-missing'),
    ).toBe(true);
  });

  it('does not flag auth inputs when stable name attributes are present', () => {
    const report = critiqueSource({
      filePath: 'src/components/LoginForm.tsx',
      code: `
        export function LoginForm() {
          return (
            <form method="post">
              <input type="email" name="email" autoComplete="email" />
              <input type="password" name="password" autoComplete="current-password" />
              <button type="submit">Sign in</button>
            </form>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['motion-interaction'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'interaction-auth-input-name-missing'),
    ).toBe(false);
  });

  it('flags auth/session files that redirect to protected destinations during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGuard.tsx',
      code: `
        export function DashboardGuard() {
          const { data: session } = useSession();
          if (!session) {
            return redirect('/dashboard');
          }
          return <Dashboard />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['hero'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['hero'] }],
          focusAreas: ['route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'route-auth-guard-protected-redirect'),
    ).toBe(true);
  });

  it('flags auth/session exit logic that never returns users to an anonymous route during critique', () => {
    const report = critiqueSource({
      filePath: 'src/components/UserMenu.tsx',
      code: `
        export function UserMenu() {
          const { status } = useSession();

          async function handleLogout() {
            await auth.signOut();
          }

          if (status === 'loading') {
            return <Spinner />;
          }

          return <button onClick={handleLogout}>Sign out</button>;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['sidebar'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['sidebar'] }],
          focusAreas: ['route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'route-auth-exit-redirect-missing'),
    ).toBe(true);
  });

  it('flags auth entry flows that never transition into the protected app during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginPage.tsx',
      code: `
        export function LoginPage() {
          async function handleSubmit(event) {
            event.preventDefault();
            await auth.signIn();
          }

          return (
            <form onSubmit={handleSubmit}>
              <input type="email" name="email" autoComplete="email" />
              <input type="password" name="password" autoComplete="current-password" />
              <button type="submit">Sign in</button>
            </form>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login', 'dashboard'], patternIds: ['form', 'panel'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [
            { pageId: 'login', path: '/login', patternIds: ['form'] },
            { pageId: 'dashboard', path: '/dashboard', patternIds: ['panel'] },
          ],
          focusAreas: ['route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'route-auth-success-redirect-missing'),
    ).toBe(true);
  });

  it('flags auth/session critique files that omit a loading state', () => {
    const report = critiqueSource({
      filePath: 'src/routes/DashboardGuard.tsx',
      code: `
        export function DashboardGuard() {
          const { data: session } = useSession();
          if (!session) {
            return redirect('/login');
          }
          return <Dashboard />;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['dashboard'], patternIds: ['panel'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'dashboard', path: '/dashboard', patternIds: ['panel'] }],
          focusAreas: ['route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(report.findings.some((finding) => finding.id === 'state-auth-loading-missing')).toBe(
      true,
    );
  });

  it('does not flag auth/session critique files when callback screens show explicit pending copy', () => {
    const report = critiqueSource({
      filePath: 'src/routes/AuthCallback.tsx',
      code: `
        export function AuthCallback() {
          const { data: session } = useSession();
          if (!session) {
            return <p>Signing you in...</p>;
          }

          return redirect('/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['callback'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [
            { pageId: 'callback', path: '/auth/callback', patternIds: ['form'] },
            { pageId: 'dashboard', path: '/dashboard', patternIds: ['hero'] },
          ],
          focusAreas: ['route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(report.findings.some((finding) => finding.id === 'state-auth-loading-missing')).toBe(
      false,
    );
  });

  it('flags sign-in critique files that omit a route to the declared recovery flow', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginPage.tsx',
      code: `
        export function LoginPage() {
          async function handleSubmit(event) {
            event.preventDefault();
            await auth.signIn();
            return redirect('/dashboard');
          }

          return (
            <form onSubmit={handleSubmit}>
              <input type="email" name="email" autoComplete="email" />
              <input type="password" name="password" autoComplete="current-password" />
              <button type="submit">Sign in</button>
            </form>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: {
          appId: 'app',
          pageIds: ['login', 'forgot-password', 'dashboard'],
          patternIds: ['form', 'panel'],
        },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [
            { pageId: 'login', path: '/login', patternIds: ['form'] },
            { pageId: 'forgot-password', path: '/forgot-password', patternIds: ['form'] },
            { pageId: 'dashboard', path: '/dashboard', patternIds: ['panel'] },
          ],
          focusAreas: ['route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'route-auth-recovery-link-missing'),
    ).toBe(true);
  });

  it('does not flag recovery-link gaps when the sign-in flow links to the declared recovery route', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginPage.tsx',
      code: `
        export function LoginPage() {
          async function handleSubmit(event) {
            event.preventDefault();
            await auth.signIn();
            return redirect('/dashboard');
          }

          return (
            <form onSubmit={handleSubmit}>
              <input type="email" name="email" autoComplete="email" />
              <input type="password" name="password" autoComplete="current-password" />
              <a href="/forgot-password">Forgot password?</a>
              <button type="submit">Sign in</button>
            </form>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: {
          appId: 'app',
          pageIds: ['login', 'forgot-password', 'dashboard'],
          patternIds: ['form', 'panel'],
        },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [
            { pageId: 'login', path: '/login', patternIds: ['form'] },
            { pageId: 'forgot-password', path: '/forgot-password', patternIds: ['form'] },
            { pageId: 'dashboard', path: '/dashboard', patternIds: ['panel'] },
          ],
          focusAreas: ['route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'route-auth-recovery-link-missing'),
    ).toBe(false);
  });

  it('flags sign-in critique files that omit a route to the declared registration flow', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginPage.tsx',
      code: `
        export function LoginPage() {
          async function handleSubmit(event) {
            event.preventDefault();
            await auth.signIn();
            return redirect('/dashboard');
          }

          return (
            <form onSubmit={handleSubmit}>
              <input type="email" name="email" autoComplete="email" />
              <input type="password" name="password" autoComplete="current-password" />
              <button type="submit">Sign in</button>
            </form>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: {
          appId: 'app',
          pageIds: ['login', 'register', 'dashboard'],
          patternIds: ['form', 'panel'],
        },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [
            { pageId: 'login', path: '/login', patternIds: ['form'] },
            { pageId: 'register', path: '/register', patternIds: ['form'] },
            { pageId: 'dashboard', path: '/dashboard', patternIds: ['panel'] },
          ],
          focusAreas: ['route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'route-auth-registration-link-missing'),
    ).toBe(true);
  });

  it('does not flag registration-link gaps when the sign-in flow links to the declared registration route', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginPage.tsx',
      code: `
        export function LoginPage() {
          async function handleSubmit(event) {
            event.preventDefault();
            await auth.signIn();
            return redirect('/dashboard');
          }

          return (
            <form onSubmit={handleSubmit}>
              <input type="email" name="email" autoComplete="email" />
              <input type="password" name="password" autoComplete="current-password" />
              <a href="/register">Create account</a>
              <button type="submit">Sign in</button>
            </form>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: {
          appId: 'app',
          pageIds: ['login', 'register', 'dashboard'],
          patternIds: ['form', 'panel'],
        },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [
            { pageId: 'login', path: '/login', patternIds: ['form'] },
            { pageId: 'register', path: '/register', patternIds: ['form'] },
            { pageId: 'dashboard', path: '/dashboard', patternIds: ['panel'] },
          ],
          focusAreas: ['route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'route-auth-registration-link-missing'),
    ).toBe(false);
  });

  it('flags recovery critique files that omit a route back to the declared anonymous entry flow', () => {
    const report = critiqueSource({
      filePath: 'src/routes/ForgotPasswordPage.tsx',
      code: `
        export function ForgotPasswordPage() {
          async function handleSubmit(event) {
            event.preventDefault();
            await auth.requestPasswordReset();
          }

          return (
            <form onSubmit={handleSubmit}>
              <input type="email" name="email" autoComplete="email" />
              <button type="submit">Send reset link</button>
            </form>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: {
          appId: 'app',
          pageIds: ['login', 'forgot-password', 'dashboard'],
          patternIds: ['form', 'panel'],
        },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [
            { pageId: 'login', path: '/login', patternIds: ['form'] },
            { pageId: 'forgot-password', path: '/forgot-password', patternIds: ['form'] },
            { pageId: 'dashboard', path: '/dashboard', patternIds: ['panel'] },
          ],
          focusAreas: ['route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'route-auth-entry-return-missing'),
    ).toBe(true);
  });

  it('does not flag recovery-entry gaps when the recovery flow links back to the declared anonymous entry route', () => {
    const report = critiqueSource({
      filePath: 'src/routes/ForgotPasswordPage.tsx',
      code: `
        export function ForgotPasswordPage() {
          async function handleSubmit(event) {
            event.preventDefault();
            await auth.requestPasswordReset();
          }

          return (
            <form onSubmit={handleSubmit}>
              <input type="email" name="email" autoComplete="email" />
              <a href="/login">Back to sign in</a>
              <button type="submit">Send reset link</button>
            </form>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: {
          appId: 'app',
          pageIds: ['login', 'forgot-password', 'dashboard'],
          patternIds: ['form', 'panel'],
        },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [
            { pageId: 'login', path: '/login', patternIds: ['form'] },
            { pageId: 'forgot-password', path: '/forgot-password', patternIds: ['form'] },
            { pageId: 'dashboard', path: '/dashboard', patternIds: ['panel'] },
          ],
          focusAreas: ['route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'route-auth-entry-return-missing'),
    ).toBe(false);
  });

  it('flags registration critique files that omit a route back to the declared sign-in flow', () => {
    const report = critiqueSource({
      filePath: 'src/routes/RegisterPage.tsx',
      code: `
        export function RegisterPage() {
          async function handleSubmit(event) {
            event.preventDefault();
            await auth.signUp();
            return redirect('/dashboard');
          }

          return (
            <form onSubmit={handleSubmit}>
              <input type="email" name="email" autoComplete="email" />
              <input type="password" name="password" autoComplete="new-password" />
              <button type="submit">Create account</button>
            </form>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: {
          appId: 'app',
          pageIds: ['login', 'register', 'dashboard'],
          patternIds: ['form', 'panel'],
        },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [
            { pageId: 'login', path: '/login', patternIds: ['form'] },
            { pageId: 'register', path: '/register', patternIds: ['form'] },
            { pageId: 'dashboard', path: '/dashboard', patternIds: ['panel'] },
          ],
          focusAreas: ['route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(report.findings.some((finding) => finding.id === 'route-auth-signin-link-missing')).toBe(
      true,
    );
  });

  it('does not flag sign-in return gaps when the registration flow links back to the declared sign-in route', () => {
    const report = critiqueSource({
      filePath: 'src/routes/RegisterPage.tsx',
      code: `
        export function RegisterPage() {
          async function handleSubmit(event) {
            event.preventDefault();
            await auth.signUp();
            return redirect('/dashboard');
          }

          return (
            <form onSubmit={handleSubmit}>
              <input type="email" name="email" autoComplete="email" />
              <input type="password" name="password" autoComplete="new-password" />
              <a href="/login">Back to sign in</a>
              <button type="submit">Create account</button>
            </form>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: {
          appId: 'app',
          pageIds: ['login', 'register', 'dashboard'],
          patternIds: ['form', 'panel'],
        },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [
            { pageId: 'login', path: '/login', patternIds: ['form'] },
            { pageId: 'register', path: '/register', patternIds: ['form'] },
            { pageId: 'dashboard', path: '/dashboard', patternIds: ['panel'] },
          ],
          focusAreas: ['route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(report.findings.some((finding) => finding.id === 'route-auth-signin-link-missing')).toBe(
      false,
    );
  });

  it('flags auth entry critique files that omit a failure state', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginPage.tsx',
      code: `
        export function LoginPage() {
          async function handleSubmit(event) {
            event.preventDefault();
            await auth.signIn();
            return redirect('/dashboard');
          }

          return (
            <form onSubmit={handleSubmit}>
              <input type="email" name="email" autoComplete="email" />
              <input type="password" name="password" autoComplete="current-password" />
              <button type="submit">Sign in</button>
            </form>
          );
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login', 'dashboard'], patternIds: ['form', 'panel'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [
            { pageId: 'login', path: '/login', patternIds: ['form'] },
            { pageId: 'dashboard', path: '/dashboard', patternIds: ['panel'] },
          ],
          focusAreas: ['route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(report.findings.some((finding) => finding.id === 'state-auth-error-missing')).toBe(true);
  });

  it('flags auth flows that trust raw redirect query params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ searchParams }) {
          return redirect(searchParams.get('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth flows that trust raw URLSearchParams redirect params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect() {
          return redirect(new URLSearchParams(window.location.search).get('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth flows that trust aliased raw URLSearchParams redirect params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect() {
          const next = new URLSearchParams(window.location.search).get('next');
          return redirect(next ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags link-driven auth redirects sourced from raw query params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        import { Link } from 'react-router-dom';

        export function LoginRedirect({ searchParams }) {
          return <Link to={searchParams.get('next') ?? '/dashboard'}>Continue</Link>;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags link-driven auth redirects sourced from raw URLSearchParams during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        import { Link } from 'react-router-dom';

        export function LoginRedirect() {
          return <Link to={new URLSearchParams(window.location.search).get('next') ?? '/dashboard'}>Continue</Link>;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags link-driven auth redirects sourced from aliased raw URLSearchParams during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        import { Link } from 'react-router-dom';

        export function LoginRedirect() {
          const next = new URLSearchParams(window.location.search).get('next');
          return <Link to={next ?? '/dashboard'}>Continue</Link>;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags browser-native auth redirects sourced from raw URLSearchParams during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect() {
          window.location.assign(new URLSearchParams(window.location.search).get('next') ?? '/dashboard');
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags aliased browser-native auth redirects sourced from raw URLSearchParams during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect() {
          const next = new URLSearchParams(window.location.search).get('next');
          window.location.href = next ?? '/dashboard';
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that alias the URLSearchParams container during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect() {
          const params = new URLSearchParams(window.location.search);
          const next = params.get('next');
          return redirect(next ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that alias a URL object searchParams carrier during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect() {
          const url = new URL(window.location.href);
          const next = url.searchParams.get('next');
          window.location.assign(next ?? '/dashboard');
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that destructure location search carriers during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect() {
          const { search } = window.location;
          const next = new URLSearchParams(search).get('next');
          return redirect(next ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that destructure location href URL carriers during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect() {
          const { href } = window.location;
          const url = new URL(href);
          const next = url.searchParams.get('next');
          window.location.assign(next ?? '/dashboard');
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust globalThis location carriers during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect() {
          const next = new URLSearchParams(globalThis.location.search).get('next');
          globalThis.location.assign(next ?? '/dashboard');
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that destructure globalThis location bases during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect() {
          const { location } = globalThis;
          const { href } = location;
          const url = new URL(href);
          const next = url.searchParams.get('next');
          return redirect(next ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust aliased location objects during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect() {
          const browserLocation = window.location;
          const next = new URLSearchParams(browserLocation.search).get('next');
          browserLocation.assign(next ?? '/dashboard');
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust aliased global location href assignments during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect() {
          const browserLocation = globalThis.location;
          const url = new URL(browserLocation.href);
          const next = url.searchParams.get('next');
          browserLocation.href = next ?? '/dashboard';
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust document location carriers during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect() {
          const next = new URLSearchParams(document.location.search).get('next');
          document.location.assign(next ?? '/dashboard');
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust aliased document location objects during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect() {
          const browserLocation = document.location;
          const next = new URLSearchParams(browserLocation.search).get('next');
          browserLocation.href = next ?? '/dashboard';
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust self location carriers during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect() {
          const next = new URLSearchParams(self.location.search).get('next');
          self.location.assign(next ?? '/dashboard');
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust aliased parent location objects during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect() {
          const frameLocation = parent.location;
          const next = new URLSearchParams(frameLocation.search).get('next');
          frameLocation.href = next ?? '/dashboard';
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust bracketed self location carriers during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect() {
          const next = new URLSearchParams(self['location']['search']).get('next');
          self['location']['assign'](next ?? '/dashboard');
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust bracketed aliased frame location href assignments during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect() {
          const frameLocation = parent['location'];
          const next = new URLSearchParams(frameLocation['search']).get('next');
          frameLocation['href'] = next ?? '/dashboard';
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust bracketed location access through aliased browser bases during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect() {
          const browser = window;
          const next = new URLSearchParams(browser['location']['search']).get('next');
          browser['location']['assign'](next ?? '/dashboard');
          return null;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that destructure URL searchParams carriers and alias query keys during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect() {
          const { searchParams: params } = new URL(window.location.href);
          const queryKey = 'next';
          const next = params.get(queryKey);
          return redirect(next ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that destructure query redirect params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ router }) {
          const query = router.query;
          const { next: redirectTo } = query;
          return redirect(redirectTo ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that destructure query carriers during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ router }) {
          const { query: params } = router;
          return redirect(params.next ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that bracket-read aliased query params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ router }) {
          const query = router.query;
          const queryKey = 'next';
          const next = query[queryKey];
          return redirect(next ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that pass aliased query params through route objects during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ router }) {
          const query = router.query;
          const queryKey = 'next';
          const next = query[queryKey];
          return navigate({ pathname: next ?? '/dashboard' });
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags link-driven auth redirects that pass aliased query params through route objects during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ router }) {
          const query = router.query;
          const queryKey = 'next';
          const next = query[queryKey];
          return <Link to={{ pathname: next ?? '/dashboard' }}>Continue</Link>;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags server auth redirects that trust request URL search params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export async function GET(request) {
          const url = new URL(request.url);
          const next = url.searchParams.get('next');
          return redirect(next ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags server auth redirects that trust req URL search params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export async function GET(req) {
          return redirect(new URL(req.url).searchParams.get('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags server auth redirects that trust req nextUrl search params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export async function GET(req) {
          return redirect(req.nextUrl.searchParams.get('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags server auth redirects that trust aliased req nextUrl search params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export async function GET(req) {
          const params = req.nextUrl.searchParams;
          const queryKey = 'next';
          return redirect(params.get(queryKey) ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags server auth redirects that trust bracketed req nextUrl search-param getter calls during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export async function GET(req) {
          return redirect(req['nextUrl']['searchParams']['get']('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags server auth redirects that trust req nextUrl aliases during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export async function GET(req) {
          const nextUrl = req.nextUrl;
          return redirect(nextUrl.searchParams.get('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags server auth redirects that trust destructured req nextUrl aliases during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export async function GET(req) {
          const { nextUrl } = req;
          return redirect(nextUrl.searchParams.get('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags server auth redirects that wrap query params in URL constructors during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        import { NextResponse } from 'next/server';

        export async function GET(req) {
          const next = req.nextUrl.searchParams.get('next');
          return NextResponse.redirect(new URL(next ?? '/dashboard', req.url));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags server auth redirects that wrap query params in URL constructors with aliased req urls during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        import { NextResponse } from 'next/server';

        export async function GET(req) {
          const requestUrl = req.url;
          const next = req.nextUrl.searchParams.get('next');
          return NextResponse.redirect(new URL(next ?? '/dashboard', requestUrl));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust direct searchParams props during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ searchParams }) {
          return redirect(searchParams.next ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust aliased indexed searchParams props during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect(props) {
          const { searchParams: params } = props;
          const queryKey = 'next';
          return <Link to={{ pathname: params[queryKey] ?? '/dashboard' }}>Continue</Link>;
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust parameter-aliased searchParams props during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ searchParams: params }) {
          return redirect(params.get('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust optional searchParams getter props during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ searchParams }) {
          return redirect(searchParams?.get('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust bound searchParams getter helpers during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ searchParams }) {
          const readRedirect = searchParams.get.bind(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust local arrow helper readers during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ searchParams }) {
          const readRedirect = (key) => searchParams.get(key);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust object helper methods during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ searchParams }) {
          const helpers = {
            readRedirect(key) {
              return searchParams.get(key);
            },
          };

          return redirect(helpers.readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust destructured object helper methods during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ searchParams }) {
          const helpers = {
            readRedirect(key) {
              return searchParams.get(key);
            },
          };
          const { readRedirect } = helpers;

          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust nested object helper methods during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ searchParams }) {
          const helpers = {
            redirect: {
              readRedirect(key) {
                return searchParams.get(key);
              },
            },
          };

          return redirect(helpers.redirect.readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust destructured nested helper objects during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        export function LoginRedirect({ searchParams }) {
          const helpers = {
            redirect: {
              readRedirect(key) {
                return searchParams.get(key);
              },
            },
          };
          const { redirect: redirectHelpers } = helpers;

          return redirect(redirectHelpers.readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust object helper factories during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createRedirectHelpers(searchParams) {
          return {
            readRedirect(key) {
              return searchParams.get(key);
            },
          };
        }

        export function LoginRedirect({ searchParams }) {
          const helpers = createRedirectHelpers(searchParams);
          return redirect(helpers.readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust destructured helper-factory methods during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createRedirectHelpers(searchParams) {
          return {
            readRedirect(key) {
              return searchParams.get(key);
            },
          };
        }

        export function LoginRedirect({ searchParams }) {
          const { readRedirect } = createRedirectHelpers(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust renamed helper-factory params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createRedirectHelpers(params) {
          return {
            readRedirect(key) {
              return params.get(key);
            },
          };
        }

        export function LoginRedirect({ searchParams }) {
          const helpers = createRedirectHelpers(searchParams);
          return redirect(helpers.readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust destructured renamed helper-factory params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createRedirectHelpers(params) {
          return {
            readRedirect(key) {
              return params.get(key);
            },
          };
        }

        export function LoginRedirect({ searchParams }) {
          const { readRedirect } = createRedirectHelpers(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust function helper factories with renamed params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.get(key);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust aliased function helper factories with renamed params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const getRedirectFromQuery = (key) => params.get(key);
          return getRedirectFromQuery;
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust returned helper closures through call wrappers during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.get(key);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust returned helper closures through apply wrappers during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.get(key);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.apply(null, ['next']) ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust returned helper closures through apply wrappers with aliased args during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.get(key);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          const redirectArgs = ['next'];
          return redirect(readRedirect.apply(null, redirectArgs) ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust returned helper closures through Reflect.apply wrappers during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.get(key);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(Reflect.apply(readRedirect, null, ['next']) ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust returned helper closures through Reflect.apply wrappers with aliased args during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.get(key);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          const redirectArgs = ['next'];
          return redirect(Reflect.apply(readRedirect, null, redirectArgs) ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust bound returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.get(key);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams).bind(null);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust returned helper closures over repeated query params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0];
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapped returned helper closures over repeated query params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0];
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust returned helper closures over repeated query params with at() during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key).at(0);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapped returned helper closures over repeated query params with at() during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key).at(0);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust returned helper closures over repeated query params with shift() during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key).shift();
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapped returned helper closures over repeated query params with shift() during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key).shift();
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust returned helper closures over repeated query params with pop() during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key).pop();
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapped returned helper closures over repeated query params with pop() during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key).pop();
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust returned helper closures over repeated query params with find() during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key).find(Boolean);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapped returned helper closures over repeated query params with find() during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key).find(Boolean);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust returned helper closures over repeated query params with findLast() during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key).findLast(Boolean);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapped returned helper closures over repeated query params with findLast() during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key).findLast(Boolean);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust returned helper closures over sliced repeated query params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key).slice(-1)[0];
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapped returned helper closures over sliced repeated query params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key).slice(-1)[0];
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust returned helper closures over reversed repeated query params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key).reverse()[0];
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapped returned helper closures over reversed repeated query params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key).reverse()[0];
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust returned helper closures over non-mutating reversed repeated query params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key).toReversed()[0];
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapped returned helper closures over non-mutating reversed repeated query params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key).toReversed()[0];
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust returned helper closures over sorted repeated query params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key).sort()[0];
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapped returned helper closures over sorted repeated query params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key).sort()[0];
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust returned helper closures over non-mutating sorted repeated query params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key).toSorted()[0];
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapped returned helper closures over non-mutating sorted repeated query params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key).toSorted()[0];
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust returned helper closures over Array.from wrapped repeated query params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => Array.from(params.getAll(key))[0];
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapped returned helper closures over Array.from wrapped repeated query params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => Array.from(params.getAll(key))[0];
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust returned helper closures over spread wrapped repeated query params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => [...params.getAll(key)][0];
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapped returned helper closures over spread wrapped repeated query params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => [...params.getAll(key)][0];
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust returned helper closures over concatenated repeated query params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key).concat()[0];
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapped returned helper closures over concatenated repeated query params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key).concat()[0];
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust returned helper closures over flattened repeated query params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key).flat()[0];
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapped returned helper closures over flattened repeated query params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key).flat()[0];
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust returned helper closures over flat-mapped repeated query params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key).flatMap((value) => [value])[0];
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapped returned helper closures over flat-mapped repeated query params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key).flatMap((value) => [value])[0];
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust returned helper closures over mapped repeated query params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key).map((value) => value)[0];
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapped returned helper closures over mapped repeated query params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key).map((value) => value)[0];
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust returned helper closures over spliced repeated query params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key).splice(0, 1)[0];
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapped returned helper closures over spliced repeated query params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key).splice(0, 1)[0];
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust returned helper closures over non-mutating spliced repeated query params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key).toSpliced(0, 1)[0];
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapped returned helper closures over non-mutating spliced repeated query params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key).toSpliced(0, 1)[0];
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust returned helper closures over iterated repeated query params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key).values().next().value;
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapped returned helper closures over iterated repeated query params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key).values().next().value;
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust returned helper closures over entry-iterated repeated query params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key).entries().next().value[1];
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapped returned helper closures over entry-iterated repeated query params during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key).entries().next().value[1];
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust trimmed returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].trim();
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapped trimmed returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].trim();
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust replaced returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].replace(/^\\/+/, '/');
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapped replaced returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].replace(/^\\/+/, '/');
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust replace-all returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].replaceAll('//', '/');
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapped replace-all returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].replaceAll('//', '/');
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust substring returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].substring(0);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapped substring returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].substring(0);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust substr returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].substr(0);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapped substr returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].substr(0);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust lowercased returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].toLowerCase();
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapped lowercased returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].toLowerCase();
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust uppercased returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].toUpperCase();
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapped uppercased returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].toUpperCase();
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust locale-lowercased returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].toLocaleLowerCase();
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapped locale-lowercased returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].toLocaleLowerCase();
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust locale-uppercased returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].toLocaleUpperCase();
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapped locale-uppercased returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].toLocaleUpperCase();
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust normalized returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].normalize();
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapped normalized returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].normalize();
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust left-trimmed returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].trimStart();
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapped left-trimmed returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].trimStart();
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust right-trimmed returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].trimEnd();
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapped right-trimmed returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].trimEnd();
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust legacy-left-trimmed returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].trimLeft();
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapped legacy-left-trimmed returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].trimLeft();
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust legacy-right-trimmed returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].trimRight();
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapped legacy-right-trimmed returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].trimRight();
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust left-padded returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].padStart(12, '/');
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapped left-padded returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].padStart(12, '/');
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust right-padded returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].padEnd(12, '/');
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapped right-padded returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].padEnd(12, '/');
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust repeated-string returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].repeat(1);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect('next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapped repeated-string returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].repeat(1);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust split repeated-string returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].split('?')[0];
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust stringified repeated-string returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].toString();
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust String-wrapped repeated-string returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => String(params.getAll(key)[0]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust value-unwrapped repeated-string returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].valueOf();
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust sliced repeated-string returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].slice(0);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust locale-stringified repeated-string returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].toLocaleString();
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust split-joined repeated-string returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].split('?').join('?');
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust matched repeated-string returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].match(/^[^?]+/)?.[0];
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust matchAll-normalized repeated-string returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].matchAll(/^[^?]+/g).next().value?.[0];
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust well-formed repeated-string returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0].toWellFormed();
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust regex-exec repeated-string returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => /^[^?]+/.exec(params.getAll(key)[0])?.[0];
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust right-reduced repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key).reduceRight((_, value) => value);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust logical-or repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => params.getAll(key)[0] || '/dashboard';
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust ternary repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => key === 'next' ? params.getAll(key)[0] : '/dashboard';
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust template-wrapped repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => \`\${params.getAll(key)[0]}\`;
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust tagged-template repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => String.raw\`\${params.getAll(key)[0]}\`;
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust URI-encoded repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => encodeURI(params.getAll(key)[0]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust browser-global URI-encoded repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => globalThis.encodeURI(params.getAll(key)[0]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust bound browser-global URI-encoded repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const encodeRedirect = globalThis.encodeURI.bind(globalThis);
          return (key) => encodeRedirect(params.getAll(key)[0]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapper-based browser-global URI-encoded repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => Reflect.apply(globalThis.encodeURI, globalThis, [params.getAll(key)[0]]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapper-based browser-global legacy URI-encoded repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => Reflect.apply(globalThis.escape, globalThis, [params.getAll(key)[0]]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust direct stringified repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => String(params.getAll(key)[0]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust browser-global stringified repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => globalThis.String(params.getAll(key)[0]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapper-based browser-global stringified repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => Reflect.apply(globalThis.String, globalThis, [params.getAll(key)[0]]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust bound browser-global stringified repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const stringifyRedirect = globalThis.String.bind(globalThis);
          return (key) => stringifyRedirect(params.getAll(key)[0]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust destructured constructor-style browser-global stringified repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const { String: StringCtor } = globalThis;
          return (key) => new StringCtor(params.getAll(key)[0]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust destructured object-boxed repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const { Object: ObjectCtor } = globalThis;
          return (key) => ObjectCtor(params.getAll(key)[0]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust bound browser-global object repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const readRedirectValue = globalThis.Object.bind(globalThis);
          return (key) => readRedirectValue(params.getAll(key)[0]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust bound browser-global number repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const readRedirectValue = globalThis.Number.bind(globalThis);
          return (key) => readRedirectValue(params.getAll(key)[0]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust destructured browser-global number-boxed repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const { Number: NumberCtor } = globalThis;
          return (key) => NumberCtor(params.getAll(key)[0]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapper-based browser-global number repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const readRedirectValue = globalThis.Number;
          return (key) => readRedirectValue.call(globalThis, params.getAll(key)[0]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust apply-based browser-global number repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const readRedirectValue = globalThis.Number;
          return (key) => readRedirectValue.apply(globalThis, [params.getAll(key)[0]]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust direct browser-global number repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => Number(params.getAll(key)[0]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust reflected browser-global number repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const readRedirectValue = globalThis.Number;
          return (key) => Reflect.apply(readRedirectValue, globalThis, [params.getAll(key)[0]]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapper-based browser-global object repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const readRedirectValue = globalThis.Object;
          return (key) => readRedirectValue.call(globalThis, params.getAll(key)[0]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust apply-based browser-global object repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const readRedirectValue = globalThis.Object;
          return (key) => readRedirectValue.apply(globalThis, [params.getAll(key)[0]]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust direct browser-global object repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => Object(params.getAll(key)[0]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust reflected browser-global object repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const readRedirectValue = globalThis.Object;
          return (key) => Reflect.apply(readRedirectValue, globalThis, [params.getAll(key)[0]]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust destructured browser-global boolean-boxed repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const { Boolean: BooleanCtor } = globalThis;
          return (key) => BooleanCtor(params.getAll(key)[0]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust direct browser-global boolean repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => Boolean(params.getAll(key)[0]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust bound browser-global boolean repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const readRedirectValue = globalThis.Boolean.bind(globalThis);
          return (key) => readRedirectValue(params.getAll(key)[0]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust destructured browser-global bigint repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const { BigInt: BigIntCtor } = globalThis;
          return (key) => BigIntCtor(params.getAll(key)[0]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust direct browser-global bigint repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => BigInt(params.getAll(key)[0]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust bound browser-global bigint repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const readRedirectValue = globalThis.BigInt.bind(globalThis);
          return (key) => readRedirectValue(params.getAll(key)[0]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust destructured browser-global symbol repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const { Symbol: SymbolCtor } = globalThis;
          return (key) => SymbolCtor(params.getAll(key)[0]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust direct browser-global symbol repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          return (key) => Symbol(params.getAll(key)[0]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust bound browser-global symbol repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const readRedirectValue = globalThis.Symbol.bind(globalThis);
          return (key) => readRedirectValue(params.getAll(key)[0]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust wrapper-based browser-global boolean repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const readRedirectValue = globalThis.Boolean;
          return (key) => readRedirectValue.call(globalThis, params.getAll(key)[0]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust apply-based browser-global boolean repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const readRedirectValue = globalThis.Boolean;
          return (key) => readRedirectValue.apply(globalThis, [params.getAll(key)[0]]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });

  it('flags auth redirects that trust reflected browser-global boolean repeated-query returned helper closures during critique', () => {
    const report = critiqueSource({
      filePath: 'src/routes/LoginRedirect.tsx',
      code: `
        function createReadRedirect(params) {
          const readRedirectValue = globalThis.Boolean;
          return (key) => Reflect.apply(readRedirectValue, globalThis, [params.getAll(key)[0]]);
        }

        export function LoginRedirect({ searchParams }) {
          const readRedirect = createReadRedirect(searchParams);
          return redirect(readRedirect.call(null, 'next'));
        }
      `,
      reviewPack: {
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['login'], patternIds: ['form'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: ['auth'],
          routes: [{ pageId: 'login', path: '/login', patternIds: ['form'] }],
          focusAreas: ['security-hygiene', 'route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(
      report.findings.some((finding) => finding.id === 'security-auth-open-redirect-risk'),
    ).toBe(true);
  });
});
