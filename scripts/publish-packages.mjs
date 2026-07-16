import { createHash } from 'node:crypto';
import {
  appendFileSync,
  chmodSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { spawnSync } from 'node:child_process';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { readArgValue } from './cli-arg-lib.mjs';
import { getRepoRoot, loadPackageSurface, sortReleaseEntries } from './package-surface-lib.mjs';
import { assertNpmPackageWriteAccess, readNpmVersions } from './npm-surface-lib.mjs';

const rawArgs = process.argv.slice(2);
const args = new Set(rawArgs);
const includeExperimental = args.has('--include-experimental');
const dryRun = args.has('--dry-run');
const publishDryRun = args.has('--publish-dry-run');
const selectionJson = args.has('--selection-json');
const ciProvenance = process.env.GITHUB_ACTIONS === 'true' || process.env.CI === 'true';
const requestedAuthStrategy = (
  readArgValue(rawArgs, 'auth-strategy')
  ?? readArgValue(rawArgs, 'publish-auth')
  ?? process.env.DECANTR_PUBLISH_AUTH_STRATEGY
  ?? 'auto'
).toLowerCase();
const shouldCheckPublishedVersions = publishDryRun || !dryRun;
const tagOverride = readArgValue(rawArgs, 'tag-override') ?? readArgValue(rawArgs, 'tag');
const stagingDirOverride = readArgValue(rawArgs, 'staging-dir');
const onlyWave = readArgValue(rawArgs, 'wave');
const onlyNames = new Set(
  readArgValue(rawArgs, 'only')
    ? readArgValue(rawArgs, 'only')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
    : [],
);
const DEPENDENCY_FIELDS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
];
const AUTH_STRATEGIES = new Set(['auto', 'oidc', 'token']);
const INTERNAL_DEPENDENCY_FIELDS = ['dependencies', 'peerDependencies', 'optionalDependencies'];
const STAGING_SCHEMA_VERSION = 'decantr-release-staging.v1';
const QUALIFICATION_PACKET_PATH = 'fixtures/qualification/3.9/qualification-packet.json';

if (!AUTH_STRATEGIES.has(requestedAuthStrategy)) {
  console.error(`Unsupported publish auth strategy: ${requestedAuthStrategy}`);
  console.error('Use one of: auto, oidc, token.');
  process.exit(1);
}

function parsePackOutput(stdout) {
  const parsed = JSON.parse(stdout.trim());
  const packResult = Array.isArray(parsed) ? parsed[0] : parsed;

  if (!packResult?.filename || typeof packResult.filename !== 'string') {
    throw new Error('pnpm pack did not report a tarball filename.');
  }

  return packResult.filename;
}

function hashFile(path, algorithm, encoding = 'hex') {
  return createHash(algorithm).update(readFileSync(path)).digest(encoding);
}

function sha256File(path) {
  return hashFile(path, 'sha256');
}

function isContained(parent, child) {
  const value = relative(resolve(parent), resolve(child));
  return value === '' || (!value.startsWith(`..${sep}`) && value !== '..' && !isAbsolute(value));
}

function assertSafeStagingPath(path) {
  if (/[\r\n]/u.test(path)) throw new Error('Release staging paths must not contain newlines.');
  if (isContained(root, path)) {
    throw new Error(`Release staging must be outside the git worktree; received ${path}.`);
  }
  mkdirSync(path, { recursive: true });
  if (isContained(realpathSync(root), realpathSync(path))) {
    throw new Error(`Release staging resolves inside the git worktree; received ${path}.`);
  }
}

function assertNoWorkspaceProtocolDependencies(packageJson, label) {
  const leaks = [];

  for (const field of DEPENDENCY_FIELDS) {
    const dependencies = packageJson[field];
    if (!dependencies || typeof dependencies !== 'object' || Array.isArray(dependencies)) continue;

    for (const [dependencyName, dependencyVersion] of Object.entries(dependencies)) {
      if (typeof dependencyVersion === 'string' && dependencyVersion.startsWith('workspace:')) {
        leaks.push(`${field}.${dependencyName}=${dependencyVersion}`);
      }
    }
  }

  if (leaks.length > 0) {
    throw new Error(`${label} contains workspace protocol dependencies: ${leaks.join(', ')}`);
  }
}

