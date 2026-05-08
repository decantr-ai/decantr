import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { resolvePackAdapter } from '@decantr/core';

export type BootstrapRoutingMode = 'hash' | 'history' | 'pathname';

export interface BootstrapTargetResolution {
  target: string;
  platformType: 'spa' | 'ssr';
  packAdapter: string;
  bootstrapAdapterId: string | null;
  adapterId: string;
}

export interface AdapterCapabilities {
  bootstrap: boolean;
  realize: boolean;
  attach: boolean;
  styling: boolean;
  verify: boolean;
}

export interface AdapterAttachHints {
  routeRoots: string[];
  layoutFiles: string[];
  componentRoots: string[];
}

export interface AdapterVerifyHints {
  devCommand: string;
  buildCommand: string;
  distDir: string;
}

export interface DecantrAdapter {
  id: string;
  label: string;
  target: string;
  packAdapter: string;
  capabilities: AdapterCapabilities;
  attach: AdapterAttachHints;
  verify: AdapterVerifyHints;
  writeProjectFiles?: (
    projectDir: string,
    title: string,
    routingMode: BootstrapRoutingMode,
  ) => void;
}

export type BootstrapAdapter = DecantrAdapter & {
  writeProjectFiles(projectDir: string, title: string, routingMode: BootstrapRoutingMode): void;
};

const reactViteBootstrapAdapter: DecantrAdapter = {
  id: 'react-vite',
  label: 'React + Vite starter',
  target: 'react',
  packAdapter: 'react-vite',
  capabilities: {
    bootstrap: true,
    realize: true,
    attach: true,
    styling: true,
    verify: true,
  },
  attach: {
    routeRoots: ['src/App.tsx', 'src/routes', 'src/pages'],
    layoutFiles: ['src/App.tsx', 'src/main.tsx'],
    componentRoots: ['src/components', 'src/pages', 'src/routes'],
  },
  verify: {
    devCommand: 'npm run dev',
    buildCommand: 'npm run build',
    distDir: 'dist',
  },
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
        '@decantr/css': '^1.0.4',
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
              Scaffolded with Decantr. Read .decantr/context/scaffold-pack.md first, then use DECANTR.md as a lookup reference.
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

const nextAppAdapter: DecantrAdapter = {
  id: 'next-app',
  label: 'Next.js App Router starter',
  target: 'nextjs',
  packAdapter: 'nextjs',
  capabilities: {
    bootstrap: true,
    realize: true,
    attach: true,
    styling: true,
    verify: true,
  },
  attach: {
    routeRoots: ['app', 'pages'],
    layoutFiles: ['app/layout.tsx', 'pages/_app.tsx'],
    componentRoots: ['components', 'src/components', 'app'],
  },
  verify: {
    devCommand: 'npm run dev',
    buildCommand: 'npm run build',
    distDir: '.next',
  },
  writeProjectFiles(projectDir: string, title: string): void {
    const appDir = join(projectDir, 'app');
    const stylesDir = join(projectDir, 'src', 'styles');
    const packageJson = {
      name: basename(projectDir) || 'decantr-next-app',
      private: true,
      version: '0.0.0',
      type: 'module',
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
      },
      dependencies: {
        '@decantr/css': '^1.0.4',
        'lucide-react': '^0.468.0',
        next: '^16.0.0',
        react: '^19.0.0',
        'react-dom': '^19.0.0',
      },
      devDependencies: {
        '@types/node': '^20.0.0',
        '@types/react': '^19.0.0',
        '@types/react-dom': '^19.0.0',
        typescript: '^5.7.0',
      },
    };

    writeFileSync(join(projectDir, 'package.json'), JSON.stringify(packageJson, null, 2) + '\n');
    writeFileSync(
      join(projectDir, 'next.config.ts'),
      'import type { NextConfig } from "next";\n\nconst nextConfig: NextConfig = {};\n\nexport default nextConfig;\n',
    );
    writeFileSync(
      join(projectDir, 'next-env.d.ts'),
      '/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n\n// This file is generated by Next.js.\n',
    );
    writeFileSync(
      join(projectDir, 'tsconfig.json'),
      JSON.stringify(
        {
          compilerOptions: {
            target: 'ES2017',
            lib: ['dom', 'dom.iterable', 'esnext'],
            allowJs: true,
            skipLibCheck: true,
            strict: true,
            noEmit: true,
            esModuleInterop: true,
            module: 'esnext',
            moduleResolution: 'bundler',
            resolveJsonModule: true,
            isolatedModules: true,
            jsx: 'preserve',
            incremental: true,
            plugins: [{ name: 'next' }],
          },
          include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
          exclude: ['node_modules'],
        },
        null,
        2,
      ) + '\n',
    );

    mkdirSync(appDir, { recursive: true });
    mkdirSync(stylesDir, { recursive: true });
    writeFileSync(
      join(appDir, 'layout.tsx'),
      `import type { Metadata } from 'next';\nimport '../src/styles/global.css';\nimport '../src/styles/tokens.css';\nimport '../src/styles/treatments.css';\n\nexport const metadata: Metadata = {\n  title: '${title}',\n  description: 'Scaffolded with Decantr',\n};\n\nexport default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {\n  return (\n    <html lang="en">\n      <body>{children}</body>\n    </html>\n  );\n}\n`,
    );
    writeFileSync(
      join(appDir, 'page.tsx'),
      `import { css } from '@decantr/css';\n\nexport default function HomePage() {\n  return (\n    <main id="main-content" className={css('_minh[100vh] _flex _col _aic _jcc _p6 _gap4')}>\n      <section className={css('_wfull _mw[42rem]') + ' d-section'} data-density="comfortable">\n        <div className={css('_flex _col _aic _gap4 _textc') + ' d-surface'} data-elevation="raised">\n          <p className="d-label" data-anchor>Decantr starter</p>\n          <h1 className={css('_heading2')}>${title}</h1>\n          <p className={css('_textsm _fgmuted _mw[32rem]')}>Scaffolded with Decantr. Read .decantr/context/scaffold-pack.md first, then use DECANTR.md as a lookup reference.</p>\n          <span className="d-annotation" data-status="info">Runtime: Next.js App Router</span>\n        </div>\n      </section>\n    </main>\n  );\n}\n`,
    );
  },
};

