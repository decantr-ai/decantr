import { execFile, execSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);

function runCli(cwd: string, args: string, env?: NodeJS.ProcessEnv): string {
  const cliPath = join(__dirname, '..', '..', 'dist', 'bin.js');
  try {
    return execSync(`node ${cliPath} ${args}`, {
      cwd,
      encoding: 'utf-8',
      timeout: 15000,
      env: { ...process.env, ...env },
    });
  } catch (error) {
    const execError = error as { stdout?: string; stderr?: string };
    return `${execError.stdout ?? ''}${execError.stderr ?? ''}`;
  }
}

async function runCliAsync(cwd: string, args: string, env?: NodeJS.ProcessEnv): Promise<string> {
  const cliPath = join(__dirname, '..', '..', 'dist', 'bin.js');
  const argv = args.split(' ').filter(Boolean);

  try {
    const { stdout } = await execFileAsync('node', [cliPath, ...argv], {
      cwd,
      encoding: 'utf-8',
      timeout: 15000,
      env: { ...process.env, ...env },
    });
    return stdout;
  } catch (error) {
    const execError = error as { stdout?: string; stderr?: string };
    return `${execError.stdout ?? ''}${execError.stderr ?? ''}`;
  }
}

describe('audit command (e2e)', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'decantr-audit-'));
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('audits the project contract and reports missing review packs', () => {
    writeFileSync(
      join(testDir, 'decantr.essence.json'),
      JSON.stringify(
        {
          version: '3.0.0',
          dna: {
            theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
            spacing: {
              base_unit: 4,
              scale: 'linear',
              density: 'comfortable',
              content_gap: '_gap4',
            },
            typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
            color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
            radius: { philosophy: 'rounded', base: 8 },
            elevation: { system: 'layered', max_levels: 3 },
            motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
            accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
            personality: ['professional'],
          },
          blueprint: {
            shell: 'sidebar-main',
            pages: [{ id: 'home', layout: ['hero'] }],
            features: [],
          },
          meta: {
            archetype: 'marketing',
            target: 'react',
            platform: { type: 'spa', routing: 'hash' },
            guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
          },
        },
        null,
        2,
      ),
    );

    const output = runCli(testDir, 'audit', {
      DECANTR_API_URL: 'http://127.0.0.1:9/v1',
      DECANTR_API_KEY: '',
    });

    expect(output).toContain('Project contract is valid.');
    expect(output).toContain('Review pack: missing');
    expect(output).toContain('review pack file is missing');
  });

  it('hydrates the hosted review pack and manifest before auditing', async () => {
    const requests: Array<{ url?: string; method?: string; body?: string }> = [];
    const server = createServer((req, res) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        requests.push({ url: req.url, method: req.method, body });
        if (req.method === 'POST' && req.url?.startsWith('/v1/packs/select')) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              $schema: 'https://decantr.ai/schemas/selected-execution-pack.v1.json',
              generatedAt: '2026-04-09T00:00:00.000Z',
              sourceEssenceVersion: '3.0.0',
              manifest: {
                $schema: 'https://decantr.ai/schemas/pack-manifest.v1.json',
                version: '1.0.0',
                generatedAt: '2026-04-09T00:00:00.000Z',
                scaffold: {
                  id: 'scaffold',
                  markdown: 'scaffold-pack.md',
                  json: 'scaffold-pack.json',
                },
                review: { id: 'review', markdown: 'review-pack.md', json: 'review-pack.json' },
                sections: [],
                pages: [],
                mutations: [],
              },
              selector: {
                packType: 'review',
                id: null,
              },
              pack: {
                $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
                packVersion: '1.0.0',
                packType: 'review',
                objective: 'Review generated output against the compiled Decantr contract.',
                target: {
                  platform: 'web',
                  framework: 'react',
                  runtime: 'spa',
                  adapter: 'react-vite',
                },
                preset: null,
                scope: { appId: 'app', pageIds: ['home'], patternIds: ['hero'] },
                requiredSetup: [],
                allowedVocabulary: [],
                examples: [],
                antiPatterns: [],
                successChecks: [],
                tokenBudget: { target: 1400, max: 2200, strategy: ['compact'] },
                data: {
                  reviewType: 'app',
                  shell: 'sidebar-main',
                  theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
                  routing: 'hash',
                  features: [],
                  routes: [{ pageId: 'home', path: '/', patternIds: ['hero'] }],
                  focusAreas: ['route-topology'],
                  workflow: [],
                },
                renderedMarkdown: '# Review Pack\n',
              },
            }),
          );
          return;
        }

        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found', body }));
      });
    });

    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
    const { port } = server.address() as AddressInfo;

    writeFileSync(
      join(testDir, 'decantr.essence.json'),
      JSON.stringify(
        {
          version: '3.0.0',
          dna: {
            theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
            spacing: {
              base_unit: 4,
              scale: 'linear',
              density: 'comfortable',
              content_gap: '_gap4',
            },
            typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
            color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
            radius: { philosophy: 'rounded', base: 8 },
            elevation: { system: 'layered', max_levels: 3 },
            motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
            accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
            personality: ['professional'],
          },
          blueprint: {
            shell: 'sidebar-main',
            pages: [{ id: 'home', route: '/', layout: ['hero'] }],
            features: [],
          },
          meta: {
            archetype: 'marketing',
            target: 'react',
            platform: { type: 'spa', routing: 'hash' },
            guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
          },
        },
        null,
        2,
      ),
    );

    let output = '';
    try {
      output = await runCliAsync(testDir, 'audit', {
        DECANTR_API_URL: `http://127.0.0.1:${port}/v1`,
        DECANTR_API_KEY: '',
      });
    } finally {
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    }

    expect(requests).toHaveLength(1);
    expect(requests[0]?.method).toBe('POST');
    expect(requests[0]?.url).toContain('/v1/packs/select');
    expect(output).toContain('Hydrated missing review pack and manifest from hosted registry.');
    expect(output).toContain('Review pack: present');
  });

  it('critiques a specific file against the compiled review pack', () => {
    mkdirSync(join(testDir, '.decantr', 'context'), { recursive: true });
    mkdirSync(join(testDir, 'src', 'styles'), { recursive: true });
    writeFileSync(
      join(testDir, '.decantr', 'context', 'review-pack.json'),
      JSON.stringify(
        {
          $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
          packVersion: '1.0.0',
          packType: 'review',
          objective: 'Review generated output against the compiled Decantr contract.',
          target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
          preset: null,
          scope: { appId: 'app', pageIds: ['home'], patternIds: ['hero'] },
          requiredSetup: [],
          allowedVocabulary: [],
          examples: [],
          antiPatterns: [
            {
              id: 'inline-styles',
              summary: 'Avoid inline style literals as the primary styling path.',
              guidance:
                'Move visual styling into tokens.css and treatments.css instead of component-local style objects.',
            },
          ],
          successChecks: [
            {
              id: 'theme-consistency',
              label: 'Theme identity and mode remain consistent across scaffolded routes.',
              severity: 'warn',
            },
          ],
          tokenBudget: { target: 1400, max: 2200, strategy: [] },
          data: {
            reviewType: 'app',
            shell: 'sidebar-main',
            theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
            routing: 'hash',
            features: [],
            routes: [{ pageId: 'home', path: '/', patternIds: ['hero'] }],
            focusAreas: ['theme-consistency', 'responsive-design'],
            workflow: [],
          },
          renderedMarkdown: '# Review Pack\n',
        },
        null,
        2,
      ),
    );
    writeFileSync(
      join(testDir, 'src', 'styles', 'treatments.css'),
      '.brand-accent { color: var(--d-primary); }\n',
    );
    const filePath = join(testDir, 'Example.tsx');
    writeFileSync(filePath, '<button style={{ color: "#ff00ff" }}>Click me</button>\n');

    const output = runCli(testDir, `audit ${filePath}`);

    expect(output).toContain('Overall score:');
    expect(output).toContain('Focus areas: theme-consistency, responsive-design');
    expect(output).toContain('Inline style literals were detected');
  });

  it('hydrates only the hosted review pack before file critique when review context is missing', async () => {
    const requests: Array<{ url?: string; method?: string; body?: string }> = [];
    const server = createServer((req, res) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        requests.push({ url: req.url, method: req.method, body });
        if (req.method === 'POST' && req.url?.startsWith('/v1/packs/select')) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              $schema: 'https://decantr.ai/schemas/selected-execution-pack.v1.json',
              generatedAt: '2026-04-09T00:00:00.000Z',
              sourceEssenceVersion: '3.0.0',
              manifest: {
                $schema: 'https://decantr.ai/schemas/pack-manifest.v1.json',
                version: '1.0.0',
                generatedAt: '2026-04-09T00:00:00.000Z',
                scaffold: {
                  id: 'scaffold',
                  markdown: 'scaffold-pack.md',
                  json: 'scaffold-pack.json',
                },
                review: { id: 'review', markdown: 'review-pack.md', json: 'review-pack.json' },
                sections: [],
                pages: [],
                mutations: [],
              },
              selector: { packType: 'review', id: null },
              pack: {
                $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
                packVersion: '1.0.0',
                packType: 'review',
                objective: 'Review generated output against the compiled Decantr contract.',
                target: {
                  platform: 'web',
                  framework: 'react',
                  runtime: 'spa',
                  adapter: 'react-vite',
                },
                preset: null,
                scope: { appId: 'app', pageIds: ['home'], patternIds: ['hero'] },
                requiredSetup: [],
                allowedVocabulary: [],
                examples: [],
                antiPatterns: [
                  {
                    id: 'inline-styles',
                    summary: 'Avoid inline style literals as the primary styling path.',
                    guidance:
                      'Move visual styling into tokens.css and treatments.css instead of component-local style objects.',
                  },
                ],
                successChecks: [],
                tokenBudget: { target: 1400, max: 2200, strategy: ['compact'] },
                data: {
                  reviewType: 'app',
                  shell: 'sidebar-main',
                  theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
                  routing: 'hash',
                  features: [],
                  routes: [{ pageId: 'home', path: '/', patternIds: ['hero'] }],
                  focusAreas: ['theme-consistency'],
                  workflow: [],
                },
                renderedMarkdown: '# Review Pack\n',
              },
            }),
          );
          return;
        }

        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found', body }));
      });
    });

    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
    const { port } = server.address() as AddressInfo;

    mkdirSync(join(testDir, 'src', 'styles'), { recursive: true });
    writeFileSync(
      join(testDir, 'decantr.essence.json'),
      JSON.stringify(
        {
          version: '3.0.0',
          dna: {
            theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
            spacing: {
              base_unit: 4,
              scale: 'linear',
              density: 'comfortable',
              content_gap: '_gap4',
            },
            typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
            color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
            radius: { philosophy: 'rounded', base: 8 },
            elevation: { system: 'layered', max_levels: 3 },
            motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
            accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
            personality: ['professional'],
          },
          blueprint: {
            shell: 'sidebar-main',
            pages: [{ id: 'home', route: '/', layout: ['hero'] }],
            features: [],
          },
          meta: {
            archetype: 'marketing',
            target: 'react',
            platform: { type: 'spa', routing: 'hash' },
            guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
          },
        },
        null,
        2,
      ),
    );
    writeFileSync(
      join(testDir, 'src', 'styles', 'treatments.css'),
      '.brand-accent { color: var(--d-primary); }\n',
    );
    const filePath = join(testDir, 'Example.tsx');
    writeFileSync(filePath, '<button style={{ color: "#ff00ff" }}>Click me</button>\n');

    let output = '';
    try {
      output = await runCliAsync(testDir, `audit ${filePath}`, {
        DECANTR_API_URL: `http://127.0.0.1:${port}/v1`,
        DECANTR_API_KEY: '',
      });
    } finally {
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    }

    expect(requests).toHaveLength(1);
    expect(requests[0]?.method).toBe('POST');
    expect(requests[0]?.url).toContain('/v1/packs/select');
    expect(output).toContain('Hydrated missing review pack from hosted registry.');
    expect(output).toContain('Inline style literals were detected');
  });
});
