#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const repoRoot = resolve(dirname(scriptPath), '..');
const cliPath = join(repoRoot, 'packages', 'cli', 'dist', 'bin.js');
const keep = process.argv.includes('--keep');
const trialRoot = mkdtempSync(join(tmpdir(), 'decantr-3-11-change-assurance-'));
const results = [];

function write(root, path, contents) {
  const absolutePath = join(root, path);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, contents, 'utf8');
}

function run(command, args, cwd, acceptedStatuses = [0]) {
  const startedAt = performance.now();
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    timeout: 30_000,
    env: { ...process.env, NO_COLOR: '1' },
  });
  const elapsedMs = Math.round(performance.now() - startedAt);
  if (result.error) throw result.error;
  if (!acceptedStatuses.includes(result.status)) {
    throw new Error(
      `${command} ${args.join(' ')} exited ${result.status}\n${result.stdout}\n${result.stderr}`,
    );
  }
  return { ...result, elapsedMs };
}

function git(root, ...args) {
  return run('git', args, root);
}

function initGit(root) {
  git(root, 'init', '--quiet');
  git(root, 'config', 'user.name', 'Decantr Trial');
  git(root, 'config', 'user.email', 'trial@decantr.invalid');
}

function commitAll(root) {
  git(root, 'add', '--all');
  git(root, 'commit', '--quiet', '-m', 'trial baseline');
}

