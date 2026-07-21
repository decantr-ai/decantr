#!/usr/bin/env node

import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { canonicalizePackedTarball } from './canonical-package-tarball.mjs';

const scriptPath = fileURLToPath(import.meta.url);
const repoRoot = resolve(dirname(scriptPath), '..');
const oracleRoot = resolve(
  repoRoot,
  'fixtures/qualification/3.9/oracles/route-source',
);
const qualificationRoot = resolve(repoRoot, 'fixtures/qualification/3.9');
const packetPath = resolve(qualificationRoot, 'qualification-packet.json');
const missingEvidencePath = resolve(qualificationRoot, 'missing-evidence.json');
const releaseVersion = '3.9.1';
const requiredPackagePaths = {
  '@decantr/content': 'packages/content/package.json',
  '@decantr/registry': 'packages/registry/package.json',
  '@decantr/core': 'packages/core/package.json',
  '@decantr/verifier': 'packages/verifier/package.json',
  '@decantr/mcp-server': 'packages/mcp-server/package.json',
  '@decantr/cli': 'packages/cli/package.json',
};
const repositories = [
  {
    id: 'tanstack-start-dashboard',
    repository: 'https://github.com/Kiranism/tanstack-start-dashboard.git',
    commit: '433a5a073c944d25dcd59922b4de7193bde3c03e',
    option: 'tanstackRepo',
    targets: [
      {
        id: 'tanstack-start-dashboard',
        projectPath: '.',
        framework: 'TanStack Router',
      },
    ],
  },
  {
    id: 'bulletproof-react',
    repository: 'https://github.com/alan2207/bulletproof-react.git',
    commit: '9506629ed003a561c6627735480cce4994244bb4',
    option: 'bulletproofRepo',
    targets: [
      {
        id: 'bulletproof-react-vite',
        projectPath: 'apps/react-vite',
        framework: 'React Router',
      },
      {
        id: 'bulletproof-nextjs-app',
        projectPath: 'apps/nextjs-app',
        framework: 'Next.js App Router',
      },
      {
        id: 'bulletproof-nextjs-pages',
        projectPath: 'apps/nextjs-pages',
        framework: 'Next.js Pages Router',
      },
    ],
  },
  {
    id: 'angular-realworld',
    repository: 'https://github.com/gothinkster/angular-realworld-example-app.git',
    commit: 'dd99ed2cf39c805d719f943c5d7061a5683d98a8',
    option: 'angularRealworldRepo',
    lane: 'angular-brownfield',
    targets: [
      {
        id: 'angular-realworld',
        projectPath: '.',
        framework: 'Angular Router',
        expected: {
          packageName: 'angular-realworld',
          routeSignalCount: 14,
          taskableRouteCount: 10,
          componentCount: 18,
          excludedSourceCount: 7,
          styleApproach: 'css',
          routePaths: [
            '/',
            '/tag/:tag',
            '/login',
            '/register',
            '/settings',
            '/profile/:username',
            '/profile/:username/favorites',
            '/editor',
            '/editor/:slug',
            '/article/:slug',
          ],
          authorityFiles: [
            'src/app/app.config.ts',
            'src/app/app.routes.ts',
            'src/app/features/profile/profile.routes.ts',
            'src/main.ts',
          ],
        },
      },
    ],
  },
  {
    id: 'sakai-ng',
    repository: 'https://github.com/primefaces/sakai-ng.git',
    commit: '96d71496d685b5c110efd2875abaa2bf89a56ad2',
    option: 'sakaiRepo',
    lane: 'angular-brownfield',
    targets: [
      {
        id: 'sakai-ng',
        projectPath: '.',
        framework: 'Angular Router with PrimeNG',
        expected: {
          packageName: 'sakai-ng',
          routeSignalCount: 29,
          taskableRouteCount: 25,
          componentCount: 44,
          excludedSourceCount: 1,
          styleApproach: 'primeng-tailwind-scss',
          routePaths: [
            '/',
            '/uikit/button',
            '/uikit/charts',
            '/uikit/file',
            '/uikit/formlayout',
            '/uikit/input',
            '/uikit/list',
            '/uikit/media',
            '/uikit/message',
            '/uikit/misc',
            '/uikit/panel',
            '/uikit/timeline',
            '/uikit/table',
            '/uikit/overlay',
            '/uikit/tree',
            '/uikit/menu',
            '/documentation',
            '/pages/documentation',
            '/pages/crud',
            '/pages/empty',
            '/landing',
            '/notfound',
            '/auth/access',
            '/auth/error',
            '/auth/login',
          ],
          authorityFiles: [
            'src/app.config.ts',
            'src/app.routes.ts',
            'src/app/pages/auth/auth.routes.ts',
            'src/app/pages/pages.routes.ts',
            'src/app/pages/uikit/uikit.routes.ts',
            'src/main.ts',
          ],
        },
      },
    ],
  },
];

