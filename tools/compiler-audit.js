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
      return { pass: false, error: 'No main.*.js found in dist/' };
    }

    const filePath = join(distPath, mainFile);
    // Use dynamic import test
    const result = await runCommand(
      'node',
      ['--input-type=module', '-e', `import('${filePath}')`],
      project.path,
      10000
    );

    return {
      pass: result.pass,
      error: result.pass ? null : result.error
    };
  } catch (err) {
    return { pass: false, error: err.message };
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
  // TODO: Implement
  return {};
}

function generateReport(results) {
  // TODO: Implement
  return '';
}

async function writeReport(report) {
  // TODO: Implement
}

function printSummary(results) {
  // TODO: Implement
}

main().catch(console.error);
