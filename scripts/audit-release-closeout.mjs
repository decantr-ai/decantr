#!/usr/bin/env node
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  lstatSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { readArgValue } from './cli-arg-lib.mjs';
import { getRepoRoot, sortReleaseEntries } from './package-surface-lib.mjs';
import { readNpmDistTags, readNpmVersions } from './npm-surface-lib.mjs';
import {
  artifactVerificationModes,
  resolveArtifactVerificationMode,
} from './release-closeout-policy.mjs';
import {
  THREE_NINE_MISSING_EVIDENCE_PATH,
  THREE_NINE_QUALIFICATION_PACKET_PATH,
  THREE_NINE_RELEASE_WAIVER_PATH,
  evaluateThreeNineReleasePolicy,
} from './3-9-release-policy.mjs';

const rawArgs = process.argv.slice(2);
const args = new Set(rawArgs);
const jsonOutput = args.has('--json');
const allowDirty = args.has('--allow-dirty');
const skipGit = args.has('--skip-git');
const skipNpm = args.has('--skip-npm');
const noFetch = args.has('--no-fetch');
const includeExperimental = args.has('--include-experimental');
const onlyWave = readArgValue(rawArgs, 'wave');
const tagOverride = readArgValue(rawArgs, 'tag-override') ?? readArgValue(rawArgs, 'tag');
const stagingManifestOverride = readArgValue(rawArgs, 'staging-manifest');
const stagingDirOverride = readArgValue(rawArgs, 'staging-dir');
const onlyNames = new Set(
  readArgValue(rawArgs, 'only')
    ? readArgValue(rawArgs, 'only')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
    : [],
);
const explicitVersion = readArgValue(rawArgs, 'version');
const root = process.env.NODE_ENV === 'test' && process.env.DECANTR_RELEASE_TEST_ROOT
  ? resolve(process.env.DECANTR_RELEASE_TEST_ROOT)
  : getRepoRoot();
const releaseVersion = normalizeVersion(explicitVersion);
const releaseTag = releaseVersion ? `v${releaseVersion}` : null;
const generatedAt = new Date().toISOString();
const checks = [];
let tagCommit = null;
let surface = null;
let selected = [];
let expandedDependencies = [];
let stagingManifestPath = null;
let stagingManifest = null;
const STAGING_SCHEMA_VERSION = 'decantr-release-staging.v1';
const GIT_MAX_BUFFER_BYTES = 64 * 1024 * 1024;

if (!releaseVersion) {
  addCheck('release', 'target version', 'fail', 'Pass an explicit --version=x.y.z release target.');
} else {
  addCheck('release', 'target version', 'pass', releaseVersion);
}

if (releaseTag && !skipGit && !noFetch) {
  runGit(['fetch', '--tags', 'origin', 'main'], { stdio: 'ignore' });
}

if (releaseTag) {
  tagCommit = localTagCommit(releaseTag);
  addCheck(
    'git',
    `local tag ${releaseTag}`,
    tagCommit ? 'pass' : 'fail',
    tagCommit ? tagCommit : `Missing local tag ${releaseTag}; closeout evidence cannot fall back to HEAD.`,
  );
}

const worktreeStatus = runGit(['status', '--short'], { allowFailure: true })?.trim() ?? '';
if (!skipGit) {
  if (worktreeStatus && !allowDirty) {
    addCheck('git', 'worktree clean', 'fail', 'Working tree is dirty. Commit or stash release changes before closeout.');
  } else {
    addCheck('git', 'worktree clean', 'pass', worktreeStatus ? 'dirty allowed by --allow-dirty' : 'clean');
  }

  if (releaseTag) {
    const remoteCommit = originTagCommit(releaseTag);
    addCheck(
      'git',
      `origin tag ${releaseTag}`,
      remoteCommit ? 'pass' : 'fail',
      remoteCommit ?? `Missing pushed tag ${releaseTag}.`,
    );
    if (tagCommit && remoteCommit) {
      addCheck(
        'git',
        `${releaseTag} local/origin parity`,
        tagCommit === remoteCommit ? 'pass' : 'fail',
        tagCommit === remoteCommit
          ? tagCommit
          : `Local tag resolves to ${tagCommit}; origin resolves to ${remoteCommit}.`,
      );
    }

    if (tagCommit) {
      const ancestor = runGit(['merge-base', '--is-ancestor', tagCommit, 'origin/main'], {
        allowFailure: true,
      }) !== null;
      addCheck(
        'git',
        `${releaseTag} is on origin/main`,
        ancestor ? 'pass' : 'fail',
        ancestor ? 'tag commit is reachable from origin/main' : `${releaseTag} is not reachable from origin/main.`,
      );
    }
  }
}