function parseArgs(argv) {
  const options = {
    outputDir: resolve(tmpdir(), 'decantr-3.9-route-qualification'),
    tanstackRepo: null,
    bulletproofRepo: null,
    angularRealworldRepo: null,
    sakaiRepo: null,
    generatedAt: null,
    json: false,
    keepWorkdir: false,
    sourceMode: 'pinned-public-repositories',
    skipBuild: false,
    writePacket: false,
    outputDirExplicit: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--output-dir') {
      options.outputDir = resolve(argv[++index] || '');
      options.outputDirExplicit = true;
    } else if (arg.startsWith('--output-dir=')) {
      options.outputDir = resolve(arg.slice(13));
      options.outputDirExplicit = true;
    }
    else if (arg === '--tanstack-repo') options.tanstackRepo = resolve(argv[++index] || '');
    else if (arg.startsWith('--tanstack-repo=')) options.tanstackRepo = resolve(arg.slice(16));
    else if (arg === '--bulletproof-repo')
      options.bulletproofRepo = resolve(argv[++index] || '');
    else if (arg.startsWith('--bulletproof-repo='))
      options.bulletproofRepo = resolve(arg.slice(19));
    else if (arg === '--angular-realworld-repo')
      options.angularRealworldRepo = resolve(argv[++index] || '');
    else if (arg.startsWith('--angular-realworld-repo='))
      options.angularRealworldRepo = resolve(arg.slice(25));
    else if (arg === '--sakai-repo') options.sakaiRepo = resolve(argv[++index] || '');
    else if (arg.startsWith('--sakai-repo=')) options.sakaiRepo = resolve(arg.slice(13));
    else if (arg === '--generated-at') options.generatedAt = argv[++index] || '';
    else if (arg.startsWith('--generated-at=')) options.generatedAt = arg.slice(15);
    else if (arg === '--source-mode') options.sourceMode = argv[++index] || '';
    else if (arg.startsWith('--source-mode=')) options.sourceMode = arg.slice(14);
    else if (arg === '--json') options.json = true;
    else if (arg === '--keep-workdir') options.keepWorkdir = true;
    else if (arg === '--skip-build') options.skipBuild = true;
    else if (arg === '--write-packet') options.writePacket = true;
    else if (arg === '--help' || arg === '-h') {
      process.stdout.write(`Usage: node scripts/run-3-9-route-qualification.mjs [options]\n\n`);
      process.stdout.write(`  --output-dir <path>       Artifact output directory\n`);
      process.stdout.write(`  --tanstack-repo <path>    Reuse the exact pinned TanStack checkout\n`);
      process.stdout.write(`  --bulletproof-repo <path> Reuse the exact pinned Bulletproof checkout\n`);
      process.stdout.write(`  --angular-realworld-repo <path> Reuse the pinned Angular RealWorld checkout\n`);
      process.stdout.write(`  --sakai-repo <path>       Reuse the exact pinned Sakai Angular checkout\n`);
      process.stdout.write(`  --generated-at <date>     Reproducible artifact timestamp\n`);
      process.stdout.write(`  --skip-build              Pack the existing six-package dist output\n`);
      process.stdout.write(`  --write-packet            Write artifact and completed route sections to the 3.9 packet\n`);
      process.stdout.write(`  --json                    Print the complete result\n`);
      process.exit(0);
    }
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (options.writePacket && !options.outputDirExplicit) {
    options.outputDir = resolve(qualificationRoot, 'evidence');
  }
  if (options.sourceMode !== 'pinned-public-repositories') {
    throw new Error('Only --source-mode pinned-public-repositories is supported.');
  }
  if (options.generatedAt && !Number.isFinite(Date.parse(options.generatedAt))) {
    throw new Error('--generated-at must be an ISO-8601 date-time.');
  }
  return options;
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map((entry) => stableJson(entry)).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .filter((key) => value[key] !== undefined)
      .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

function hashJson(value) {
  return sha256(stableJson(value));
}

export function createBehaviorEvidenceBinding(exactPackageTarballs, behavior) {
  const schemaVersion = 'decantr-behavior-evidence-binding.v1';
  return {
    schemaVersion,
    packageSetSha256: hashJson(exactPackageTarballs),
    behaviorSha256: hashJson(behavior),
    boundEvidenceSha256: hashJson({ schemaVersion, exactPackageTarballs, behavior }),
  };
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? repoRoot,
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 32 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || '').trim();
    throw new Error(`${command} ${args.join(' ')} failed (${result.status}): ${detail}`);
  }
  return result.stdout.trim();
}

