import { readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020, { type ValidateFunction } from 'ajv/dist/2020.js';
import type {
  ContentIntelligenceMetadata,
  ContentIntelligenceSummaryBucket,
  ContentIntelligenceSummaryResponse,
  ContentListResponse,
  PublicContentRecord,
  PublicContentSummary,
  SearchResponse,
} from './api-types.js';
import { CONTENT_PROVENANCE_SCHEMA_FILES, type ContentProvenanceSchema } from './provenance.js';
import { comparePublicContent, normalizePublicContentSort, sortPublicContent } from './ranking.js';
import {
  API_CONTENT_TYPE_TO_CONTENT_TYPE,
  type ApiContentType,
  CONTENT_TYPE_TO_API_CONTENT_TYPE,
  CONTENT_TYPES,
  type ContentIntelligenceSource,
  type ContentResolver,
  type ContentType,
  type ContentTypeMap,
  getBlueprintPortfolioMetadata,
  isContentIntelligenceSource,
  isContentType,
  type JsonObject,
  OFFICIAL_CONTENT_NAMESPACE,
  type PublicBlueprintSet,
  type PublicContentSource,
  type ResolvedContent,
} from './types.js';

export * from './api-client.js';
export * from './api-types.js';
export * from './discovery.js';
export * from './pattern.js';
export * from './provenance.js';
export * from './ranking.js';
export { createResolver } from './resolver.js';
export * from './types.js';
export * from './wiring.js';

export const CONTENT_TYPE_TO_DIRECTORY: Record<ContentType, ApiContentType> =
  CONTENT_TYPE_TO_API_CONTENT_TYPE;

export const CONTENT_SCHEMA_FILES: Record<ContentType | 'common', string> = {
  common: 'common.v1.json',
  pattern: 'pattern.v2.json',
  theme: 'theme.v1.json',
  blueprint: 'blueprint.v1.json',
  archetype: 'archetype.v2.json',
  shell: 'shell.v1.json',
};

export const OFFICIAL_CONTENT_OWNER_NAME = 'Decantr';
export const OFFICIAL_CONTENT_OWNER_USERNAME = 'decantr';
export const OFFICIAL_CONTENT_PUBLISHED_AT = '2026-07-02T00:00:00.000Z';

export interface SearchContentOptions {
  q?: string;
  type?: ContentType | ApiContentType;
  namespace?: string | null;
  source?: PublicContentSource;
  sort?: string | null;
  recommended?: boolean;
  intelligenceSource?: ContentIntelligenceSource;
  blueprintSet?: PublicBlueprintSet;
  labs?: boolean;
  limit?: number;
  offset?: number;
}

export interface ListContentOptions {
  type?: ContentType | ApiContentType;
  namespace?: string | null;
  source?: PublicContentSource;
  sort?: string | null;
  recommended?: boolean;
  intelligenceSource?: ContentIntelligenceSource;
  blueprintSet?: PublicBlueprintSet;
  labs?: boolean;
  limit?: number;
  offset?: number;
}

export interface ContentValidationResult {
  valid: boolean;
  errors: string[];
}

const PACKAGE_ROOT = fileURLToPath(new URL('..', import.meta.url));

let catalogCache: PublicContentRecord<JsonObject, ContentType>[] | null = null;
let ajvCache: Ajv2020 | null = null;
let validatorCache: Partial<Record<ContentType, ValidateFunction>> = {};

export function getContentPackageRoot(): string {
  return PACKAGE_ROOT;
}

export function getContentPackageVersion(): string {
  const version = readJson(join(PACKAGE_ROOT, 'package.json')).version;
  if (typeof version !== 'string' || version.trim().length === 0) {
    throw new TypeError('@decantr/content package.json is missing version.');
  }
  return version;
}

export function normalizeContentType(value: ContentType | ApiContentType): ContentType {
  if (isContentType(value)) return value;
  return API_CONTENT_TYPE_TO_CONTENT_TYPE[value];
}

export function getContentSchema(type: ContentType | 'common'): JsonObject {
  return readJson(join(PACKAGE_ROOT, 'schemas', CONTENT_SCHEMA_FILES[type]));
}

export function listContentSchemas(): Array<{
  type: ContentType | 'common';
  file: string;
  schema: JsonObject;
}> {
  return (['common', ...CONTENT_TYPES] as Array<ContentType | 'common'>).map((type) => ({
    type,
    file: CONTENT_SCHEMA_FILES[type],
    schema: getContentSchema(type),
  }));
}

export function getContentProvenanceSchema(type: ContentProvenanceSchema): JsonObject {
  return readJson(join(PACKAGE_ROOT, 'schemas', CONTENT_PROVENANCE_SCHEMA_FILES[type]));
}

export function listContentProvenanceSchemas(): Array<{
  type: ContentProvenanceSchema;
  file: string;
  schema: JsonObject;
}> {
  return (Object.keys(CONTENT_PROVENANCE_SCHEMA_FILES) as ContentProvenanceSchema[]).map(
    (type) => ({
      type,
      file: CONTENT_PROVENANCE_SCHEMA_FILES[type],
      schema: getContentProvenanceSchema(type),
    }),
  );
}

export function listContentRecords(
  options: ListContentOptions = {},
): ContentListResponse<PublicContentSummary<ContentType>> {
  const limit = normalizeLimit(options.limit);
  const offset = normalizeOffset(options.offset);
  const type = options.type ? normalizeContentType(options.type) : null;
  const namespace = options.namespace ?? null;

  if (namespace && namespace !== OFFICIAL_CONTENT_NAMESPACE) {
    return { items: [], total: 0, limit, offset };
  }
  if (options.source && options.source !== 'official') {
    return { items: [], total: 0, limit, offset };
  }

  const blueprintSet = options.blueprintSet ?? 'all';
  const includeLabs = options.labs === true || blueprintSet === 'labs';
  const summaries = getContentCatalog()
    .filter((record) => !type || record.type === type)
    .map(toPublicSummary)
    .filter((item) =>
      matchesPublicContentFilters(
        item,
        options.recommended === true,
        options.intelligenceSource,
        blueprintSet,
        includeLabs,
      ),
    );
  const sorted = sortPublicContent(summaries, normalizePublicContentSort(options.sort));

  return {
    total: sorted.length,
    limit,
    offset,
    items: sorted.slice(offset, offset + limit),
  };
}

export function searchContent(
  options: SearchContentOptions = {},
): SearchResponse<PublicContentSummary<ContentType>> {
  const limit = normalizeLimit(options.limit);
  const offset = normalizeOffset(options.offset);
  const query = (options.q ?? '').trim().toLowerCase();
  const base = listContentRecords({
    type: options.type,
    namespace: options.namespace,
    source: options.source,
    sort: options.sort,
    recommended: options.recommended,
    intelligenceSource: options.intelligenceSource,
    blueprintSet: options.blueprintSet,
    labs: options.labs,
    limit: 5000,
    offset: 0,
  }).items;
  const filtered =
    query.length === 0
      ? base
      : base
          .map((summary) => ({ summary, score: scoreSearchMatch(summary, query) }))
          .filter((match) => match.score > 0)
          .sort(
            (left, right) =>
              right.score - left.score || comparePublicContent(left.summary, right.summary),
          )
          .map((match) => match.summary);

  return {
    total: filtered.length,
    limit,
    offset,
    results: filtered.slice(offset, offset + limit),
  };
}

export function getContentRecord(
  type: ContentType | ApiContentType,
  slug: string,
  namespace: string = OFFICIAL_CONTENT_NAMESPACE,
): PublicContentRecord<JsonObject, ContentType> | null {
  if (namespace !== OFFICIAL_CONTENT_NAMESPACE) return null;
  const normalizedType = normalizeContentType(type);
  return (
    getContentCatalog().find(
      (record) =>
        record.type === normalizedType &&
        (record.slug === slug || record.id === slug || record.data.id === slug),
    ) ?? null
  );
}

export function resolveContent(
  type: ContentType | ApiContentType,
  slug: string,
  namespace: string = OFFICIAL_CONTENT_NAMESPACE,
): ResolvedContent<JsonObject> | null {
  const record = getContentRecord(type, slug, namespace);
  if (!record) return null;
  return {
    item: record.data,
    source: 'core',
    path: `${record.namespace}/${record.type}/${record.slug}`,
  };
}

export function createContentResolver(
  namespace: string = OFFICIAL_CONTENT_NAMESPACE,
): ContentResolver {
  return {
    async resolve<T extends ContentType>(type: T, id: string) {
      return resolveContent(type, id, namespace) as ResolvedContent<ContentTypeMap[T]> | null;
    },
  };
}

export function buildContentIntelligenceSummary(
  namespace: string | null = OFFICIAL_CONTENT_NAMESPACE,
): ContentIntelligenceSummaryResponse {
  const records = namespace && namespace !== OFFICIAL_CONTENT_NAMESPACE ? [] : getContentCatalog();
  const byType = Object.fromEntries(
    CONTENT_TYPES.map((type) => [type, createEmptyBucket()]),
  ) as Record<ContentType, ContentIntelligenceSummaryBucket>;
  const totals = createEmptyBucket();

  for (const record of records) {
    applyIntelligenceToBucket(byType[record.type], record.intelligence ?? null);
    applyIntelligenceToBucket(totals, record.intelligence ?? null);
  }

  return {
    $schema: 'https://decantr.ai/schemas/registry-intelligence-summary.v1.json',
    generated_at: new Date().toISOString(),
    namespace,
    totals,
    by_type: byType,
  };
}

export function validateContentData(
  type: ContentType | ApiContentType,
  data: unknown,
): ContentValidationResult {
  const normalizedType = normalizeContentType(type);
  const validator = getValidator(normalizedType);
  const valid = validator(data);
  return {
    valid,
    errors: valid ? [] : (validator.errors ?? []).map(formatAjvError),
  };
}

export function validateOfficialCorpus(): ContentValidationResult {
  const errors: string[] = [];
  for (const record of getContentCatalog()) {
    const result = validateContentData(record.type, record.data);
    if (!result.valid) {
      errors.push(...result.errors.map((error) => `${record.type}/${record.slug}: ${error}`));
    }
  }
  return { valid: errors.length === 0, errors };
}

export function getContentCatalog(): PublicContentRecord<JsonObject, ContentType>[] {
  if (catalogCache) return catalogCache;

  catalogCache = CONTENT_TYPES.flatMap((type) => {
    const directory = CONTENT_TYPE_TO_DIRECTORY[type];
    const dirPath = join(PACKAGE_ROOT, directory);
    return readdirSync(dirPath)
      .filter((file) => file.endsWith('.json'))
      .sort()
      .map((file) => createRecord(type, basename(file, '.json'), readJson(join(dirPath, file))));
  });

  return catalogCache;
}

export function clearContentCatalogCache(): void {
  catalogCache = null;
  ajvCache = null;
  validatorCache = {};
}

function createRecord(
  type: ContentType,
  slug: string,
  data: JsonObject,
): PublicContentRecord<JsonObject, ContentType> {
  const version =
    typeof data.version === 'string' && data.version.trim().length > 0 ? data.version : '1.0.0';
  return {
    id: slug,
    slug,
    namespace: OFFICIAL_CONTENT_NAMESPACE,
    type,
    version,
    data,
    visibility: 'public',
    status: 'published',
    created_at: OFFICIAL_CONTENT_PUBLISHED_AT,
    updated_at: OFFICIAL_CONTENT_PUBLISHED_AT,
    published_at: OFFICIAL_CONTENT_PUBLISHED_AT,
    owner_name: OFFICIAL_CONTENT_OWNER_NAME,
    owner_username: OFFICIAL_CONTENT_OWNER_USERNAME,
    thumbnail_url: null,
    intelligence: deriveContentIntelligence(type, data),
  };
}

function toPublicSummary(
  record: PublicContentRecord<JsonObject, ContentType>,
): PublicContentSummary<ContentType> {
  return {
    id: record.id,
    slug: record.slug,
    namespace: record.namespace,
    type: record.type,
    version: record.version,
    name: getString(record.data.name),
    description: getString(record.data.description),
    published_at: record.published_at,
    owner_name: record.owner_name,
    owner_username: record.owner_username,
    thumbnail_url: record.thumbnail_url,
    blueprint_portfolio: getBlueprintPortfolioMetadata(record.data),
    intelligence: record.intelligence ?? null,
  };
}

export function deriveContentIntelligence(
  type: ContentType,
  data: JsonObject,
): ContentIntelligenceMetadata | null {
  const authored =
    asRecord(data.content_intelligence) ??
    asRecord(data.registry_intelligence) ??
    asRecord(data.intelligence);
  if (authored && isContentIntelligenceSource(authored.source)) {
    return {
      source: authored.source,
      verification_status: normalizeVerificationStatus(authored.verification_status),
      last_verified_at: getString(authored.last_verified_at) ?? null,
      target_coverage: getStringArray(authored.target_coverage),
      benchmark_confidence: normalizeBenchmarkConfidence(authored.benchmark_confidence),
      confidence_tier: normalizeConfidenceTier(authored.confidence_tier),
      golden_usage: normalizeGoldenUsage(authored.golden_usage),
      quality_score: getNumberOrNull(authored.quality_score),
      confidence_score: getNumberOrNull(authored.confidence_score),
      recommended: authored.recommended === true,
      evidence: getStringArray(authored.evidence),
      recommendation_reasons: getStringArray(authored.recommendation_reasons),
      recommendation_blockers: getStringArray(authored.recommendation_blockers),
    };
  }

  if (type !== 'blueprint') return null;
  const portfolio = getBlueprintPortfolioMetadata(data);
  if (!portfolio) return null;

  const certified = portfolio.artifact.status === 'certified';
  const featured = portfolio.visibility === 'featured';
  const candidate = portfolio.artifact.status === 'candidate';
  const recommended = certified || featured;

  return {
    source: 'authored',
    verification_status: certified ? 'smoke-green' : candidate ? 'pending' : 'unknown',
    last_verified_at: null,
    target_coverage: portfolio.artifact.showcase ? [portfolio.artifact.showcase] : [],
    benchmark_confidence: certified ? 'medium' : candidate ? 'low' : 'none',
    confidence_tier: certified ? 'verified' : featured ? 'high' : candidate ? 'medium' : 'low',
    golden_usage: portfolio.artifact.showcase ? 'showcase' : 'none',
    quality_score: certified ? 86 : featured ? 78 : candidate ? 66 : null,
    confidence_score: certified ? 84 : featured ? 76 : candidate ? 62 : null,
    recommended,
    evidence: ['blueprint_portfolio'],
    recommendation_reasons: recommended ? [portfolio.rationale] : [],
    recommendation_blockers:
      portfolio.visibility === 'hidden' ? ['Blueprint is hidden from public browse surfaces.'] : [],
  };
}

function matchesPublicContentFilters(
  item: PublicContentSummary<ContentType>,
  recommendedOnly: boolean,
  intelligenceSource: ContentIntelligenceSource | undefined,
  blueprintSet: PublicBlueprintSet,
  includeLabs: boolean,
): boolean {
  if (item.type === 'blueprint') {
    const portfolio = getBlueprintPortfolioMetadata(item.blueprint_portfolio);
    const visibility = portfolio?.visibility ?? 'public';
    if (visibility === 'hidden') return false;
    if (visibility === 'labs' && !includeLabs) return false;
    if (blueprintSet === 'featured' && visibility !== 'featured') return false;
    if (blueprintSet === 'certified' && portfolio?.artifact.status !== 'certified') return false;
    if (blueprintSet === 'labs' && visibility !== 'labs') return false;
  }

  if (recommendedOnly && item.intelligence?.recommended !== true) {
    return false;
  }

  if (intelligenceSource && item.intelligence?.source !== intelligenceSource) {
    return false;
  }

  return true;
}

function scoreSearchMatch(summary: PublicContentSummary<ContentType>, query: string): number {
  const record = getContentRecord(summary.type, summary.slug);
  const data = record?.data ?? {};
  let score = 0;
  if (summary.slug.toLowerCase() === query) score += 1000;
  if ((summary.name ?? '').toLowerCase() === query) score += 800;
  if (summary.slug.toLowerCase().includes(query)) score += 260;
  if ((summary.name ?? '').toLowerCase().includes(query)) score += 220;
  if ((summary.description ?? '').toLowerCase().includes(query)) score += 90;
  if (getString(data.personality)?.toLowerCase().includes(query)) score += 45;
  for (const tag of getStringArray(data.tags)) {
    if (tag.toLowerCase() === query) score += 180;
    else if (tag.toLowerCase().includes(query)) score += 80;
  }
  return score;
}

function getValidator(type: ContentType): ValidateFunction {
  if (validatorCache[type]) return validatorCache[type]!;
  const ajv = getAjv();
  const validator = ajv.compile(getContentSchema(type));
  validatorCache[type] = validator;
  return validator;
}

function getAjv(): Ajv2020 {
  if (ajvCache) return ajvCache;
  ajvCache = new Ajv2020({
    allErrors: true,
    strict: false,
    allowUnionTypes: true,
  });
  ajvCache.addSchema(getContentSchema('common'));
  return ajvCache;
}

function readJson(path: string): JsonObject {
  return JSON.parse(readFileSync(path, 'utf8')) as JsonObject;
}

function asRecord(value: unknown): JsonObject | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonObject) : null;
}

