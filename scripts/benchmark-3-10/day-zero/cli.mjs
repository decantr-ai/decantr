#!/usr/bin/env node
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  assertCorpus,
  assertDayZeroReport,
  assertOracle,
  assertOracleCorpusBinding,
  auditDayZero,
  formatJson,
  generateOracleDraft,
  sha256,
} from './oracle.mjs';

const directory = dirname(fileURLToPath(import.meta.url));
const defaultCorpusPath = resolve(directory, '..', 'corpus.json');

export async function runCli(argv, io = defaultIo()) {
  try {
    const [command, ...args] = argv;
    if (!command || command === 'help' || command === '--help' || command === '-h') {
      io.stdout(usage());
      return 0;
    }
    if (command === 'generate') return await generateCommand(parseOptions(args), io);
    if (command === 'validate') return await validateCommand(parseOptions(args), io);
    if (command === 'audit') return await auditCommand(parseOptions(args), io);
    throw new Error(`Unknown command: ${command}`);
  } catch (error) {
    io.stderr(`${error instanceof Error ? error.message : String(error)}\n`);
    return 2;
  }
}

async function generateCommand(options, io) {
  requireOption(options, 'report');
  requireOption(options, 'out');
  rejectOptions(options, ['report', 'corpus', 'out', 'force']);
  const reportFile = await readJsonFile(options.report, 'Day-0 report');
  const corpusFile = await readJsonFile(options.corpus ?? defaultCorpusPath, 'corpus');
  if (!options.force && (await exists(options.out))) {
    throw new Error(`Refusing to overwrite existing oracle draft without --force: ${resolve(options.out)}`);
  }

  const oracle = generateOracleDraft({
    corpus: corpusFile.value,
    report: reportFile.value,
    corpusSha256: sha256(corpusFile.bytes),
    reportSha256: sha256(reportFile.bytes),
  });
  await writeJsonFile(options.out, oracle);
  io.stdout(
    formatJson({
      command: 'generate',
      outputPath: resolve(options.out),
      reviewStatus: oracle.review.status,
      repositories: oracle.repositories.length,
      auditReady: false,
    }),
  );
  return 0;
}

async function validateCommand(options, io) {
  requireOption(options, 'oracle');
  rejectOptions(options, ['oracle', 'corpus', 'require-approved']);
  const oracleFile = await readJsonFile(options.oracle, 'Day-0 oracle');
  const corpusFile = await readJsonFile(options.corpus ?? defaultCorpusPath, 'corpus');
  assertCorpus(corpusFile.value);
  assertOracle(oracleFile.value, { requireApproved: Boolean(options['require-approved']) });
  assertOracleCorpusBinding(oracleFile.value, corpusFile.value, sha256(corpusFile.bytes));
  io.stdout(
    formatJson({
      command: 'validate',
      valid: true,
      approvalStatus: oracleFile.value.review.status,
      repositories: oracleFile.value.repositories.length,
      corpusSha256: sha256(corpusFile.bytes),
      oracleSha256: sha256(oracleFile.bytes),
    }),
  );
  return 0;
}

async function auditCommand(options, io) {
  requireOption(options, 'oracle');
  requireOption(options, 'report');
  rejectOptions(options, ['oracle', 'report', 'corpus', 'out']);
  const oracleFile = await readJsonFile(options.oracle, 'Day-0 oracle');
  const reportFile = await readJsonFile(options.report, 'Day-0 report');
  const corpusFile = await readJsonFile(options.corpus ?? defaultCorpusPath, 'corpus');
  assertOracle(oracleFile.value, { requireApproved: true });
  assertDayZeroReport(reportFile.value);
  assertCorpus(corpusFile.value);

  const audit = auditDayZero({
    oracle: oracleFile.value,
    report: reportFile.value,
    corpus: corpusFile.value,
    corpusSha256: sha256(corpusFile.bytes),
    oracleSha256: sha256(oracleFile.bytes),
    reportSha256: sha256(reportFile.bytes),
  });
  if (options.out) {
    await writeJsonFile(options.out, audit);
    io.stdout(
      formatJson({
        command: 'audit',
        outputPath: resolve(options.out),
        passed: audit.passed,
        findings: audit.summary.findings,
        findingCodes: audit.summary.findingCodes,
      }),
    );
  } else {
    io.stdout(formatJson(audit));
  }
  return audit.passed ? 0 : 1;
}

function parseOptions(args) {
  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (!argument.startsWith('--')) throw new Error(`Unexpected positional argument: ${argument}`);
    const key = argument.slice(2);
    if (key === 'force' || key === 'require-approved') {
      if (Object.hasOwn(options, key)) throw new Error(`Option repeated: --${key}`);
      options[key] = true;
      continue;
    }
    const value = args[++index];
    if (!value || value.startsWith('--')) throw new Error(`Option --${key} requires a value`);
    if (Object.hasOwn(options, key)) throw new Error(`Option repeated: --${key}`);
    options[key] = value;
  }
  return options;
}

function requireOption(options, name) {
  if (!options[name]) throw new Error(`Missing required option: --${name}`);
}

function rejectOptions(options, accepted) {
  for (const key of Object.keys(options)) {
    if (!accepted.includes(key)) throw new Error(`Unknown option: --${key}`);
  }
}

async function readJsonFile(path, label) {
  const resolved = resolve(path);
  const bytes = await readFile(resolved);
  try {
    return { path: resolved, bytes, value: JSON.parse(bytes.toString('utf8')) };
  } catch (error) {
    throw new Error(`${label} is not valid JSON at ${resolved}: ${error.message}`);
  }
}

async function exists(path) {
  try {
    await access(resolve(path), constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function writeJsonFile(path, value) {
  const resolved = resolve(path);
  await mkdir(dirname(resolved), { recursive: true });
  await writeFile(resolved, formatJson(value), 'utf8');
}

function defaultIo() {
  return {
    stdout: (value) => process.stdout.write(value),
    stderr: (value) => process.stderr.write(value),
  };
}

function usage() {
  return `Day-0 target oracle

Usage:
  node scripts/benchmark-3-10/day-zero/cli.mjs generate --report <report.json> --out <draft.json> [--corpus <corpus.json>] [--force]
  node scripts/benchmark-3-10/day-zero/cli.mjs validate --oracle <oracle.json> [--corpus <corpus.json>] [--require-approved]
  node scripts/benchmark-3-10/day-zero/cli.mjs audit --oracle <oracle.json> --report <report.json> [--corpus <corpus.json>] [--out <audit.json>]

Exit codes:
  0  validation passed or audit passed
  1  audit completed with findings
  2  arguments or inputs are invalid
`;
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : null;
if (invokedPath === fileURLToPath(import.meta.url)) {
  process.exitCode = await runCli(process.argv.slice(2));
}
