import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  THREE_NINE_MACHINE_PACKAGES,
  THREE_NINE_SOLE_MAINTAINER_MODE,
  THREE_NINE_WAIVED_REQUIREMENTS,
  evaluateThreeNineReleasePolicy,
} from './3-9-release-policy.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const scripts = join(root, 'scripts');

function runNode(script, args = [], options = {}) {
  return spawnSync(process.execPath, [join(scripts, script), ...args], {
    cwd: options.cwd ?? root,
    encoding: 'utf8',
    env: options.env ?? process.env,
  });
}

function outputOf(result) {
  return `${result.stdout ?? ''}${result.stderr ?? ''}`;
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function git(cwd, args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
}

function hash(value, algorithm, encoding = 'hex') {
  return createHash(algorithm).update(value).digest(encoding);
}

test('sole-maintainer policy permits publication without manufacturing qualification', () => {
  const exactPackageTarballs = Object.fromEntries(
    THREE_NINE_MACHINE_PACKAGES.map((name, index) => [
      name,
      {
        file: `decantr-${name.split('/')[1]}-3.9.0.tgz`,
        sha256: String(index + 1).padStart(64, '0'),
      },
    ]),
  );
  const packet = {
    packetStatus: 'incomplete',
    qualificationClaim: false,
    routeCorpus: { status: 'complete' },
    routeReplay: { status: 'complete' },
    adoptionBoundaryReplay: { status: 'complete' },
    machineReplay: {
      status: 'complete',
      artifact: { environment: { exactPackageTarballs } },
    },
  };
  const missingEvidence = {
    items: THREE_NINE_WAIVED_REQUIREMENTS.map((id) => ({ id, state: 'missing' })),
  };
  const waiver = {
    schemaVersion: 'decantr-3.9-release-waiver.v1',
    releaseVersion: '3.9.0',
    status: 'authorized',
    mode: THREE_NINE_SOLE_MAINTAINER_MODE,
    authorizedAt: '2026-07-16T21:01:00Z',
    authorizedBy: {
      name: 'David Aimi',
      github: 'david-aimi',
      role: 'sole-maintainer',
    },
    rationale: 'One human maintains Decantr, so a two-person review cannot be represented honestly.',
    acceptedMissingEvidence: [...THREE_NINE_WAIVED_REQUIREMENTS],
    claims: {
      releaseQualification: false,
      humanFindingPrecision: false,
      humanFindingRecall: false,
      adoptionProven: false,
    },
  };

  const accepted = evaluateThreeNineReleasePolicy({ packet, missingEvidence, waiver });
  assert.deepEqual(accepted.errors, []);
  assert.equal(accepted.mode, THREE_NINE_SOLE_MAINTAINER_MODE);
  assert.equal(accepted.qualificationClaim, false);
  assert.equal(accepted.packageEvidenceStatus, 'machine-qualified-human-waived');

  const expanded = evaluateThreeNineReleasePolicy({
    packet,
    missingEvidence: {
      items: [...missingEvidence.items, { id: 'MACHINE_QUALIFICATION_REPLAY', state: 'missing' }],
    },
    waiver,
  });
  assert.match(expanded.errors.join(' '), /only the four frozen human finding requirements/u);
});

function createTaggedFixture() {
  const directory = mkdtempSync(join(tmpdir(), 'decantr-release-tag-test-'));
  const surface = {
    packages: [
      {
        name: '@decantr/core',
        path: 'packages/core',
        publish: true,
        maturity: 'stable',
        releaseWave: 'foundation',
        publishOrder: 10,
        defaultDistTag: 'latest',
      },
      {
        name: '@decantr/cli',
        path: 'packages/cli',
        publish: true,
        maturity: 'stable',
        releaseWave: 'delivery',
        publishOrder: 10,
        defaultDistTag: 'latest',
      },
    ],
  };
  writeJson(join(directory, 'config/package-surface.json'), surface);
  writeJson(join(directory, 'packages/core/package.json'), {
    name: '@decantr/core',
    version: '3.8.2',
  });
  writeJson(join(directory, 'packages/cli/package.json'), {
    name: '@decantr/cli',
    version: '3.8.3',
    dependencies: { '@decantr/core': 'workspace:*' },
  });
  mkdirSync(join(directory, 'docs/releases'), { recursive: true });
  writeFileSync(
    join(directory, 'docs/releases/2026-07-01-decantr-3-8-3.md'),
    '# Decantr 3.8.3\n\nTagged 3.8 release evidence.\n',
    'utf8',
  );

  git(directory, ['init']);
  git(directory, ['checkout', '-b', 'main']);
  git(directory, ['config', 'user.name', 'Release Test']);
  git(directory, ['config', 'user.email', 'release-test@example.com']);
  git(directory, ['add', '.']);
  git(directory, ['commit', '-m', 'release 3.8.3']);
  git(directory, ['tag', 'v3.8.3']);
  const tagCommit = git(directory, ['rev-parse', 'v3.8.3^{commit}']);

  writeJson(join(directory, 'packages/core/package.json'), {
    name: '@decantr/core',
    version: '3.9.0',
  });
  writeJson(join(directory, 'packages/cli/package.json'), {
    name: '@decantr/cli',
    version: '3.9.0',
    dependencies: { '@decantr/core': 'workspace:*' },
  });
  writeFileSync(
    join(directory, 'docs/releases/2026-07-16-decantr-3-9-0.md'),
    '# Decantr 3.9.0\n\nPrepared but unreleased.\n',
    'utf8',
  );
  git(directory, ['add', '.']);
  git(directory, ['commit', '-m', 'prepare 3.9.0']);
  return { directory, tagCommit };
}

function createPublishIntegrityFixture(t) {
  const fixtureRoot = mkdtempSync(join(tmpdir(), 'decantr-publish-integrity-test-'));
  t.after(() => rmSync(fixtureRoot, { recursive: true, force: true }));
  const directory = join(fixtureRoot, 'repo');
  const remote = join(fixtureRoot, 'origin.git');
  const fakeBin = join(fixtureRoot, 'bin');
  const stagingDir = join(fixtureRoot, 'staging');
  const publishEvents = join(fixtureRoot, 'publish-events.jsonl');
  const npmMetadata = join(fixtureRoot, 'npm-metadata.json');
  const tarballName = 'decantr-cli-3.9.0.tgz';
  const tarballPath = join(fixtureRoot, tarballName);
  const tarballSource = join(fixtureRoot, 'tarball-source');

  mkdirSync(join(tarballSource, 'package'), { recursive: true });
  writeJson(join(tarballSource, 'package/package.json'), {
    name: '@decantr/cli',
    version: '3.9.0',
  });
  execFileSync('tar', ['-czf', tarballPath, '-C', tarballSource, 'package']);
  const tarballBytes = readFileSync(tarballPath);
  const tarballSha256 = hash(tarballBytes, 'sha256');
  const exactPackageTarballs = Object.fromEntries(
    THREE_NINE_MACHINE_PACKAGES.map((name) => {
      if (name === '@decantr/cli') {
        return [name, { file: tarballName, sha256: tarballSha256 }];
      }
      return [
        name,
        {
          file: `decantr-${name.split('/')[1]}-3.9.0.tgz`,
          sha256: hash(`fixture:${name}`, 'sha256'),
        },
      ];
    }),
  );

  writeJson(join(directory, 'config/package-surface.json'), {
    releaseLanes: {
      '3.9': {
        initialVersion: '3.9.0',
        stableOnly: true,
        defaultDistTag: 'latest',
        requiredGates: [],
      },
    },
    packages: [
      {
        name: '@decantr/cli',
        path: 'packages/cli',
        publish: true,
        maturity: 'stable',
        releaseWave: 'delivery',
        publishOrder: 10,
        defaultDistTag: 'latest',
      },
    ],
  });
  writeJson(join(directory, 'packages/cli/package.json'), {
    name: '@decantr/cli',
    version: '3.9.0',
  });
  writeJson(join(directory, 'fixtures/qualification/3.9/qualification-packet.json'), {
    packetStatus: 'complete',
    qualificationClaim: true,
    routeCorpus: { status: 'complete' },
    routeReplay: { status: 'complete' },
    adoptionBoundaryReplay: { status: 'complete' },
    machineReplay: {
      status: 'complete',
      artifact: {
        environment: {
          exactPackageTarballs,
        },
      },
    },
  });
  mkdirSync(join(directory, 'docs/releases'), { recursive: true });
  writeFileSync(
    join(directory, 'docs/releases/2026-07-16-decantr-3-9-0.md'),
    '# Decantr 3.9.0\n\nTag-bound release fixture.\n',
    'utf8',
  );

  git(directory, ['init']);
  git(directory, ['checkout', '-b', 'main']);
  git(directory, ['config', 'user.name', 'Release Test']);
  git(directory, ['config', 'user.email', 'release-test@example.com']);
  git(directory, ['add', '.']);
  git(directory, ['commit', '-m', 'release 3.9.0']);
  git(directory, ['tag', 'v3.9.0']);
  const tagCommit = git(directory, ['rev-parse', 'v3.9.0^{commit}']);
  execFileSync('git', ['init', '--bare', remote]);
  git(directory, ['remote', 'add', 'origin', remote]);
  git(directory, ['push', '-u', 'origin', 'main']);
  git(directory, ['push', 'origin', 'v3.9.0']);

  mkdirSync(fakeBin, { recursive: true });
  const fakePnpm = join(fakeBin, 'pnpm');
  writeFileSync(
    fakePnpm,
    `#!/usr/bin/env node
import { appendFileSync, copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { basename, join } from 'node:path';
const args = process.argv.slice(2);
if (args[0] === 'pack') {
  const destination = args[args.indexOf('--pack-destination') + 1];
  mkdirSync(destination, { recursive: true });
  const target = join(destination, basename(process.env.DECANTR_TEST_TARBALL));
  copyFileSync(process.env.DECANTR_TEST_TARBALL, target);
  const sha256 = createHash('sha256').update(readFileSync(target)).digest('hex');
  appendFileSync(process.env.DECANTR_TEST_PUBLISH_EVENTS, JSON.stringify({ kind: 'pack', target, sha256 }) + '\\n');
  console.log(JSON.stringify([{ filename: target }]));
  process.exit(0);
}
if (args[0] === 'publish') {
  const target = args[1];
  const sha256 = createHash('sha256').update(readFileSync(target)).digest('hex');
  appendFileSync(process.env.DECANTR_TEST_PUBLISH_EVENTS, JSON.stringify({ kind: 'publish', args, target, sha256 }) + '\\n');
  if (process.env.DECANTR_TEST_FAIL_OIDC === 'true' && args.includes('--provenance')) process.exit(1);
  process.exit(0);
}
process.exit(64);
`,
    'utf8',
  );
  chmodSync(fakePnpm, 0o755);

  const fakeNpm = join(fakeBin, 'npm');
  writeFileSync(
    fakeNpm,
    `#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
const args = process.argv.slice(2);
const metadata = process.env.DECANTR_TEST_NPM_METADATA && existsSync(process.env.DECANTR_TEST_NPM_METADATA)
  ? JSON.parse(readFileSync(process.env.DECANTR_TEST_NPM_METADATA, 'utf8'))
  : null;
if (args[0] === 'pack') {
  const destination = args[args.indexOf('--pack-destination') + 1];
  mkdirSync(destination, { recursive: true });
  const target = join(destination, basename(process.env.DECANTR_TEST_TARBALL));
  copyFileSync(process.env.DECANTR_TEST_TARBALL, target);
  console.log(JSON.stringify([{ filename: target }]));
  process.exit(0);
}
if (args[0] === 'view' && args[2] === 'versions') {
  console.log(JSON.stringify(metadata ? [metadata.version] : []));
  process.exit(0);
}
if (args[0] === 'view' && args[2] === 'dist-tags') {
  console.log(JSON.stringify(metadata ? { latest: metadata.version } : {}));
  process.exit(0);
}
if (args[0] === 'view' && args[2] === 'dist') {
  if (!metadata) process.exit(1);
  console.log(JSON.stringify(metadata.dist));
  process.exit(0);
}
console.log('{}');
`,
    'utf8',
  );
  chmodSync(fakeNpm, 0o755);

  const env = {
    ...process.env,
    NODE_ENV: 'test',
    DECANTR_RELEASE_TEST_ROOT: directory,
    DECANTR_RELEASE_VERSION: '3.9.0',
    DECANTR_RELEASE_STAGING_DIR: stagingDir,
    DECANTR_TEST_TARBALL: tarballPath,
    DECANTR_TEST_PUBLISH_EVENTS: publishEvents,
    DECANTR_TEST_NPM_METADATA: npmMetadata,
    DECANTR_PUBLISH_AUTH_STRATEGY: 'oidc',
    GITHUB_ACTIONS: 'true',
    CI: 'true',
    PATH: `${fakeBin}:${process.env.PATH}`,
  };

  return {
    directory,
    remote,
    stagingDir,
    publishEvents,
    npmMetadata,
    tarballBytes,
    tarballName,
    tarballSha256,
    tagCommit,
    env,
  };
}

test('publish selection expands internal dependencies and enforces 3.9 latest', () => {
  const selected = runNode('publish-packages.mjs', [
    '--dry-run',
    '--selection-json',
    '--only=@decantr/cli',
  ]);
  assert.equal(selected.status, 0, outputOf(selected));
  const selection = JSON.parse(selected.stdout);
  assert.deepEqual(selection.requestedOnly, ['@decantr/cli']);
  assert.deepEqual(selection.effectiveOnly, [
    '@decantr/essence-spec',
    '@decantr/content',
    '@decantr/core',
    '@decantr/telemetry',
    '@decantr/verifier',
    '@decantr/cli',
  ]);
  assert.ok(selection.expandedDependencies.includes('@decantr/core'));

  const next = runNode('publish-packages.mjs', [
    '--dry-run',
    '--selection-json',
    '--only=@decantr/cli',
    '--tag-override=next',
  ]);
  assert.equal(next.status, 1);
  assert.match(outputOf(next), /must publish with npm dist-tag latest/u);

  const mismatchedTarget = runNode('publish-packages.mjs', [
    '--dry-run',
    '--selection-json',
    '--only=@decantr/cli',
  ], {
    env: { ...process.env, DECANTR_RELEASE_VERSION: '9.9.9' },
  });
  assert.equal(mismatchedTarget.status, 1);
  assert.match(outputOf(mismatchedTarget), /does not match any selected package manifest version/u);
});

test('real local 3.9 publish is tag-bound and sends the retained qualified tarball', (t) => {
  const fixture = createPublishIntegrityFixture(t);
  const publishArgs = ['--only=@decantr/cli', '--auth-strategy=oidc'];
  const dirtyPath = join(fixture.directory, 'dirty.txt');
  writeFileSync(dirtyPath, 'dirty\n', 'utf8');

  const dirty = runNode('publish-packages.mjs', publishArgs, { env: fixture.env });
  assert.equal(dirty.status, 1);
  assert.match(outputOf(dirty), /requires a clean worktree/u);

  const planning = runNode('publish-packages.mjs', [
    '--dry-run',
    '--selection-json',
    '--only=@decantr/cli',
  ], { env: fixture.env });
  assert.equal(planning.status, 0, outputOf(planning));
  rmSync(dirtyPath);

  const tree = git(fixture.directory, ['rev-parse', 'HEAD^{tree}']);
  const mismatchCommit = git(fixture.directory, [
    'commit-tree',
    tree,
    '-p',
    fixture.tagCommit,
    '-m',
    'remote tag mismatch',
  ]);
  git(fixture.directory, [
    'push',
    '--force',
    'origin',
    `${mismatchCommit}:refs/tags/v3.9.0`,
  ]);
  const mismatchedRemote = runNode('publish-packages.mjs', publishArgs, { env: fixture.env });
  assert.equal(mismatchedRemote.status, 1);
  assert.match(outputOf(mismatchedRemote), /remote tag resolves to/u);
  git(fixture.directory, [
    'push',
    '--force',
    'origin',
    `${fixture.tagCommit}:refs/tags/v3.9.0`,
  ]);

  const unrelatedMain = git(fixture.directory, [
    'commit-tree',
    tree,
    '-m',
    'unrelated remote main',
  ]);
  git(fixture.directory, [
    'push',
    '--force',
    'origin',
    `${unrelatedMain}:refs/heads/main`,
  ]);
  const tagOffMain = runNode('publish-packages.mjs', publishArgs, { env: fixture.env });
  assert.equal(tagOffMain.status, 1);
  assert.match(outputOf(tagOffMain), /is not reachable from verified origin\/main/u);
  git(fixture.directory, [
    'push',
    '--force',
    'origin',
    `${fixture.tagCommit}:refs/heads/main`,
  ]);

  const published = runNode('publish-packages.mjs', publishArgs, { env: fixture.env });
  assert.equal(published.status, 0, outputOf(published));
  const manifestMatch = outputOf(published).match(
    /Retained content-addressed release staging manifest: (.+)$/mu,
  );
  assert.ok(manifestMatch, outputOf(published));
  const manifestPath = manifestMatch[1];
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const packageArtifact = manifest.packages[0];
  const retainedPath = resolve(dirname(manifestPath), ...packageArtifact.tarball.relativePath.split('/'));
  const events = readFileSync(fixture.publishEvents, 'utf8')
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line));
  const packs = events.filter((event) => event.kind === 'pack');
  const publishes = events.filter((event) => event.kind === 'publish');

  assert.equal(packs.length, 1);
  assert.equal(publishes.length, 1);
  assert.equal(packs[0].sha256, fixture.tarballSha256);
  assert.equal(publishes[0].sha256, packs[0].sha256);
  assert.equal(publishes[0].target, retainedPath);
  assert.equal(publishes[0].args[1], retainedPath);
  assert.equal(packageArtifact.qualification.status, 'qualified');
  assert.equal(packageArtifact.qualification.sha256, fixture.tarballSha256);
  assert.match(packageArtifact.tarball.relativePath, /^sha256\/[a-f0-9]{64}\//u);
});