function auditPackedManifest(entry, tarballPath, packageVersion) {
  const manifestResult = spawnSync('tar', ['-xOf', tarballPath, 'package/package.json'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (manifestResult.status !== 0) {
    if (manifestResult.stdout) process.stdout.write(manifestResult.stdout);
    if (manifestResult.stderr) process.stderr.write(manifestResult.stderr);
    throw new Error(`Cannot inspect staged tarball for ${entry.name}.`);
  }

  const packedPackageJson = JSON.parse(manifestResult.stdout);
  if (packedPackageJson.name !== entry.name) {
    throw new Error(`Packed manifest name mismatch: expected ${entry.name}, found ${packedPackageJson.name}`);
  }
  if (packedPackageJson.version !== packageVersion) {
    throw new Error(
      `Packed manifest version mismatch for ${entry.name}: expected ${packageVersion}, found ${packedPackageJson.version}`,
    );
  }

  assertNoWorkspaceProtocolDependencies(packedPackageJson, `${entry.name}@${packageVersion} packed manifest`);
}

function hasClassicPublishToken() {
  return Boolean(process.env.NODE_AUTH_TOKEN || process.env.NPM_TOKEN);
}

function isPackageVersionPublished(packageName, packageVersion) {
  const npmVersions = readNpmVersions(packageName);
  return Boolean(
    npmVersions?.published
    && Array.isArray(npmVersions.versions)
    && npmVersions.versions.includes(packageVersion),
  );
}

function getPrimaryAuthMode() {
  if (requestedAuthStrategy === 'token') return 'token';
  if (requestedAuthStrategy === 'oidc') return 'oidc';
  return ciProvenance ? 'oidc' : 'token';
}

function createPublishCommand({ distTag, mode, tarballPath }) {
  return [
    'publish',
    tarballPath,
    '--access',
    'public',
    ...(mode === 'oidc' && ciProvenance ? ['--provenance'] : []),
    '--tag',
    distTag,
    '--no-git-checks',
    ...(publishDryRun ? ['--dry-run'] : []),
  ];
}

function createPublishEnv(mode) {
  const env = {
    ...process.env,
    DECANTR_PUBLISH_WRAPPER: 'scripts/publish-packages.mjs',
  };

  if (mode !== 'token') {
    // GitHub OIDC trusted publishing must not inherit classic token auth.
    // When NODE_AUTH_TOKEN is present, npm can prefer the token path and ask for OTP
    // even though the command is running with provenance enabled.
    delete env.NODE_AUTH_TOKEN;
    delete env.NPM_TOKEN;
    return env;
  }

  if (env.NPM_TOKEN && !env.NODE_AUTH_TOKEN) {
    env.NODE_AUTH_TOKEN = env.NPM_TOKEN;
  }

  // Force the classic token/user-auth path for fallback publishes.
  // Otherwise npm may prefer the ambient GitHub OIDC variables again.
  delete env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;
  delete env.ACTIONS_ID_TOKEN_REQUEST_URL;
  env.NPM_CONFIG_PROVENANCE = 'false';

  return env;
}

function describeAuthMode(mode) {
  if (mode === 'oidc') return 'GitHub OIDC trusted publishing';
  return ciProvenance ? 'npm token fallback' : 'local npm auth';
}

function runGit(gitArgs, options = {}) {
  const result = spawnSync('git', gitArgs, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env,
  });
  if (result.status === 0) return result.stdout.trim();
  if (options.allowFailure) return null;
  const detail = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
  throw new Error(`git ${gitArgs.join(' ')} failed${detail ? `: ${detail}` : '.'}`);
}

function parseRemoteRefs(output) {
  return new Map(
    (output ?? '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [commit, ref] = line.split(/\s+/u);
        return [ref, commit];
      }),
  );
}

function stable39Versions(entries) {
  return [...new Set(
    entries
      .map((entry) => readPackageJson(entry).version)
      .filter((version) => /^3\.9\.\d+$/u.test(version)),
  )];
}

