#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = new Set(process.argv.slice(2));
const jsonOutput = args.has('--json');
const keep = args.has('--keep');
const skipBuild = args.has('--skip-build');
const workDir = mkdtempSync(join(tmpdir(), 'decantr-packed-facade-'));
const tarballDir = join(workDir, 'tarballs');
const installDir = join(workDir, 'consumer');
const extractDir = join(workDir, 'extract');
const packageNames = ['@decantr/essence-spec', '@decantr/content', '@decantr/registry'];
const dependencyFields = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
];
const forbiddenPackedText = [
  { pattern: /\/Users\//u, label: 'local macOS path' },
  { pattern: /registry\.decantr\.ai/u, label: 'retired public registry host' },
  { pattern: /supabase\.co/u, label: 'retired Supabase host' },
];
const registryClientBaseline = {
  package: '@decantr/registry@3.8.1',
  integrity:
    'sha512-hkrbgSUqlN6VFNNcjFSJ9vKwYlg127wQfTmdPdfxipnqJ4ZgGlU1ByU4929g4Wv+0gcqg9LQ7m2EasYzGrrQDA==',
  runtimeExports: [
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
  ],
  typeExports: [
    'ApiContentType',
    'BlueprintArtifactStatus',
    'BlueprintPortfolioArtifact',
    'BlueprintPortfolioMaturity',
    'BlueprintPortfolioMetadata',
    'BlueprintPortfolioVisibility',
    'ContentBenchmarkConfidence',
    'ContentGoldenUsage',
    'ContentIntelligenceMetadata',
    'ContentIntelligenceSource',
    'ContentItem',
    'ContentListResponse',
    'ContentVerificationStatus',
    'OwnedContentSummary',
    'PublicBlueprintSet',
    'PublicContentRecord',
    'PublicContentSort',
    'PublicContentSource',
    'PublicContentSummary',
    'PublicUserProfile',
    'PublishPayload',
    'PublishResponse',
    'RegistryAPIClient',
    'RegistryAPIClientOptions',
    'RegistryAPIError',
    'RegistryClient',
    'RegistryClientOptions',
    'RegistryIntelligenceSummaryBucket',
    'RegistryIntelligenceSummaryResponse',
    'SearchParams',
    'SearchResponse',
    'SearchResult',
    'ShowcaseManifestEntry',
    'ShowcaseManifestResponse',
    'ShowcaseShortlistReport',
    'ShowcaseShortlistResponse',
    'ShowcaseShortlistSummary',
    'ShowcaseVerificationEntry',
    'UserProfile',
  ],
};

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd: options.cwd ?? root,
    encoding: 'utf8',
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result.status !== 0) {
    throw new Error(
      [
        `${command} ${commandArgs.join(' ')} exited ${result.status ?? 'without status'}.`,
        result.stdout?.trim(),
        result.stderr?.trim(),
      ]
        .filter(Boolean)
        .join('\n'),
    );
  }
  return result.stdout;
}

function parsePackOutput(output) {
  const parsed = JSON.parse(output.trim());
  const value = Array.isArray(parsed) ? parsed[0] : parsed;
  if (!value?.filename || typeof value.filename !== 'string') {
    throw new Error('pnpm pack did not report a tarball filename.');
  }
  return value;
}

