#!/usr/bin/env node
/**
 * Manual Scaffold Validator
 *
 * For testing scaffolded projects without API costs.
 * You scaffold manually with Claude Code, then run this to validate.
 *
 * Usage:
 *   node test/e2e-scaffold/manual.js <project-dir> [options]
 *
 * Examples:
 *   # Validate a project you just scaffolded
 *   node test/e2e-scaffold/manual.js ~/my-new-project
 *
 *   # Validate against a specific corpus entry
 *   node test/e2e-scaffold/manual.js ~/my-new-project --expect CS-001
 *
 *   # Just run compliance checks
 *   node test/e2e-scaffold/manual.js ~/my-new-project --compliance-only
 *
 *   # Generate visual report with Playwright
 *   node test/e2e-scaffold/manual.js ~/my-new-project --visual
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const __dirname = dirname(fileURLToPath(import.meta.url));

import { validateCompliance, getRules } from './validators/compliance.js';
import { coldStartCorpus } from './corpus/cold-start.js';
import { modificationCorpus } from './corpus/modification.js';
import { edgeCaseCorpus } from './corpus/edge-cases.js';

// ─── Argument Parsing ────────────────────────────────────────────────────────

const { values: options, positionals } = parseArgs({
  options: {
    expect: { type: 'string', short: 'e' },
    'compliance-only': { type: 'boolean', default: false },
    visual: { type: 'boolean', default: false },
    'action-plan': { type: 'boolean', default: false },
    output: { type: 'string', short: 'o' },
    verbose: { type: 'boolean', short: 'v', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  },
  allowPositionals: true,
});

if (options.help || positionals.length === 0) {
  console.log(`
  Decantr Manual Scaffold Validator

  Usage:
    node test/e2e-scaffold/manual.js <project-dir> [options]

  Options:
    -e, --expect <id>     Validate against corpus entry (e.g., CS-001, MOD-005)
    --compliance-only     Only run compliance checks, skip scoring
    --visual              Run visual validation with Playwright
    --action-plan         Generate action plan with prompts for gaps/violations
    -o, --output <dir>    Output directory for reports
    -v, --verbose         Show detailed output
    -h, --help            Show this help

  Workflow:
    1. Scaffold a project manually using Claude Code
    2. Run this validator against the result
    3. Review the report for gaps and violations

  Examples:
    # Basic validation
    node test/e2e-scaffold/manual.js ./my-project

    # Validate against "Photography Portfolio" corpus entry
    node test/e2e-scaffold/manual.js ./my-project --expect CS-001

    # Full visual validation
    node test/e2e-scaffold/manual.js ./my-project --visual
`);
  process.exit(0);
}

// ─── Project Validation ──────────────────────────────────────────────────────

async function validateProject(projectDir) {
  const report = {
    project: basename(projectDir),
    path: projectDir,
    timestamp: new Date().toISOString(),
    essence: null,
    config: null,
    structure: {},
    compliance: {},
    gaps: [],
    scores: {},
  };

  // Check essence.json
  const essencePath = join(projectDir, 'decantr.essence.json');
  if (existsSync(essencePath)) {
    try {
      report.essence = JSON.parse(await readFile(essencePath, 'utf-8'));
      console.log('  [OK] decantr.essence.json found');
    } catch (err) {
      console.log('  [ERROR] decantr.essence.json invalid:', err.message);
    }
  } else {
    console.log('  [MISSING] decantr.essence.json');
  }

  // Check config.json
  const configPath = join(projectDir, 'decantr.config.json');
  if (existsSync(configPath)) {
    try {
      report.config = JSON.parse(await readFile(configPath, 'utf-8'));
      console.log('  [OK] decantr.config.json found');
    } catch (err) {
      console.log('  [ERROR] decantr.config.json invalid:', err.message);
    }
  }

  // Check structure
  const srcDir = join(projectDir, 'src');
  const publicDir = join(projectDir, 'public');

  report.structure.hasSrc = existsSync(srcDir);
  report.structure.hasPublic = existsSync(publicDir);
  report.structure.hasApp = existsSync(join(srcDir, 'app.js'));
  report.structure.hasIndex = existsSync(join(publicDir, 'index.html'));

  console.log(`  [${report.structure.hasSrc ? 'OK' : 'MISSING'}] src/`);
  console.log(`  [${report.structure.hasApp ? 'OK' : 'MISSING'}] src/app.js`);
  console.log(`  [${report.structure.hasPublic ? 'OK' : 'MISSING'}] public/`);
  console.log(`  [${report.structure.hasIndex ? 'OK' : 'MISSING'}] public/index.html`);

  return report;
}

// ─── Corpus Matching ─────────────────────────────────────────────────────────

function findCorpusEntry(id) {
  const allCorpus = [
    ...coldStartCorpus.map(e => ({ ...e, category: 'cold-start' })),
    ...modificationCorpus.map(e => ({ ...e, category: 'modification' })),
    ...edgeCaseCorpus.map(e => ({ ...e, category: 'edge-cases' })),
  ];
  return allCorpus.find(e => e.id === id);
}

function scoreAgainstExpectation(report, entry) {
  const scores = {
    terroir: 0,
    vintage: 0,
    structure: 0,
    character: 0,
    total: 0,
    notes: [],
  };

  if (!report.essence) {
    scores.notes.push('No essence.json - cannot score');
    return scores;
  }

  const exp = entry.expected;

  // Terroir match
  if (exp.terroir) {
    const expected = Array.isArray(exp.terroir) ? exp.terroir : [exp.terroir];
    if (expected.includes(report.essence.terroir)) {
      scores.terroir = 100;
      scores.notes.push(`Terroir OK: ${report.essence.terroir}`);
    } else {
      scores.terroir = 0;
      scores.notes.push(`Terroir MISMATCH: expected ${expected.join('/')}, got ${report.essence.terroir}`);
    }
  } else {
    scores.terroir = 100; // No expectation
  }

  // Vintage match
  if (exp.vintage) {
    let vintageScore = 0;
    if (exp.vintage.style) {
      const expected = Array.isArray(exp.vintage.style) ? exp.vintage.style : [exp.vintage.style];
      if (expected.includes(report.essence.vintage?.style)) {
        vintageScore += 50;
        scores.notes.push(`Style OK: ${report.essence.vintage.style}`);
      } else {
        scores.notes.push(`Style MISMATCH: expected ${expected.join('/')}, got ${report.essence.vintage?.style}`);
      }
    } else {
      vintageScore += 50;
    }
    if (exp.vintage.mode) {
      const expected = Array.isArray(exp.vintage.mode) ? exp.vintage.mode : [exp.vintage.mode];
      if (expected.includes(report.essence.vintage?.mode)) {
        vintageScore += 50;
        scores.notes.push(`Mode OK: ${report.essence.vintage.mode}`);
      } else {
        scores.notes.push(`Mode MISMATCH: expected ${expected.join('/')}, got ${report.essence.vintage?.mode}`);
      }
    } else {
      vintageScore += 50;
    }
    scores.vintage = vintageScore;
  } else {
    scores.vintage = 100;
  }

  // Structure match
  if (exp.structure && report.essence.structure) {
    let structScore = 0;
    const pageIds = report.essence.structure.map(p => p.id);

    // Min pages
    if (exp.structure.min_pages) {
      if (pageIds.length >= exp.structure.min_pages) {
        structScore += 30;
        scores.notes.push(`Page count OK: ${pageIds.length} >= ${exp.structure.min_pages}`);
      } else {
        scores.notes.push(`Page count LOW: ${pageIds.length} < ${exp.structure.min_pages}`);
      }
    } else {
      structScore += 30;
    }

    // Required pages
    if (exp.structure.required_pages) {
      const missing = exp.structure.required_pages.filter(p => !pageIds.includes(p));
      if (missing.length === 0) {
        structScore += 40;
        scores.notes.push('Required pages OK');
      } else {
        scores.notes.push(`Missing pages: ${missing.join(', ')}`);
      }
    } else {
      structScore += 40;
    }

    // Required patterns
    if (exp.structure.required_patterns) {
      const usedPatterns = new Set();
      for (const page of report.essence.structure) {
        for (const item of (page.blend || [])) {
          if (typeof item === 'string') usedPatterns.add(item);
          else if (item.pattern) usedPatterns.add(item.pattern);
        }
      }
      const missing = exp.structure.required_patterns.filter(p => !usedPatterns.has(p));
      if (missing.length === 0) {
        structScore += 30;
        scores.notes.push('Required patterns OK');
      } else {
        scores.notes.push(`Missing patterns: ${missing.join(', ')}`);
      }
    } else {
      structScore += 30;
    }

    scores.structure = structScore;
  } else {
    scores.structure = report.essence?.structure ? 70 : 0;
  }

  // Total
  scores.total = Math.round((scores.terroir + scores.vintage + scores.structure) / 3);

  return scores;
}

// ─── Gap Detection ───────────────────────────────────────────────────────────

async function detectGaps(projectDir, report) {
  const gaps = [];

  // Check for local patterns (indicates missing registry patterns)
  const localPatternsDir = join(projectDir, 'src', 'patterns');
  if (existsSync(localPatternsDir)) {
    const { readdir } = await import('node:fs/promises');
    const files = await readdir(localPatternsDir);
    for (const file of files) {
      gaps.push({
        type: 'missing-pattern',
        name: file.replace('.js', ''),
        location: `src/patterns/${file}`,
        severity: 'info',
      });
    }
  }

  // Check for local components that might indicate gaps
  const localComponentsDir = join(projectDir, 'src', 'components');
  if (existsSync(localComponentsDir)) {
    const { readdir } = await import('node:fs/promises');
    const files = await readdir(localComponentsDir);
    for (const file of files) {
      gaps.push({
        type: 'local-component',
        name: file.replace('.js', ''),
        location: `src/components/${file}`,
        severity: 'info',
      });
    }
  }

  return gaps;
}

// ─── Visual Validation ───────────────────────────────────────────────────────

async function runVisualValidation(projectDir, outputDir) {
  console.log('\n  Running visual validation...');

  try {
    // Dynamic import to avoid dependency issues
    const { chromium } = await import('playwright');

    // Start dev server
    const { spawn } = await import('node:child_process');
    const server = spawn('npx', ['decantr', 'dev', '--port', '4173'], {
      cwd: projectDir,
      stdio: 'pipe',
    });

    // Wait for server to start
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Server timeout')), 30000);
      server.stdout.on('data', (data) => {
        if (data.toString().includes('listening') || data.toString().includes('4173')) {
          clearTimeout(timeout);
          resolve();
        }
      });
      server.on('error', reject);
    });

    // Take screenshots
    const browser = await chromium.launch();
    const page = await browser.newPage();

    const screenshotsDir = join(outputDir, 'screenshots');
    await mkdir(screenshotsDir, { recursive: true });

    // Screenshot home
    await page.goto('http://localhost:4173');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: join(screenshotsDir, 'home.png'), fullPage: true });
    console.log('    [OK] home.png');

    // Screenshot each route from essence
    const essencePath = join(projectDir, 'decantr.essence.json');
    if (existsSync(essencePath)) {
      const essence = JSON.parse(await readFile(essencePath, 'utf-8'));
      for (const page of (essence.structure || [])) {
        if (page.id === 'home') continue;
        try {
          const route = page.id === 'home' ? '' : page.id;
          await page.goto(`http://localhost:4173/#/${route}`);
          await page.waitForLoadState('networkidle');
          await page.screenshot({ path: join(screenshotsDir, `${page.id}.png`), fullPage: true });
          console.log(`    [OK] ${page.id}.png`);
        } catch (err) {
          console.log(`    [ERROR] ${page.id}: ${err.message}`);
        }
      }
    }

    await browser.close();
    server.kill();

    return { success: true, screenshotsDir };
  } catch (err) {
    console.log(`    [ERROR] Visual validation failed: ${err.message}`);
    return { success: false, error: err.message };
  }
}

// ─── Report Generation ───────────────────────────────────────────────────────

function printReport(report, corpusScores) {
  console.log('\n  ══════════════════════════════════════════');
  console.log('  VALIDATION REPORT');
  console.log('  ══════════════════════════════════════════');

  console.log(`\n  Project: ${report.project}`);
  console.log(`  Path: ${report.path}`);

  // Essence summary
  if (report.essence) {
    console.log(`\n  Essence:`);
    console.log(`    Terroir: ${report.essence.terroir || 'not set'}`);
    console.log(`    Style: ${report.essence.vintage?.style || 'not set'}`);
    console.log(`    Mode: ${report.essence.vintage?.mode || 'not set'}`);
    console.log(`    Pages: ${report.essence.structure?.length || 0}`);
  }

  // Compliance
  console.log(`\n  Compliance:`);
  console.log(`    Errors: ${report.compliance.errorCount || 0}`);
  console.log(`    Warnings: ${report.compliance.warningCount || 0}`);

  if (report.compliance.violations?.length > 0) {
    console.log(`\n  Violations:`);
    for (const v of report.compliance.violations.slice(0, 10)) {
      const icon = v.severity === 'error' ? 'X' : '!';
      console.log(`    [${icon}] ${v.rule}: ${v.message}`);
    }
  }

  // Gaps
  if (report.gaps.length > 0) {
    console.log(`\n  Gaps Detected:`);
    for (const gap of report.gaps) {
      console.log(`    [${gap.type}] ${gap.name} (${gap.location})`);
    }
  }

  // Corpus scores
  if (corpusScores) {
    console.log(`\n  Corpus Match (${options.expect}):`);
    console.log(`    Terroir: ${corpusScores.terroir}%`);
    console.log(`    Vintage: ${corpusScores.vintage}%`);
    console.log(`    Structure: ${corpusScores.structure}%`);
    console.log(`    Total: ${corpusScores.total}%`);
    if (corpusScores.notes.length > 0) {
      console.log(`\n  Notes:`);
      for (const note of corpusScores.notes) {
        console.log(`    - ${note}`);
      }
    }
  }

  console.log('\n');
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const projectDir = resolve(positionals[0]);

  if (!existsSync(projectDir)) {
    console.error(`Error: Project directory not found: ${projectDir}`);
    process.exit(1);
  }

  console.log('\n  Decantr Manual Scaffold Validator');
  console.log('  ──────────────────────────────────');
  console.log(`  Validating: ${projectDir}`);

  // Validate project structure
  console.log('\n  Checking structure...');
  const report = await validateProject(projectDir);

  // Run compliance checks
  console.log('\n  Running compliance checks...');
  report.compliance = await validateCompliance(projectDir);
  console.log(`  ${report.compliance.summary}`);

  // Detect gaps
  console.log('\n  Detecting gaps...');
  report.gaps = await detectGaps(projectDir, report);
  console.log(`  Found ${report.gaps.length} gaps`);

  // Score against corpus entry if specified
  let corpusScores = null;
  if (options.expect) {
    const entry = findCorpusEntry(options.expect);
    if (entry) {
      console.log(`\n  Scoring against: ${entry.id} (${entry.category})`);
      console.log(`  Prompt: "${entry.prompt.slice(0, 60)}..."`);
      corpusScores = scoreAgainstExpectation(report, entry);
    } else {
      console.log(`\n  Warning: Corpus entry ${options.expect} not found`);
    }
  }

  // Visual validation if requested
  if (options.visual) {
    const outputDir = options.output || join(projectDir, '.decantr-validation');
    report.visual = await runVisualValidation(projectDir, outputDir);
  }

  // Print report
  printReport(report, corpusScores);

  // Generate action plan if requested
  if (options['action-plan']) {
    const entry = options.expect ? findCorpusEntry(options.expect) : null;
    const { generateActionPlan } = await import('./action-plan.js');
    const plan = await generateActionPlan({
      projectDir,
      testId: entry?.id,
      report: {
        gaps: report.gaps,
        violations: report.compliance?.violations || [],
        essence: report.essence,
      },
      originalPrompt: entry?.prompt,
    });

    const date = new Date().toISOString().split('T')[0];
    const outputPath = join(__dirname, 'output', `action-plan-${date}-${entry?.id || 'manual'}.md`);
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, plan);
    console.log(`  Action plan saved to: ${outputPath}\n`);
  }

  // Save report if output specified
  if (options.output) {
    const outputDir = resolve(options.output);
    await mkdir(outputDir, { recursive: true });
    await writeFile(
      join(outputDir, 'report.json'),
      JSON.stringify(report, null, 2)
    );
    console.log(`  Report saved to: ${join(outputDir, 'report.json')}`);
  }

  // Exit code based on compliance
  if (report.compliance.errorCount > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Validation failed:', err);
  process.exit(1);
});