function git(cwd, args) {
  return run('git', args, { cwd });
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function parsePackOutput(stdout, cwd) {
  const payload = JSON.parse(stdout.trim());
  const entry = Array.isArray(payload) ? payload[0] : payload;
  if (!entry?.filename) throw new Error('pnpm pack did not report a tarball filename.');
  return resolve(cwd, entry.filename);
}

function prepareCandidate(options, temporaryRoot) {
  const candidateRoot = resolve(temporaryRoot, 'candidate');
  const rawTarballDirectory = resolve(candidateRoot, 'raw-tarballs');
  const tarballDirectory = resolve(candidateRoot, 'tarballs');
  const consumerDirectory = resolve(candidateRoot, 'consumer');
  mkdirSync(rawTarballDirectory, { recursive: true });
  mkdirSync(tarballDirectory, { recursive: true });
  mkdirSync(consumerDirectory, { recursive: true });

  if (!options.skipBuild) {
    const filters = Object.keys(requiredPackagePaths).flatMap((name) => ['--filter', name]);
    run('pnpm', [...filters, 'build']);
  }

  const tarballPaths = {};
  for (const name of Object.keys(requiredPackagePaths)) {
    const rawTarball = parsePackOutput(
      run('pnpm', [
        '--filter',
        name,
        'pack',
        '--pack-destination',
        rawTarballDirectory,
        '--json',
      ]),
      repoRoot,
    );
    tarballPaths[name] = canonicalizePackedTarball(
      rawTarball,
      name,
      candidateRoot,
      tarballDirectory,
    );
  }
  writeJson(resolve(consumerDirectory, 'package.json'), {
    name: 'decantr-3-9-route-qualification-consumer',
    private: true,
    type: 'module',
    dependencies: Object.fromEntries(
      Object.entries(tarballPaths).map(([name, path]) => [name, `file:${path}`]),
    ),
  });
  run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund'], {
    cwd: consumerDirectory,
  });

  const exactPackageVersions = Object.fromEntries(
    Object.keys(requiredPackagePaths).map((name) => {
      const manifest = readJson(
        resolve(consumerDirectory, 'node_modules', ...name.split('/'), 'package.json'),
      );
      if (manifest.version !== releaseVersion) {
        throw new Error(`${name} packed version must be ${releaseVersion}; received ${manifest.version}.`);
      }
      return [name, manifest.version];
    }),
  );
  return {
    exactPackageVersions,
    exactPackageTarballs: Object.fromEntries(
      Object.entries(tarballPaths).map(([name, path]) => [
        name,
        { file: basename(path), sha256: sha256(readFileSync(path)) },
      ]),
    ),
    verifierEntrypoint: resolve(
      consumerDirectory,
      'node_modules',
      '@decantr',
      'verifier',
      'dist',
      'index.js',
    ),
  };
}

function walkFiles(root, current = root) {
  const files = [];
  for (const entry of readdirSync(current).sort()) {
    const absolute = resolve(current, entry);
    const stat = statSync(absolute);
    if (stat.isDirectory()) files.push(...walkFiles(root, absolute));
    else if (stat.isFile()) files.push(absolute);
  }
  return files;
}

function hashTree(root) {
  const files = walkFiles(root).map((absolute) => ({
    path: relative(root, absolute).replaceAll('\\', '/'),
    sha256: sha256(readFileSync(absolute)),
  }));
  return {
    sha256: sha256(files.map((file) => `${file.path}\0${file.sha256}\n`).join('')),
    files,
  };
}

function acquireRepository(config, options, temporaryRoot) {
  const provided = options[config.option];
  const root = provided || resolve(temporaryRoot, config.id);
  if (!provided) {
    mkdirSync(root, { recursive: true });
    run('git', ['init', '--quiet', root]);
    git(root, ['remote', 'add', 'origin', config.repository]);
    git(root, ['fetch', '--quiet', '--depth=1', 'origin', config.commit]);
    git(root, ['checkout', '--quiet', '--detach', 'FETCH_HEAD']);
  }
  if (!existsSync(resolve(root, '.git'))) {
    throw new Error(`Pinned source is not a Git checkout: ${root}`);
  }
  const actualCommit = git(root, ['rev-parse', 'HEAD']);
  if (actualCommit !== config.commit) {
    throw new Error(`${config.id} expected ${config.commit}, received ${actualCommit}`);
  }
  return root;
}