if (releaseTag && tagCommit) {
  try {
    surface = readJsonAtTag(releaseTag, 'config/package-surface.json');
    addCheck('release', 'tag-bound package surface', 'pass', `config/package-surface.json at ${tagCommit}`);
  } catch (cause) {
    addCheck('release', 'tag-bound package surface', 'fail', cause.message);
  }
}

const targetReleaseDoc = releaseTag && tagCommit
  ? findReleaseDocForVersionAtTag(releaseTag, releaseVersion)
  : null;
addCheck(
  'docs',
  `release note for ${releaseVersion ?? 'unknown'}`,
  targetReleaseDoc ? 'pass' : 'fail',
  targetReleaseDoc
    ? `${targetReleaseDoc} at ${releaseTag}`
    : releaseTag
      ? `Tag ${releaseTag} does not contain a docs/releases note for ${releaseVersion}.`
      : 'A release note cannot be resolved without an explicit version and matching tag.',
);

if (surface) {
  try {
    selected = selectReleaseEntries(surface, releaseTag);
    assertReleaseLanePolicy(surface, selected, releaseTag);
    expandedDependencies = selected
      .map((entry) => entry.name)
      .filter((name) => onlyNames.size > 0 && !onlyNames.has(name));
    addCheck(
      'release',
      'package dependency closure',
      selected.length > 0 ? 'pass' : 'fail',
      selected.length > 0
        ? selected.map((entry) => entry.name).join(', ')
        : 'No publishable packages matched the release filters.',
    );
    const versionPackages = selected
      .filter((entry) => readPackageJsonAtTag(releaseTag, entry).version === releaseVersion)
      .map((entry) => entry.name);
    addCheck(
      'release',
      'tagged package version',
      versionPackages.length > 0 ? 'pass' : 'fail',
      versionPackages.length > 0
        ? `${releaseVersion}: ${versionPackages.join(', ')}`
        : `No selected package manifest at ${releaseTag} has version ${releaseVersion}.`,
    );
  } catch (cause) {
    addCheck('release', 'package dependency closure', 'fail', cause.message);
  }
}

if (!skipNpm && selected.length > 0) {
  try {
    stagingManifestPath = resolveStagingManifestPath();
    if (stagingManifestPath) {
      stagingManifest = loadStagingManifest(stagingManifestPath);
      addCheck(
        'artifact',
        'retained release staging manifest',
        'pass',
        `${stagingManifestPath} binds ${stagingManifest.packages.length} package tarballs to ${releaseTag}`,
      );
    } else if (releaseVersion?.startsWith('3.9.')) {
      throw new Error('A retained 3.9 release staging manifest is required for final closeout.');
    }
  } catch (cause) {
    addCheck('artifact', 'retained release staging manifest', 'fail', cause.message);
    stagingManifest = null;
  }
}

if (!skipNpm) {
  for (const entry of selected) {
    const version = readPackageJsonAtTag(releaseTag, entry).version;
    const versions = readNpmVersions(entry.name);
    const tags = readNpmDistTags(entry.name);
    const distTag = tagOverride || entry.defaultDistTag || 'latest';

    addCheck(
      'npm',
      `${entry.name}@${version}`,
      versions.published && versions.versions.includes(version) ? 'pass' : 'fail',
      versions.published
        ? versions.versions.includes(version)
          ? `published from ${releaseTag}`
          : `npm does not include tag-bound version ${version}`
        : versions.error || 'package is not published',
    );

    addCheck(
      'npm',
      `${entry.name} ${distTag} dist-tag`,
      tags.published && tags.tags?.[distTag] === version ? 'pass' : 'fail',
      tags.published
        ? `${distTag} -> ${tags.tags?.[distTag] ?? 'none'}; expected ${version} from ${releaseTag}`
        : tags.error || 'dist-tags unavailable',
    );

    if (stagingManifest) {
      await verifyPublishedArtifact(entry, version);
    }
  }
  if (stagingManifest) verifyNpmRegistrySignatures();
}

runTagBoundCloseoutGates();

