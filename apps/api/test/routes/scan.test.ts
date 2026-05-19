import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../../src/types.js';

const { mockRunHostedScan } = vi.hoisted(() => ({
  mockRunHostedScan: vi.fn(),
}));

vi.mock('../../src/lib/hosted-scan.js', () => ({
  runHostedScan: mockRunHostedScan,
}));

const { scanRoutes } = await import('../../src/routes/scan.js');

function createTestApp() {
  const app = new Hono<Env>();
  app.route('/v1', scanRoutes);
  return app;
}

function sampleReport(input: string) {
  return {
    schemaVersion: 'scan-report.v1',
    generatedAt: '2026-05-19T12:00:00.000Z',
    input: { kind: input.includes('github.io') ? 'github-pages' : 'github-repo', value: input },
    source: {
      repository: { owner: 'acme', repo: 'site', url: 'https://github.com/acme/site' },
      publishedSiteUrl: 'https://acme.github.io/site/',
    },
    confidence: { level: 'high', score: 88, reasons: ['react framework signal found'] },
    applicability: { status: 'strong_fit', label: 'Good Brownfield scan target', reasons: [] },
    project: {
      framework: 'react',
      frameworkVersion: '19.0.0',
      packageManager: 'npm',
      primaryLanguage: 'javascript',
      hasTypeScript: true,
      hasTailwind: false,
      hasDecantr: false,
      packageName: 'site',
    },
    routes: { strategy: 'react-router', count: 1, items: [{ path: '/', file: 'src/App.tsx', hasLayout: false }] },
    components: { pageCount: 1, componentCount: 1, directories: ['src'] },
    styling: {
      approach: 'css',
      configFile: 'src/styles.css',
      cssVariableCount: 2,
      colorTokenCount: 1,
      darkMode: false,
      themeSignals: [],
    },
    staticHosting: {
      githubPagesLikely: true,
      evidence: ['hash routing detected in src/App.tsx'],
      homepageUrl: null,
      basePath: '/site/',
      hashRouting: true,
    },
    assistant: { ruleFiles: [] },
    pagesProbe: null,
    findings: [],
    recommendedCommands: ['npx @decantr/cli scan', 'npx @decantr/cli adopt --yes'],
    privacy: { sourceUploaded: true, persistedByDecantr: false, notes: ['ephemeral'] },
  };
}

describe('POST /v1/scan', () => {
  beforeEach(() => {
    mockRunHostedScan.mockReset();
  });

  it('accepts GitHub repository URLs', async () => {
    mockRunHostedScan.mockResolvedValue(sampleReport('https://github.com/acme/site'));
    const app = createTestApp();
    const res = await app.request('/v1/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://github.com/acme/site' }),
    });

    expect(res.status).toBe(200);
    expect(mockRunHostedScan).toHaveBeenCalledWith('https://github.com/acme/site');
    const json = await res.json();
    expect(json.schemaVersion).toBe('scan-report.v1');
    expect(json.privacy.persistedByDecantr).toBe(false);
  });

  it('accepts GitHub Pages URLs', async () => {
    mockRunHostedScan.mockResolvedValue(sampleReport('https://acme.github.io/site/'));
    const app = createTestApp();
    const res = await app.request('/v1/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://acme.github.io/site/' }),
    });

    expect(res.status).toBe(200);
    expect(mockRunHostedScan).toHaveBeenCalledWith('https://acme.github.io/site/');
  });

  it('rejects malformed payloads', async () => {
    const app = createTestApp();
    const res = await app.request('/v1/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repo: 'https://github.com/acme/site' }),
    });

    expect(res.status).toBe(400);
    expect(mockRunHostedScan).not.toHaveBeenCalled();
  });

  it('returns validation errors from hosted scan startup', async () => {
    mockRunHostedScan.mockRejectedValue(new Error('V1 hosted scans support GitHub repositories and GitHub Pages URLs.'));
    const app = createTestApp();
    const res = await app.request('/v1/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com/nope' }),
    });

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('GitHub');
  });

  it('can return source-unavailable reports for private or missing repositories', async () => {
    mockRunHostedScan.mockResolvedValue({
      ...sampleReport('https://github.com/acme/private'),
      applicability: { status: 'unknown', label: 'Scan unavailable', reasons: ['not found'] },
      findings: [{ id: 'source-unavailable', severity: 'error', title: 'Repository source unavailable', message: 'not found', evidence: [] }],
    });
    const app = createTestApp();
    const res = await app.request('/v1/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://github.com/acme/private' }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.findings[0].id).toBe('source-unavailable');
  });

  it('returns 429 when hosted scan capacity is full', async () => {
    const capacityError = new Error('Hosted scan capacity is currently full. Please try again in a moment.');
    capacityError.name = 'HostedScanCapacityError';
    mockRunHostedScan.mockRejectedValue(capacityError);
    const app = createTestApp();
    const res = await app.request('/v1/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://github.com/acme/site' }),
    });

    expect(res.status).toBe(429);
    const json = await res.json();
    expect(json.error).toContain('capacity');
    expect(json.retryAfter).toBe(15);
  });
});
