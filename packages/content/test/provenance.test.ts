import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';
import {
  buildContentCorpusManifest,
  buildContentRef,
  type ContentIdentity,
  canonicalizeJson,
  digestCanonicalJson,
  getContentCorpusIdentity,
  getContentItemIdentity,
  getContentPackageVersion,
  getContentProvenanceSchema,
  listContentProvenanceSchemas,
  sortContentRefs,
} from '../src/index.js';

describe('canonical content provenance', () => {
  it('canonicalizes and hashes equivalent JSON deterministically', () => {
    const first = {
      z: [3, { beta: true, alpha: 'Euro: \u20ac\n' }],
      tiny: 1e-7,
      negativeZero: -0,
      exponent: 1e30,
      rounded: Number('333333333.33333329'),
    };
    const second = {
      rounded: Number('333333333.33333329'),
      exponent: 1e30,
      negativeZero: 0,
      tiny: 0.0000001,
      z: [3, { alpha: 'Euro: \u20ac\n', beta: true }],
    };

    const expected =
      '{"exponent":1e+30,"negativeZero":0,"rounded":333333333.3333333,"tiny":1e-7,"z":[3,{"alpha":"Euro: \u20ac\\n","beta":true}]}';
    expect(canonicalizeJson(first)).toBe(expected);
    expect(canonicalizeJson(second)).toBe(expected);
    expect(digestCanonicalJson(first)).toBe(digestCanonicalJson(second));
    expect(digestCanonicalJson(first)).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it('rejects values outside the parsed JSON data model', () => {
    expect(() => canonicalizeJson({ value: Number.NaN })).toThrow(/Non-finite number/);
    expect(() => canonicalizeJson({ value: undefined })).toThrow(/Unsupported undefined/);
    expect(() => canonicalizeJson({ value: '\ud800' })).toThrow(/Lone high surrogate/);
  });

  it('emits the frozen identity shape and enforces official/local version rules', () => {
    const official = buildContentRef('pattern', {
      id: 'content-uuid-1',
      slug: 'data-table',
      version: '1.2.3-beta.1+build.7',
      decantr_compat: '>=2.0.0',
      name: 'Data Table',
    });
    const local = buildContentRef({
      identity: {
        namespace: '@local/acme',
        type: 'pattern',
        id: 'legacy:table',
        slug: 'legacy-table-display-alias',
      } as ContentIdentity & { slug: string },
      version: null,
      data: { name: 'Legacy Table' },
      compatibility: { decantr: '>=2.0.0' },
      origin: 'local',
      resolvedFrom: 'local-override',
      overrideOf: {
        identity: official.identity,
        version: official.version,
        digest: official.digest,
      },
    });

    expect(official).toMatchObject({
      identity: { namespace: '@official', type: 'pattern', id: 'content-uuid-1' },
      version: '1.2.3-beta.1+build.7',
      compatibility: { decantr: '>=2.0.0' },
      origin: 'official',
      resolvedFrom: 'installed-package',
    });
    expect(Object.keys(official)).toEqual([
      'identity',
      'version',
      'digest',
      'compatibility',
      'origin',
      'resolvedFrom',
    ]);
    expect(Object.keys(local.identity)).toEqual(['namespace', 'type', 'id']);
    expect(official).not.toHaveProperty('slug');
    expect(getContentItemIdentity(official)).toBe(
      '@official/pattern/content-uuid-1@1.2.3-beta.1+build.7',
    );
    expect(getContentItemIdentity(local)).toBe('@local/acme/pattern/legacy:table@unversioned');
    expect(local.overrideOf).toEqual({
      identity: official.identity,
      version: official.version,
      digest: official.digest,
    });

    expect(() =>
      buildContentRef('pattern', {
        id: 'data-table',
        version: '01.0.0',
        decantr_compat: '>=2.0.0',
      }),
    ).toThrow(/Invalid content version/);
    expect(() =>
      buildContentRef({
        identity: { namespace: '@official', type: 'pattern', id: 'data-table' },
        version: null,
        data: { id: 'data-table', decantr_compat: '>=2.0.0' },
        compatibility: '>=2.0.0',
        origin: 'official',
        resolvedFrom: 'api',
      }),
    ).toThrow(/requires a semantic version/);
    expect(() =>
      buildContentRef({
        identity: { namespace: '@official', type: 'pattern', id: 'data-table' },
        version: '2.0.0',
        data: { id: 'data-table', version: '1.0.0', decantr_compat: '>=2.0.0' },
        compatibility: '>=2.0.0',
        origin: 'official',
        resolvedFrom: 'api',
      }),
    ).toThrow(/Content version mismatch/);
  });

  it('excludes transport aliases but preserves authored semantic fields', () => {
    const packageData = {
      $schema: 'https://decantr.ai/schemas/theme.v1.json',
      id: 'theme-uuid-1',
      slug: 'clean',
      version: '1.0.0',
      decantr_compat: '>=2.0.0',
      source: 'core',
      transport: { kind: 'package', cacheKey: 'package-theme-clean' },
      path: '/package/themes/clean.json',
      updated_at: '2026-07-16T10:00:00.000Z',
      name: 'Clean',
      seed: { background: '#ffffff', foreground: '#111111' },
    };
    const apiData = {
      name: 'Clean',
      source: 'core',
      transport: { kind: 'api', url: 'https://content.example/themes/clean' },
      version: '1.0.0',
      id: 'theme-uuid-1',
      slug: 'clean-display-alias',
      $schema: 'https://mirror.example/schemas/theme.json',
      decantr_compat: '>=2.0.0',
      path: '/cache/themes/clean.json',
      updated_at: '2026-07-16T12:00:00.000Z',
      seed: { foreground: '#111111', background: '#ffffff' },
    };

    const fromPackage = buildContentRef({
      namespace: '@official',
      type: 'theme',
      id: 'theme-uuid-1',
      version: '1.0.0',
      data: packageData,
      origin: 'official',
      resolvedFrom: 'installed-package',
      transport: { path: '/package/themes/clean.json', loadedAt: '2026-07-16T10:00:00.000Z' },
    });
    const fromApi = buildContentRef({
      identity: { namespace: '@official', type: 'theme', id: 'theme-uuid-1' },
      version: '1.0.0',
      data: apiData,
      compatibility: '>=2.0.0',
      origin: 'official',
      resolvedFrom: 'api',
      transport: {
        url: 'https://content.example/themes/clean',
        fetchedAt: '2026-07-16T12:00:00.000Z',
      },
    });
    const authoredSourceChanged = buildContentRef({
      identity: fromApi.identity,
      version: fromApi.version,
      data: { ...apiData, source: 'community' },
      compatibility: fromApi.compatibility,
      origin: 'official',
      resolvedFrom: 'api',
    });

    expect(fromApi.identity).toEqual(fromPackage.identity);
    expect(fromApi.version).toBe(fromPackage.version);
    expect(fromApi.digest).toBe(fromPackage.digest);
    expect(fromApi.resolvedFrom).not.toBe(fromPackage.resolvedFrom);
    expect(fromApi).not.toHaveProperty('transport');
    expect(authoredSourceChanged.digest).not.toBe(fromApi.digest);
  });

  it('sorts exact refs and keeps corpus identity stable across input order', () => {
    const refs = [
      buildContentRef('pattern', {
        id: 'zeta',
        version: '1.0.0',
        decantr_compat: '>=2.0.0',
        name: 'Zeta',
      }),
      buildContentRef('archetype', {
        id: 'alpha',
        version: '2.0.0',
        decantr_compat: '>=2.0.0',
        name: 'Alpha',
      }),
      buildContentRef('pattern', {
        id: 'alpha',
        version: '1.1.0',
        decantr_compat: '>=2.0.0',
        name: 'Alpha',
      }),
    ];
    const transportedRefs = refs.map((ref, index) => ({
      ...ref,
      path: `/source/${index}`,
      fetchedAt: `2026-07-16T12:00:0${index}.000Z`,
    }));
    const input = {
      packageVersion: '3.9.0',
      compatibility: { decantr: '>=2.0.0' },
      refs: transportedRefs,
    };

    const first = buildContentCorpusManifest(input);
    const second = buildContentCorpusManifest({ ...input, refs: [...transportedRefs].reverse() });
    const repackaged = buildContentCorpusManifest({ ...input, packageVersion: '3.10.0' });

    expect(first).toEqual(second);
    expect(first.packageName).toBe('@decantr/content');
    expect(first.packageVersion).toBe(getContentPackageVersion());
    expect(first.compatibility).toEqual({ decantr: '>=2.0.0' });
    expect(first.refs.map(getContentItemIdentity)).toEqual([
      '@official/archetype/alpha@2.0.0',
      '@official/pattern/alpha@1.1.0',
      '@official/pattern/zeta@1.0.0',
    ]);
    expect(first.refs.every((ref) => !('path' in ref) && !('fetchedAt' in ref))).toBe(true);
    expect(first.corpusDigest).toBe(digestCanonicalJson(first.refs));
    expect(repackaged.corpusDigest).toBe(first.corpusDigest);
    expect(getContentCorpusIdentity(first)).toEqual({
      packageName: '@decantr/content',
      packageVersion: '3.9.0',
      corpusDigest: first.corpusDigest,
    });
    expect(sortContentRefs(transportedRefs)).toEqual(first.refs);
    expect(() => buildContentCorpusManifest({ ...input, refs: [refs[0]!, refs[0]!] })).toThrow(
      /Duplicate content reference/,
    );
  });

  it('ships strict schemas for each frozen public provenance contract', () => {
    const schemas = listContentProvenanceSchemas();
    expect(schemas.map(({ type }) => type)).toEqual(['identity', 'ref', 'manifest']);

    const ajv = new Ajv2020({ allErrors: true, strict: true });
    const validateIdentity = ajv.compile(getContentProvenanceSchema('identity'));
    const validateRef = ajv.compile(getContentProvenanceSchema('ref'));
    const validateManifest = ajv.compile(getContentProvenanceSchema('manifest'));
    const ref = buildContentRef('shell', {
      id: 'sidebar-main',
      version: '1.0.0',
      decantr_compat: '>=2.0.0',
    });
    const local = buildContentRef({
      identity: { namespace: '@local', type: 'shell', id: 'legacy-shell' },
      version: null,
      data: { name: 'Legacy Shell' },
      compatibility: '>=2.0.0',
      origin: 'local',
      resolvedFrom: 'configured-corpus',
    });
    const manifest = buildContentCorpusManifest({
      packageVersion: '3.9.0',
      compatibility: '>=2.0.0',
      refs: [local, ref],
    });

    expect(validateIdentity(ref.identity)).toBe(true);
    expect(validateIdentity({ ...ref.identity, slug: 'sidebar-main' })).toBe(false);
    expect(validateRef(ref)).toBe(true);
    expect(validateRef(local)).toBe(true);
    expect(validateManifest(manifest)).toBe(true);
    expect(validateRef({ ...ref, version: null })).toBe(false);
    expect(validateRef({ ...ref, slug: 'sidebar-main' })).toBe(false);
    expect(validateManifest({ ...manifest, generatedAt: '2026-07-16T12:00:00.000Z' })).toBe(false);
    expect(validateManifest({ ...manifest, packageName: '@decantr/registry' })).toBe(false);
  });
});