const failures = checks.filter((check) => check.status === 'fail');
const output = {
  generatedAt,
  releaseVersion,
  releaseTag,
  tagCommit,
  releaseNote: targetReleaseDoc,
  stagingManifest: stagingManifestPath,
  filters: {
    includeExperimental,
    only: [...onlyNames],
    effectiveOnly: selected.map((entry) => entry.name),
    expandedDependencies,
    skipGit,
    skipNpm,
    tagOverride,
    wave: onlyWave,
  },
  summary: {
    failed: failures.length,
    passed: checks.length - failures.length,
    total: checks.length,
  },
  checks,
};

if (jsonOutput) {
  console.log(JSON.stringify(output, null, 2));
} else {
  console.log(renderMarkdown(output));
}

if (failures.length > 0) process.exitCode = 1;

function normalizeVersion(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().replace(/^v/, '');
  return /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(trimmed) ? trimmed : null;
}

function runGit(gitArgs, options = {}) {
  try {
    return execFileSync('git', gitArgs, {
      cwd: root,
      encoding: 'utf8',
      stdio: options.stdio || ['ignore', 'pipe', 'pipe'],
      maxBuffer: options.maxBuffer ?? GIT_MAX_BUFFER_BYTES,
    });
  } catch (error) {
    if (options.allowFailure) return null;
    throw error;
  }
}

function localTagCommit(tag) {
  return runGit(['rev-parse', '--verify', '--quiet', `refs/tags/${tag}^{commit}`], {
    allowFailure: true,
  })?.trim() ?? null;
}

function originTagCommit(tag) {
  const output = runGit(
    ['ls-remote', '--tags', 'origin', `refs/tags/${tag}`, `refs/tags/${tag}^{}`],
    { allowFailure: true },
  );
  if (!output?.trim()) return null;
  const rows = output.trim().split('\n').map((line) => line.trim().split(/\s+/));
  return rows.find(([, ref]) => ref.endsWith('^{}'))?.[0] ?? rows[0]?.[0] ?? null;
}

function readTextAtTag(tag, path) {
  const contents = runGit(['show', `${tag}:${path}`], { allowFailure: true });
  if (contents == null) throw new Error(`${tag} does not contain ${path}.`);
  return contents;
}

function readJsonAtTag(tag, path) {
  try {
    return JSON.parse(readTextAtTag(tag, path));
  } catch (cause) {
    throw new Error(`Cannot read ${path} from ${tag}: ${cause.message}`);
  }
}

function listReleaseDocsAtTag(tag) {
  const output = runGit(
    ['ls-tree', '-r', '--name-only', tag, '--', 'docs/releases'],
    { allowFailure: true },
  );
  return output
    ? output.split('\n').map((value) => value.trim()).filter((value) => value.endsWith('.md'))
    : [];
}

function findReleaseDocForVersionAtTag(tag, version) {
  if (!version) return null;
  const [major, minor, patch] = version.split('.');
  const fullSlug = `${major}-${minor}-${patch}`;
  const minorSlug = patch === '0' ? `${major}-${minor}` : null;
  const files = listReleaseDocsAtTag(tag);

  for (const file of files) {
    const name = basename(file);
    if (name.includes(fullSlug) || (minorSlug && name.includes(minorSlug))) return file;
  }
  for (const file of files) {
    const content = readTextAtTag(tag, file);
    if (content.includes(version) || content.includes(`v${version}`)) return file;
  }
  return null;
}

function readPackageJsonAtTag(tag, entry) {
  return readJsonAtTag(tag, `${entry.path}/package.json`);
}