test('OIDC token fallback reuses the retained qualified tarball', (t) => {
  const fixture = createPublishIntegrityFixture(t);
  const result = runNode('publish-packages.mjs', [
    '--only=@decantr/cli',
    '--auth-strategy=auto',
  ], {
    env: {
      ...fixture.env,
      DECANTR_TEST_FAIL_OIDC: 'true',
      NPM_TOKEN: 'fixture-token',
    },
  });
  assert.equal(result.status, 0, outputOf(result));

  const manifestPath = outputOf(result).match(
    /Retained content-addressed release staging manifest: (.+)$/mu,
  )?.[1];
  assert.ok(manifestPath, outputOf(result));
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const events = readFileSync(fixture.publishEvents, 'utf8')
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line));
  const packs = events.filter((event) => event.kind === 'pack');
  const publishes = events.filter((event) => event.kind === 'publish');

  assert.equal(packs.length, 1);
  assert.equal(publishes.length, 2);
  assert.equal(publishes[0].target, publishes[1].target);
  assert.equal(publishes[0].sha256, fixture.tarballSha256);
  assert.equal(publishes[1].sha256, fixture.tarballSha256);
  assert.ok(publishes[0].args.includes('--provenance'));
  assert.ok(!publishes[1].args.includes('--provenance'));
  assert.equal(manifest.packages[0].publish.authMode, 'token');
  assert.equal(manifest.packages[0].publish.status, 'published');
});

