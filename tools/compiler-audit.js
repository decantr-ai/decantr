#!/usr/bin/env node
/**
 * Compiler Audit Script
 *
 * Tests all Decantr projects against the experimental compiler.
 * Generates a markdown checklist report.
 */

import { readdir, stat, readFile, writeFile } from 'node:fs/promises';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Known browser-only errors that indicate valid browser code, not compiler bugs
const BROWSER_ERRORS = [
  'document is not defined',
  'window is not defined',
  'HTMLElement is not defined',
  'MutationObserver is not defined',
  'localStorage is not defined',
  'sessionStorage is not defined',
  'navigator is not defined',
  'self is not defined',
  'customElements is not defined',
  'IntersectionObserver is not defined',
  'ResizeObserver is not defined',
  'requestAnimationFrame is not defined',
  'getComputedStyle is not defined',
];

function isBrowserOnlyError(error) {
  if (!error) return false;
  return BROWSER_ERRORS.some(browserErr => error.includes(browserErr));
}

/**
 * Run a command and return result
 */
function runCommand(cmd, args, cwd, timeout = 60000) {
  return new Promise((resolve) => {
    const start = Date.now();
    const proc = spawn(cmd, args, {
      cwd,
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => { stdout += data; });
    proc.stderr.on('data', (data) => { stderr += data; });

    const timer = setTimeout(() => {
      proc.kill();
      resolve({
        pass: false,
        time: Date.now() - start,
        error: 'Timeout after ' + timeout + 'ms',
        stdout,
        stderr
      });
    }, timeout);

    proc.on('close', (code) => {
      clearTimeout(timer);
      resolve({
        pass: code === 0,
        time: Date.now() - start,
        error: code === 0 ? null : stderr.slice(-500) || `Exit code ${code}`,
        stdout,
        stderr
      });
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      resolve({
        pass: false,
        time: Date.now() - start,
        error: err.message,
        stdout,
        stderr
      });
    });
  });
}

const CLI_PATH = join(ROOT, 'cli/index.js');

async function runPhase1(project) {
  // Clean dist first
  await runCommand('rm', ['-rf', 'dist'], project.path);
  return runCommand('node', [CLI_PATH, 'build'], project.path);
}

async function runPhase2(project) {
  // Clean dist first
  await runCommand('rm', ['-rf', 'dist'], project.path);
  return runCommand('node', [CLI_PATH, 'build', '--experimental-compiler'], project.path);
}

async function runPhase3(project) {
  const distPath = join(project.path, 'dist');

  try {
    const files = await readdir(distPath);
    const jsFiles = files.filter(f => f.endsWith('.js'));

    if (jsFiles.length === 0) {
      return { pass: false, files: 0, failures: [], error: 'No JS files in dist/' };
    }

    const failures = [];
    for (const file of jsFiles) {
      const filePath = join(distPath, file);
      const result = await runCommand('node', ['-c', filePath], project.path, 10000);
      if (!result.pass) {
        failures.push({ file, error: result.error });
      }
    }

    return {
      pass: failures.length === 0,
      files: jsFiles.length,
      failures,
      error: failures.length > 0 ? `${failures.length} file(s) failed syntax check` : null
    };
  } catch (err) {
    return { pass: false, files: 0, failures: [], error: 'dist/ not found' };
  }
}

async function runPhase4(project) {
  const distPath = join(project.path, 'dist');

  try {
    const files = await readdir(distPath);
    const mainFile = files.find(f => f.startsWith('main.') && f.endsWith('.js'));

    if (!mainFile) {
      return { pass: false, error: 'No main.*.js found in dist/', browser: false };
    }

    const filePath = join(distPath, mainFile);
    const result = await runCommand(
      'node',
      ['--input-type=module', '-e', `"import('${filePath}')"`],
      project.path,
      10000
    );

    // Check if failure is due to browser-only code
    if (!result.pass && isBrowserOnlyError(result.error)) {
      return { pass: true, browser: true, error: null };
    }

    return {
      pass: result.pass,
      browser: false,
      error: result.pass ? null : result.error
    };
  } catch (err) {
    return { pass: false, browser: false, error: err.message };
  }
}

// Project locations to scan
const PROJECT_LOCATIONS = [
  { category: 'Showcase', path: 'showcase' },
  { category: 'Test Fixtures', path: 'test/e2e-scaffold/fixtures/base-projects' },
  { category: 'Apps', path: 'docs', single: true },
  { category: 'Apps', path: 'playground', single: true },
  { category: 'Apps', path: 'workbench', single: true },
];

async function main() {
  console.log('🔍 Decantr Compiler Audit\n');

  const projects = await discoverProjects();
  console.log(`Found ${projects.length} projects to audit\n`);

  const results = [];
  for (const project of projects) {
    const result = await auditProject(project);
    results.push(result);
  }

  const report = generateReport(results);
  await writeReport(report);

  printSummary(results);
}

async function discoverProjects() {
  const projects = [];

  for (const location of PROJECT_LOCATIONS) {
    const fullPath = join(ROOT, location.path);

    try {
      const stats = await stat(fullPath);
      if (!stats.isDirectory()) continue;

      if (location.single) {
        // Single project (docs, playground, workbench)
        const entryPoint = join(fullPath, 'src/app.js');
        try {
          await stat(entryPoint);
          projects.push({
            name: location.path,
            path: fullPath,
            category: location.category,
          });
        } catch {
          // No src/app.js, skip
        }
      } else {
        // Directory of projects (showcase, test fixtures)
        const entries = await readdir(fullPath);
        for (const entry of entries) {
          const projectPath = join(fullPath, entry);
          const projectStats = await stat(projectPath);
          if (!projectStats.isDirectory()) continue;

          const entryPoint = join(projectPath, 'src/app.js');
          try {
            await stat(entryPoint);
            projects.push({
              name: `${location.path}/${entry}`,
              path: projectPath,
              category: location.category,
            });
          } catch {
            // No src/app.js, skip
          }
        }
      }
    } catch {
      // Location doesn't exist, skip
    }
  }

  return projects.sort((a, b) => a.name.localeCompare(b.name));
}

async function auditProject(project) {
  console.log(`📦 ${project.name}`);

  const result = {
    name: project.name,
    path: project.path,
    category: project.category,
    phases: {
      baseline: null,
      experimental: null,
      syntax: null,
      import: null
    },
    status: 'unknown',
    issueType: null
  };

  // Phase 1: Baseline build
  process.stdout.write('  ├─ Baseline: ');
  result.phases.baseline = await runPhase1(project);
  console.log(result.phases.baseline.pass ? `✓ (${result.phases.baseline.time}ms)` : '✗');

  // Phase 2: Experimental build
  process.stdout.write('  ├─ Experimental: ');
  result.phases.experimental = await runPhase2(project);
  console.log(result.phases.experimental.pass ? `✓ (${result.phases.experimental.time}ms)` : '✗');

  // Phase 3: Syntax check (only if experimental passed)
  if (result.phases.experimental.pass) {
    process.stdout.write('  ├─ Syntax: ');
    result.phases.syntax = await runPhase3(project);
    console.log(result.phases.syntax.pass ? `✓ (${result.phases.syntax.files} files)` : '✗');
  }

  // Phase 4: Import test (only if syntax passed)
  if (result.phases.syntax?.pass) {
    process.stdout.write('  └─ Import: ');
    result.phases.import = await runPhase4(project);
    console.log(result.phases.import.pass ? '✓' : '✗');
  } else {
    console.log('  └─ Import: skipped');
  }

  // Determine status and issue type
  if (!result.phases.baseline.pass) {
    result.status = 'fail';
    result.issueType = 'pre-existing';
  } else if (!result.phases.experimental.pass) {
    result.status = 'fail';
    result.issueType = 'compiler';
  } else if (!result.phases.syntax?.pass) {
    result.status = 'fail';
    result.issueType = 'syntax';
  } else if (!result.phases.import?.pass) {
    result.status = 'fail';
    result.issueType = 'runtime';
  } else if (result.phases.import?.browser) {
    result.status = 'pass';
    result.issueType = 'browser';
  } else {
    result.status = 'pass';
  }

  console.log('');
  return result;
}

function generateReport(results) {
  const timestamp = new Date().toISOString();
  const summary = {
    total: results.length,
    pass: results.filter(r => r.status === 'pass').length,
    fail: results.filter(r => r.status === 'fail').length,
    preExisting: results.filter(r => r.issueType === 'pre-existing').length,
    compiler: results.filter(r => r.issueType === 'compiler').length,
    syntax: results.filter(r => r.issueType === 'syntax').length,
    runtime: results.filter(r => r.issueType === 'runtime').length,
    browser: results.filter(r => r.issueType === 'browser').length,
  };

  let md = `# Compiler Audit Results

**Generated:** ${timestamp}

## Summary

| Metric | Count |
|--------|-------|
| Total Projects | ${summary.total} |
| Passing | ${summary.pass} |
| Failing | ${summary.fail} |

### Failure Breakdown

| Type | Count | Description |
|------|-------|-------------|
| Pre-existing | ${summary.preExisting} | Fails on old builder too |
| Compiler | ${summary.compiler} | New compiler regression |
| Syntax | ${summary.syntax} | Output has syntax errors |
| Runtime | ${summary.runtime} | Import fails at runtime |
| Browser-only | ${summary.browser} | Valid browser code (DOM APIs) |

---

## Checklist

`;

  // Group by category
  const byCategory = {};
  for (const result of results) {
    if (!byCategory[result.category]) {
      byCategory[result.category] = [];
    }
    byCategory[result.category].push(result);
  }

  for (const [category, projects] of Object.entries(byCategory)) {
    md += `### ${category}\n\n`;

    for (const project of projects) {
      const checkbox = project.status === 'pass' ? '[x]' : '[ ]';
      const status = project.status === 'pass'
        ? project.issueType === 'browser'
          ? 'Pass (browser-only)'
          : `Pass (${project.phases.experimental.time}ms)`
        : `**${project.issueType.toUpperCase()}**`;

      md += `- ${checkbox} \`${project.name}\` — ${status}\n`;

      // Add error details for failures
      if (project.status === 'fail') {
        const errorPhase = ['baseline', 'experimental', 'syntax', 'import']
          .find(p => project.phases[p] && !project.phases[p].pass);
        const error = project.phases[errorPhase]?.error || 'Unknown error';
        const shortError = error.split('\n')[0].slice(0, 100);
        md += `  - Error: ${shortError}\n`;
      }
    }
    md += '\n';
  }

  md += `---

## Re-running the Audit

\`\`\`bash
node tools/compiler-audit.js
\`\`\`

After fixing issues, re-run to update this checklist.
`;

  return md;
}

async function writeReport(report) {
  const reportPath = join(ROOT, 'docs/superpowers/specs/2026-03-19-compiler-audit.md');
  await writeFile(reportPath, report);
  console.log(`📝 Report written to: ${relative(ROOT, reportPath)}`);
}

function printSummary(results) {
  const pass = results.filter(r => r.status === 'pass').length;
  const fail = results.filter(r => r.status === 'fail').length;

  console.log('━'.repeat(50));
  console.log(`\n📊 Summary: ${pass}/${results.length} passing\n`);

  if (fail > 0) {
    console.log('Failed projects:');
    for (const result of results.filter(r => r.status === 'fail')) {
      console.log(`  ✗ ${result.name} (${result.issueType})`);
    }
  }
}

main().catch(console.error);