function verifyReal39ReleaseSource(entries) {
  if (dryRun || publishDryRun) return null;
  const versions = stable39Versions(entries);
  if (versions.length === 0) return null;
  if (versions.length !== 1) {
    throw new Error(`A real Decantr 3.9 publish must target one stable version; found ${versions.join(', ')}.`);
  }

  const version = versions[0];
  const tag = `v${version}`;
  const status = runGit(['status', '--porcelain=v1', '--untracked-files=normal']);
  if (status) {
    throw new Error(`A real Decantr 3.9 publish requires a clean worktree at ${tag}.`);
  }

  const head = runGit(['rev-parse', 'HEAD^{commit}']);
  const localTag = runGit(['rev-parse', '--verify', '--quiet', `refs/tags/${tag}^{commit}`], {
    allowFailure: true,
  });
  if (!localTag || localTag !== head) {
    throw new Error(`HEAD ${head} must be exactly the local stable tag ${tag} before publishing.`);
  }

  runGit(['fetch', '--no-tags', 'origin', '+refs/heads/main:refs/remotes/origin/main']);
  const originMain = runGit(['rev-parse', 'refs/remotes/origin/main^{commit}']);
  const refs = parseRemoteRefs(runGit([
    'ls-remote',
    'origin',
    'refs/heads/main',
    `refs/tags/${tag}`,
    `refs/tags/${tag}^{}`,
  ]));
  const remoteMain = refs.get('refs/heads/main');
  const remoteTag = refs.get(`refs/tags/${tag}^{}`) ?? refs.get(`refs/tags/${tag}`);

  if (!remoteMain || originMain !== remoteMain) {
    throw new Error(
      `Fetched origin/main ${originMain} does not match the remote main ref ${remoteMain ?? 'missing'}.`,
    );
  }
  if (!remoteTag || remoteTag !== localTag) {
    throw new Error(
      `Local tag ${tag} resolves to ${localTag}; the remote tag resolves to ${remoteTag ?? 'missing'}.`,
    );
  }
  if (runGit(['merge-base', '--is-ancestor', localTag, 'refs/remotes/origin/main'], {
    allowFailure: true,
  }) === null) {
    throw new Error(`${tag} at ${localTag} is not reachable from verified origin/main ${originMain}.`);
  }

  return { status: 'verified', version, tag, commit: head, originMain, remoteMain, remoteTag };
}

function assertSameVerifiedReleaseSource(expected, observed, activity) {
  const fields = ['status', 'version', 'tag', 'commit', 'originMain', 'remoteMain', 'remoteTag'];
  if (fields.some((field) => expected?.[field] !== observed?.[field])) {
    throw new Error(`The verified 3.9 release source changed while ${activity}.`);
  }
}

function runRequiredGate(script, label) {
  console.log(`Running ${label}...`);
  const result = spawnSync(process.execPath, [join(root, script)], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env,
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status !== 0) {
    throw new Error(`${label} failed; no Decantr 3.9.0 package was published.`);
  }
}

function readPackageJson(entry) {
  return JSON.parse(readFileSync(join(root, entry.path, 'package.json'), 'utf8'));
}

function findReleaseLane(version) {
  return Object.entries(surface.releaseLanes ?? {}).find(([line]) => version.startsWith(`${line}.`)) ?? null;
}

function assertReleaseLanePolicy(entries) {
  for (const entry of entries) {
    const packageVersion = readPackageJson(entry).version;
    const laneMatch = findReleaseLane(packageVersion);
    if (!laneMatch) continue;

    const [line, lane] = laneMatch;
    const distTag = tagOverride || entry.defaultDistTag;
    const stableVersionPattern = new RegExp(`^${line.replaceAll('.', '\\.')}\\.\\d+$`);

    if (lane.stableOnly === true && !stableVersionPattern.test(packageVersion)) {
      throw new Error(
        `${entry.name}@${packageVersion} is not allowed in the stable-only Decantr ${line} release lane.`,
      );
    }
    if (distTag !== lane.defaultDistTag) {
      throw new Error(
        `${entry.name}@${packageVersion} must publish with npm dist-tag ${lane.defaultDistTag}; received ${distTag}.`,
      );
    }
  }
}

function assertExpectedReleaseVersion(entries) {
  const expectedVersion = process.env.DECANTR_RELEASE_VERSION?.trim();
  if (!expectedVersion) return;

  const matchingPackages = entries
    .filter((entry) => readPackageJson(entry).version === expectedVersion)
    .map((entry) => entry.name);
  if (matchingPackages.length === 0) {
    throw new Error(
      `Release target ${expectedVersion} does not match any selected package manifest version.`,
    );
  }
}