test('closeout binds public npm bytes and OIDC provenance to retained release-evidence hashes', (t) => {
  const fixture = createPublishIntegrityFixture(t);
  const published = runNode('publish-packages.mjs', [
    '--only=@decantr/cli',
    '--auth-strategy=oidc',
  ], { env: fixture.env });
  assert.equal(published.status, 0, outputOf(published));
  const manifestPath = outputOf(published).match(
    /Retained content-addressed release staging manifest: (.+)$/mu,
  )?.[1];
  assert.ok(manifestPath, outputOf(published));
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const packageArtifact = manifest.packages[0];
  const retainedPath = resolve(dirname(manifestPath), ...packageArtifact.tarball.relativePath.split('/'));
  const publicBytes = Buffer.from(fixture.tarballBytes);
  const publicSha512Hex = hash(publicBytes, 'sha512');
  const statement = {
    _type: 'https://in-toto.io/Statement/v1',
    subject: [
      {
        name: 'pkg:npm/%40decantr/cli@3.9.0',
        digest: { sha512: publicSha512Hex },
      },
    ],
    predicateType: 'https://slsa.dev/provenance/v1',
    predicate: {
      buildDefinition: {
        externalParameters: {
          workflow: {
            ref: 'refs/tags/v3.9.0',
            repository: 'https://github.com/decantr-ai/decantr',
            path: '.github/workflows/publish.yml',
          },
        },
        resolvedDependencies: [
          {
            uri: 'git+https://github.com/decantr-ai/decantr@refs/tags/v3.9.0',
            digest: { gitCommit: fixture.tagCommit },
          },
        ],
      },
    },
  };
  const attestations = {
    attestations: [
      {
        predicateType: 'https://slsa.dev/provenance/v1',
        bundle: {
          dsseEnvelope: {
            payload: Buffer.from(JSON.stringify(statement)).toString('base64'),
            signatures: [{ sig: 'fixture-signature' }],
          },
        },
      },
    ],
  };
  const attestationUrl = `data:application/json;base64,${Buffer.from(JSON.stringify(attestations)).toString('base64')}`;
  writeJson(fixture.npmMetadata, {
    version: '3.9.0',
    dist: {
      integrity: `sha512-${hash(publicBytes, 'sha512', 'base64')}`,
      shasum: hash(publicBytes, 'sha1'),
      tarball: `data:application/octet-stream;base64,${publicBytes.toString('base64')}`,
      attestations: {
        url: attestationUrl,
        provenance: { predicateType: 'https://slsa.dev/provenance/v1' },
      },
    },
  });
  const closeoutEnv = {
    ...fixture.env,
    DECANTR_RELEASE_MANIFEST: manifestPath,
    DECANTR_RELEASE_TEST_ALLOW_DATA_URL: 'true',
  };

  const closeout = runNode('audit-release-closeout.mjs', [
    '--json',
    '--no-fetch',
    '--version=3.9.0',
    '--only=@decantr/cli',
  ], { env: closeoutEnv });
  assert.equal(closeout.status, 0, outputOf(closeout));
  const report = JSON.parse(closeout.stdout);
  assert.equal(report.stagingManifest, manifestPath);
  assert.ok(report.checks.some((check) => (
    check.name === '@decantr/cli@3.9.0 public tarball integrity'
    && check.status === 'pass'
  )));
  assert.ok(report.checks.some((check) => (
    check.name === '@decantr/cli@3.9.0 provenance'
    && check.status === 'pass'
  )));
  assert.ok(report.checks.some((check) => (
    check.name === 'registry signature and provenance verification'
    && check.status === 'pass'
  )));

  chmodSync(retainedPath, 0o644);
  writeFileSync(retainedPath, Buffer.concat([readFileSync(retainedPath), Buffer.from('tampered')]));
  const tampered = runNode('audit-release-closeout.mjs', [
    '--json',
    '--no-fetch',
    '--version=3.9.0',
    '--only=@decantr/cli',
  ], { env: closeoutEnv });
  assert.equal(tampered.status, 1);
  assert.ok(JSON.parse(tampered.stdout).checks.some((check) => (
    check.name === '@decantr/cli@3.9.0 retained tarball'
    && check.status === 'fail'
  )));
});

