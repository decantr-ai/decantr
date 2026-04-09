import type { ContentType } from '../types.js';
import commonSchema from '@decantr/registry/schema/common.v1.json';
import contentIntelligenceSchema from '@decantr/registry/schema/content-intelligence.v1.json';
import patternSchema from '@decantr/registry/schema/pattern.v2.json';
import themeSchema from '@decantr/registry/schema/theme.v1.json';
import blueprintSchema from '@decantr/registry/schema/blueprint.v1.json';
import archetypeSchema from '@decantr/registry/schema/archetype.v2.json';
import shellSchema from '@decantr/registry/schema/shell.v1.json';
import publicContentSummarySchema from '@decantr/registry/schema/public-content-summary.v1.json';
import publicContentRecordSchema from '@decantr/registry/schema/public-content-record.v1.json';
import publicContentListSchema from '@decantr/registry/schema/public-content-list.v1.json';
import searchResponseSchema from '@decantr/registry/schema/search-response.v1.json';
import showcaseManifestEntrySchema from '@decantr/registry/schema/showcase-manifest-entry.v1.json';
import showcaseManifestSchema from '@decantr/registry/schema/showcase-manifest.v1.json';
import showcaseShortlistSchema from '@decantr/registry/schema/showcase-shortlist.v1.json';
import essenceV2Schema from '@decantr/essence-spec/schema/essence.v2.json';
import essenceV3Schema from '@decantr/essence-spec/schema/essence.v3.json';
import executionPackCommonSchema from '@decantr/core/schema/execution-pack.common.v1.json';
import scaffoldPackSchema from '@decantr/core/schema/scaffold-pack.v1.json';
import sectionPackSchema from '@decantr/core/schema/section-pack.v1.json';
import pagePackSchema from '@decantr/core/schema/page-pack.v1.json';
import mutationPackSchema from '@decantr/core/schema/mutation-pack.v1.json';
import reviewPackSchema from '@decantr/core/schema/review-pack.v1.json';
import packManifestSchema from '@decantr/core/schema/pack-manifest.v1.json';
import verificationReportCommonSchema from '@decantr/verifier/schema/verification-report.common.v1.json';
import projectAuditReportSchema from '@decantr/verifier/schema/project-audit-report.v1.json';
import fileCritiqueReportSchema from '@decantr/verifier/schema/file-critique-report.v1.json';
import showcaseShortlistReportSchema from '@decantr/verifier/schema/showcase-shortlist-report.v1.json';

export type JsonSchema = Record<string, unknown>;

export const COMMON_SCHEMA = commonSchema as JsonSchema;

export const EXPECTED_REGISTRY_SCHEMA_URLS: Record<ContentType, string> = {
  pattern: 'https://decantr.ai/schemas/pattern.v2.json',
  theme: 'https://decantr.ai/schemas/theme.v1.json',
  blueprint: 'https://decantr.ai/schemas/blueprint.v1.json',
  archetype: 'https://decantr.ai/schemas/archetype.v2.json',
  shell: 'https://decantr.ai/schemas/shell.v1.json',
};

export const REGISTRY_SCHEMAS: Record<ContentType, JsonSchema> = {
  pattern: patternSchema as JsonSchema,
  theme: themeSchema as JsonSchema,
  blueprint: blueprintSchema as JsonSchema,
  archetype: archetypeSchema as JsonSchema,
  shell: shellSchema as JsonSchema,
};

export const PUBLIC_SCHEMAS: Record<string, JsonSchema> = {
  'common.v1.json': COMMON_SCHEMA,
  'content-intelligence.v1.json': contentIntelligenceSchema as JsonSchema,
  'pattern.v2.json': REGISTRY_SCHEMAS.pattern,
  'theme.v1.json': REGISTRY_SCHEMAS.theme,
  'blueprint.v1.json': REGISTRY_SCHEMAS.blueprint,
  'archetype.v2.json': REGISTRY_SCHEMAS.archetype,
  'shell.v1.json': REGISTRY_SCHEMAS.shell,
  'public-content-summary.v1.json': publicContentSummarySchema as JsonSchema,
  'public-content-record.v1.json': publicContentRecordSchema as JsonSchema,
  'public-content-list.v1.json': publicContentListSchema as JsonSchema,
  'search-response.v1.json': searchResponseSchema as JsonSchema,
  'showcase-manifest-entry.v1.json': showcaseManifestEntrySchema as JsonSchema,
  'showcase-manifest.v1.json': showcaseManifestSchema as JsonSchema,
  'showcase-shortlist.v1.json': showcaseShortlistSchema as JsonSchema,
  'essence.v2.json': essenceV2Schema as JsonSchema,
  'essence.v3.json': essenceV3Schema as JsonSchema,
  'execution-pack.common.v1.json': executionPackCommonSchema as JsonSchema,
  'scaffold-pack.v1.json': scaffoldPackSchema as JsonSchema,
  'section-pack.v1.json': sectionPackSchema as JsonSchema,
  'page-pack.v1.json': pagePackSchema as JsonSchema,
  'mutation-pack.v1.json': mutationPackSchema as JsonSchema,
  'review-pack.v1.json': reviewPackSchema as JsonSchema,
  'pack-manifest.v1.json': packManifestSchema as JsonSchema,
  'verification-report.common.v1.json': verificationReportCommonSchema as JsonSchema,
  'project-audit-report.v1.json': projectAuditReportSchema as JsonSchema,
  'file-critique-report.v1.json': fileCritiqueReportSchema as JsonSchema,
  'showcase-shortlist-report.v1.json': showcaseShortlistReportSchema as JsonSchema,
};