function selectReleaseEntries() {
  const byName = new Map(surface.packages.map((entry) => [entry.name, entry]));
  const eligible = (entry) => {
    if (!entry.publish) return false;
    if (!includeExperimental && entry.maturity === 'experimental') return false;
    return true;
  };

  if (onlyNames.size === 0) {
    return sortReleaseEntries(surface.packages).filter((entry) => {
      if (!eligible(entry)) return false;
      if (onlyWave && entry.releaseWave !== onlyWave) return false;
      return true;
    });
  }

  const selectedNames = new Set();
  const queue = [];
  for (const packageName of onlyNames) {
    const entry = byName.get(packageName);
    if (!entry) throw new Error(`Unknown package in --only: ${packageName}`);
    if (!entry.publish) throw new Error(`Package in --only is not publishable: ${packageName}`);
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
    const packageJson = readPackageJson(entry);
    for (const field of INTERNAL_DEPENDENCY_FIELDS) {
      for (const dependencyName of Object.keys(packageJson[field] ?? {})) {
        const dependencyEntry = byName.get(dependencyName);
        if (!dependencyEntry || selectedNames.has(dependencyName)) continue;
        if (!dependencyEntry.publish) {
          throw new Error(
            `${entry.name} depends on internal non-publishable package ${dependencyName}; release closure is invalid.`,
          );
        }
        if (!includeExperimental && dependencyEntry.maturity === 'experimental') {
          throw new Error(
            `${entry.name} depends on experimental package ${dependencyName}; pass --include-experimental or fix the dependency.`,
          );
        }
        selectedNames.add(dependencyName);
        queue.push(dependencyEntry);
      }
    }
  }

  return sortReleaseEntries(
    surface.packages.filter((entry) => selectedNames.has(entry.name)),
  );
}

function runRequiredReleaseGates(entries) {
  if (dryRun) return;
  const lanes = new Map();
  for (const entry of entries) {
    const laneMatch = findReleaseLane(readPackageJson(entry).version);
    if (laneMatch) lanes.set(laneMatch[0], laneMatch[1]);
  }

  for (const lane of lanes.values()) {
    for (const gate of lane.requiredGates ?? []) {
      if (gate.phases?.includes('publish')) runRequiredGate(gate.script, gate.label);
    }
  }
}

function readQualifiedTarballs(entries) {
  if (stable39Versions(entries).length === 0) return {};
  const packetPath = join(root, QUALIFICATION_PACKET_PATH);
  let packet;
  try {
    packet = JSON.parse(readFileSync(packetPath, 'utf8'));
  } catch (cause) {
    throw new Error(`Cannot read the 3.9 qualification packet: ${cause.message}`);
  }
  if (packet.packetStatus !== 'complete' || packet.qualificationClaim !== true) {
    throw new Error('The 3.9 qualification packet is not complete and qualified.');
  }

  const qualified = packet.machineReplay?.artifact?.environment?.exactPackageTarballs;
  if (!qualified || typeof qualified !== 'object' || Array.isArray(qualified)) {
    throw new Error('The 3.9 qualification packet does not retain exact package tarball hashes.');
  }
  for (const [name, artifact] of Object.entries(qualified)) {
    if (
      !artifact
      || typeof artifact !== 'object'
      || typeof artifact.file !== 'string'
      || artifact.file !== basename(artifact.file)
      || !artifact.file.endsWith('.tgz')
      || !/^[a-f0-9]{64}$/u.test(artifact.sha256 ?? '')
    ) {
      throw new Error(`Qualified tarball identity for ${name} is malformed.`);
    }
  }
  return qualified;
}

function resolveStagingContext(entries, sourceVerification) {
  const packageVersions = entries.map((entry) => readPackageJson(entry).version);
  const configuredVersion = process.env.DECANTR_RELEASE_VERSION?.trim();
  const releaseVersion = configuredVersion
    || sourceVerification?.version
    || stable39Versions(entries)[0]
    || [...new Set(packageVersions)].at(-1);
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u.test(releaseVersion ?? '')) {
    throw new Error(`Cannot derive a stable release staging version from ${releaseVersion ?? 'the selection'}.`);
  }

  const commit = sourceVerification?.commit
    || runGit(['rev-parse', 'HEAD^{commit}'], { allowFailure: true })
    || 'unbound';
  const baseDir = resolve(
    stagingDirOverride
      ?? process.env.DECANTR_RELEASE_STAGING_DIR
      ?? join(tmpdir(), 'decantr-release-staging'),
  );
  assertSafeStagingPath(baseDir);
  const selectionId = createHash('sha256')
    .update(entries.map((entry) => entry.name).sort().join('\n'))
    .digest('hex')
    .slice(0, 16);
  const releaseTag = `v${releaseVersion}`;
  const runDir = join(baseDir, releaseTag, commit, selectionId);
  return {
    baseDir,
    runDir,
    manifestPath: join(runDir, 'manifest.json'),
    releaseVersion,
    releaseTag,
    commit,
    selectionId,
  };
}

