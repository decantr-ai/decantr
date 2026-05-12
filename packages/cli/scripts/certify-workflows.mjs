#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
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

function installFakePackageManagers(tmpRoot) {
  const fakeBin = join(tmpRoot, '.fake-bin');
  mkdirSync(fakeBin, { recursive: true });
  for (const command of ['npm', 'pnpm', 'yarn', 'bun', 'ng']) {
    const path = join(fakeBin, command);
    writeFileSync(path, '#!/bin/sh\nexit 0\n');
    chmodSync(path, 0o755);
  }
  process.env.PATH = `${fakeBin}:${process.env.PATH ?? ''}`;
}

function seedReactProject(projectDir) {
  writeFileSync(
    join(projectDir, 'package.json'),
    JSON.stringify(
      {
        name: 'brownfield-react',
        private: true,
        version: '0.0.0',
        dependencies: {
          react: '^19.0.0',
          'react-dom': '^19.0.0',
        },
      },
      null,
      2,
    ) + '\n',
  );
  writeFileSync(
    join(projectDir, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: { jsx: 'react-jsx' },
      },
      null,
      2,
    ) + '\n',
  );
  mkdirSync(join(projectDir, 'src'), { recursive: true });
  writeFileSync(
    join(projectDir, 'src', 'App.tsx'),
    'export function App() { return <main>hello</main>; }\n',
  );
}

function seedAngularProject(projectDir) {
  writeFileSync(
    join(projectDir, 'package.json'),
    JSON.stringify(
      {
        name: 'brownfield-angular',
        private: true,
        version: '0.0.0',
        dependencies: {
          '@angular/core': '^19.0.0',
        },
      },
      null,
      2,
    ) + '\n',
  );
  writeFileSync(
    join(projectDir, 'angular.json'),
    JSON.stringify(
      {
        version: 1,
        projects: {},
      },
      null,
      2,
    ) + '\n',
  );
  mkdirSync(join(projectDir, 'src', 'app'), { recursive: true });
  writeFileSync(join(projectDir, 'src', 'main.ts'), 'console.log("angular");\n');
  writeFileSync(
    join(projectDir, 'src', 'app', 'app.routes.ts'),
    "import type { Routes } from '@angular/router';\nexport const routes: Routes = [{ path: '', component: null }, { path: 'admin/users', component: null }];\n",
  );
}

function seedSvelteProject(projectDir) {
  writeFileSync(
    join(projectDir, 'package.json'),
    JSON.stringify(
      {
        name: 'brownfield-svelte',
        private: true,
        version: '0.0.0',
        dependencies: {
          '@sveltejs/kit': '^2.0.0',
          svelte: '^5.0.0',
        },
      },
      null,
      2,
    ) + '\n',
  );
  writeFileSync(join(projectDir, 'svelte.config.js'), 'export default {};\n');
  mkdirSync(join(projectDir, 'src', 'routes', 'dashboard'), { recursive: true });
  writeFileSync(join(projectDir, 'src', 'routes', '+page.svelte'), '<main>home</main>\n');
  writeFileSync(join(projectDir, 'src', 'routes', 'dashboard', '+page.svelte'), '<main>dashboard</main>\n');
}

function seedVueProject(projectDir) {
  writeFileSync(
    join(projectDir, 'package.json'),
    JSON.stringify(
      {
        name: 'brownfield-vue',
        private: true,
        version: '0.0.0',
        dependencies: {
          vue: '^3.5.0',
          'vue-router': '^4.4.0',
        },
      },
      null,
      2,
    ) + '\n',
  );
  writeFileSync(join(projectDir, 'vite.config.ts'), 'export default {};\n');
  mkdirSync(join(projectDir, 'src', 'router'), { recursive: true });
  writeFileSync(
    join(projectDir, 'src', 'router', 'index.ts'),
    "import { createRouter, createWebHistory } from 'vue-router';\nexport const router = createRouter({ history: createWebHistory(), routes: [{ path: '/', component: {} }, { path: '/dashboard', component: {} }] });\n",
  );
}

