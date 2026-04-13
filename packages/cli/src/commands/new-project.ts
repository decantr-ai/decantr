import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { seedOfflineRegistry } from '../offline-content.js';

const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';

function heading(text: string): string { return `\n${BOLD}${text}${RESET}\n`; }
function success(text: string): string { return `${GREEN}${text}${RESET}`; }
function error(text: string): string { return `${RED}${text}${RESET}`; }
function dim(text: string): string { return `${DIM}${text}${RESET}`; }
function cyan(text: string): string { return `${CYAN}${text}${RESET}`; }
function detectRoutingMode(projectDir: string): 'hash' | 'history' {
  try {
    const essence = JSON.parse(readFileSync(join(projectDir, 'decantr.essence.json'), 'utf-8')) as {
      meta?: { platform?: { routing?: string } };
    };
    return essence.meta?.platform?.routing === 'history' ? 'history' : 'hash';
  } catch {
    return 'hash';
  }
}

function writeStarterRuntimeFiles(projectDir: string, title: string, routingMode: 'hash' | 'history'): void {
  const srcDir = join(projectDir, 'src');
  const routerImport = routingMode === 'history' ? 'BrowserRouter' : 'HashRouter';

  const mainTsx = `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ${routerImport} } from 'react-router-dom';
import { App } from './App';
import './styles/global.css';
import './styles/tokens.css';
import './styles/treatments.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <${routerImport}>
      <App />
    </${routerImport}>
  </StrictMode>,
);
`;
  writeFileSync(join(srcDir, 'main.tsx'), mainTsx);

  const appTsx = `import { css } from '@decantr/css';
import { Routes, Route } from 'react-router-dom';

function WelcomePage() {
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <main id="main-content" className={css('_minh[100vh] _flex _col _aic _jcc _p6 _gap4')}>
        <section className={css('_wfull _mw[42rem]') + ' d-section'} data-density="comfortable">
          <div className={css('_flex _col _aic _gap4 _textc') + ' d-surface'} data-elevation="raised">
            <p className="d-label" data-anchor>Decantr starter</p>
            <h1 className={css('_heading2')}>${title}</h1>
            <p className={css('_textsm _fgmuted _mw[32rem]')}>
              Scaffolded with Decantr. Read DECANTR.md and the compiled packs in .decantr/context before building routes.
            </p>
            <div className={css('_flex _gap3 _wrap _jcc')}>
              <span className="d-annotation" data-status="info">Runtime: @decantr/css</span>
              <span className="d-annotation" data-status="success">Routing: ${routingMode}</span>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
    </Routes>
  );
}
`;
  writeFileSync(join(srcDir, 'App.tsx'), appTsx);
}

export interface NewProjectOptions {
  blueprint?: string;
  archetype?: string;
  theme?: string;
  mode?: string;
  shape?: string;
  offline?: boolean;
  registry?: string;
}

export async function cmdNewProject(
  projectName: string,
  options: NewProjectOptions
): Promise<void> {
  const workspaceRoot = process.cwd();
  const projectDir = resolve(workspaceRoot, projectName);

  // Validate project name
  if (!/^[a-z0-9][a-z0-9._-]*$/i.test(projectName)) {
    console.error(error('Invalid project name. Use alphanumeric characters, hyphens, dots, or underscores.'));
    process.exitCode = 1;
    return;
  }

  // Check directory doesn't already exist
  if (existsSync(projectDir)) {
    console.error(error(`Directory "${projectName}" already exists.`));
    process.exitCode = 1;
    return;
  }

  console.log(heading(`Creating ${projectName}...`));

  // 1. Create directory
  mkdirSync(projectDir, { recursive: true });
  console.log(dim(`  Created ${projectName}/`));

  // 2. Write package.json
  const packageJson = {
    name: projectName,
    private: true,
    version: '0.0.0',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'tsc -b && vite build',
      preview: 'vite preview',
    },
    dependencies: {
      'react': '^19.0.0',
      'react-dom': '^19.0.0',
      'react-router-dom': '^7.0.0',
      '@decantr/css': '^1.0.0',
    },
    devDependencies: {
      '@types/react': '^19.0.0',
      '@types/react-dom': '^19.0.0',
      '@vitejs/plugin-react': '^4.0.0',
      'typescript': '^5.7.0',
      'vite': '^6.0.0',
    },
  };
  writeFileSync(join(projectDir, 'package.json'), JSON.stringify(packageJson, null, 2) + '\n');
  console.log(dim('  Created package.json'));

  // 3. Write vite.config.ts
  const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