function stagedTarballPath(context, artifact) {
  if (
    !artifact
    || typeof artifact.relativePath !== 'string'
    || artifact.relativePath !== `sha256/${artifact.sha256}/${artifact.file}`
  ) {
    throw new Error('Staged tarball path is not content-addressed by its declared SHA-256.');
  }
  const path = resolve(context.runDir, ...artifact.relativePath.split('/'));
  if (!isContained(context.runDir, path) || !existsSync(path)) {
    throw new Error(`Staged tarball is missing or outside the release staging set: ${path}`);
  }
  if (lstatSync(path).isSymbolicLink() || !statSync(path).isFile()) {
    throw new Error(`Staged tarball must be a regular file: ${path}`);
  }
  if (!isContained(realpathSync(context.runDir), realpathSync(path))) {
    throw new Error(`Staged tarball resolves outside the release staging set: ${path}`);
  }
  return path;
}

function assertStagedTarballIntegrity(context, packageArtifact) {
  const path = stagedTarballPath(context, packageArtifact.tarball);
  const observedSha256 = sha256File(path);
  const observedSha512 = hashFile(path, 'sha512', 'base64');
  if (observedSha256 !== packageArtifact.tarball.sha256) {
    throw new Error(
      `${packageArtifact.name}@${packageArtifact.version} staged SHA-256 changed immediately before publish.`,
    );
  }
  if (observedSha512 !== packageArtifact.tarball.sha512) {
    throw new Error(
      `${packageArtifact.name}@${packageArtifact.version} staged SHA-512 changed immediately before publish.`,
    );
  }
  return path;
}

