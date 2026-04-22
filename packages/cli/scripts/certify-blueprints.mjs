#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_BLUEPRINTS = ['portfolio', 'producer-studio', 'agent-marketplace'];

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

function parseArgs(argv) {
  const options = {
    blueprints: [...DEFAULT_BLUEPRINTS],
    json: false,
    keepTmp: false,
    contentRoot: process.env.DECANTR_CONTENT_DIR || '',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--json') {
      options.json = true;
    } else if (arg === '--keep-tmp') {
      options.keepTmp = true;
    } else if (arg.startsWith('--blueprints=')) {
      options.blueprints = arg
        .split('=')[1]
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
    } else if (arg === '--blueprints' && argv[index + 1]) {
      options.blueprints = argv[index + 1]
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
      index += 1;
    } else if (arg.startsWith('--content-root=')) {
      options.contentRoot = arg.split('=')[1];
    } else if (arg === '--content-root' && argv[index + 1]) {
      options.contentRoot = argv[index + 1];
      index += 1;
    }
  }

  return options;
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

function projectSlug(blueprint) {
  return blueprint.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase();
}

function expectedRouterForRouting(routing) {
  return routing === 'pathname' ? 'BrowserRouter' : 'HashRouter';
}

function run(command, args, options) {
  return execFileSync(command, args, {
    ...options,
    encoding: 'utf8',
  });
}

function certifyBlueprint(tmpRoot, blueprint, cliPath, contentRoot) {
  const projectName = `${projectSlug(blueprint)}-cert`;
  const projectDir = join(tmpRoot, projectName);

  const newOutput = run(
    process.execPath,
    [cliPath, 'new', projectName, `--blueprint=${blueprint}`, '--offline'],
    {
      cwd: tmpRoot,
      env: {
        ...process.env,
        DECANTR_CONTENT_DIR: contentRoot,
      },
      stdio: 'pipe',
    },
  );

  const requiredFiles = [
    'package.json',
    'src/main.tsx',
    'src/App.tsx',
    'src/styles/global.css',
    'src/styles/tokens.css',
    'src/styles/treatments.css',
    'decantr.essence.json',
    'DECANTR.md',
    '.decantr/context/scaffold-pack.md',
    '.decantr/context/pack-manifest.json',
  ];

  for (const relativePath of requiredFiles) {
    if (!existsSync(join(projectDir, relativePath))) {
      throw new Error(`missing required file ${relativePath}`);
    }
  }

  const essence = JSON.parse(readFileSync(join(projectDir, 'decantr.essence.json'), 'utf8'));
  const routing = essence?.meta?.platform?.routing ?? 'hash';
  const router = expectedRouterForRouting(routing);
  const mainTsx = readFileSync(join(projectDir, 'src', 'main.tsx'), 'utf8');
  const appTsx = readFileSync(join(projectDir, 'src', 'App.tsx'), 'utf8');

  if (!mainTsx.includes(router)) {
    throw new Error(`starter runtime router mismatch: expected ${router} for routing=${routing}`);
  }

  if (!appTsx.includes(`Routing: ${routing}`)) {
    throw new Error(`starter app copy does not mention routing mode ${routing}`);
  }

  const buildOutput = run('npm', ['run', 'build'], {
    cwd: projectDir,
    env: process.env,
    stdio: 'pipe',
  });

  return {
    blueprint,
    projectName,
    projectDir,
    routing,
    router,
    buildPassed: true,
    newSummary: newOutput.includes(`✓ Project "${projectName}" created!`),
    buildSummary: /built in /i.test(buildOutput),
  };
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
    console.error(`${RED}Could not resolve decantr-content. Set DECANTR_CONTENT_DIR or pass --content-root.${RESET}`);
    process.exit(1);
  }

  if (options.blueprints.length === 0) {
    console.error(`${RED}No blueprints specified. Pass --blueprints=portfolio,producer-studio,agent-marketplace.${RESET}`);
    process.exit(1);
  }

  const tmpRoot = mkdtempSync(join(tmpdir(), 'decantr-certify-'));
  const results = [];
  let failed = false;

  try {
    for (const blueprint of options.blueprints) {
      if (!options.json) {
        console.log(`${CYAN}Certifying${RESET} ${blueprint} ${DIM}(greenfield new + build)${RESET}`);
      }

      try {
        const result = certifyBlueprint(tmpRoot, blueprint, cliPath, contentRoot);
        results.push({ ...result, status: 'passed' });
        if (!options.json) {
          console.log(`${GREEN}  passed${RESET} ${blueprint} -> ${result.router} (${result.routing})`);
        }
      } catch (error) {
        failed = true;
        const message = error instanceof Error ? error.message : String(error);
        results.push({
          blueprint,
          status: 'failed',
          error: message,
        });
        if (!options.json) {
          console.log(`${RED}  failed${RESET} ${blueprint}: ${message}`);
        }
      }
    }

    if (options.json) {
      console.log(JSON.stringify({
        contentRoot,
        tmpRoot,
        results,
      }, null, 2));
    } else {
      console.log('');
      console.log(`${DIM}Content root:${RESET} ${contentRoot}`);
      console.log(`${DIM}Temp root:${RESET} ${tmpRoot}`);
      console.log(`${DIM}Summary:${RESET} ${results.filter((entry) => entry.status === 'passed').length}/${results.length} passed`);
      if (!options.keepTmp) {
        console.log(`${DIM}Temporary projects will be removed after the run.${RESET}`);
      }
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