function selectReleaseEntries(tagSurface, tag) {
  const byName = new Map(tagSurface.packages.map((entry) => [entry.name, entry]));
  const isEligible = (entry) => (
    entry.publish === true
    && (includeExperimental || entry.maturity !== 'experimental')
  );

  if (onlyNames.size === 0) {
    return sortReleaseEntries(tagSurface.packages).filter((entry) => {
      if (!isEligible(entry)) return false;
      if (onlyWave && entry.releaseWave !== onlyWave) return false;
      return true;
    });
  }

  const selectedNames = new Set();
  const queue = [];
  for (const packageName of onlyNames) {
    const entry = byName.get(packageName);
    if (!entry) throw new Error(`Unknown package in --only at ${tag}: ${packageName}`);
    if (!entry.publish) throw new Error(`Package in --only is not publishable at ${tag}: ${packageName}`);
    if (!includeExperimental && entry.maturity === 'experimental') {
      throw new Error(`Package in --only requires --include-experimental: ${packageName}`);
    }
    if (onlyWave && entry.releaseWave !== onlyWave) {
      throw new Error(
        `Package ${packageName} is in release wave ${entry.releaseWave}, not requested wave ${onlyWave}.`,
      );
    }
    selectedNames.add(packageName);
    queue.push(entry);
  }

  for (let index = 0; index < queue.length; index += 1) {
    const entry = queue[index];
    const packageJson = readPackageJsonAtTag(tag, entry);
    for (const field of ['dependencies', 'peerDependencies', 'optionalDependencies']) {
      for (const dependencyName of Object.keys(packageJson[field] ?? {})) {
        const dependencyEntry = byName.get(dependencyName);
        if (!dependencyEntry || selectedNames.has(dependencyName)) continue;
        if (!dependencyEntry.publish) {
          throw new Error(
            `${entry.name} depends on internal non-publishable package ${dependencyName} at ${tag}.`,
          );
        }
        if (!includeExperimental && dependencyEntry.maturity === 'experimental') {
          throw new Error(`${entry.name} depends on experimental package ${dependencyName}.`);
        }
        selectedNames.add(dependencyName);
        queue.push(dependencyEntry);
      }
    }
  }

  return sortReleaseEntries(tagSurface.packages.filter((entry) => selectedNames.has(entry.name)));
}

function findReleaseLane(tagSurface, version) {
  return Object.entries(tagSurface.releaseLanes ?? {}).find(([line]) => version.startsWith(`${line}.`)) ?? null;
}

function assertReleaseLanePolicy(tagSurface, entries, tag) {
  for (const entry of entries) {
    const version = readPackageJsonAtTag(tag, entry).version;
    const laneMatch = findReleaseLane(tagSurface, version);
    if (!laneMatch) continue;
    const [line, lane] = laneMatch;
    const stablePattern = new RegExp(`^${line.replaceAll('.', '\\.')}\\.\\d+$`);
    if (lane.stableOnly === true && !stablePattern.test(version)) {
      throw new Error(`${entry.name}@${version} is not allowed in stable-only release lane ${line}.`);
    }
    const distTag = tagOverride || entry.defaultDistTag;
    if (distTag !== lane.defaultDistTag) {
      throw new Error(`${entry.name}@${version} must close out on ${lane.defaultDistTag}, not ${distTag}.`);
    }
  }
}

function isContained(parent, child) {
  const value = relative(resolve(parent), resolve(child));
  return value === '' || (!value.startsWith(`..${sep}`) && value !== '..' && !isAbsolute(value));
}

function hashBuffer(value, algorithm, encoding = 'hex') {
  return createHash(algorithm).update(value).digest(encoding);
}

function resolveStagingManifestPath() {
  const explicit = stagingManifestOverride ?? process.env.DECANTR_RELEASE_MANIFEST;
  if (explicit) return resolve(explicit);
  if (!releaseTag || !tagCommit) return null;

  const baseDir = resolve(
    stagingDirOverride
      ?? process.env.DECANTR_RELEASE_STAGING_DIR
      ?? join(tmpdir(), 'decantr-release-staging'),
  );
  const selectionId = createHash('sha256')
    .update(selected.map((entry) => entry.name).sort().join('\n'))
    .digest('hex')
    .slice(0, 16);
  const candidate = join(baseDir, releaseTag, tagCommit, selectionId, 'manifest.json');
  return existsSync(candidate) ? candidate : null;
}

function readReleaseEvidenceAtTag() {
  if (!releaseVersion?.startsWith('3.9.')) {
    return {
      mode: 'not-applicable',
      qualificationClaim: false,
      packageEvidenceStatus: 'not-in-machine-wave',
      waiverPath: null,
      exactPackageTarballs: {},
    };
  }
  const packet = readJsonAtTag(releaseTag, THREE_NINE_QUALIFICATION_PACKET_PATH);
  const readOptional = (path) => {
    try {
      return readJsonAtTag(releaseTag, path);
    } catch {
      return null;
    }
  };
  const policy = evaluateThreeNineReleasePolicy({
    packet,
    missingEvidence: readOptional(THREE_NINE_MISSING_EVIDENCE_PATH),
    waiver: readOptional(THREE_NINE_RELEASE_WAIVER_PATH),
  });
  if (policy.errors.length > 0) {
    throw new Error(`The tagged 3.9 release policy is invalid: ${policy.errors.join(' ')}`);
  }
  return policy;
}