function gitBlob(repo, commit, sourcePath) {
  const output = git(repo, ['ls-tree', commit, '--', sourcePath]);
  const match = output.match(/^\d+\s+blob\s+([a-f0-9]{40,64})\t/u);
  if (!match) throw new Error(`No Git blob at ${commit}:${sourcePath}`);
  const blobHash = match[1];
  const workingBlob = git(repo, ['hash-object', sourcePath]);
  if (workingBlob !== blobHash) {
    throw new Error(`Working source differs from pinned blob: ${sourcePath}`);
  }
  return blobHash;
}

function orderedSources(discovery, route) {
  const selected = discovery.routes.taskableRoutes.find((item) => item.path === route.path);
  if (!selected || selected.file !== route.file) {
    throw new Error(`Verifier taskable-route selection changed for ${route.path}`);
  }
  const candidates = [
    ...new Set(
      discovery.routes.routeSignals
        .filter((signal) => signal.path === route.path && signal.taskable)
        .map((signal) => signal.file),
    ),
  ];
  return [selected.file, ...candidates.filter((file) => file !== selected.file).sort()];
}

function publicCaseId(targetId, sourcePath) {
  return `route-public-${targetId}-${sha256(sourcePath).slice(0, 12)}`;
}

function publicCasesForTarget(config, target, repo, discoverProject) {
  const appRoot = resolve(repo, target.projectPath);
  if (!existsSync(appRoot)) throw new Error(`Pinned app root is missing: ${target.projectPath}`);
  const discovery = discoverProject(appRoot);
  const routes = [...discovery.routes.taskableRoutes].sort(
    (left, right) => left.file.localeCompare(right.file) || left.path.localeCompare(right.path),
  );
  const cases = routes.map((route) => {
    const sourcePath = join(target.projectPath, route.file)
      .replaceAll('\\', '/')
      .replace(/^\.\//u, '');
    const blobHash = gitBlob(repo, config.commit, sourcePath);
    const id = publicCaseId(target.id, sourcePath);
    return {
      id,
      clusterId: id,
      lane: 'brownfield',
      targetId: target.id,
      framework: target.framework,
      route: route.path,
      expectedOutputs: {
        exhaustive: true,
        orderedSources: orderedSources(discovery, route),
        requiredFirstSource: route.file,
        forbiddenFirstSources: [],
      },
      sourceEvidence: {
        kind: 'source-snapshot',
        repository: config.repository,
        commit: config.commit,
        sourcePath,
        blobHash,
      },
    };
  });
  return {
    target: {
      id: target.id,
      projectPath: target.projectPath,
      framework: target.framework,
      discoveryStrategy: discovery.routes.strategy,
      routeSignalCount: discovery.routes.routeSignalCount,
      taskableRouteCount: discovery.routes.taskableRouteCount,
      sourceBlobCount: cases.length,
    },
    cases,
  };
}

const EXCLUDED_ANGULAR_SOURCE_RE =
  /(?:^|\/)(?:__tests__|e2e|fixtures?|mocks?|tests?)(?:\/|$)|\.(?:cy|e2e|spec|test|vitest)\.[cm]?[jt]sx?$/iu;

function angularBrownfieldEvidenceForTarget(config, target, repo, discoverProject) {
  const appRoot = resolve(repo, target.projectPath);
  if (!existsSync(appRoot)) throw new Error(`Pinned Angular app root is missing: ${target.projectPath}`);
  const discovery = discoverProject(appRoot);
  const routePaths = discovery.routes.taskableRoutes.map((route) => route.path);
  const expected = target.expected;
  const actualContract = {
    packageName: discovery.project.packageName,
    routeSignalCount: discovery.routes.routeSignalCount,
    taskableRouteCount: discovery.routes.taskableRouteCount,
    componentCount: discovery.components.componentCount,
    excludedSourceCount: discovery.routes.excludedSourceCount,
    styleApproach: discovery.styling.approach,
    routePaths,
    authorityFiles: discovery.routes.authorityFiles,
  };
  if (stableJson(actualContract) !== stableJson(expected)) {
    throw new Error(
      `${target.id} Angular discovery contract changed:\n${JSON.stringify({ expected, actual: actualContract }, null, 2)}`,
    );
  }
  if (
    discovery.project.framework !== 'angular' ||
    discovery.routes.strategy !== 'angular-router' ||
    discovery.routes.authority !== 'proven' ||
    discovery.routes.completeness !== 'complete' ||
    discovery.routes.confidence !== 'high' ||
    discovery.styling.confidence !== 'high' ||
    discovery.confidence.level !== 'high' ||
    discovery.confidence.score !== 98
  ) {
    throw new Error(`${target.id} did not retain high-confidence, complete Angular authority.`);
  }
  if (
    discovery.routes.taskableRoutes.some(
      (route) => route.confidence !== 'high' || EXCLUDED_ANGULAR_SOURCE_RE.test(route.file),
    )
  ) {
    throw new Error(`${target.id} selected a low-confidence or excluded task route source.`);
  }

  const routeSourceFiles = [...new Set(discovery.routes.taskableRoutes.map((route) => route.file))]
    .sort()
    .map((sourcePath) => ({ sourcePath, blobHash: gitBlob(repo, config.commit, sourcePath) }));
  const authorityFiles = discovery.routes.authorityFiles.map((sourcePath) => ({
    sourcePath,
    blobHash: gitBlob(repo, config.commit, sourcePath),
  }));
  return {
    id: target.id,
    repository: config.repository,
    commit: config.commit,
    projectPath: target.projectPath,
    framework: target.framework,
    packageName: discovery.project.packageName,
    routeStrategy: discovery.routes.strategy,
    routeAuthority: discovery.routes.authority,
    routeCompleteness: discovery.routes.completeness,
    routeConfidence: discovery.routes.confidence,
    routeSignalCount: discovery.routes.routeSignalCount,
    taskableRouteCount: discovery.routes.taskableRouteCount,
    routePaths,
    routeSources: routeSourceFiles,
    authorityFiles,
    excludedSourceCount: discovery.routes.excludedSourceCount,
    componentCount: discovery.components.componentCount,
    componentConfidence: discovery.components.confidence,
    styleApproach: discovery.styling.approach,
    styleConfidence: discovery.styling.confidence,
    confidenceScore: discovery.confidence.score,
    projectEvidence: discovery.project.evidence,
    routeEvidence: discovery.routes.evidence,
    styleEvidence: discovery.styling.evidence,
    limitations: discovery.limitations,
  };
}

function loadOracleCases() {
  const runnerPath = resolve(oracleRoot, 'run-oracle.mjs');
  const capturedPath = resolve(oracleRoot, 'captured-output.json');
  if (!existsSync(capturedPath)) {
    throw new Error(`Oracle capture is missing: ${capturedPath}`);
  }
  const execution = spawnSync(process.execPath, [runnerPath], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 32 * 1024 * 1024,
  });
  if (execution.error) throw execution.error;
  if (execution.status !== 0) {
    throw new Error(`Executable oracle failed (${execution.status}): ${execution.stderr.trim()}`);
  }
  const captured = readFileSync(capturedPath, 'utf8');
  if (execution.stdout !== captured) {
    throw new Error(
      'Executable oracle output differs from captured-output.json; rebuild verifier behavior or refresh the reviewed capture.',
    );
  }
  const payload = JSON.parse(captured);
  if (
    payload.schemaVersion !== 'decantr-route-source-oracle-output.v1' ||
    payload.oracle?.competitionCount !== 24 ||
    payload.oracle?.standaloneCount !== 11 ||
    payload.oracle?.implementationFileCount !== 59 ||
    payload.oracle?.distinctImplementationHashCount !== 59 ||
    payload.cases?.length !== 35
  ) {
    throw new Error('Executable oracle capture has an invalid shape or case count.');
  }
  const oraclePath = relative(repoRoot, runnerPath).replaceAll('\\', '/');
  const capturedOutputPath = relative(repoRoot, capturedPath).replaceAll('\\', '/');
  const sourceEvidence = {
    kind: 'executable-oracle',
    workingDirectory: '.',
    command: ['node', oraclePath],
    expectedExitCode: 0,
    oraclePath,
    oracleSha256: sha256(readFileSync(runnerPath)),
    capturedOutputPath,
    capturedOutputSha256: sha256(readFileSync(capturedPath)),
  };
  const cases = payload.cases.map((item) => ({
    id: item.id,
    clusterId: item.clusterId,
    lane: 'greenfield',
    targetId: 'route-source-executable-oracle',
    framework: 'React Router',
    route: item.route,
    expectedOutputs: {
      exhaustive: true,
      orderedSources: item.orderedSources,
      requiredFirstSource: item.requiredFirstSource,
      forbiddenFirstSources: item.forbiddenFirstSources,
    },
    sourceEvidence,
  }));
  return { payload, cases, sourceEvidence };
}