function seedNuxtProject(projectDir) {
  writeFileSync(
    join(projectDir, 'package.json'),
    JSON.stringify(
      {
        name: 'brownfield-nuxt',
        private: true,
        version: '0.0.0',
        dependencies: {
          nuxt: '^3.15.0',
          vue: '^3.5.0',
        },
      },
      null,
      2,
    ) + '\n',
  );
  writeFileSync(join(projectDir, 'nuxt.config.ts'), 'export default defineNuxtConfig({});\n');
  mkdirSync(join(projectDir, 'pages'), { recursive: true });
  writeFileSync(join(projectDir, 'pages', 'index.vue'), '<template><main /></template>\n');
  writeFileSync(join(projectDir, 'pages', 'dashboard.vue'), '<template><main /></template>\n');
}

function certifyGreenfield(tmpRoot, cliPath, contentRoot) {
  const projectName = 'workflow-greenfield';
  runCli(
    cliPath,
    tmpRoot,
    [
      'new',
      projectName,
      '--blueprint=agent-marketplace',
      '--workflow=greenfield',
      '--adoption=decantr-css',
      '--offline',
    ],
    contentRoot,
  );

  const projectDir = join(tmpRoot, projectName);
  const mainTsx = readFileSync(join(projectDir, 'src', 'main.tsx'), 'utf8');

  if (!mainTsx.includes('BrowserRouter')) {
    throw new Error('greenfield workflow did not bootstrap the React/Vite starter');
  }
  if (!existsSync(join(projectDir, '.decantr', 'context', 'pack-manifest.json'))) {
    throw new Error('greenfield workflow did not emit compiled context artifacts');
  }

  return { workflow: 'greenfield-blueprint', status: 'passed' };
}

function readProjectJson(projectDir) {
  return JSON.parse(readFileSync(join(projectDir, '.decantr', 'project.json'), 'utf8'));
}

function certifyGreenfieldContractOnly(tmpRoot, cliPath, contentRoot) {
  const projectDir = join(tmpRoot, 'workflow-greenfield-contract-only');
  mkdirSync(projectDir, { recursive: true });
  runCli(
    cliPath,
    projectDir,
    ['init', '--yes', '--offline', '--workflow=greenfield', '--adoption=contract-only'],
    contentRoot,
  );
  const projectJson = readProjectJson(projectDir);
  if (projectJson.initialized?.workflowMode !== 'greenfield-contract-only') {
    throw new Error('greenfield contract-only workflow mode was not persisted');
  }
  if (existsSync(join(projectDir, 'src', 'styles', 'treatments.css'))) {
    throw new Error('contract-only init wrote Decantr CSS treatments');
  }
  return { workflow: 'greenfield-contract-only', status: 'passed' };
}

function certifyBrownfield(tmpRoot, cliPath, contentRoot, framework) {
  const projectDir = join(tmpRoot, `workflow-${framework}`);
  mkdirSync(projectDir, { recursive: true });

  if (framework === 'react') {
    seedReactProject(projectDir);
  } else if (framework === 'angular') {
    seedAngularProject(projectDir);
  } else if (framework === 'svelte') {
    seedSvelteProject(projectDir);
  } else if (framework === 'vue') {
    seedVueProject(projectDir);
  } else if (framework === 'nuxt') {
    seedNuxtProject(projectDir);
  } else {
    throw new Error(`unsupported brownfield certification framework: ${framework}`);
  }

  runCli(cliPath, projectDir, ['analyze'], contentRoot);
  runCli(
    cliPath,
    projectDir,
    ['init', '--existing', '--accept-proposal', '--offline'],
    contentRoot,
  );

  const essence = JSON.parse(readFileSync(join(projectDir, 'decantr.essence.json'), 'utf8'));
  const analysis = JSON.parse(readFileSync(join(projectDir, '.decantr', 'analysis.json'), 'utf8'));
  if (
    !existsSync(join(projectDir, '.decantr', 'analysis.json')) ||
    !existsSync(join(projectDir, '.decantr', 'init-seed.json')) ||
    !existsSync(join(projectDir, '.decantr', 'observed-essence.proposal.json'))
  ) {
    throw new Error(`${framework} brownfield workflow did not emit analyze artifacts`);
  }
  if (essence.meta?.target !== framework) {
    throw new Error(`${framework} brownfield attach did not preserve the detected target`);
  }
  if (framework !== 'react' && analysis.routes?.routes?.length < 1) {
    throw new Error(`${framework} brownfield analysis did not observe framework routes`);
  }

  return { workflow: 'brownfield-adoption', framework, status: 'passed' };
}

