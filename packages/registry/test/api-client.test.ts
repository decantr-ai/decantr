import { afterEach, describe, expect, it, vi } from 'vitest';
import { RegistryAPIClient } from '../src/api-client.js';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe('RegistryAPIClient showcase endpoints', () => {
  it('requests hosted project audit reports', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        $schema: 'https://decantr.ai/schemas/project-audit-report.v1.json',
        projectRoot: '[hosted-audit]',
        valid: true,
        essence: { version: '2.0.0' },
        reviewPack: null,
        packManifest: null,
        runtimeAudit: {
          distPresent: true,
          indexPresent: true,
          checked: true,
          passed: true,
          rootDocumentOk: true,
          titleOk: true,
          langOk: true,
          viewportOk: true,
          charsetOk: true,
          cspSignalOk: true,
          inlineScriptCount: 0,
          externalScriptsWithoutIntegrityCount: 0,
          jsEvalSignalCount: 0,
          jsHtmlInjectionSignalCount: 0,
          assetCount: 1,
          assetsPassed: 1,
          routeHintsChecked: ['/'],
          routeHintsMatched: 1,
          routeDocumentsChecked: 1,
          routeDocumentsPassed: 1,
          totalAssetBytes: 1200,
          jsAssetBytes: 1200,
          cssAssetBytes: 0,
          largestAssetPath: '/assets/app.js',
          largestAssetBytes: 1200,
          failures: [],
        },
        findings: [],
        summary: {
          errorCount: 0,
          warnCount: 0,
          infoCount: 0,
          essenceVersion: '2.0.0',
          reviewPackPresent: true,
          packManifestPresent: true,
          runtimeAuditChecked: true,
          runtimePassed: true,
          pageCount: 1,
        },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = new RegistryAPIClient({ baseUrl: 'https://api.example.com/v1' });
    const result = await client.auditProject({
      essence: {
        version: '2.0.0',
        archetype: 'dashboard',
        theme: { id: 'clean', mode: 'light' },
        personality: ['professional'],
        platform: { type: 'spa', routing: 'history' },
        structure: [{ id: 'home', shell: 'sidebar-main', layout: ['hero'] }],
        features: ['auth'],
        density: { level: 'comfortable', content_gap: '1.5rem' },
        guard: { mode: 'guided' },
        target: 'react',
      },
      dist: {
        indexHtml: '<!doctype html><html><head><title>Audit</title></head><body><div id="root"></div><script type="module" src="/assets/app.js"></script></body></html>',
        assets: {
          '/assets/app.js': 'console.log("/");',
        },
      },
    }, { namespace: '@official' });

    expect(result.$schema).toBe('https://decantr.ai/schemas/project-audit-report.v1.json');
    expect(result.summary.runtimeAuditChecked).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.example.com/v1/audit/project?namespace=%40official',
      expect.objectContaining({
        method: 'POST',
      }),
    );
  });

  it('requests hosted file critique reports', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        $schema: 'https://decantr.ai/schemas/file-critique-report.v1.json',
        file: 'src/pages/Home.tsx',
        overall: 2.4,
        scores: [],
        findings: [
          {
            id: 'anti-pattern-inline-styles',
            category: 'Anti-Patterns',
            severity: 'warn',
            message: 'Inline style literals were detected in the reviewed file.',
            evidence: ['src/pages/Home.tsx'],
            file: 'src/pages/Home.tsx',
          },
        ],
        focusAreas: ['theme-consistency'],
        reviewPack: null,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = new RegistryAPIClient({ baseUrl: 'https://api.example.com/v1' });
    const result = await client.critiqueFile({
      essence: {
        version: '2.0.0',
        archetype: 'dashboard',
        theme: { id: 'clean', mode: 'light' },
        personality: ['professional'],
        platform: { type: 'spa', routing: 'history' },
        structure: [{ id: 'home', shell: 'sidebar-main', layout: ['hero'] }],
        features: ['auth'],
        density: { level: 'comfortable', content_gap: '1.5rem' },
        guard: { mode: 'guided' },
        target: 'react',
      },
      filePath: 'src/pages/Home.tsx',
      code: '<button style={{ color: "#ff00ff" }}>Click me</button>',
    }, { namespace: '@official' });

    expect(result.$schema).toBe('https://decantr.ai/schemas/file-critique-report.v1.json');
    expect(result.file).toBe('src/pages/Home.tsx');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.example.com/v1/critique/file?namespace=%40official',
      expect.objectContaining({
        method: 'POST',
      }),
    );
  });

  it('compiles hosted execution packs from an essence document', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        $schema: 'https://decantr.ai/schemas/execution-pack-bundle.v1.json',
        generatedAt: '2026-04-09T00:00:00.000Z',
        sourceEssenceVersion: '2.0.0',
        manifest: {
          $schema: 'https://decantr.ai/schemas/pack-manifest.v1.json',
          version: '1.0.0',
          generatedAt: '2026-04-09T00:00:00.000Z',
          scaffold: { id: 'scaffold', markdown: 'scaffold-pack.md', json: 'scaffold-pack.json' },
          review: { id: 'review', markdown: 'review-pack.md', json: 'review-pack.json' },
          sections: [{ id: 'dashboard', markdown: 'section-dashboard-pack.md', json: 'section-dashboard-pack.json', pageIds: ['home'] }],
          pages: [{ id: 'home', markdown: 'page-home-pack.md', json: 'page-home-pack.json', sectionId: 'dashboard', sectionRole: 'primary' }],
          mutations: [{ id: 'add-page', markdown: 'mutation-add-page-pack.md', json: 'mutation-add-page-pack.json', mutationType: 'add-page' }],
        },
        scaffold: {
          $schema: 'https://decantr.ai/schemas/scaffold-pack.v1.json',
          packVersion: '1.0.0',
          packType: 'scaffold',
          objective: 'Scaffold the clean app shell and declared routes.',
          target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
          preset: null,
          scope: { appId: 'app', pageIds: ['home'], patternIds: ['hero'] },
          requiredSetup: ['Treat routes as source of truth.'],
          allowedVocabulary: ['clean', 'hero'],
          examples: [],
          antiPatterns: [],
          successChecks: [],
          tokenBudget: { target: 1400, max: 2200, strategy: ['compact'] },
          data: {
            shell: 'sidebar-main',
            theme: { id: 'clean', mode: 'light', shape: null },
            routing: 'history',
            features: ['auth'],
            routes: [{ pageId: 'home', path: '/', patternIds: ['hero'] }],
          },
          renderedMarkdown: '# Scaffold Pack\n',
        },
        review: {
          $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
          packVersion: '1.0.0',
          packType: 'review',
          objective: 'Review generated output against the compiled Decantr contract.',
          target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
          preset: null,
          scope: { appId: 'app', pageIds: ['home'], patternIds: ['hero'] },
          requiredSetup: ['Read the compiled scaffold and route packs before reviewing code.'],
          allowedVocabulary: ['route-topology'],
          examples: [],
          antiPatterns: [],
          successChecks: [],
          tokenBudget: { target: 1400, max: 2200, strategy: ['compact'] },
          data: {
            reviewType: 'app',
            shell: 'sidebar-main',
            theme: { id: 'clean', mode: 'light', shape: null },
            routing: 'history',
            features: ['auth'],
            routes: [{ pageId: 'home', path: '/', patternIds: ['hero'] }],
            focusAreas: ['route-topology'],
            workflow: ['Read the scaffold pack first.'],
          },
          renderedMarkdown: '# Review Pack\n',
        },
        sections: [],
        pages: [],
        mutations: [],
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = new RegistryAPIClient({ baseUrl: 'https://api.example.com/v1' });
    const result = await client.compileExecutionPacks({
      version: '2.0.0',
      archetype: 'dashboard',
      theme: { id: 'clean', mode: 'light' },
      personality: ['professional'],
      platform: { type: 'spa', routing: 'history' },
      structure: [{ id: 'home', shell: 'sidebar-main', layout: ['hero'] }],
      features: ['auth'],
      density: { level: 'comfortable', content_gap: '1.5rem' },
      guard: { mode: 'guided' },
      target: 'react',
    }, { namespace: '@official' });

    expect(result.$schema).toBe('https://decantr.ai/schemas/execution-pack-bundle.v1.json');
    expect(result.manifest.scaffold?.markdown).toBe('scaffold-pack.md');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.example.com/v1/packs/compile?namespace=%40official',
      expect.objectContaining({
        method: 'POST',
      }),
    );
  });

  it('requests a selected hosted execution pack from an essence document', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        $schema: 'https://decantr.ai/schemas/selected-execution-pack.v1.json',
        generatedAt: '2026-04-09T00:00:00.000Z',
        sourceEssenceVersion: '2.0.0',
        manifest: {
          $schema: 'https://decantr.ai/schemas/pack-manifest.v1.json',
          version: '1.0.0',
          generatedAt: '2026-04-09T00:00:00.000Z',
          scaffold: { id: 'scaffold', markdown: 'scaffold-pack.md', json: 'scaffold-pack.json' },
          review: { id: 'review', markdown: 'review-pack.md', json: 'review-pack.json' },
          sections: [{ id: 'dashboard', markdown: 'section-dashboard-pack.md', json: 'section-dashboard-pack.json', pageIds: ['home'] }],
          pages: [{ id: 'home', markdown: 'page-home-pack.md', json: 'page-home-pack.json', sectionId: 'dashboard', sectionRole: 'primary' }],
          mutations: [{ id: 'modify', markdown: 'mutation-modify-pack.md', json: 'mutation-modify-pack.json', mutationType: 'modify' }],
        },
        selector: {
          packType: 'page',
          id: 'home',
        },
        pack: {
          $schema: 'https://decantr.ai/schemas/page-pack.v1.json',
          packVersion: '1.0.0',
          packType: 'page',
          objective: 'Implement the home route using the compiled page contract.',
          target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
          preset: null,
          scope: { appId: 'app', pageIds: ['home'], patternIds: ['hero'] },
          requiredSetup: [],
          allowedVocabulary: ['hero'],
          examples: [],
          antiPatterns: [],
          successChecks: [],
          tokenBudget: { target: 900, max: 1400, strategy: ['compact'] },
          data: {
            pageId: 'home',
            path: '/',
            shell: 'sidebar-main',
            sectionId: 'dashboard',
            sectionRole: 'primary',
            features: ['auth'],
            surface: 'home',
            theme: { id: 'clean', mode: 'light', shape: null },
            wiringSignals: [],
            patterns: [{ id: 'hero', alias: 'hero', preset: 'landing', layout: 'stack' }],
          },
          renderedMarkdown: '# Page Pack\n',
        },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = new RegistryAPIClient({ baseUrl: 'https://api.example.com/v1' });
    const result = await client.selectExecutionPack({
      essence: {
        version: '2.0.0',
        archetype: 'dashboard',
        theme: { id: 'clean', mode: 'light' },
        personality: ['professional'],
        platform: { type: 'spa', routing: 'history' },
        structure: [{ id: 'home', shell: 'sidebar-main', layout: ['hero'] }],
        features: ['auth'],
        density: { level: 'comfortable', content_gap: '1.5rem' },
        guard: { mode: 'guided' },
        target: 'react',
      },
      pack_type: 'page',
      id: 'home',
    }, { namespace: '@official' });

    expect(result.$schema).toBe('https://decantr.ai/schemas/selected-execution-pack.v1.json');
    expect(result.selector.packType).toBe('page');
    expect(result.selector.id).toBe('home');
    expect(result.pack.packType).toBe('page');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.example.com/v1/packs/select?namespace=%40official',
      expect.objectContaining({
        method: 'POST',
      }),
    );
  });

  it('fetches the showcase manifest', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        total: 2,
        shortlisted: 1,
        apps: [{ slug: 'portfolio', status: 'active', classification: 'B' }],
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = new RegistryAPIClient({ baseUrl: 'https://api.example.com/v1' });
    const result = await client.getShowcaseManifest();

    expect(result.total).toBe(2);
    expect(result.apps[0]?.slug).toBe('portfolio');
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('fetches the showcase shortlist verification report', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        $schema: 'https://decantr.ai/schemas/showcase-shortlist-report.v1.json',
        generatedAt: '2026-04-09T00:00:00.000Z',
        dryRun: false,
        summary: {
          appCount: 1,
          passedBuilds: 1,
          failedBuilds: 0,
          averageDurationMs: 1200,
          passedSmokes: 1,
          failedSmokes: 0,
          averageSmokeDurationMs: 5,
          appsWithTitleOkCount: 1,
          appsWithLangOkCount: 1,
          appsWithViewportOkCount: 1,
          appsWithCharsetOkCount: 1,
          appsWithoutInlineScriptsCount: 1,
          appsWithCspSignalCount: 1,
          appsWithExternalScriptIntegrityCount: 1,
          appsWithRouteCoverageCount: 1,
          averageTotalAssetBytes: 42000,
          averageJsAssetBytes: 31000,
          averageCssAssetBytes: 11000,
          lowerDriftCount: 1,
          moderateDriftCount: 0,
          elevatedDriftCount: 0,
          withPackManifestCount: 0,
        },
        results: [{
          slug: 'portfolio',
          target: 'react-vite',
          classification: 'B',
          verificationStatus: 'smoke-green',
          build: { passed: true, durationMs: 1200 },
          smoke: {
            passed: true,
            durationMs: 5,
            rootDocumentOk: true,
            titleOk: true,
            langOk: true,
            viewportOk: true,
            charsetOk: true,
            cspSignalOk: true,
            inlineScriptCount: 0,
            externalScriptsWithoutIntegrityCount: 0,
            assetCount: 2,
            assetsPassed: 2,
            routeHintsChecked: ['/'],
            routeHintsMatched: 1,
            routeDocumentsChecked: 1,
            routeDocumentsPassed: 1,
            totalAssetBytes: 42000,
            jsAssetBytes: 31000,
            cssAssetBytes: 11000,
            largestAssetPath: '/assets/app.js',
            largestAssetBytes: 31000,
            failures: [],
          },
          drift: {
            signal: 'lower',
            penalty: 250,
            inlineStyleCount: 100,
            hardcodedColorCount: 20,
            utilityLeakageCount: 0,
            decantrTreatmentCount: 150,
            hasPackManifest: false,
            hasDist: true,
          },
        }],
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = new RegistryAPIClient({ baseUrl: 'https://api.example.com/v1' });
    const result = await client.getShowcaseShortlistVerification();

    expect(result.$schema).toBe('https://decantr.ai/schemas/showcase-shortlist-report.v1.json');
    expect(result.summary.passedSmokes).toBe(1);
    expect(result.results[0]?.smoke.passed).toBe(true);
  });

  it('fetches the registry intelligence summary', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        $schema: 'https://decantr.ai/schemas/registry-intelligence-summary.v1.json',
        generated_at: '2026-04-09T00:00:00.000Z',
        namespace: '@official',
        totals: {
          total_public_items: 2,
          with_intelligence: 2,
          recommended: 1,
          authored: 1,
          benchmark: 0,
          hybrid: 1,
          missing_source: 0,
          smoke_green: 1,
          build_green: 0,
          high_confidence: 1,
          verified_confidence: 1,
        },
        by_type: {
          pattern: {
            total_public_items: 1,
            with_intelligence: 1,
            recommended: 1,
            authored: 1,
            benchmark: 0,
            hybrid: 0,
            missing_source: 0,
            smoke_green: 0,
            build_green: 0,
            high_confidence: 0,
            verified_confidence: 0,
          },
          theme: {
            total_public_items: 0,
            with_intelligence: 0,
            recommended: 0,
            authored: 0,
            benchmark: 0,
            hybrid: 0,
            missing_source: 0,
            smoke_green: 0,
            build_green: 0,
            high_confidence: 0,
            verified_confidence: 0,
          },
          blueprint: {
            total_public_items: 1,
            with_intelligence: 1,
            recommended: 0,
            authored: 0,
            benchmark: 0,
            hybrid: 1,
            missing_source: 0,
            smoke_green: 1,
            build_green: 0,
            high_confidence: 1,
            verified_confidence: 1,
          },
          archetype: {
            total_public_items: 0,
            with_intelligence: 0,
            recommended: 0,
            authored: 0,
            benchmark: 0,
            hybrid: 0,
            missing_source: 0,
            smoke_green: 0,
            build_green: 0,
            high_confidence: 0,
            verified_confidence: 0,
          },
          shell: {
            total_public_items: 0,
            with_intelligence: 0,
            recommended: 0,
            authored: 0,
            benchmark: 0,
            hybrid: 0,
            missing_source: 0,
            smoke_green: 0,
            build_green: 0,
            high_confidence: 0,
            verified_confidence: 0,
          },
        },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = new RegistryAPIClient({ baseUrl: 'https://api.example.com/v1' });
    const result = await client.getRegistryIntelligenceSummary({ namespace: '@official' });

    expect(result.namespace).toBe('@official');
    expect(result.totals.hybrid).toBe(1);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/intelligence\/summary\?namespace=%40official/),
      expect.anything(),
    );
  });

  it('fetches a public content envelope without unwrapping', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        id: 'row-1',
        type: 'blueprint',
        slug: 'portfolio',
        namespace: '@official',
        version: '1.0.0',
        visibility: 'public',
        status: 'published',
        created_at: '2026-04-09T00:00:00.000Z',
        updated_at: '2026-04-09T00:00:00.000Z',
        data: { name: 'Portfolio', routes: { home: { path: '/' } } },
        owner_name: 'Decantr',
        owner_username: 'decantr',
        intelligence: {
          source: 'hybrid',
          verification_status: 'smoke-green',
          benchmark_confidence: 'high',
          confidence_tier: 'verified',
          golden_usage: 'shortlisted',
          quality_score: 92,
          confidence_score: 90,
          recommended: true,
          target_coverage: ['react-vite'],
          evidence: ['live-showcase', 'smoke-verified'],
        },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = new RegistryAPIClient({ baseUrl: 'https://api.example.com/v1' });
    const result = await client.getPublicContentRecord('blueprints', '@official', 'portfolio');

    expect(result.slug).toBe('portfolio');
    expect(result.data).toEqual({ name: 'Portfolio', routes: { home: { path: '/' } } });
    expect(result.owner_username).toBe('decantr');
    expect(result.intelligence?.recommended).toBe(true);
    expect(result.intelligence?.quality_score).toBe(92);
  });

  it('fetches public user profile and content summaries', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({
          username: 'alice',
          display_name: 'Alice',
          reputation_score: 42,
          tier: 'pro',
          created_at: '2026-04-01T00:00:00.000Z',
          content_count: 3,
          content_counts: { blueprint: 2, pattern: 1 },
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({
          total: 1,
          items: [{
            id: 'item-1',
            type: 'blueprint',
            slug: 'portfolio',
            namespace: '@community',
            version: '1.0.0',
            name: 'Portfolio',
            description: 'Creator portfolio',
            published_at: '2026-04-09T00:00:00.000Z',
            intelligence: null,
          }],
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

    const client = new RegistryAPIClient({ baseUrl: 'https://api.example.com/v1' });
    const profile = await client.getPublicUserProfile('alice');
    const content = await client.getPublicUserContent('alice', { limit: 12 });

    expect(profile.username).toBe('alice');
    expect(profile.content_count).toBe(3);
    expect(content.total).toBe(1);
    expect(content.items[0]?.slug).toBe('portfolio');
  });
});
