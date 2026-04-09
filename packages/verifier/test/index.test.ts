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

  it('reports partial runtime route coverage when only some compiled routes survive the build output', async () => {
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
                pages: [
                  { id: 'home', route: '/', layout: ['hero'] },
                  { id: 'dashboard', route: '/dashboard', layout: ['hero'] },
                  { id: 'settings', route: '/settings', layout: ['hero'] },
                ],
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
        '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Partial Routes</title></head><body><div id="root"></div><script type="module" src="/assets/app.js"></script></body></html>\n',
      );
      writeFileSync(join(projectRoot, 'dist', 'assets', 'app.js'), 'console.log("/"); console.log("/dashboard");\n');
      writeFileSync(join(projectRoot, 'dist', 'dashboard'), '<!doctype html><html><body><p>bad route shell</p></body></html>\n');

      const report = await auditProject(projectRoot);
      expect(report.runtimeAudit.routeHintsChecked).toEqual(['/', '/dashboard', '/settings']);
      expect(report.runtimeAudit.routeHintsMatched).toBe(2);
      expect(report.runtimeAudit.routeDocumentsPassed).toBe(2);
      expect(report.findings.some(finding => finding.id === 'runtime-route-hints-partial')).toBe(true);
      expect(report.findings.some(finding => finding.id === 'runtime-route-documents-partial')).toBe(true);
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

  it('reports suspicious auth route placement in gateway and primary sections', async () => {
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
                id: 'gateway',
                role: 'gateway',
                pages: [{ id: 'entry', route: '/dashboard', layout: ['hero'] }],
              },
              {
                id: 'workspace',
                role: 'primary',
                pages: [{ id: 'login', route: '/login', layout: ['hero'] }],
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
      expect(report.findings.some(finding => finding.id === 'auth-gateway-routes-look-protected')).toBe(true);
      expect(report.findings.some(finding => finding.id === 'auth-gateway-routes-not-auth-like')).toBe(true);
      expect(report.findings.some(finding => finding.id === 'auth-primary-routes-look-auth-only')).toBe(true);
      expect(report.findings.some(finding => finding.id === 'auth-primary-routes-not-app-like')).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('reports overlapping auth routes between gateway and primary sections', async () => {
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
                id: 'gateway',
                role: 'gateway',
                pages: [{ id: 'login', route: '/login', layout: ['hero'] }],
              },
              {
                id: 'workspace',
                role: 'primary',
                pages: [{ id: 'login-app', route: '/login', layout: ['hero'] }],
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
      expect(report.findings.some(finding => finding.id === 'auth-gateway-primary-route-overlap')).toBe(true);
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

  it('flags unlabeled form controls during critique', () => {
    const report = critiqueSource({
      filePath: 'src/components/LoginForm.tsx',
      code: `
        export function LoginForm() {
          return (
            <form>
              <input type="email" placeholder="Email" />
              <label>
                Password
                <input type="password" />
              </label>
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
          routes: [{ pageId: 'login', path: '/', patternIds: ['form'] }],
          focusAreas: ['accessibility'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(report.findings.some(finding => finding.id === 'accessibility-form-control-label-missing')).toBe(true);
  });

  it('flags placeholder navigation targets during critique', () => {
    const report = critiqueSource({
      filePath: 'src/components/NavLinks.tsx',
      code: `
        export function NavLinks() {
          return (
            <nav>
              <a href="#">Overview</a>
              <Link to="javascript:void(0)">Settings</Link>
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
        scope: { appId: 'app', pageIds: ['overview', 'settings'], patternIds: ['nav'] },
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
          routes: [
            { pageId: 'overview', path: '/', patternIds: ['nav'] },
            { pageId: 'settings', path: '/settings', patternIds: ['nav'] },
          ],
          focusAreas: ['route-topology'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(report.findings.some(finding => finding.id === 'route-placeholder-navigation-target')).toBe(true);
  });

  it('flags auth inputs without autocomplete hints during critique', () => {
    const report = critiqueSource({
      filePath: 'src/components/AuthForm.tsx',
      code: `
        export function AuthForm() {
          return (
            <form>
              <label htmlFor="email">Email</label>
              <input id="email" type="email" />
              <label htmlFor="password">Password</label>
              <input id="password" type="password" />
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
          routes: [{ pageId: 'login', path: '/', patternIds: ['form'] }],
          focusAreas: ['accessibility', 'security-hygiene'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(report.findings.some(finding => finding.id === 'security-auth-autocomplete-missing')).toBe(true);
  });

  it('flags buttons inside forms that omit an explicit type', () => {
    const report = critiqueSource({
      filePath: 'src/components/ProfileForm.tsx',
      code: `
        export function ProfileForm() {
          return (
            <form>
              <button>Open help</button>
              <button type="submit">Save</button>
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
        scope: { appId: 'app', pageIds: ['profile'], patternIds: ['form'] },
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
          routes: [{ pageId: 'profile', path: '/profile', patternIds: ['form'] }],
          focusAreas: ['motion-interaction'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(report.findings.some(finding => finding.id === 'interaction-button-type-missing')).toBe(true);
  });

  it('flags auth-like credential writes into browser storage during critique', () => {
    const report = critiqueSource({
      filePath: 'src/lib/session.ts',
      code: `
        export function persistSession(token: string) {
          localStorage.setItem('auth_token', token);
          sessionStorage.jwt = token;
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
          routes: [{ pageId: 'login', path: '/', patternIds: ['form'] }],
          focusAreas: ['security-hygiene'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      },
    });

    expect(report.findings.some(finding => finding.id === 'security-auth-storage-write')).toBe(true);
  });
});
