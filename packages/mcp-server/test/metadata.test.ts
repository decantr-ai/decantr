import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));

function readJson(path: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
}

describe('MCP package metadata', () => {
  it('keeps server metadata aligned with the package version', () => {
    const packageJson = readJson(join(packageRoot, 'package.json'));
    const serverJson = readJson(join(packageRoot, 'server.json'));
    const advertisedPackage = (serverJson.packages as Array<Record<string, unknown>>)[0];

    expect(serverJson.version).toBe(packageJson.version);
    expect(advertisedPackage.version).toBe(packageJson.version);
  });

  it('keeps the stdio server version aligned with the package version', () => {
    const packageJson = readJson(join(packageRoot, 'package.json'));
    const source = readFileSync(join(packageRoot, 'src', 'index.ts'), 'utf8');

    expect(source).toContain(`const VERSION = '${packageJson.version}'`);
  });
});
