import { describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { auditBuiltDist, auditProject, critiqueFile, critiqueSource, extractRouteHintsFromEssence } from '../src/index.js';

function createProjectRoot(): string {
  return mkdtempSync(join(tmpdir(), 'decantr-verifier-'));
}

describe('verifier', () => {
  it('audits project contract and reports missing review packs', async () => {
    const projectRoot = createProjectRoot();
    try {
      writeFileSync(join(projectRoot, 'decantr.essence.json'), JSON.stringify({
        version: '3.0.0',
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
          pages: [{ id: 'home', layout: ['hero'] }],
          features: [],
        },
        meta: {
          archetype: 'marketing',
          target: 'react',
          platform: { type: 'spa', routing: 'hash' },
          guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
        },
      }, null, 2));

      const report = await auditProject(projectRoot);
      expect(report.valid).toBe(true);
      expect(report.summary.reviewPackPresent).toBe(false);
      expect(report.summary.runtimeAuditChecked).toBe(false);
      expect(report.runtimeAudit.distPresent).toBe(false);
      expect(report.findings.some(finding => finding.id === 'review-pack-file-missing')).toBe(true);
      expect(report.findings.some(finding => finding.id === 'runtime-dist-missing')).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('audits built dist output and reports runtime title failures', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'dist', 'assets'), { recursive: true });
      writeFileSync(join(projectRoot, 'decantr.essence.json'), JSON.stringify({
        version: '3.0.0',
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
              role: 'main',
              pages: [{ id: 'home', route: '/dashboard', layout: ['hero'] }],
            },
          ],
          features: [],
        },
        meta: {
          archetype: 'marketing',
          target: 'react',
          platform: { type: 'spa', routing: 'pathname' },
          guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
        },
      }, null, 2));
      writeFileSync(
        join(projectRoot, 'dist', 'index.html'),
        '<!doctype html><html><head></head><body><div id="root"></div><script type="module" src="/assets/app.js"></script></body></html>\n',
      );
      writeFileSync(join(projectRoot, 'dist', 'assets', 'app.js'), 'console.log("/dashboard");\n');

      const report = await auditProject(projectRoot);
      expect(report.summary.runtimeAuditChecked).toBe(true);
      expect(report.runtimeAudit.distPresent).toBe(true);
      expect(report.runtimeAudit.indexPresent).toBe(true);
      expect(report.runtimeAudit.passed).toBe(false);
      expect(report.runtimeAudit.langOk).toBe(false);
      expect(report.runtimeAudit.viewportOk).toBe(false);
      expect(report.runtimeAudit.jsAssetBytes).toBeGreaterThan(0);
      expect(report.runtimeAudit.totalAssetBytes).toBeGreaterThan(0);
      expect(report.findings.some(finding => finding.id === 'runtime-title-missing')).toBe(true);
      expect(report.findings.some(finding => finding.id === 'runtime-lang-missing')).toBe(true);
      expect(report.findings.some(finding => finding.id === 'runtime-viewport-missing')).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('reports oversized built JavaScript bundles', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'dist', 'assets'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify({
          version: '3.0.0',
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
                role: 'main',
                pages: [{ id: 'home', route: '/dashboard', layout: ['hero'] }],
              },
            ],
            features: [],
          },
          meta: {
            archetype: 'marketing',
            target: 'react',
            platform: { type: 'spa', routing: 'pathname' },
            guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
          },
        }, null, 2),
      );
      writeFileSync(
        join(projectRoot, 'dist', 'index.html'),
        '<!doctype html><html><head><title>Large App</title><link rel="stylesheet" href="/assets/app.css"></head><body><div id="root"></div><script type="module" src="/assets/app.js"></script></body></html>\n',
      );
      writeFileSync(join(projectRoot, 'dist', 'assets', 'app.css'), '.app{color:#111;}\n');
      writeFileSync(
        join(projectRoot, 'dist', 'assets', 'app.js'),
        `console.log("/dashboard");\n${'x'.repeat(410_000)}`,
      );

      const report = await auditProject(projectRoot);
      expect(report.runtimeAudit.largestAssetPath).toBe('/assets/app.js');
      expect(report.runtimeAudit.largestAssetBytes).toBeGreaterThan(350_000);
      expect(report.runtimeAudit.jsAssetBytes).toBeGreaterThan(350_000);
      expect(report.findings.some(finding => finding.id === 'runtime-js-bundle-large')).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('reports document hardening risks in the built root document', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'dist', 'assets'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify({
          version: '3.0.0',
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
            pages: [{ id: 'home', route: '/', layout: ['hero'] }],
            features: [],
          },
          meta: {
            archetype: 'marketing',
            target: 'react',
            platform: { type: 'spa', routing: 'pathname' },
            guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
          },
        }, null, 2),
      );
      writeFileSync(
        join(projectRoot, 'dist', 'index.html'),
        '<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Secure-ish App</title><script>window.__BOOTSTRAP__ = true;</script><script src="https://cdn.example.com/widget.js"></script></head><body><div id="root"></div><script type="module" src="/assets/app.js"></script></body></html>\n',
      );
      writeFileSync(
        join(projectRoot, 'dist', 'assets', 'app.js'),
        'eval("boot()"); document.write("<p>unsafe</p>"); console.log("/");\n',
      );

      const report = await auditProject(projectRoot);
      expect(report.runtimeAudit.charsetOk).toBe(false);
      expect(report.runtimeAudit.cspSignalOk).toBe(false);
      expect(report.runtimeAudit.inlineScriptCount).toBe(1);
      expect(report.runtimeAudit.externalScriptsWithoutIntegrityCount).toBe(1);
      expect(report.runtimeAudit.jsEvalSignalCount).toBe(1);
      expect(report.runtimeAudit.jsHtmlInjectionSignalCount).toBe(1);
      expect(report.findings.some(finding => finding.id === 'runtime-charset-missing')).toBe(true);
      expect(report.findings.some(finding => finding.id === 'runtime-inline-scripts-present')).toBe(true);
      expect(report.findings.some(finding => finding.id === 'runtime-external-scripts-without-integrity')).toBe(true);
      expect(report.findings.some(finding => finding.id === 'runtime-js-dynamic-code-signals')).toBe(true);
      expect(report.findings.some(finding => finding.id === 'runtime-js-html-injection-signals')).toBe(true);
      expect(report.findings.some(finding => finding.id === 'runtime-csp-signal-missing')).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('reports missing auth topology surfaces from the essence contract', async () => {
    const projectRoot = createProjectRoot();
    try {
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify({
          version: '3.0.0',
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
                id: 'workspace',
                role: 'primary',
                pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
              },
            ],
            features: ['auth'],
          },
          meta: {
            archetype: 'marketing',
            target: 'react',
            platform: { type: 'spa', routing: 'pathname' },
            guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
          },
        }, null, 2),
      );

      const report = await auditProject(projectRoot);
      expect(report.findings.some(finding => finding.id === 'auth-gateway-section-missing')).toBe(true);
      expect(report.findings.some(finding => finding.id === 'auth-entry-route-missing')).toBe(true);
      expect(report.findings.some(finding => finding.id === 'auth-primary-section-missing')).toBe(false);
      expect(report.findings.some(finding => finding.id === 'auth-primary-routes-missing')).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('audits built dist directly with explicit route hints', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'dist', 'assets'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'dist', 'index.html'),
        '<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Showcase</title></head><body><div id="root"></div><script type="module" src="/assets/app.js"></script></body></html>\n',
      );
      writeFileSync(join(projectRoot, 'dist', 'assets', 'app.js'), 'console.log("/dashboard");\n');

      const report = await auditBuiltDist(projectRoot, {
        routeHints: ['/', '/dashboard'],
      });

      expect(report.checked).toBe(true);
      expect(report.distPresent).toBe(true);
      expect(report.indexPresent).toBe(true);
      expect(report.routeHintsChecked).toEqual(['/', '/dashboard']);
      expect(report.passed).toBe(true);
      expect(report.langOk).toBe(true);
      expect(report.viewportOk).toBe(true);
      expect(report.charsetOk).toBe(false);
      expect(report.cspSignalOk).toBe(false);
      expect(report.inlineScriptCount).toBe(0);
      expect(report.externalScriptsWithoutIntegrityCount).toBe(0);
      expect(report.jsEvalSignalCount).toBe(0);
      expect(report.jsHtmlInjectionSignalCount).toBe(0);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('extracts normalized route hints from v3 essence files', () => {
    const hints = extractRouteHintsFromEssence({
      version: '3.0.0',
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
            role: 'main',
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
      writeFileSync(join(projectRoot, '.decantr', 'context', 'review-pack.json'), JSON.stringify({
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
            guidance: 'Move visual styling into tokens.css and treatments.css instead of component-local style objects.',
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
      }, null, 2));
      writeFileSync(join(projectRoot, 'src', 'styles', 'treatments.css'), '.brand-accent { color: var(--d-primary); }\n');
      const filePath = join(projectRoot, 'Example.tsx');
      writeFileSync(filePath, '<button className="plain" style={{ color: "#ff00ff" }}>Click me</button>\n');

      const report = await critiqueFile(filePath, projectRoot);
      expect(report.reviewPack?.packType).toBe('review');
      expect(report.focusAreas).toContain('accessibility');
      expect(report.findings.some(finding => finding.id === 'theme-consistency-weak')).toBe(true);
      expect(report.findings.some(finding => finding.id === 'anti-pattern-inline-styles')).toBe(true);
      expect(report.findings.some(finding => finding.id === 'anti-pattern-hardcoded-colors')).toBe(true);
      expect(report.findings.some(finding => finding.id === 'responsive-signals-missing')).toBe(true);
      expect(report.scores.some(score => score.category === 'Topology Context')).toBe(true);
    } finally {
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
            guidance: 'Move visual styling into tokens.css and treatments.css instead of component-local style objects.',
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
        pages: [{ id: 'home', markdown: 'page-home-pack.md', json: 'page-home-pack.json', sectionId: 'main', sectionRole: 'primary' }],
        mutations: [],
      },
      treatmentsCss: '.brand-accent { color: var(--d-primary); }\n',
    });

    expect(report.file).toBe('src/pages/Home.tsx');
    expect(report.reviewPack?.packType).toBe('review');
    expect(report.findings.some(finding => finding.id === 'anti-pattern-inline-styles')).toBe(true);
    expect(report.findings.some(finding => finding.id === 'anti-pattern-hardcoded-colors')).toBe(true);
  });

  it('flags dangerous HTML injection and dynamic evaluation patterns during critique', () => {
    const report = critiqueSource({
      filePath: 'src/pages/Danger.tsx',
      code: `
        export function Danger({ html, expression }: { html: string; expression: string }) {
          const output = eval(expression);
          return (
            <section>
              <div dangerouslySetInnerHTML={{ __html: html }} />
              <button onClick={() => document.body.innerHTML = "<p>bad</p>"}>{output}</button>
            </section>
          );
        }
      `,
    });

    expect(report.scores.some(score => score.category === 'Security Hygiene')).toBe(true);
    expect(report.findings.some(finding => finding.id === 'security-dangerously-set-html')).toBe(true);
    expect(report.findings.some(finding => finding.id === 'security-raw-html-injection')).toBe(true);
    expect(report.findings.some(finding => finding.id === 'security-dynamic-code-eval')).toBe(true);
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

    expect(report.findings.some(finding => finding.id === 'accessibility-icon-button-label-missing')).toBe(true);
    expect(report.findings.some(finding => finding.id === 'accessibility-clickable-non-semantic')).toBe(true);
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

    expect(report.findings.some(finding => finding.id === 'accessibility-image-alt-missing')).toBe(true);
    expect(report.findings.some(finding => finding.id === 'security-target-blank-rel-missing')).toBe(true);
  });
});
