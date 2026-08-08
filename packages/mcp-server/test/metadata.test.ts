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

  it('preserves the stable server identity and stdio transport', () => {
    const serverJson = readJson(join(packageRoot, 'server.json'));
    const advertisedPackage = (serverJson.packages as Array<Record<string, unknown>>)[0];

    expect(serverJson.name).toBe('io.github.decantr-ai/mcp-server');
    expect(serverJson.description).toContain('Stable eight-tool MCP server');
    expect(serverJson.description).toContain('authority-aware UI task context');
    expect((serverJson.description as string).length).toBeLessThanOrEqual(100);
    expect(advertisedPackage.identifier).toBe('@decantr/mcp-server');
    expect(advertisedPackage.transport).toEqual({ type: 'stdio' });
  });

  it('keeps Smithery on the zero-config stdio package entrypoint', () => {
    const smithery = readFileSync(join(packageRoot, 'smithery.yaml'), 'utf8');

    expect(smithery).toContain('type: stdio');
    expect(smithery).toContain("args: ['-y', '@decantr/mcp-server@3.11.2']");
    expect(smithery).toContain(
      'preparation remains authority-aware and fails closed on ambiguous or unsupported targets',
    );
  });

  it('keeps the stdio server version aligned with the package version', () => {
    const packageJson = readJson(join(packageRoot, 'package.json'));
    const source = readFileSync(join(packageRoot, 'src', 'index.ts'), 'utf8');

    expect(source).toContain(`const VERSION = '${packageJson.version}'`);
  });

  it('bundles the stdio SDK without shipping its unused HTTP dependency tree', () => {
    const packageJson = readJson(join(packageRoot, 'package.json'));
    const dependencies = packageJson.dependencies as Record<string, string>;
    const devDependencies = packageJson.devDependencies as Record<string, string>;
    const buildConfig = readFileSync(join(packageRoot, 'tsup.config.ts'), 'utf8');

    expect(dependencies).not.toHaveProperty('@modelcontextprotocol/sdk');
    expect(devDependencies).toHaveProperty('@modelcontextprotocol/sdk');
    expect(buildConfig).toContain("noExternal: ['@modelcontextprotocol/sdk']");
  });
});
