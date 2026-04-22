#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

function parseArgs(argv) {
  return {
    json: argv.includes('--json'),
    keepTmp: argv.includes('--keep-tmp'),
    contentRoot: process.env.DECANTR_CONTENT_DIR || '',
  };
}

function resolveContentRoot(explicitRoot) {
  const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const repoRoot = resolve(packageRoot, '..', '..');
  const candidates = [
    explicitRoot,
    resolve(repoRoot, '..', 'decantr-content'),
    resolve(repoRoot, '..', '..', 'decantr-content'),
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (existsSync(join(candidate, 'archetypes')) && existsSync(join(candidate, 'blueprints'))) {
      return candidate;
    }
  }

  return null;
}

function resolveCliPath() {
  const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  return join(packageRoot, 'dist', 'bin.js');
}

function runCli(cliPath, cwd, args, contentRoot) {
  return execFileSync(process.execPath, [cliPath, ...args], {
    cwd,
    env: {
      ...process.env,
      ...(contentRoot ? { DECANTR_CONTENT_DIR: contentRoot } : {}),
    },
    encoding: 'utf8',
    stdio: 'pipe',
  });
}

function seedReactProject(projectDir) {
  writeFileSync(join(projectDir, 'package.json'), JSON.stringify({
    name: 'brownfield-react',
    private: true,
    version: '0.0.0',
    dependencies: {
      react: '^19.0.0',
      'react-dom': '^19.0.0',
    },
  }, null, 2) + '\n');
  writeFileSync(join(projectDir, 'tsconfig.json'), JSON.stringify({
    compilerOptions: { jsx: 'react-jsx' },
  }, null, 2) + '\n');
  mkdirSync(join(projectDir, 'src'), { recursive: true });
  writeFileSync(join(projectDir, 'src', 'App.tsx'), 'export function App() { return <main>hello</main>; }\n');
}

function seedAngularProject(projectDir) {
  writeFileSync(join(projectDir, 'package.json'), JSON.stringify({
    name: 'brownfield-angular',
    private: true,
    version: '0.0.0',
    dependencies: {
      '@angular/core': '^19.0.0',
    },
  }, null, 2) + '\n');
  writeFileSync(join(projectDir, 'angular.json'), JSON.stringify({
    version: 1,
    projects: {},
  }, null, 2) + '\n');
  mkdirSync(join(projectDir, 'src', 'app'), { recursive: true });
  writeFileSync(join(projectDir, 'src', 'main.ts'), 'console.log("angular");\n');
}

function certifyGreenfield(tmpRoot, cliPath, contentRoot) {
  const projectName = 'workflow-greenfield';
  runCli(cliPath, tmpRoot, ['new', projectName, '--blueprint=agent-marketplace', '--offline'], contentRoot);

  const projectDir = join(tmpRoot, projectName);
  const mainTsx = readFileSync(join(projectDir, 'src', 'main.tsx'), 'utf8');

  if (!mainTsx.includes('HashRouter')) {
    throw new Error('greenfield workflow did not bootstrap the React/Vite starter');
  }
  if (!existsSync(join(projectDir, '.decantr', 'context', 'pack-manifest.json'))) {
    throw new Error('greenfield workflow did not emit compiled context artifacts');
  }

  return { workflow: 'greenfield-blueprint', status: 'passed' };
}

function certifyBrownfield(tmpRoot, cliPath, contentRoot, framework) {
  const projectDir = join(tmpRoot, `workflow-${framework}`);
  mkdirSync(projectDir, { recursive: true });

  if (framework === 'react') {
    seedReactProject(projectDir);
  } else {
    seedAngularProject(projectDir);
  }

  runCli(cliPath, projectDir, ['analyze'], contentRoot);
  runCli(cliPath, projectDir, ['init', '--existing', '--yes', '--offline'], contentRoot);

  const essence = JSON.parse(readFileSync(join(projectDir, 'decantr.essence.json'), 'utf8'));
  if (!existsSync(join(projectDir, '.decantr', 'analysis.json')) || !existsSync(join(projectDir, '.decantr', 'init-seed.json'))) {
    throw new Error(`${framework} brownfield workflow did not emit analyze artifacts`);
  }
  if (essence.meta?.target !== framework) {
    throw new Error(`${framework} brownfield attach did not preserve the detected target`);
  }

  return { workflow: 'brownfield-adoption', framework, status: 'passed' };
}

function certifyHybrid(tmpRoot, cliPath, contentRoot) {
  const projectDir = join(tmpRoot, 'workflow-hybrid');
  mkdirSync(projectDir, { recursive: true });
  seedReactProject(projectDir);

  runCli(cliPath, projectDir, ['analyze'], contentRoot);
  runCli(cliPath, projectDir, ['init', '--existing', '--yes', '--offline'], contentRoot);
  runCli(cliPath, projectDir, ['add', 'feature', 'live-updates'], contentRoot);

  const essence = JSON.parse(readFileSync(join(projectDir, 'decantr.essence.json'), 'utf8'));
  if (!essence.blueprint?.features?.includes('live-updates')) {
    throw new Error('hybrid composition did not persist add-feature changes');
  }

  return { workflow: 'hybrid-composition', status: 'passed' };
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const cliPath = resolveCliPath();
  const contentRoot = resolveContentRoot(options.contentRoot);

  if (!existsSync(cliPath)) {
    console.error(`${RED}Missing built CLI at ${cliPath}. Run pnpm build first.${RESET}`);
    process.exit(1);
  }

  if (!contentRoot) {
    console.error(`${RED}Could not resolve decantr-content. Set DECANTR_CONTENT_DIR or pass a valid content root.${RESET}`);
    process.exit(1);
  }

  const tmpRoot = mkdtempSync(join(tmpdir(), 'decantr-workflows-'));
  const results = [];
  let failed = false;

  try {
    const checks = [
      () => certifyGreenfield(tmpRoot, cliPath, contentRoot),
      () => certifyBrownfield(tmpRoot, cliPath, contentRoot, 'react'),
      () => certifyBrownfield(tmpRoot, cliPath, contentRoot, 'angular'),
      () => certifyHybrid(tmpRoot, cliPath, contentRoot),
    ];

    for (const check of checks) {
      try {
        const result = check();
        results.push(result);
        if (!options.json) {
          console.log(`${GREEN}passed${RESET} ${result.workflow}${result.framework ? ` (${result.framework})` : ''}`);
        }
      } catch (error) {
        failed = true;
        const message = error instanceof Error ? error.message : String(error);
        results.push({ status: 'failed', error: message });
        if (!options.json) {
          console.log(`${RED}failed${RESET} ${message}`);
        }
      }
    }

    if (options.json) {
      console.log(JSON.stringify({ contentRoot, tmpRoot, results }, null, 2));
    } else {
      console.log('');
      console.log(`${DIM}Content root:${RESET} ${contentRoot}`);
      console.log(`${DIM}Temp root:${RESET} ${tmpRoot}`);
      console.log(`${DIM}Summary:${RESET} ${results.filter(result => result.status === 'passed').length}/${results.length} passed`);
    }
  } finally {
    if (!options.keepTmp) {
      rmSync(tmpRoot, { recursive: true, force: true });
    }
  }

  if (failed) {
    process.exit(1);
  }
}

main();
