import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { applyTailwindSourceIsolation } from '../src/tailwind-source-isolation.js';

function write(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, 'utf8');
}

describe('Tailwind v4 source isolation', () => {
  let root = '';

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'decantr-tailwind-source-'));
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it('adds one idempotent exclusion block after a Tailwind v4 import', () => {
    write(
      join(root, 'package.json'),
      JSON.stringify({ dependencies: { tailwindcss: '^4.1.0', '@tailwindcss/vite': '^4.1.0' } }),
    );
    write(join(root, 'src', 'styles.css'), '@import "tailwindcss";\n\nbody { margin: 0; }\n');
    write(join(root, 'DECANTR.md'), '# Governance\n\nUse `grid` and `fixed` as prose.\n');
    write(join(root, 'decantr.essence.json'), '{"layout":"grid"}\n');
    write(join(root, '.decantr', 'context', 'scaffold.md'), 'Use a `container`.\n');

    const first = applyTailwindSourceIsolation(root);
    const content = readFileSync(join(root, 'src', 'styles.css'), 'utf8');

    expect(first.detected).toBe(true);
    expect(first.entryFiles).toEqual(['src/styles.css']);
    expect(first.limitations).toEqual([]);
    expect(first.mutations).toHaveLength(1);
    expect(first.mutations[0]).toMatchObject({
      kind: 'tailwind-v4-source-isolation',
      path: 'src/styles.css',
      excludedPaths: [
        '../.decantr',
        '../DECANTR.md',
        '../decantr.essence.json',
        '../.cursor/rules/decantr.mdc',
        '../.claude/rules/decantr.md',
      ],
    });
    expect(content).toContain('/* decantr:tailwind-source-isolation:start */');
    expect(content).toContain('@source not "../.decantr";');
    expect(content.indexOf('@import "tailwindcss";')).toBeLessThan(
      content.indexOf('decantr:tailwind-source-isolation:start'),
    );
    expect(first.mutations[0]?.beforeHash).not.toBe(first.mutations[0]?.afterHash);

    const second = applyTailwindSourceIsolation(root);
    expect(second.mutations).toEqual([]);
    expect(readFileSync(join(root, 'src', 'styles.css'), 'utf8')).toBe(content);
  });

  it('uses explicit relative paths for a root stylesheet', () => {
    write(join(root, 'package.json'), '{"devDependencies":{"tailwindcss":"4.0.0"}}\n');
    write(join(root, 'app.css'), "@import 'tailwindcss';\n");

    const result = applyTailwindSourceIsolation(root);

    expect(result.mutations[0]?.excludedPaths[0]).toBe('./.decantr');
    expect(readFileSync(join(root, 'app.css'), 'utf8')).toContain('@source not "./DECANTR.md";');
  });

  it('does not write Tailwind v4 directives for a v3 dependency', () => {
    write(join(root, 'package.json'), '{"devDependencies":{"tailwindcss":"^3.4.0"}}\n');
    write(join(root, 'src', 'styles.css'), '@import "tailwindcss";\n');

    const result = applyTailwindSourceIsolation(root);

    expect(result.detected).toBe(false);
    expect(result.mutations).toEqual([]);
    expect(result.limitations).toHaveLength(1);
    expect(readFileSync(join(root, 'src', 'styles.css'), 'utf8')).toBe('@import "tailwindcss";\n');
  });
});
