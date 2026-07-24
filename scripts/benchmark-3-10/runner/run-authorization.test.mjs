import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  assertRunAuthorization,
  buildRunAuthorization,
  verifyRunAuthorization,
} from './run-authorization.mjs';
import {
  prettyCanonicalJson,
  sha256,
} from './canonical.mjs';
import { AUTHORIZATION_STATEMENT } from './contracts.mjs';

const expected = {
  runId: 'run-authorization-fixture',
  partition: 'qualification',
  modelId: 'openai-gpt-5.6-sol',
  runPlanSha256: '1'.repeat(64),
  candidateManifestSha256: '2'.repeat(64),
  candidateTarballSetSha256: '3'.repeat(64),
  maxRunCostUsd: 10,
  protocolMaximumUsd: 4160,
  developmentTaskCount: 24,
};
const now = '2026-07-24T16:00:00.000Z';

test('qualification authorization binds canonical approval and power-pilot bytes', async () => {
  const root = await mkdtemp(join(tmpdir(), 'decantr-run-authorization-'));
  const powerPilotPath = join(root, 'power-pilot.json');
  const budgetApprovalPath = join(root, 'budget-approval.json');
  const authorizationPath = join(root, 'authorization.json');
  const powerPilot = {
    schemaVersion: 'decantr-benchmark-power-pilot.v1',
    program: 'decantr-3.10-ui-change-control-proof',
    frozenAt: '2026-07-24T14:00:00.000Z',
    qualificationExecutionOpenedAt: '2026-07-24T15:00:00.000Z',
    runPlanSha256: expected.runPlanSha256,
    candidateTarballSetSha256:
      expected.candidateTarballSetSha256,
    developmentRunRecordSetSha256: '4'.repeat(64),
    analysisCodeSha256: '5'.repeat(64),
    analysisSeed: 'qualification-power-seed',
    developmentTaskCount: expected.developmentTaskCount,
    targetEffectPoints: 5,
    alpha: 0.05,
    estimatedPower: 0.84,
    method:
      'Frozen paired development simulation over the complete development record set.',
  };
  await writeFile(powerPilotPath, prettyCanonicalJson(powerPilot));
  const powerPilotSha256 = sha256(await readFile(powerPilotPath));
  const approval = {
    schemaVersion: 'decantr-benchmark-budget-approval.v1',
    approvalId: 'approval-qualification-fixture',
    program: 'decantr-3.10-ui-change-control-proof',
    approvedBy: 'David Aimi',
    approvedAt: '2026-07-24T14:30:00.000Z',
    expiresAt: '2026-07-25T00:00:00.000Z',
    maximumSpendUsd: 4160,
    runPlanSha256: expected.runPlanSha256,
    candidateTarballSetSha256:
      expected.candidateTarballSetSha256,
    modelIds: [expected.modelId],
    powerPilotSha256,
    authorizationStatement: AUTHORIZATION_STATEMENT,
  };
  await writeFile(budgetApprovalPath, prettyCanonicalJson(approval));

  const built = await buildRunAuthorization({
    ...expected,
    paid: true,
    budgetApprovalPath,
    powerPilotPath,
    outputPath: authorizationPath,
    now,
  });
  const verified = await verifyRunAuthorization({
    authorizationPath,
    expected,
    paid: true,
    now,
  });

  assert.equal(verified.sha256, built.sha256);
  assert.equal(
    verified.authorization.budgetApproval.approvalId,
    approval.approvalId,
  );
  assert.equal(
    verified.authorization.powerPilot.sha256,
    powerPilotSha256,
  );
});

test('no-cost authorization rejects paid companion material', async () => {
  const root = await mkdtemp(join(tmpdir(), 'decantr-run-authorization-'));
  const authorizationPath = join(root, 'authorization.json');
  const built = await buildRunAuthorization({
    ...expected,
    partition: 'development',
    paid: false,
    outputPath: authorizationPath,
    now,
  });
  assert.equal(built.authorization.paid, false);
  assert.equal(built.authorization.budgetApproval, null);

  await assert.rejects(
    buildRunAuthorization({
      ...expected,
      partition: 'development',
      paid: false,
      budgetApprovalPath: join(root, 'budget-approval.json'),
      outputPath: authorizationPath,
      now,
    }),
    /must not include paid approval material/u,
  );
});

test('budget approval cannot become effective in the future', async () => {
  const root = await mkdtemp(join(tmpdir(), 'decantr-run-authorization-'));
  const budgetApprovalPath = join(root, 'budget-approval.json');
  await writeFile(
    budgetApprovalPath,
    prettyCanonicalJson({
      schemaVersion: 'decantr-benchmark-budget-approval.v1',
      approvalId: 'approval-future-fixture',
      program: 'decantr-3.10-ui-change-control-proof',
      approvedBy: 'David Aimi',
      approvedAt: '2026-07-24T17:00:00.000Z',
      expiresAt: '2026-07-25T00:00:00.000Z',
      maximumSpendUsd: 20,
      runPlanSha256: expected.runPlanSha256,
      candidateTarballSetSha256:
        expected.candidateTarballSetSha256,
      modelIds: [expected.modelId],
      authorizationStatement: AUTHORIZATION_STATEMENT,
    }),
  );
  await assert.rejects(
    buildRunAuthorization({
      ...expected,
      partition: 'development',
      paid: true,
      budgetApprovalPath,
      outputPath: join(root, 'authorization.json'),
      now,
    }),
    /not yet effective/u,
  );
});

test('authorization companion paths cannot escape their artifact root', () => {
  assert.throws(
    () =>
      assertRunAuthorization({
        schemaVersion:
          'decantr-benchmark-run-authorization.v1',
        program: 'decantr-3.10-ui-change-control-proof',
        runId: expected.runId,
        partition: 'development',
        modelId: expected.modelId,
        paid: true,
        runPlanSha256: expected.runPlanSha256,
        candidateManifestSha256:
          expected.candidateManifestSha256,
        candidateTarballSetSha256:
          expected.candidateTarballSetSha256,
        reservedRunCostUsd: expected.maxRunCostUsd,
        protocolMaximumUsd: expected.protocolMaximumUsd,
        developmentTaskCount: expected.developmentTaskCount,
        budgetApproval: {
          path: '../budget-approval.json',
          sha256: '4'.repeat(64),
          bytes: 100,
          approvalId: 'approval-fixture',
          maximumSpendUsd: 20,
        },
        powerPilot: null,
      }),
    /file binding is invalid/u,
  );
});
