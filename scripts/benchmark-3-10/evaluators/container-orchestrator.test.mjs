import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { lstat, mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { sha256Canonical } from '../runner/canonical.mjs';
import {
  createPreparedBaseEnvironment,
  dependencyProxyContainerArgs,
  dependencyProxyReadinessArgs,
  deriveDependencyAllowlist,
  inspectPreparedDependencyRoot,
  packageManagerFatalDiagnostic,
  prepareEvaluationEvidenceRoots,
  preparePreparationHome,
  releaseEvaluationGate,
  resolveDependencyProxyAddress,
  resolveImagePullReference,
  verifyPreparationInspect,
  verifyRunnerCommit,
  verifyRunningEvaluationContainer,
  writeReadableCanonicalEvidence,
} from './container-orchestrator.mjs';

const IMAGE = `sha256:${'2'.repeat(64)}`;
const evaluatorRoot = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(evaluatorRoot, '..', '..', '..');

test('evaluator workflow uses a fixed GitHub host and read-only GHCR credentials', async () => {
  const workflow = await readFile(
    join(repositoryRoot, '.github', 'workflows', 'benchmark-3-10-evaluator-qualification.yml'),
    'utf8',
  );
  const actionReferences = [...workflow.matchAll(/uses:\s+[^@\s]+@([^\s]+)/gu)].map((match) => match[1]);
  assert.equal(actionReferences.length, 7);
  assert.equal(actionReferences.every((reference) => /^[a-f0-9]{40}$/u.test(reference)), true);
  assert.equal(workflow.includes('runs-on: ubuntu-24.04'), true);
  assert.equal(workflow.includes('runs-on: self-hosted'), false);
  assert.equal(workflow.includes('decantr-ai/decantr-qualification-private'), true);
  assert.equal(workflow.includes('benchmark-3-10-private-qualification-input.yml'), true);
  assert.equal(workflow.includes('packages: read'), true);
  assert.equal(workflow.includes('packages: write'), false);
  assert.equal(workflow.includes('docker login ghcr.io'), true);
  assert.equal(workflow.includes('docker logout ghcr.io'), true);
  assert.equal(
    workflow.includes(
      'docker.io/ubuntu/squid@sha256:8fafd41d6ddceb295d26eea9938321d825ac5351c7e46cf6a8aa5d093b8ed1ce',
    ),
    true,
  );
  assert.equal(workflow.includes('docker pull --platform linux/amd64'), true);
  assert.equal(
    workflow.includes(
      `docker image inspect --format '{{.Id}}' "$PROXY_MANIFEST_REFERENCE"`,
    ),
    true,
  );
  assert.equal(workflow.includes('xargs -0 -r setfacl'), true);
  assert.equal(workflow.includes(`grep -Fx 'user:10001:rwx'`), true);
  assert.equal(
    workflow.includes('.github/scripts/benchmark-3-10-reclaim-storage.sh'),
    true,
  );
  assert.equal(workflow.includes('25769803776'), true);
  assert.equal(workflow.includes('setpriv --reuid=10001'), false);
  assert.equal(workflow.includes('chmod -R a+rwX'), false);
  assert.equal(
    workflow.includes(
      'benchmark-3-10-prepared-workspace-${{ github.run_id }}-${{ github.run_attempt }}',
    ),
    true,
  );
  assert.equal(workflow.includes('.preparation.preparedEnvironment.fileSha256'), true);
  assert.equal(workflow.includes('workspace.tar'), true);
  assert.equal(workflow.match(/retention-days: 1/gu)?.length, 2);
  assert.equal(workflow.includes('retention-days: 30'), false);
});

test('hosted storage cleanup is allowlisted, measured, and independently diagnosable', async () => {
  const [script, workflow] = await Promise.all([
    readFile(
      join(repositoryRoot, '.github', 'scripts', 'benchmark-3-10-reclaim-storage.sh'),
      'utf8',
    ),
    readFile(
      join(
        repositoryRoot,
        '.github',
        'workflows',
        'benchmark-3-10-runner-storage-diagnostic.yml',
      ),
      'utf8',
    ),
  ]);
  const actionReferences = [...workflow.matchAll(/uses:\s+[^@\s]+@([^\s]+)/gu)].map(
    (match) => match[1],
  );
  assert.equal(actionReferences.length, 3);
  assert.equal(
    actionReferences.every((reference) => /^[a-f0-9]{40}$/u.test(reference)),
    true,
  );
  assert.equal(script.includes('RECLAIM_PATHS=('), true);
  assert.equal(script.includes('/usr/local/lib/android'), true);
  assert.equal(script.includes('/opt/hostedtoolcache/CodeQL'), true);
  assert.equal(script.includes('rm -rf --one-file-system -- "$path"'), true);
  assert.equal(script.includes('rm -rf /'), false);
  assert.equal(script.includes('decantr-benchmark-hosted-runner-storage.v1'), true);
  assert.equal(workflow.includes('runs-on: ubuntu-24.04'), true);
  assert.equal(workflow.includes('github-hosted'), true);
});

test('private input workflow is repository-gated and uses the shared controller', async () => {
  const workflow = await readFile(
    join(
      repositoryRoot,
      '.github',
      'workflows',
      'benchmark-3-10-private-qualification-input.yml',
    ),
    'utf8',
  );
  const actionReferences = [...workflow.matchAll(/uses:\s+[^@\s]+@([^\s]+)/gu)].map(
    (match) => match[1],
  );
  assert.equal(actionReferences.length, 3);
  assert.equal(
    actionReferences.every((reference) => /^[a-f0-9]{40}$/u.test(reference)),
    true,
  );
  assert.equal(
    workflow.includes(
      "if: github.repository == 'decantr-ai/decantr-qualification-private'",
    ),
    true,
  );
  assert.equal(
    workflow.includes(
      'node scripts/benchmark-3-10/evaluators/prepare-private-input.mjs',
    ),
    true,
  );
  assert.equal(workflow.includes('.private/benchmark-3-10/evaluators/prepare-private-input.mjs'), false);
  assert.equal(workflow.includes('retention-days: 1'), true);
  assert.equal(workflow.includes('retention-days: 3'), false);
});

test('public evaluator input uses one-day fallback retention', async () => {
  const workflow = await readFile(
    join(
      repositoryRoot,
      '.github',
      'workflows',
      'benchmark-3-10-qualification-input.yml',
    ),
    'utf8',
  );
  assert.equal(workflow.includes('retention-days: 1'), true);
  assert.equal(workflow.includes('retention-days: 3'), false);
});

test('image retrieval preserves a manifest-pinned reference and separately verifies the config digest', () => {
  const manifestDigest = `sha256:${'1'.repeat(64)}`;
  const reference = `ghcr.io/decantr-ai/decantr-benchmark-3-10:profile@${manifestDigest}`;
  assert.equal(resolveImagePullReference({ reference, digest: IMAGE }), reference);
  assert.equal(
    resolveImagePullReference({ reference: 'docker.io/ubuntu/squid', digest: IMAGE }),
    `docker.io/ubuntu/squid@${IMAGE}`,
  );
  assert.throws(
    () => resolveImagePullReference({ reference: 'ghcr.io/decantr-ai/image@mutable', digest: IMAGE }),
    /immutable container image reference is invalid/u,
  );
});

test('dependency proxy readiness uses a hardened container on only the internal network', () => {
  const args = dependencyProxyReadinessArgs({
    name: 'qualification-proxy-readiness',
    networkName: 'qualification-dependencies',
    imageDigest: IMAGE,
    proxyAddress: '172.18.0.2',
  });
  assert.equal(args[0], 'run');
  assert.equal(args.includes('--rm'), true);
  assert.deepEqual(args.slice(args.indexOf('--network'), args.indexOf('--network') + 2), [
    '--network',
    'qualification-dependencies',
  ]);
  assert.deepEqual(args.slice(args.indexOf('--add-host'), args.indexOf('--add-host') + 2), [
    '--add-host',
    'dependency-proxy:172.18.0.2',
  ]);
  assert.equal(args.includes('--read-only'), true);
  assert.equal(args.includes('--mount'), false);
  assert.equal(args.includes('--env'), false);
  assert.equal(args.at(-2), '--eval');
  assert.match(args.at(-1), /dependency-proxy/u);
  assert.match(args.at(-1), /connection timed out/u);
});

test('dependency proxy runs nonroot with zero capabilities and only owned tmpfs mounts', () => {
  const args = dependencyProxyContainerArgs({
    name: 'qualification-proxy',
    networkName: 'qualification-dependencies',
    configPath: '/evidence/proxy/squid.conf',
    imageDigest: IMAGE,
  });
  assert.deepEqual(args.slice(args.indexOf('--user'), args.indexOf('--user') + 2), [
    '--user',
    '13:13',
  ]);
  assert.deepEqual(args.slice(args.indexOf('--cap-drop'), args.indexOf('--cap-drop') + 2), [
    '--cap-drop',
    'ALL',
  ]);
  assert.equal(args.includes('--read-only'), true);
  assert.equal(args.filter((item) => item === '--tmpfs').length, 3);
  assert.equal(
    args.includes('/var/log/squid:rw,nosuid,nodev,noexec,size=64m,uid=13,gid=13,mode=0750'),
    true,
  );
  assert.equal(
    args.includes('/var/run:rw,nosuid,nodev,noexec,size=16m,uid=13,gid=13,mode=0750'),
    true,
  );
  assert.equal(
    args.includes('/var/spool/squid:rw,nosuid,nodev,noexec,size=64m,uid=13,gid=13,mode=0750'),
    true,
  );
  assert.throws(
    () =>
      dependencyProxyContainerArgs({
        name: 'qualification-proxy',
        networkName: 'qualification-dependencies',
        configPath: 'relative/squid.conf',
        imageDigest: IMAGE,
      }),
    /container binding is invalid/u,
  );
});

test('dependency proxy address is derived from the inspected internal network', () => {
  assert.equal(
    resolveDependencyProxyAddress(
      {
        NetworkSettings: {
          Networks: {
            'qualification-dependencies': {
              IPAddress: '172.18.0.2',
            },
          },
        },
      },
      'qualification-dependencies',
    ),
    '172.18.0.2',
  );
  assert.throws(
    () =>
      resolveDependencyProxyAddress(
        {
          NetworkSettings: {
            Networks: {
              'qualification-dependencies': {
                IPAddress: '',
              },
            },
          },
        },
        'qualification-dependencies',
      ),
    /internal IPv4 address is invalid/u,
  );
  assert.throws(
    () =>
      dependencyProxyReadinessArgs({
        name: 'qualification-proxy-readiness',
        networkName: 'qualification-dependencies',
        imageDigest: IMAGE,
        proxyAddress: 'not-an-ip',
      }),
    /readiness container binding is invalid/u,
  );
});

test('preparation rejects fatal package-manager diagnostics even when the process exits zero', () => {
  assert.equal(
    packageManagerFatalDiagnostic(
      'npm',
      '',
      'npm error Exit handler never called!\nnpm error A complete log is available\n',
    ),
    'npm error Exit handler never called!',
  );
  assert.equal(
    packageManagerFatalDiagnostic('pnpm', 'ERR_PNPM_FETCH_503 GET https://registry.npmjs.org\n'),
    'ERR_PNPM_FETCH_503 GET https://registry.npmjs.org',
  );
  assert.equal(packageManagerFatalDiagnostic('npm', 'npm warn deprecated fixture\n'), null);
});

test('prepared dependency evidence requires a nonempty contained node_modules root', async () => {
  const root = await mkdtemp(join(tmpdir(), 'decantr-container-dependencies-'));
  try {
    await assert.rejects(
      inspectPreparedDependencyRoot(root, '.'),
      /dependency installation did not create node_modules/u,
    );
    await mkdir(join(root, 'node_modules'));
    await assert.rejects(inspectPreparedDependencyRoot(root, '.'), /dependency root is empty/u);
    await writeFile(join(root, 'node_modules', 'fixture.txt'), 'prepared\n');
    assert.deepEqual(await inspectPreparedDependencyRoot(root, '.'), {
      path: 'node_modules',
      kind: 'directory',
      entryCount: 1,
    });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('evaluation evidence roots permit the fixed non-root evaluator handoff', async () => {
  const root = await mkdtemp(join(tmpdir(), 'decantr-container-evidence-'));
  try {
    const paths = await prepareEvaluationEvidenceRoots(join(root, 'role'));
    assert.equal((await lstat(paths.outputRoot)).mode & 0o777, 0o733);
    assert.equal((await lstat(paths.controlRoot)).mode & 0o777, 0o755);

    const gatePath = join(paths.controlRoot, 'release');
    await releaseEvaluationGate(gatePath);
    assert.equal((await lstat(gatePath)).mode & 0o777, 0o644);
    assert.equal(await readFile(gatePath, 'utf8'), 'host-inspection-passed\n');

    const resultPath = join(paths.outputRoot, 'result.json');
    await writeReadableCanonicalEvidence(resultPath, { status: 'passed' });
    assert.equal((await lstat(resultPath)).mode & 0o777, 0o644);
    assert.deepEqual(JSON.parse(await readFile(resultPath, 'utf8')), { status: 'passed' });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('preparation home is empty, role-specific, and protected by a private parent', async () => {
  const root = await mkdtemp(join(tmpdir(), 'decantr-container-preparation-home-'));
  try {
    const home = await preparePreparationHome(root, 'qualification-base');
    assert.equal((await lstat(dirname(home))).mode & 0o777, 0o700);
    assert.equal((await lstat(home)).mode & 0o777, 0o777);
    assert.deepEqual(await readdir(home), []);
    await assert.rejects(
      preparePreparationHome(root, '../escape'),
      /role name is invalid/u,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('preparation inspection requires only the task workspace and empty home as writable binds', async () => {
  const root = await mkdtemp(join(tmpdir(), 'decantr-container-preparation-inspect-'));
  try {
    const workspace = join(root, 'base');
    const siblingWorkspace = join(root, 'expected');
    const preparationHome = join(root, 'home');
    await Promise.all([
      mkdir(workspace),
      mkdir(siblingWorkspace),
      mkdir(preparationHome),
    ]);
    const inspect = {
      Image: IMAGE,
      Config: { Image: IMAGE },
      HostConfig: {
        NetworkMode: 'none',
        ReadonlyRootfs: true,
        CapDrop: ['ALL'],
        SecurityOpt: ['no-new-privileges'],
        ExtraHosts: [],
      },
      Mounts: [
        { Source: workspace, Destination: '/work/source', RW: true },
        { Source: preparationHome, Destination: '/home/benchmark-empty', RW: true },
      ],
    };
    const expected = {
      imageDigest: IMAGE,
      network: 'none',
      workspace,
      siblingWorkspace,
      preparationHome,
      proxyAddress: null,
    };
    assert.equal(verifyPreparationInspect(inspect, expected), undefined);
    inspect.Mounts.push({
      Source: join(root, 'unexpected'),
      Destination: '/unexpected',
      RW: true,
    });
    assert.throws(
      () => verifyPreparationInspect(inspect, expected),
      /unexpected writable preparation mount/u,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('base preparation emits a canonical environment identity from the installed dependency tree', async () => {
  const root = await mkdtemp(join(tmpdir(), 'decantr-container-prepared-environment-'));
  try {
    await mkdir(join(root, 'node_modules', 'fixture'), { recursive: true });
    await writeFile(join(root, 'node_modules', 'fixture', 'index.js'), 'export {};\n');
    const base = { commit: '1'.repeat(40), tree: '2'.repeat(40) };
    const command = {
      id: 'install-dependencies',
      executable: 'npm',
      args: ['ci'],
      cwd: '.',
      timeoutMs: 10_000,
      network: 'dependency-registry',
      required: true,
    };
    const profile = {
      id: 'node-20.19.4-npm-10.8.2',
      benchmarkImage: { digest: IMAGE },
    };
    const request = {
      taskId: 'fixture.prepare-environment',
      environmentSpecFileSha256: '3'.repeat(64),
      environmentSubstanceSha256: '4'.repeat(64),
      runtimeMatrix: {
        matrixSha256: '5'.repeat(64),
        profiles: [profile],
      },
      profile,
      candidate: { base },
      environmentSpec: {
        base,
        lockfiles: [{ path: 'package-lock.json', sha256: '6'.repeat(64) }],
        preparation: [command],
      },
      roles: { base: { workspace: root } },
    };
    const attestation = await createPreparedBaseEnvironment({
      request,
      preparation: {
        steps: [
          {
            id: command.id,
            commandSha256: sha256Canonical(command),
            preparationNetwork: command.network,
            exitCode: 0,
            durationMs: 12,
            stdoutSha256: sha256ForTest('installed\n'),
            stderrSha256: sha256ForTest(''),
            endedAt: '2026-07-24T20:00:00Z',
          },
        ],
      },
    });
    assert.equal(attestation.taskId, request.taskId);
    assert.deepEqual(attestation.dependencyRoots, ['node_modules']);
    assert.ok(attestation.dependencyEntryCount > 0);
    assert.match(attestation.environmentSha256, /^[a-f0-9]{64}$/u);
    assert.match(attestation.attestationSha256, /^[a-f0-9]{64}$/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('host inspection accepts only the locked image, no-network mode, and isolated role mounts', async () => {
  const fixture = await makeInspectFixture();
  try {
    const runner = fakeInspectRunner(fixture.inspect);
    const evidence = await verifyRunningEvaluationContainer(runner, 'container-1', fixture.expected);
    assert.equal(evidence.value.Image, IMAGE);
    assert.deepEqual(runner.calls, [{ command: 'docker', args: ['inspect', 'container-1'] }]);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('host inspection rejects a container launched from the wrong image', async () => {
  const fixture = await makeInspectFixture();
  try {
    fixture.inspect.Image = `sha256:${'3'.repeat(64)}`;
    await assert.rejects(
      verifyRunningEvaluationContainer(fakeInspectRunner(fixture.inspect), 'container-2', fixture.expected),
      /image differs from locked digest/u,
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('host inspection rejects any evaluation network other than Docker none', async () => {
  const fixture = await makeInspectFixture();
  try {
    fixture.inspect.HostConfig.NetworkMode = 'bridge';
    await assert.rejects(
      verifyRunningEvaluationContainer(fakeInspectRunner(fixture.inspect), 'container-3', fixture.expected),
      /network mode must be none/u,
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('host inspection rejects a sibling role workspace mount', async () => {
  const fixture = await makeInspectFixture();
  try {
    fixture.inspect.Mounts.push({
      Source: fixture.expected.siblingWorkspace,
      Destination: '/sibling',
      RW: false,
    });
    await assert.rejects(
      verifyRunningEvaluationContainer(fakeInspectRunner(fixture.inspect), 'container-4', fixture.expected),
      /sibling workspace/u,
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('host inspection rejects writable overlays inside the source workspace', async () => {
  const fixture = await makeInspectFixture();
  try {
    const writableOutput = join(fixture.root, 'build-output');
    await mkdir(writableOutput);
    fixture.inspect.Mounts.push({
      Source: writableOutput,
      Destination: '/work/source/dist',
      RW: true,
    });
    await assert.rejects(
      verifyRunningEvaluationContainer(fakeInspectRunner(fixture.inspect), 'container-5', fixture.expected),
      /unexpected writable evaluation mount/u,
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('dependency allowlist is derived only from bound HTTPS lockfile sources plus fixed registries', async () => {
  const root = await mkdtemp(join(tmpdir(), 'decantr-container-allowlist-'));
  try {
    const lockfile = Buffer.from(
      'resolved: https://packages.example.org/archive/pkg.tgz\nother: https://registry.npmjs.org/pkg/-/pkg.tgz\n',
    );
    await writeFile(join(root, 'pnpm-lock.yaml'), lockfile);
    const allowlist = await deriveDependencyAllowlist(
      {
        lockfiles: [
          {
            path: 'pnpm-lock.yaml',
            sha256: sha256ForTest(lockfile),
          },
        ],
      },
      root,
    );
    assert.deepEqual(allowlist.derived, ['packages.example.org', 'registry.npmjs.org']);
    assert.ok(allowlist.fixed.includes('cdn.npmmirror.com'));
    assert.ok(allowlist.hosts.includes('registry.yarnpkg.com'));
    assert.ok(allowlist.hosts.includes('packages.example.org'));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('runner verification rejects untracked qualification controller sources', async () => {
  const root = await mkdtemp(join(tmpdir(), 'decantr-container-runner-'));
  try {
    const controllerRoot = join(root, 'scripts', 'benchmark-3-10', 'evaluators');
    const workflowRoot = join(root, '.github', 'workflows');
    await Promise.all([mkdir(controllerRoot, { recursive: true }), mkdir(workflowRoot, { recursive: true })]);
    await Promise.all([
      writeFile(join(controllerRoot, 'container-orchestrator.mjs'), 'export {};\n'),
      writeFile(join(workflowRoot, 'benchmark-3-10-evaluator-qualification.yml'), 'name: fixture\n'),
    ]);
    gitForTest(root, ['init', '--quiet']);
    gitForTest(root, ['config', 'user.name', 'Container Fixture']);
    gitForTest(root, ['config', 'user.email', 'fixture@example.invalid']);
    gitForTest(root, ['add', '.']);
    gitForTest(root, ['commit', '--quiet', '-m', 'controller']);
    const commit = gitForTest(root, ['rev-parse', 'HEAD']);
    assert.equal(await verifyRunnerCommit({ path: root, commit }, root), commit);

    await writeFile(join(controllerRoot, 'untracked-controller.mjs'), 'export const unsafe = true;\n');
    await assert.rejects(
      verifyRunnerCommit({ path: root, commit }, root),
      /controller tree differs/u,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('the execution-attestation schema is a strict Draft 2020-12 document', async () => {
  const schema = JSON.parse(
    await readFile(new URL('../schemas/container-execution-attestation.schema.json', import.meta.url), 'utf8'),
  );
  assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
  assert.equal(schema.additionalProperties, false);
  assert.equal(schema.properties.evaluation.properties.networkMode.const, 'none');
  assert.equal(schema.$defs.evaluationRole.properties.siblingWorkspaceVisible.const, false);
  assert.equal(
    schema.properties.preparation.properties.proxy.required.includes('readinessEvidence'),
    true,
  );
  assert.equal(
    schema.properties.preparation.required.includes('preparedEnvironment'),
    true,
  );
  assert.equal(schema.$defs.preparationStep.required.includes('dependencyRoot'), true);
});

async function makeInspectFixture() {
  const root = await mkdtemp(join(tmpdir(), 'decantr-container-inspect-'));
  const paths = {
    workspace: join(root, 'base'),
    siblingWorkspace: join(root, 'expected'),
    evaluatorRoot: join(root, 'evaluator'),
    contractPath: join(root, 'contract.json'),
    outputRoot: join(root, 'output'),
    controlRoot: join(root, 'control'),
  };
  await Promise.all([
    mkdir(paths.workspace),
    mkdir(paths.siblingWorkspace),
    mkdir(paths.evaluatorRoot),
    mkdir(paths.outputRoot),
    mkdir(paths.controlRoot),
    writeFile(paths.contractPath, '{}\n'),
  ]);
  const expected = {
    imageDigest: IMAGE,
    workspace: paths.workspace,
    siblingWorkspace: paths.siblingWorkspace,
    evaluatorRoot: paths.evaluatorRoot,
    contractPath: paths.contractPath,
    outputRoot: paths.outputRoot,
    controlRoot: paths.controlRoot,
  };
  const inspect = {
    Id: 'container-1',
    Image: IMAGE,
    Config: { Image: IMAGE },
    State: { Running: true },
    HostConfig: {
      NetworkMode: 'none',
      ReadonlyRootfs: true,
      CapDrop: ['ALL'],
      SecurityOpt: ['no-new-privileges'],
    },
    Mounts: [
      { Source: paths.workspace, Destination: '/work/source', RW: false },
      { Source: paths.evaluatorRoot, Destination: '/evaluator', RW: false },
      { Source: paths.contractPath, Destination: '/evidence/contract.json', RW: false },
      { Source: paths.outputRoot, Destination: '/evidence/output', RW: true },
      { Source: paths.controlRoot, Destination: '/evidence/control', RW: true },
    ],
  };
  return { root, expected, inspect };
}

function fakeInspectRunner(inspect) {
  const calls = [];
  return {
    calls,
    async run(command, args) {
      calls.push({ command, args });
      assert.equal(command, 'docker');
      assert.deepEqual(args.slice(0, 1), ['inspect']);
      return {
        exitCode: 0,
        signal: null,
        stdout: `${JSON.stringify([inspect])}\n`,
        stderr: '',
        errorCode: null,
      };
    },
  };
}

function sha256ForTest(value) {
  return createHash('sha256').update(value).digest('hex');
}

function gitForTest(cwd, args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
}
