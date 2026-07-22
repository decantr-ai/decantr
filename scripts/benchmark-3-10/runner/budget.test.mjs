import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { prettyCanonicalJson, sha256, sha256Canonical } from './canonical.mjs';
import { AUTHORIZATION_STATEMENT } from './contracts.mjs';
import { reserveRunBudget, settleRunBudget } from './budget.mjs';

test('budget ledger atomically reserves aggregate maxima and releases only the unused settled amount', async () => {
  const root = await mkdtemp(join(tmpdir(), 'budget-test-'));
  try {
    const planSha256 = sha256Canonical({ plan: 'fixture' });
    const candidateTarballSetSha256 = sha256Canonical({ candidate: 'fixture' });
    const approvalPath = join(root, 'approval.json');
    const pricingPath = join(root, 'pricing.json');
    const ledgerPath = join(root, 'ledger.json');
    const model = { id: 'model-fixture', maxRunCostUsd: 6 };
    await writeFile(
      approvalPath,
      prettyCanonicalJson({
        schemaVersion: 'decantr-benchmark-budget-approval.v1',
        approvalId: 'approval-fixture',
        program: 'decantr-3.10-ui-change-control-proof',
        approvedBy: 'Fixture Maintainer',
        approvedAt: '2026-07-22T10:00:00.000Z',
        expiresAt: '2099-07-22T10:00:00.000Z',
        maximumSpendUsd: 10,
        runPlanSha256: planSha256,
        candidateTarballSetSha256,
        modelIds: [model.id],
        authorizationStatement: AUTHORIZATION_STATEMENT,
      }),
    );
    await writeFile(
      pricingPath,
      prettyCanonicalJson({
        paidPricingLocked: true,
        models: [
          {
            modelId: model.id,
            maximumRunCostUsd: 6,
            inputPerMillionTokensUsd: 1,
            cachedInputPerMillionTokensUsd: 0.5,
            outputPerMillionTokensUsd: 2,
          },
        ],
      }),
    );
    const base = {
      paid: true,
      approvalPath,
      ledgerPath,
      pricingPath,
      runPlanSha256: planSha256,
      candidateTarballSetSha256,
      model,
      protocolMaximumUsd: 4160,
    };
    await assert.rejects(
      reserveRunBudget({
        ...base,
        runId: 'qualification-without-power-pilot',
        requiresPowerPilot: true,
        developmentTaskCount: 24,
      }),
      /paid qualification execution requires --power-pilot/u,
    );
    const first = await reserveRunBudget({ ...base, runId: 'run-one' });
    await assert.rejects(reserveRunBudget({ ...base, runId: 'run-two' }), /aggregate budget exhausted/u);
    await settleRunBudget(first, 'run-one', 4);
    const second = await reserveRunBudget({ ...base, runId: 'run-two' });
    await settleRunBudget(second, 'run-two', 6);
    const ledger = JSON.parse(await readFile(ledgerPath, 'utf8'));
    assert.equal(ledger.reservations['run-one'].actualUsd, 4);
    assert.equal(ledger.reservations['run-two'].actualUsd, 6);
    assert.equal(ledger.reservations['run-two'].status, 'settled');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('qualification reservation requires a frozen power pilot bound by the approval', async () => {
  const root = await mkdtemp(join(tmpdir(), 'qualification-budget-test-'));
  try {
    const runPlanSha256 = sha256Canonical({ plan: 'qualification' });
    const candidateTarballSetSha256 = sha256Canonical({ candidate: 'qualification' });
    const powerPilotPath = join(root, 'power-pilot.json');
    await writeFile(
      powerPilotPath,
      prettyCanonicalJson({
        schemaVersion: 'decantr-benchmark-power-pilot.v1',
        program: 'decantr-3.10-ui-change-control-proof',
        frozenAt: '2020-01-01T01:00:00.000Z',
        qualificationExecutionOpenedAt: '2020-01-01T02:00:00.000Z',
        runPlanSha256,
        candidateTarballSetSha256,
        developmentRunRecordSetSha256: sha256Canonical({ development: true }),
        analysisCodeSha256: sha256Canonical({ analysis: true }),
        analysisSeed: 'qualification-power-seed-0001',
        developmentTaskCount: 24,
        targetEffectPoints: 5,
        alpha: 0.05,
        estimatedPower: 0.8,
        method: 'Paired development-task simulation frozen before qualification.',
      }),
    );
    const powerPilotSha256 = sha256(await readFile(powerPilotPath));
    const model = { id: 'model-fixture', maxRunCostUsd: 6 };
    const approvalPath = join(root, 'approval.json');
    await writeFile(
      approvalPath,
      prettyCanonicalJson({
        schemaVersion: 'decantr-benchmark-budget-approval.v1',
        approvalId: 'approval-qualification-fixture',
        program: 'decantr-3.10-ui-change-control-proof',
        approvedBy: 'Fixture Maintainer',
        approvedAt: '2020-01-01T01:30:00.000Z',
        expiresAt: '2099-01-01T00:00:00.000Z',
        maximumSpendUsd: 6,
        runPlanSha256,
        candidateTarballSetSha256,
        modelIds: [model.id],
        powerPilotSha256,
        authorizationStatement: AUTHORIZATION_STATEMENT,
      }),
    );
    const pricingPath = join(root, 'pricing.json');
    await writeFile(
      pricingPath,
      prettyCanonicalJson({
        paidPricingLocked: true,
        models: [
          {
            modelId: model.id,
            maximumRunCostUsd: 6,
            inputPerMillionTokensUsd: 1,
            cachedInputPerMillionTokensUsd: 0.5,
            outputPerMillionTokensUsd: 2,
          },
        ],
      }),
    );
    const reservation = await reserveRunBudget({
      paid: true,
      approvalPath,
      ledgerPath: join(root, 'ledger.json'),
      pricingPath,
      runPlanSha256,
      candidateTarballSetSha256,
      model,
      protocolMaximumUsd: 4160,
      runId: 'qualification-run',
      requiresPowerPilot: true,
      powerPilotPath,
      developmentTaskCount: 24,
    });
    assert.equal(reservation.paid, true);
    assert.equal(reservation.reservedUsd, 6);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