function assertCorpus(cases) {
  const forbiddenCount = cases.reduce(
    (sum, item) => sum + item.expectedOutputs.forbiddenFirstSources.length,
    0,
  );
  const ids = new Set(cases.map((item) => item.id));
  const selectedSources = new Set(
    cases.map(
      (item) =>
        `${item.targetId}\0${item.sourceEvidence.kind}\0${item.expectedOutputs.requiredFirstSource}`,
    ),
  );
  if (cases.length !== 84 || ids.size !== 84) {
    throw new Error(`Route corpus must contain 84 unique cases; received ${cases.length}/${ids.size}.`);
  }
  if (forbiddenCount !== 24) {
    throw new Error(`Route corpus must contain 24 forbidden-first assertions; received ${forbiddenCount}.`);
  }
  if (selectedSources.size !== 84) {
    throw new Error('Every qualification case must select a distinct target/source implementation.');
  }
  for (const item of cases) {
    if (
      item.expectedOutputs.exhaustive !== true ||
      item.expectedOutputs.orderedSources[0] !== item.expectedOutputs.requiredFirstSource
    ) {
      throw new Error(`Non-exhaustive or misordered route case: ${item.id}`);
    }
    for (const forbidden of item.expectedOutputs.forbiddenFirstSources) {
      if (
        forbidden.source === item.expectedOutputs.requiredFirstSource ||
        !item.expectedOutputs.orderedSources.includes(forbidden.source)
      ) {
        throw new Error(`Forbidden source did not genuinely compete: ${item.id}`);
      }
    }
  }
}

