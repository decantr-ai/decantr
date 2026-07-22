#!/usr/bin/env node
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prettyCanonicalJson, readJsonFile, sha256Canonical, writeContentAddressed } from './canonical.mjs';
import { assertRunPlan } from './contracts.mjs';
import { resolveContained } from './process.mjs';
import { runOne } from './run-one.mjs';

export async function runSuite(options, execute = runOne) {
  const plan = assertRunPlan(await readJsonFile(options.planPath));
  const selected = selectRuns(plan, options.runIds, options.limit);
  const results = [];
  for (const run of selected) {
    const task = plan.tasks.find((item) => item.taskId === run.taskId);
    const taskRoot = task.partition === 'qualification' ? options.qualificationTaskRoot : options.developmentTaskRoot;
    const environmentRoot = task.partition === 'qualification'
      ? options.qualificationEnvironmentRoot
      : options.developmentEnvironmentRoot;
    try {
      const taskManifestPath = resolveContained(taskRoot, task.sourceRef, `${task.taskId}: task manifest`);
      const evaluatorContractPath = resolveContained(
        options.evaluatorRoot,
        join('contracts', `${task.taskId}.json`),
        `${task.taskId}: evaluator contract`,
      );
      const workspace = resolveContained(options.workspaceRoot, run.runId, `${run.runId}: workspace`);
      const environmentSpecPath = resolveContained(
        environmentRoot,
        join('specs', `${task.taskId}.json`),
        `${task.taskId}: environment spec`,
      );
      const preparedEnvironmentPath = resolveContained(
        options.preparedEnvironmentRoot,
        `${task.taskId}.json`,
        `${task.taskId}: prepared environment attestation`,
      );
      const result = await execute({
        planPath: options.planPath,
        runId: run.runId,
        modelId: run.modelId,
        arm: run.arm,
        repetition: run.repetition,
        workspace,
        taskManifestPath,
        evaluatorContractPath,
        evaluatorRoot: options.evaluatorRoot,
        evaluatorRuntimeRoot: options.evaluatorRuntimeRoot,
        evaluatorBrowsersPath: options.evaluatorBrowsersPath,
        candidateManifestPath: options.candidateManifestPath,
        candidateRuntimeRoot: options.candidateRuntimeRoot,
        environmentSpecPath,
        runtimeMatrixPath: options.runtimeMatrixPath,
        preparedEnvironmentPath,
        outputRoot: options.outputRoot,
        modelsPath: options.modelsPath,
        protocolPath: options.protocolPath,
        pricingPath: options.pricingPath,
        adapterCommand: options.adapterCommand,
        adapterArgs: options.adapterArgs,
        allowExternalNoCostAdapter: options.allowExternalNoCostAdapter,
        paid: options.paid,
        budgetApprovalPath: options.budgetApprovalPath,
        budgetLedgerPath: options.budgetLedgerPath,
        powerPilotPath: options.powerPilotPath,
      });
      results.push({
        runId: run.runId,
        status: result.record.status,
        recordSha256: result.recordSha256,
        error: null,
      });
    } catch (error) {
      results.push({
        runId: run.runId,
        status: 'harness_failure',
        recordSha256: null,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  const manifest = {
    schemaVersion: 'decantr-benchmark-run-suite-manifest.v1',
    runPlanSha256: plan.planSha256,
    selectedRunSetSha256: sha256Canonical(selected.map((run) => run.runId)),
    expectedRuns: plan.runs.length,
    attemptedRuns: selected.length,
    complete: selected.length === plan.runs.length && results.every((item) => item.recordSha256 !== null),
    passed: results.filter((item) => item.status === 'completed').length,
    failed: results.filter((item) => item.status !== 'completed').length,
    results,
  };
  const artifact = await writeContentAddressed(options.outputRoot, 'run-suite-manifests', manifest);
  return { manifest, manifestSha256: artifact.digest, manifestPath: artifact.path };
}

export function selectRuns(plan, requestedRunIds = [], limit = null) {
  const requested = new Set(requestedRunIds ?? []);
  for (const runId of requested) {
    if (!plan.runs.some((run) => run.runId === runId)) throw new Error(`requested run is not in plan: ${runId}`);
  }
  let selected = requested.size > 0 ? plan.runs.filter((run) => requested.has(run.runId)) : [...plan.runs];
  if (limit !== null) {
    if (!Number.isInteger(limit) || limit < 1) throw new Error('--limit must be a positive integer');
    selected = selected.slice(0, limit);
  }
  return selected;
}

function parseArgs(argv) {
  const options = {
    modelsPath: resolve(fileURLToPath(new URL('../models.json', import.meta.url))),
    protocolPath: resolve(fileURLToPath(new URL('../protocol.json', import.meta.url))),
    pricingPath: resolve(fileURLToPath(new URL('../model-proxy/pricing.json', import.meta.url))),
    adapterArgs: [],
    runIds: [],
    limit: null,
    paid: false,
    allowExternalNoCostAdapter: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--plan') options.planPath = resolve(argv[++index]);
    else if (argument === '--workspace-root') options.workspaceRoot = resolve(argv[++index]);
    else if (argument === '--development-task-root') options.developmentTaskRoot = resolve(argv[++index]);
    else if (argument === '--qualification-task-root') options.qualificationTaskRoot = resolve(argv[++index]);
    else if (argument === '--development-environment-root') options.developmentEnvironmentRoot = resolve(argv[++index]);
    else if (argument === '--qualification-environment-root') options.qualificationEnvironmentRoot = resolve(argv[++index]);
    else if (argument === '--evaluator-root') options.evaluatorRoot = resolve(argv[++index]);
    else if (argument === '--evaluator-runtime-root') options.evaluatorRuntimeRoot = resolve(argv[++index]);
    else if (argument === '--evaluator-browsers-path') options.evaluatorBrowsersPath = resolve(argv[++index]);
    else if (argument === '--candidate-manifest') options.candidateManifestPath = resolve(argv[++index]);
    else if (argument === '--candidate-runtime-root') options.candidateRuntimeRoot = resolve(argv[++index]);
    else if (argument === '--runtime-matrix') options.runtimeMatrixPath = resolve(argv[++index]);
    else if (argument === '--prepared-environment-root') options.preparedEnvironmentRoot = resolve(argv[++index]);
    else if (argument === '--output-root') options.outputRoot = resolve(argv[++index]);
    else if (argument === '--models') options.modelsPath = resolve(argv[++index]);
    else if (argument === '--protocol') options.protocolPath = resolve(argv[++index]);
    else if (argument === '--pricing') options.pricingPath = resolve(argv[++index]);
    else if (argument === '--adapter-command') options.adapterCommand = argv[++index];
    else if (argument === '--adapter-arg') options.adapterArgs.push(argv[++index]);
    else if (argument === '--allow-external-no-cost-adapter') options.allowExternalNoCostAdapter = true;
    else if (argument === '--paid') options.paid = true;
    else if (argument === '--budget-approval') options.budgetApprovalPath = resolve(argv[++index]);
    else if (argument === '--budget-ledger') options.budgetLedgerPath = resolve(argv[++index]);
    else if (argument === '--power-pilot') options.powerPilotPath = resolve(argv[++index]);
    else if (argument === '--run-id') options.runIds.push(argv[++index]);
    else if (argument === '--limit') options.limit = Number(argv[++index]);
    else throw new Error(`Unknown option: ${argument}`);
  }
  for (const name of [
    'planPath',
    'workspaceRoot',
    'developmentTaskRoot',
    'qualificationTaskRoot',
    'developmentEnvironmentRoot',
    'qualificationEnvironmentRoot',
    'evaluatorRoot',
    'candidateManifestPath',
    'runtimeMatrixPath',
    'preparedEnvironmentRoot',
    'outputRoot',
  ]) {
    if (!options[name]) throw new Error(`Missing required option: ${name}`);
  }
  return options;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const result = await runSuite(parseArgs(process.argv.slice(2)));
    console.log(
      prettyCanonicalJson({
        ok: result.manifest.failed === 0,
        manifestSha256: result.manifestSha256,
        manifestPath: result.manifestPath,
        attempted: result.manifest.attemptedRuns,
        failed: result.manifest.failed,
      }).trim(),
    );
    if (result.manifest.failed > 0) process.exitCode = 1;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
