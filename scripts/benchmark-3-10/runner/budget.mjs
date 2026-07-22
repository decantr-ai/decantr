import { mkdir, readFile, rm } from 'node:fs/promises';
import { dirname } from 'node:path';
import { readJsonFile, sha256, writeCanonicalFile } from './canonical.mjs';
import { assertBudgetApproval, assertPowerPilot } from './contracts.mjs';

export async function reserveRunBudget(options) {
  if (!options.paid) {
    return { paid: false, reservedUsd: 0, approvalId: null, ledgerPath: null };
  }
  if (!options.approvalPath) throw new Error('paid execution requires --budget-approval');
  if (!options.ledgerPath) throw new Error('paid execution requires --budget-ledger');
  const pricing = await readJsonFile(options.pricingPath);
  if (pricing.paidPricingLocked !== true) {
    throw new Error('paid execution is disabled until pricing.json contains a reviewed paid pricing lock');
  }
  const lockedModel = pricing.models?.find((item) => item.modelId === options.model.id);
  if (
    !lockedModel ||
    lockedModel.maximumRunCostUsd !== options.model.maxRunCostUsd ||
    !['inputPerMillionTokensUsd', 'cachedInputPerMillionTokensUsd', 'outputPerMillionTokensUsd'].every(
      (field) => Number.isFinite(lockedModel[field]) && lockedModel[field] >= 0,
    )
  ) {
    throw new Error(`paid pricing is not fully locked for ${options.model.id}`);
  }
  let powerPilotSha256 = null;
  let powerPilot = null;
  if (options.requiresPowerPilot) {
    if (!options.powerPilotPath) {
      throw new Error('paid qualification execution requires --power-pilot');
    }
    const powerPilotBytes = await readFile(options.powerPilotPath);
    powerPilotSha256 = sha256(powerPilotBytes);
    powerPilot = assertPowerPilot(JSON.parse(powerPilotBytes), {
      runPlanSha256: options.runPlanSha256,
      candidateTarballSetSha256: options.candidateTarballSetSha256,
      developmentTaskCount: options.developmentTaskCount,
    });
    if (Date.parse(powerPilot.qualificationExecutionOpenedAt) > Date.now()) {
      throw new Error('qualification execution has not opened under the frozen power pilot');
    }
  }
  const approval = assertBudgetApproval(await readJsonFile(options.approvalPath), {
    runPlanSha256: options.runPlanSha256,
    candidateTarballSetSha256: options.candidateTarballSetSha256,
    modelId: options.model.id,
    protocolMaximumUsd: options.protocolMaximumUsd,
    powerPilotSha256,
  });
  if (powerPilot && Date.parse(approval.approvedAt) < Date.parse(powerPilot.frozenAt)) {
    throw new Error('qualification budget approval predates the frozen power pilot');
  }
  const reservation = Number(options.model.maxRunCostUsd);
  if (!Number.isFinite(reservation) || reservation <= 0) throw new Error('model maximum run cost is invalid');

  await withLedgerLock(options.ledgerPath, async () => {
    const ledger = await readLedger(options.ledgerPath, {
      runPlanSha256: options.runPlanSha256,
      approvalId: approval.approvalId,
      maximumSpendUsd: approval.maximumSpendUsd,
    });
    if (ledger.runPlanSha256 !== options.runPlanSha256 || ledger.approvalId !== approval.approvalId) {
      throw new Error('budget ledger is bound to a different plan or approval');
    }
    if (ledger.reservations[options.runId]) throw new Error(`budget already reserved for ${options.runId}`);
    const committed = Object.values(ledger.reservations).reduce(
      (total, item) => total + (item.status === 'reserved' ? item.reservedUsd : item.actualUsd),
      0,
    );
    if (committed + reservation > approval.maximumSpendUsd + Number.EPSILON) {
      throw new Error(
        `aggregate budget exhausted: $${committed.toFixed(2)} committed, $${reservation.toFixed(2)} requested`,
      );
    }
    ledger.reservations[options.runId] = {
      modelId: options.model.id,
      reservedUsd: reservation,
      actualUsd: 0,
      status: 'reserved',
    };
    await writeCanonicalFile(options.ledgerPath, ledger);
  });
  return {
    paid: true,
    reservedUsd: reservation,
    approvalId: approval.approvalId,
    ledgerPath: options.ledgerPath,
  };
}

export async function settleRunBudget(reservation, runId, actualUsd) {
  if (!reservation.paid) {
    if (actualUsd !== 0) throw new Error('a no-cost run reported non-zero model cost');
    return;
  }
  if (!Number.isFinite(actualUsd) || actualUsd < 0) throw new Error('actual model cost is invalid');
  await withLedgerLock(reservation.ledgerPath, async () => {
    const ledger = JSON.parse(await readFile(reservation.ledgerPath, 'utf8'));
    const entry = ledger.reservations?.[runId];
    if (!entry || entry.status !== 'reserved') throw new Error(`missing active reservation for ${runId}`);
    entry.actualUsd = actualUsd;
    entry.status = actualUsd > reservation.reservedUsd + Number.EPSILON ? 'breach' : 'settled';
    await writeCanonicalFile(reservation.ledgerPath, ledger);
  });
  if (actualUsd > reservation.reservedUsd + Number.EPSILON) {
    throw new Error(`actual cost $${actualUsd} exceeds the $${reservation.reservedUsd} reservation`);
  }
}

async function readLedger(path, defaults) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
    return {
      schemaVersion: 'decantr-benchmark-budget-ledger.v1',
      ...defaults,
      reservations: {},
    };
  }
}

async function withLedgerLock(path, callback) {
  await mkdir(dirname(path), { recursive: true });
  const lock = `${path}.lock`;
  const deadline = Date.now() + 10_000;
  while (true) {
    try {
      await mkdir(lock);
      break;
    } catch (error) {
      if (error?.code !== 'EEXIST') throw error;
      if (Date.now() >= deadline) throw new Error(`timed out acquiring budget ledger lock: ${lock}`);
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
  }
  try {
    return await callback();
  } finally {
    await rm(lock, { recursive: true, force: true });
  }
}