function getString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

function getStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : [];
}

function getNumberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function normalizeLimit(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 50;
  return Math.max(1, Math.min(500, Math.floor(value)));
}

function normalizeOffset(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
}

function createEmptyBucket(): ContentIntelligenceSummaryBucket {
  return {
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
  };
}

function applyIntelligenceToBucket(
  bucket: ContentIntelligenceSummaryBucket,
  intelligence: ContentIntelligenceMetadata | null,
): void {
  bucket.total_public_items += 1;
  if (!intelligence) return;

  bucket.with_intelligence += 1;
  if (intelligence.recommended) bucket.recommended += 1;

  switch (intelligence.source) {
    case 'authored':
      bucket.authored += 1;
      break;
    case 'benchmark':
      bucket.benchmark += 1;
      break;
    case 'hybrid':
      bucket.hybrid += 1;
      break;
    default:
      bucket.missing_source += 1;
      break;
  }

  if (intelligence.verification_status === 'smoke-green') bucket.smoke_green += 1;
  if (intelligence.verification_status === 'build-green') bucket.build_green += 1;
  if (intelligence.confidence_tier === 'verified') {
    bucket.verified_confidence += 1;
    bucket.high_confidence += 1;
  } else if (intelligence.confidence_tier === 'high') {
    bucket.high_confidence += 1;
  }
}

function normalizeVerificationStatus(
  value: unknown,
): ContentIntelligenceMetadata['verification_status'] {
  if (
    value === 'unknown' ||
    value === 'pending' ||
    value === 'build-green' ||
    value === 'build-red' ||
    value === 'smoke-green' ||
    value === 'smoke-red'
  ) {
    return value;
  }
  return 'unknown';
}

function normalizeBenchmarkConfidence(
  value: unknown,
): ContentIntelligenceMetadata['benchmark_confidence'] {
  if (value === 'none' || value === 'low' || value === 'medium' || value === 'high') return value;
  return 'none';
}

function normalizeConfidenceTier(value: unknown): ContentIntelligenceMetadata['confidence_tier'] {
  if (value === 'low' || value === 'medium' || value === 'high' || value === 'verified')
    return value;
  return 'low';
}

function normalizeGoldenUsage(value: unknown): ContentIntelligenceMetadata['golden_usage'] {
  if (value === 'none' || value === 'showcase' || value === 'shortlisted') return value;
  return 'none';
}

function formatAjvError(error: NonNullable<ValidateFunction['errors']>[number]): string {
  const instancePath = error.instancePath || '/';
  return `${instancePath} ${error.message}`.trim();
}
