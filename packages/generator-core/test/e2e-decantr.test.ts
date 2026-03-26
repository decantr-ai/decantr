import { describe, it, expect } from 'vitest';
import { runPipeline } from '../src/pipeline.js';
import { createDecantrPlugin } from '@decantr/generator-decantr';
import type { EssenceFile } from '@decantr/essence-spec';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const contentRoot = join(import.meta.dirname, '..', '..', '..', 'content', 'core');

function loadFixture(name: string): EssenceFile {
  const path = join(import.meta.dirname, 'fixtures', `${name}.json`);
  return JSON.parse(readFileSync(path, 'utf-8'));
}

describe('E2E: Decantr target', () => {
  it('generates SaaS dashboard project files', async () => {
    const result = await runPipeline(loadFixture('essence-saas'), {
      projectRoot: '/tmp/test-project',
      contentRoot,
      plugin: createDecantrPlugin(),
      dryRun: true,
    });

    // Verify file list
    const paths = result.files.map(f => f.path);
    expect(paths).toContain('src/app.js');
    expect(paths).toContain('src/pages/overview.js');
    expect(paths).toContain('src/pages/settings.js');
    expect(paths).toContain('src/pages/not-found.js');
    expect(paths).toContain('src/state/store.js');
    expect(paths).toContain('public/index.html');

    // Verify app.js content
    const appJs = result.files.find(f => f.path === 'src/app.js')!;
    expect(appJs.content).toContain("setStyle('auradecantism')");
    expect(appJs.content).toContain("setMode('dark')");
    expect(appJs.content).toContain('Shell({');
    expect(appJs.content).toContain('createRouter({');

    // Verify page content has wiring
    const overview = result.files.find(f => f.path === 'src/pages/overview.js')!;
    expect(overview.content).toContain('createSignal');
    expect(overview.content).toContain('pageSearch');

    // Verify imports are deduplicated
    const tagImports = overview.content.match(/import.*decantr\/tags/g);
    expect(tagImports?.length).toBe(1);
  });

  it('generates landing page project files', async () => {
    const result = await runPipeline(loadFixture('essence-landing'), {
      projectRoot: '/tmp/test-project',
      contentRoot,
      plugin: createDecantrPlugin(),
      dryRun: true,
    });

    const paths = result.files.map(f => f.path);
    expect(paths).toContain('src/app.js');
    expect(paths).toContain('src/pages/home.js');

    // Full-bleed shell should not use Shell component
    const appJs = result.files.find(f => f.path === 'src/app.js')!;
    expect(appJs.content).not.toContain('Shell({');
    expect(appJs.content).toContain('router.view()');

    // Hero pattern should be included
    const homePage = result.files.find(f => f.path === 'src/pages/home.js')!;
    expect(homePage.content).toContain('Hero');
  });

  it('app.js includes correct routing mode', async () => {
    const result = await runPipeline(loadFixture('essence-saas'), {
      projectRoot: '/tmp/test-project',
      contentRoot,
      plugin: createDecantrPlugin(),
      dryRun: true,
    });

    const appJs = result.files.find(f => f.path === 'src/app.js')!;
    expect(appJs.content).toContain("mode: 'hash'");
  });
});