function verify(root, args = []) {
  const result = run(process.execPath, [cliPath, 'verify', ...args, '--json'], root, [0, 1]);
  let report;
  try {
    report = JSON.parse(result.stdout);
  } catch {
    throw new Error(`Decantr did not return JSON.\n${result.stdout}\n${result.stderr}`);
  }
  return { report, result };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function record(id, result, checks) {
  results.push({
    id,
    status: 'pass',
    reportStatus: result.report?.status ?? null,
    exitCode: result.result.status,
    elapsedMs: result.result.elapsedMs,
    checks,
  });
}

function reactPackage(name, extraDependencies = {}) {
  return JSON.stringify({
    name,
    private: true,
    dependencies: { react: '^19.0.0', ...extraDependencies },
  });
}

function trialUnbornReact() {
  const root = join(trialRoot, 'unborn-react');
  mkdirSync(root, { recursive: true });
  initGit(root);
  write(root, 'package.json', reactPackage('unborn-react'));
  write(
    root,
    'src/components/ui/Button.tsx',
    'export function Button() { return <button type="button" />; }\n',
  );
  write(
    root,
    'src/pages/Home.tsx',
    'export function Home() { return <button type="button">Save</button>; }\n',
  );
  const result = verify(root);
  assert(result.report.changeBase.completeness === 'complete', 'unborn scope must be complete');
  assert(result.report.changeBase.headRef === null, 'unborn scope must not invent HEAD');
  assert(result.report.findings[0]?.occurrence?.code === 'COMP010', 'expected COMP010');
  record('unborn-react', result, ['unborn Git covered', 'raw control repair located']);
}

function trialWorkspaceAuthority() {
  const root = join(trialRoot, 'react-workspace');
  mkdirSync(root, { recursive: true });
  initGit(root);
  write(
    root,
    'package.json',
    JSON.stringify({ name: 'react-workspace', private: true, workspaces: ['apps/*', 'packages/*'] }),
  );
  write(
    root,
    'apps/web/package.json',
    reactPackage('@trial/web', { '@trial/ui': 'workspace:*' }),
  );
  write(
    root,
    'apps/web/src/pages/Home.tsx',
    'import { Button } from "@trial/ui"; export function Home() { return <Button />; }\n',
  );
  write(root, 'packages/ui/package.json', JSON.stringify({ name: '@trial/ui', version: '1.0.0' }));
  write(
    root,
    'packages/ui/src/components/Button.tsx',
    'export function Button() { return <button type="button" />; }\n',
  );
  commitAll(root);
  write(
    root,
    'apps/web/src/pages/Home.tsx',
    'export function Home() { return <button type="button">Save</button>; }\n',
  );
  const result = verify(root);
  assert(result.report.project.selectedAppRoot === 'apps/web', 'changed app must auto-select');
  assert(result.report.project.selection.strategy === 'changed-files', 'selection must use changed files');
  assert(
    result.report.findings[0]?.occurrence?.repairTarget ===
      'packages/ui/src/components/Button.tsx',
    'workspace primitive must be the exact repair target',
  );
  record('react-workspace-authority', result, [
    'single changed app auto-selected',
    'workspace design-system authority resolved',
  ]);
}

function trialNextAppRouter() {
  const root = join(trialRoot, 'next-app-router');
  mkdirSync(root, { recursive: true });
  initGit(root);
  write(root, 'package.json', reactPackage('next-app-router', { next: '^16.0.0' }));
  write(
    root,
    'components/ui/Button.tsx',
    'export function Button() { return <button type="button" />; }\n',
  );
  write(root, 'app/page.tsx', 'export default function Page() { return <main>Home</main>; }\n');
  commitAll(root);
  write(
    root,
    'app/page.tsx',
    'export default function Page() { return <main><button type="button">Save</button></main>; }\n',
  );
  const result = verify(root);
  assert(result.report.project.framework === 'nextjs', 'Next framework must be selected');
  assert(result.report.surfaces.impactedSurfaces.length > 0, 'Next page must map to a UI surface');
  assert(result.report.surfaces.routeAuthorityFanOut === false, 'one Next page must not fan out');
  assert(result.report.findings.some((entry) => entry.occurrence.code === 'COMP010'), 'expected COMP010');
  record('next-app-router', result, ['route surface mapped', 'primitive drift located']);
}

function trialTanStackRouter() {
  const root = join(trialRoot, 'tanstack-router');
  mkdirSync(root, { recursive: true });
  initGit(root);
  write(
    root,
    'package.json',
    reactPackage('tanstack-router', { '@tanstack/react-router': '^1.0.0' }),
  );
  write(
    root,
    'src/components/ui/Button.tsx',
    'export function Button() { return <button type="button" />; }\n',
  );
  write(
    root,
    'src/routes/__root.tsx',
    "import { createRootRoute } from '@tanstack/react-router'; export const Route = createRootRoute({ component: () => <main /> });\n",
  );
  write(
    root,
    'src/routes/index.tsx',
    "import { createFileRoute } from '@tanstack/react-router'; export const Route = createFileRoute('/')({ component: Home }); function Home() { return <main>Home</main>; }\n",
  );
  commitAll(root);
  write(
    root,
    'src/routes/index.tsx',
    "import { createFileRoute } from '@tanstack/react-router'; export const Route = createFileRoute('/')({ component: Home }); function Home() { return <button type=\"button\">Save</button>; }\n",
  );
  const result = verify(root);
  assert(result.report.project.framework === 'react', 'TanStack app must remain React authority');
  assert(result.report.surfaces.uiFiles.includes('src/routes/index.tsx'), 'route file must be in UI scope');
  assert(result.report.status === 'attention', 'proven TanStack route must not remain unresolved');
  assert(result.report.findings.some((entry) => entry.occurrence.code === 'COMP010'), 'expected COMP010');
  record('tanstack-router', result, ['file route included', 'changed-file finding located']);
}

function angularRoutes(includeAudit = false) {
  return `import { Routes } from '@angular/router';\nexport const routes: Routes = [\n  { path: '', loadComponent: () => import('./home.component').then(m => m.HomeComponent) },\n  { path: 'admin', loadComponent: () => import('./admin.component').then(m => m.AdminComponent) },\n${includeAudit ? "  { path: 'audit', loadComponent: () => import('./audit.component').then(m => m.AuditComponent) },\n" : ''}];\n`;
}

function trialAngularAuthority() {
  const root = join(trialRoot, 'angular-workspace');
  mkdirSync(root, { recursive: true });
  initGit(root);
  write(
    root,
    'package.json',
    JSON.stringify({ name: 'angular-workspace', private: true, workspaces: ['apps/*'] }),
  );
  write(
    root,
    'angular.json',
    JSON.stringify({
      version: 1,
      projects: {
        admin: {
          projectType: 'application',
          root: 'apps/admin',
          sourceRoot: 'apps/admin/src',
          architect: { build: { options: { browser: 'apps/admin/src/main.ts' } } },
        },
      },
    }),
  );
  write(
    root,
    'apps/admin/package.json',
    JSON.stringify({
      name: 'admin',
      private: true,
      dependencies: {
        '@angular/core': '^21.0.0',
        '@angular/platform-browser': '^21.0.0',
        '@angular/router': '^21.0.0',
      },
    }),
  );
  write(
    root,
    'apps/admin/src/main.ts',
    "import { bootstrapApplication } from '@angular/platform-browser';\nimport { provideRouter } from '@angular/router';\nimport { AppComponent } from './app/app.component';\nimport { routes } from './app/routes';\nbootstrapApplication(AppComponent, { providers: [provideRouter(routes)] });\n",
  );
  write(
    root,
    'apps/admin/src/app/app.component.ts',
    "import { Component } from '@angular/core'; @Component({ standalone: true, template: '<router-outlet />' }) export class AppComponent {}\n",
  );
  write(root, 'apps/admin/src/app/routes.ts', angularRoutes(false));
  write(
    root,
    'apps/admin/src/app/home.component.ts',
    "import { Component } from '@angular/core'; @Component({ standalone: true, template: '<main>Home</main>' }) export class HomeComponent {}\n",
  );
  write(
    root,
    'apps/admin/src/app/admin.component.ts',
    "import { Component } from '@angular/core'; @Component({ standalone: true, template: '<main>Admin</main>' }) export class AdminComponent {}\n",
  );
  write(
    root,
    'apps/admin/src/app/audit.component.ts',
    "import { Component } from '@angular/core'; @Component({ standalone: true, template: '<main>Audit</main>' }) export class AuditComponent {}\n",
  );
  write(
    root,
    'apps/admin/src/app/settings-menu.vitest.ts',
    "export const fixture = [{ path: 'tool-configuration' }, { path: 'assign' }];\n",
  );
  commitAll(root);
  write(root, 'apps/admin/src/app/routes.ts', angularRoutes(true));
  const result = verify(root, ['--project', 'apps/admin']);
  assert(result.report.project.framework === 'angular', 'Angular framework must be selected');
  assert(result.report.authority.routeAuthority === 'proven', 'Angular route authority must be proven');
  assert(result.report.authority.routeCompleteness === 'complete', 'Angular routes must be complete');
  assert(result.report.surfaces.routeAuthorityFanOut === true, 'route authority change must fan out');
  assert(
    !JSON.stringify(result.report).includes('tool-configuration'),
    'test fixture route metadata must not become production authority',
  );
  assert(
    result.report.limitations.some((entry) => entry.includes('template parity')),
    'Angular primitive limitation must be explicit',
  );
  record('angular-route-authority', result, [
    'canonical routes.ts proven complete',
    'test route metadata excluded',
    'template limitation declared',
  ]);
}

function trialVueLimitation() {
  const root = join(trialRoot, 'vue-router');
  mkdirSync(root, { recursive: true });
  initGit(root);
  write(
    root,
    'package.json',
    JSON.stringify({
      name: 'vue-router',
      private: true,
      dependencies: { vue: '^3.0.0', 'vue-router': '^4.0.0' },
    }),
  );
  write(
    root,
    'src/router.ts',
    "export const routes = [{ path: '/', component: () => import('./views/Home.vue') }];\n",
  );
  write(root, 'src/views/Home.vue', '<template><main>Home</main></template>\n');
  commitAll(root);
  write(root, 'src/views/Home.vue', '<template><main><button>Save</button></main></template>\n');
  const result = verify(root);
  assert(result.report.project.framework === 'vue', 'Vue framework must be selected');
  assert(result.report.surfaces.uiFiles.includes('src/views/Home.vue'), 'Vue view must be in UI scope');
  assert(
    result.report.limitations.some((entry) => entry.includes('template parity')),
    'Vue primitive limitation must be explicit',
  );
  assert(
    !result.report.findings.some((entry) => entry.occurrence.code.startsWith('COMP')),
    'Vue must not receive unsupported JSX primitive findings',
  );
  record('vue-declared-limitation', result, [
    'Vue surface scoped',
    'unsupported primitive detector not overclaimed',
  ]);
}

function trialFixtureExclusion() {
  const root = join(trialRoot, 'fixture-only');
  mkdirSync(root, { recursive: true });
  initGit(root);
  write(root, 'package.json', reactPackage('fixture-only'));
  write(root, 'src/pages/Home.tsx', 'export function Home() { return <main>Home</main>; }\n');
  commitAll(root);
  write(
    root,
    'src/settings-menu.vitest.ts',
    "export const links = [{ path: '/admin' }, { path: '/assign' }];\n",
  );
  const result = verify(root);
  assert(result.report.status === 'pass', 'fixture-only change must pass production assurance');
  assert(result.report.surfaces.uiFiles.length === 0, 'fixture must not enter UI authority');
  assert(result.report.surfaces.ignoredFiles[0]?.scope === 'test', 'fixture must be classified test');
  record('fixture-exclusion', result, ['test metadata excluded from production authority']);
}

function trialMultiAppFailClosed() {
  const root = join(trialRoot, 'multi-app');
  mkdirSync(root, { recursive: true });
  initGit(root);
  write(
    root,
    'package.json',
    JSON.stringify({ name: 'multi-app', private: true, workspaces: ['apps/*'] }),
  );
  for (const app of ['alpha', 'beta']) {
    write(root, `apps/${app}/package.json`, reactPackage(`@trial/${app}`));
    write(
      root,
      `apps/${app}/src/pages/Home.tsx`,
      `export function Home() { return <main>${app}</main>; }\n`,
    );
  }
  commitAll(root);
  for (const app of ['alpha', 'beta']) {
    write(
      root,
      `apps/${app}/src/pages/Home.tsx`,
      `export function Home() { return <main>${app} changed</main>; }\n`,
    );
  }
  const result = run(process.execPath, [cliPath, 'verify', '--json'], root, [1]);
  assert(
    result.stderr.includes('Changed files span multiple app candidates'),
    'multi-app scope must fail with an actionable selection error',
  );
  results.push({
    id: 'multi-app-fail-closed',
    status: 'pass',
    reportStatus: 'selection_error',
    exitCode: result.status,
    elapsedMs: result.elapsedMs,
    checks: ['ambiguous multi-app change rejected', '--project repair supplied'],
  });
}

function trialOutsideGitFailClosed() {
  const root = join(trialRoot, 'outside-git');
  mkdirSync(root, { recursive: true });
  write(root, 'package.json', reactPackage('outside-git'));
  write(root, 'src/pages/Home.tsx', 'export function Home() { return <main>Home</main>; }\n');
  const result = verify(root);
  assert(result.report.status === 'not_proven', 'missing Git scope must be not_proven');
  assert(result.report.changeBase.completeness === 'incomplete', 'missing Git scope must be incomplete');
  record('outside-git-fail-closed', result, ['unknown change scope reported as not_proven']);
}

try {
  trialUnbornReact();
  trialWorkspaceAuthority();
  trialNextAppRouter();
  trialTanStackRouter();
  trialAngularAuthority();
  trialVueLimitation();
  trialFixtureExclusion();
  trialMultiAppFailClosed();
  trialOutsideGitFailClosed();
  process.stdout.write(
    `${JSON.stringify(
      {
        schemaVersion: 'decantr-3.11-change-assurance-trials.v1',
        status: 'pass',
        trialCount: results.length,
        results,
        retainedTrialRoot: keep ? trialRoot : null,
      },
      null,
      2,
    )}\n`,
  );
} finally {
  if (!keep) rmSync(trialRoot, { recursive: true, force: true });
}
