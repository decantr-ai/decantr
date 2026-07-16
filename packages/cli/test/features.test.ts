import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { scanFeatures } from '../src/analyzers/features.js';

describe('feature analyzer', () => {
  const roots: string[] = [];

  afterEach(() => {
    for (const root of roots.splice(0)) {
      rmSync(root, { recursive: true, force: true });
    }
  });

  function createProject(): string {
    const root = mkdtempSync(join(tmpdir(), 'decantr-features-'));
    roots.push(root);
    return root;
  }

  it('does not classify generic stores or libraries as registry features', () => {
    const root = createProject();
    const components = join(root, 'src', 'components');
    mkdirSync(components, { recursive: true });
    writeFileSync(join(components, 'notifications-store.ts'), 'export const store = {};\n');
    writeFileSync(join(components, 'component-library.ts'), 'export const components = [];\n');

    expect(scanFeatures(root).detected).not.toContain('registry');
  });

  it('keeps explicit registry, marketplace, and catalog domains distinct', () => {
    const root = createProject();
    const routes = join(root, 'src', 'routes');
    mkdirSync(join(routes, 'registry'), { recursive: true });
    mkdirSync(join(routes, 'marketplace'), { recursive: true });
    mkdirSync(join(routes, 'catalog'), { recursive: true });

    const analysis = scanFeatures(root);

    expect(analysis.detected).toEqual(
      expect.arrayContaining(['registry', 'marketplace', 'catalog']),
    );
  });
});
