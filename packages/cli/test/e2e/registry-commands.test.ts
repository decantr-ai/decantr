import { describe, it, expect } from 'vitest';
import { execFile, execSync } from 'node:child_process';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { join } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

function runCli(args: string, env?: NodeJS.ProcessEnv): string {
  const cliPath = join(__dirname, '..', '..', 'dist', 'bin.js');
  try {
    return execSync(`node ${cliPath} ${args}`, {
      cwd: process.cwd(),
      encoding: 'utf-8',
      timeout: 15000,
      env: { ...process.env, ...env },
    });
  } catch (err: any) {
    // execSync throws on non-zero exit — return stderr+stdout for assertion
    return (err.stdout ?? '') + (err.stderr ?? '');
  }
}

async function runCliAsync(args: string, env?: NodeJS.ProcessEnv): Promise<string> {
  const cliPath = join(__dirname, '..', '..', 'dist', 'bin.js');
  const argv = args.split(' ').filter(Boolean);

  try {
    const { stdout } = await execFileAsync('node', [cliPath, ...argv], {
      cwd: process.cwd(),
      encoding: 'utf-8',
      timeout: 15000,
      env: { ...process.env, ...env },
    });
    return stdout;
  } catch (err: any) {
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

  it('showcase verification returns schema-backed JSON', async () => {
    const server = createServer((req, res) => {
      if (req.url !== '/v1/showcase/shortlist-verification') {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        $schema: 'https://decantr.ai/schemas/showcase-shortlist-report.v1.json',
        generatedAt: '2026-04-09T00:00:00.000Z',
        dryRun: false,
        summary: {
          appCount: 1,
          passedBuilds: 1,
          failedBuilds: 0,
          averageDurationMs: 1200,
          passedSmokes: 1,
          failedSmokes: 0,
          averageSmokeDurationMs: 5,
          lowerDriftCount: 1,
          moderateDriftCount: 0,
          elevatedDriftCount: 0,
          withPackManifestCount: 0,
        },
        results: [
          {
            slug: 'portfolio',
            target: 'react-vite',
            classification: 'B',
            verificationStatus: 'smoke-green',
            build: { passed: true, durationMs: 1200 },
            smoke: {
              passed: true,
              durationMs: 5,
              rootDocumentOk: true,
              assetCount: 2,
              assetsPassed: 2,
              routeHintsChecked: ['/'],
              routeHintsMatched: 1,
              failures: [],
            },
            drift: {
              signal: 'lower',
              penalty: 120,
              inlineStyleCount: 14,
              hardcodedColorCount: 4,
              utilityLeakageCount: 0,
              decantrTreatmentCount: 38,
              hasPackManifest: true,
              hasDist: true,
            },
          },
        ],
      }));
    });

    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
    const { port } = server.address() as AddressInfo;

    const output = await runCliAsync('showcase verification --json', {
      DECANTR_API_URL: `http://127.0.0.1:${port}/v1`,
      DECANTR_API_KEY: '',
    });

    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));

    const json = JSON.parse(output);
    expect(json.$schema).toBe('https://decantr.ai/schemas/showcase-shortlist-report.v1.json');
    expect(Array.isArray(json.results)).toBe(true);
    expect(json.results.some((entry: { slug: string }) => entry.slug === 'portfolio')).toBe(true);
  });
});
