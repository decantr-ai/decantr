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
            assetCount: 2,
            assetsPassed: 2,
            routeHintsChecked: ['/'],
            routeHintsMatched: 1,
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
});
