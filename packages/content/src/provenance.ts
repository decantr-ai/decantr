import { createHash } from 'node:crypto';
import {
  type ContentType,
  isContentType,
  type JsonObject,
  OFFICIAL_CONTENT_NAMESPACE,
} from './types.js';

export const CONTENT_PACKAGE_NAME = '@decantr/content' as const;
export const CONTENT_PROVENANCE_SCHEMA_VERSION = '1.0.0' as const;
export const CONTENT_IDENTITY_SCHEMA_ID =
  'https://decantr.ai/schemas/content-identity.v1.json' as const;
export const CONTENT_REF_SCHEMA_ID = 'https://decantr.ai/schemas/content-ref.v1.json' as const;
export const CONTENT_CORPUS_MANIFEST_SCHEMA_ID =
  'https://decantr.ai/schemas/content-corpus-manifest.v1.json' as const;

export const CONTENT_PROVENANCE_SCHEMA_FILES = {
  identity: 'content-identity.v1.json',
  ref: 'content-ref.v1.json',
  manifest: 'content-corpus-manifest.v1.json',
} as const;
export type ContentProvenanceSchema = keyof typeof CONTENT_PROVENANCE_SCHEMA_FILES;

export const CONTENT_ORIGINS = ['official', 'local'] as const;
export type ContentOrigin = (typeof CONTENT_ORIGINS)[number];

export const CONTENT_RESOLVED_FROM_VALUES = [
  'installed-package',
  'workspace-package',
  'configured-corpus',
  'cache',
  'local-override',
  'api',
] as const;
export const CONTENT_RESOLUTION_SOURCES = CONTENT_RESOLVED_FROM_VALUES;
export type ContentResolvedFrom = (typeof CONTENT_RESOLVED_FROM_VALUES)[number];

export const CONTENT_VERSION_MAX_LENGTH = 256;
export const CONTENT_VERSION_PATTERN =
  '^(?=[0-9A-Za-z.+-]{1,256}$)(?:0|[1-9][0-9]*)\\.(?:0|[1-9][0-9]*)\\.(?:0|[1-9][0-9]*)(?:-(?:(?!0[0-9]+(?:\\.|\\+|$))[0-9A-Za-z-]+)(?:\\.(?:(?!0[0-9]+(?:\\.|\\+|$))[0-9A-Za-z-]+))*)?(?:\\+[0-9A-Za-z-]+(?:\\.[0-9A-Za-z-]+)*)?$';
export const SHA256_DIGEST_PATTERN = '^sha256:[0-9a-f]{64}$';

// Identity aliases and transport metadata are not authored semantic content.
export const CONTENT_DIGEST_EXCLUDED_FIELDS = [
  '$schema',
  'id',
  'namespace',
  'slug',
  'type',
  'version',
  'transport',
  'path',
  'filePath',
  'file_path',
  'sourcePath',
  'source_path',
  'createdAt',
  'created_at',
  'updatedAt',
  'updated_at',
  'publishedAt',
  'published_at',
  'fetchedAt',
  'fetched_at',
  'loadedAt',
  'loaded_at',
  'generatedAt',
  'generated_at',
] as const;

const sha256DigestRegex = new RegExp(SHA256_DIGEST_PATTERN);
const digestExcludedFields = new Set<string>(CONTENT_DIGEST_EXCLUDED_FIELDS);

export type JsonPrimitive = null | boolean | number | string;
export type CanonicalJsonValue =
  | JsonPrimitive
  | CanonicalJsonValue[]
  | {
      [key: string]: CanonicalJsonValue;
    };
export type Sha256Digest = `sha256:${string}`;

export interface ContentIdentity {
  namespace: string;
  type: ContentType;
  id: string;
}

export type ContentItemIdentity = ContentIdentity;
export type ContentItemIdentityKey = string;

export interface ContentCompatibility {
  decantr: string;
}

export interface ContentOverrideRef {
  identity: ContentIdentity;
  version: string | null;
  digest: Sha256Digest;
}

export interface ContentRef {
  identity: ContentIdentity;
  version: string | null;
  digest: Sha256Digest;
  compatibility: ContentCompatibility;
  origin: ContentOrigin;
  resolvedFrom: ContentResolvedFrom;
  overrideOf?: ContentOverrideRef;
}

export type ContentTransportMetadata = Readonly<Record<string, unknown>>;

