#!/usr/bin/env node
/**
 * E2E Scaffold Test Harness
 *
 * Orchestrates LLM-driven scaffolding tests across the full corpus.
 *
 * Usage:
 *   node test/e2e-scaffold/harness.js [options]
 *
 * Options:
 *   --category <name>    Run only tests in category (cold-start, modification, edge-cases)
 *   --test <id>          Run single test by ID (e.g., CS-001)
 *   --visual             Enable Playwright visual validation
 *   --report-only        Generate report from cached results
 *   --parallel <n>       Number of parallel tests (default: 1)
 *   --model <model>      Override model (default: claude-sonnet-4-20250514)
 *   --verbose            Show detailed output
 */

import { mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

import { coldStartCorpus, stats as coldStats } from './corpus/cold-start.js';
import { modificationCorpus, stats as modStats } from './corpus/modification.js';
import { edgeCaseCorpus, stats as edgeStats } from './corpus/edge-cases.js';
import { runTest } from './runner.js';
import { scoreTest } from './scorer.js';
import { generateReport } from './reporter.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, 'output');

// ─── Configuration ───────────────────────────────────────────────────────────

const DEFAULT_MODEL = process.env.DECANTR_E2E_MODEL || 'claude-sonnet-4-20250514';
const DEFAULT_TIMEOUT = parseInt(process.env.DECANTR_E2E_TIMEOUT || '300000', 10);
const PARALLEL = parseInt(process.env.DECANTR_E2E_PARALLEL || '1', 10);

// ─── Corpus Assembly ─────────────────────────────────────────────────────────

function assembleCorpus(options) {
  const corpus = [];

  if (!options.category || options.category === 'cold-start') {
    for (const entry of coldStartCorpus) {
      corpus.push({ ...entry, category: 'cold-start' });
    }
  }

  if (!options.category || options.category === 'modification') {
    for (const entry of modificationCorpus) {
      corpus.push({ ...entry, category: 'modification' });
    }
  }

  if (!options.category || options.category === 'edge-cases') {
    for (const entry of edgeCaseCorpus) {
      corpus.push({ ...entry, category: 'edge-cases' });
    }
  }

  // Filter to single test if specified
  if (options.test) {
    return corpus.filter(e => e.id === options.test);
  }

  return corpus;
}

// ─── Test Execution ──────────────────────────────────────────────────────────

async function executeTest(entry, options) {
  const runId = new Date().toISOString().replace(/[:.]/g, '-');
  const testDir = join(OUTPUT_DIR, runId, entry.id);
  await mkdir(testDir, { recursive: true });

  const startTime = Date.now();

  try {
    // Run the LLM scaffolding
    const result = await runTest(entry, {
      model: options.model,
      timeout: DEFAULT_TIMEOUT,
      outputDir: testDir,
      visual: options.visual,
      verbose: options.verbose,
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Score the result
    const scores = await scoreTest(entry, result, {
      outputDir: testDir,
      visual: options.visual,
    });

    return {
      id: entry.id,
      category: entry.category,
      prompt: entry.prompt,
      difficulty: entry.difficulty,
      status: 'completed',
      duration,
      tokens: result.tokens,
      scores,
      result,
      gaps: result.gaps || [],
      violations: result.violations || [],
      observations: result.observations || [],
    };
  } catch (err) {
    return {
      id: entry.id,
      category: entry.category,
      prompt: entry.prompt,
      difficulty: entry.difficulty,
      status: 'failed',
      error: err.message,
      stack: err.stack,
      duration: Date.now() - startTime,
    };
  }
}

async function runSequential(corpus, options) {
  const results = [];

  for (let i = 0; i < corpus.length; i++) {
    const entry = corpus[i];
    console.log(`[${i + 1}/${corpus.length}] Running ${entry.id}...`);

    const result = await executeTest(entry, options);
    results.push(result);

    if (result.status === 'completed') {
      console.log(`  Score: ${result.scores.composite.toFixed(1)} (${result.scores.grade})`);
    } else {
      console.log(`  FAILED: ${result.error}`);
    }
  }

  return results;
}

async function runParallel(corpus, options, parallelism) {
  const results = [];
  const queue = [...corpus];

  async function worker() {
    while (queue.length > 0) {
      const entry = queue.shift();
      if (!entry) break;

      console.log(`Running ${entry.id}...`);
      const result = await executeTest(entry, options);
      results.push(result);

      if (result.status === 'completed') {
        console.log(`  ${entry.id}: ${result.scores.composite.toFixed(1)} (${result.scores.grade})`);
      } else {
        console.log(`  ${entry.id}: FAILED - ${result.error}`);
      }
    }
  }

  // Spawn workers
  const workers = [];
  for (let i = 0; i < parallelism; i++) {
    workers.push(worker());
  }

  await Promise.all(workers);
  return results;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const { values: options } = parseArgs({
    options: {
      category: { type: 'string' },
      test: { type: 'string' },
      visual: { type: 'boolean', default: false },
      'report-only': { type: 'boolean', default: false },
      parallel: { type: 'string' },
      model: { type: 'string', default: DEFAULT_MODEL },
      verbose: { type: 'boolean', default: false },
    },
  });

  // Validate API key
  if (!process.env.ANTHROPIC_API_KEY && !options['report-only']) {
    console.error('Error: ANTHROPIC_API_KEY environment variable required');
    process.exit(1);
  }

  // Create output directory
  await mkdir(OUTPUT_DIR, { recursive: true });

  console.log('\n  Decantr E2E Scaffold Test Harness');
  console.log('  ──────────────────────────────────');
  console.log(`  Model: ${options.model}`);
  console.log(`  Visual: ${options.visual ? 'enabled' : 'disabled'}`);

  // Report-only mode
  if (options['report-only']) {
    console.log('\n  Generating report from cached results...\n');
    await generateReport(OUTPUT_DIR);
    return;
  }

  // Assemble corpus
  const corpus = assembleCorpus(options);
  console.log(`  Tests: ${corpus.length}`);

  if (corpus.length === 0) {
    console.log('\n  No tests match the specified criteria.\n');
    return;
  }

  // Print corpus stats
  console.log('\n  Corpus Statistics:');
  console.log(`    Cold-start: ${coldStats().total}`);
  console.log(`    Modification: ${modStats().total}`);
  console.log(`    Edge-cases: ${edgeStats().total}`);

  // Run tests
  console.log('\n  Running tests...\n');
  const startTime = Date.now();

  const parallelism = parseInt(options.parallel || PARALLEL, 10);
  const results = parallelism > 1
    ? await runParallel(corpus, options, parallelism)
    : await runSequential(corpus, options);

  const totalTime = Date.now() - startTime;

  // Save results
  const runId = new Date().toISOString().replace(/[:.]/g, '-');
  const resultsPath = join(OUTPUT_DIR, `results-${runId}.json`);
  await writeFile(resultsPath, JSON.stringify(results, null, 2));

  // Generate report
  console.log('\n  Generating report...\n');
  const report = await generateReport(OUTPUT_DIR, results);

  // Print summary
  console.log('  ══════════════════════════════════════════');
  console.log('  SUMMARY');
  console.log('  ══════════════════════════════════════════');
  console.log(`  Total tests: ${results.length}`);
  console.log(`  Passed: ${results.filter(r => r.status === 'completed').length}`);
  console.log(`  Failed: ${results.filter(r => r.status === 'failed').length}`);
  console.log(`  Total time: ${(totalTime / 1000).toFixed(1)}s`);

  const completed = results.filter(r => r.status === 'completed');
  if (completed.length > 0) {
    const avgScore = completed.reduce((sum, r) => sum + r.scores.composite, 0) / completed.length;
    const avgTokens = completed.reduce((sum, r) => sum + (r.tokens?.total || 0), 0) / completed.length;
    const avgTime = completed.reduce((sum, r) => sum + r.duration, 0) / completed.length;

    console.log(`\n  Average composite score: ${avgScore.toFixed(1)}`);
    console.log(`  Average tokens: ${Math.round(avgTokens)}`);
    console.log(`  Average time: ${(avgTime / 1000).toFixed(1)}s`);
  }

  // Print gap analysis
  const allGaps = results.flatMap(r => r.gaps || []);
  const gapCounts = {};
  for (const gap of allGaps) {
    const key = `${gap.type}:${gap.name}`;
    gapCounts[key] = (gapCounts[key] || 0) + 1;
  }

  if (Object.keys(gapCounts).length > 0) {
    console.log('\n  Framework Gaps Detected:');
    const sorted = Object.entries(gapCounts).sort((a, b) => b[1] - a[1]);
    for (const [key, count] of sorted.slice(0, 10)) {
      console.log(`    ${key}: ${count} occurrences`);
    }
  }

  // Print compliance violations
  const allViolations = results.flatMap(r => r.violations || []);
  const violationCounts = {};
  for (const v of allViolations) {
    violationCounts[v.rule] = (violationCounts[v.rule] || 0) + 1;
  }

  if (Object.keys(violationCounts).length > 0) {
    console.log('\n  Compliance Violations:');
    for (const [rule, count] of Object.entries(violationCounts)) {
      console.log(`    ${rule}: ${count} occurrences`);
    }
  }

  console.log(`\n  Report: ${join(OUTPUT_DIR, 'report.json')}\n`);
}

main().catch(err => {
  console.error('Harness failed:', err);
  process.exit(1);
});