test('3.9 prepublish requires the wrapper while 3.8 pnpm patches remain allowed', (t) => {
  const pnpmEnv = {
    ...process.env,
    npm_config_user_agent: 'pnpm/10.0.0 npm/? node/v24.0.0',
    npm_execpath: '/tmp/pnpm.cjs',
  };
  delete pnpmEnv.DECANTR_PUBLISH_WRAPPER;

  const direct39 = runNode('guard-pnpm-publish.mjs', [], {
    cwd: join(root, 'packages/cli'),
    env: pnpmEnv,
  });
  assert.equal(direct39.status, 1);
  assert.match(outputOf(direct39), /must be published through scripts\/publish-packages\.mjs/u);

  const wrapped39 = runNode('guard-pnpm-publish.mjs', [], {
    cwd: join(root, 'packages/cli'),
    env: { ...pnpmEnv, DECANTR_PUBLISH_WRAPPER: 'scripts/publish-packages.mjs' },
  });
  assert.equal(wrapped39.status, 0, outputOf(wrapped39));

  const patchPackage = mkdtempSync(join(tmpdir(), 'decantr-3-8-publish-test-'));
  t.after(() => rmSync(patchPackage, { recursive: true, force: true }));
  writeJson(join(patchPackage, 'package.json'), {
    name: '@decantr/cli',
    version: '3.8.4',
  });
  const direct38 = runNode('guard-pnpm-publish.mjs', [], {
    cwd: patchPackage,
    env: pnpmEnv,
  });
  assert.equal(direct38.status, 0, outputOf(direct38));
});

