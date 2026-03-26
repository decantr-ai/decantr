import { describe, it, expect } from 'vitest';
import { runPipeline } from '../src/pipeline.js';
import { createReactPlugin } from '@decantr/generator-react';
import { createDecantrPlugin } from '@decantr/generator-decantr';
import type { EssenceFile } from '@decantr/essence-spec';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const contentRoot = join(import.meta.dirname, '..', '..', '..', 'content', 'core');

function loadFixture(name: string): EssenceFile {
  const path = join(import.meta.dirname, 'fixtures', `${name}.json`);
  return JSON.parse(readFileSync(path, 'utf-8'));
}

describe('E2E: React target', () => {
  it('generates SaaS dashboard as React + Tailwind + shadcn project', async () => {
    const result = await runPipeline(loadFixture('essence-saas'), {
      projectRoot: '/tmp/test-project',
      contentRoot,
      plugin: createReactPlugin(),
      dryRun: true,
    });

    // Verify project scaffolding
    const paths = result.files.map(f => f.path);
    expect(paths).toContain('package.json');
    expect(paths).toContain('tailwind.config.ts');
    expect(paths).toContain('vite.config.ts');
    expect(paths).toContain('src/globals.css');
    expect(paths).toContain('src/lib/utils.ts');

    // Verify React-specific output
    expect(paths).toContain('src/App.tsx');
    expect(paths).toContain('src/pages/overview.tsx');
    expect(paths).toContain('src/pages/settings.tsx');

    // Verify no Decantr-specific imports leaked
    for (const file of result.files) {
      expect(file.content).not.toContain("from 'decantr/");
      // css() calls from decantr should not appear in React output
      // (only pattern code could leak, but React emitter generates its own JSX)
    }

    // Verify React patterns
    const appTsx = result.files.find(f => f.path === 'src/App.tsx')!;
    expect(appTsx.content).toContain('react-router-dom');
    expect(appTsx.content).toContain('NavLink');

    // Verify Tailwind classes used
    const overview = result.files.find(f => f.path === 'src/pages/overview.tsx')!;
    expect(overview.content).toContain('className=');
    expect(overview.content).toContain('grid');

    // Verify React wiring uses useState
    expect(overview.content).toContain('useState');
    expect(overview.content).toContain('pageSearch');

    // Verify patterns are generated (even unresolved ones get placeholders)
    expect(overview.content).toContain('function KpiGrid');

    // Verify package.json has React deps
    const pkgJson = JSON.parse(result.files.find(f => f.path === 'package.json')!.content);
    expect(pkgJson.dependencies).toHaveProperty('react');
    expect(pkgJson.dependencies).toHaveProperty('react-router-dom');
    expect(pkgJson.devDependencies).toHaveProperty('tailwindcss');
  });

  it('same essence produces structurally equivalent output for both targets', async () => {
    const essence = loadFixture('essence-saas');

    const decantrResult = await runPipeline(essence, {
      projectRoot: '/tmp/test',
      contentRoot,
      plugin: createDecantrPlugin(),
      dryRun: true,
    });

    const reactResult = await runPipeline(essence, {
      projectRoot: '/tmp/test',
      contentRoot,
      plugin: createReactPlugin(),
      dryRun: true,
    });

    // Both should produce the same number of page files
    const decantrPages = decantrResult.files.filter(f => f.path.startsWith('src/pages/') && !f.path.includes('not-found')).length;
    const reactPages = reactResult.files.filter(f => f.path.startsWith('src/pages/') && !f.path.includes('not-found')).length;
    expect(decantrPages).toBe(reactPages);

    // Both should share the same IR (routes and theme)
    expect(decantrResult.ir.routes).toEqual(reactResult.ir.routes);
    expect(decantrResult.ir.theme).toEqual(reactResult.ir.theme);
  });

  it('generates globals.css with dark mode variables', async () => {
    const result = await runPipeline(loadFixture('essence-saas'), {
      projectRoot: '/tmp/test',
      contentRoot,
      plugin: createReactPlugin(),
      dryRun: true,
    });

    const css = result.files.find(f => f.path === 'src/globals.css')!;
    expect(css.content).toContain('@tailwind base');
    expect(css.content).toContain('--background');
    expect(css.content).toContain('--primary');
  });

  it('uses HashRouter for hash routing', async () => {
    const result = await runPipeline(loadFixture('essence-saas'), {
      projectRoot: '/tmp/test',
      contentRoot,
      plugin: createReactPlugin(),
      dryRun: true,
    });

    const app = result.files.find(f => f.path === 'src/App.tsx')!;
    expect(app.content).toContain('HashRouter');
  });
});
