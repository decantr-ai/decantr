import * as content from '@decantr/content';
import * as contentClient from '@decantr/content/client';
import { describe, expect, expectTypeOf, it } from 'vitest';
import type {
  ApiContentType,
  BlueprintArtifactStatus,
  BlueprintPortfolioArtifact,
  BlueprintPortfolioMaturity,
  BlueprintPortfolioMetadata,
  BlueprintPortfolioVisibility,
  ContentBenchmarkConfidence,
  ContentGoldenUsage,
  ContentIntelligenceMetadata,
  ContentIntelligenceSource,
  ContentItem,
  ContentListResponse,
  ContentVerificationStatus,
  OwnedContentSummary,
  PublicBlueprintSet,
  PublicContentRecord,
  PublicContentSort,
  PublicContentSource,
  PublicContentSummary,
  PublicUserProfile,
  PublishPayload,
  PublishResponse,
  RegistryAPIClient,
  RegistryAPIClientOptions,
  RegistryAPIError,
  RegistryClient,
  RegistryClientOptions,
  RegistryIntelligenceSummaryBucket,
  RegistryIntelligenceSummaryResponse,
  SearchParams,
  SearchResponse,
  SearchResult,
  ShowcaseManifestEntry,
  ShowcaseManifestResponse,
  ShowcaseShortlistReport,
  ShowcaseShortlistResponse,
  ShowcaseShortlistSummary,
  ShowcaseVerificationEntry,
  UserProfile,
} from '../src/client.js';
import * as registryClient from '../src/client.js';

// Snapshot from the public @decantr/registry@3.8.1 tarball (sha512-hkrbgSUqlN6V...).
const REGISTRY_3_8_1_CLIENT_RUNTIME_EXPORTS = [
  'API_CONTENT_TYPES',
  'API_CONTENT_TYPE_TO_CONTENT_TYPE',
  'BLUEPRINT_ARTIFACT_STATUSES',
  'BLUEPRINT_PORTFOLIO_MATURITIES',
  'BLUEPRINT_PORTFOLIO_VISIBILITIES',
  'CONTENT_INTELLIGENCE_SOURCES',
  'CONTENT_TYPES',
  'CONTENT_TYPE_TO_API_CONTENT_TYPE',
  'PUBLIC_BLUEPRINT_SETS',
  'PUBLIC_CONTENT_SOURCES',
  'RegistryAPIClient',
  'RegistryAPIError',
  'buildCorpusIntelligenceSummary',
  'comparePublicContent',
  'createCorpusResolver',
  'createRegistryClient',
  'getBlueprintPortfolioMetadata',
  'getCorpusCatalog',
  'getCorpusRecord',
  'isApiContentType',
  'isBlueprintArtifactStatus',
  'isBlueprintPortfolioMaturity',
  'isBlueprintPortfolioVisibility',
  'isContentIntelligenceSource',
  'isContentType',
  'isPublicBlueprintSet',
  'isPublicContentSource',
  'listCorpusRecords',
  'normalizePublicContentSort',
  'resolveCorpusContent',
  'searchCorpusContent',
  'sortPublicContent',
  'validateOfficialCorpus',
] as const;

type Registry381ClientTypeSurface = [
  ApiContentType,
  BlueprintArtifactStatus,
  BlueprintPortfolioArtifact,
  BlueprintPortfolioMaturity,
  BlueprintPortfolioMetadata,
  BlueprintPortfolioVisibility,
  ContentBenchmarkConfidence,
  ContentGoldenUsage,
  ContentIntelligenceMetadata,
  ContentIntelligenceSource,
  ContentItem,
  ContentListResponse,
  ContentVerificationStatus,
  OwnedContentSummary,
  PublicBlueprintSet,
  PublicContentRecord,
  PublicContentSort,
  PublicContentSource,
  PublicContentSummary,
  PublicUserProfile,
  PublishPayload,
  PublishResponse,
  RegistryAPIClient,
  RegistryAPIClientOptions,
  RegistryAPIError,
  RegistryClient,
  RegistryClientOptions,
  RegistryIntelligenceSummaryBucket,
  RegistryIntelligenceSummaryResponse,
  SearchParams,
  SearchResponse,
  SearchResult,
  ShowcaseManifestEntry,
  ShowcaseManifestResponse,
  ShowcaseShortlistReport,
  ShowcaseShortlistResponse,
  ShowcaseShortlistSummary,
  ShowcaseVerificationEntry,
  UserProfile,
];

