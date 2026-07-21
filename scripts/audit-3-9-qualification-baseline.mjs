#!/usr/bin/env node

import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
} from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { basename, dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { fileURLToPath } from 'node:url';
import { canonicalizePackedTarball } from './canonical-package-tarball.mjs';

const EXPECTED_PACKAGE_VERSIONS = {
  '@decantr/content': '3.8.1',
  '@decantr/registry': '3.8.1',
  '@decantr/core': '3.8.2',
  '@decantr/verifier': '3.8.3',
  '@decantr/mcp-server': '3.8.3',
  '@decantr/cli': '3.8.3',
  '@decantr/essence-spec': '3.8.1',
  '@decantr/css': '3.8.1',
  '@decantr/telemetry': '3.8.1',
  '@decantr/vite-plugin': '0.1.1',
};

const EXPECTED_PUBLIC_383_REPLAY_VERSIONS = {
  '@decantr/verifier': '3.8.3',
  '@decantr/mcp-server': '3.8.3',
  '@decantr/cli': '3.8.3',
};

const EXPECTED_CANDIDATE_390_REPLAY_VERSIONS = {
  '@decantr/content': '3.9.4',
  '@decantr/registry': '3.9.4',
  '@decantr/core': '3.9.4',
  '@decantr/verifier': '3.9.4',
  '@decantr/mcp-server': '3.9.4',
  '@decantr/cli': '3.9.4',
};

const CANDIDATE_PACKAGE_WAVE = Object.keys(EXPECTED_CANDIDATE_390_REPLAY_VERSIONS);

const EXPECTED_SCHEMA_IDS = [
  'https://decantr.ai/schemas/scan-report.v2.json',
  'https://decantr.ai/schemas/verification-report.common.v2.json',
  'https://decantr.ai/schemas/project-health-report.v2.json',
  'https://decantr.ai/schemas/decantr-ci-report.v2.json',
  'https://decantr.ai/schemas/workspace-health-report.v2.json',
  'https://decantr.ai/schemas/evidence-bundle.v2.json',
  'https://decantr.ai/schemas/runtime-probe-payload.v2.json',
  'https://decantr.ai/schemas/loop-readiness.v2.json',
  'https://decantr.ai/schemas/authority-resolution.v2.json',
  'https://decantr.ai/schemas/proof-field-report.v2.json',
];

const EXPECTED_MCP_TOOLS = [
  { name: 'decantr_project', actions: ['state', 'workspace_health'] },
  {
    name: 'decantr_contract',
    actions: ['read_essence', 'validate', 'check_drift', 'create_essence', 'capsule'],
  },
  {
    name: 'decantr_context',
    actions: ['scaffold', 'section', 'page', 'task', 'execution_pack'],
  },
  { name: 'decantr_graph', actions: ['snapshot', 'query', 'traverse'] },
  {
    name: 'decantr_registry',
    actions: [
      'search',
      'resolve_pattern',
      'resolve_archetype',
      'resolve_blueprint',
      'suggest_patterns',
      'showcase_benchmarks',
      'intelligence_summary',
      'compile_execution_packs',
    ],
  },
  {
    name: 'decantr_verify',
    actions: ['audit_project', 'critique', 'findings', 'evidence_bundle', 'health_loop'],
  },
  {
    name: 'decantr_repair',
    actions: ['findings', 'repair_plan', 'repair_prompt', 'health_loop'],
  },
  { name: 'decantr_contract_write', actions: ['accept_drift', 'update_essence'] },
];

const EXPECTED_TARGET_IDS = [
  'tanstack-start-dashboard',
  'bulletproof-react-vite',
  'tanstack-start-greenfield',
];

const EXPECTED_ANGULAR_BROWNFIELD_TARGETS = {
  'angular-realworld': {
    repository: 'https://github.com/gothinkster/angular-realworld-example-app.git',
    commit: 'dd99ed2cf39c805d719f943c5d7061a5683d98a8',
    packageName: 'angular-realworld',
    routeSignalCount: 14,
    taskableRouteCount: 10,
    componentCount: 18,
    excludedSourceCount: 7,
    routeSourceCount: 7,
    authorityFileCount: 4,
    styleApproach: 'css',
    routePathsSha256: '55b540c0a2d376792eab52bdb2f61e646ace24d19cf7f760480e06e50783a933',
    authorityPathsSha256: '0239d8f454493322d8a5ea8b28f4f282295e439a9ac1b2828079b64e2627453f',
  },
  'sakai-ng': {
    repository: 'https://github.com/primefaces/sakai-ng.git',
    commit: '96d71496d685b5c110efd2875abaa2bf89a56ad2',
    packageName: 'sakai-ng',
    routeSignalCount: 29,
    taskableRouteCount: 25,
    componentCount: 44,
    excludedSourceCount: 1,
    routeSourceCount: 24,
    authorityFileCount: 6,
    styleApproach: 'primeng-tailwind-scss',
    routePathsSha256: 'c4e9a289f16bd9720d635876ec5d107226ea05c07dfbc749bae4be74b4bbdb60',
    authorityPathsSha256: '79be1a043b14ff864ec96cd4a7b6b3a0d4249b29ccefc66f6f8d79cb39b6203b',
  },
};

const MACHINE_COMMAND_GATES = {
  'scan-latency': 2_000,
  'contract-only-attach-latency': 10_000,
  'task-preparation-latency': 2_000,
};

const MISSING_REQUIREMENTS = [
  {
    id: 'HUMAN_REVIEW_IDENTITIES',
    test: (packet) => hasHumanReviewers(packet),
  },
  {
    id: 'HUMAN_ADJUDICATED_FINDING_CORPUS',
    test: (packet) => hasFindingCorpus(packet),
  },
  {
    id: 'QUALIFIED_ROUTE_CORPUS',
    test: (packet) => hasRouteCorpus(packet),
  },
  {
    id: 'PUBLIC_383_FINDING_REPLAY',
    test: (packet) => hasFindingReplay(packet, 'public383'),
  },
  {
    id: 'CANDIDATE_390_FINDING_REPLAY',
    test: (packet) => hasFindingReplay(packet, 'candidate390'),
  },
  {
    id: 'CANDIDATE_390_ROUTE_REPLAY',
    test: (packet) => hasRouteReplay(packet),
  },
  {
    id: 'ADOPTION_BOUNDARY_REPLAY',
    test: (packet) => hasAdoptionBoundaryReplay(packet),
  },
  {
    id: 'MACHINE_QUALIFICATION_REPLAY',
    test: (packet) => hasMachineReplay(packet),
  },
];

function parseArgs(argv) {
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const options = {
    repoRoot: resolve(scriptDir, '..'),
    fixturesDir: null,
    json: false,
    lintOnly: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--') continue;
    if (arg === '--json') options.json = true;
    else if (arg === '--lint-only') options.lintOnly = true;
    else if (arg === '--repo-root') options.repoRoot = resolve(argv[++index] || '');
    else if (arg.startsWith('--repo-root=')) options.repoRoot = resolve(arg.slice(12));
    else if (arg === '--fixtures-dir') options.fixturesDir = resolve(argv[++index] || '');
    else if (arg.startsWith('--fixtures-dir=')) options.fixturesDir = resolve(arg.slice(15));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  options.fixturesDir ??= resolve(options.repoRoot, 'fixtures', 'qualification', '3.9');
  return options;
}

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function deepEqual(left, right) {
  return isDeepStrictEqual(left, right);
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

function artifactBehavior(payload, kind) {
  if (kind === 'finding') {
    return { release: payload.release, cases: payload.cases, metrics: payload.metrics };
  }
  if (kind === 'route') {
    return {
      routeCorpusSha256: payload.routeCorpusSha256,
      cases: payload.cases,
      angularBrownfield: payload.angularBrownfield,
    };
  }
  if (kind === 'adoption-boundary') return { targets: payload.targets };
  return {
    latencySamples: payload.latencySamples,
    targetResults: payload.targetResults,
    mcp: payload.mcp,
    v2Compatibility: payload.v2Compatibility,
    reportCompatibility: payload.reportCompatibility,
    workspaceCi: payload.workspaceCi,
  };
}

function unique(values) {
  return [...new Set(values)];
}

function array(value) {
  return Array.isArray(value) ? value : [];
}

export function outputKey(output) {
  if (
    !isRecord(output) ||
    typeof output.source !== 'string' ||
    output.source.length === 0 ||
    !['finding-id', 'diagnostic-code'].includes(output.codeKind) ||
    typeof output.code !== 'string' ||
    output.code.length === 0
  ) {
    return null;
  }
  return `${output.source}|${output.codeKind}|${output.code}`;
}

function isContained(root, path) {
  const relation = relative(root, path);
  return relation === '' || (!relation.startsWith('..') && !isAbsolute(relation));
}

function readContainedFile(repoRoot, path, label, errors) {
  if (typeof path !== 'string' || isAbsolute(path) || path.split(/[\\/]+/u).includes('..')) {
    errors.push(`${label} path must be repository-relative`);
    return null;
  }
  const absolutePath = resolve(repoRoot, path);
  if (!isContained(repoRoot, absolutePath) || !existsSync(absolutePath)) {
    errors.push(`${label} file does not exist: ${path}`);
    return null;
  }
  const realPath = realpathSync(absolutePath);
  if (!isContained(realpathSync(repoRoot), realPath)) {
    errors.push(`${label} path escapes the repository through a symbolic link: ${path}`);
    return null;
  }
  if (!statSync(realPath).isFile()) {
    errors.push(`${label} path is not a file: ${path}`);
    return null;
  }
  return { absolutePath: realPath, contents: readFileSync(realPath) };
}

export function validateExecutableOracleEvidence({ repoRoot, sourceEvidence, execute }) {
  const errors = [];
  let workingDirectory = null;
  const declaredWorkingDirectory = sourceEvidence?.workingDirectory;
  if (
    typeof declaredWorkingDirectory !== 'string' ||
    isAbsolute(declaredWorkingDirectory) ||
    declaredWorkingDirectory.split(/[\\/]+/u).includes('..')
  ) {
    errors.push('workingDirectory must be repository-relative');
  } else {
    const candidate = resolve(repoRoot, declaredWorkingDirectory);
    if (
      !isContained(repoRoot, candidate) ||
      !existsSync(candidate) ||
      !statSync(candidate).isDirectory()
    ) {
      errors.push('workingDirectory does not identify a contained directory');
    } else {
      const realDirectory = realpathSync(candidate);
      if (!isContained(realpathSync(repoRoot), realDirectory)) {
        errors.push('workingDirectory escapes the repository through a symbolic link');
      } else {
        workingDirectory = realDirectory;
      }
    }
  }

  const oracle = readContainedFile(repoRoot, sourceEvidence?.oraclePath, 'oracle', errors);
  const captured = readContainedFile(
    repoRoot,
    sourceEvidence?.capturedOutputPath,
    'captured output',
    errors,
  );
  if (oracle && sha256(oracle.contents) !== sourceEvidence.oracleSha256) {
    errors.push(`oracle sha256 mismatch for ${sourceEvidence.oraclePath}`);
  }
  if (captured && sha256(captured.contents) !== sourceEvidence.capturedOutputSha256) {
    errors.push(`captured output sha256 mismatch for ${sourceEvidence.capturedOutputPath}`);
  }

  if (workingDirectory && oracle && !isContained(workingDirectory, oracle.absolutePath)) {
    errors.push('oraclePath must be contained by workingDirectory');
  }
  if (workingDirectory && captured && !isContained(workingDirectory, captured.absolutePath)) {
    errors.push('capturedOutputPath must be contained by workingDirectory');
  }

  const command = sourceEvidence?.command;
  const commandPath = Array.isArray(command) && command.length === 2 ? command[1] : null;
  if (
    !Array.isArray(command) ||
    command.length !== 2 ||
    command[0] !== 'node' ||
    typeof commandPath !== 'string' ||
    isAbsolute(commandPath) ||
    commandPath.split(/[\\/]+/u).includes('..') ||
    !workingDirectory ||
    !oracle ||
    !existsSync(resolve(workingDirectory, commandPath)) ||
    realpathSync(resolve(workingDirectory, commandPath)) !== oracle.absolutePath
  ) {
    errors.push('command must be the fixed argv ["node", <contained oraclePath>]');
  }
  if (!Number.isInteger(sourceEvidence?.expectedExitCode)) {
    errors.push('expectedExitCode must be an integer');
  }

  if (!execute || errors.length > 0) {
    return { valid: errors.length === 0, executed: false, errors };
  }

  const execution = spawnSync(process.execPath, [commandPath], {
    cwd: workingDirectory,
    env: process.env,
    encoding: null,
    shell: false,
    timeout: 180_000,
    maxBuffer: 32 * 1024 * 1024,
  });
  if (execution.error) {
    errors.push(`execution failed: ${execution.error.message}`);
  } else if (execution.status !== sourceEvidence.expectedExitCode) {
    errors.push(
      `exit code ${execution.status ?? execution.signal ?? 'unknown'} did not match expected ${sourceEvidence.expectedExitCode}`,
    );
  }
  const stdout = Buffer.isBuffer(execution.stdout) ? execution.stdout : Buffer.alloc(0);
  if (captured && !stdout.equals(captured.contents)) {
    errors.push('stdout does not byte-for-byte match captured output');
  }
  return { valid: errors.length === 0, executed: true, errors };
}

function parsePackOutput(stdout, cwd) {
  const payload = JSON.parse(stdout.trim());
  const entry = Array.isArray(payload) ? payload[0] : payload;
  if (!entry?.filename) throw new Error('pnpm pack did not report a tarball filename');
  return resolve(cwd, entry.filename);
}

function exactPackageKeys(value) {
  return (
    isRecord(value) && deepEqual(Object.keys(value).sort(), [...CANDIDATE_PACKAGE_WAVE].sort())
  );
}

function validTarballSet(value, expectedVersions) {
  if (
    !isRecord(value) ||
    !deepEqual(Object.keys(value).sort(), Object.keys(expectedVersions).sort())
  ) {
    return false;
  }
  return Object.values(value).every(
    (entry) =>
      isRecord(entry) &&
      typeof entry.file === 'string' &&
      entry.file === basename(entry.file) &&
      entry.file.endsWith('.tgz') &&
      /^[a-f0-9]{64}$/u.test(entry.sha256 ?? ''),
  );
}

export function verifyCandidatePackageBytes({ repoRoot, retainedTarballs, packPackage }) {
  const errors = [];
  if (!exactPackageKeys(retainedTarballs)) {
    errors.push('retained candidate tarballs must contain the exact 3.9 package wave');
    return { valid: false, errors, observedTarballs: null };
  }
  for (const name of CANDIDATE_PACKAGE_WAVE) {
    const retained = retainedTarballs[name];
    if (
      !isRecord(retained) ||
      typeof retained.file !== 'string' ||
      retained.file !== basename(retained.file) ||
      !retained.file.endsWith('.tgz') ||
      !/^[a-f0-9]{64}$/u.test(retained.sha256 ?? '')
    ) {
      errors.push(`${name} retained tarball identity is malformed`);
    }
  }
  if (errors.length > 0) return { valid: false, errors, observedTarballs: null };

  const workDir = mkdtempSync(join(tmpdir(), 'decantr-3.9-release-pack-'));
  const rawTarballDir = join(workDir, 'raw-tarballs');
  mkdirSync(rawTarballDir, { recursive: true });
  const observedTarballs = {};
  try {
    for (const name of CANDIDATE_PACKAGE_WAVE) {
      let tarballPath;
      if (packPackage) {
        tarballPath = resolve(packPackage(name, workDir));
      } else {
        const packed = spawnSync(
          'pnpm',
          ['--filter', name, 'pack', '--pack-destination', rawTarballDir, '--json'],
          {
            cwd: repoRoot,
            env: process.env,
            encoding: 'utf8',
            shell: false,
            timeout: 180_000,
            maxBuffer: 16 * 1024 * 1024,
          },
        );
        if (packed.error) throw packed.error;
        if (packed.status !== 0) {
          throw new Error(
            `pnpm pack ${name} exited ${packed.status ?? packed.signal ?? 'without status'}: ${packed.stderr || packed.stdout}`,
          );
        }
        const rawTarball = parsePackOutput(packed.stdout, repoRoot);
        tarballPath = canonicalizePackedTarball(
          rawTarball,
          name,
          workDir,
          join(workDir, 'canonical-tarballs'),
        );
      }
      if (
        !isContained(workDir, tarballPath) ||
        !existsSync(tarballPath) ||
        !statSync(tarballPath).isFile() ||
        !isContained(realpathSync(workDir), realpathSync(tarballPath))
      ) {
        throw new Error(`${name} packed outside the release audit work directory`);
      }
      observedTarballs[name] = {
        file: basename(tarballPath),
        sha256: sha256(readFileSync(tarballPath)),
      };
      const retained = retainedTarballs[name];
      if (
        observedTarballs[name].file !== retained.file ||
        observedTarballs[name].sha256 !== retained.sha256
      ) {
        errors.push(`${name} freshly packed bytes do not match retained qualification bytes`);
      }
    }
  } catch (cause) {
    errors.push(`fresh candidate packing failed: ${cause.message}`);
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
  return { valid: errors.length === 0, errors, observedTarballs };
}

function wilsonInterval(successes, total, z = 1.959963984540054) {
  if (!Number.isInteger(successes) || !Number.isInteger(total) || total <= 0) return null;
  if (successes < 0 || successes > total) return null;
  const proportion = successes / total;
  const zSquared = z * z;
  const denominator = 1 + zSquared / total;
  const center = (proportion + zSquared / (2 * total)) / denominator;
  const spread =
    (z * Math.sqrt((proportion * (1 - proportion) + zSquared / (4 * total)) / total)) / denominator;
  return { lower: center - spread, upper: center + spread };
}

function hasHumanReviewers(packet) {
  const reviewers = array(packet?.reviewers);
  return (
    reviewers.length === 2 &&
    unique(reviewers.map((reviewer) => reviewer.reviewerId)).length === 2 &&
    unique(reviewers.map((reviewer) => reviewer.stableIdentity)).length === 2 &&
    reviewers.every(
      (reviewer) =>
        reviewer.kind === 'human' &&
        isRecord(reviewer.signedReviewEvidence) &&
        typeof reviewer.attestedAt === 'string',
    )
  );
}

function hasFindingCorpus(packet) {
  if (!hasHumanReviewers(packet) || packet?.findingCorpus?.status !== 'complete') return false;
  const reviewerIds = new Set(packet.reviewers.map((reviewer) => reviewer.reviewerId));
  const cases = array(packet.findingCorpus.cases);
  if (cases.length === 0) return false;
  let judgments = 0;
  for (const item of cases) {
    const reviewIds = array(item.reviews).map((review) => review.reviewerId);
    if (
      unique(reviewIds).length !== 2 ||
      !reviewIds.every((id) => reviewerIds.has(id)) ||
      !reviewerIds.has(item.adjudication?.adjudicatorReviewerId) ||
      item.adjudication?.expectedOutputs?.exhaustive !== true
    ) {
      return false;
    }
    judgments += array(item.adjudication.expectedOutputs.outputs).length;
  }
  return judgments === 200;
}

function hasRouteCorpus(packet) {
  if (packet?.routeCorpus?.status !== 'complete') return false;
  const cases = array(packet.routeCorpus.cases);
  if (cases.length !== 84 || unique(cases.map((item) => item.id)).length !== 84) return false;
  let forbiddenCount = 0;
  for (const item of cases) {
    const expected = item.expectedOutputs;
    const ordered = array(expected?.orderedSources);
    const forbidden = array(expected?.forbiddenFirstSources);
    if (
      expected?.exhaustive !== true ||
      ordered[0] !== expected.requiredFirstSource ||
      forbidden.some(
        (entry) => entry.source === expected.requiredFirstSource || !ordered.includes(entry.source),
      )
    ) {
      return false;
    }
    forbiddenCount += forbidden.length;
  }
  return forbiddenCount === 24;
}

function recomputeReplay(packet, replay) {
  if (!hasFindingCorpus(packet)) return null;
  const expectedCases = new Map(packet.findingCorpus.cases.map((item) => [item.id, item]));
  const replayCases = array(replay?.cases);
  if (
    replay?.status !== 'complete' ||
    !isRecord(replay.artifact) ||
    replayCases.length !== expectedCases.size ||
    unique(replayCases.map((item) => item.caseId)).length !== expectedCases.size
  ) {
    return null;
  }

  const matrix = { truePositive: 0, falsePositive: 0, falseNegative: 0, trueNegative: 0 };
  for (const result of replayCases) {
    const expectedCase = expectedCases.get(result.caseId);
    if (
      !expectedCase ||
      expectedCase.clusterId !== result.clusterId ||
      result.exhaustive !== true ||
      array(result.unexpectedOutputs).length > 0
    ) {
      return null;
    }
    const emittedKeys = array(result.emitted).map(outputKey);
    const notEmittedKeys = array(result.notEmitted).map(outputKey);
    if (
      emittedKeys.includes(null) ||
      notEmittedKeys.includes(null) ||
      unique(emittedKeys).length !== emittedKeys.length ||
      unique(notEmittedKeys).length !== notEmittedKeys.length
    ) {
      return null;
    }
    const emitted = new Set(emittedKeys);
    const notEmitted = new Set(notEmittedKeys);
    const expectedOutputs = array(expectedCase.adjudication.expectedOutputs.outputs);
    const expectedKeys = expectedOutputs.map(outputKey);
    if (expectedKeys.includes(null) || unique(expectedKeys).length !== expectedKeys.length) {
      return null;
    }
    if (emitted.size + notEmitted.size !== expectedOutputs.length) return null;
    for (const [index, expected] of expectedOutputs.entries()) {
      const key = expectedKeys[index];
      if (emitted.has(key) === notEmitted.has(key)) return null;
      if (expected.decision === 'emit') {
        matrix[emitted.has(key) ? 'truePositive' : 'falseNegative'] += 1;
      } else {
        matrix[emitted.has(key) ? 'falsePositive' : 'trueNegative'] += 1;
      }
    }
  }
  const precisionDenominator = matrix.truePositive + matrix.falsePositive;
  const recallDenominator = matrix.truePositive + matrix.falseNegative;
  if (precisionDenominator === 0 || recallDenominator === 0) return null;
  return {
    matrix,
    judgmentTotal: Object.values(matrix).reduce((sum, value) => sum + value, 0),
    precision: {
      successes: matrix.truePositive,
      denominator: precisionDenominator,
      estimate: matrix.truePositive / precisionDenominator,
      wilson95: wilsonInterval(matrix.truePositive, precisionDenominator),
    },
    recall: {
      successes: matrix.truePositive,
      denominator: recallDenominator,
      estimate: matrix.truePositive / recallDenominator,
      wilson95: wilsonInterval(matrix.truePositive, recallDenominator),
    },
  };
}

function metricsMatch(actual, expected) {
  if (!isRecord(actual) || !expected) return false;
  const matrix = actual.confusionMatrix;
  if (!isRecord(matrix)) return false;
  if (
    matrix.truePositive !== expected.matrix.truePositive ||
    matrix.falsePositive !== expected.matrix.falsePositive ||
    matrix.falseNegative !== expected.matrix.falseNegative ||
    matrix.trueNegative !== expected.matrix.trueNegative ||
    matrix.judgmentTotal !== expected.judgmentTotal
  ) {
    return false;
  }
  return ['precision', 'recall'].every((name) => {
    const actualMetric = actual[name];
    const expectedMetric = expected[name];
    return (
      actualMetric?.successes === expectedMetric.successes &&
      actualMetric?.denominator === expectedMetric.denominator &&
      Math.abs(actualMetric?.estimate - expectedMetric.estimate) < 1e-12 &&
      actualMetric?.wilson95?.confidence === 0.95 &&
      Math.abs(actualMetric?.wilson95?.lower - expectedMetric.wilson95.lower) < 1e-12 &&
      Math.abs(actualMetric?.wilson95?.upper - expectedMetric.wilson95.upper) < 1e-12
    );
  });
}

function hasFindingReplay(packet, name) {
  const replay = packet?.findingReplays?.[name];
  const recomputed = recomputeReplay(packet, replay);
  return Boolean(recomputed && metricsMatch(replay.metrics, recomputed));
}

export function validateRouteReplayCoverage(routeCorpus, routeReplay) {
  const errors = [];
  const expectedCases = new Map(array(routeCorpus?.cases).map((item) => [item.id, item]));
  const replayCases = array(routeReplay?.cases);
  const expectedIds = array(routeCorpus?.cases).map((item) => item.id);
  const replayIds = replayCases.map((item) => item.caseId);
  if (replayCases.length !== expectedIds.length) {
    errors.push(`route replay must contain exactly ${expectedIds.length} cases`);
  }
  if (unique(replayIds).length !== replayIds.length) {
    errors.push('route replay case IDs must be unique');
  }
  const omitted = expectedIds.filter((id) => !replayIds.includes(id));
  const unexpected = replayIds.filter((id) => !expectedCases.has(id));
  if (omitted.length > 0) errors.push(`route replay omitted corpus IDs: ${omitted.join(', ')}`);
  if (unexpected.length > 0) {
    errors.push(`route replay contains non-corpus IDs: ${unexpected.join(', ')}`);
  }
  if (!deepEqual(replayIds, expectedIds)) {
    errors.push('route replay case order must exactly match the frozen corpus');
  }
  if (routeReplay?.corpusSha256 !== hashJson(routeCorpus)) {
    errors.push('route replay corpusSha256 does not match the frozen corpus');
  }
  for (const result of replayCases) {
    const expected = expectedCases.get(result.caseId);
    if (!expected) continue;
    if (expected.clusterId !== result.clusterId || result.exhaustive !== true) {
      errors.push(`route replay metadata does not match corpus case ${result.caseId}`);
      continue;
    }
    const ordered = array(result.orderedSources);
    if (!deepEqual(ordered, expected.expectedOutputs.orderedSources)) {
      errors.push(`route replay ordered sources do not match corpus case ${result.caseId}`);
    }
    if (
      array(expected.expectedOutputs.forbiddenFirstSources).some(
        (entry) => !ordered.includes(entry.source) || ordered[0] === entry.source,
      )
    ) {
      errors.push(`route replay did not retain genuine forbidden competitors for ${result.caseId}`);
    }
  }
  return { valid: errors.length === 0, errors };
}

function validateAngularBrownfieldReplay(replay) {
  const errors = [];
  const evidence = replay?.angularBrownfield;
  const targets = array(evidence?.targets);
  if (
    evidence?.status !== 'complete' ||
    evidence?.targetCount !== 2 ||
    evidence?.routeSignalCount !== 43 ||
    evidence?.taskableRouteCount !== 35 ||
    evidence?.componentCount !== 62
  ) {
    errors.push('Angular Brownfield replay must retain the complete 2/43/35/62 evidence contract');
  }
  const expectedIds = Object.keys(EXPECTED_ANGULAR_BROWNFIELD_TARGETS);
  if (!deepEqual(targets.map((target) => target.id), expectedIds)) {
    errors.push('Angular Brownfield replay target order or identities changed');
  }
  const sourceBlobCount = targets.reduce(
    (sum, target) => sum + array(target.routeSources).length + array(target.authorityFiles).length,
    0,
  );
  if (evidence?.sourceBlobCount !== sourceBlobCount || sourceBlobCount !== 41) {
    errors.push('Angular Brownfield replay source-blob count changed');
  }
  const excludedSourcePattern =
    /(?:^|\/)(?:__tests__|e2e|fixtures?|mocks?|tests?)(?:\/|$)|\.(?:cy|e2e|spec|test|vitest)\.[cm]?[jt]sx?$/iu;
  for (const target of targets) {
    const expected = EXPECTED_ANGULAR_BROWNFIELD_TARGETS[target.id];
    if (!expected) continue;
    const routeSources = array(target.routeSources);
    const authorityFiles = array(target.authorityFiles);
    const blobs = [...routeSources, ...authorityFiles];
    if (
      target.repository !== expected.repository ||
      target.commit !== expected.commit ||
      target.projectPath !== '.' ||
      target.packageName !== expected.packageName ||
      target.routeStrategy !== 'angular-router' ||
      target.routeAuthority !== 'proven' ||
      target.routeCompleteness !== 'complete' ||
      target.routeConfidence !== 'high' ||
      target.routeSignalCount !== expected.routeSignalCount ||
      target.taskableRouteCount !== expected.taskableRouteCount ||
      target.componentCount !== expected.componentCount ||
      target.componentConfidence !== 'high' ||
      target.excludedSourceCount !== expected.excludedSourceCount ||
      target.styleApproach !== expected.styleApproach ||
      target.styleConfidence !== 'high' ||
      target.confidenceScore !== 98 ||
      hashJson(target.routePaths) !== expected.routePathsSha256 ||
      routeSources.length !== expected.routeSourceCount ||
      authorityFiles.length !== expected.authorityFileCount ||
      hashJson(authorityFiles.map((entry) => entry.sourcePath)) !== expected.authorityPathsSha256
    ) {
      errors.push(`Angular Brownfield replay contract changed for ${target.id}`);
    }
    if (
      blobs.some(
        (entry) =>
          typeof entry?.sourcePath !== 'string' ||
          excludedSourcePattern.test(entry.sourcePath) ||
          !/^[a-f0-9]{40}$/u.test(entry?.blobHash ?? ''),
      )
    ) {
      errors.push(`Angular Brownfield replay contains invalid or excluded source evidence for ${target.id}`);
    }
    if (
      !array(target.routeEvidence).some((entry) => entry.includes('router root is reachable')) ||
      !array(target.routeEvidence).some((entry) => entry.includes('source path(s) excluded'))
    ) {
      errors.push(`Angular Brownfield replay is missing authority or exclusion evidence for ${target.id}`);
    }
  }
  return { valid: errors.length === 0, errors };
}

function hasRouteReplay(packet) {
  if (!hasRouteCorpus(packet) || packet?.routeReplay?.status !== 'complete') return false;
  if (!isRecord(packet.routeReplay.artifact)) return false;
  return (
    validateRouteReplayCoverage(packet.routeCorpus, packet.routeReplay).valid &&
    validateAngularBrownfieldReplay(packet.routeReplay).valid
  );
}

function hasAdoptionBoundaryReplay(packet) {
  const replay = packet?.adoptionBoundaryReplay;
  const targets = array(replay?.targets);
  return (
    replay?.status === 'complete' &&
    isRecord(replay.artifact) &&
    deepEqual(targets.map((target) => target.targetId).sort(), [...EXPECTED_TARGET_IDS].sort()) &&
    targets.every((target) => {
      const sourceChanges = array(target.authoredApplicationSourceChanges);
      const approvals = array(target.approvedHostSourceMutations);
      const approvalPaths = approvals.map((entry) => entry?.path).filter(Boolean).sort();
      return (
        target.exhaustive === true &&
        array(target.unclassifiedPaths).length === 0 &&
        array(target.studioWrites).length === 0 &&
        deepEqual([...sourceChanges].sort(), approvalPaths) &&
        approvals.every(
          (entry) =>
            entry?.kind === 'tailwind-v4-source-isolation' &&
            entry?.verified === true &&
            typeof entry?.beforeHash === 'string' &&
            typeof entry?.afterHash === 'string',
        )
      );
    })
  );
}

function nearestRank(values, percentile) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.ceil(percentile * sorted.length) - 1] ?? null;
}

function hasMachineReplay(packet) {
  const replay = packet?.machineReplay;
  if (replay?.status !== 'complete' || !isRecord(replay.artifact)) return false;
  const samples = array(replay.latencySamples);
  if (
    samples.length !==
      EXPECTED_TARGET_IDS.length * Object.keys(MACHINE_COMMAND_GATES).length * 30 ||
    unique(samples.map((sample) => sample.sampleId)).length !== samples.length ||
    unique(samples.map((sample) => sample.temporaryProjectStateId)).length !== samples.length
  ) {
    return false;
  }
  for (const targetId of EXPECTED_TARGET_IDS) {
    for (const [commandId, maximumMs] of Object.entries(MACHINE_COMMAND_GATES)) {
      const group = samples.filter(
        (sample) => sample.targetId === targetId && sample.commandId === commandId,
      );
      if (
        group.length !== 30 ||
        group.some(
          (sample) =>
            sample.exitCode !== 0 ||
            !Number.isInteger(sample.durationMs) ||
            sample.durationMs < 0 ||
            array(sample.command).length === 0 ||
            typeof sample.exactSourceRef !== 'string' ||
            !sample.exactSourceRef,
        ) ||
        nearestRank(
          group.map((sample) => sample.durationMs),
          0.95,
        ) > maximumMs
      ) {
        return false;
      }
    }
  }

  const targetResults = array(replay.targetResults);
  if (
    targetResults.length !== EXPECTED_TARGET_IDS.length ||
    !deepEqual(
      targetResults.map((target) => target.targetId).sort(),
      [...EXPECTED_TARGET_IDS].sort(),
    )
  ) {
    return false;
  }
  for (const target of targetResults) {
    const agreement = target.adoptionAgreement;
    if (
      !isRecord(agreement) ||
      unique([
        agreement.cliSha256,
        agreement.mcpSha256,
        agreement.ciV3Sha256,
        agreement.studioSha256,
      ]).length !== 1
    ) {
      return false;
    }
    const isBrownfield = target.targetId !== 'tanstack-start-greenfield';
    if (
      target.immediateCi?.applicable !== isBrownfield ||
      (isBrownfield &&
        (target.immediateCi?.v2NewFindingCount !== 0 ||
          target.immediateCi?.v3NewFindingCount !== 0)) ||
      (!isBrownfield &&
        (target.immediateCi?.v2NewFindingCount !== null ||
          target.immediateCi?.v3NewFindingCount !== null))
    ) {
      return false;
    }
    const budget = target.taskCapsuleBudget;
    if (
      !isRecord(budget) ||
      budget.canonicalBytes > 12_000 ||
      budget.tokenEstimateV1 !== Math.ceil(budget.canonicalBytes / 3) ||
      budget.tokenEstimateV1 > 4_000 ||
      budget.cliPayloadBytes > 12_000 ||
      budget.mcpPayloadBytes > 12_000
    ) {
      return false;
    }
    const determinism = target.determinism;
    if (
      !Number.isInteger(determinism?.runCount) ||
      determinism.runCount < 2 ||
      array(determinism.contractDigests).length !== determinism.runCount ||
      array(determinism.deltaDigests).length !== determinism.runCount ||
      unique(determinism.contractDigests).length !== 1 ||
      unique(determinism.deltaDigests).length !== 1
    ) {
      return false;
    }
    if (
      target.contentResolution?.bundledDigest !== target.contentResolution?.networkDeniedDigest ||
      !Object.values(target.studioModes ?? {}).every((value) => value === true) ||
      target.reproducibility?.temporaryStateCount !== 90 ||
      !deepEqual(
        [...array(target.reproducibility?.commandIds)].sort(),
        Object.keys(MACHINE_COMMAND_GATES).sort(),
      ) ||
      typeof target.reproducibility?.exactSourceRef !== 'string' ||
      !target.reproducibility.exactSourceRef
    ) {
      return false;
    }
  }

  return (
    deepEqual(replay.mcp?.tools, EXPECTED_MCP_TOOLS) &&
    deepEqual(replay.v2Compatibility?.schemaIds, EXPECTED_SCHEMA_IDS) &&
    replay.v2Compatibility?.goldenOutputTestsPassed === true &&
    replay.v2Compatibility?.defaultReportSchema ===
      'https://decantr.ai/schemas/decantr-ci-report.v2.json' &&
    replay.reportCompatibility?.defaultV2 === true &&
    replay.reportCompatibility?.explicitV3 === true &&
    replay.reportCompatibility?.taskCapsuleV1 === true &&
    replay.workspaceCi?.projectMode === true &&
    replay.workspaceCi?.workspaceMode === true
  );
}

function validatePacketSchema(options, packet, schema, error) {
  try {
    const requireFromVerifier = createRequire(
      resolve(options.repoRoot, 'packages/verifier/package.json'),
    );
    const Ajv2020 = requireFromVerifier('ajv/dist/2020').default;
    const addFormats = requireFromVerifier('ajv-formats').default;
    const ajv = new Ajv2020({ allErrors: true, strict: false, allowUnionTypes: true });
    addFormats(ajv);
    const validate = ajv.compile(schema);
    if (!validate(packet)) {
      for (const issue of validate.errors ?? []) {
        error(`qualification-packet.json${issue.instancePath || '/'} ${issue.message}`);
      }
    }
  } catch (cause) {
    error(`qualification-packet schema validation could not run: ${cause.message}`);
  }
}

export async function runAudit(options) {
  const errors = [];
  const error = (message) => errors.push(message);
  const lineCache = new Map();
  const githubSnapshotCache = new Map();
  const oracleEvidenceCache = new Map();

  function readJson(name) {
    const path = resolve(options.fixturesDir, name);
    if (!existsSync(path)) {
      error(`${name}: fixture is missing`);
      return null;
    }
    try {
      return JSON.parse(readFileSync(path, 'utf8'));
    } catch (cause) {
      error(`${name}: invalid JSON: ${cause.message}`);
      return null;
    }
  }

  function validateProvenance(provenance, context) {
    if (!isRecord(provenance)) {
      error(`${context}: provenance must be an object`);
      return;
    }
    const path = provenance.path;
    const line = provenance.line;
    const anchor = provenance.anchor;
    if (typeof path !== 'string' || isAbsolute(path) || path.split(/[\\/]+/u).includes('..')) {
      error(`${context}: path must be repository-relative`);
      return;
    }
    if (!Number.isInteger(line) || line < 1 || typeof anchor !== 'string' || !anchor) {
      error(`${context}: line and anchor must identify exact source text`);
      return;
    }
    const absolutePath = resolve(options.repoRoot, path);
    const relation = relative(options.repoRoot, absolutePath);
    if (relation.startsWith('..') || isAbsolute(relation) || !existsSync(absolutePath)) {
      error(`${context}: provenance path does not exist: ${path}`);
      return;
    }
    if (!statSync(absolutePath).isFile()) {
      error(`${context}: provenance path is not a file: ${path}`);
      return;
    }
    const lines = lineCache.get(absolutePath) ?? readFileSync(absolutePath, 'utf8').split(/\r?\n/u);
    lineCache.set(absolutePath, lines);
    if (!lines[line - 1]?.includes(anchor)) {
      error(`${context}: provenance anchor is not present at ${path}:${line}`);
    }
  }

  function readEvidenceFile(path, context) {
    if (typeof path !== 'string' || isAbsolute(path) || path.split(/[\\/]+/u).includes('..')) {
      error(`${context}: path must be repository-relative`);
      return null;
    }
    const fixturePrefix = 'fixtures/qualification/3.9/';
    const evidenceRoot = path.startsWith(fixturePrefix) ? options.fixturesDir : options.repoRoot;
    const relativeEvidencePath = path.startsWith(fixturePrefix)
      ? path.slice(fixturePrefix.length)
      : path;
    const absolutePath = resolve(evidenceRoot, relativeEvidencePath);
    const relation = relative(evidenceRoot, absolutePath);
    if (relation.startsWith('..') || isAbsolute(relation) || !existsSync(absolutePath)) {
      error(`${context}: evidence file does not exist: ${path}`);
      return null;
    }
    if (!statSync(absolutePath).isFile()) {
      error(`${context}: evidence path is not a file: ${path}`);
      return null;
    }
    return readFileSync(absolutePath);
  }

  function validateHumanReviewEvidence(packet) {
    const humanClaimed =
      array(packet?.reviewers).length > 0 ||
      packet?.findingCorpus?.status === 'complete' ||
      packet?.findingReplays?.public383?.status === 'complete' ||
      packet?.findingReplays?.candidate390?.status === 'complete';
    const scriptPath = resolve(options.repoRoot, 'scripts', 'prepare-3-9-human-review.mjs');
    const validation = spawnSync(
      process.execPath,
      [
        scriptPath,
        '--repo-root',
        options.repoRoot,
        '--fixtures-dir',
        options.fixturesDir,
        humanClaimed ? '--validate' : '--lint-only',
        '--json',
      ],
      { encoding: 'utf8', shell: false, maxBuffer: 16 * 1024 * 1024 },
    );
    let summary;
    try {
      summary = JSON.parse(validation.stdout);
    } catch (cause) {
      error(`human review kit validation did not return JSON: ${cause.message}`);
      return false;
    }
    for (const issue of array(summary.errors)) {
      error(`human review kit: ${issue}`);
    }
    if (!humanClaimed) return summary.errors?.length === 0;
    if (validation.status !== 0 || summary.status !== 'ready') {
      error(
        `qualification-packet.json: human claims require a complete signed review kit (${array(
          summary.blockers,
        ).join(', ') || 'validation failed'})`,
      );
      return false;
    }

    const reviewRoot = resolve(options.fixturesDir, 'review');
    const fragmentPath = resolve(reviewRoot, 'generated', 'human-review-packet-fragment.json');
    if (!existsSync(fragmentPath) || !statSync(fragmentPath).isFile()) {
      error('qualification-packet.json: signed human review packet fragment is missing');
      return false;
    }
    let fragment;
    try {
      fragment = JSON.parse(readFileSync(fragmentPath, 'utf8'));
    } catch (cause) {
      error(`human review packet fragment is invalid JSON: ${cause.message}`);
      return false;
    }
    const expectedBindings = {
      corpusSha256: sha256(readFileSync(resolve(reviewRoot, 'corpus.json'))),
      reviewerWorksheetSha256: {
        'reviewer-1': sha256(readFileSync(resolve(reviewRoot, 'reviewers', 'reviewer-1.json'))),
        'reviewer-2': sha256(readFileSync(resolve(reviewRoot, 'reviewers', 'reviewer-2.json'))),
      },
      adjudicationSha256: sha256(readFileSync(resolve(reviewRoot, 'adjudication.json'))),
      replayWorkbookSha256: {
        public383: sha256(readFileSync(resolve(reviewRoot, 'replays', 'public-3.8.3.json'))),
        candidate390: sha256(readFileSync(resolve(reviewRoot, 'replays', 'candidate-3.9.4.json'))),
      },
      signingPayloadSha256: {
        'reviewer-1': sha256(readFileSync(resolve(reviewRoot, 'signatures', 'reviewer-1.payload.json'))),
        'reviewer-2': sha256(readFileSync(resolve(reviewRoot, 'signatures', 'reviewer-2.payload.json'))),
        adjudication: sha256(
          readFileSync(resolve(reviewRoot, 'signatures', 'adjudication.payload.json')),
        ),
      },
    };
    if (
      fragment.schemaVersion !== 'decantr-3.9-human-review-packet-fragment.v2' ||
      fragment.qualificationClaim !== false ||
      !deepEqual(fragment.sourceBindings, expectedBindings) ||
      !deepEqual(fragment.patch?.reviewers, packet.reviewers) ||
      !deepEqual(fragment.patch?.findingCorpus, packet.findingCorpus) ||
      !deepEqual(fragment.patch?.findingReplays, packet.findingReplays)
    ) {
      error(
        'qualification-packet.json: human workbooks, signed payloads, adjudication linkage, fragment hashes, and packet claims do not match',
      );
      return false;
    }
    return true;
  }

  function validateSourceSnapshotShape(sourceEvidence, context) {
    let valid = true;
    const { repository, commit, sourcePath, blobHash } = sourceEvidence;
    if (typeof repository !== 'string' || typeof commit !== 'string') {
      error(`${context}: source-snapshot repository and commit are required`);
      valid = false;
    }
    const match =
      typeof repository === 'string'
        ? repository.match(
            /^https:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?\/?$/u,
          )
        : null;
    if (!match) {
      error(`${context}: source-snapshot repository must be an HTTPS GitHub repository`);
      valid = false;
    }
    if (typeof commit !== 'string' || !/^[a-f0-9]{40}$/u.test(commit)) {
      error(`${context}: source-snapshot commit must be a full SHA-1`);
      valid = false;
    }
    if (
      typeof sourcePath !== 'string' ||
      !sourcePath ||
      isAbsolute(sourcePath) ||
      sourcePath.split(/[\\/]+/u).includes('..')
    ) {
      error(`${context}: sourcePath must be repository-relative`);
      valid = false;
    }
    if (typeof blobHash !== 'string' || !/^[a-f0-9]{40}$/u.test(blobHash)) {
      error(`${context}: blobHash must be a full Git blob SHA-1`);
      valid = false;
    }
    return { valid, match };
  }

  async function loadGitHubSnapshot(repository, commit, repositoryMatch, context) {
    const match = repositoryMatch;
    if (!match) return null;
    const owner = match[1];
    const repo = match[2];
    const cacheKey = `${owner}/${repo}@${commit}`.toLowerCase();
    if (githubSnapshotCache.has(cacheKey)) return githubSnapshotCache.get(cacheKey);

    const headers = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'decantr-3.9-qualification-audit',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    if (token) headers.Authorization = `Bearer ${token}`;
    try {
      const commitResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits/${commit}`,
        { headers, signal: AbortSignal.timeout(30_000) },
      );
      if (!commitResponse.ok) {
        error(`${context}: GitHub could not verify source commit (${commitResponse.status})`);
        githubSnapshotCache.set(cacheKey, null);
        return null;
      }
      const commitPayload = await commitResponse.json();
      if (commitPayload?.sha !== commit || typeof commitPayload?.commit?.tree?.sha !== 'string') {
        error(`${context}: GitHub source commit identity does not match the packet`);
        githubSnapshotCache.set(cacheKey, null);
        return null;
      }
      const treeResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${commitPayload.commit.tree.sha}?recursive=1`,
        { headers, signal: AbortSignal.timeout(30_000) },
      );
      if (!treeResponse.ok) {
        error(`${context}: GitHub could not load the source commit tree (${treeResponse.status})`);
        githubSnapshotCache.set(cacheKey, null);
        return null;
      }
      const treePayload = await treeResponse.json();
      if (treePayload?.truncated === true || !Array.isArray(treePayload?.tree)) {
        error(`${context}: GitHub source tree is truncated or invalid`);
        githubSnapshotCache.set(cacheKey, null);
        return null;
      }
      const snapshot = new Map(
        treePayload.tree
          .filter(
            (entry) =>
              entry?.type === 'blob' &&
              typeof entry.path === 'string' &&
              typeof entry.sha === 'string',
          )
          .map((entry) => [entry.path, entry.sha]),
      );
      githubSnapshotCache.set(cacheKey, snapshot);
      return snapshot;
    } catch (cause) {
      error(`${context}: GitHub source verification failed: ${cause.message}`);
      githubSnapshotCache.set(cacheKey, null);
      return null;
    }
  }

  async function validateSourceEvidence(sourceEvidence, context, verifyRemoteSources) {
    if (!isRecord(sourceEvidence)) return false;
    if (sourceEvidence.kind === 'source-snapshot') {
      const shape = validateSourceSnapshotShape(sourceEvidence, context);
      if (!shape.valid) return false;
      if (!verifyRemoteSources) return true;
      const snapshot = await loadGitHubSnapshot(
        sourceEvidence.repository,
        sourceEvidence.commit,
        shape.match,
        context,
      );
      if (!snapshot) return false;
      const actualBlob = snapshot.get(sourceEvidence.sourcePath);
      if (actualBlob !== sourceEvidence.blobHash) {
        error(`${context}: sourcePath blob does not match the verified GitHub commit tree`);
        return false;
      }
      return true;
    }
    if (sourceEvidence.kind !== 'executable-oracle') return false;
    const cacheKey = `${verifyRemoteSources}:${JSON.stringify(sourceEvidence)}`;
    const cached = oracleEvidenceCache.get(cacheKey);
    if (cached) return cached.valid;
    const result = validateExecutableOracleEvidence({
      repoRoot: options.repoRoot,
      sourceEvidence,
      execute: verifyRemoteSources,
    });
    oracleEvidenceCache.set(cacheKey, result);
    for (const issue of result.errors) error(`${context}: executable oracle ${issue}`);
    return result.valid;
  }

  async function validateCorpusSourceEvidence(cases, context, verifyRemoteSources) {
    let valid = true;
    for (const [index, item] of array(cases).entries()) {
      if (
        !(await validateSourceEvidence(
          item.sourceEvidence,
          `${context}.cases[${index}].sourceEvidence`,
          verifyRemoteSources,
        ))
      ) {
        valid = false;
      }
    }
    return valid;
  }

  function validateReplayRelease(replay, replayName) {
    if (!isRecord(replay?.release)) return false;
    const expected =
      replayName === 'public383'
        ? {
            version: '3.8.3',
            installationSource: 'public-npm',
            packageVersions: EXPECTED_PUBLIC_383_REPLAY_VERSIONS,
          }
        : {
            version: '3.9.4',
            installationSource: 'packed-or-public-npm',
            packageVersions: EXPECTED_CANDIDATE_390_REPLAY_VERSIONS,
          };
    if (
      replay.release.version !== expected.version ||
      replay.release.installationSource !== expected.installationSource
    ) {
      error(`qualification-packet.json: ${replayName} replay release identity changed`);
      return false;
    }
    if (
      replay.status === 'complete' &&
      !deepEqual(replay.release.packageVersions, expected.packageVersions)
    ) {
      error(`qualification-packet.json: ${replayName} replay package versions are not exact`);
      return false;
    }
    if (
      replayName === 'public383' &&
      !deepEqual(replay.release.packageVersions, EXPECTED_PUBLIC_383_REPLAY_VERSIONS)
    ) {
      error('qualification-packet.json: public383 replay package versions changed');
      return false;
    }
    if (
      replayName === 'candidate390' &&
      replay.status === 'missing' &&
      replay.release.packageVersions !== null
    ) {
      error(
        'qualification-packet.json: incomplete candidate390 replay must not claim package versions',
      );
      return false;
    }
    return true;
  }

  function validateReplayArtifact(section, kind, context) {
    const payloadKey = kind === 'adoption-boundary' ? 'targets' : 'cases';
    if (section?.status === 'missing') {
      const emptyPayload = array(section?.[payloadKey]).length === 0;
      const emptyMetrics = kind !== 'finding' || section?.metrics === null;
      if (section?.artifact !== null || !emptyPayload || !emptyMetrics) {
        error(`${context}: missing replay must not retain artifact claims or result rows`);
      }
      return false;
    }
    if (section?.status !== 'complete' || !isRecord(section.artifact)) return false;

    let valid = true;
    if (section.artifact.exitCode !== 0) {
      error(`${context}: completed replay artifact exitCode must be 0`);
      valid = false;
    }
    const artifactContents = readEvidenceFile(section.artifact.path, `${context}.artifact`);
    if (!artifactContents) return false;
    if (sha256(artifactContents) !== section.artifact.sha256) {
      error(`${context}: artifact sha256 mismatch for ${section.artifact.path}`);
      valid = false;
    }

    let artifactPayload;
    try {
      artifactPayload = JSON.parse(artifactContents.toString('utf8'));
    } catch (cause) {
      error(`${context}: artifact is not valid JSON: ${cause.message}`);
      return false;
    }
    const expectedSchemaVersion = {
      finding: 'decantr-finding-replay-artifact.v1',
      route: 'decantr-route-replay-artifact.v1',
      'adoption-boundary': 'decantr-adoption-boundary-replay-artifact.v1',
    }[kind];
    if (artifactPayload?.schemaVersion !== expectedSchemaVersion) {
      error(`${context}: artifact schemaVersion must be ${expectedSchemaVersion}`);
      valid = false;
    }
    if (basename(section.artifact.path) !== `${expectedSchemaVersion}.${section.artifact.sha256}.json`) {
      error(`${context}: artifact path is not content-addressed by its SHA-256`);
      valid = false;
    }
    for (const field of ['generatedAt', 'command', 'exitCode', 'environment']) {
      if (!deepEqual(artifactPayload?.[field], section.artifact[field])) {
        error(`${context}: artifact ${field} does not match packet metadata`);
        valid = false;
      }
    }
    if (!deepEqual(artifactPayload?.[payloadKey], section[payloadKey])) {
      error(`${context}: artifact ${payloadKey} do not match packet results`);
      valid = false;
    }
    const expectedBinding = createBehaviorEvidenceBinding(
      artifactPayload?.environment?.exactPackageTarballs,
      artifactBehavior(artifactPayload, kind),
    );
    if (
      !deepEqual(artifactPayload?.behaviorBinding, expectedBinding) ||
      !deepEqual(section.artifact.behaviorBinding, expectedBinding)
    ) {
      error(`${context}: package hashes and behavioral results are not cryptographically bound`);
      valid = false;
    }
    const expectedTarballVersions =
      kind === 'finding' && section.release?.version === '3.8.3'
        ? EXPECTED_PUBLIC_383_REPLAY_VERSIONS
        : EXPECTED_CANDIDATE_390_REPLAY_VERSIONS;
    if (!validTarballSet(artifactPayload?.environment?.exactPackageTarballs, expectedTarballVersions)) {
      error(`${context}: artifact does not contain the exact content-addressed package wave`);
      valid = false;
    }
    if (
      !artifactPayload?.environment?.exactSourceRef?.includes(
        `package-set-sha256:${expectedBinding.packageSetSha256}`,
      )
    ) {
      error(`${context}: exactSourceRef is not bound to the package set`);
      valid = false;
    }
    const harnessPath =
      kind === 'route'
        ? resolve(options.repoRoot, 'scripts', 'run-3-9-route-qualification.mjs')
        : kind === 'adoption-boundary'
          ? resolve(options.repoRoot, 'scripts', 'run-3-9-machine-qualification.mjs')
          : null;
    if (
      harnessPath &&
      !artifactPayload?.environment?.exactSourceRef?.includes(
        `harness-sha256:${sha256(readFileSync(harnessPath))}`,
      )
    ) {
      error(`${context}: exactSourceRef is not bound to the current qualification harness`);
      valid = false;
    }
    if (kind === 'finding') {
      if (
        !deepEqual(artifactPayload?.release, section.release) ||
        !deepEqual(artifactPayload?.metrics, section.metrics)
      ) {
        error(`${context}: artifact release or metrics do not match packet results`);
        valid = false;
      }
      if (
        !deepEqual(
          section.artifact.environment?.exactPackageVersions,
          section.release.packageVersions,
        )
      ) {
        error(`${context}: artifact environment does not contain the replay package versions`);
        valid = false;
      }
    } else if (kind === 'route') {
      if (
        artifactPayload?.releaseVersion !== section.releaseVersion ||
        artifactPayload?.routeCorpusSha256 !== section.corpusSha256 ||
        section.corpusSha256 !== hashJson(packet.routeCorpus) ||
        !deepEqual(artifactPayload?.routeCorpus, packet.routeCorpus) ||
        !deepEqual(artifactPayload?.angularBrownfield, section.angularBrownfield)
      ) {
        error(`${context}: artifact release or frozen route corpus binding does not match packet results`);
        valid = false;
      }
      if (
        !deepEqual(
          section.artifact.environment?.exactPackageVersions,
          EXPECTED_CANDIDATE_390_REPLAY_VERSIONS,
        )
      ) {
        error(`${context}: artifact environment is not the exact 3.9 package wave`);
        valid = false;
      }
    } else if (
      !deepEqual(
        section.artifact.environment?.exactPackageVersions,
        EXPECTED_CANDIDATE_390_REPLAY_VERSIONS,
      )
    ) {
      error(`${context}: artifact environment is not the exact 3.9 package wave`);
      valid = false;
    }
    return valid;
  }

  function validateMachineReplayArtifact(section, context) {
    const payloadFields = [
      'latencySamples',
      'targetResults',
      'mcp',
      'v2Compatibility',
      'reportCompatibility',
      'workspaceCi',
    ];
    if (section?.status === 'missing') {
      if (
        section.artifact !== null ||
        array(section.latencySamples).length > 0 ||
        array(section.targetResults).length > 0 ||
        payloadFields.slice(2).some((field) => section[field] !== null)
      ) {
        error(`${context}: missing machine replay must not retain evidence claims`);
      }
      return false;
    }
    if (section?.status !== 'complete' || !isRecord(section.artifact)) return false;

    let valid = true;
    if (section.artifact.exitCode !== 0) {
      error(`${context}: completed machine replay artifact exitCode must be 0`);
      valid = false;
    }
    const contents = readEvidenceFile(section.artifact.path, `${context}.artifact`);
    if (!contents) return false;
    if (sha256(contents) !== section.artifact.sha256) {
      error(`${context}: artifact sha256 mismatch for ${section.artifact.path}`);
      valid = false;
    }
    let payload;
    try {
      payload = JSON.parse(contents.toString('utf8'));
    } catch (cause) {
      error(`${context}: artifact is not valid JSON: ${cause.message}`);
      return false;
    }
    if (payload?.schemaVersion !== 'decantr-machine-qualification-artifact.v1') {
      error(`${context}: artifact schemaVersion must be decantr-machine-qualification-artifact.v1`);
      valid = false;
    }
    if (
      basename(section.artifact.path) !==
      `decantr-machine-qualification-artifact.v1.${section.artifact.sha256}.json`
    ) {
      error(`${context}: artifact path is not content-addressed by its SHA-256`);
      valid = false;
    }
    for (const field of ['generatedAt', 'command', 'exitCode', 'environment']) {
      if (!deepEqual(payload?.[field], section.artifact[field])) {
        error(`${context}: artifact ${field} does not match packet metadata`);
        valid = false;
      }
    }
    for (const field of payloadFields) {
      if (!deepEqual(payload?.[field], section[field])) {
        error(`${context}: artifact ${field} does not match packet results`);
        valid = false;
      }
    }
    const expectedBinding = createBehaviorEvidenceBinding(
      payload?.environment?.exactPackageTarballs,
      artifactBehavior(payload, 'machine'),
    );
    if (
      !deepEqual(payload?.behaviorBinding, expectedBinding) ||
      !deepEqual(section.artifact.behaviorBinding, expectedBinding)
    ) {
      error(`${context}: package hashes and behavioral results are not cryptographically bound`);
      valid = false;
    }
    if (
      !validTarballSet(
        payload?.environment?.exactPackageTarballs,
        EXPECTED_CANDIDATE_390_REPLAY_VERSIONS,
      )
    ) {
      error(`${context}: artifact does not contain the exact content-addressed package wave`);
      valid = false;
    }
    if (
      !payload?.environment?.exactSourceRef?.includes(
        `package-set-sha256:${expectedBinding.packageSetSha256}`,
      )
    ) {
      error(`${context}: exactSourceRef is not bound to the package set`);
      valid = false;
    }
    const machineHarnessPath = resolve(
      options.repoRoot,
      'scripts',
      'run-3-9-machine-qualification.mjs',
    );
    if (
      !payload?.environment?.exactSourceRef?.includes(
        `harness-sha256:${sha256(readFileSync(machineHarnessPath))}`,
      )
    ) {
      error(`${context}: exactSourceRef is not bound to the current qualification harness`);
      valid = false;
    }
    if (
      !deepEqual(
        section.artifact.environment?.exactPackageVersions,
        EXPECTED_CANDIDATE_390_REPLAY_VERSIONS,
      )
    ) {
      error(`${context}: artifact environment is not the exact 3.9 package wave`);
      valid = false;
    }
    return valid;
  }

  const manifest = readJson('compatibility-manifest.json');
  const packet = readJson('qualification-packet.json');
  const packetSchema = readJson('qualification-packet.schema.json');
  const missingEvidence = readJson('missing-evidence.json');
  const legacyRoutes = readJson('route-source-labels.json');
  const legacyFindings = readJson('finding-labels.json');

  if (packet && packetSchema) validatePacketSchema(options, packet, packetSchema, error);

  if (manifest) {
    if (manifest.schemaVersion !== 'decantr-qualification-compatibility-manifest.v2') {
      error('compatibility-manifest.json: unexpected schemaVersion');
    }
    if (manifest.frozenAt !== '2026-07-16') error('compatibility-manifest.json: frozenAt changed');
    if (
      manifest.baselineRelease?.version !== '3.8.3' ||
      !deepEqual(manifest.baselineRelease?.packageVersions, EXPECTED_PACKAGE_VERSIONS)
    ) {
      error('compatibility-manifest.json: 3.8.3 package inventory changed');
    }
    validateProvenance(manifest.baselineRelease?.provenance, 'baselineRelease.provenance');

    const schemaIds = array(manifest.v2Compatibility?.schemas).map((entry) => entry.id);
    if (!deepEqual(schemaIds, EXPECTED_SCHEMA_IDS)) {
      error('compatibility-manifest.json: v2 schema inventory or order changed');
    }
    for (const schema of array(manifest.v2Compatibility?.schemas)) {
      const schemaPath = resolve(options.repoRoot, schema.path ?? '');
      if (!existsSync(schemaPath))
        error(`compatibility-manifest.json: missing schema ${schema.path}`);
      else {
        try {
          if (JSON.parse(readFileSync(schemaPath, 'utf8')).$id !== schema.id) {
            error(`compatibility-manifest.json: schema ID mismatch for ${schema.path}`);
          }
        } catch (cause) {
          error(`compatibility-manifest.json: invalid schema ${schema.path}: ${cause.message}`);
        }
      }
    }
    validateProvenance(manifest.v2Compatibility?.provenance, 'v2Compatibility.provenance');

    if (
      manifest.mcp?.toolCount !== 8 ||
      manifest.mcp?.serverIdentity !== 'io.github.decantr-ai/mcp-server' ||
      manifest.mcp?.transport !== 'stdio' ||
      !deepEqual(manifest.mcp?.tools, EXPECTED_MCP_TOOLS)
    ) {
      error('compatibility-manifest.json: exact MCP tool/action inventory changed');
    }
    validateProvenance(manifest.mcp?.provenance, 'mcp.provenance');

    const targetIds = manifest.adoptionWriteBoundary?.evidenceProtocol?.requiredTargetIds;
    if (!deepEqual(targetIds, EXPECTED_TARGET_IDS)) {
      error('compatibility-manifest.json: adoption target inventory changed');
    }
    if (array(manifest.adoptionWriteBoundary?.studio?.allowedWrites).length !== 0) {
      error('compatibility-manifest.json: Studio write boundary is not empty');
    }
    validateProvenance(
      manifest.adoptionWriteBoundary?.provenance,
      'adoptionWriteBoundary.provenance',
    );

    if (
      manifest.measurementProtocol?.isolatedRunsPerTargetCommand !== 30 ||
      manifest.measurementProtocol?.percentiles?.method !== 'nearest-rank' ||
      manifest.measurementProtocol?.findingEvaluation?.requiredJudgmentCount !== 200 ||
      manifest.measurementProtocol?.findingEvaluation?.requiredHumanReviewers !== 2
    ) {
      error('compatibility-manifest.json: measurement protocol changed');
    }
    validateProvenance(manifest.measurementProtocol?.provenance, 'measurementProtocol.provenance');
    if (
      manifest.baselineReplay?.status !== 'missing' ||
      manifest.baselineReplay?.qualificationEligible !== false ||
      manifest.baselineReplay?.metrics?.precision !== null ||
      manifest.baselineReplay?.metrics?.recall !== null
    ) {
      error('compatibility-manifest.json: unmeasured 3.8.3 replay cannot claim metrics');
    }
    validateProvenance(manifest.baselineReplay?.provenance, 'baselineReplay.provenance');
  }

  if (
    legacyRoutes?.qualificationStatus !== 'legacy-unqualified' ||
    legacyRoutes?.countsTowardQualification !== false ||
    array(legacyRoutes?.positiveLabels).length !== 84 ||
    array(legacyRoutes?.forbiddenAssertions).length !== 24
  ) {
    error('route-source-labels.json: rejected 84/24 draft must remain quarantined');
  }
  if (
    legacyFindings?.qualificationStatus !== 'legacy-unqualified' ||
    legacyFindings?.countsTowardQualification !== false ||
    array(legacyFindings?.labels).length !== 200
  ) {
    error('finding-labels.json: rejected 200-row draft must remain quarantined');
  }

  const requirementOverrides = new Map();
  const verifyRemoteSources =
    !options.lintOnly && packet?.packetStatus === 'complete' && packet?.qualificationClaim === true;
  let candidatePackageBytesValid = !verifyRemoteSources;
  if (verifyRemoteSources) {
    const packageBytes = verifyCandidatePackageBytes({
      repoRoot: options.repoRoot,
      retainedTarballs: packet?.machineReplay?.artifact?.environment?.exactPackageTarballs,
    });
    candidatePackageBytesValid = packageBytes.valid;
    for (const issue of packageBytes.errors) {
      error(`qualification-packet.json.machineReplay: ${issue}`);
    }
  }
  if (packet) {
    const humanReviewEvidenceValid = validateHumanReviewEvidence(packet);
    const reviewersValid = hasHumanReviewers(packet) && humanReviewEvidenceValid;
    const routeCoverage = validateRouteReplayCoverage(packet.routeCorpus, packet.routeReplay);
    if (packet.routeReplay?.status === 'complete') {
      for (const issue of routeCoverage.errors) {
        error(`qualification-packet.json.routeReplay: ${issue}`);
      }
      const angularCoverage = validateAngularBrownfieldReplay(packet.routeReplay);
      for (const issue of angularCoverage.errors) {
        error(`qualification-packet.json.routeReplay.angularBrownfield: ${issue}`);
      }
    }
    const routeSourcesValid = await validateCorpusSourceEvidence(
      packet.routeCorpus?.cases,
      'qualification-packet.json.routeCorpus',
      verifyRemoteSources,
    );
    const findingSourcesValid = await validateCorpusSourceEvidence(
      packet.findingCorpus?.cases,
      'qualification-packet.json.findingCorpus',
      verifyRemoteSources,
    );
    const publicReleaseValid = validateReplayRelease(packet.findingReplays?.public383, 'public383');
    const candidateReleaseValid = validateReplayRelease(
      packet.findingReplays?.candidate390,
      'candidate390',
    );
    const publicArtifactValid = validateReplayArtifact(
      packet.findingReplays?.public383,
      'finding',
      'qualification-packet.json.findingReplays.public383',
    );
    const candidateArtifactValid = validateReplayArtifact(
      packet.findingReplays?.candidate390,
      'finding',
      'qualification-packet.json.findingReplays.candidate390',
    );
    const routeArtifactValid = validateReplayArtifact(
      packet.routeReplay,
      'route',
      'qualification-packet.json.routeReplay',
    );
    const adoptionArtifactValid = validateReplayArtifact(
      packet.adoptionBoundaryReplay,
      'adoption-boundary',
      'qualification-packet.json.adoptionBoundaryReplay',
    );
    const machineArtifactValid = validateMachineReplayArtifact(
      packet.machineReplay,
      'qualification-packet.json.machineReplay',
    );
    const candidateArtifactSections = [
      packet.routeReplay,
      packet.adoptionBoundaryReplay,
      packet.machineReplay,
      packet.findingReplays?.candidate390,
    ].filter((section) => section?.status === 'complete');
    const qualifiedTarballs =
      packet.machineReplay?.artifact?.environment?.exactPackageTarballs ??
      candidateArtifactSections[0]?.artifact?.environment?.exactPackageTarballs;
    const candidateArtifactSetValid =
      validTarballSet(qualifiedTarballs, EXPECTED_CANDIDATE_390_REPLAY_VERSIONS) &&
      candidateArtifactSections.every((section) =>
        deepEqual(section.artifact?.environment?.exactPackageTarballs, qualifiedTarballs),
      );
    if (!candidateArtifactSetValid) {
      error(
        'qualification-packet.json: route, finding, adoption, and machine behavior must share the exact six qualified 3.9.4 tarball hashes',
      );
    }

    requirementOverrides.set('HUMAN_REVIEW_IDENTITIES', reviewersValid);
    requirementOverrides.set(
      'HUMAN_ADJUDICATED_FINDING_CORPUS',
      hasFindingCorpus(packet) && reviewersValid && findingSourcesValid,
    );
    requirementOverrides.set('QUALIFIED_ROUTE_CORPUS', hasRouteCorpus(packet) && routeSourcesValid);
    requirementOverrides.set(
      'PUBLIC_383_FINDING_REPLAY',
      hasFindingReplay(packet, 'public383') && publicReleaseValid && publicArtifactValid,
    );
    requirementOverrides.set(
      'CANDIDATE_390_FINDING_REPLAY',
      hasFindingReplay(packet, 'candidate390') &&
        candidateReleaseValid &&
        candidateArtifactValid &&
        candidateArtifactSetValid,
    );
    requirementOverrides.set(
      'CANDIDATE_390_ROUTE_REPLAY',
      hasRouteReplay(packet) && routeArtifactValid && candidateArtifactSetValid,
    );
    requirementOverrides.set(
      'ADOPTION_BOUNDARY_REPLAY',
      hasAdoptionBoundaryReplay(packet) && adoptionArtifactValid && candidateArtifactSetValid,
    );
    requirementOverrides.set(
      'MACHINE_QUALIFICATION_REPLAY',
      hasMachineReplay(packet) &&
        machineArtifactValid &&
        candidateArtifactSetValid &&
        candidatePackageBytesValid,
    );
  }
  const derivedMissingIds = packet
    ? MISSING_REQUIREMENTS.filter((requirement) => {
        const satisfied = requirementOverrides.has(requirement.id)
          ? requirementOverrides.get(requirement.id)
          : requirement.test(packet);
        return !satisfied;
      }).map((requirement) => requirement.id)
    : MISSING_REQUIREMENTS.map((requirement) => requirement.id);
  const declaredMissingIds = array(missingEvidence?.items).map((item) => item.id);
  if (!deepEqual(declaredMissingIds, derivedMissingIds)) {
    error(
      `missing-evidence.json: declared IDs do not match derived blockers (${derivedMissingIds.join(', ')})`,
    );
  }

  if (packet) {
    const complete = derivedMissingIds.length === 0;
    if (complete && (packet.packetStatus !== 'complete' || packet.qualificationClaim !== true)) {
      error(
        'qualification-packet.json: complete evidence requires an explicit qualification claim',
      );
    }
    if (
      !complete &&
      (packet.packetStatus !== 'incomplete' || packet.qualificationClaim !== false)
    ) {
      error('qualification-packet.json: incomplete evidence cannot claim qualification');
    }

    if (hasFindingReplay(packet, 'candidate390') && hasFindingReplay(packet, 'public383')) {
      const candidate = packet.findingReplays.candidate390.metrics;
      const baseline = packet.findingReplays.public383.metrics;
      if (candidate.precision.wilson95.lower < 0.9) {
        error('qualification-packet.json: candidate precision Wilson lower bound is below 0.90');
      }
      if (candidate.recall.estimate < baseline.recall.estimate - 0.05) {
        error('qualification-packet.json: candidate recall regressed by more than 0.05');
      }
    }
  }

  const structurallyValid = errors.length === 0;
  const qualified = structurallyValid && derivedMissingIds.length === 0;
  return {
    status: structurallyValid ? (qualified ? 'pass' : 'incomplete') : 'invalid',
    mode: options.lintOnly ? 'lint-only' : 'release-gate',
    qualificationClaim: qualified,
    sourceVerification: verifyRemoteSources ? 'remote-github' : 'structural',
    candidatePackageVerification: verifyRemoteSources ? 'fresh-pack' : 'structural',
    legacyCounts: {
      routeLabels: array(legacyRoutes?.positiveLabels).length,
      forbiddenAssertions: array(legacyRoutes?.forbiddenAssertions).length,
      findingRows: array(legacyFindings?.labels).length,
      countTowardQualification: false,
    },
    activeCounts: {
      routeCases: array(packet?.routeCorpus?.cases).length,
      angularBrownfieldTargets: array(packet?.routeReplay?.angularBrownfield?.targets).length,
      angularTaskableRoutes:
        packet?.routeReplay?.angularBrownfield?.taskableRouteCount ?? 0,
      findingCases: array(packet?.findingCorpus?.cases).length,
      findingJudgments: array(packet?.findingCorpus?.cases).reduce(
        (sum, item) => sum + array(item.adjudication?.expectedOutputs?.outputs).length,
        0,
      ),
      machineLatencySamples: array(packet?.machineReplay?.latencySamples).length,
      machineTargets: array(packet?.machineReplay?.targetResults).length,
    },
    compatibility: {
      v2Schemas: array(manifest?.v2Compatibility?.schemas).length,
      mcpTools: array(manifest?.mcp?.tools).length,
    },
    missingEvidence: derivedMissingIds,
    errors,
  };
}

async function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (cause) {
    console.error(`Qualification audit failed: ${cause.message}`);
    process.exitCode = 1;
    return;
  }

  const summary = await runAudit(options);
  const lintPassed = summary.errors.length === 0;
  const releasePassed = lintPassed && summary.qualificationClaim;

  if (options.json) console.log(JSON.stringify(summary, null, 2));
  else if (options.lintOnly && lintPassed) {
    console.log(`Decantr 3.9 qualification packet: LINT PASS (${summary.status.toUpperCase()})`);
    if (summary.missingEvidence.length > 0) {
      console.log(
        `Release qualification remains incomplete: ${summary.missingEvidence.join(', ')}`,
      );
    }
  } else if (releasePassed) {
    console.log('Decantr 3.9 release qualification: PASS');
  } else {
    console.error(`Decantr 3.9 release qualification: ${summary.status.toUpperCase()}`);
    for (const issue of summary.errors) console.error(`- ${issue}`);
    for (const id of summary.missingEvidence) console.error(`- missing: ${id}`);
  }

  process.exitCode = options.lintOnly ? (lintPassed ? 0 : 1) : releasePassed ? 0 : 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