function writeStagingManifest(context, manifest) {
  const temporaryPath = `${context.manifestPath}.tmp`;
  writeFileSync(temporaryPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  renameSync(temporaryPath, context.manifestPath);
}

function validateReusableStagingManifest(context, manifest, entries, qualifiedTarballs, sourceVerification) {
  if (
    manifest.schemaVersion !== STAGING_SCHEMA_VERSION
    || manifest.release?.version !== context.releaseVersion
    || manifest.release?.tag !== context.releaseTag
    || manifest.release?.commit !== context.commit
  ) {
    throw new Error(`Retained staging manifest identity does not match ${context.releaseTag} at ${context.commit}.`);
  }
  if (sourceVerification && manifest.sourceVerification?.status !== 'verified') {
    return false;
  }
  const expectedNames = entries.map((entry) => entry.name);
  const observedNames = Array.isArray(manifest.packages)
    ? manifest.packages.map((entry) => entry.name)
    : [];
  if (JSON.stringify(observedNames) !== JSON.stringify(expectedNames)) {
    throw new Error('Retained staging manifest package selection does not match this publish attempt.');
  }

  for (const packageArtifact of manifest.packages) {
    const entry = entries.find((candidate) => candidate.name === packageArtifact.name);
    const version = readPackageJson(entry).version;
    if (packageArtifact.version !== version) {
      throw new Error(`Retained staging version mismatch for ${entry.name}.`);
    }
    const path = assertStagedTarballIntegrity(context, packageArtifact);
    auditPackedManifest(entry, path, version);
    const qualified = qualifiedTarballs[entry.name];
    if (qualified && (
      qualified.file !== packageArtifact.tarball.file
      || qualified.sha256 !== packageArtifact.tarball.sha256
      || packageArtifact.qualification?.sha256 !== qualified.sha256
    )) {
      throw new Error(`${entry.name}@${version} retained bytes do not match the 3.9 qualification hash.`);
    }
  }
  return true;
}

function stageReleaseTarballs(entries, sourceVerification, qualifiedTarballs) {
  const context = resolveStagingContext(entries, sourceVerification);
  if (existsSync(context.manifestPath)) {
    const retained = JSON.parse(readFileSync(context.manifestPath, 'utf8'));
    if (validateReusableStagingManifest(
      context,
      retained,
      entries,
      qualifiedTarballs,
      sourceVerification,
    )) {
      console.log(`Reusing retained release staging manifest: ${context.manifestPath}`);
      exposeStagingManifest(context);
      return { context, manifest: retained };
    }
    rmSync(context.runDir, { recursive: true, force: true });
  }

  const incomingDir = join(context.runDir, '.incoming');
  mkdirSync(incomingDir, { recursive: true });
  const packageArtifacts = [];
  try {
    for (const entry of entries) {
      const cwd = join(root, entry.path);
      const version = readPackageJson(entry).version;
      const packResult = spawnSync('pnpm', ['pack', '--pack-destination', incomingDir, '--json'], {
        cwd,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        env: createPublishEnv(getPrimaryAuthMode()),
      });
      if (packResult.status !== 0) {
        const detail = [packResult.stdout, packResult.stderr].filter(Boolean).join('\n').trim();
        throw new Error(`pnpm pack failed for ${entry.name}: ${detail || packResult.status}`);
      }

      const packedPath = resolve(cwd, parsePackOutput(packResult.stdout));
      if (
        !isContained(incomingDir, packedPath)
        || !existsSync(packedPath)
        || lstatSync(packedPath).isSymbolicLink()
        || !statSync(packedPath).isFile()
        || !isContained(realpathSync(incomingDir), realpathSync(packedPath))
      ) {
        throw new Error(`pnpm pack wrote ${entry.name} outside the controlled staging directory.`);
      }
      auditPackedManifest(entry, packedPath, version);

      const file = basename(packedPath);
      const sha256 = sha256File(packedPath);
      const qualified = qualifiedTarballs[entry.name] ?? null;
      if (qualified && (qualified.file !== file || qualified.sha256 !== sha256)) {
        throw new Error(`${entry.name}@${version} staged bytes do not match the 3.9 qualification hash.`);
      }
      const relativePath = `sha256/${sha256}/${file}`;
      const retainedPath = resolve(context.runDir, ...relativePath.split('/'));
      mkdirSync(dirname(retainedPath), { recursive: true });
      renameSync(packedPath, retainedPath);
      chmodSync(retainedPath, 0o444);

      packageArtifacts.push({
        name: entry.name,
        version,
        sourcePath: entry.path,
        distTag: tagOverride || entry.defaultDistTag,
        tarball: {
          file,
          relativePath,
          sha256,
          sha512: hashFile(retainedPath, 'sha512', 'base64'),
          shasum: hashFile(retainedPath, 'sha1'),
          size: statSync(retainedPath).size,
        },
        qualification: qualified
          ? { status: 'qualified', file: qualified.file, sha256: qualified.sha256 }
          : { status: 'not-in-machine-wave', file: null, sha256: null },
        publish: { status: 'pending', authMode: null },
      });
    }
  } finally {
    rmSync(incomingDir, { recursive: true, force: true });
  }

  const manifest = {
    schemaVersion: STAGING_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    release: {
      version: context.releaseVersion,
      tag: context.releaseTag,
      commit: context.commit,
      selectionId: context.selectionId,
    },
    sourceVerification: sourceVerification ?? { status: 'nonpublishing' },
    qualification: {
      packet: QUALIFICATION_PACKET_PATH,
      exactPackageTarballs: Object.fromEntries(
        packageArtifacts
          .filter((entry) => entry.qualification.status === 'qualified')
          .map((entry) => [entry.name, {
            file: entry.qualification.file,
            sha256: entry.qualification.sha256,
          }]),
      ),
    },
    packages: packageArtifacts,
  };
  writeStagingManifest(context, manifest);
  exposeStagingManifest(context);
  console.log(`Retained content-addressed release staging manifest: ${context.manifestPath}`);
  return { context, manifest };
}

function exposeStagingManifest(context) {
  process.env.DECANTR_RELEASE_MANIFEST = context.manifestPath;
  if (process.env.GITHUB_ENV) {
    appendFileSync(
      process.env.GITHUB_ENV,
      `DECANTR_RELEASE_MANIFEST=${context.manifestPath}\nDECANTR_RELEASE_STAGING_DIR=${context.baseDir}\n`,
      'utf8',
    );
  }
}

function updatePublishState(staging, name, publish) {
  const packageArtifact = staging.manifest.packages.find((entry) => entry.name === name);
  if (!packageArtifact) throw new Error(`Staging manifest does not contain ${name}.`);
  packageArtifact.publish = publish;
  staging.manifest.updatedAt = new Date().toISOString();
  writeStagingManifest(staging.context, staging.manifest);
}

function runPublishCommand({ cwd, cmd, mode }) {
  const shouldInheritStdio = !ciProvenance && mode === 'token' && process.stdin.isTTY && process.stdout.isTTY;
  const result = spawnSync('pnpm', cmd, {
    cwd,
    encoding: shouldInheritStdio ? undefined : 'utf8',
    stdio: shouldInheritStdio ? 'inherit' : ['ignore', 'pipe', 'pipe'],
    env: createPublishEnv(mode),
  });

  if (!shouldInheritStdio) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
  }

  return result;
}