export interface ContentRefInput<TData extends object = JsonObject> {
  identity: ContentIdentity;
  version: string | null;
  data: TData;
  compatibility: ContentCompatibility | string;
  origin: ContentOrigin;
  resolvedFrom: ContentResolvedFrom;
  overrideOf?: ContentOverrideRef;
  transport?: ContentTransportMetadata;
}

export interface ContentRecordRefInput<TData extends object = JsonObject> {
  namespace: string;
  type: ContentType;
  id: string;
  version: string | null;
  data: TData;
  compatibility?: ContentCompatibility | string;
  origin?: ContentOrigin;
  resolvedFrom?: ContentResolvedFrom;
  overrideOf?: ContentOverrideRef;
  transport?: ContentTransportMetadata;
}

export interface BuildContentRefOptions {
  namespace?: string;
  version?: string | null;
  compatibility?: ContentCompatibility | string;
  origin?: ContentOrigin;
  resolvedFrom?: ContentResolvedFrom;
  overrideOf?: ContentOverrideRef;
  transport?: ContentTransportMetadata;
}

export interface ContentCorpusIdentity {
  packageName: typeof CONTENT_PACKAGE_NAME;
  packageVersion: string;
  corpusDigest: Sha256Digest;
}

export interface ContentCorpusManifest extends ContentCorpusIdentity {
  compatibility: ContentCompatibility;
  refs: ContentRef[];
}

export interface ContentCorpusManifestInput {
  packageVersion: string;
  compatibility: ContentCompatibility | string;
  refs: readonly ContentRef[];
}

export interface BuildContentCorpusManifestOptions {
  packageVersion: string;
  compatibility: ContentCompatibility | string;
}

export type CorpusManifest = ContentCorpusManifest;

/**
 * Serializes parsed JSON according to the deterministic ordering and scalar
 * serialization rules used by RFC 8785 (JCS).
 */
export function canonicalizeJson(value: unknown): string {
  return serializeCanonicalJson(value, '$', new Set<object>());
}

export function sha256Digest(value: string | Uint8Array): Sha256Digest {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
}

export function digestCanonicalJson(value: unknown): Sha256Digest {
  return sha256Digest(canonicalizeJson(value));
}

export const canonicalJsonSha256 = digestCanonicalJson;

export function digestContentPayload(data: object): Sha256Digest {
  if (!isJsonObject(data)) {
    throw new TypeError('Content data must be a JSON object.');
  }
  return digestCanonicalJson(semanticContentData(data));
}

export const digestContentData = digestContentPayload;

export function isContentVersion(value: unknown): value is string {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    value.length > CONTENT_VERSION_MAX_LENGTH
  ) {
    return false;
  }

  const plusIndex = value.indexOf('+');
  if (plusIndex !== value.lastIndexOf('+')) return false;

  const versionAndPrerelease = plusIndex === -1 ? value : value.slice(0, plusIndex);
  const build = plusIndex === -1 ? null : value.slice(plusIndex + 1);
  if (build !== null && !isDotSeparatedIdentifiers(build, true)) return false;

  const prereleaseIndex = versionAndPrerelease.indexOf('-');
  const core =
    prereleaseIndex === -1 ? versionAndPrerelease : versionAndPrerelease.slice(0, prereleaseIndex);
  const prerelease =
    prereleaseIndex === -1 ? null : versionAndPrerelease.slice(prereleaseIndex + 1);
  if (prerelease !== null && !isDotSeparatedIdentifiers(prerelease, false)) return false;

  const coreIdentifiers = core.split('.');
  return coreIdentifiers.length === 3 && coreIdentifiers.every(isCoreVersionIdentifier);
}

export function isSha256Digest(value: unknown): value is Sha256Digest {
  return typeof value === 'string' && sha256DigestRegex.test(value);
}

export function isContentOrigin(value: unknown): value is ContentOrigin {
  return typeof value === 'string' && CONTENT_ORIGINS.includes(value as ContentOrigin);
}

export function isContentResolvedFrom(value: unknown): value is ContentResolvedFrom {
  return (
    typeof value === 'string' && CONTENT_RESOLVED_FROM_VALUES.includes(value as ContentResolvedFrom)
  );
}

function isCoreVersionIdentifier(value: string): boolean {
  if (value.length === 0 || (value.length > 1 && value[0] === '0')) return false;
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code < 48 || code > 57) return false;
  }
  return true;
}