`;
  writeFileSync(join(projectDir, 'vite.config.ts'), viteConfig);
  console.log(dim('  Created vite.config.ts'));

  // 4. Write tsconfig files
  const tsconfig = {
    compilerOptions: {
      target: 'ES2020',
      useDefineForClassFields: true,
      lib: ['ES2020', 'DOM', 'DOM.Iterable'],
      module: 'ESNext',
      skipLibCheck: true,
      moduleResolution: 'bundler',
      allowImportingTsExtensions: true,
      isolatedModules: true,
      moduleDetection: 'force',
      noEmit: true,
      jsx: 'react-jsx',
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noFallthroughCasesInSwitch: true,
      noUncheckedSideEffectImports: true,
    },
    include: ['src'],
  };
  writeFileSync(join(projectDir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2) + '\n');

  const tsconfigApp = {
    compilerOptions: {
      tsBuildInfoFile: './node_modules/.tmp/tsconfig.app.tsbuildinfo',
      target: 'ES2020',
      useDefineForClassFields: true,
      lib: ['ES2020', 'DOM', 'DOM.Iterable'],
      module: 'ESNext',
      skipLibCheck: true,
      moduleResolution: 'bundler',
      allowImportingTsExtensions: true,
      isolatedModules: true,
      moduleDetection: 'force',
      noEmit: true,
      jsx: 'react-jsx',
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noFallthroughCasesInSwitch: true,
      noUncheckedSideEffectImports: true,
    },
    include: ['src'],
  };
  writeFileSync(join(projectDir, 'tsconfig.app.json'), JSON.stringify(tsconfigApp, null, 2) + '\n');
  console.log(dim('  Created tsconfig.json'));

  // 5. Write index.html
  const title = projectName.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
  writeFileSync(join(projectDir, 'index.html'), indexHtml);
  console.log(dim('  Created index.html'));

  // 6. Create src/ directory and files
  const srcDir = join(projectDir, 'src');
  mkdirSync(srcDir, { recursive: true });

  writeStarterRuntimeFiles(projectDir, title, 'hash');

  // src/vite-env.d.ts
  writeFileSync(join(srcDir, 'vite-env.d.ts'), '/// <reference types="vite/client" />\n');

  // Create empty styles directory (decantr init will populate it)
  mkdirSync(join(srcDir, 'styles'), { recursive: true });

  console.log(dim('  Created src/'));

  // 7. Install dependencies
  console.log(heading('Installing dependencies...'));

  const packageManager = detectPackageManager();
  try {
    execSync(`${packageManager} install`, { cwd: projectDir, stdio: 'inherit' });
  } catch {
    console.log(`\n${YELLOW}Dependency install failed. Run \`${packageManager} install\` manually.${RESET}`);
  }

  const requiresOfflineContent = Boolean(options.offline && (options.blueprint || options.archetype));
  const seeded = options.offline ? seedOfflineRegistry(projectDir, workspaceRoot) : { seeded: false, strategy: null };
  if (seeded.seeded) {
    console.log(dim(`  Seeded offline registry content from ${seeded.strategy}.`));
  } else if (requiresOfflineContent) {
    console.log(`${YELLOW}  Offline blueprint/archetype resolution requires local registry content.${RESET}`);
    console.log(dim('  No parent workspace cache/custom content or configured decantr-content source was found.'));
    console.log('');
    console.log(success(`\n✓ Project "${projectName}" created!\n`));
    console.log(`  ${cyan('cd ' + projectName)}`);
    console.log(`  ${cyan(packageManager + ' run dev')}`);
    console.log(`  ${cyan('decantr sync')}  ${dim('# when online, then rerun decantr init')}`);
    console.log(`  ${cyan('DECANTR_CONTENT_DIR=/path/to/decantr-content decantr init --existing --offline')}  ${dim('# or seed a local content source')}`);
    console.log('');
    return;
  }

  // 8. Run decantr init inside the new project
  console.log(heading('Initializing Decantr...'));

  // Build the init args to pass through
  const initFlags: string[] = ['--yes', '--existing'];
  if (options.blueprint) initFlags.push(`--blueprint=${options.blueprint}`);
  if (options.archetype) initFlags.push(`--archetype=${options.archetype}`);
  if (options.theme) initFlags.push(`--theme=${options.theme}`);
  if (options.mode) initFlags.push(`--mode=${options.mode}`);
  if (options.shape) initFlags.push(`--shape=${options.shape}`);
  if (options.offline) initFlags.push('--offline');
  if (options.registry) initFlags.push(`--registry=${options.registry}`);

  try {
    // Reuse the currently-running CLI entrypoint when available.
    const bundledCliEntrypoint = fileURLToPath(new URL('./bin.js', import.meta.url));
    const cliEntrypoint = existsSync(bundledCliEntrypoint)
      ? bundledCliEntrypoint
      : process.argv[1] && existsSync(process.argv[1]) ? process.argv[1] : null;
    const cliPath = cliEntrypoint
      ? `"${process.execPath}" "${cliEntrypoint}"`
      : 'npx decantr';
    execSync(`${cliPath} init ${initFlags.join(' ')}`, { cwd: projectDir, stdio: 'inherit' });
    writeStarterRuntimeFiles(projectDir, title, detectRoutingMode(projectDir));
  } catch {
    console.log(`\n${YELLOW}Decantr init encountered issues. Run \`decantr init\` manually inside ${projectName}/.${RESET}`);
  }

  // 9. Print success
  console.log(success(`\n✓ Project "${projectName}" created!\n`));
  console.log(`  ${cyan('cd ' + projectName)}`);
  console.log(`  ${cyan(packageManager + ' run dev')}`);
  console.log('');
}

function detectPackageManager(): string {
  // Check for lockfiles in cwd (parent project context)
  if (existsSync(join(process.cwd(), 'pnpm-lock.yaml')) || existsSync(join(process.cwd(), 'pnpm-workspace.yaml'))) {
    return 'pnpm';
  }
  if (existsSync(join(process.cwd(), 'yarn.lock'))) {
    return 'yarn';
  }
  if (existsSync(join(process.cwd(), 'bun.lockb')) || existsSync(join(process.cwd(), 'bun.lock'))) {
    return 'bun';
  }
  return 'npm';
}