function explainPublishFailure({ entry, mode, packageVersion }) {
  if (mode !== 'oidc') return;

  console.error(
    [
      '',
      `OIDC publish failed for ${entry.name}@${packageVersion}.`,
      'For GitHub trusted publishing, npm package settings must include:',
      '- Publisher: GitHub Actions',
      '- Organization/repository: decantr-ai/decantr',
      '- Workflow filename: publish.yml',
      '- Allowed action: npm publish',
      'Alternatively set NPM_TOKEN in GitHub Actions and rerun with DECANTR_PUBLISH_AUTH_STRATEGY=token or workflow input publish_auth_strategy=token.',
      '',
    ].join('\n'),
  );
}

function publishPackage({ entry, cwd, distTag, packageVersion, staging, packageArtifact }) {
  const primaryMode = getPrimaryAuthMode();
  const tarballPath = assertStagedTarballIntegrity(staging.context, packageArtifact);
  const primaryCmd = createPublishCommand({ distTag, mode: primaryMode, tarballPath });
  const tokenFallbackAvailable = hasClassicPublishToken();

  console.log(`Using ${describeAuthMode(primaryMode)} for ${entry.name}.`);

  if (!publishDryRun && primaryMode === 'token' && ciProvenance && !tokenFallbackAvailable) {
    throw new Error(
      [
        `Cannot publish ${entry.name} with token auth because neither NODE_AUTH_TOKEN nor NPM_TOKEN is set.`,
        'Add an npm automation token as the NPM_TOKEN GitHub Actions secret or use OIDC trusted publishing.',
      ].join('\n'),
    );
  }

  updatePublishState(staging, entry.name, {
    status: publishDryRun ? 'dry-run-attempt' : 'attempting',
    authMode: primaryMode,
  });
  const primaryResult = runPublishCommand({ cwd, cmd: primaryCmd, mode: primaryMode });

  if (primaryResult.status === 0) {
    return { authMode: primaryMode, outcome: publishDryRun ? 'dry-run' : 'published' };
  }

  if (isPackageVersionPublished(entry.name, packageVersion)) {
    console.warn(
      `pnpm publish exited non-zero for ${entry.name}, but npm now lists ${packageVersion}; continuing to the verifier.`,
    );
    return { authMode: primaryMode, outcome: 'registry-confirmed-after-error' };
  }

  const canFallbackToToken = requestedAuthStrategy === 'auto'
    && primaryMode === 'oidc'
    && ciProvenance
    && tokenFallbackAvailable;

  if (!canFallbackToToken) {
    explainPublishFailure({ entry, mode: primaryMode, packageVersion });
    if (requestedAuthStrategy === 'auto' && primaryMode === 'oidc' && ciProvenance && !tokenFallbackAvailable) {
      console.error(
        'Token fallback was unavailable because neither NODE_AUTH_TOKEN nor NPM_TOKEN was present in the publish environment.',
      );
    }
    process.exit(primaryResult.status ?? 1);
  }

  console.warn(
    `OIDC publish failed for ${entry.name}; retrying once with npm token fallback and provenance disabled.`,
  );
  const fallbackTarballPath = assertStagedTarballIntegrity(staging.context, packageArtifact);
  const fallbackCmd = createPublishCommand({
    distTag,
    mode: 'token',
    tarballPath: fallbackTarballPath,
  });
  updatePublishState(staging, entry.name, {
    status: publishDryRun ? 'dry-run-fallback-attempt' : 'attempting-fallback',
    authMode: 'token',
  });
  const fallbackResult = runPublishCommand({ cwd, cmd: fallbackCmd, mode: 'token' });

  if (fallbackResult.status !== 0) {
    process.exit(fallbackResult.status ?? 1);
  }
  return { authMode: 'token', outcome: publishDryRun ? 'dry-run' : 'published' };
}

if (dryRun && publishDryRun) {
  console.error('Use either --dry-run (selection only) or --publish-dry-run (npm publish preflight), not both.');
  process.exit(1);
}

if (selectionJson && !dryRun) {
  console.error('--selection-json is available only with selection-only --dry-run.');
  process.exit(1);
}

const root = process.env.NODE_ENV === 'test' && process.env.DECANTR_RELEASE_TEST_ROOT
  ? resolve(process.env.DECANTR_RELEASE_TEST_ROOT)
  : getRepoRoot();
const surface = loadPackageSurface(root);

let selected;
try {
  selected = selectReleaseEntries();
  assertReleaseLanePolicy(selected);
  assertExpectedReleaseVersion(selected);
} catch (cause) {
  console.error(`Release selection failed: ${cause.message}`);
  process.exit(1);
}

