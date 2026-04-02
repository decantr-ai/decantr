import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execSync } from 'node:child_process';

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
  const projectDir = resolve(process.cwd(), projectName);

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

  // src/main.tsx
  const mainTsx = `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import './styles/tokens.css';
import './styles/treatments.css';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
`;
  writeFileSync(join(srcDir, 'main.tsx'), mainTsx);

  // src/App.tsx
  const appTsx = `import { Routes, Route } from 'react-router-dom';

function WelcomePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1rem' }}>
      <h1>${title}</h1>
      <p style={{ opacity: 0.6 }}>Scaffolded with Decantr. Run <code>decantr status</code> to check project health.</p>
    </div>
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
    // Use the CLI's own binary to run init in the new project directory
    const cliBin = join(__dirname, '..', 'bin', 'decantr.js');
    const cliPath = existsSync(cliBin) ? `node ${cliBin}` : 'npx decantr';
    execSync(`${cliPath} init ${initFlags.join(' ')}`, { cwd: projectDir, stdio: 'inherit' });
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
