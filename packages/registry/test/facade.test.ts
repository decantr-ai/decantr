import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ContentAPIClient,
  type ContentAPIClientOptions,
  ContentAPIError,
  type ContentClient,
  type ContentClientOptions,
  type ContentIntelligenceSummaryBucket,
  type ContentIntelligenceSummaryResponse,
  type ContentSearchResult,
  createContentClient,
} from '@decantr/content/client';
import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  createRegistryClient,
  RegistryAPIClient,
  type RegistryAPIClientOptions,
  RegistryAPIError,
  type RegistryClient,
  type RegistryClientOptions,
  type RegistryIntelligenceSummaryBucket,
  type RegistryIntelligenceSummaryResponse,
  type SearchResult,
} from '../src/index.js';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

describe('@decantr/registry compatibility facade', () => {
  it('delegates client behavior while retaining registry error compatibility', () => {
    const client = new RegistryAPIClient({ baseUrl: 'https://api.example.com/v1' });
    const error = new RegistryAPIError(404, 'missing', { slug: 'hero' });

    expect(client).toBeInstanceOf(ContentAPIClient);
    expect(error).toBeInstanceOf(RegistryAPIError);
    expect(error).toBeInstanceOf(ContentAPIError);
    expect(error).toMatchObject({
      name: 'RegistryAPIError',
      status: 404,
      message: 'missing',
      details: { slug: 'hero' },
    });
    expect(createRegistryClient).toBe(createContentClient);
  });

  it('retains old client and response type identities', () => {
    expectTypeOf<RegistryAPIClientOptions>().toEqualTypeOf<ContentAPIClientOptions>();
    expectTypeOf<RegistryClientOptions>().toEqualTypeOf<ContentClientOptions>();
    expectTypeOf<RegistryClient>().toEqualTypeOf<ContentClient>();
    expectTypeOf<SearchResult>().toEqualTypeOf<ContentSearchResult>();
    expectTypeOf<RegistryIntelligenceSummaryBucket>().toEqualTypeOf<ContentIntelligenceSummaryBucket>();
    expectTypeOf<RegistryIntelligenceSummaryResponse>().toEqualTypeOf<ContentIntelligenceSummaryResponse>();
  });

  it('retains the published compatibility entrypoints', () => {
    const manifest = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8')) as {
      exports: Record<string, unknown>;
    };

    expect(manifest.exports).toHaveProperty('.');
    expect(manifest.exports).toHaveProperty('./client');
    expect(manifest.exports).toHaveProperty('./content-types');
    expect(manifest.exports).toHaveProperty('./schema/common.v1.json');
  });
});
