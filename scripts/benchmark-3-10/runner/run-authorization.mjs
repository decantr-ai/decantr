#!/usr/bin/env node
import { lstat, readFile } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  prettyCanonicalJson,
  sha256,
  writeCanonicalFile,
} from './canonical.mjs';
import {
  assertBudgetApproval,
  assertPowerPilot,
} from './contracts.mjs';

export const RUN_AUTHORIZATION_SCHEMA_VERSION =
  'decantr-benchmark-run-authorization.v1';

const PROGRAM = 'decantr-3.10-ui-change-control-proof';
const SHA256 = /^[a-f0-9]{64}$/u;

export async function buildRunAuthorization(options) {
  const expected = normalizeExpected(options);
  const paid = options.paid === true;
  let budgetApproval = null;
  let powerPilot = null;

  if (paid) {
    if (!options.budgetApprovalPath) {
      throw new Error('paid run authorization requires a budget approval file');
    }
    budgetApproval = await loadBudgetApproval({
      path: options.budgetApprovalPath,
      expected,
      now: options.now,
      powerPilotSha256: await expectedPowerPilotSha256(options, expected),
    });
    if (expected.partition === 'qualification') {
      powerPilot = await loadPowerPilot({
        path: options.powerPilotPath,
        expected,
        now: options.now,
      });
      if (budgetApproval.value.powerPilotSha256 !== powerPilot.binding.sha256) {
        throw new Error('budget approval is bound to a different power pilot');
      }
      if (
        Date.parse(budgetApproval.value.approvedAt) <
        Date.parse(powerPilot.value.frozenAt)
      ) {
        throw new Error(
          'qualification budget approval predates the frozen power pilot',
        );
      }
    } else if (options.powerPilotPath) {
      throw new Error(
        'development run authorization must not include a qualification power pilot',
      );
    } else if (
      budgetApproval.value.powerPilotSha256 !== undefined
    ) {
      throw new Error(
        'development run authorization requires the preliminary approval without a power-pilot binding',
      );
    }
  } else if (options.budgetApprovalPath || options.powerPilotPath) {
    throw new Error(
      'no-cost run authorization must not include paid approval material',
    );
  }

  const authorization = assertRunAuthorization({
    schemaVersion: RUN_AUTHORIZATION_SCHEMA_VERSION,
    program: PROGRAM,
    runId: expected.runId,
    partition: expected.partition,
    modelId: expected.modelId,
    paid,
    runPlanSha256: expected.runPlanSha256,
    candidateManifestSha256: expected.candidateManifestSha256,
    candidateTarballSetSha256: expected.candidateTarballSetSha256,
    reservedRunCostUsd: paid ? expected.maxRunCostUsd : 0,
    protocolMaximumUsd: expected.protocolMaximumUsd,
    developmentTaskCount: expected.developmentTaskCount,
    budgetApproval: budgetApproval
      ? {
          ...budgetApproval.binding,
          approvalId: budgetApproval.value.approvalId,
          maximumSpendUsd: budgetApproval.value.maximumSpendUsd,
        }
      : null,
    powerPilot: powerPilot?.binding ?? null,
  });
  await writeCanonicalFile(options.outputPath, authorization);
  const bytes = await readFile(options.outputPath);
  return {
    authorization,
    bytes,
    sha256: sha256(bytes),
    budgetApproval: budgetApproval?.value ?? null,
    budgetApprovalBytes: budgetApproval?.bytes ?? null,
    powerPilot: powerPilot?.value ?? null,
    powerPilotBytes: powerPilot?.bytes ?? null,
  };
}

