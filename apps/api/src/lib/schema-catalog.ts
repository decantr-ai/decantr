import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import type { ContentType } from '../types.js';

export type JsonSchema = Record<string, unknown>;

const require = createRequire(import.meta.url);
const schemaCache = new Map<string, JsonSchema>();

function loadPackageSchema(specifier: string): JsonSchema {
  const cached = schemaCache.get(specifier);
  if (cached) return cached;

  const schema = JSON.parse(readFileSync(require.resolve(specifier), 'utf8')) as JsonSchema;
  schemaCache.set(specifier, schema);
  return schema;
}

function loadSchemaCatalog<const T extends Record<string, string>>(specs: T): { [K in keyof T]: JsonSchema } {
  return Object.fromEntries(
    Object.entries(specs).map(([key, specifier]) => [key, loadPackageSchema(specifier)]),
  ) as { [K in keyof T]: JsonSchema };
}

const registrySchemaSpecs: Record<ContentType, string> = {
  pattern: '@decantr/registry/schema/pattern.v2.json',
  theme: '@decantr/registry/schema/theme.v1.json',
  blueprint: '@decantr/registry/schema/blueprint.v1.json',
  archetype: '@decantr/registry/schema/archetype.v2.json',
  shell: '@decantr/registry/schema/shell.v1.json',
};

const publicSchemaSpecs = {
  'common.v1.json': '@decantr/registry/schema/common.v1.json',
  'content-intelligence.v1.json': '@decantr/registry/schema/content-intelligence.v1.json',
  'pattern.v2.json': '@decantr/registry/schema/pattern.v2.json',
  'theme.v1.json': '@decantr/registry/schema/theme.v1.json',
  'blueprint.v1.json': '@decantr/registry/schema/blueprint.v1.json',
  'archetype.v2.json': '@decantr/registry/schema/archetype.v2.json',
  'shell.v1.json': '@decantr/registry/schema/shell.v1.json',
  'public-content-summary.v1.json': '@decantr/registry/schema/public-content-summary.v1.json',
  'public-content-record.v1.json': '@decantr/registry/schema/public-content-record.v1.json',
  'public-content-list.v1.json': '@decantr/registry/schema/public-content-list.v1.json',
  'search-response.v1.json': '@decantr/registry/schema/search-response.v1.json',
  'showcase-manifest-entry.v1.json': '@decantr/registry/schema/showcase-manifest-entry.v1.json',
  'showcase-manifest.v1.json': '@decantr/registry/schema/showcase-manifest.v1.json',
  'showcase-shortlist.v1.json': '@decantr/registry/schema/showcase-shortlist.v1.json',
  'registry-intelligence-summary.v1.json': '@decantr/registry/schema/registry-intelligence-summary.v1.json',
  'essence.v2.json': '@decantr/essence-spec/schema/essence.v2.json',
  'essence.v3.json': '@decantr/essence-spec/schema/essence.v3.json',
  'execution-pack.common.v1.json': '@decantr/core/schema/execution-pack.common.v1.json',
  'scaffold-pack.v1.json': '@decantr/core/schema/scaffold-pack.v1.json',
  'section-pack.v1.json': '@decantr/core/schema/section-pack.v1.json',
  'page-pack.v1.json': '@decantr/core/schema/page-pack.v1.json',
  'mutation-pack.v1.json': '@decantr/core/schema/mutation-pack.v1.json',
  'review-pack.v1.json': '@decantr/core/schema/review-pack.v1.json',
  'pack-manifest.v1.json': '@decantr/core/schema/pack-manifest.v1.json',
  'execution-pack-bundle.v1.json': '@decantr/core/schema/execution-pack-bundle.v1.json',
  'selected-execution-pack.v1.json': '@decantr/core/schema/selected-execution-pack.v1.json',
  'verification-report.common.v1.json': '@decantr/verifier/schema/verification-report.common.v1.json',
  'project-audit-report.v1.json': '@decantr/verifier/schema/project-audit-report.v1.json',
  'file-critique-report.v1.json': '@decantr/verifier/schema/file-critique-report.v1.json',
  'showcase-shortlist-report.v1.json': '@decantr/verifier/schema/showcase-shortlist-report.v1.json',
} as const;

export const COMMON_SCHEMA = loadPackageSchema('@decantr/registry/schema/common.v1.json');

export const EXPECTED_REGISTRY_SCHEMA_URLS: Record<ContentType, string> = {
  pattern: 'https://decantr.ai/schemas/pattern.v2.json',
  theme: 'https://decantr.ai/schemas/theme.v1.json',
  blueprint: 'https://decantr.ai/schemas/blueprint.v1.json',
  archetype: 'https://decantr.ai/schemas/archetype.v2.json',
  shell: 'https://decantr.ai/schemas/shell.v1.json',
};

export const REGISTRY_SCHEMAS: Record<ContentType, JsonSchema> = loadSchemaCatalog(registrySchemaSpecs);

export const PUBLIC_SCHEMAS: Record<string, JsonSchema> = loadSchemaCatalog(publicSchemaSpecs);
