import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { discoverProject, resolveUISurfaceTaskContext } from '../src/index.js';

describe('resolveUISurfaceTaskContext', () => {
  let projectRoot: string;

  beforeEach(() => {
    projectRoot = mkdtempSync(join(tmpdir(), 'decantr-surface-task-'));
  });

  afterEach(() => {
    rmSync(projectRoot, { recursive: true, force: true });
  });

  it('resolves a convention-backed route implementation first', () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({
        dependencies: { next: '^16.0.0', react: '^19.0.0', tailwindcss: '^4.0.0' },
      }),
    );
    mkdirSync(join(projectRoot, 'app', 'settings'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'app', 'settings', 'page.tsx'),
      'export default () => <main />;\n',
    );
    writeFileSync(join(projectRoot, 'app', 'global.css'), '@import "tailwindcss";\n');

    const context = resolveUISurfaceTaskContext(discoverProject(projectRoot), '/settings');

    expect(context.status).toBe('ready');
    expect(context.surface?.kind).toBe('route');
    expect(context.read[0]).toMatchObject({
      rank: 1,
      file: 'app/settings/page.tsx',
      role: 'implementation',
    });
  });

  it('blocks deployment-conditioned Next routes while keeping public routes ready', () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({ dependencies: { next: '^16.0.0', react: '^19.0.0' } }),
    );
    mkdirSync(join(projectRoot, 'app', 'recipes'), { recursive: true });
    mkdirSync(join(projectRoot, 'app', 'prototype', '[id]'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'app', 'recipes', 'page.tsx'),
      'export default () => <main />;\n',
    );
    writeFileSync(
      join(projectRoot, 'app', 'prototype', '[id]', 'page.tsx'),
      'export default () => <main />;\n',
    );
    writeFileSync(join(projectRoot, 'app', 'globals.css'), ':root { --surface: #fff; }\n');
    writeFileSync(
      join(projectRoot, 'app', 'layout.tsx'),
      'import "./globals.css"; export default ({ children }) => <html><body>{children}</body></html>;\n',
    );
    writeFileSync(
      join(projectRoot, 'middleware.ts'),
      [
        'import { NextResponse } from "next/server";',
        'export function middleware(request: { nextUrl: { pathname: string } }) {',
        '  return request.nextUrl.pathname.startsWith("/prototype/")',
        '    ? new NextResponse("Not Found", { status: 404 })',
        '    : NextResponse.next();',
        '}',
        '',
      ].join('\n'),
    );

    const discovery = discoverProject(projectRoot);
    const publicContext = resolveUISurfaceTaskContext(discovery, '/recipes');
    const internalContext = resolveUISurfaceTaskContext(discovery, '/prototype/:id');

    expect(publicContext.status).toBe('ready');
    expect(internalContext.status).toBe('blocked');
    expect(internalContext.surface).toMatchObject({
      name: '/prototype/:id',
      authority: 'project-reference',
      taskability: 'blocked',
    });
    expect(internalContext.read).toEqual([]);
  });

  it('keeps imported styles in cascade order in the task read set', () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({ dependencies: { next: '^16.0.0', react: '^19.0.0' } }),
    );
    mkdirSync(join(projectRoot, 'app', 'settings'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'app', 'settings', 'page.tsx'),
      'export default () => <main />;\n',
    );
    writeFileSync(
      join(projectRoot, 'app', 'layout.tsx'),
      [
        'import "./foundation.css";',
        'import "./brand.css";',
        'import "./globals.css";',
        'import "./polish.css";',
        'export default ({ children }) => <html><body>{children}</body></html>;',
        '',
      ].join('\n'),
    );
    for (const file of ['foundation.css', 'brand.css', 'globals.css', 'polish.css']) {
      writeFileSync(
        join(projectRoot, 'app', file),
        `.${file.replace('.css', '')} { color: #123456; }\n`,
      );
    }

    const context = resolveUISurfaceTaskContext(discoverProject(projectRoot), '/settings');

    expect(
      context.read.filter((target) => target.role === 'style').map((target) => target.file),
    ).toEqual([
      'app/foundation.css',
      'app/brand.css',
      'app/globals.css',
      'app/polish.css',
      'app/layout.tsx',
    ]);
  });

  it('limits route context when production authority is proven but topology is incomplete', () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({ dependencies: { react: '^19.0.0', 'react-router-dom': '^7.0.0' } }),
    );
    mkdirSync(join(projectRoot, 'src'), { recursive: true });
    writeFileSync(join(projectRoot, 'src', 'main.tsx'), 'import "./App";\n');
    writeFileSync(
      join(projectRoot, 'src', 'App.tsx'),
      'import { Route } from "react-router-dom"; export const App = () => <Route path="/settings" element={<main />} />;\n',
    );
    writeFileSync(join(projectRoot, 'src', 'theme.css'), ':root { --surface: #fff; }\n');

    const context = resolveUISurfaceTaskContext(discoverProject(projectRoot), '/settings');

    expect(context.status).toBe('limited');
    expect(context.reasons.join(' ')).toContain('limited');
  });

  it('blocks route context when production reachability is not proven', () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({ dependencies: { react: '^19.0.0', 'react-router-dom': '^7.0.0' } }),
    );
    mkdirSync(join(projectRoot, 'src'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'src', 'App.tsx'),
      'import { Route } from "react-router-dom"; export const App = () => <Route path="/settings" element={<main />} />;\n',
    );

    const context = resolveUISurfaceTaskContext(discoverProject(projectRoot), '/settings');

    expect(context.status).toBe('blocked');
    expect(context.reasons.join(' ')).toContain('blocked');
  });

  it('fails closed for a resolved Angular route when the production topology is partial', () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({
        dependencies: {
          '@angular/core': '^21.0.0',
          '@angular/router': '^21.0.0',
        },
      }),
    );
    writeFileSync(
      join(projectRoot, 'angular.json'),
      JSON.stringify({
        version: 1,
        projects: {
          app: {
            root: '',
            sourceRoot: 'src',
            architect: {
              build: { options: { browser: 'src/main.ts', styles: ['src/styles.scss'] } },
            },
          },
        },
      }),
    );
    mkdirSync(join(projectRoot, 'src', 'app'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'src', 'main.ts'),
      'import { appConfig } from "./app/app.config"; import { bootstrapApplication } from "@angular/platform-browser"; bootstrapApplication(class App {}, appConfig);\n',
    );
    writeFileSync(
      join(projectRoot, 'src', 'app', 'app.config.ts'),
      'import { provideRouter } from "@angular/router"; import { routes } from "./app.routes"; export const appConfig = { providers: [provideRouter(routes)] };\n',
    );
    writeFileSync(
      join(projectRoot, 'src', 'app', 'app.routes.ts'),
      [
        'import { HomeComponent } from "./home.component";',
        'import type { Routes } from "@angular/router";',
        'export const routes: Routes = [',
        '  { path: "", component: HomeComponent },',
        '  { path: "missing", loadComponent: () => import("./missing.component") },',
        '];',
        '',
      ].join('\n'),
    );
    writeFileSync(
      join(projectRoot, 'src', 'app', 'home.component.ts'),
      'export class HomeComponent {}\n',
    );
    writeFileSync(join(projectRoot, 'src', 'styles.scss'), ':root { --surface: #fff; }\n');

    const discovery = discoverProject(projectRoot);
    const context = resolveUISurfaceTaskContext(discovery, '/');

    expect(discovery.routes.authority).toBe('proven');
    expect(discovery.routes.completeness).toBe('partial');
    expect(context.surface?.taskability).toBe('ready');
    expect(context.status).toBe('blocked');
  });

  it('keeps proven route context limited when styling authority is unresolved', () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({ dependencies: { next: '^16.0.0', react: '^19.0.0' } }),
    );
    mkdirSync(join(projectRoot, 'app'), { recursive: true });
    writeFileSync(join(projectRoot, 'app', 'page.tsx'), 'export default () => <main />;\n');

    const context = resolveUISurfaceTaskContext(discoverProject(projectRoot), '/');

    expect(context.status).toBe('limited');
    expect(context.read[0]).toMatchObject({ file: 'app/page.tsx', role: 'implementation' });
  });

  it('prefers a concrete TanStack index route over the root layout declaration', () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({
        dependencies: { react: '^19.0.0', '@tanstack/react-router': '^1.0.0' },
      }),
    );
    mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'src', 'routes', '__root.tsx'),
      'import { createRootRoute } from "@tanstack/react-router"; export const Route = createRootRoute({ component: () => <main /> });\n',
    );
    writeFileSync(
      join(projectRoot, 'src', 'routes', 'index.tsx'),
      'import { createFileRoute } from "@tanstack/react-router"; export const Route = createFileRoute("/")({ component: () => <main /> });\n',
    );

    const context = resolveUISurfaceTaskContext(discoverProject(projectRoot), '/');

    expect(context.surface?.files).toEqual(['src/routes/index.tsx']);
    expect(context.candidates).toHaveLength(1);
  });

  it('returns limited component context without pretending it is a route', () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({ dependencies: { react: '^19.0.0', tailwindcss: '^4.0.0' } }),
    );
    mkdirSync(join(projectRoot, 'src', 'components'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'src', 'components', 'Button.tsx'),
      'export function Button() { return <button />; }\n',
    );
    writeFileSync(join(projectRoot, 'src', 'theme.css'), '@import "tailwindcss";\n');

    const context = resolveUISurfaceTaskContext(discoverProject(projectRoot), 'Button');

    expect(context.status).toBe('limited');
    expect(context.surface?.kind).toBe('component');
    expect(context.read[0]?.file).toBe('src/components/Button.tsx');
    expect(context.reasons.join(' ')).toContain('does not prove runtime reachability');
  });

  it('resolves a local arrow component that is exported through a named export list', () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({ dependencies: { react: '^19.0.0', tailwindcss: '^4.0.0' } }),
    );
    mkdirSync(join(projectRoot, 'app', 'components', 'ui'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'app', 'components', 'ui', 'input-otp.tsx'),
      [
        'const InputOTP = (props: { inputMode?: string }) => <input {...props} />;',
        'const InputOTPGroup = () => <div />;',
        'const INTERNAL_VALUE = { enabled: true };',
        'export { InputOTP, InputOTPGroup };',
      ].join('\n'),
    );
    writeFileSync(join(projectRoot, 'app', 'theme.css'), '@import "tailwindcss";\n');

    const discovery = discoverProject(projectRoot);
    const context = resolveUISurfaceTaskContext(discovery, 'InputOTP');

    expect(discovery.components.items.map((component) => component.name)).toContain('InputOTP');
    expect(discovery.components.items.map((component) => component.name)).not.toContain(
      'INTERNAL_VALUE',
    );
    expect(context.status).toBe('limited');
    expect(context.surface?.kind).toBe('component');
    expect(context.read[0]?.file).toBe('app/components/ui/input-otp.tsx');
    expect(context.read.map((target) => target.file)).toEqual([
      'app/components/ui/input-otp.tsx',
      'app/theme.css',
    ]);
  });

  it('treats an exact project file as one bounded target even when it declares several components', () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({ dependencies: { react: '^19.0.0' } }),
    );
    mkdirSync(join(projectRoot, 'src'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'src', 'controls.tsx'),
      'export const PrimaryButton = () => <button />; export const SecondaryButton = () => <button />;\n',
    );
    writeFileSync(join(projectRoot, 'src', 'theme.css'), ':root { --accent: #06f; }\n');

    const context = resolveUISurfaceTaskContext(
      discoverProject(projectRoot),
      'file:src/controls.tsx',
    );

    expect(context.status).toBe('limited');
    expect(context.surface).toMatchObject({
      id: 'file:src/controls.tsx',
      kind: 'file',
      files: ['src/controls.tsx'],
    });
    expect(context.candidates).toHaveLength(1);
    expect(context.read[0]).toMatchObject({
      rank: 1,
      file: 'src/controls.tsx',
      role: 'implementation',
    });
  });

  it('fails closed when an exact file selector escapes the selected app', () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({ dependencies: { react: '^19.0.0' } }),
    );
    mkdirSync(join(projectRoot, 'src'), { recursive: true });
    writeFileSync(join(projectRoot, 'src', 'App.tsx'), 'export const App = () => <main />;\n');

    const context = resolveUISurfaceTaskContext(
      discoverProject(projectRoot),
      'file:../outside.tsx',
    );

    expect(context.status).toBe('blocked');
    expect(context.surface).toBeNull();
    expect(context.read).toEqual([]);
  });

  it('fails closed when an exact file selector resolves through a directory symlink or names a directory', () => {
    const outsideRoot = `${projectRoot}-outside`;
    try {
      writeFileSync(
        join(projectRoot, 'package.json'),
        JSON.stringify({ dependencies: { react: '^19.0.0' } }),
      );
      mkdirSync(join(projectRoot, 'src'), { recursive: true });
      mkdirSync(outsideRoot, { recursive: true });
      writeFileSync(join(outsideRoot, 'secret.tsx'), 'export const Secret = true;\n');
      symlinkSync(outsideRoot, join(projectRoot, 'src', 'external'), 'dir');

      const discovery = discoverProject(projectRoot);
      const escaped = resolveUISurfaceTaskContext(discovery, 'file:src/external/secret.tsx');
      const directory = resolveUISurfaceTaskContext(discovery, 'file:src');

      expect(escaped.status).toBe('blocked');
      expect(escaped.surface).toBeNull();
      expect(escaped.read).toEqual([]);
      expect(directory.status).toBe('blocked');
      expect(directory.surface).toBeNull();
      expect(directory.read).toEqual([]);
    } finally {
      rmSync(outsideRoot, { recursive: true, force: true });
    }
  });

  it('adds bounded, relevant adapter evidence as advisory read targets', () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({
        dependencies: {
          react: '^19.0.0',
          tailwindcss: '^4.0.0',
          storybook: '^9.0.0',
          '@figma/code-connect': '^1.0.0',
        },
      }),
    );
    mkdirSync(join(projectRoot, 'src', 'components'), { recursive: true });
    mkdirSync(join(projectRoot, '.storybook'), { recursive: true });
    mkdirSync(join(projectRoot, 'tokens'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'src', 'components', 'Button.tsx'),
      'export function Button() { return <button />; }\n',
    );
    writeFileSync(
      join(projectRoot, 'src', 'components', 'Button.stories.tsx'),
      'export default { title: "Button" };\n',
    );
    writeFileSync(
      join(projectRoot, 'src', 'components', 'Card.stories.tsx'),
      'export default { title: "Card" };\n',
    );
    writeFileSync(
      join(projectRoot, 'src', 'components', 'Button.figma.tsx'),
      'export const ButtonConnect = true;\n',
    );
    writeFileSync(
      join(projectRoot, 'src', 'components', 'Button.test.tsx'),
      'test("Button", () => {});\n',
    );
    writeFileSync(
      join(projectRoot, 'tokens', 'tokens.json'),
      JSON.stringify({ color: { accent: { $value: '#06f' } } }),
    );
    writeFileSync(join(projectRoot, '.storybook', 'main.ts'), 'export default {};\n');
    writeFileSync(join(projectRoot, 'src', 'theme.css'), '@import "tailwindcss";\n');

    const context = resolveUISurfaceTaskContext(discoverProject(projectRoot), 'Button');
    const evidenceReads = context.read.filter((entry) => entry.role === 'evidence');

    expect(evidenceReads.map((entry) => entry.file)).toEqual(
      expect.arrayContaining([
        'src/components/Button.stories.tsx',
        'src/components/Button.figma.tsx',
        'src/components/Button.test.tsx',
        'tokens/tokens.json',
      ]),
    );
    expect(evidenceReads.map((entry) => entry.file)).not.toContain(
      'src/components/Card.stories.tsx',
    );
    expect(evidenceReads.map((entry) => entry.file)).not.toContain('.storybook/main.ts');
    expect(evidenceReads.every((entry) => entry.authority === 'project-reference')).toBe(true);
    expect(evidenceReads.length).toBeLessThanOrEqual(8);
  });

  it('fails closed for unknown targets', () => {
    writeFileSync(join(projectRoot, 'package.json'), JSON.stringify({ dependencies: {} }));

    const context = resolveUISurfaceTaskContext(discoverProject(projectRoot), '/missing');

    expect(['blocked', 'unsupported']).toContain(context.status);
    expect(context.surface).toBeNull();
    expect(context.read).toEqual([]);
  });
});