export async function verifyRunAuthorization(options) {
  const expected = normalizeExpected(options.expected);
  const authorizationPath = resolve(options.authorizationPath);
  const bytes = await readFile(authorizationPath);
  const authorization = assertRunAuthorization(JSON.parse(bytes));
  if (!bytes.equals(Buffer.from(prettyCanonicalJson(authorization), 'utf8'))) {
    throw new Error('run authorization file is not canonical');
  }
  if (
    options.expectedSha256 &&
    sha256(bytes) !== options.expectedSha256
  ) {
    throw new Error('run authorization file digest mismatch');
  }
  for (const key of [
    'runId',
    'partition',
    'modelId',
    'runPlanSha256',
    'candidateManifestSha256',
    'candidateTarballSetSha256',
    'protocolMaximumUsd',
    'developmentTaskCount',
  ]) {
    if (authorization[key] !== expected[key]) {
      throw new Error(`run authorization ${key} binding mismatch`);
    }
  }
  if (
    authorization.paid !== (options.paid === true) ||
    authorization.reservedRunCostUsd !==
      (authorization.paid ? expected.maxRunCostUsd : 0)
  ) {
    throw new Error('run authorization paid mode or reservation mismatch');
  }

  let budgetApproval = null;
  let powerPilot = null;
  if (authorization.paid) {
    const root = dirname(authorizationPath);
    const powerPilotPath =
      options.powerPilotPath ??
      (authorization.powerPilot
        ? resolve(root, authorization.powerPilot.path)
        : null);
    if (authorization.partition === 'qualification') {
      powerPilot = await loadPowerPilot({
        path: powerPilotPath,
        expected,
        now: options.now,
        binding: authorization.powerPilot,
        ignoreBindingPath:
          options.retainedCompanionPaths === true,
      });
    }
    const budgetApprovalPath =
      options.budgetApprovalPath ??
      resolve(root, authorization.budgetApproval.path);
    budgetApproval = await loadBudgetApproval({
      path: budgetApprovalPath,
      expected,
      now: options.now,
      powerPilotSha256: powerPilot?.binding.sha256 ?? null,
      binding: authorization.budgetApproval,
      ignoreBindingPath:
        options.retainedCompanionPaths === true,
    });
    if (
      authorization.budgetApproval.approvalId !==
        budgetApproval.value.approvalId ||
      authorization.budgetApproval.maximumSpendUsd !==
        budgetApproval.value.maximumSpendUsd
    ) {
      throw new Error(
        'run authorization budget approval metadata mismatch',
      );
    }
    if (
      authorization.partition === 'development' &&
      budgetApproval.value.powerPilotSha256 !== undefined
    ) {
      throw new Error(
        'development run authorization requires the preliminary approval without a power-pilot binding',
      );
    }
    if (
      powerPilot &&
      Date.parse(budgetApproval.value.approvedAt) <
        Date.parse(powerPilot.value.frozenAt)
    ) {
      throw new Error(
        'qualification budget approval predates the frozen power pilot',
      );
    }
  }
  return {
    authorization,
    bytes,
    sha256: sha256(bytes),
    budgetApproval: budgetApproval?.value ?? null,
    budgetApprovalBytes: budgetApproval?.bytes ?? null,
    powerPilot: powerPilot?.value ?? null,
    powerPilotBytes: powerPilot?.bytes ?? null,
  };
}

export function assertRunAuthorization(value) {
  assertExactKeys(
    value,
    [
      'budgetApproval',
      'candidateManifestSha256',
      'candidateTarballSetSha256',
      'developmentTaskCount',
      'modelId',
      'paid',
      'partition',
      'powerPilot',
      'program',
      'protocolMaximumUsd',
      'reservedRunCostUsd',
      'runId',
      'runPlanSha256',
      'schemaVersion',
    ],
    'run authorization',
  );
  if (
    value.schemaVersion !== RUN_AUTHORIZATION_SCHEMA_VERSION ||
    value.program !== PROGRAM ||
    typeof value.runId !== 'string' ||
    value.runId === '' ||
    !['development', 'qualification'].includes(value.partition) ||
    typeof value.modelId !== 'string' ||
    value.modelId === '' ||
    typeof value.paid !== 'boolean' ||
    !Number.isFinite(value.reservedRunCostUsd) ||
    value.reservedRunCostUsd < 0 ||
    !Number.isFinite(value.protocolMaximumUsd) ||
    value.protocolMaximumUsd <= 0 ||
    value.protocolMaximumUsd > 4160 ||
    !Number.isInteger(value.developmentTaskCount) ||
    value.developmentTaskCount < 1
  ) {
    throw new Error('run authorization identity or budget is invalid');
  }
  for (const key of [
    'runPlanSha256',
    'candidateManifestSha256',
    'candidateTarballSetSha256',
  ]) {
    if (!SHA256.test(value[key] ?? '')) {
      throw new Error(`run authorization ${key} is invalid`);
    }
  }
  if (value.paid) {
    assertApprovalBinding(value.budgetApproval);
    if (value.reservedRunCostUsd <= 0) {
      throw new Error('paid run authorization reservation is invalid');
    }
    if (value.partition === 'qualification') {
      assertFileBinding(value.powerPilot, 'run authorization power pilot');
    } else if (value.powerPilot !== null) {
      throw new Error(
        'development run authorization must not bind a power pilot',
      );
    }
  } else if (
    value.reservedRunCostUsd !== 0 ||
    value.budgetApproval !== null ||
    value.powerPilot !== null
  ) {
    throw new Error('no-cost run authorization contains paid material');
  }
  return value;
}

async function expectedPowerPilotSha256(options, expected) {
  if (expected.partition !== 'qualification') return null;
  const loaded = await loadPowerPilot({
    path: options.powerPilotPath,
    expected,
    now: options.now,
  });
  return loaded.binding.sha256;
}

async function loadBudgetApproval(options) {
  const loaded = await loadCanonicalBoundFile(
    options.path,
    options.binding,
    'budget approval',
    options.ignoreBindingPath,
  );
  const value = assertBudgetApproval(JSON.parse(loaded.bytes), {
    runPlanSha256: options.expected.runPlanSha256,
    candidateTarballSetSha256:
      options.expected.candidateTarballSetSha256,
    modelId: options.expected.modelId,
    protocolMaximumUsd: options.expected.protocolMaximumUsd,
    powerPilotSha256: options.powerPilotSha256,
    now: normalizedNow(options.now),
  });
  if (value.maximumSpendUsd < options.expected.maxRunCostUsd) {
    throw new Error(
      'budget approval is smaller than the requested run reservation',
    );
  }
  return { ...loaded, value };
}