function isDotSeparatedIdentifiers(value: string, allowNumericLeadingZeros: boolean): boolean {
  if (value.length === 0) return false;
  return value
    .split('.')
    .every((identifier) => isVersionIdentifier(identifier, allowNumericLeadingZeros));
}

function isVersionIdentifier(value: string, allowNumericLeadingZeros: boolean): boolean {
  if (value.length === 0) return false;

  let numeric = true;
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    const digit = code >= 48 && code <= 57;
    const uppercase = code >= 65 && code <= 90;
    const lowercase = code >= 97 && code <= 122;
    const hyphen = code === 45;
    if (!digit && !uppercase && !lowercase && !hyphen) return false;
    if (!digit) numeric = false;
  }

  return allowNumericLeadingZeros || !numeric || value.length === 1 || value[0] !== '0';
}

export function assertContentIdentity(value: ContentIdentity): void {
  if (!isJsonObject(value)) {
    throw new TypeError('Content identity must be an object.');
  }
  assertNonEmptyString(value.namespace, 'content namespace');
  if (!isContentType(value.type)) {
    throw new TypeError(`Invalid content type: ${String(value.type)}`);
  }
  assertNonEmptyString(value.id, 'content id');
}

export function assertContentRef(value: ContentRef): void {
  if (!isJsonObject(value)) {
    throw new TypeError('Content reference must be an object.');
  }
  assertContentIdentity(value.identity);
  assertRefVersion(value.version, value.origin, getContentItemIdentity(value));
  if (!isSha256Digest(value.digest)) {
    throw new TypeError(
      `Invalid content digest for ${getContentItemIdentity(value)}: ${String(value.digest)}`,
    );
  }
  normalizeCompatibility(value.compatibility);
  if (!isContentOrigin(value.origin)) {
    throw new TypeError(`Invalid content origin: ${String(value.origin)}`);
  }
  if (!isContentResolvedFrom(value.resolvedFrom)) {
    throw new TypeError(`Invalid content resolution source: ${String(value.resolvedFrom)}`);
  }
  if (value.overrideOf !== undefined) normalizeOverrideRef(value.overrideOf);
}

export function getContentItemIdentity(
  value: Pick<ContentRef, 'identity' | 'version'>,
): ContentItemIdentityKey {
  assertContentIdentity(value.identity);
  const version = value.version === null ? 'unversioned' : value.version;
  return `${value.identity.namespace}/${value.identity.type}/${value.identity.id}@${version}`;
}

export const getContentIdentity = getContentItemIdentity;

export function buildContentRef<TData extends object>(
  type: ContentType,
  item: TData,
  options?: BuildContentRefOptions,
): ContentRef;
export function buildContentRef<TData extends object>(
  input: ContentRefInput<TData> | ContentRecordRefInput<TData>,
): ContentRef;
export function buildContentRef<TData extends object>(
  typeOrInput: ContentType | ContentRefInput<TData> | ContentRecordRefInput<TData>,
  item?: TData,
  options: BuildContentRefOptions = {},
): ContentRef {
  const input = normalizeContentRefInput(typeOrInput, item, options);
  assertContentIdentity(input.identity);
  assertEmbeddedIdentity(input);
  const compatibility = normalizeCompatibility(input.compatibility);
  const overrideOf =
    input.overrideOf === undefined ? undefined : normalizeOverrideRef(input.overrideOf);

  const ref: ContentRef = {
    identity: normalizeIdentity(input.identity),
    version: input.version,
    digest: digestContentPayload(input.data),
    compatibility,
    origin: input.origin,
    resolvedFrom: input.resolvedFrom,
    ...(overrideOf ? { overrideOf } : {}),
  };
  assertContentRef(ref);
  return ref;
}

export const createContentRef = buildContentRef;

export function sortContentRefs(refs: readonly ContentRef[]): ContentRef[] {
  const normalized = refs.map(normalizeContentRef);
  normalized.sort(compareContentRefs);

  const identities = new Set<string>();
  for (const ref of normalized) {
    const identity = getContentItemIdentity(ref);
    if (identities.has(identity)) {
      throw new TypeError(`Duplicate content reference: ${identity}`);
    }
    identities.add(identity);
  }

  return normalized;
}

export function getContentCorpusDigest(refs: readonly ContentRef[]): Sha256Digest {
  return digestCanonicalJson(sortContentRefs(refs));
}