test('release:commands emits wrapper-only publish commands and a closure-aware verifier', (t) => {
  const fakeBin = mkdtempSync(join(tmpdir(), 'decantr-release-npm-test-'));
  t.after(() => rmSync(fakeBin, { recursive: true, force: true }));
  const fakeNpm = join(fakeBin, 'npm');
  writeFileSync(
    fakeNpm,
    `#!/bin/sh
if [ "$1" = "whoami" ]; then
  echo release-test
  exit 0
fi
if [ "$1" = "view" ] && [ "$3" = "versions" ]; then
  echo '[]'
  exit 0
fi
echo '{}'
`,
    'utf8',
  );
  chmodSync(fakeNpm, 0o755);

  const result = runNode('release-commands.mjs', ['--json', '--only=@decantr/cli'], {
    env: { ...process.env, PATH: `${fakeBin}:${process.env.PATH}` },
  });
  assert.equal(result.status, 0, outputOf(result));
  const report = JSON.parse(result.stdout);
  assert.ok(report.filters.effectiveOnly.includes('@decantr/core'));
  assert.ok(report.wrapperCommands.verify.includes('@decantr/core'));
  assert.match(report.wrapperCommands.preflight, /--staging-dir=/u);
  assert.equal(typeof report.filters.stagingDir, 'string');
  for (const command of report.commands) {
    assert.match(command.preflight, /^node scripts\/publish-packages\.mjs/u);
    assert.match(command.publish, /^node scripts\/publish-packages\.mjs/u);
    assert.doesNotMatch(command.publish, /pnpm publish/u);
  }
});

