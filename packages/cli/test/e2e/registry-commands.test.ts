import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execFile, execSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

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
  } catch (err: any) {
    // execSync throws on non-zero exit — return stderr+stdout for assertion
    return (err.stdout ?? '') + (err.stderr ?? '');
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
  } catch (err: any) {
    return (err.stdout ?? '') + (err.stderr ?? '');
  }
}

describe('registry commands (e2e)', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'decantr-registry-'));
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('search returns output', () => {
    const output = runCli(testDir, 'search dashboard');
    // Should produce some output — either results or an error message
    expect(output.length).toBeGreaterThan(0);
  });

  it('list blueprints returns items or empty message', () => {
    const output = runCli(testDir, 'list blueprints');
    // Either "N blueprints found" or "No blueprints found."
    expect(output).toContain('blueprint');
  });

  it('get pattern hero returns JSON with correct slug', () => {
    const output = runCli(testDir, 'get pattern hero');
    const json = JSON.parse(output);
    // The API may return a UUID as `id` — check `slug` or `id` field
    const identifier = json.slug ?? json.id;
    expect(identifier).toBe('hero');
  });

  it('list shells returns items or empty message', () => {
    const output = runCli(testDir, 'list shells');
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
          appsWithTitleOkCount: 1,
          appsWithRouteCoverageCount: 1,
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
              titleOk: true,
              assetCount: 2,
              assetsPassed: 2,
              routeHintsChecked: ['/'],
              routeHintsMatched: 1,
              routeDocumentsChecked: 1,
              routeDocumentsPassed: 1,
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

    const output = await runCliAsync(testDir, 'showcase verification --json', {
      DECANTR_API_URL: `http://127.0.0.1:${port}/v1`,
      DECANTR_API_KEY: '',
    });

    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));

    const json = JSON.parse(output);
    expect(json.$schema).toBe('https://decantr.ai/schemas/showcase-shortlist-report.v1.json');
    expect(Array.isArray(json.results)).toBe(true);
    expect(json.results.some((entry: { slug: string }) => entry.slug === 'portfolio')).toBe(true);
  });

  it('registry summary returns schema-backed JSON', async () => {
    const server = createServer((req, res) => {
      if (req.url?.startsWith('/v1/intelligence/summary')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          $schema: 'https://decantr.ai/schemas/registry-intelligence-summary.v1.json',
          generated_at: '2026-04-09T00:00:00.000Z',
          namespace: '@official',
          totals: {
            total_public_items: 2,
            with_intelligence: 2,
            recommended: 1,
            authored: 1,
            benchmark: 0,
            hybrid: 1,
            missing_source: 0,
            smoke_green: 1,
            build_green: 0,
            high_confidence: 1,
            verified_confidence: 1,
          },
          by_type: {
            pattern: {
              total_public_items: 1,
              with_intelligence: 1,
              recommended: 1,
              authored: 1,
              benchmark: 0,
              hybrid: 0,
              missing_source: 0,
              smoke_green: 0,
              build_green: 0,
              high_confidence: 0,
              verified_confidence: 0,
            },
            theme: {
              total_public_items: 0,
              with_intelligence: 0,
              recommended: 0,
              authored: 0,
              benchmark: 0,
              hybrid: 0,
              missing_source: 0,
              smoke_green: 0,
              build_green: 0,
              high_confidence: 0,
              verified_confidence: 0,
            },
            blueprint: {
              total_public_items: 1,
              with_intelligence: 1,
              recommended: 0,
              authored: 0,
              benchmark: 0,
              hybrid: 1,
              missing_source: 0,
              smoke_green: 1,
              build_green: 0,
              high_confidence: 1,
              verified_confidence: 1,
            },
            archetype: {
              total_public_items: 0,
              with_intelligence: 0,
              recommended: 0,
              authored: 0,
              benchmark: 0,
              hybrid: 0,
              missing_source: 0,
              smoke_green: 0,
              build_green: 0,
              high_confidence: 0,
              verified_confidence: 0,
            },
            shell: {
              total_public_items: 0,
              with_intelligence: 0,
              recommended: 0,
              authored: 0,
              benchmark: 0,
              hybrid: 0,
              missing_source: 0,
              smoke_green: 0,
              build_green: 0,
              high_confidence: 0,
              verified_confidence: 0,
            },
          },
        }));
        return;
      }

      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    });

    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
    const { port } = server.address() as AddressInfo;

    const output = await runCliAsync(testDir, 'registry summary --namespace @official --json', {
      DECANTR_API_URL: `http://127.0.0.1:${port}/v1`,
      DECANTR_API_KEY: '',
    });

    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));

    const json = JSON.parse(output);
    expect(json.$schema).toBe('https://decantr.ai/schemas/registry-intelligence-summary.v1.json');
    expect(json.namespace).toBe('@official');
    expect(json.totals.hybrid).toBe(1);
  });

  it('registry compile-packs posts an essence document and returns a pack bundle', async () => {
    const requests: Array<{ url?: string; method?: string; body?: string }> = [];
    const server = createServer((req, res) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        requests.push({ url: req.url, method: req.method, body });

        if (req.method === 'POST' && req.url?.startsWith('/v1/packs/compile')) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            $schema: 'https://decantr.ai/schemas/execution-pack-bundle.v1.json',
            generatedAt: '2026-04-09T00:00:00.000Z',
            sourceEssenceVersion: '2.0.0',
            manifest: {
              $schema: 'https://decantr.ai/schemas/pack-manifest.v1.json',
              version: '1.0.0',
              generatedAt: '2026-04-09T00:00:00.000Z',
              scaffold: { id: 'scaffold', markdown: 'scaffold-pack.md', json: 'scaffold-pack.json' },
              review: { id: 'review', markdown: 'review-pack.md', json: 'review-pack.json' },
              sections: [],
              pages: [{ id: 'home', markdown: 'page-home-pack.md', json: 'page-home-pack.json', sectionId: 'dashboard', sectionRole: 'primary' }],
              mutations: [{ id: 'modify', markdown: 'mutation-modify-pack.md', json: 'mutation-modify-pack.json', mutationType: 'modify' }],
            },
            scaffold: {
              $schema: 'https://decantr.ai/schemas/scaffold-pack.v1.json',
              packVersion: '1.0.0',
              packType: 'scaffold',
              objective: 'Scaffold the clean app shell and declared routes.',
              target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
              preset: null,
              scope: { appId: 'app', pageIds: ['home'], patternIds: ['hero'] },
              requiredSetup: ['Treat routes as source of truth.'],
              allowedVocabulary: ['clean', 'hero'],
              examples: [],
              antiPatterns: [],
              successChecks: [],
              tokenBudget: { target: 1400, max: 2200, strategy: ['compact'] },
              data: {
                shell: 'sidebar-main',
                theme: { id: 'clean', mode: 'light', shape: null },
                routing: 'history',
                features: ['auth'],
                routes: [{ pageId: 'home', path: '/', patternIds: ['hero'] }],
              },
              renderedMarkdown: '# Scaffold Pack\n',
            },
            review: {
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
              antiPatterns: [],
              successChecks: [],
              tokenBudget: { target: 1400, max: 2200, strategy: ['compact'] },
              data: {
                reviewType: 'app',
                shell: 'sidebar-main',
                theme: { id: 'clean', mode: 'light', shape: null },
                routing: 'history',
                features: ['auth'],
                routes: [{ pageId: 'home', path: '/', patternIds: ['hero'] }],
                focusAreas: ['route-topology'],
                workflow: ['Read the scaffold pack first.'],
              },
              renderedMarkdown: '# Review Pack\n',
            },
            sections: [],
            pages: [{
              $schema: 'https://decantr.ai/schemas/page-pack.v1.json',
              packVersion: '1.0.0',
              packType: 'page',
              objective: 'Implement the home route using the compiled page contract.',
              target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
              preset: null,
              scope: { appId: 'app', pageIds: ['home'], patternIds: ['hero'] },
              requiredSetup: [],
              allowedVocabulary: [],
              examples: [],
              antiPatterns: [],
              successChecks: [],
              tokenBudget: { target: 1400, max: 2200, strategy: ['compact'] },
              data: {
                pageId: 'home',
                path: '/',
                shell: 'sidebar-main',
                sectionId: 'dashboard',
                sectionRole: 'primary',
                features: ['auth'],
                surface: 'default',
                theme: { id: 'clean', mode: 'light', shape: null },
                wiringSignals: [],
                patterns: [{ id: 'hero', alias: 'hero', preset: 'landing', layout: 'stack' }],
              },
              renderedMarkdown: '# Page Pack\n',
            }],
            mutations: [{
              $schema: 'https://decantr.ai/schemas/mutation-pack.v1.json',
              packVersion: '1.0.0',
              packType: 'mutation',
              objective: 'Execute the modify workflow against the compiled app contract.',
              target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
              preset: null,
              scope: { appId: 'app', pageIds: ['home'], patternIds: ['hero'] },
              requiredSetup: [],
              allowedVocabulary: [],
              examples: [],
              antiPatterns: [],
              successChecks: [],
              tokenBudget: { target: 1400, max: 2200, strategy: ['compact'] },
              data: {
                mutationType: 'modify',
                shell: 'sidebar-main',
                theme: { id: 'clean', mode: 'light', shape: null },
                routing: 'history',
                features: ['auth'],
                routes: [{ pageId: 'home', path: '/', patternIds: ['hero'] }],
                workflow: ['Read the page pack first.'],
              },
              renderedMarkdown: '# Mutation Pack\n',
            }],
          }));
          return;
        }

        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
      });
    });

    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
    const { port } = server.address() as AddressInfo;

    const essencePath = join(testDir, 'decantr.essence.json');
    writeFileSync(essencePath, JSON.stringify({
      version: '2.0.0',
      archetype: 'dashboard',
      theme: { id: 'clean', mode: 'light' },
      personality: ['professional'],
      platform: { type: 'spa', routing: 'history' },
      structure: [{ id: 'home', shell: 'sidebar-main', layout: ['hero'] }],
      features: ['auth'],
      density: { level: 'comfortable', content_gap: '1.5rem' },
      guard: { mode: 'guided' },
      target: 'react',
    }, null, 2));

    const output = await runCliAsync(testDir, 'registry compile-packs decantr.essence.json --namespace @official --json', {
      DECANTR_API_URL: `http://127.0.0.1:${port}/v1`,
      DECANTR_API_KEY: '',
    });

    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));

    const json = JSON.parse(output);
    expect(json.$schema).toBe('https://decantr.ai/schemas/execution-pack-bundle.v1.json');
    expect(json.scaffold.target.adapter).toBe('react-vite');
    expect(
      requests.some((request) => {
        if (request.method !== 'POST' || !request.url?.includes('/v1/packs/compile?namespace=%40official') || !request.body) {
          return false;
        }
        try {
          const posted = JSON.parse(request.body);
          return posted.archetype === 'dashboard';
        } catch {
          return false;
        }
      }),
    ).toBe(true);
  });

  it('forwards sort parameters for search and list commands', async () => {
    const requests: string[] = [];
    const server = createServer((req, res) => {
      requests.push(req.url || '');

      if (req.url?.startsWith('/v1/search')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          total: 1,
          results: [{
            type: 'blueprint',
            slug: 'alpha',
            namespace: '@official',
            description: 'Alpha result',
          }],
        }));
        return;
      }

      if (req.url?.startsWith('/v1/blueprints')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          total: 1,
          items: [{
            id: 'blueprint-1',
            type: 'blueprint',
            slug: 'alpha',
            namespace: '@official',
            name: 'Alpha',
            description: 'Alpha blueprint',
          }],
        }));
        return;
      }

      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    });

    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
    const { port } = server.address() as AddressInfo;
    const env = {
      DECANTR_API_URL: `http://127.0.0.1:${port}/v1`,
      DECANTR_API_KEY: '',
    };

    await runCliAsync(testDir, 'search portfolio --sort name --type blueprints --recommended --source hybrid', env);
    await runCliAsync(testDir, 'list blueprints --sort recent --recommended --source authored', env);

    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));

    expect(
      requests.some((url) => url.includes('/v1/search') && url.includes('sort=name') && url.includes('recommended=true') && url.includes('intelligence_source=hybrid')),
    ).toBe(true);
    expect(
      requests.some((url) => url.includes('/v1/blueprints') && url.includes('sort=recent') && url.includes('recommended=true') && url.includes('intelligence_source=authored')),
    ).toBe(true);
  });
});
