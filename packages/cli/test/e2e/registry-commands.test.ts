import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

function runCli(args: string): string {
  const cliPath = join(__dirname, '..', '..', 'dist', 'bin.js');
  try {
    return execSync(`node ${cliPath} ${args}`, {
      cwd: process.cwd(),
      encoding: 'utf-8',
      timeout: 15000,
    });
  } catch (err: any) {
    // execSync throws on non-zero exit — return stderr+stdout for assertion
    return (err.stdout ?? '') + (err.stderr ?? '');
  }
}

describe('registry commands (e2e)', () => {
  it('search returns output', () => {
    const output = runCli('search dashboard');
    // Should produce some output — either results or an error message
    expect(output.length).toBeGreaterThan(0);
  });

  it('list blueprints returns items or empty message', () => {
    const output = runCli('list blueprints');
    // Either "N blueprints found" or "No blueprints found."
    expect(output).toContain('blueprint');
  });

  it('get pattern hero returns JSON with correct slug', () => {
    const output = runCli('get pattern hero');
    const json = JSON.parse(output);
    // The API may return a UUID as `id` — check `slug` or `id` field
    const identifier = json.slug ?? json.id;
    expect(identifier).toBe('hero');
  });

  it('list shells returns items or empty message', () => {
    const output = runCli('list shells');
    // Either "N shells found" or "No shells found."
    expect(output).toContain('shells');
  });

  it('showcase verification returns schema-backed JSON', () => {
    const output = runCli('showcase verification --json');
    const json = JSON.parse(output);
    expect(json.$schema).toBe('https://decantr.ai/schemas/showcase-shortlist-report.v1.json');
    expect(Array.isArray(json.results)).toBe(true);
    expect(json.results.some((entry: { slug: string }) => entry.slug === 'portfolio')).toBe(true);
  });
});