test('readiness runs the 3.9 release-evidence gate but leaves a 3.8 patch lane alone', (t) => {
  const directory = mkdtempSync(join(tmpdir(), 'decantr-readiness-test-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const packageManifest = {
    name: '@decantr/cli',
    version: '3.9.0',
    license: 'MIT',
    author: 'Decantr Labs',
    homepage: 'https://decantr.ai',
    bugs: { url: 'https://github.com/decantr-ai/decantr/issues' },
    repository: {
      type: 'git',
      url: 'git+https://github.com/decantr-ai/decantr.git',
      directory: 'packages/cli',
    },
    files: ['dist'],
    publishConfig: { access: 'public' },
  };
  const surface = {
    releaseLanes: {
      '3.9': {
        stableOnly: true,
        defaultDistTag: 'latest',
        requiredGates: [
          {
            id: 'qualification',
            label: 'Fixture qualification gate',
            script: 'scripts/qualification-gate.mjs',
            phases: ['readiness'],
          },
        ],
      },
    },
    packages: [
      {
        name: '@decantr/cli',
        path: 'packages/cli',
        support: 'core-supported',
        surfaceClass: 'public-delivery',
        maturity: 'stable',
        publish: true,
        releaseWave: 'delivery',
        releaseChannel: 'stable',
        publishOrder: 10,
        defaultDistTag: 'latest',
        summary: 'Fixture package.',
        releaseReadiness: {
          stableCandidate: true,
          docsAligned: true,
          ciCovered: true,
          productIntegrated: true,
          blockers: [],
        },
      },
    ],
  };
  writeJson(join(directory, 'config/package-surface.json'), surface);
  writeJson(join(directory, 'packages/cli/package.json'), packageManifest);
  mkdirSync(join(directory, 'scripts'), { recursive: true });
  writeFileSync(
    join(directory, 'scripts/qualification-gate.mjs'),
    "console.error('qualification incomplete'); process.exit(1);\n",
    'utf8',
  );
  const env = {
    ...process.env,
    NODE_ENV: 'test',
    DECANTR_RELEASE_TEST_ROOT: directory,
  };

  const blocked = runNode('audit-release-readiness.mjs', [], { env });
  assert.equal(blocked.status, 1);
  assert.match(outputOf(blocked), /Fixture qualification gate blocks the Decantr 3\.9 release/u);

  writeJson(join(directory, 'packages/cli/package.json'), {
    ...packageManifest,
    version: '3.8.4',
  });
  const patch = runNode('audit-release-readiness.mjs', [], { env });
  assert.equal(patch.status, 0, outputOf(patch));
});

test('earlier closeout ignores a prepared 3.9 note on HEAD and uses tagged dependency versions', (t) => {
  const fixture = createTaggedFixture();
  t.after(() => rmSync(fixture.directory, { recursive: true, force: true }));
  const env = {
    ...process.env,
    NODE_ENV: 'test',
    DECANTR_RELEASE_TEST_ROOT: fixture.directory,
  };
  const result = runNode('audit-release-closeout.mjs', [
    '--json',
    '--skip-git',
    '--skip-npm',
    '--version=3.8.3',
    '--only=@decantr/cli',
  ], { env });
  assert.equal(result.status, 0, outputOf(result));
  const report = JSON.parse(result.stdout);
  assert.equal(report.tagCommit, fixture.tagCommit);
  assert.equal(report.releaseNote, 'docs/releases/2026-07-01-decantr-3-8-3.md');
  assert.deepEqual(report.filters.effectiveOnly, ['@decantr/core', '@decantr/cli']);
  assert.ok(report.checks.every((check) => !check.name.includes('v3.9.0')));

  const implicit = runNode('audit-release-closeout.mjs', ['--json', '--skip-git', '--skip-npm'], { env });
  assert.equal(implicit.status, 1);
  assert.equal(JSON.parse(implicit.stdout).releaseVersion, null);
});

test('announcement payload is tag-bound and has no HEAD fallback', (t) => {
  const fixture = createTaggedFixture();
  t.after(() => rmSync(fixture.directory, { recursive: true, force: true }));
  const env = {
    ...process.env,
    NODE_ENV: 'test',
    DECANTR_RELEASE_TEST_ROOT: fixture.directory,
  };
  const result = runNode('dispatch-community-release.mjs', [
    '--json',
    '--version=3.8.3',
    '--only=@decantr/cli',
  ], { env });
  assert.equal(result.status, 0, outputOf(result));
  const release = JSON.parse(result.stdout).client_payload.release;
  assert.equal(release.commit, fixture.tagCommit);
  assert.match(release.changelog_markdown, /Tagged 3\.8 release evidence/u);
  assert.doesNotMatch(release.changelog_markdown, /Prepared but unreleased/u);
  assert.deepEqual(
    release.packages.map(({ name, version }) => `${name}@${version}`),
    ['@decantr/core@3.8.2', '@decantr/cli@3.8.3'],
  );
  assert.match(release.release_note_url, /\/blob\/v3\.8\.3\/docs\/releases\//u);
  assert.match(release.release_note_blob, /^[0-9a-f]{40,64}$/u);

  const implicit = runNode('dispatch-community-release.mjs', ['--json'], { env });
  assert.equal(implicit.status, 1);
  assert.match(outputOf(implicit), /announcements cannot fall back to HEAD/u);
});

test('publish workflow is protected and verifies the tagged origin/main commit', () => {
  const workflow = readFileSync(join(root, '.github/workflows/publish.yml'), 'utf8');
  assert.match(workflow, /release_tag:/u);
  assert.match(workflow, /environment: npm-production/u);
  assert.match(workflow, /publish\.yml@refs\/heads\/main/u);
  assert.match(workflow, /refs\/heads\/main:refs\/remotes\/origin\/main/u);
  assert.match(workflow, /ORIGIN_MAIN_COMMIT/u);
  assert.match(workflow, /REMOTE_MAIN_COMMIT/u);
  assert.match(workflow, /git merge-base --is-ancestor "\$TAG_COMMIT" origin\/main/u);
  assert.match(workflow, /ref: \$\{\{ github\.event_name == 'workflow_dispatch' && inputs\.release_tag \|\| github\.ref \}\}/u);
  assert.doesNotMatch(workflow, /ARGS=""/u);
  assert.match(workflow, /release-evidence-publish-tarballs/u);
  assert.match(workflow, /DECANTR_RELEASE_STAGING_DIR/u);
  assert.match(workflow, /Run tag-bound release closeout/u);
});