const expandedDependencies = selected
  .map((entry) => entry.name)
  .filter((name) => onlyNames.size > 0 && !onlyNames.has(name));

if (selectionJson) {
  console.log(
    JSON.stringify({
      requestedOnly: [...onlyNames],
      effectiveOnly: selected.map((entry) => entry.name),
      expandedDependencies,
      wave: onlyWave,
    }),
  );
  process.exit(0);
}

if (selected.length === 0) {
  console.log('No packages selected for publish.');
  process.exit(0);
}

if (expandedDependencies.length > 0) {
  console.log(`Expanded --only to internal dependency closure: ${expandedDependencies.join(', ')}`);
}

let sourceVerification = null;
let staging = null;
try {
  sourceVerification = verifyReal39ReleaseSource(selected);
  runRequiredReleaseGates(selected);
  if (sourceVerification) {
    const verifiedAfterGates = verifyReal39ReleaseSource(selected);
    assertSameVerifiedReleaseSource(sourceVerification, verifiedAfterGates, 'publish gates were running');
    sourceVerification = verifiedAfterGates;
  }
  if (!dryRun) {
    const qualifiedTarballs = readQualifiedTarballs(selected);
    staging = stageReleaseTarballs(selected, sourceVerification, qualifiedTarballs);
    if (sourceVerification) {
      const verifiedAfterStaging = verifyReal39ReleaseSource(selected);
      assertSameVerifiedReleaseSource(sourceVerification, verifiedAfterStaging, 'tarballs were staged');
      sourceVerification = verifiedAfterStaging;
      staging.manifest.sourceVerification = verifiedAfterStaging;
      writeStagingManifest(staging.context, staging.manifest);
    }
  }
} catch (cause) {
  console.error(`Release integrity check failed: ${cause.message}`);
  process.exit(1);
}

for (const entry of selected) {
  const distTag = tagOverride || entry.defaultDistTag;
  const cwd = join(root, entry.path);
  const packageJson = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8'));
  const packageVersion = packageJson.version;
  const packageArtifact = staging?.manifest.packages.find((candidate) => candidate.name === entry.name);
  const npmVersions = shouldCheckPublishedVersions ? readNpmVersions(entry.name) : null;
  const versionAlreadyPublished = Boolean(
    shouldCheckPublishedVersions
    && npmVersions?.published
    && Array.isArray(npmVersions.versions)
    && npmVersions.versions.includes(packageVersion),
  );
  const prefix = publishDryRun ? '[publish-dry-run] ' : dryRun ? '[dry-run] ' : '';

  if (versionAlreadyPublished && !publishDryRun) {
    console.log(
      `${prefix}Skipping ${entry.name} from ${entry.path} because version ${packageVersion} is already published (wave ${entry.releaseWave}, order ${entry.publishOrder})`,
    );
    updatePublishState(staging, entry.name, {
      status: 'already-published',
      authMode: packageArtifact?.publish?.authMode ?? null,
    });
    continue;
  }

  const action = versionAlreadyPublished ? 'Auditing packed manifest for' : 'Publishing';
  const suffix = versionAlreadyPublished ? ` (version ${packageVersion} is already published)` : ` with tag ${distTag}`;
  console.log(`${prefix}${action} ${entry.name} from ${entry.path}${suffix} (wave ${entry.releaseWave}, order ${entry.publishOrder})`);

  if (dryRun) continue;

  const primaryMode = getPrimaryAuthMode();
  if (!publishDryRun && primaryMode === 'token' && !ciProvenance && !hasClassicPublishToken()) {
    assertNpmPackageWriteAccess(entry.name);
  } else if (!publishDryRun && primaryMode === 'oidc') {
    console.log('Skipping npm write-access precheck; GitHub OIDC publishing obtains npm credentials at publish time.');
  }

  if (!packageArtifact) {
    throw new Error(`Retained release staging is missing ${entry.name}.`);
  }
  if (sourceVerification) {
    const verifiedBeforePublish = verifyReal39ReleaseSource(selected);
    assertSameVerifiedReleaseSource(
      sourceVerification,
      verifiedBeforePublish,
      `${entry.name} was awaiting publication`,
    );
    sourceVerification = verifiedBeforePublish;
  }
  const publishResult = publishPackage({
    entry,
    cwd,
    distTag,
    packageVersion,
    staging,
    packageArtifact,
  });
  updatePublishState(staging, entry.name, {
    status: publishResult.outcome,
    authMode: publishResult.authMode,
  });
}