function loadStagingManifest(path) {
  if (!existsSync(path) || lstatSync(path).isSymbolicLink() || !statSync(path).isFile()) {
    throw new Error(`Retained release staging manifest is missing or is not a regular file: ${path}`);
  }
  const manifest = JSON.parse(readFileSync(path, 'utf8'));
  if (manifest.schemaVersion !== STAGING_SCHEMA_VERSION) {
    throw new Error(`Unexpected release staging schema: ${manifest.schemaVersion ?? 'missing'}.`);
  }
  if (
    manifest.release?.version !== releaseVersion
    || manifest.release?.tag !== releaseTag
    || manifest.release?.commit !== tagCommit
  ) {
    throw new Error('Retained release staging manifest is not bound to the requested tag and commit.');
  }
  if (releaseVersion.startsWith('3.9.') && manifest.sourceVerification?.status !== 'verified') {
    throw new Error('The retained 3.9 staging manifest was not produced from a verified publish source.');
  }

  const expectedNames = selected.map((entry) => entry.name);
  const observedNames = Array.isArray(manifest.packages)
    ? manifest.packages.map((entry) => entry.name)
    : [];
  if (JSON.stringify(observedNames) !== JSON.stringify(expectedNames)) {
    throw new Error('Retained release staging package selection differs from tagged closeout selection.');
  }

  const releaseEvidence = readReleaseEvidenceAtTag();
  if (
    manifest.qualification?.mode !== releaseEvidence.mode
    || manifest.qualification?.qualificationClaim !== releaseEvidence.qualificationClaim
    || manifest.qualification?.waiver !== releaseEvidence.waiverPath
  ) {
    throw new Error('Retained release-evidence mode differs from the tagged 3.9 policy.');
  }
  for (const packageArtifact of manifest.packages) {
    const selectedEntry = selected.find((entry) => entry.name === packageArtifact.name);
    const expectedVersion = readPackageJsonAtTag(releaseTag, selectedEntry).version;
    if (packageArtifact.version !== expectedVersion) {
      throw new Error(`Retained package version mismatch for ${packageArtifact.name}.`);
    }
    resolveArtifactVerificationMode({
      packageVersion: expectedVersion,
      publishStatus: packageArtifact.publish?.status,
      releaseVersion,
    });
    const tarball = packageArtifact.tarball;
    if (
      !tarball
      || typeof tarball.file !== 'string'
      || tarball.file !== basename(tarball.file)
      || !/^[a-f0-9]{64}$/u.test(tarball.sha256 ?? '')
      || typeof tarball.sha512 !== 'string'
      || !/^[a-f0-9]{40}$/u.test(tarball.shasum ?? '')
      || tarball.relativePath !== `sha256/${tarball.sha256}/${tarball.file}`
    ) {
      throw new Error(`Retained tarball identity is malformed for ${packageArtifact.name}.`);
    }

    const releaseIdentity = releaseEvidence.exactPackageTarballs[packageArtifact.name];
    if (releaseIdentity && (
      releaseIdentity.file !== tarball.file
      || releaseIdentity.sha256 !== tarball.sha256
      || packageArtifact.qualification?.status !== releaseEvidence.packageEvidenceStatus
      || packageArtifact.qualification?.sha256 !== releaseIdentity.sha256
      || manifest.qualification?.exactPackageTarballs?.[packageArtifact.name]?.sha256
        !== releaseIdentity.sha256
    )) {
      throw new Error(`${packageArtifact.name} does not match the tagged 3.9 release-evidence hash.`);
    }
  }
  return manifest;
}

function retainedTarballPath(packageArtifact) {
  const manifestDir = dirname(stagingManifestPath);
  const tarballPath = resolve(manifestDir, ...packageArtifact.tarball.relativePath.split('/'));
  if (
    !isContained(manifestDir, tarballPath)
    || !existsSync(tarballPath)
    || lstatSync(tarballPath).isSymbolicLink()
    || !statSync(tarballPath).isFile()
    || !isContained(realpathSync(manifestDir), realpathSync(tarballPath))
  ) {
    throw new Error(`Retained tarball is missing or escapes the staging set: ${tarballPath}`);
  }
  return tarballPath;
}

function readNpmDistMetadata(packageName, version) {
  const stdout = execFileSync(
    'npm',
    [
      'view',
      `${packageName}@${version}`,
      'dist',
      '--json',
      '--registry=https://registry.npmjs.org/',
    ],
    {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  ).trim();
  const metadata = JSON.parse(stdout);
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    throw new Error(`npm returned malformed dist metadata for ${packageName}@${version}.`);
  }
  return metadata;
}