export function getContentCorpusIdentity(manifest: ContentCorpusManifest): ContentCorpusIdentity {
  return {
    packageName: manifest.packageName,
    packageVersion: manifest.packageVersion,
    corpusDigest: manifest.corpusDigest,
  };
}

export const getCorpusIdentity = getContentCorpusIdentity;

export function buildContentCorpusManifest(
  input: ContentCorpusManifestInput,
): ContentCorpusManifest;
export function buildContentCorpusManifest(
  refs: readonly ContentRef[],
  options: BuildContentCorpusManifestOptions,
): ContentCorpusManifest;
export function buildContentCorpusManifest(
  inputOrRefs: ContentCorpusManifestInput | readonly ContentRef[],
  options?: BuildContentCorpusManifestOptions,
): ContentCorpusManifest {
  const input = normalizeManifestInput(inputOrRefs, options);
  if (!isContentVersion(input.packageVersion)) {
    throw new TypeError(
      `Invalid @decantr/content package version: ${String(input.packageVersion)}`,
    );
  }
  const refs = sortContentRefs(input.refs);
  return {
    packageName: CONTENT_PACKAGE_NAME,
    packageVersion: input.packageVersion,
    corpusDigest: digestCanonicalJson(refs),
    compatibility: normalizeCompatibility(input.compatibility),
    refs,
  };
}

export const buildCorpusManifest = buildContentCorpusManifest;

interface NormalizedContentRefInput<TData extends object> {
  identity: ContentIdentity;
  version: string | null;
  data: TData;
  compatibility: ContentCompatibility | string;
  origin: ContentOrigin;
  resolvedFrom: ContentResolvedFrom;
  overrideOf?: ContentOverrideRef;
}

function normalizeContentRefInput<TData extends object>(
  typeOrInput: ContentType | ContentRefInput<TData> | ContentRecordRefInput<TData>,
  item: TData | undefined,
  options: BuildContentRefOptions,
): NormalizedContentRefInput<TData> {
  if (typeof typeOrInput === 'string') {
    if (!isJsonObject(item)) {
      throw new TypeError('Content data must be a JSON object.');
    }
    const origin = options.origin ?? 'official';
    const namespace =
      options.namespace ?? (origin === 'official' ? OFFICIAL_CONTENT_NAMESPACE : undefined);
    if (namespace === undefined) {
      throw new TypeError('Local content refs require an explicit namespace.');
    }
    const dataVersion = item.version;
    const version =
      options.version !== undefined
        ? options.version
        : typeof dataVersion === 'string'
          ? dataVersion
          : origin === 'local'
            ? null
            : undefined;
    if (version === undefined) {
      throw new TypeError('Official content data must include a semantic version.');
    }
    return {
      identity: {
        namespace,
        type: typeOrInput,
        id: readRequiredString(item, 'id'),
      },
      version,
      data: item as TData,
      compatibility: options.compatibility ?? readRequiredString(item, 'decantr_compat'),
      origin,
      resolvedFrom:
        options.resolvedFrom ?? (origin === 'official' ? 'installed-package' : 'local-override'),
      overrideOf: options.overrideOf,
    };
  }

  if (!isJsonObject(typeOrInput) || !isJsonObject(typeOrInput.data)) {
    throw new TypeError('Content ref input must include a JSON object in data.');
  }

  if ('identity' in typeOrInput) {
    return typeOrInput as unknown as NormalizedContentRefInput<TData>;
  }

  const origin =
    typeOrInput.origin ??
    (typeOrInput.namespace === OFFICIAL_CONTENT_NAMESPACE ? 'official' : 'local');
  return {
    identity: {
      namespace: typeOrInput.namespace,
      type: typeOrInput.type,
      id: typeOrInput.id,
    },
    version: typeOrInput.version,
    data: typeOrInput.data,
    compatibility:
      typeOrInput.compatibility ?? readRequiredString(typeOrInput.data, 'decantr_compat'),
    origin,
    resolvedFrom:
      typeOrInput.resolvedFrom ?? (origin === 'official' ? 'installed-package' : 'local-override'),
    overrideOf: typeOrInput.overrideOf,
  };
}

