import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { resolvePackAdapter } from '@decantr/core';

export type BootstrapRoutingMode = 'hash' | 'history' | 'pathname';
export type AdapterStatus = 'contract-only' | 'experimental' | 'certified' | 'deprecated';
export type AdapterRoutingModel = BootstrapRoutingMode | 'framework-native';

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

export interface AdapterPackagePlan {
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

export interface DecantrAdapter {
  id: string;
  label: string;
  target: string;
  aliases: string[];
  status: AdapterStatus;
  packAdapter: string;
  routing: AdapterRoutingModel;
  capabilities: AdapterCapabilities;
  attach: AdapterAttachHints;
  verify: AdapterVerifyHints;
  packagePlan?: AdapterPackagePlan;
  docs: {
    summary: string;
    notes: string[];
  };
  writeProjectFiles?: (
    projectDir: string,
    title: string,
    routingMode: BootstrapRoutingMode,
  ) => void;
}

export type BootstrapAdapter = DecantrAdapter & {
  writeProjectFiles(projectDir: string, title: string, routingMode: BootstrapRoutingMode): void;
};

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, JSON.stringify(value, null, 2) + '\n');
}

function mkdirp(path: string): void {
  mkdirSync(path, { recursive: true });
}

function starterName(projectDir: string, fallback: string): string {
  return basename(projectDir) || fallback;
}

function writeViteTsConfig(projectDir: string, options: { jsx?: string } = {}): void {
  writeJson(join(projectDir, 'tsconfig.json'), {
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
      ...(options.jsx ? { jsx: options.jsx } : {}),
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noFallthroughCasesInSwitch: true,
      noUncheckedSideEffectImports: true,
    },
    include: ['src'],
  });
}