const CONTENT_CLIENT_SAME_NAME_EXPORTS = [
  'API_CONTENT_TYPES',
  'API_CONTENT_TYPE_TO_CONTENT_TYPE',
  'BLUEPRINT_ARTIFACT_STATUSES',
  'BLUEPRINT_PORTFOLIO_MATURITIES',
  'BLUEPRINT_PORTFOLIO_VISIBILITIES',
  'CONTENT_INTELLIGENCE_SOURCES',
  'CONTENT_TYPES',
  'CONTENT_TYPE_TO_API_CONTENT_TYPE',
  'PUBLIC_BLUEPRINT_SETS',
  'PUBLIC_CONTENT_SOURCES',
  'comparePublicContent',
  'getBlueprintPortfolioMetadata',
  'isApiContentType',
  'isBlueprintArtifactStatus',
  'isBlueprintPortfolioMaturity',
  'isBlueprintPortfolioVisibility',
  'isContentIntelligenceSource',
  'isContentType',
  'isPublicBlueprintSet',
  'isPublicContentSource',
  'normalizePublicContentSort',
  'sortPublicContent',
] as const;

describe('@decantr/registry/client 3.8.1 compatibility', () => {
  it('preserves every public 3.8.1 runtime export', () => {
    const missing = REGISTRY_3_8_1_CLIENT_RUNTIME_EXPORTS.filter(
      (name) => !(name in registryClient),
    );

    expect(missing).toEqual([]);
  });

  it('delegates shared legacy implementations to @decantr/content', () => {
    for (const name of CONTENT_CLIENT_SAME_NAME_EXPORTS) {
      // biome-ignore lint/performance/noDynamicNamespaceImportAccess: the compatibility inventory is data-driven.
      expect(registryClient[name], name).toBe(contentClient[name]);
    }

    expect(new registryClient.RegistryAPIClient()).toBeInstanceOf(contentClient.ContentAPIClient);

    const error = new registryClient.RegistryAPIError(409, 'conflict', { reason: 'duplicate' });
    expect(error).toBeInstanceOf(registryClient.RegistryAPIError);
    expect(error).toBeInstanceOf(contentClient.ContentAPIError);
    expect(error).toMatchObject({
      name: 'RegistryAPIError',
      status: 409,
      message: 'conflict',
      details: { reason: 'duplicate' },
    });
    expect(registryClient.createRegistryClient).toBe(contentClient.createContentClient);
    expect(registryClient.buildCorpusIntelligenceSummary).toBe(
      content.buildContentIntelligenceSummary,
    );
    expect(registryClient.createCorpusResolver).toBe(content.createContentResolver);
    expect(registryClient.getCorpusCatalog).toBe(content.getContentCatalog);
    expect(registryClient.getCorpusRecord).toBe(content.getContentRecord);
    expect(registryClient.listCorpusRecords).toBe(content.listContentRecords);
    expect(registryClient.resolveCorpusContent).toBe(content.resolveContent);
    expect(registryClient.searchCorpusContent).toBe(content.searchContent);
    expect(registryClient.validateOfficialCorpus).toBe(content.validateOfficialCorpus);
  });

  it('preserves every public 3.8.1 type-capable export', () => {
    expectTypeOf<Registry381ClientTypeSurface>().toMatchTypeOf<readonly unknown[]>();
  });
});