function assertEmbeddedIdentity(input: NormalizedContentRefInput<object>): void {
  const data = input.data as Record<string, unknown>;
  const dataId = data.id;
  if (dataId !== undefined && dataId !== input.identity.id) {
    throw new TypeError(
      `Content identity mismatch: ref id ${input.identity.id} does not match data id ${String(dataId)}.`,
    );
  }

  const dataVersion = data.version;
  if (dataVersion !== undefined && dataVersion !== input.version) {
    throw new TypeError(
      `Content version mismatch for ${getContentItemIdentity(input)}: ref ${String(input.version)}, data ${String(dataVersion)}.`,
    );
  }

  const dataType = data.type;
  if (dataType !== undefined && dataType !== input.identity.type) {
    throw new TypeError(
      `Content type mismatch for ${input.identity.id}: ref ${input.identity.type}, data ${String(dataType)}.`,
    );
  }

  const dataNamespace = data.namespace;
  if (dataNamespace !== undefined && dataNamespace !== input.identity.namespace) {
    throw new TypeError(
      `Content namespace mismatch for ${input.identity.id}: ref ${input.identity.namespace}, data ${String(dataNamespace)}.`,
    );
  }
}

function semanticContentData(data: JsonObject): JsonObject {
  return Object.fromEntries(Object.entries(data).filter(([key]) => !digestExcludedFields.has(key)));
}

function normalizeContentRef(value: ContentRef): ContentRef {
  if (!isJsonObject(value)) {
    throw new TypeError('Content reference must be an object.');
  }
  const overrideOf =
    value.overrideOf === undefined ? undefined : normalizeOverrideRef(value.overrideOf);
  const ref: ContentRef = {
    identity: normalizeIdentity(value.identity),
    version: value.version,
    digest: value.digest,
    compatibility: normalizeCompatibility(value.compatibility),
    origin: value.origin,
    resolvedFrom: value.resolvedFrom,
    ...(overrideOf ? { overrideOf } : {}),
  };
  assertContentRef(ref);
  return ref;
}

function normalizeIdentity(value: ContentIdentity): ContentIdentity {
  assertContentIdentity(value);
  return {
    namespace: value.namespace,
    type: value.type,
    id: value.id,
  };
}

function normalizeOverrideRef(value: ContentOverrideRef): ContentOverrideRef {
  if (!isJsonObject(value)) {
    throw new TypeError('Content override reference must be an object.');
  }
  const identity = normalizeIdentity(value.identity);
  if (value.version !== null && !isContentVersion(value.version)) {
    throw new TypeError(
      `Invalid override version for ${identity.type}/${identity.id}: ${String(value.version)}`,
    );
  }
  if (!isSha256Digest(value.digest)) {
    throw new TypeError(
      `Invalid override digest for ${identity.type}/${identity.id}: ${String(value.digest)}`,
    );
  }
  return { identity, version: value.version, digest: value.digest };
}

function normalizeCompatibility(value: ContentCompatibility | string): ContentCompatibility {
  const decantr = typeof value === 'string' ? value : value?.decantr;
  assertNonEmptyString(decantr, 'Decantr compatibility');
  return { decantr };
}

function assertRefVersion(version: string | null, origin: unknown, identity: string): void {
  if (version === null) {
    if (origin !== 'local') {
      throw new TypeError(`Official content ref ${identity} requires a semantic version.`);
    }
    return;
  }
  if (!isContentVersion(version)) {
    throw new TypeError(`Invalid content version for ${identity}: ${String(version)}`);
  }
}

function normalizeManifestInput(
  inputOrRefs: ContentCorpusManifestInput | readonly ContentRef[],
  options?: BuildContentCorpusManifestOptions,
): ContentCorpusManifestInput {
  if (Array.isArray(inputOrRefs)) {
    if (!options) {
      throw new TypeError('Corpus manifest options must include packageVersion and compatibility.');
    }
    return { ...options, refs: inputOrRefs };
  }
  return inputOrRefs as ContentCorpusManifestInput;
}

function compareContentRefs(left: ContentRef, right: ContentRef): number {
  return (
    compareCodeUnits(left.identity.namespace, right.identity.namespace) ||
    compareCodeUnits(left.identity.type, right.identity.type) ||
    compareCodeUnits(left.identity.id, right.identity.id) ||
    compareNullableStrings(left.version, right.version) ||
    compareCodeUnits(left.digest, right.digest) ||
    compareCodeUnits(left.compatibility.decantr, right.compatibility.decantr) ||
    compareCodeUnits(left.origin, right.origin) ||
    compareCodeUnits(left.resolvedFrom, right.resolvedFrom) ||
    compareCodeUnits(
      left.overrideOf ? canonicalizeJson(left.overrideOf) : '',
      right.overrideOf ? canonicalizeJson(right.overrideOf) : '',
    )
  );
}

