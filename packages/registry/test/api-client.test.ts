import { afterEach, describe, expect, it, vi } from 'vitest';
import { RegistryAPIClient } from '../src/api-client.js';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe('RegistryAPIClient showcase endpoints', () => {
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
          appsWithRouteCoverageCount: 1,
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
            assetCount: 2,
            assetsPassed: 2,
            routeHintsChecked: ['/'],
            routeHintsMatched: 1,
            routeDocumentsChecked: 1,
            routeDocumentsPassed: 1,
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