function certifyBrownfieldDirect(tmpRoot, cliPath, contentRoot) {
  const projectDir = join(tmpRoot, 'workflow-brownfield-direct');
  mkdirSync(projectDir, { recursive: true });
  seedReactProject(projectDir);
  runCli(cliPath, projectDir, ['init', '--existing', '--yes', '--offline'], contentRoot);
  const projectJson = readProjectJson(projectDir);
  if (projectJson.initialized?.analysisArtifacts !== false) {
    throw new Error('direct brownfield init incorrectly claimed analyze artifacts');
  }
  if (projectJson.initialized?.adoptionMode !== 'contract-only') {
    throw new Error('direct brownfield init did not default to contract-only');
  }
  return { workflow: 'brownfield-direct', status: 'passed' };
}

function certifyAdoptionMode(tmpRoot, cliPath, contentRoot, adoptionMode) {
  const projectDir = join(tmpRoot, `workflow-${adoptionMode}`);
  mkdirSync(projectDir, { recursive: true });
  seedReactProject(projectDir);
  runCli(
    cliPath,
    projectDir,
    ['init', '--existing', '--yes', '--offline', `--adoption=${adoptionMode}`],
    contentRoot,
  );
  const projectJson = readProjectJson(projectDir);
  if (projectJson.initialized?.adoptionMode !== adoptionMode) {
    throw new Error(`${adoptionMode} was not persisted`);
  }
  if (adoptionMode === 'style-bridge' && !existsSync(join(projectDir, 'src/styles/decantr-bridge.css'))) {
    throw new Error('style-bridge did not emit bridge CSS');
  }
  if (adoptionMode === 'decantr-css' && !existsSync(join(projectDir, 'src/styles/treatments.css'))) {
    throw new Error('decantr-css did not emit treatments CSS');
  }
  return { workflow: `adoption-${adoptionMode}`, status: 'passed' };
}

function certifyUnsupportedTarget(tmpRoot, cliPath, contentRoot) {
  const projectName = 'workflow-rails-contract';
  runCli(
    cliPath,
    tmpRoot,
    [
      'new',
      projectName,
      '--target=rails',
      '--workflow=greenfield',
      '--adoption=contract-only',
      '--offline',
    ],
    contentRoot,
  );
  const projectDir = join(tmpRoot, projectName);
  if (existsSync(join(projectDir, 'package.json'))) {
    throw new Error('unsupported target wrote a runnable starter');
  }
  return { workflow: 'unsupported-target-contract-only', status: 'passed' };
}

function certifyRunnableAdapter(tmpRoot, cliPath, contentRoot, target, adapterId, expectedFile) {
  const projectName = `workflow-${target}-adapter`;
  runCli(
    cliPath,
    tmpRoot,
    [
      'new',
      projectName,
      `--target=${target}`,
      '--blueprint=agent-marketplace',
      '--workflow=greenfield',
      '--adoption=decantr-css',
      '--offline',
    ],
    contentRoot,
  );
  const projectDir = join(tmpRoot, projectName);
  if (!existsSync(join(projectDir, expectedFile))) {
    throw new Error(`${adapterId} adapter did not emit ${expectedFile}`);
  }
  if (readProjectJson(projectDir).initialized?.adapterId !== adapterId) {
    throw new Error(`${adapterId} adapter id was not persisted`);
  }
  const scaffoldPack = JSON.parse(readFileSync(join(projectDir, '.decantr', 'context', 'scaffold-pack.json'), 'utf8'));
  if (scaffoldPack.target?.adapter !== adapterId) {
    throw new Error(`${adapterId} scaffold pack target was ${scaffoldPack.target?.adapter ?? 'missing'}`);
  }
  return { workflow: `${adapterId}-adapter`, status: 'passed' };
}

function certifyNextAdapter(tmpRoot, cliPath, contentRoot) {
  const projectName = 'workflow-next';
  runCli(
    cliPath,
    tmpRoot,
    [
      'new',
      projectName,
      '--target=nextjs',
      '--blueprint=agent-marketplace',
      '--workflow=greenfield',
      '--adoption=decantr-css',
      '--offline',
    ],
    contentRoot,
  );
  const projectDir = join(tmpRoot, projectName);
  if (!existsSync(join(projectDir, 'app/layout.tsx'))) {
    throw new Error('Next.js adapter did not emit App Router layout');
  }
  if (readProjectJson(projectDir).initialized?.adapterId !== 'next-app') {
    throw new Error('Next.js adapter id was not persisted');
  }
  return { workflow: 'next-app-adapter', status: 'passed' };
}