const genericWebAdapter: DecantrAdapter = {
  id: 'generic-web',
  label: 'Generic web contract adapter',
  target: 'generic',
  packAdapter: 'generic-web',
  capabilities: {
    bootstrap: false,
    realize: false,
    attach: true,
    styling: true,
    verify: true,
  },
  attach: {
    routeRoots: ['src', 'app', 'pages'],
    layoutFiles: ['index.html', 'src/main.ts', 'src/main.tsx'],
    componentRoots: ['src/components', 'components'],
  },
  verify: {
    devCommand: 'npm run dev',
    buildCommand: 'npm run build',
    distDir: 'dist',
  },
};

const DECANTR_ADAPTERS: Record<string, DecantrAdapter> = {
  'react-vite': reactViteBootstrapAdapter,
  'next-app': nextAppAdapter,
  'generic-web': genericWebAdapter,
};

export function resolveBootstrapTarget(target: string | undefined): BootstrapTargetResolution {
  const normalizedTarget = (target || 'react').toLowerCase();
  const platformType = normalizedTarget === 'nextjs' ? ('ssr' as const) : ('spa' as const);
  const packAdapter = resolvePackAdapter(normalizedTarget, platformType);
  const adapterId =
    normalizedTarget === 'nextjs'
      ? 'next-app'
      : DECANTR_ADAPTERS[packAdapter]
        ? packAdapter
        : 'generic-web';

  return {
    target: normalizedTarget,
    platformType,
    packAdapter,
    adapterId,
    bootstrapAdapterId:
      DECANTR_ADAPTERS[adapterId]?.capabilities.bootstrap &&
      DECANTR_ADAPTERS[adapterId]?.writeProjectFiles
        ? adapterId
        : null,
  };
}

export function getBootstrapAdapter(
  resolution: BootstrapTargetResolution,
): BootstrapAdapter | null {
  if (!resolution.bootstrapAdapterId) {
    return null;
  }
  const adapter = DECANTR_ADAPTERS[resolution.bootstrapAdapterId];
  return adapter?.writeProjectFiles ? (adapter as BootstrapAdapter) : null;
}

export function getDecantrAdapter(adapterId: string): DecantrAdapter {
  return DECANTR_ADAPTERS[adapterId] ?? genericWebAdapter;
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