function sha256File(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function assertNoWorkspaceDependencies(manifest) {
  for (const field of dependencyFields) {
    for (const [name, version] of Object.entries(manifest[field] ?? {})) {
      if (typeof version === 'string' && version.startsWith('workspace:')) {
        throw new Error(`${manifest.name} packed manifest leaks ${field}.${name}=${version}.`);
      }
    }
  }
}

function assertFacadeDependencyDirection(manifest) {
  const dependencyNames = dependencyFields.flatMap((field) => Object.keys(manifest[field] ?? {}));
  if (manifest.name === '@decantr/content' && dependencyNames.includes('@decantr/registry')) {
    throw new Error('@decantr/content packed manifest reverses the registry facade dependency.');
  }
  if (
    manifest.name === '@decantr/registry' &&
    typeof manifest.dependencies?.['@decantr/content'] !== 'string'
  ) {
    throw new Error('@decantr/registry packed manifest does not delegate to @decantr/content.');
  }
}

function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

function auditPackedText(packageRoot, packageName) {
  const textExtensions = new Set(['.cjs', '.js', '.json', '.md', '.mjs', '.ts']);
  for (const path of listFiles(packageRoot)) {
    if (!textExtensions.has(extname(path)) || statSync(path).size > 2_000_000) continue;
    const text = readFileSync(path, 'utf8');
    for (const forbidden of forbiddenPackedText) {
      if (forbidden.pattern.test(text)) {
        throw new Error(
          `${packageName} packed file ${path.slice(packageRoot.length + 1)} leaks ${forbidden.label}.`,
        );
      }
    }
  }
}

function writeConsumerProbe(path) {
  writeFileSync(
    path,
    `import { createHash } from 'node:crypto';
import { lstatSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import * as content from '@decantr/content';
import * as contentClient from '@decantr/content/client';
import * as registry from '@decantr/registry';
import * as registryClient from '@decantr/registry/client';

const require = createRequire(import.meta.url);
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const sha256 = (value) => createHash('sha256').update(value).digest('hex');

check(
  content.ContentAPIClient === contentClient.ContentAPIClient,
  '@decantr/content root/client ContentAPIClient identity drifted.',
);
check(
  content.ContentAPIError === contentClient.ContentAPIError,
  '@decantr/content root/client ContentAPIError identity drifted.',
);
check(
  content.createContentAPIClient === contentClient.createContentAPIClient,
  '@decantr/content root/client createContentAPIClient identity drifted.',
);
check(
  content.createContentClient === contentClient.createContentClient,
  '@decantr/content root/client createContentClient identity drifted.',
);
check(
  registry.RegistryAPIClient.prototype instanceof contentClient.ContentAPIClient,
  'RegistryAPIClient no longer extends ContentAPIClient.',
);
const legacyError = new registry.RegistryAPIError(409, 'conflict', { reason: 'duplicate' });
check(legacyError instanceof contentClient.ContentAPIError, 'RegistryAPIError no longer extends ContentAPIError.');
check(legacyError.name === 'RegistryAPIError', 'RegistryAPIError lost its legacy observable name.');
check(legacyError.status === 409, 'RegistryAPIError lost its status code.');
check(legacyError.details?.reason === 'duplicate', 'RegistryAPIError lost its details payload.');
check(
  registry.createRegistryClient === contentClient.createContentClient,
  'createRegistryClient runtime identity drifted.',
);
check(
  registryClient.createRegistryClient === contentClient.createContentClient,
  '@decantr/registry/client factory identity drifted.',
);
check(typeof content.buildContentRef === 'function', 'Content provenance helper is not exported.');
check(registry.buildContentRef === content.buildContentRef, 'Registry provenance helper is not delegated.');

const expectedRegistryClientRuntimeExports = ${JSON.stringify(
      registryClientBaseline.runtimeExports,
    )};
const missingRegistryClientRuntimeExports = expectedRegistryClientRuntimeExports.filter(
  (name) => !(name in registryClient),
);
check(
  missingRegistryClientRuntimeExports.length === 0,
  '${registryClientBaseline.package} /client runtime exports missing: ' +
    missingRegistryClientRuntimeExports.join(', '),
);

const legacyRuntimeDelegates = {
  API_CONTENT_TYPES: contentClient.API_CONTENT_TYPES,
  API_CONTENT_TYPE_TO_CONTENT_TYPE: contentClient.API_CONTENT_TYPE_TO_CONTENT_TYPE,
  BLUEPRINT_ARTIFACT_STATUSES: contentClient.BLUEPRINT_ARTIFACT_STATUSES,
  BLUEPRINT_PORTFOLIO_MATURITIES: contentClient.BLUEPRINT_PORTFOLIO_MATURITIES,
  BLUEPRINT_PORTFOLIO_VISIBILITIES: contentClient.BLUEPRINT_PORTFOLIO_VISIBILITIES,
  CONTENT_INTELLIGENCE_SOURCES: contentClient.CONTENT_INTELLIGENCE_SOURCES,
  CONTENT_TYPES: contentClient.CONTENT_TYPES,
  CONTENT_TYPE_TO_API_CONTENT_TYPE: contentClient.CONTENT_TYPE_TO_API_CONTENT_TYPE,
  PUBLIC_BLUEPRINT_SETS: contentClient.PUBLIC_BLUEPRINT_SETS,
  PUBLIC_CONTENT_SOURCES: contentClient.PUBLIC_CONTENT_SOURCES,
  buildCorpusIntelligenceSummary: content.buildContentIntelligenceSummary,
  comparePublicContent: contentClient.comparePublicContent,
  createCorpusResolver: content.createContentResolver,
  createRegistryClient: contentClient.createContentClient,
  getBlueprintPortfolioMetadata: contentClient.getBlueprintPortfolioMetadata,
  getCorpusCatalog: content.getContentCatalog,
  getCorpusRecord: content.getContentRecord,
  isApiContentType: contentClient.isApiContentType,
  isBlueprintArtifactStatus: contentClient.isBlueprintArtifactStatus,
  isBlueprintPortfolioMaturity: contentClient.isBlueprintPortfolioMaturity,
  isBlueprintPortfolioVisibility: contentClient.isBlueprintPortfolioVisibility,
  isContentIntelligenceSource: contentClient.isContentIntelligenceSource,
  isContentType: contentClient.isContentType,
  isPublicBlueprintSet: contentClient.isPublicBlueprintSet,
  isPublicContentSource: contentClient.isPublicContentSource,
  listCorpusRecords: content.listContentRecords,
  normalizePublicContentSort: contentClient.normalizePublicContentSort,
  resolveCorpusContent: content.resolveContent,
  searchCorpusContent: content.searchContent,
  sortPublicContent: contentClient.sortPublicContent,
  validateOfficialCorpus: content.validateOfficialCorpus,
};
for (const [name, implementation] of Object.entries(legacyRuntimeDelegates)) {
  check(registryClient[name] === implementation, name + ' is not delegated to @decantr/content.');
}

const contentSchema = require.resolve('@decantr/content/schema/pattern.v2.json');
const registrySchema = require.resolve('@decantr/registry/schema/pattern.v2.json');
check(
  sha256(readFileSync(contentSchema)) === sha256(readFileSync(registrySchema)),
  'Legacy registry pattern schema is not byte-identical to content ownership.',
);

const record = {
  id: 'packed-provenance-probe',
  slug: 'packed-provenance-probe',
  version: '1.0.0',
  name: 'Packed provenance probe',
  description: 'Proves semantic digest projection.',
  path: '/tmp/transport-only.json',
  generatedAt: '2026-07-16T00:00:00.000Z',
};
const ref = content.buildContentRef('pattern', record, {
  version: '1.0.0',
  compatibility: '>=3.9.0',
  origin: 'official',
  resolvedFrom: 'installed-package',
  transport: { absolutePath: '/tmp/must-not-leak.json' },
});
check(!JSON.stringify(ref).includes('/tmp/'), 'ContentRef leaked transport provenance.');
check(registry.buildContentRef('pattern', record, {
  version: '1.0.0',
  compatibility: '>=3.9.0',
  origin: 'official',
  resolvedFrom: 'installed-package',
}).digest === ref.digest, 'Registry facade changed the content digest.');

delete process.env.DECANTR_API_URL;
process.env.REGISTRY_URL = 'https://compat.invalid/v1';
let requestedUrl = null;
globalThis.fetch = async (input) => {
  requestedUrl = String(input);
  return new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } });
};
const healthy = await new registry.RegistryAPIClient().checkHealth();
check(healthy, 'Compatibility client health request failed.');
check(requestedUrl === 'https://compat.invalid/health', 'REGISTRY_URL compatibility alias was ignored.');
const registryUrlAlias = requestedUrl;
globalThis.fetch = async () =>
  new Response(JSON.stringify({ error: 'Pattern not found' }), {
    status: 404,
    headers: { 'content-type': 'application/json' },
  });
const translatedError = await new registry.RegistryAPIClient()
  .getPattern('@official', 'missing')
  .catch((cause) => cause);
check(translatedError instanceof registry.RegistryAPIError, 'RegistryAPIClient did not translate errors to RegistryAPIError.');
check(translatedError instanceof contentClient.ContentAPIError, 'Translated registry error lost content compatibility.');
check(translatedError?.name === 'RegistryAPIError', 'Translated registry error lost its legacy name.');

for (const packageName of ['content', 'registry']) {
  const path = new URL('./node_modules/@decantr/' + packageName, import.meta.url);
  check(!lstatSync(path).isSymbolicLink(), '@decantr/' + packageName + ' was installed as a workspace symlink.');
}

if (failures.length > 0) {
  for (const failure of failures) console.error(failure);
  process.exit(1);
}
console.log(JSON.stringify({
  status: 'pass',
  contentVersion: JSON.parse(readFileSync(new URL('./node_modules/@decantr/content/package.json', import.meta.url), 'utf8')).version,
  registryVersion: JSON.parse(readFileSync(new URL('./node_modules/@decantr/registry/package.json', import.meta.url), 'utf8')).version,
  registryClientCompatibilityBaseline: '${registryClientBaseline.package}',
  registryClientRuntimeExportCount: expectedRegistryClientRuntimeExports.length,
  registryUrlAlias,
  contentDigest: ref.digest,
}));
`,
    'utf8',
  );
}

function writeBrowserProbe(path) {
  writeFileSync(
    path,
    `Reflect.deleteProperty(globalThis, 'process');
if ('process' in globalThis) throw new Error('Browser probe could not remove global process.');

const contentClient = await import('@decantr/content/client');
const registryClient = await import('@decantr/registry/client');
new contentClient.ContentAPIClient();
contentClient.createContentAPIClient();
new registryClient.RegistryAPIClient();

console.log(JSON.stringify({ status: 'pass', processPresent: 'process' in globalThis }));
`,
    'utf8',
  );
}

function writeTypeProbe(path) {
  const registryImports = registryClientBaseline.typeExports
    .map((name) => `  ${name},`)
    .join('\n');
  const registryTuple = registryClientBaseline.typeExports
    .map((name) => `  ${name},`)
    .join('\n');
  writeFileSync(
    path,
    `import type {
${registryImports}
} from '@decantr/registry/client';
import type {
  ContentAPIClient,
  ContentAPIClientOptions,
  ContentAPIError,
  ContentClient,
  ContentClientOptions,
  ContentIntelligenceSummaryBucket,
  ContentIntelligenceSummaryResponse,
  ContentSearchResult,
} from '@decantr/content/client';

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2)
    ? (<Value>() => Value extends Right ? 1 : 2) extends
      (<Value>() => Value extends Left ? 1 : 2)
      ? true
      : false
    : false;
type Assert<Value extends true> = Value;

export type Registry381ClientTypeSurface = [
${registryTuple}
];
export type RegistryClientAliasIdentity = [
  Assert<RegistryAPIClient extends ContentAPIClient ? true : false>,
  Assert<Equal<RegistryAPIClientOptions, ContentAPIClientOptions>>,
  Assert<RegistryAPIError extends ContentAPIError ? true : false>,
  Assert<Equal<RegistryClient, ContentClient>>,
  Assert<Equal<RegistryClientOptions, ContentClientOptions>>,
  Assert<Equal<RegistryIntelligenceSummaryBucket, ContentIntelligenceSummaryBucket>>,
  Assert<Equal<RegistryIntelligenceSummaryResponse, ContentIntelligenceSummaryResponse>>,
  Assert<Equal<SearchResult, ContentSearchResult>>,
];
`,
    'utf8',
  );
}

function writeTypeScriptConfig(path, typeProbePath) {
  writeFileSync(
    path,
    `${JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          module: 'NodeNext',
          moduleResolution: 'NodeNext',
          strict: true,
          noEmit: true,
          skipLibCheck: false,
          types: [],
        },
        files: [typeProbePath],
      },
      null,
      2,
    )}\n`,
    'utf8',
  );
}

let summary;
try {
  mkdirSync(tarballDir, { recursive: true });
  mkdirSync(installDir, { recursive: true });
  mkdirSync(extractDir, { recursive: true });

  if (!skipBuild) {
    run('pnpm', [
      '--filter',
      '@decantr/essence-spec',
      '--filter',
      '@decantr/content',
      '--filter',
      '@decantr/registry',
      'build',
    ]);
  }

  const packed = [];
  for (const name of packageNames) {
    const pack = parsePackOutput(
      run('pnpm', ['--filter', name, 'pack', '--pack-destination', tarballDir, '--json']),
    );
    const tarballPath = resolve(pack.filename);
    if (!existsSync(tarballPath)) throw new Error(`Missing packed tarball for ${name}: ${tarballPath}`);
    const packageExtractDir = join(extractDir, name.replace('@decantr/', ''));
    mkdirSync(packageExtractDir, { recursive: true });
    run('tar', ['-xzf', tarballPath, '-C', packageExtractDir]);
    const packageRoot = join(packageExtractDir, 'package');
    const manifest = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'));
    if (manifest.name !== name) throw new Error(`Packed name mismatch for ${name}.`);
    assertNoWorkspaceDependencies(manifest);
    assertFacadeDependencyDirection(manifest);
    auditPackedText(packageRoot, name);
    packed.push({
      name,
      version: manifest.version,
      tarballPath,
      tarball: basename(tarballPath),
      sha256: sha256File(tarballPath),
      files: arrayLength(pack.files),
    });
  }

  writeFileSync(
    join(installDir, 'package.json'),
    `${JSON.stringify({ name: 'decantr-packed-consumer', private: true, type: 'module' }, null, 2)}\n`,
    'utf8',
  );
  run(
    'npm',
    [
      'install',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      ...packed.map((entry) => entry.tarballPath),
    ],
    { cwd: installDir },
  );
  run('npm', ['ls', '--all', '--json'], { cwd: installDir });
  const probePath = join(installDir, 'probe.mjs');
  writeConsumerProbe(probePath);
  const probe = JSON.parse(run(process.execPath, [probePath], { cwd: installDir }).trim());
  const browserProbePath = join(installDir, 'browser-probe.mjs');
  writeBrowserProbe(browserProbePath);
  const browserProbe = JSON.parse(
    run(process.execPath, [browserProbePath], { cwd: installDir }).trim(),
  );
  const typeProbePath = join(installDir, 'type-probe.ts');
  const typeScriptConfigPath = join(installDir, 'tsconfig.json');
  writeTypeProbe(typeProbePath);
  writeTypeScriptConfig(typeScriptConfigPath, typeProbePath);
  run('pnpm', ['exec', 'tsc', '--project', typeScriptConfigPath], { cwd: root });
  summary = {
    status: 'pass',
    workDir: keep ? workDir : null,
    packed,
    probe,
    browserProbe,
    typeProbe: {
      status: 'pass',
      compatibilityBaseline: registryClientBaseline.package,
      exportCount: registryClientBaseline.typeExports.length,
    },
  };
} catch (cause) {
  summary = { status: 'fail', workDir, error: cause.message };
} finally {
  if (!keep && summary?.status === 'pass') rmSync(workDir, { recursive: true, force: true });
}

if (jsonOutput) console.log(JSON.stringify(summary, null, 2));
else if (summary.status === 'pass') {
  console.log('Packed content/registry facade audit passed.');
  for (const entry of summary.packed) {
    console.log(`- ${entry.name}@${entry.version}: ${entry.files} files, sha256:${entry.sha256}`);
  }
  console.log(
    `- ${summary.probe.registryClientCompatibilityBaseline} /client compatibility: ${summary.probe.registryClientRuntimeExportCount} runtime, ${summary.typeProbe.exportCount} type exports`,
  );
  console.log(`- browser-safe no-process construction: ${summary.browserProbe.status}`);
  console.log(`- REGISTRY_URL alias: ${summary.probe.registryUrlAlias}`);
  if (summary.workDir) console.log(`- retained evidence: ${summary.workDir}`);
} else {
  console.error('Packed content/registry facade audit failed:');
  console.error(summary.error);
  console.error(`Evidence retained at ${summary.workDir}`);
}

process.exit(summary.status === 'pass' ? 0 : 1);

function arrayLength(value) {
  return Array.isArray(value) ? value.length : 0;
}