function certifyMonorepoProject(tmpRoot, cliPath, contentRoot) {
  const workspace = join(tmpRoot, 'workflow-monorepo');
  mkdirSync(join(workspace, 'apps/web'), { recursive: true });
  mkdirSync(join(workspace, 'apps/admin'), { recursive: true });
  writeFileSync(join(workspace, 'pnpm-workspace.yaml'), 'packages:\n  - apps/*\n');
  seedReactProject(join(workspace, 'apps/web'));
  seedReactProject(join(workspace, 'apps/admin'));

  let failedAsExpected = false;
  try {
    runCli(cliPath, workspace, ['init', '--yes', '--offline'], contentRoot);
  } catch {
    failedAsExpected = true;
  }
  if (!failedAsExpected) {
    throw new Error('workspace root init did not require --project');
  }

  runCli(cliPath, workspace, ['init', '--yes', '--offline', '--project=apps/web'], contentRoot);
  const projectJson = readProjectJson(join(workspace, 'apps/web'));
  if (projectJson.initialized?.projectScope !== 'workspace-app') {
    throw new Error('workspace app scope was not persisted');
  }
  return { workflow: 'monorepo-project', status: 'passed' };
}

function certifyHybrid(tmpRoot, cliPath, contentRoot) {
  const projectDir = join(tmpRoot, 'workflow-hybrid');
  mkdirSync(projectDir, { recursive: true });
  seedReactProject(projectDir);

  runCli(cliPath, projectDir, ['analyze'], contentRoot);
  runCli(cliPath, projectDir, ['init', '--existing', '--accept-proposal', '--offline'], contentRoot);
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
    console.error(
      `${RED}Could not resolve decantr-content. Set DECANTR_CONTENT_DIR or pass a valid content root.${RESET}`,
    );
    process.exit(1);
  }

  const tmpRoot = mkdtempSync(join(tmpdir(), 'decantr-workflows-'));
  installFakePackageManagers(tmpRoot);
  const results = [];
  let failed = false;

  try {
    const checks = [
      () => certifyGreenfield(tmpRoot, cliPath, contentRoot),
      () => certifyGreenfieldContractOnly(tmpRoot, cliPath, contentRoot),
      () => certifyBrownfield(tmpRoot, cliPath, contentRoot, 'react'),
      () => certifyBrownfield(tmpRoot, cliPath, contentRoot, 'angular'),
      () => certifyBrownfield(tmpRoot, cliPath, contentRoot, 'svelte'),
      () => certifyBrownfield(tmpRoot, cliPath, contentRoot, 'vue'),
      () => certifyBrownfield(tmpRoot, cliPath, contentRoot, 'nuxt'),
      () => certifyBrownfieldDirect(tmpRoot, cliPath, contentRoot),
      () => certifyAdoptionMode(tmpRoot, cliPath, contentRoot, 'style-bridge'),
      () => certifyAdoptionMode(tmpRoot, cliPath, contentRoot, 'decantr-css'),
      () => certifyUnsupportedTarget(tmpRoot, cliPath, contentRoot),
      () => certifyNextAdapter(tmpRoot, cliPath, contentRoot),
      () => certifyRunnableAdapter(tmpRoot, cliPath, contentRoot, 'html', 'vanilla-vite', 'src/main.js'),
      () => certifyRunnableAdapter(tmpRoot, cliPath, contentRoot, 'vue', 'vue-vite', 'src/App.vue'),
      () => certifyRunnableAdapter(tmpRoot, cliPath, contentRoot, 'svelte', 'sveltekit', 'src/routes/+page.svelte'),
      () => certifyRunnableAdapter(tmpRoot, cliPath, contentRoot, 'angular', 'angular', 'src/app/app.component.ts'),
      () => certifyRunnableAdapter(tmpRoot, cliPath, contentRoot, 'solid', 'solid-vite', 'src/App.tsx'),
      () => certifyMonorepoProject(tmpRoot, cliPath, contentRoot),
      () => certifyHybrid(tmpRoot, cliPath, contentRoot),
    ];

    for (const check of checks) {
      try {
        const result = check();
        results.push(result);
        if (!options.json) {
          console.log(
            `${GREEN}passed${RESET} ${result.workflow}${result.framework ? ` (${result.framework})` : ''}`,
          );
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
      console.log(
        `${DIM}Summary:${RESET} ${results.filter((result) => result.status === 'passed').length}/${results.length} passed`,
      );
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
