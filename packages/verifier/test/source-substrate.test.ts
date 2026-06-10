import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  collectSourceImports,
  createProjectSourceProgram,
  createSourceInventory,
  extractSourceStringLiterals,
  getProjectSourceFile,
  resolveSourceImport,
  resolveSourceSymbolOrigin,
} from '../src/index.js';

const fixtureRoot = join(import.meta.dirname, '..', 'fixtures', 'source');

function fixturePath(name: string): string {
  return join(fixtureRoot, name);
}

describe('source inventory', () => {
  it('indexes project-local TS and JS sources with normalized relative paths', () => {
    const inventory = createSourceInventory(fixturePath('golden'));

    expect(inventory.primaryLanguage).toBe('mixed');
    expect(inventory.hasTypeScript).toBe(true);
    expect(inventory.hasJavaScript).toBe(true);
    expect(inventory.files.map((file) => file.relativePath)).toEqual([
      'src/App.tsx',
      'src/copy.js',
      'src/ui/Button.tsx',
      'src/ui/index.ts',
    ]);
  });

  it('excludes tests, stories, and fixtures by default to avoid false positives', () => {
    const inventory = createSourceInventory(fixturePath('false-positive'));

    expect(inventory.files.map((file) => file.relativePath)).toEqual([
      'src/App.tsx',
      'src/components/Button.tsx',
    ]);
    expect(inventory.skipped).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'fixtures', reason: 'ignored-directory' }),
        expect.objectContaining({ path: 'src/__tests__', reason: 'ignored-directory' }),
        expect.objectContaining({ path: 'src/Card.stories.tsx', reason: 'ignored-file' }),
        expect.objectContaining({ path: 'src/types.d.ts', reason: 'ignored-file' }),
      ]),
    );
  });

  it('can opt into committed fixture and test sources when a harness needs them', () => {
    const inventory = createSourceInventory(fixturePath('false-positive'), {
      includeFixtures: true,
      includeTests: true,
    });

    expect(inventory.files.map((file) => file.relativePath)).toEqual([
      'fixtures/shadow.fixture.tsx',
      'src/__tests__/App.test.tsx',
      'src/App.tsx',
      'src/Card.stories.tsx',
      'src/components/Button.tsx',
    ]);
  });
});

describe('source program utilities', () => {
  it('resolves path aliases, symbol origins, and string literals in TS/JS projects', () => {
    const context = createProjectSourceProgram(fixturePath('golden'));
    const app = getProjectSourceFile(context, 'src/App.tsx');

    expect(context.tsconfigPath).toMatch(/tsconfig\.json$/);
    expect(app).toBeDefined();

    const imports = collectSourceImports(context, app!);
    expect(imports).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: '@/ui/Button',
          imported: ['Button'],
          localNames: ['PrimaryButton'],
          resolved: expect.objectContaining({
            kind: 'project-local',
            relativePath: 'src/ui/Button.tsx',
          }),
        }),
        expect.objectContaining({
          source: './copy.js',
          resolved: expect.objectContaining({
            kind: 'project-local',
            relativePath: 'src/copy.js',
          }),
        }),
      ]),
    );

    const origin = resolveSourceSymbolOrigin(context, app!, 'PrimaryButton');
    expect(origin).toMatchObject({
      name: 'Button',
      localName: 'PrimaryButton',
      file: 'src/ui/Button.tsx',
      importSource: '@/ui/Button',
      isProjectLocal: true,
    });

    const literals = extractSourceStringLiterals(app!);
    expect(literals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: '@/ui/Button', context: 'import-specifier' }),
        expect.objectContaining({
          value: 'd-panel',
          context: 'jsx-attribute',
          attributeName: 'className',
        }),
        expect.objectContaining({
          value: 'Launch',
          context: 'jsx-attribute',
          attributeName: 'label',
        }),
      ]),
    );
  });

  it('falls back cleanly for JS-only projects without tsconfig', () => {
    const context = createProjectSourceProgram(fixturePath('adversarial'));
    const app = getProjectSourceFile(context, 'src/App.jsx');

    expect(context.tsconfigPath).toBeNull();
    expect(context.inventory.primaryLanguage).toBe('javascript');
    expect(app).toBeDefined();

    const imports = collectSourceImports(context, app!);
    expect(imports).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: './local-copy.js',
          kind: 'require',
          localNames: ['localCopy'],
          resolved: expect.objectContaining({
            kind: 'project-local',
            relativePath: 'src/local-copy.js',
          }),
        }),
        expect.objectContaining({
          source: './lazy-widget.jsx',
          kind: 'dynamic-import',
          resolved: expect.objectContaining({
            kind: 'project-local',
            relativePath: 'src/lazy-widget.jsx',
          }),
        }),
      ]),
    );

    expect(resolveSourceImport(context, app!, 'react')).toMatchObject({
      kind: 'external',
      isExternal: true,
      failed: false,
    });
    expect(extractSourceStringLiterals(app!)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          value: 'ready',
          context: 'jsx-attribute',
          attributeName: 'data-state',
        }),
      ]),
    );
  });
});
