// Workspace prep: scaffold Vite + React and run `decantr init`.

import { mkdirSync, writeFileSync, existsSync, readFileSync, readdirSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CLI_RESOLUTION } from './config.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MONOREPO_ROOT = resolve(__dirname, '../../..');

// When running from a worktree, `packages/cli/dist/` is typically unbuilt.
// Walk up past `.claude/worktrees/*/` to find the canonical monorepo that
// actually holds the built CLI. Also respects DECANTR_MONOREPO env override.
function canonicalMonorepo() {
  if (process.env.DECANTR_MONOREPO && existsSync(process.env.DECANTR_MONOREPO)) {
    return process.env.DECANTR_MONOREPO;
  }
  // Detect the `.claude/worktrees/<branch>/` pattern and strip it.
  const m = MONOREPO_ROOT.match(/^(.*?)\/\.claude\/worktrees\/[^/]+\/?$/);
  if (m && existsSync(m[1])) return m[1];
  return MONOREPO_ROOT;
}

const PACKAGE_JSON = {
  name: 'harness-workspace',
  private: true,
  version: '0.0.0',
  type: 'module',
  scripts: {
    dev: 'vite',
    build: 'tsc -b && vite build',
    preview: 'vite preview',
  },
  dependencies: {
    react: '^19.0.0',
    'react-dom': '^19.0.0',
    'react-router-dom': '^7.0.0',
    '@decantr/css': '^1.0.0',
    'lucide-react': '^0.468.0',
  },
  devDependencies: {
    '@types/react': '^19.0.0',
    '@types/react-dom': '^19.0.0',
    '@vitejs/plugin-react': '^4.0.0',
    typescript: '^5.7.0',
    vite: '^6.0.0',
  },
};

const VITE_CONFIG = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({ plugins: [react()] });
`;

const TSCONFIG = JSON.stringify(
  {
    compilerOptions: {
      target: 'ES2022',
      useDefineForClassFields: true,
      lib: ['ES2022', 'DOM', 'DOM.Iterable'],
      module: 'ESNext',
      skipLibCheck: true,
      moduleResolution: 'bundler',
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: 'react-jsx',
      strict: true,
      noUnusedLocals: false,
      noUnusedParameters: false,
      noFallthroughCasesInSwitch: true,
    },
    include: ['src'],
  },
  null,
  2,
);

const INDEX_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Decantr Harness Workspace</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

function resolveCli() {
  // 1. Operator override
  if (process.env.DECANTR_CLI_PATH && existsSync(process.env.DECANTR_CLI_PATH)) {
    return { kind: 'env', command: 'node', args: [process.env.DECANTR_CLI_PATH] };
  }
  // 2. Local build (worktree first, then canonical monorepo)
  for (const root of [MONOREPO_ROOT, canonicalMonorepo()]) {
    const abs = resolve(root, 'packages/cli/dist/bin.js');
    if (existsSync(abs)) return { kind: 'local', command: 'node', args: [abs] };
  }
  // 3. Explicitly REFUSE the published CLI — v0.9.11 is pre-vnext and produces
  //    a completely different (no-execution-packs) scaffold, which would
  //    invalidate the harness. Error loudly with a build hint.
  throw new Error(
    'Local decantr CLI not found. The published npm CLI is pre-vnext and ' +
      'would produce the wrong scaffold shape. Build the local CLI first:\n\n' +
      `  cd ${canonicalMonorepo()} && pnpm --filter @decantr/cli build\n\n` +
      'Or set DECANTR_CLI_PATH=/path/to/bin.js to override.',
  );
}

export function prepWorkspace({ blueprint, workspace }) {
  mkdirSync(workspace, { recursive: true });
  mkdirSync(join(workspace, 'src'), { recursive: true });

  // Only write template files if they don't already exist (safe re-runs).
  const writeIfMissing = (rel, content) => {
    const abs = join(workspace, rel);
    if (!existsSync(abs)) writeFileSync(abs, content);
  };

  writeIfMissing('package.json', JSON.stringify(PACKAGE_JSON, null, 2));
  writeIfMissing('vite.config.ts', VITE_CONFIG);
  writeIfMissing('tsconfig.json', TSCONFIG);
  writeIfMissing('tsconfig.app.json', TSCONFIG);
  writeIfMissing('index.html', INDEX_HTML);

  // Install deps if node_modules missing.
  if (!existsSync(join(workspace, 'node_modules'))) {
    console.log('  installing workspace deps...');
    execFileSync('npm', ['install'], { cwd: workspace, stdio: 'inherit' });
  }

  // Resolve CLI and run sync + init.
  const cli = resolveCli();
  console.log(`  using CLI: ${cli.kind} (${cli.command} ${cli.args.join(' ')})`);

  console.log('  decantr sync...');
  execFileSync(cli.command, [...cli.args, 'sync'], { cwd: workspace, stdio: 'inherit' });

  // If DECANTR_CONTENT_DIR is set, use --offline so the CLI pulls themes/
  // patterns from that checkout instead of the hosted registry. This is how
  // we test local edits to decantr-content without publishing.
  const initArgs = ['init', `--blueprint=${blueprint}`, '--existing', '--yes'];
  if (process.env.DECANTR_CONTENT_DIR) {
    initArgs.push('--offline');
    console.log(`  using DECANTR_CONTENT_DIR=${process.env.DECANTR_CONTENT_DIR} (--offline)`);
  }
  console.log(`  decantr ${initArgs.join(' ')}...`);
  execFileSync(cli.command, [...cli.args, ...initArgs], { cwd: workspace, stdio: 'inherit' });

  // Validate scaffold. Tolerate BOTH contract shapes — pack-style (has
  // scaffold-pack.md + pack-manifest.json) and narrative-only (scaffold.md
  // + section-*.md only). The shape itself is a finding we record.
  const mustExist = ['DECANTR.md', 'decantr.essence.json'];
  for (const f of mustExist) {
    if (!existsSync(join(workspace, f))) {
      throw new Error(`Expected ${f} after init, not found.`);
    }
  }
  const contextDir = join(workspace, '.decantr/context');
  if (!existsSync(contextDir)) {
    throw new Error(`Expected .decantr/context/ after init, not found.`);
  }

  const hasScaffoldPack = existsSync(join(contextDir, 'scaffold-pack.md'));
  const hasPackManifest = existsSync(join(contextDir, 'pack-manifest.json'));
  const hasAnyPagePack = readdirSafe(contextDir).some((n) => /^page-.*-pack\.md$/.test(n));
  const hasAnySectionPack = readdirSafe(contextDir).some((n) => /^section-.*-pack\.md$/.test(n));
  const contractShape =
    hasScaffoldPack && hasPackManifest && hasAnyPagePack ? 'pack-style'
      : hasScaffoldPack || hasAnyPagePack || hasAnySectionPack ? 'partial-pack'
      : 'narrative-only';

  return {
    workspace,
    blueprint,
    contractShape,
    contextFileCount: readdirSafe(contextDir).length,
    hasScaffoldPack,
    hasPackManifest,
    hasAnyPagePack,
    hasAnySectionPack,
  };
}

function readdirSafe(dir) {
  try {
    return readdirSync(dir);
  } catch {
    return [];
  }
}
