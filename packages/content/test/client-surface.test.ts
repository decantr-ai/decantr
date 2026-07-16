import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import {
  ContentAPIClient,
  type ContentAPIClientOptions,
  ContentAPIError,
  type ContentClient,
  type ContentClientOptions,
  type ContentIntelligenceSummaryBucket,
  type ContentIntelligenceSummaryResponse,
  createContentAPIClient,
} from '../src/index.js';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const originalFetch = globalThis.fetch;
const originalApiUrl = process.env.DECANTR_API_URL;
const originalRegistryUrl = process.env.REGISTRY_URL;

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
  restoreEnv('DECANTR_API_URL', originalApiUrl);
  restoreEnv('REGISTRY_URL', originalRegistryUrl);
});

describe('@decantr/content client surface', () => {
  it('constructs the canonical API client through its preferred factory', () => {
    const client = createContentAPIClient({ baseUrl: 'https://content.example/v1' });

    expect(client).toBeInstanceOf(ContentAPIClient);
    expectTypeOf<ContentAPIClientOptions>().toMatchTypeOf<{ baseUrl?: string }>();
    expectTypeOf<ContentClientOptions>().toMatchTypeOf<{ baseUrl?: string }>();
    expectTypeOf<ContentClient['search']>().toBeFunction();
  });

  it('constructs without a Node process global', () => {
    vi.stubGlobal('process', undefined);
    try {
      expect(() => createContentAPIClient()).not.toThrow();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('prefers DECANTR_API_URL while retaining REGISTRY_URL as a fallback alias', async () => {
    process.env.DECANTR_API_URL = 'https://preferred.example/v1';
    process.env.REGISTRY_URL = 'https://legacy.example/v1';
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));

    await createContentAPIClient().checkHealth();
    expect(globalThis.fetch).toHaveBeenLastCalledWith(
      'https://preferred.example/health',
      expect.anything(),
    );

    delete process.env.DECANTR_API_URL;
    await createContentAPIClient().checkHealth();
    expect(globalThis.fetch).toHaveBeenLastCalledWith(
      'https://legacy.example/health',
      expect.anything(),
    );
  });

  it('exports content-named intelligence response aliases', () => {
    expectTypeOf<
      ContentIntelligenceSummaryResponse['totals']
    >().toEqualTypeOf<ContentIntelligenceSummaryBucket>();
    expect(new ContentAPIError(404, 'missing')).toMatchObject({ status: 404 });
  });

  it('publishes root, client, content-types, and schema export paths', () => {
    const manifest = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8')) as {
      exports: Record<string, unknown>;
    };

    expect(manifest.exports).toHaveProperty('.');
    expect(manifest.exports).toHaveProperty('./client');
    expect(manifest.exports).toHaveProperty('./content-types');
    expect(manifest.exports).toHaveProperty('./schema/*.json');
    expect(manifest.exports).toHaveProperty('./schemas/*.json');
  });
});

function restoreEnv(name: 'DECANTR_API_URL' | 'REGISTRY_URL', value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}
