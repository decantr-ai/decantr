#!/usr/bin/env node
import { mkdir, readFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prettyCanonicalJson, readJsonFile, sha256, writeCanonicalFile } from '../runner/canonical.mjs';
import { assertEvaluatorContract } from '../runner/contracts.mjs';
import {
  assertFixedCommand,
  isForbiddenDecantrOracleToken,
  isForbiddenEvaluatorEnvironmentKey,
  runFixed,
  sanitizedEnvironment,
} from '../runner/process.mjs';

export async function executeEvaluator(options) {
  const contractBytes = await readFile(options.contractPath);
  const contract = assertEvaluatorContract(JSON.parse(contractBytes), {
    taskId: options.taskId,
    evaluator: { contractId: options.contractId },
  });
  const contractSha256 = sha256(contractBytes);
  if (options.expectedContractSha256 && contractSha256 !== options.expectedContractSha256) {
    throw new Error('evaluator contract bytes do not match the task binding');
  }
  const oracleSourcePaths = await resolveOracleSourcePaths(contract, options);
  await assertEvaluatorClosure(contract, contractSha256, options, oracleSourcePaths);
  await mkdir(options.home, { recursive: true, mode: 0o700 });
  const commands = [];
  const failures = [];
  const metricFragments = [];

  for (const command of contract.commands) {
    try {
      await assertEvaluatorClosure(contract, contractSha256, options, oracleSourcePaths);
      assertEvaluatorCommand(command);
      const declaredExecutable = substitute(command.executable, options);
      const executable = resolveCommandExecutable(command, declaredExecutable);
      const args = command.args.map((argument) => substitute(argument, options));
      const cwd = resolveEvaluatorCwd(command.cwd, options);
      assertFixedCommand(executable, args);
      const result = runFixed(executable, args, {
        cwd,
        timeoutMs: command.timeoutMs,
        env: sanitizedEnvironment(options.home, {
          ...(options.taskPath ? { PATH: options.taskPath } : {}),
          ...(command.environment ?? {}),
          ...(options.evaluatorRuntimeRoot
            ? {
                PLAYWRIGHT_BROWSERS_PATH:
                  options.evaluatorBrowsersPath ?? join(options.evaluatorRuntimeRoot, 'browsers'),
              }
            : {}),
        }),
      });
      await assertEvaluatorClosure(contract, contractSha256, options, oracleSourcePaths);
      const parsed = command.resultFormat === 'json-stdout' ? parseEvaluatorJson(result.stdout) : null;
      let status = result.exitCode === 0 ? 'passed' : 'failed';
      if (command.resultFormat === 'json-stdout' && !parsed) status = 'malformed';
      else if (parsed?.passed === false) status = 'failed';
      if (parsed?.metrics) metricFragments.push({ command, metrics: parsed.metrics });
      commands.push(normalizeCommandResult(command, result, status));
      if (command.required && status !== 'passed') failures.push(`${command.id}:${status}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      commands.push({
        id: command.id,
        kind: command.kind,
        status: 'unavailable',
        exitCode: null,
        durationMs: 0,
        stdoutSha256: sha256(''),
        stderrSha256: sha256(message),
      });
      if (command.required) failures.push(`${command.id}:unavailable:${message}`);
    }
  }

  await assertEvaluatorClosure(contract, contractSha256, options, oracleSourcePaths);

  const metrics = aggregateMetrics(contract.commands, commands, metricFragments);
  const requiredUnavailable = commands.some(
    (result) => contract.commands.find((command) => command.id === result.id)?.required && ['unavailable', 'malformed'].includes(result.status),
  );
  const requiredBuildFailed = commands.some(
    (result) =>
      result.kind === 'build' &&
      contract.commands.find((command) => command.id === result.id)?.required &&
      result.status !== 'passed',
  );
  const requiredFailed = commands.some(
    (result) => contract.commands.find((command) => command.id === result.id)?.required && result.status !== 'passed',
  );
  const status = requiredUnavailable
    ? 'evaluator_failure'
    : requiredBuildFailed
      ? 'build_failure'
      : requiredFailed
        ? 'failed'
        : 'passed';

  return {
    schemaVersion: 'decantr-benchmark-evaluator-result.v1',
    runId: options.runId,
    taskId: options.taskId,
    contractSha256,
    status,
    metrics,
    commands,
    failures,
  };
}

function aggregateMetrics(contractCommands, results, fragments) {
  const byId = new Map(results.map((result) => [result.id, result]));
  const requiredBuild = contractCommands.filter((command) => command.kind === 'build' && command.required);
  const requiredFunctional = contractCommands.filter((command) => command.kind === 'functional' && command.required);
  const buildPassed = requiredBuild.every((command) => byId.get(command.id)?.status === 'passed');
  const functionalSuccess =
    requiredFunctional.length > 0 && requiredFunctional.every((command) => byId.get(command.id)?.status === 'passed');
  let governanceViolations = 0;
  let accessibilityViolations = 0;
  const visualScores = [];
  for (const { command, metrics } of fragments) {
    if (Number.isFinite(metrics.governanceViolations)) governanceViolations += Math.max(0, metrics.governanceViolations);
    if (Number.isFinite(metrics.accessibilityViolations)) {
      accessibilityViolations += Math.max(0, metrics.accessibilityViolations);
    }
    if (Number.isFinite(metrics.visualScore)) visualScores.push(Math.max(0, Math.min(100, metrics.visualScore)));
    if (command.kind === 'governance' && metrics.governanceViolations === undefined && metrics.passed === false) {
      governanceViolations += 1;
    }
  }
  for (const command of contractCommands.filter((item) => item.kind === 'governance' && item.required)) {
    if (byId.get(command.id)?.status !== 'passed' && !fragments.some((item) => item.command.id === command.id)) {
      governanceViolations += 1;
    }
  }
  return {
    functionalSuccess,
    buildPassed,
    governanceViolations,
    accessibilityViolations,
    visualScore: visualScores.length > 0 ? mean(visualScores) : null,
  };
}

function normalizeCommandResult(command, result, status) {
  return {
    id: command.id,
    kind: command.kind,
    status,
    exitCode: result.exitCode,
    durationMs: result.durationMs,
    stdoutSha256: sha256(result.stdout),
    stderrSha256: sha256(result.stderr),
  };
}

function parseEvaluatorJson(stdout) {
  try {
    const parsed = JSON.parse(stdout);
    return parsed && typeof parsed === 'object' && typeof parsed.passed === 'boolean' ? parsed : null;
  } catch {
    return null;
  }
}

function assertEvaluatorCommand(command) {
  for (const token of [command.executable, ...command.args]) {
    if (isForbiddenDecantrOracleToken(token)) {
      throw new Error(`Decantr output cannot be used as evaluator oracle: ${token}`);
    }
  }
  for (const key of Object.keys(command.environment ?? {})) {
    if (isForbiddenEvaluatorEnvironmentKey(key)) {
      throw new Error(`Evaluator environment cannot override process execution: ${key}`);
    }
  }
  if (
    command.runtime === 'controller' &&
    !['node', 'node.exe'].includes(command.executable.split(/[\\/]/u).at(-1)?.toLowerCase())
  ) {
    throw new Error('controller evaluator commands must declare the Node executable');
  }
}

async function resolveOracleSourcePaths(contract, options) {
  const paths = new Set();
  for (const command of contract.commands) {
    if (command.runtime !== 'controller' || command.resultFormat !== 'json-stdout') continue;
    for (const value of command.args) {
      if (!/\.mjs$/u.test(value)) continue;
      const argument = substitute(value, options);
      if (!isAbsolute(argument) || !isContained(options.evaluatorRoot, argument) || !/\.mjs$/u.test(argument)) continue;
      paths.add(resolve(argument));
    }
  }
  return [...paths].sort();
}

async function assertEvaluatorClosure(contract, contractSha256, options, oracleSourcePaths) {
  if (sha256(await readFile(options.contractPath)) !== contractSha256) {
    throw new Error('evaluator contract changed during execution');
  }
  for (const path of oracleSourcePaths) {
    if (sha256(await readFile(path)) !== contract.oracle.sourceSha256) {
      throw new Error(`evaluator oracle source changed or differs from its contract: ${path}`);
    }
  }
}

function resolveCommandExecutable(command, declaredExecutable) {
  return command.runtime === 'controller' ? process.execPath : declaredExecutable;
}

function substitute(value, options) {
  if (value.includes('${EVALUATOR_RUNTIME}') && !options.evaluatorRuntimeRoot) {
    throw new Error('evaluator command requires a bound evaluator runtime root');
  }
  return value
    .replaceAll('${WORKSPACE}', options.workspace)
    .replaceAll('${PROJECT_PATH}', options.projectPath ?? '.')
    .replaceAll('${EVALUATOR_ROOT}', options.evaluatorRoot)
    .replaceAll('${EVALUATOR_RUNTIME}', options.evaluatorRuntimeRoot ?? '')
    .replaceAll('${HOME}', options.home);
}

function resolveEvaluatorCwd(value, options) {
  const substituted = substitute(value, options);
  const cwd = isAbsolute(substituted) ? resolve(substituted) : resolve(options.workspace, substituted);
  const allowed = [options.workspace, options.evaluatorRoot].some((root) => isContained(root, cwd));
  if (!allowed) throw new Error(`evaluator cwd escapes allowed roots: ${cwd}`);
  return cwd;
}

function isContained(root, candidate) {
  const relation = relative(resolve(root), resolve(candidate));
  return relation === '' || (!relation.startsWith('..') && !isAbsolute(relation));
}

function mean(values) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--contract') options.contractPath = resolve(argv[++index]);
    else if (argument === '--workspace') options.workspace = resolve(argv[++index]);
    else if (argument === '--evaluator-root') options.evaluatorRoot = resolve(argv[++index]);
    else if (argument === '--evaluator-runtime-root') options.evaluatorRuntimeRoot = resolve(argv[++index]);
    else if (argument === '--evaluator-browsers-path') options.evaluatorBrowsersPath = resolve(argv[++index]);
    else if (argument === '--home') options.home = resolve(argv[++index]);
    else if (argument === '--project-path') options.projectPath = argv[++index];
    else if (argument === '--run-id') options.runId = argv[++index];
    else if (argument === '--task-id') options.taskId = argv[++index];
    else if (argument === '--contract-id') options.contractId = argv[++index];
    else if (argument === '--expected-contract-sha256') options.expectedContractSha256 = argv[++index];
    else if (argument === '--out') options.outputPath = resolve(argv[++index]);
    else throw new Error(`Unknown option: ${argument}`);
  }
  for (const name of ['contractPath', 'workspace', 'evaluatorRoot', 'home', 'runId', 'taskId', 'contractId', 'outputPath']) {
    if (!options[name]) throw new Error(`Missing required option: ${name}`);
  }
  return options;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const result = await executeEvaluator(options);
    await writeCanonicalFile(options.outputPath, result);
    console.log(prettyCanonicalJson({ ok: result.status === 'passed', output: options.outputPath, status: result.status }).trim());
    if (result.status !== 'passed') process.exitCode = 1;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