async function loadPowerPilot(options) {
  if (!options.path) {
    throw new Error(
      'qualification run authorization requires a power-pilot file',
    );
  }
  const loaded = await loadCanonicalBoundFile(
    options.path,
    options.binding,
    'power pilot',
    options.ignoreBindingPath,
  );
  const value = assertPowerPilot(JSON.parse(loaded.bytes), {
    runPlanSha256: options.expected.runPlanSha256,
    candidateTarballSetSha256:
      options.expected.candidateTarballSetSha256,
    developmentTaskCount: options.expected.developmentTaskCount,
  });
  if (
    Date.parse(value.qualificationExecutionOpenedAt) >
    normalizedNow(options.now)
  ) {
    throw new Error(
      'qualification execution has not opened under the frozen power pilot',
    );
  }
  return { ...loaded, value };
}

async function loadCanonicalBoundFile(
  path,
  expectedBinding,
  label,
  ignoreBindingPath = false,
) {
  if (!path) throw new Error(`${label} path is required`);
  const absolute = resolve(path);
  const metadata = await lstat(absolute);
  if (!metadata.isFile() || metadata.isSymbolicLink()) {
    throw new Error(`${label} is not a regular file`);
  }
  const bytes = await readFile(absolute);
  const value = JSON.parse(bytes);
  if (!bytes.equals(Buffer.from(prettyCanonicalJson(value), 'utf8'))) {
    throw new Error(`${label} file is not canonical`);
  }
  const binding = {
    path: basename(absolute),
    sha256: sha256(bytes),
    bytes: bytes.byteLength,
  };
  if (
    expectedBinding &&
    ((!ignoreBindingPath &&
      expectedBinding.path !== binding.path) ||
      expectedBinding.sha256 !== binding.sha256 ||
      expectedBinding.bytes !== binding.bytes)
  ) {
    throw new Error(`${label} file binding mismatch`);
  }
  return { binding, bytes };
}

function normalizeExpected(options) {
  const expected = {
    runId: options.runId,
    partition: options.partition,
    modelId: options.modelId,
    runPlanSha256: options.runPlanSha256,
    candidateManifestSha256: options.candidateManifestSha256,
    candidateTarballSetSha256: options.candidateTarballSetSha256,
    maxRunCostUsd: options.maxRunCostUsd,
    protocolMaximumUsd: options.protocolMaximumUsd,
    developmentTaskCount: options.developmentTaskCount,
  };
  if (
    typeof expected.runId !== 'string' ||
    expected.runId === '' ||
    !['development', 'qualification'].includes(expected.partition) ||
    typeof expected.modelId !== 'string' ||
    expected.modelId === '' ||
    !Number.isFinite(expected.maxRunCostUsd) ||
    expected.maxRunCostUsd <= 0 ||
    !Number.isFinite(expected.protocolMaximumUsd) ||
    expected.protocolMaximumUsd <= 0 ||
    !Number.isInteger(expected.developmentTaskCount) ||
    expected.developmentTaskCount < 1
  ) {
    throw new Error('run authorization expected identity is invalid');
  }
  for (const key of [
    'runPlanSha256',
    'candidateManifestSha256',
    'candidateTarballSetSha256',
  ]) {
    if (!SHA256.test(expected[key] ?? '')) {
      throw new Error(`run authorization expected ${key} is invalid`);
    }
  }
  return expected;
}

function assertApprovalBinding(binding) {
  assertExactKeys(
    binding,
    ['approvalId', 'bytes', 'maximumSpendUsd', 'path', 'sha256'],
    'run authorization budget approval',
  );
  assertFileBinding(binding, 'run authorization budget approval', [
    'approvalId',
    'maximumSpendUsd',
  ]);
  if (
    typeof binding.approvalId !== 'string' ||
    binding.approvalId === '' ||
    !Number.isFinite(binding.maximumSpendUsd) ||
    binding.maximumSpendUsd <= 0
  ) {
    throw new Error('run authorization budget approval metadata is invalid');
  }
}

function assertFileBinding(binding, label, extraKeys = []) {
  assertExactKeys(
    binding,
    ['bytes', 'path', 'sha256', ...extraKeys],
    label,
  );
  if (
    typeof binding.path !== 'string' ||
    binding.path === '' ||
    binding.path !== basename(binding.path) ||
    !SHA256.test(binding.sha256 ?? '') ||
    !Number.isInteger(binding.bytes) ||
    binding.bytes < 1
  ) {
    throw new Error(`${label} file binding is invalid`);
  }
}

function assertExactKeys(value, keys, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (
    actual.length !== expected.length ||
    actual.some((key, index) => key !== expected[index])
  ) {
    throw new Error(`${label} fields are invalid`);
  }
}

function normalizedNow(value) {
  if (value === undefined) return Date.now();
  const parsed =
    typeof value === 'number' ? value : Date.parse(String(value));
  if (!Number.isFinite(parsed)) {
    throw new Error('run authorization validation time is invalid');
  }
  return parsed;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.stderr.write(
    'run-authorization.mjs is a library; use the split-input producer\n',
  );
  process.exitCode = 1;
}
