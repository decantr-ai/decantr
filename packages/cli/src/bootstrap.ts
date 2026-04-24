import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { resolvePackAdapter } from '@decantr/core';

export type BootstrapRoutingMode = 'hash' | 'history' | 'pathname';

export interface BootstrapTargetResolution {
  target: string;
  platformType: 'spa';
  packAdapter: string;
  bootstrapAdapterId: string | null;
}

export interface BootstrapAdapter {
  id: string;
  label: string;
  writeProjectFiles(projectDir: string, title: string, routingMode: BootstrapRoutingMode): void;
}

const reactViteBootstrapAdapter: BootstrapAdapter = {
  id: 'react-vite',
  label: 'React + Vite starter',
  writeProjectFiles(projectDir: string, title: string, routingMode: BootstrapRoutingMode): void {
    const srcDir = join(projectDir, 'src');
    const routerImport = routingMode === 'hash' ? 'HashRouter' : 'BrowserRouter';

    const packageJson = {
      name: basename(projectDir) || 'decantr-app',
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
        // P0-4: Lucide is the canonical icon library Decantr blueprints
        // reference in personality prose ("Lucide icons"). Including it by
        // default means cold scaffolds don't have to hand-roll inline SVGs.
        // Tree-shaking eliminates unused imports, so the bundle cost is
        // zero when unused and ~2KB per icon when used.
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
    writeFileSync(join(projectDir, 'package.json'), JSON.stringify(packageJson, null, 2) + '\n');

    const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
`;
    writeFileSync(join(projectDir, 'vite.config.ts'), viteConfig);

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
    writeFileSync(
      join(projectDir, 'tsconfig.app.json'),
      JSON.stringify(tsconfigApp, null, 2) + '\n',
    );

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

    mkdirSync(srcDir, { recursive: true });

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
    writeFileSync(join(srcDir, 'vite-env.d.ts'), '/// <reference types="vite/client" />\n');
    mkdirSync(join(srcDir, 'styles'), { recursive: true });
  },
};

const BOOTSTRAP_ADAPTERS: Record<string, BootstrapAdapter> = {
  'react-vite': reactViteBootstrapAdapter,
};

export function resolveBootstrapTarget(target: string | undefined): BootstrapTargetResolution {
  const normalizedTarget = (target || 'react').toLowerCase();
  const platformType = 'spa' as const;
  const packAdapter = resolvePackAdapter(normalizedTarget, platformType);

  return {
    target: normalizedTarget,
    platformType,
    packAdapter,
    bootstrapAdapterId: BOOTSTRAP_ADAPTERS[packAdapter]?.id ?? null,
  };
}

export function getBootstrapAdapter(
  resolution: BootstrapTargetResolution,
): BootstrapAdapter | null {
  if (!resolution.bootstrapAdapterId) {
    return null;
  }
  return BOOTSTRAP_ADAPTERS[resolution.bootstrapAdapterId] ?? null;
}

export function detectRoutingMode(projectDir: string): BootstrapRoutingMode {
  try {
    const essence = JSON.parse(readFileSync(join(projectDir, 'decantr.essence.json'), 'utf-8')) as {
      meta?: { platform?: { routing?: string } };
    };
    const routing = essence.meta?.platform?.routing;
    if (routing === 'history' || routing === 'pathname') {
      return routing;
    }
    return 'hash';
  } catch {
    return 'hash';
  }
}
