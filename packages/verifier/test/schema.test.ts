import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { auditProject, critiqueSource, scanProject } from '../src/index.js';
import { assertMatchesVerifierSchema } from './helpers/schema-assert.js';

function createProjectRoot(): string {
  return mkdtempSync(join(tmpdir(), 'decantr-verifier-schema-'));
}

describe('verifier schema contracts', () => {
  it('emits project audit reports matching the published schema', async () => {
    const projectRoot = createProjectRoot();
    try {
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
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
              features: [],
              sections: [
                {
                  id: 'marketing',
                  role: 'public',
                  shell: 'sidebar-main',
                  features: [],
                  description: 'Marketing surface',
                  pages: [{ id: 'home', route: '/', layout: ['hero'] }],
                },
              ],
              routes: { '/': { section: 'marketing', page: 'home' } },
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'hash' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );

      const report = await auditProject(projectRoot);
      assertMatchesVerifierSchema('project-audit-report.v1.json', report);
      expect(report.$schema).toBe('https://decantr.ai/schemas/project-audit-report.v1.json');
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('emits file critique reports matching the published schema', async () => {
    const projectRoot = createProjectRoot();
    try {
      await mkdir(join(projectRoot, '.decantr', 'context'), { recursive: true });
      const report = critiqueSource({
        filePath: join(projectRoot, 'src', 'pages', 'Home.tsx'),
        code: '<button className="d-interactive" aria-label="Save" onKeyDown={() => {}}>Save</button>\n',
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
            focusAreas: ['accessibility', 'treatment-usage'],
            workflow: [],
          },
          renderedMarkdown: '# Review Pack\n',
        },
      });

      assertMatchesVerifierSchema('file-critique-report.v1.json', report);
      expect(report.$schema).toBe('https://decantr.ai/schemas/file-critique-report.v1.json');
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('emits Brownfield scan reports matching the published schema', async () => {
    const projectRoot = createProjectRoot();
    try {
      writeFileSync(
        join(projectRoot, 'package.json'),
        JSON.stringify(
          {
            name: 'scan-schema-app',
            dependencies: {
              react: '^19.0.0',
              'react-router-dom': '^7.0.0',
            },
          },
          null,
          2,
        ),
      );
      await mkdir(join(projectRoot, 'src'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'src', 'App.tsx'),
        'import { Route, Routes } from "react-router-dom"; export function App() { return <Routes><Route path="/" element={<main />} /></Routes>; }\n',
      );

      const report = await scanProject(projectRoot);
      assertMatchesVerifierSchema('scan-report.v1.json', report);
      expect(report.$schema).toBe('https://decantr.ai/schemas/scan-report.v1.json');
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('accepts project health reports matching the published schema', () => {
    const report = {
      $schema: 'https://decantr.ai/schemas/project-health-report.v1.json',
      generatedAt: '2026-05-08T14:00:00.000Z',
      projectRoot: '/workspace/app',
      status: 'warning',
      score: 95,
      summary: {
        errorCount: 0,
        warnCount: 1,
        infoCount: 0,
        findingCount: 1,
        workflowMode: 'brownfield-attach',
        adoptionMode: 'contract-only',
        essenceVersion: '4.0.0',
        pageCount: 3,
        runtimeAuditChecked: false,
        runtimePassed: null,
        packManifestPresent: true,
        reviewPackPresent: true,
      },
      routes: {
        declared: ['/', '/dashboard'],
        runtimeChecked: [],
        runtimeMatched: 0,
        runtimeCoverageOk: null,
        issues: ['Observed routes are missing from the Decantr contract.'],
      },
      packs: {
        manifestPresent: true,
        reviewPackPresent: true,
        scaffoldPackPresent: true,
        sectionPackCount: 1,
        pagePackCount: 2,
        mutationPackCount: 2,
        generatedAt: '2026-05-08T14:00:00.000Z',
      },
      ci: {
        recommendedCommand: 'decantr ci --fail-on error',
        failOn: 'error',
      },
      findings: [
        {
          id: 'brownfield-route-drift',
          source: 'brownfield',
          category: 'Brownfield',
          severity: 'warn',
          message: 'Observed routes are missing from the Decantr contract.',
          evidence: ['Route: /settings'],
          rule: 'brownfield-route-drift',
          suggestedFix: 'Regenerate a brownfield proposal.',
          remediation: {
            summary: 'Merge observed routes into the contract.',
            prompt: 'Fix the Decantr route drift and rerun decantr health.',
            commands: ['decantr analyze', 'decantr health'],
          },
        },
      ],
    };

    assertMatchesVerifierSchema('project-health-report.v1.json', report);
  });

  it('accepts Decantr CI reports matching the published schema', () => {
    const report = {
      $schema: 'https://decantr.ai/schemas/decantr-ci-report.v1.json',
      generatedAt: '2026-05-14T14:00:00.000Z',
      mode: 'project',
      projectPath: 'apps/web',
      failOn: 'error',
      status: 'healthy',
      health: {
        $schema: 'https://decantr.ai/schemas/project-health-report.v1.json',
        generatedAt: '2026-05-14T14:00:00.000Z',
        projectRoot: '/workspace/apps/web',
        status: 'healthy',
        score: 100,
        summary: {
          errorCount: 0,
          warnCount: 0,
          infoCount: 0,
          findingCount: 0,
          workflowMode: 'brownfield-attach',
          adoptionMode: 'contract-only',
          essenceVersion: '4.0.0',
          pageCount: 1,
          runtimeAuditChecked: false,
          runtimePassed: null,
          packManifestPresent: true,
          reviewPackPresent: true,
        },
        routes: {
          declared: ['/'],
          runtimeChecked: [],
          runtimeMatched: 0,
          runtimeCoverageOk: null,
          issues: [],
        },
        packs: {
          manifestPresent: true,
          reviewPackPresent: true,
          scaffoldPackPresent: true,
          sectionPackCount: 1,
          pagePackCount: 1,
          mutationPackCount: 0,
          generatedAt: '2026-05-14T14:00:00.000Z',
        },
        ci: {
          recommendedCommand: 'decantr ci --fail-on error',
          failOn: 'error',
        },
        findings: [],
      },
      localLaw: {
        checked: true,
        patternsPresent: true,
        rulesPresent: true,
        warnings: [],
        findings: [
          {
            ruleId: 'no-inline-style',
            severity: 'warn',
            file: 'src/App.tsx',
            line: 12,
            column: 9,
            message: 'Inline style found in UI template.',
            suggestedFix: 'Use the project-owned style system.',
          },
        ],
        errorCount: 0,
        warnCount: 1,
      },
    };

    assertMatchesVerifierSchema('decantr-ci-report.v1.json', report);
  });

  it('accepts evidence bundles matching the published schema', () => {
    const bundle = {
      $schema: 'https://decantr.ai/schemas/evidence-bundle.v1.json',
      generatedAt: '2026-05-12T14:00:00.000Z',
      project: { id: 'project_abc123', rootLabel: 'app' },
      toolchain: { verifierVersion: '2.0.0' },
      privacy: {
        localOnly: true,
        redactedFields: ['source', 'prompt', 'secret', 'absolute_path'],
        screenshotsLocalOnly: true,
      },
      health: {
        status: 'warning',
        score: 95,
        errorCount: 0,
        warnCount: 1,
        infoCount: 0,
        findingCount: 1,
      },
      provenance: {
        essence: {
          path: 'decantr.essence.json',
          present: true,
          hash: '9e2d5d3f6a3f2c1b',
          generatedAt: '2026-05-12T14:00:00.000Z',
        },
        packManifest: {
          path: '.decantr/context/pack-manifest.json',
          present: true,
          hash: '7e2d5d3f6a3f2c1b',
          generatedAt: '2026-05-12T14:00:00.000Z',
        },
        reviewPack: {
          path: '.decantr/context/review-pack.json',
          present: true,
          hash: '6e2d5d3f6a3f2c1b',
          generatedAt: '2026-05-12T14:00:00.000Z',
        },
      },
      assertions: [
        {
          id: 'contract.essence.present',
          category: 'context',
          status: 'passed',
          severity: 'info',
          message: 'Decantr Essence contract is present.',
          evidence: ['decantr.essence.json'],
          rule: 'essence-present',
        },
      ],
      findings: [
        {
          id: 'assertion-contract-context-pack-manifest',
          source: 'assertion',
          category: 'Contract context',
          severity: 'warn',
          message: 'Compiled execution pack manifest is missing.',
          evidence: ['.decantr/context/pack-manifest.json'],
          rule: 'pack-manifest-present',
          suggestedFix: 'Run `decantr refresh`.',
          remediationSummary: 'Run `decantr refresh`.',
          commands: ['decantr refresh', 'decantr health --evidence'],
          promptCommand: 'decantr health --prompt assertion-contract-context-pack-manifest',
        },
      ],
    };

    assertMatchesVerifierSchema('evidence-bundle.v1.json', bundle);
  });

  it('accepts workspace health reports matching the published schema', () => {
    const report = {
      $schema: 'https://decantr.ai/schemas/workspace-health-report.v1.json',
      generatedAt: '2026-05-12T14:00:00.000Z',
      workspaceRoot: '/workspace',
      changedOnly: false,
      since: null,
      summary: {
        projectCount: 1,
        checkedCount: 1,
        healthyCount: 1,
        warningCount: 0,
        errorCount: 0,
        failedCount: 0,
      },
      projects: [
        {
          id: 'apps-web',
          path: 'apps/web',
          status: 'healthy',
          score: 100,
          errorCount: 0,
          warnCount: 0,
          infoCount: 0,
          findingCount: 0,
          durationMs: 14,
          changed: false,
          source: 'auto',
          error: null,
        },
      ],
    };

    assertMatchesVerifierSchema('workspace-health-report.v1.json', report);
  });

  it('matches the published showcase shortlist schema for the checked-in report artifact', () => {
    const shortlistReport = JSON.parse(
      readFileSync(
        new URL('../../../apps/showcase/reports/shortlist-verification.json', import.meta.url),
        'utf-8',
      ),
    );

    assertMatchesVerifierSchema('showcase-shortlist-report.v1.json', shortlistReport);
    expect(shortlistReport.$schema).toBe(
      'https://decantr.ai/schemas/showcase-shortlist-report.v1.json',
    );
  });
});