function assertRegistryUrl(value, label) {
  const url = new URL(value);
  const allowTestData = process.env.NODE_ENV === 'test'
    && process.env.DECANTR_RELEASE_TEST_ALLOW_DATA_URL === 'true';
  if (allowTestData && url.protocol === 'data:') return url;
  if (url.protocol !== 'https:' || url.hostname !== 'registry.npmjs.org') {
    throw new Error(`${label} must use the public npm registry over HTTPS.`);
  }
  return url;
}

async function fetchRegistryBytes(value, label) {
  const url = assertRegistryUrl(value, label);
  const response = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error(`${label} returned HTTP ${response.status}.`);
  const declaredLength = Number(response.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > 128 * 1024 * 1024) {
    throw new Error(`${label} exceeds the 128 MiB closeout limit.`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > 128 * 1024 * 1024) throw new Error(`${label} exceeds the 128 MiB closeout limit.`);
  return bytes;
}

function npmPackagePurl(packageName, version) {
  if (!packageName.startsWith('@')) return `pkg:npm/${packageName}@${version}`;
  const [scope, name] = packageName.slice(1).split('/');
  return `pkg:npm/%40${scope}/${name}@${version}`;
}

async function verifyNpmProvenance(packageArtifact, dist, sha512Hex) {
  const attestationUrl = dist.attestations?.url;
  const requiresProvenance = packageArtifact.publish?.authMode === 'oidc';
  if (!attestationUrl) {
    if (requiresProvenance) {
      throw new Error('OIDC publication is missing npm provenance attestations.');
    }
    return 'no SLSA attestation advertised; token/pre-existing publication accepted after byte verification';
  }
  if (dist.attestations?.provenance?.predicateType !== 'https://slsa.dev/provenance/v1') {
    throw new Error('npm dist metadata does not advertise SLSA provenance v1.');
  }

  const response = JSON.parse(
    (await fetchRegistryBytes(attestationUrl, 'npm attestation endpoint')).toString('utf8'),
  );
  const attestation = response.attestations?.find(
    (entry) => entry.predicateType === 'https://slsa.dev/provenance/v1',
  );
  const envelope = attestation?.bundle?.dsseEnvelope;
  if (!envelope?.payload || !Array.isArray(envelope.signatures) || envelope.signatures.length === 0) {
    throw new Error('npm SLSA provenance bundle lacks a signed DSSE envelope.');
  }
  const statement = JSON.parse(Buffer.from(envelope.payload, 'base64').toString('utf8'));
  const subject = statement.subject?.find(
    (entry) => entry.name === npmPackagePurl(packageArtifact.name, packageArtifact.version),
  );
  if (statement.predicateType !== 'https://slsa.dev/provenance/v1' || subject?.digest?.sha512 !== sha512Hex) {
    throw new Error('npm SLSA provenance subject does not bind the downloaded tarball SHA-512.');
  }

  const workflow = statement.predicate?.buildDefinition?.externalParameters?.workflow;
  const allowedRefs = new Set([`refs/tags/${releaseTag}`, 'refs/heads/main']);
  if (
    workflow?.repository !== 'https://github.com/decantr-ai/decantr'
    || workflow?.path !== '.github/workflows/publish.yml'
    || !allowedRefs.has(workflow?.ref)
  ) {
    throw new Error('npm SLSA provenance does not identify the protected Decantr publish workflow.');
  }
  const sourceCommit = statement.predicate?.buildDefinition?.resolvedDependencies?.find(
    (entry) => entry.digest?.gitCommit === tagCommit,
  );
  if (!sourceCommit) {
    throw new Error(`npm SLSA provenance does not resolve to release commit ${tagCommit}.`);
  }
  return `SLSA subject SHA-512 and publish workflow source resolve to ${releaseTag} at ${tagCommit}`;
}

async function verifyPublishedArtifact(entry, version) {
  const packageArtifact = stagingManifest.packages.find((candidate) => candidate.name === entry.name);
  const verificationMode = resolveArtifactVerificationMode({
    packageVersion: version,
    publishStatus: packageArtifact.publish?.status,
    releaseVersion,
  });
  let retainedBytes;
  try {
    const path = retainedTarballPath(packageArtifact);
    retainedBytes = readFileSync(path);
    const retainedSha256 = hashBuffer(retainedBytes, 'sha256');
    const retainedSha512 = hashBuffer(retainedBytes, 'sha512', 'base64');
    const retainedShasum = hashBuffer(retainedBytes, 'sha1');
    if (
      retainedSha256 !== packageArtifact.tarball.sha256
      || retainedSha512 !== packageArtifact.tarball.sha512
      || retainedShasum !== packageArtifact.tarball.shasum
    ) {
      throw new Error('retained tarball bytes no longer match the staging manifest');
    }
    addCheck(
      'artifact',
      `${entry.name}@${version} retained tarball`,
      'pass',
      `sha256:${retainedSha256}`,
    );
  } catch (cause) {
    addCheck('artifact', `${entry.name}@${version} retained tarball`, 'fail', cause.message);
    return;
  }

  let dist;
  let publicBytes;
  let publicSha512Hex;
  try {
    dist = readNpmDistMetadata(entry.name, version);
    publicBytes = await fetchRegistryBytes(dist.tarball, 'npm tarball');
    const publicSha256 = hashBuffer(publicBytes, 'sha256');
    const publicSha512 = hashBuffer(publicBytes, 'sha512', 'base64');
    publicSha512Hex = hashBuffer(publicBytes, 'sha512');
    const publicShasum = hashBuffer(publicBytes, 'sha1');
    const sriValues = typeof dist.integrity === 'string' ? dist.integrity.split(/\s+/u) : [];
    if (
      !sriValues.includes(`sha512-${publicSha512}`)
      || dist.shasum !== publicShasum
    ) {
      throw new Error('public npm bytes do not match npm dist integrity metadata');
    }
    if (
      verificationMode === artifactVerificationModes.retainedPublicIdentity
      && (
        publicSha256 !== packageArtifact.tarball.sha256
        || publicSha512 !== packageArtifact.tarball.sha512
        || publicShasum !== packageArtifact.tarball.shasum
      )
    ) {
      throw new Error('public npm bytes do not match the retained release tarball');
    }
    addCheck(
      'npm',
      `${entry.name}@${version} public tarball integrity`,
      'pass',
      verificationMode === artifactVerificationModes.retainedPublicIdentity
        ? `downloaded bytes match retained sha256:${publicSha256} and npm SHA-512/SHA-1 metadata`
        : `pre-existing dependency bytes match npm SHA-512/SHA-1 metadata; the newly staged snapshot is not treated as its historical publish artifact`,
    );
  } catch (cause) {
    addCheck('npm', `${entry.name}@${version} public tarball integrity`, 'fail', cause.message);
    return;
  }

  if (verificationMode === artifactVerificationModes.registryIntegrity) {
    addCheck(
      'npm',
      `${entry.name}@${version} provenance`,
      'pass',
      'not re-attributed: this dependency version pre-dates the current release publication',
    );
    return;
  }

  try {
    const detail = await verifyNpmProvenance(packageArtifact, dist, publicSha512Hex);
    addCheck('npm', `${entry.name}@${version} provenance`, 'pass', detail);
  } catch (cause) {
    addCheck('npm', `${entry.name}@${version} provenance`, 'fail', cause.message);
  }
}

function verifyNpmRegistrySignatures() {
  const workDir = mkdtempSync(join(tmpdir(), 'decantr-release-signatures-'));
  const publicRegistryEnv = {
    ...process.env,
    npm_config_registry: 'https://registry.npmjs.org/',
  };
  try {
    writeFileSync(
      join(workDir, 'package.json'),
      `${JSON.stringify({ name: 'decantr-release-signature-audit', private: true }, null, 2)}\n`,
      'utf8',
    );
    const specs = selected.map((entry) => (
      `${entry.name}@${readPackageJsonAtTag(releaseTag, entry).version}`
    ));
    const install = spawnSync(
      'npm',
      ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--save-exact', ...specs],
      {
        cwd: workDir,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        env: publicRegistryEnv,
        timeout: 600_000,
        maxBuffer: 32 * 1024 * 1024,
      },
    );
    if (install.error) {
      throw new Error(`exact public package install could not run: ${install.error.message}`);
    }
    if (install.status !== 0) {
      const detail = [install.stdout, install.stderr].filter(Boolean).join('\n').trim();
      throw new Error(`exact public package install failed: ${detail || install.status}`);
    }
    const audit = spawnSync('npm', ['audit', 'signatures'], {
      cwd: workDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: publicRegistryEnv,
      timeout: 600_000,
      maxBuffer: 32 * 1024 * 1024,
    });
    if (audit.error) {
      throw new Error(`npm audit signatures could not run: ${audit.error.message}`);
    }
    if (audit.status !== 0) {
      const detail = [audit.stdout, audit.stderr].filter(Boolean).join('\n').trim();
      throw new Error(`npm audit signatures failed: ${detail || audit.status}`);
    }
    const detail = [audit.stdout, audit.stderr]
      .filter(Boolean)
      .join('\n')
      .trim()
      .replaceAll('\n', '; ');
    addCheck(
      'npm',
      'registry signature and provenance verification',
      'pass',
      detail || `npm verified signatures for ${specs.join(', ')}`,
    );
  } catch (cause) {
    addCheck('npm', 'registry signature and provenance verification', 'fail', cause.message);
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
}

function runTagBoundCloseoutGates() {
  if (!surface || !releaseTag || !tagCommit || selected.length === 0) return;
  const lanes = new Map();
  for (const entry of selected) {
    const version = readPackageJsonAtTag(releaseTag, entry).version;
    const laneMatch = findReleaseLane(surface, version);
    if (laneMatch) lanes.set(laneMatch[0], laneMatch[1]);
  }

  const gates = [...lanes.values()].flatMap((lane) =>
    (lane.requiredGates ?? []).filter((gate) => gate.phases?.includes('closeout')),
  );
  if (gates.length === 0) return;

  const headCommit = runGit(['rev-parse', 'HEAD^{commit}'], { allowFailure: true })?.trim() ?? null;
  const exactCheckout = headCommit === tagCommit && worktreeStatus.length === 0;
  addCheck(
    'gate',
    'tag-bound gate checkout',
    exactCheckout ? 'pass' : 'fail',
    exactCheckout
      ? `${releaseTag} checked out cleanly at ${tagCommit}`
      : `Run closeout from a clean checkout of ${releaseTag}; HEAD/worktree evidence cannot replace the tag.`,
  );
  if (!exactCheckout) return;

  const seen = new Set();
  for (const gate of gates) {
    if (seen.has(gate.id)) continue;
    seen.add(gate.id);
    const result = spawnSync(process.execPath, [join(root, gate.script)], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env,
      maxBuffer: 64 * 1024 * 1024,
    });
    const passed = result.status === 0;
    const failureDetail = [result.stdout, result.stderr]
      .filter(Boolean)
      .join('\n')
      .trim()
      .slice(-1200);
    addCheck(
      'gate',
      gate.label,
      passed ? 'pass' : 'fail',
      passed ? `passed from ${releaseTag} at ${tagCommit}` : failureDetail || 'gate process failed',
    );
  }
}

function addCheck(scope, name, status, detail) {
  checks.push({ scope, name, status, detail });
}

function renderMarkdown(report) {
  const skippedFinalChecks = report.filters.skipGit || report.filters.skipNpm;
  const status = report.summary.failed > 0 ? 'failed' : skippedFinalChecks ? 'partial' : 'passed';
  const lines = [
    '# Release Closeout Audit',
    '',
    `- Generated at: ${report.generatedAt}`,
    `- Release version: ${report.releaseVersion ?? 'unknown'}`,
    `- Release tag: ${report.releaseTag ?? 'unknown'}`,
    `- Tag commit: ${report.tagCommit ?? 'unknown'}`,
    `- Staging manifest: ${report.stagingManifest ?? 'not supplied'}`,
    `- Status: ${status}`,
    `- Checks: ${report.summary.passed}/${report.summary.total} passed`,
    '',
    '| Scope | Check | Status | Detail |',
    '| --- | --- | --- | --- |',
  ];

  for (const check of report.checks) {
    lines.push(
      `| ${escapeCell(check.scope)} | ${escapeCell(check.name)} | ${check.status} | ${escapeCell(check.detail)} |`,
    );
  }

  lines.push('');
  if (report.summary.failed > 0) {
    lines.push('Closeout is not complete. Fix the failed checks, then rerun `pnpm release:closeout -- --version X.Y.Z`.');
  } else if (skippedFinalChecks) {
    lines.push('Partial closeout checks passed. This is not final release evidence because git and/or npm closeout checks were skipped.');
  } else {
    lines.push('Release closeout is complete: the release tag, tagged notes and package manifests, retained/public npm bytes, provenance evidence, npm state, and required gates are aligned.');
  }

  return `${lines.join('\n')}\n`;
}

function escapeCell(value) {
  return String(value ?? '')
    .replaceAll('\\', '\\\\')
    .replaceAll('|', '\\|')
    .replaceAll('\n', ' ');
}