function frozenCorpusDefinition(corpus) {
  return {
    status: corpus.status,
    requiredPositiveCaseCount: corpus.requiredPositiveCaseCount,
    requiredForbiddenAssertionCount: corpus.requiredForbiddenAssertionCount,
    cases: corpus.cases.map((item) => ({
      ...item,
      sourceEvidence:
        item.sourceEvidence.kind === 'executable-oracle'
          ? {
              kind: item.sourceEvidence.kind,
              workingDirectory: item.sourceEvidence.workingDirectory,
              command: item.sourceEvidence.command,
              expectedExitCode: item.sourceEvidence.expectedExitCode,
              oraclePath: item.sourceEvidence.oraclePath,
              capturedOutputPath: item.sourceEvidence.capturedOutputPath,
            }
          : item.sourceEvidence,
    })),
  };
}

function artifactPathValue(path) {
  const relation = relative(repoRoot, path).replaceAll('\\', '/');
  return !isAbsolute(relation) && !relation.startsWith('../') ? relation : path;
}

const options = parseArgs(process.argv.slice(2));
const temporaryRoot = mkdtempSync(join(tmpdir(), 'decantr-route-qualification-'));
try {
  const candidate = prepareCandidate(options, temporaryRoot);
  const workspaceVerifierEntrypoint = resolve(repoRoot, 'packages/verifier/dist/index.js');
  if (
    !existsSync(workspaceVerifierEntrypoint) ||
    sha256(readFileSync(workspaceVerifierEntrypoint)) !==
      sha256(readFileSync(candidate.verifierEntrypoint))
  ) {
    throw new Error('Executable oracle and route replay verifier bytes are not identical.');
  }
  const verifierModule = await import(pathToFileURL(candidate.verifierEntrypoint).href);
  if (typeof verifierModule.discoverProject !== 'function') {
    throw new Error('The packed @decantr/verifier does not export discoverProject().');
  }
  const publicCases = [];
  const publicProvenance = [];
  const angularBrownfieldTargets = [];
  for (const config of repositories) {
    const sourceRoot = acquireRepository(config, options, temporaryRoot);
    if (config.lane === 'angular-brownfield') {
      for (const target of config.targets) {
        angularBrownfieldTargets.push(
          angularBrownfieldEvidenceForTarget(
            config,
            target,
            sourceRoot,
            verifierModule.discoverProject,
          ),
        );
      }
      continue;
    }
    const targets = [];
    for (const target of config.targets) {
      const result = publicCasesForTarget(
        config,
        target,
        sourceRoot,
        verifierModule.discoverProject,
      );
      publicCases.push(...result.cases);
      targets.push(result.target);
    }
    publicProvenance.push({
      id: config.id,
      repository: config.repository,
      commit: config.commit,
      targets,
      sourceBlobCount: targets.reduce((sum, target) => sum + target.sourceBlobCount, 0),
    });
  }
  if (publicCases.length !== 49) {
    throw new Error(
      `Pinned public repositories expose 49 distinct verifier-selected routes; received ${publicCases.length}.`,
    );
  }
  const distinctPublicBlobCount = new Set(
    publicCases.map((item) => item.sourceEvidence.blobHash),
  ).size;
  if (distinctPublicBlobCount !== 49) {
    throw new Error(
      `Pinned public positives must resolve to 49 distinct Git blobs; received ${distinctPublicBlobCount}.`,
    );
  }
  const angularBrownfield = {
    status: 'complete',
    targetCount: angularBrownfieldTargets.length,
    routeSignalCount: angularBrownfieldTargets.reduce(
      (sum, target) => sum + target.routeSignalCount,
      0,
    ),
    taskableRouteCount: angularBrownfieldTargets.reduce(
      (sum, target) => sum + target.taskableRouteCount,
      0,
    ),
    componentCount: angularBrownfieldTargets.reduce(
      (sum, target) => sum + target.componentCount,
      0,
    ),
    sourceBlobCount: angularBrownfieldTargets.reduce(
      (sum, target) => sum + target.routeSources.length + target.authorityFiles.length,
      0,
    ),
    targets: angularBrownfieldTargets,
  };
  if (
    angularBrownfield.targetCount !== 2 ||
    angularBrownfield.routeSignalCount !== 43 ||
    angularBrownfield.taskableRouteCount !== 35 ||
    angularBrownfield.componentCount !== 62
  ) {
    throw new Error('Pinned Angular Brownfield replay did not satisfy the frozen 2/43/35/62 contract.');
  }

  const oracle = loadOracleCases();
  const cases = [...oracle.cases, ...publicCases];
  assertCorpus(cases);

  const routeCorpus = {
    status: 'complete',
    requiredPositiveCaseCount: 84,
    requiredForbiddenAssertionCount: 24,
    cases,
  };
  const frozenPacket = readJson(packetPath);
  if (
    frozenPacket.routeCorpus?.status === 'complete' &&
    frozenPacket.routeCorpus?.cases?.length > 0 &&
    stableJson(frozenCorpusDefinition(frozenPacket.routeCorpus)) !==
      stableJson(frozenCorpusDefinition(routeCorpus))
  ) {
    throw new Error('Fresh route discovery does not exactly match the frozen 84-case corpus.');
  }
  const routeCorpusSha256 = hashJson(routeCorpus);
  const replayCases = cases.map((item) => ({
    caseId: item.id,
    clusterId: item.clusterId,
    exhaustive: true,
    orderedSources: item.expectedOutputs.orderedSources,
  }));
  const generatedAt = new Date(
    options.generatedAt || git(repoRoot, ['show', '-s', '--format=%cI', 'HEAD']),
  ).toISOString();
  const verifierTree = hashTree(dirname(candidate.verifierEntrypoint));
  const sourceCommit = git(repoRoot, ['rev-parse', 'HEAD']);
  const harnessSha256 = sha256(readFileSync(scriptPath));
  const command = [
    'node',
    'scripts/run-3-9-route-qualification.mjs',
    '--source-mode',
    'pinned-public-repositories',
    '--generated-at',
    generatedAt,
  ];
  const environment = {
    os: process.platform,
    cpu: process.arch,
    nodeVersion: process.version,
    packageManagerVersion: run('pnpm', ['--version']),
    exactSourceRef: `git:${sourceCommit};verifier-dist-sha256:${verifierTree.sha256};harness-sha256:${harnessSha256};package-set-sha256:${hashJson(candidate.exactPackageTarballs)}`,
    exactPackageVersions: candidate.exactPackageVersions,
    exactPackageTarballs: candidate.exactPackageTarballs,
  };
  const artifactPayload = {
    schemaVersion: 'decantr-route-replay-artifact.v1',
    generatedAt,
    command,
    exitCode: 0,
    environment,
    releaseVersion,
    routeCorpusSha256,
    cases: replayCases,
    routeCorpus,
    angularBrownfield,
    provenance: {
      harness: {
        path: relative(repoRoot, scriptPath).replaceAll('\\', '/'),
        sha256: harnessSha256,
      },
      verifier: {
        package: '@decantr/verifier',
        version: candidate.exactPackageVersions['@decantr/verifier'],
        entrypoint: '@decantr/verifier/dist/index.js',
        entrypointSha256: sha256(readFileSync(candidate.verifierEntrypoint)),
        distTreeSha256: verifierTree.sha256,
      },
      executableOracle: {
        ...oracle.sourceEvidence,
        fixtureTreeSha256: oracle.payload.oracle.fixtureTreeSha256,
        competitionCount: 24,
        standaloneCount: 11,
      },
      publicRepositories: publicProvenance,
      coverage: {
        totalCaseCount: 84,
        forbiddenFirstAssertionCount: 24,
        distinctPublicSourceBlobCount: distinctPublicBlobCount,
        requestedPublicPositiveCount: 60,
        feasiblePublicPositiveCountAtPinnedRefs: 49,
        distinctOracleCompetitionCount: 24,
        distinctOracleStandaloneCount: 11,
        paddingUsed: false,
        note:
          'The two frozen public repositories expose 49 distinct verifier-selected route implementations across four real app roots. Eleven distinct standalone oracle routes fill the 84-case gate without duplicating public implementations.',
      },
      reproducibility: {
        generatedAtSource: options.generatedAt ? 'explicit-command-input' : 'source-commit-time',
        sourceMode: options.sourceMode,
      },
    },
  };
  artifactPayload.behaviorBinding = createBehaviorEvidenceBinding(
    environment.exactPackageTarballs,
    { routeCorpusSha256, cases: replayCases, angularBrownfield },
  );
  const artifactContents = `${JSON.stringify(artifactPayload, null, 2)}\n`;
  const artifactSha256 = sha256(artifactContents);
  mkdirSync(options.outputDir, { recursive: true });
  const artifactFile = `decantr-route-replay-artifact.v1.${artifactSha256}.json`;
  const artifactPath = resolve(options.outputDir, artifactFile);
  writeFileSync(artifactPath, artifactContents);

  const artifact = {
    path: artifactPathValue(artifactPath),
    sha256: artifactSha256,
    mediaType: 'application/json',
    generatedAt,
    command,
    exitCode: 0,
    environment,
    behaviorBinding: artifactPayload.behaviorBinding,
  };
  const result = {
    schemaVersion: 'decantr-route-qualification-result.v1',
    artifact,
    routeCorpus,
    routeReplay: {
      status: 'complete',
      releaseVersion,
      corpusSha256: routeCorpusSha256,
      artifact,
      cases: replayCases,
      angularBrownfield,
    },
    coverage: artifactPayload.provenance.coverage,
  };
  if (options.writePacket) {
    if (isAbsolute(artifact.path) || artifact.path.startsWith('../')) {
      throw new Error('--write-packet requires an artifact path inside the repository.');
    }
    const packet = readJson(packetPath);
    if (
      packet.routeCorpus?.status === 'complete' &&
      packet.routeCorpus?.cases?.length > 0 &&
      stableJson(frozenCorpusDefinition(packet.routeCorpus)) !==
        stableJson(frozenCorpusDefinition(routeCorpus))
    ) {
      throw new Error('Refusing to replace the frozen route corpus during packet update.');
    }
    packet.routeCorpus = routeCorpus;
    packet.routeReplay = result.routeReplay;
    writeJson(packetPath, packet);

    const missingEvidence = readJson(missingEvidencePath);
    const completed = new Set(['QUALIFIED_ROUTE_CORPUS', 'CANDIDATE_390_ROUTE_REPLAY']);
    missingEvidence.items = missingEvidence.items.filter((item) => !completed.has(item.id));
    writeJson(missingEvidencePath, missingEvidence);
  }
  if (options.json) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  else {
    process.stdout.write(
      [
        `Route qualification artifact: ${artifactPath}`,
        `SHA-256: ${artifactSha256}`,
        'Cases: 84 (49 pinned public blobs, 24 competing oracle routes, 11 standalone oracle routes)',
        'Forbidden-first assertions: 24',
        'Angular Brownfield supplement: 2 pinned apps, 43 route signals, 35 taskable routes, 62 components',
      ].join('\n') + '\n',
    );
  }
} finally {
  if (!options.keepWorkdir) rmSync(temporaryRoot, { recursive: true, force: true });
  else process.stderr.write(`Retained source workdir: ${temporaryRoot}\n`);
}