function compareNullableStrings(left: string | null, right: string | null): number {
  if (left === right) return 0;
  if (left === null) return -1;
  if (right === null) return 1;
  return compareCodeUnits(left, right);
}

function compareCodeUnits(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function serializeCanonicalJson(value: unknown, path: string, stack: Set<object>): string {
  if (value === null) return 'null';

  switch (typeof value) {
    case 'boolean':
      return value ? 'true' : 'false';
    case 'number':
      if (!Number.isFinite(value)) {
        throw new TypeError(`Non-finite number at ${path} is not valid canonical JSON.`);
      }
      return JSON.stringify(value);
    case 'string':
      assertWellFormedUnicode(value, path);
      return JSON.stringify(value);
    case 'object':
      return serializeCanonicalObject(value, path, stack);
    default:
      throw new TypeError(`Unsupported ${typeof value} value at ${path}; expected JSON data.`);
  }
}

function serializeCanonicalObject(value: object, path: string, stack: Set<object>): string {
  if (stack.has(value)) {
    throw new TypeError(`Circular reference at ${path} is not valid canonical JSON.`);
  }
  stack.add(value);

  try {
    if (Array.isArray(value)) {
      if (Object.getOwnPropertySymbols(value).length > 0) {
        throw new TypeError(`Symbol-keyed property at ${path} is not valid canonical JSON.`);
      }
      const keys = Object.keys(value);
      const entries: string[] = [];
      for (let index = 0; index < value.length; index += 1) {
        if (!(index in value)) {
          throw new TypeError(
            `Sparse array entry at ${path}[${index}] is not valid canonical JSON.`,
          );
        }
        const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
        if (!descriptor || !('value' in descriptor)) {
          throw new TypeError(
            `Accessor array entry at ${path}[${index}] is not valid canonical JSON.`,
          );
        }
        entries.push(serializeCanonicalJson(descriptor.value, `${path}[${index}]`, stack));
      }
      if (keys.some((key) => !isArrayIndex(key, value.length))) {
        throw new TypeError(`Array at ${path} has non-JSON properties.`);
      }
      return `[${entries.join(',')}]`;
    }

    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new TypeError(`Non-plain object at ${path} is not valid canonical JSON.`);
    }
    if (Object.getOwnPropertySymbols(value).length > 0) {
      throw new TypeError(`Symbol-keyed property at ${path} is not valid canonical JSON.`);
    }

    const record = value as Record<string, unknown>;
    const keys = Object.keys(record).sort(compareCodeUnits);
    return `{${keys
      .map((key) => {
        assertWellFormedUnicode(key, `${path} key`);
        const descriptor = Object.getOwnPropertyDescriptor(record, key);
        if (!descriptor || !('value' in descriptor)) {
          throw new TypeError(`Accessor property ${key} at ${path} is not valid canonical JSON.`);
        }
        return `${JSON.stringify(key)}:${serializeCanonicalJson(descriptor.value, `${path}.${key}`, stack)}`;
      })
      .join(',')}}`;
  } finally {
    stack.delete(value);
  }
}

function assertWellFormedUnicode(value: string, path: string): void {
  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index);
    if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (!Number.isInteger(next) || next < 0xdc00 || next > 0xdfff) {
        throw new TypeError(`Lone high surrogate at ${path} is not valid canonical JSON.`);
      }
      index += 1;
    } else if (codeUnit >= 0xdc00 && codeUnit <= 0xdfff) {
      throw new TypeError(`Lone low surrogate at ${path} is not valid canonical JSON.`);
    }
  }
}

function isArrayIndex(key: string, length: number): boolean {
  if (!/^(0|[1-9][0-9]*)$/.test(key)) return false;
  const index = Number(key);
  return Number.isSafeInteger(index) && index >= 0 && index < length;
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readRequiredString(record: object, key: string): string {
  const value = (record as Record<string, unknown>)[key];
  if (typeof value !== 'string') {
    throw new TypeError(`Content data must include string ${key}.`);
  }
  return value;
}

function assertNonEmptyString(value: unknown, label: string): asserts value is string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new TypeError(`${label} must be a non-empty string.`);
  }
}