function writeIndexHtml(projectDir: string, title: string, entry: string): void {
  writeFileSync(
    join(projectDir, 'index.html'),
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="${entry}"></script>
  </body>
</html>
`,
  );
}

function ensureStyleDir(projectDir: string): void {
  mkdirp(join(projectDir, 'src', 'styles'));
}

function packagePlanPackageJson(
  projectDir: string,
  fallbackName: string,
  packagePlan: AdapterPackagePlan,
): Record<string, unknown> {
  return {
    name: starterName(projectDir, fallbackName),
    private: true,
    version: '0.0.0',
    type: 'module',
    scripts: packagePlan.scripts,
    dependencies: packagePlan.dependencies,
    devDependencies: packagePlan.devDependencies,
  };
}

const reactVitePackagePlan: AdapterPackagePlan = {
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

const nextPackagePlan: AdapterPackagePlan = {
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

const vanillaPackagePlan: AdapterPackagePlan = {
  scripts: {
    dev: 'vite',
    build: 'vite build',
    preview: 'vite preview',
  },
  dependencies: {
    '@decantr/css': '^1.0.4',
    lucide: '^0.468.0',
  },
  devDependencies: {
    vite: '^6.0.0',
  },
};

const vuePackagePlan: AdapterPackagePlan = {
  scripts: {
    dev: 'vite',
    build: 'vue-tsc -b && vite build',
    preview: 'vite preview',
  },
  dependencies: {
    '@decantr/css': '^1.0.4',
    '@vitejs/plugin-vue': '^5.0.0',
    '@vue/compiler-sfc': '^3.5.0',
    'lucide-vue-next': '^0.468.0',
    vue: '^3.5.0',
    'vue-router': '^4.4.0',
  },
  devDependencies: {
    typescript: '^5.7.0',
    vite: '^6.0.0',
    'vue-tsc': '^2.1.0',
  },
};

const sveltePackagePlan: AdapterPackagePlan = {
  scripts: {
    dev: 'vite dev',
    build: 'vite build',
    preview: 'vite preview',
  },
  dependencies: {
    '@decantr/css': '^1.0.4',
    '@sveltejs/adapter-auto': '^3.0.0',
    '@sveltejs/kit': '^2.0.0',
    '@sveltejs/vite-plugin-svelte': '^5.0.0',
    lucide: '^0.468.0',
    svelte: '^5.0.0',
  },
  devDependencies: {
    typescript: '^5.7.0',
    vite: '^6.0.0',
  },
};

const angularPackagePlan: AdapterPackagePlan = {
  scripts: {
    dev: 'ng serve',
    build: 'ng build',
    start: 'ng serve',
  },
  dependencies: {
    '@angular/animations': '^19.0.0',
    '@angular/common': '^19.0.0',
    '@angular/compiler': '^19.0.0',
    '@angular/core': '^19.0.0',
    '@angular/forms': '^19.0.0',
    '@angular/platform-browser': '^19.0.0',
    '@angular/router': '^19.0.0',
    '@decantr/css': '^1.0.4',
    lucide: '^0.468.0',
    rxjs: '^7.8.0',
    tslib: '^2.8.0',
    'zone.js': '^0.15.0',
  },
  devDependencies: {
    '@angular-devkit/build-angular': '^19.0.0',
    '@angular/cli': '^19.0.0',
    '@angular/compiler-cli': '^19.0.0',
    typescript: '^5.7.0',
  },
};

const solidPackagePlan: AdapterPackagePlan = {
  scripts: {
    dev: 'vite',
    build: 'tsc -b && vite build',
    preview: 'vite preview',
  },
  dependencies: {
    '@decantr/css': '^1.0.4',
    '@solidjs/router': '^0.15.0',
    lucide: '^0.468.0',
    'solid-js': '^1.9.0',
  },
  devDependencies: {
    typescript: '^5.7.0',
    vite: '^6.0.0',
    'vite-plugin-solid': '^2.11.0',
  },
};

function writeReactViteProject(
  projectDir: string,
  title: string,
  routingMode: BootstrapRoutingMode,
): void {
  const srcDir = join(projectDir, 'src');
  const routerImport = routingMode === 'hash' ? 'HashRouter' : 'BrowserRouter';

  writeJson(
    join(projectDir, 'package.json'),
    packagePlanPackageJson(projectDir, 'decantr-app', reactVitePackagePlan),
  );
  writeFileSync(
    join(projectDir, 'vite.config.ts'),
    `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
`,
  );
  writeViteTsConfig(projectDir, { jsx: 'react-jsx' });
  writeJson(
    join(projectDir, 'tsconfig.app.json'),
    JSON.parse(readFileSync(join(projectDir, 'tsconfig.json'), 'utf-8')),
  );
  writeIndexHtml(projectDir, title, '/src/main.tsx');
  mkdirp(srcDir);
  writeFileSync(
    join(srcDir, 'main.tsx'),
    `import { StrictMode } from 'react';
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
`,
  );
  writeFileSync(
    join(srcDir, 'App.tsx'),
    `import { css } from '@decantr/css';
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
            <p className={css('_textsm _fgmuted _mw[32rem]')}>Scaffolded with Decantr. Read .decantr/context/scaffold-pack.md first, then use DECANTR.md as a lookup reference.</p>
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
`,
  );
  writeFileSync(join(srcDir, 'vite-env.d.ts'), '/// <reference types="vite/client" />\n');
  ensureStyleDir(projectDir);
}

function writeNextProject(projectDir: string, title: string): void {
  const appDir = join(projectDir, 'app');
  const stylesDir = join(projectDir, 'src', 'styles');
  writeJson(
    join(projectDir, 'package.json'),
    packagePlanPackageJson(projectDir, 'decantr-next-app', nextPackagePlan),
  );
  writeFileSync(
    join(projectDir, 'next.config.ts'),
    'import type { NextConfig } from "next";\n\nconst nextConfig: NextConfig = {};\n\nexport default nextConfig;\n',
  );
  writeFileSync(
    join(projectDir, 'next-env.d.ts'),
    '/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n\n// This file is generated by Next.js.\n',
  );
  writeJson(join(projectDir, 'tsconfig.json'), {
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
  });
  mkdirp(appDir);
  mkdirp(stylesDir);
  writeFileSync(
    join(appDir, 'layout.tsx'),
    `import type { Metadata } from 'next';
import '../src/styles/global.css';
import '../src/styles/tokens.css';
import '../src/styles/treatments.css';

export const metadata: Metadata = {
  title: '${title}',
  description: 'Scaffolded with Decantr',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`,
  );
  writeFileSync(
    join(appDir, 'page.tsx'),
    `import { css } from '@decantr/css';

export default function HomePage() {
  return (
    <main id="main-content" className={css('_minh[100vh] _flex _col _aic _jcc _p6 _gap4')}>
      <section className={css('_wfull _mw[42rem]') + ' d-section'} data-density="comfortable">
        <div className={css('_flex _col _aic _gap4 _textc') + ' d-surface'} data-elevation="raised">
          <p className="d-label" data-anchor>Decantr starter</p>
          <h1 className={css('_heading2')}>${title}</h1>
          <p className={css('_textsm _fgmuted _mw[32rem]')}>Scaffolded with Decantr. Read .decantr/context/scaffold-pack.md first, then use DECANTR.md as a lookup reference.</p>
          <span className="d-annotation" data-status="info">Runtime: Next.js App Router</span>
        </div>
      </section>
    </main>
  );
}
`,
  );
}

function writeVanillaProject(
  projectDir: string,
  title: string,
  routingMode: BootstrapRoutingMode,
): void {
  const srcDir = join(projectDir, 'src');
  writeJson(
    join(projectDir, 'package.json'),
    packagePlanPackageJson(projectDir, 'decantr-vanilla-app', vanillaPackagePlan),
  );
  writeIndexHtml(projectDir, title, '/src/main.js');
  mkdirp(srcDir);
  writeFileSync(
    join(srcDir, 'main.js'),
    `import { css } from '@decantr/css';
import './styles/global.css';
import './styles/tokens.css';
import './styles/treatments.css';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element.');

root.innerHTML = \`
  <a href="#main-content" class="skip-link">Skip to content</a>
  <main id="main-content" class="\${css('_minh[100vh] _flex _col _aic _jcc _p6 _gap4')}">
    <section class="\${css('_wfull _mw[42rem]')} d-section" data-density="comfortable">
      <div class="\${css('_flex _col _aic _gap4 _textc')} d-surface" data-elevation="raised">
        <p class="d-label" data-anchor>Decantr starter</p>
        <h1 class="\${css('_heading2')}">${title}</h1>
        <p class="\${css('_textsm _fgmuted _mw[32rem]')}">Scaffolded with Decantr. Read .decantr/context/scaffold-pack.md first, then use DECANTR.md as a lookup reference.</p>
        <div class="\${css('_flex _gap3 _wrap _jcc')}">
          <span class="d-annotation" data-status="info">Runtime: vanilla Vite</span>
          <span class="d-annotation" data-status="success">Routing: ${routingMode}</span>
        </div>
      </div>
    </section>
  </main>
\`;
`,
  );
  ensureStyleDir(projectDir);
}

function writeVueProject(
  projectDir: string,
  title: string,
  routingMode: BootstrapRoutingMode,
): void {
  const srcDir = join(projectDir, 'src');
  const historyFactory = routingMode === 'hash' ? 'createWebHashHistory' : 'createWebHistory';
  writeJson(
    join(projectDir, 'package.json'),
    packagePlanPackageJson(projectDir, 'decantr-vue-app', vuePackagePlan),
  );
  writeFileSync(
    join(projectDir, 'vite.config.ts'),
    `import { defineConfig } from 'vite';\nimport vue from '@vitejs/plugin-vue';\n\nexport default defineConfig({ plugins: [vue()] });\n`,
  );
  writeViteTsConfig(projectDir);
  writeFileSync(
    join(projectDir, 'env.d.ts'),
    '/// <reference types="vite/client" />\n\ndeclare module "*.vue";\n',
  );
  writeIndexHtml(projectDir, title, '/src/main.ts');
  mkdirp(srcDir);
  writeFileSync(
    join(srcDir, 'main.ts'),
    `import { createApp } from 'vue';
import { createRouter, ${historyFactory} } from 'vue-router';
import App from './App.vue';
import './styles/global.css';
import './styles/tokens.css';
import './styles/treatments.css';

const router = createRouter({
  history: ${historyFactory}(),
  routes: [{ path: '/', component: App }],
});

createApp(App).use(router).mount('#root');
`,
  );
  writeFileSync(
    join(srcDir, 'App.vue'),
    `<script setup lang="ts">
import { css } from '@decantr/css';
</script>

<template>
  <a href="#main-content" class="skip-link">Skip to content</a>
  <main id="main-content" :class="css('_minh[100vh] _flex _col _aic _jcc _p6 _gap4')">
    <section :class="css('_wfull _mw[42rem]') + ' d-section'" data-density="comfortable">
      <div :class="css('_flex _col _aic _gap4 _textc') + ' d-surface'" data-elevation="raised">
        <p class="d-label" data-anchor>Decantr starter</p>
        <h1 :class="css('_heading2')">${title}</h1>
        <p :class="css('_textsm _fgmuted _mw[32rem]')">Scaffolded with Decantr. Read .decantr/context/scaffold-pack.md first, then use DECANTR.md as a lookup reference.</p>
        <div :class="css('_flex _gap3 _wrap _jcc')">
          <span class="d-annotation" data-status="info">Runtime: Vue + Vite</span>
          <span class="d-annotation" data-status="success">Routing: ${routingMode}</span>
        </div>
      </div>
    </section>
  </main>
</template>
`,
  );
  ensureStyleDir(projectDir);
}

function writeSvelteProject(projectDir: string, title: string): void {
  const routesDir = join(projectDir, 'src', 'routes');
  writeJson(
    join(projectDir, 'package.json'),
    packagePlanPackageJson(projectDir, 'decantr-svelte-app', sveltePackagePlan),
  );
  writeFileSync(
    join(projectDir, 'svelte.config.js'),
    `import adapter from '@sveltejs/adapter-auto';\nimport { vitePreprocess } from '@sveltejs/vite-plugin-svelte';\n\nexport default { preprocess: vitePreprocess(), kit: { adapter: adapter() } };\n`,
  );
  writeFileSync(
    join(projectDir, 'vite.config.ts'),
    `import { sveltekit } from '@sveltejs/kit/vite';\nimport { defineConfig } from 'vite';\n\nexport default defineConfig({ plugins: [sveltekit()] });\n`,
  );
  writeViteTsConfig(projectDir);
  mkdirp(routesDir);
  writeFileSync(
    join(projectDir, 'src', 'app.html'),
    '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1" />\n    %sveltekit.head%\n  </head>\n  <body data-sveltekit-preload-data="hover">\n    <div style="display: contents">%sveltekit.body%</div>\n  </body>\n</html>\n',
  );
  writeFileSync(
    join(routesDir, '+layout.svelte'),
    `<script lang="ts">\nimport '../styles/global.css';\nimport '../styles/tokens.css';\nimport '../styles/treatments.css';\nlet { children } = $props();\n</script>\n\n{@render children()}\n`,
  );
  writeFileSync(
    join(routesDir, '+page.svelte'),
    `<script lang="ts">
import { css } from '@decantr/css';
</script>

<svelte:head>
  <title>${title}</title>
</svelte:head>

<a href="#main-content" class="skip-link">Skip to content</a>
<main id="main-content" class={css('_minh[100vh] _flex _col _aic _jcc _p6 _gap4')}>
  <section class={css('_wfull _mw[42rem]') + ' d-section'} data-density="comfortable">
    <div class={css('_flex _col _aic _gap4 _textc') + ' d-surface'} data-elevation="raised">
      <p class="d-label" data-anchor>Decantr starter</p>
      <h1 class={css('_heading2')}>${title}</h1>
      <p class={css('_textsm _fgmuted _mw[32rem]')}>Scaffolded with Decantr. Read .decantr/context/scaffold-pack.md first, then use DECANTR.md as a lookup reference.</p>
      <span class="d-annotation" data-status="info">Runtime: SvelteKit</span>
    </div>
  </section>
</main>
`,
  );
  ensureStyleDir(projectDir);
}

function writeAngularProject(projectDir: string, title: string): void {
  const appDir = join(projectDir, 'src', 'app');
  writeJson(
    join(projectDir, 'package.json'),
    packagePlanPackageJson(projectDir, 'decantr-angular-app', angularPackagePlan),
  );
  writeJson(join(projectDir, 'angular.json'), {
    version: 1,
    projects: {
      app: {
        projectType: 'application',
        root: '',
        sourceRoot: 'src',
        architect: {
          build: {
            builder: '@angular-devkit/build-angular:application',
            options: {
              outputPath: 'dist',
              index: 'src/index.html',
              browser: 'src/main.ts',
              tsConfig: 'tsconfig.app.json',
              styles: ['src/styles.css', 'src/styles/tokens.css', 'src/styles/treatments.css'],
            },
          },
          serve: {
            builder: '@angular-devkit/build-angular:dev-server',
            options: { buildTarget: 'app:build' },
          },
        },
      },
    },
  });
  writeJson(join(projectDir, 'tsconfig.json'), {
    compilerOptions: {
      target: 'ES2022',
      module: 'ES2022',
      moduleResolution: 'bundler',
      strict: true,
      skipLibCheck: true,
      experimentalDecorators: true,
      useDefineForClassFields: false,
      lib: ['ES2022', 'DOM'],
    },
  });
  writeJson(join(projectDir, 'tsconfig.app.json'), {
    extends: './tsconfig.json',
    files: ['src/main.ts'],
    include: ['src/**/*.d.ts'],
  });
  mkdirp(appDir);
  writeFileSync(
    join(projectDir, 'src', 'index.html'),
    `<!doctype html>\n<html lang="en">\n<head><meta charset="utf-8"><title>${title}</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>\n<body><app-root></app-root></body>\n</html>\n`,
  );
  writeFileSync(
    join(projectDir, 'src', 'main.ts'),
    `import { bootstrapApplication } from '@angular/platform-browser';\nimport { provideRouter } from '@angular/router';\nimport { AppComponent } from './app/app.component';\nimport { routes } from './app/app.routes';\n\nbootstrapApplication(AppComponent, { providers: [provideRouter(routes)] }).catch((err) => console.error(err));\n`,
  );
  writeFileSync(join(projectDir, 'src', 'styles.css'), '@import "./styles/global.css";\n');
  writeFileSync(
    join(appDir, 'app.routes.ts'),
    `import type { Routes } from '@angular/router';\nimport { AppComponent } from './app.component';\n\nexport const routes: Routes = [{ path: '', component: AppComponent }];\n`,
  );
  writeFileSync(
    join(appDir, 'app.component.ts'),
    `import { Component } from '@angular/core';\n\n@Component({\n  selector: 'app-root',\n  standalone: true,\n  template: \`\n    <a href="#main-content" class="skip-link">Skip to content</a>\n    <main id="main-content" class="_minh[100vh] _flex _col _aic _jcc _p6 _gap4">\n      <section class="_wfull _mw[42rem] d-section" data-density="comfortable">\n        <div class="_flex _col _aic _gap4 _textc d-surface" data-elevation="raised">\n          <p class="d-label" data-anchor>Decantr starter</p>\n          <h1 class="_heading2">${title}</h1>\n          <p class="_textsm _fgmuted _mw[32rem]">Scaffolded with Decantr. Read .decantr/context/scaffold-pack.md first, then use DECANTR.md as a lookup reference.</p>\n          <span class="d-annotation" data-status="info">Runtime: Angular</span>\n        </div>\n      </section>\n    </main>\n  \`,\n})\nexport class AppComponent {}\n`,
  );
  ensureStyleDir(projectDir);
}

function writeSolidProject(
  projectDir: string,
  title: string,
  routingMode: BootstrapRoutingMode,
): void {
  const srcDir = join(projectDir, 'src');
  const routerImport = routingMode === 'hash' ? 'HashRouter' : 'Router';
  writeJson(
    join(projectDir, 'package.json'),
    packagePlanPackageJson(projectDir, 'decantr-solid-app', solidPackagePlan),
  );
  writeFileSync(
    join(projectDir, 'vite.config.ts'),
    `import { defineConfig } from 'vite';\nimport solid from 'vite-plugin-solid';\n\nexport default defineConfig({ plugins: [solid()] });\n`,
  );
  writeViteTsConfig(projectDir, { jsx: 'preserve' });
  writeJson(
    join(projectDir, 'tsconfig.app.json'),
    JSON.parse(readFileSync(join(projectDir, 'tsconfig.json'), 'utf-8')),
  );
  writeIndexHtml(projectDir, title, '/src/main.tsx');
  mkdirp(srcDir);
  writeFileSync(
    join(srcDir, 'main.tsx'),
    `import { render } from 'solid-js/web';
import { ${routerImport} } from '@solidjs/router';
import { App } from './App';
import './styles/global.css';
import './styles/tokens.css';
import './styles/treatments.css';

render(() => (
  <${routerImport}>
    <App />
  </${routerImport}>
), document.getElementById('root')!);
`,
  );
  writeFileSync(
    join(srcDir, 'App.tsx'),
    `import { css } from '@decantr/css';

export function App() {
  return (
    <>
      <a href="#main-content" class="skip-link">Skip to content</a>
      <main id="main-content" class={css('_minh[100vh] _flex _col _aic _jcc _p6 _gap4')}>
        <section class={css('_wfull _mw[42rem]') + ' d-section'} data-density="comfortable">
          <div class={css('_flex _col _aic _gap4 _textc') + ' d-surface'} data-elevation="raised">
            <p class="d-label" data-anchor>Decantr starter</p>
            <h1 class={css('_heading2')}>${title}</h1>
            <p class={css('_textsm _fgmuted _mw[32rem]')}>Scaffolded with Decantr. Read .decantr/context/scaffold-pack.md first, then use DECANTR.md as a lookup reference.</p>
            <div class={css('_flex _gap3 _wrap _jcc')}>
              <span class="d-annotation" data-status="info">Runtime: Solid + Vite</span>
              <span class="d-annotation" data-status="success">Routing: ${routingMode}</span>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
`,
  );
  ensureStyleDir(projectDir);
}

const certifiedCapabilities: AdapterCapabilities = {
  bootstrap: true,
  realize: true,
  attach: true,
  styling: true,
  verify: true,
};

const DECANTR_ADAPTERS: Record<string, DecantrAdapter> = {
  'react-vite': {
    id: 'react-vite',
    label: 'React + Vite starter',
    target: 'react',
    aliases: ['react'],
    status: 'certified',
    packAdapter: 'react-vite',
    routing: 'history',
    capabilities: certifiedCapabilities,
    attach: {
      routeRoots: ['src/App.tsx', 'src/routes', 'src/pages'],
      layoutFiles: ['src/App.tsx', 'src/main.tsx'],
      componentRoots: ['src/components', 'src/pages', 'src/routes'],
    },
    verify: { devCommand: 'npm run dev', buildCommand: 'npm run build', distDir: 'dist' },
    packagePlan: reactVitePackagePlan,
    docs: {
      summary: 'React + Vite runnable starter.',
      notes: ['Uses React Router and @decantr/css.'],
    },
    writeProjectFiles: writeReactViteProject,
  },
  'next-app': {
    id: 'next-app',
    label: 'Next.js App Router starter',
    target: 'nextjs',
    aliases: ['next', 'nextjs'],
    status: 'certified',
    packAdapter: 'nextjs',
    routing: 'pathname',
    capabilities: certifiedCapabilities,
    attach: {
      routeRoots: ['app', 'pages'],
      layoutFiles: ['app/layout.tsx', 'pages/_app.tsx'],
      componentRoots: ['components', 'src/components', 'app'],
    },
    verify: { devCommand: 'npm run dev', buildCommand: 'npm run build', distDir: '.next' },
    packagePlan: nextPackagePlan,
    docs: {
      summary: 'Next.js App Router runnable starter.',
      notes: ['Uses App Router for greenfield bootstraps.'],
    },
    writeProjectFiles: writeNextProject,
  },
  'vanilla-vite': {
    id: 'vanilla-vite',
    label: 'Vanilla HTML/CSS/JS + Vite starter',
    target: 'html',
    aliases: ['html', 'vanilla', 'javascript', 'js'],
    status: 'certified',
    packAdapter: 'vanilla-vite',
    routing: 'history',
    capabilities: certifiedCapabilities,
    attach: {
      routeRoots: ['index.html', 'src/main.js', 'src/routes'],
      layoutFiles: ['index.html', 'src/main.js'],
      componentRoots: ['src/components', 'src'],
    },
    verify: { devCommand: 'npm run dev', buildCommand: 'npm run build', distDir: 'dist' },
    packagePlan: vanillaPackagePlan,
    docs: {
      summary: 'Plain web runnable starter.',
      notes: ['Uses DOM APIs and @decantr/css without a UI framework.'],
    },
    writeProjectFiles: writeVanillaProject,
  },
  'vue-vite': {
    id: 'vue-vite',
    label: 'Vue + Vite starter',
    target: 'vue',
    aliases: ['vue', 'vue3'],
    status: 'certified',
    packAdapter: 'vue-vite',
    routing: 'history',
    capabilities: certifiedCapabilities,
    attach: {
      routeRoots: ['src/main.ts', 'src/router.ts', 'src/views'],
      layoutFiles: ['src/App.vue', 'src/main.ts'],
      componentRoots: ['src/components', 'src/views'],
    },
    verify: { devCommand: 'npm run dev', buildCommand: 'npm run build', distDir: 'dist' },
    packagePlan: vuePackagePlan,
    docs: {
      summary: 'Vue 3 + Vite runnable starter.',
      notes: ['Uses Vue Router and @decantr/css.'],
    },
    writeProjectFiles: writeVueProject,
  },
  sveltekit: {
    id: 'sveltekit',
    label: 'SvelteKit starter',
    target: 'svelte',
    aliases: ['svelte', 'sveltekit'],
    status: 'certified',
    packAdapter: 'sveltekit',
    routing: 'framework-native',
    capabilities: certifiedCapabilities,
    attach: {
      routeRoots: ['src/routes'],
      layoutFiles: ['src/routes/+layout.svelte', 'src/app.html'],
      componentRoots: ['src/lib', 'src/routes'],
    },
    verify: { devCommand: 'npm run dev', buildCommand: 'npm run build', distDir: '.svelte-kit' },
    packagePlan: sveltePackagePlan,
    docs: {
      summary: 'SvelteKit runnable starter.',
      notes: ['Uses SvelteKit file routing and @decantr/css.'],
    },
    writeProjectFiles: writeSvelteProject,
  },
  angular: {
    id: 'angular',
    label: 'Angular standalone starter',
    target: 'angular',
    aliases: ['angular', 'ng'],
    status: 'certified',
    packAdapter: 'angular',
    routing: 'framework-native',
    capabilities: certifiedCapabilities,
    attach: {
      routeRoots: ['src/app/app.routes.ts'],
      layoutFiles: ['src/app/app.component.ts', 'src/main.ts'],
      componentRoots: ['src/app'],
    },
    verify: { devCommand: 'npm run dev', buildCommand: 'npm run build', distDir: 'dist' },
    packagePlan: angularPackagePlan,
    docs: {
      summary: 'Angular standalone runnable starter.',
      notes: ['Uses Angular Router and global Decantr CSS files.'],
    },
    writeProjectFiles: writeAngularProject,
  },
  'solid-vite': {
    id: 'solid-vite',
    label: 'Solid + Vite starter',
    target: 'solid',
    aliases: ['solid', 'solidjs'],
    status: 'certified',
    packAdapter: 'solid-vite',
    routing: 'history',
    capabilities: certifiedCapabilities,
    attach: {
      routeRoots: ['src/App.tsx', 'src/routes', 'src/pages'],
      layoutFiles: ['src/App.tsx', 'src/main.tsx'],
      componentRoots: ['src/components', 'src/pages', 'src/routes'],
    },
    verify: { devCommand: 'npm run dev', buildCommand: 'npm run build', distDir: 'dist' },
    packagePlan: solidPackagePlan,
    docs: {
      summary: 'Solid + Vite runnable starter.',
      notes: ['Uses @solidjs/router and @decantr/css.'],
    },
    writeProjectFiles: writeSolidProject,
  },
  'generic-web': {
    id: 'generic-web',
    label: 'Generic web contract adapter',
    target: 'generic',
    aliases: [],
    status: 'contract-only',
    packAdapter: 'generic-web',
    routing: 'history',
    capabilities: { bootstrap: false, realize: false, attach: true, styling: true, verify: true },
    attach: {
      routeRoots: ['src', 'app', 'pages'],
      layoutFiles: ['index.html', 'src/main.ts', 'src/main.tsx'],
      componentRoots: ['src/components', 'components'],
    },
    verify: { devCommand: 'npm run dev', buildCommand: 'npm run build', distDir: 'dist' },
    docs: {
      summary: 'Contract-only fallback for unsupported web targets.',
      notes: ['Does not write framework runtime files.'],
    },
  },
};

const TARGET_ALIASES = new Map<string, string>();
for (const adapter of Object.values(DECANTR_ADAPTERS)) {
  TARGET_ALIASES.set(adapter.target, adapter.id);
  TARGET_ALIASES.set(adapter.id, adapter.id);
  for (const alias of adapter.aliases) TARGET_ALIASES.set(alias, adapter.id);
}

function normalizeTarget(target: string | undefined): string {
  return (target || 'react').toLowerCase();
}

function platformTypeForTarget(target: string): 'spa' | 'ssr' {
  return target === 'nextjs' || target === 'next' || target === 'sveltekit' ? 'ssr' : 'spa';
}

function adapterIdForTarget(target: string, packAdapter: string): string {
  return (
    TARGET_ALIASES.get(target) ?? (DECANTR_ADAPTERS[packAdapter] ? packAdapter : 'generic-web')
  );
}

export function listDecantrAdapters(): DecantrAdapter[] {
  return Object.values(DECANTR_ADAPTERS);
}

export function resolveBootstrapTarget(target: string | undefined): BootstrapTargetResolution {
  const normalizedTarget = normalizeTarget(target);
  const adapterIdFromAlias = TARGET_ALIASES.get(normalizedTarget);
  const adapterTarget = adapterIdFromAlias
    ? DECANTR_ADAPTERS[adapterIdFromAlias].target
    : normalizedTarget;
  const platformType = platformTypeForTarget(adapterTarget);
  const packAdapter = resolvePackAdapter(adapterTarget, platformType);
  const adapterId = adapterIdForTarget(adapterTarget, packAdapter);
  const adapter = DECANTR_ADAPTERS[adapterId];

  return {
    target: adapterTarget,
    platformType,
    packAdapter,
    adapterId,
    bootstrapAdapterId:
      adapter?.capabilities.bootstrap && adapter?.writeProjectFiles ? adapterId : null,
  };
}

export function getBootstrapAdapter(
  resolution: BootstrapTargetResolution,
): BootstrapAdapter | null {
  if (!resolution.bootstrapAdapterId) return null;
  const adapter = DECANTR_ADAPTERS[resolution.bootstrapAdapterId];
  return adapter?.writeProjectFiles ? (adapter as BootstrapAdapter) : null;
}

export function getDecantrAdapter(adapterId: string): DecantrAdapter {
  return DECANTR_ADAPTERS[adapterId] ?? DECANTR_ADAPTERS['generic-web'];
}

export function detectRoutingMode(projectDir: string): BootstrapRoutingMode {
  try {
    const essence = JSON.parse(readFileSync(join(projectDir, 'decantr.essence.json'), 'utf-8')) as {
      meta?: { platform?: { routing?: string } };
    };
    const routing = essence.meta?.platform?.routing;
    if (routing === 'history' || routing === 'pathname') return routing;
    return 'hash';
  } catch {
    return 'hash';
  }
}
