import { EventEmitter } from 'node:events';
import { existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockCreateUnavailableScanReport,
  mockProbePublishedSite,
  mockResolveGitHubScanInput,
  mockScanProject,
  mockSpawn,
} = vi.hoisted(() => ({
  mockCreateUnavailableScanReport: vi.fn(),
  mockProbePublishedSite: vi.fn(),
  mockResolveGitHubScanInput: vi.fn(),
  mockScanProject: vi.fn(),
  mockSpawn: vi.fn(),
}));

vi.mock('node:child_process', () => ({
  spawn: mockSpawn,
}));

vi.mock('@decantr/verifier', () => ({
  createUnavailableScanReport: mockCreateUnavailableScanReport,
  probePublishedSite: mockProbePublishedSite,
  resolveGitHubScanInput: mockResolveGitHubScanInput,
  scanProject: mockScanProject,
}));

const { cloneGitHubRepository, runHostedScan } = await import('../../src/lib/hosted-scan.js');

const repository = {
  owner: 'acme',
  repo: 'site',
  url: 'https://github.com/acme/site',
};

function createGitChild() {
  const child = new EventEmitter() as EventEmitter & {
    stderr: EventEmitter;
    kill: ReturnType<typeof vi.fn>;
  };
  child.stderr = new EventEmitter();
  child.kill = vi.fn();
  return child;
}

function sampleScanReport(projectRoot: string) {
  return {
    schemaVersion: 'scan-report.v1',
    generatedAt: '2026-05-19T12:00:00.000Z',
    input: { kind: 'github-repo', value: 'https://github.com/acme/site' },
    source: { repository, publishedSiteUrl: 'https://acme.github.io/site/' },
    confidence: { level: 'high', score: 90, reasons: [projectRoot] },
    applicability: { status: 'strong_fit', label: 'Good Brownfield scan target', reasons: [] },
    project: {
      framework: 'react',
      frameworkVersion: null,
      packageManager: 'npm',
      primaryLanguage: 'javascript',
      hasTypeScript: false,
      hasTailwind: false,
      hasDecantr: false,
      packageName: null,
    },
    routes: { strategy: 'none', count: 0, items: [] },
    components: { pageCount: 0, componentCount: 0, directories: [] },
    styling: {
      approach: 'unknown',
      configFile: null,
      cssVariableCount: 0,
      colorTokenCount: 0,
      darkMode: false,
      themeSignals: [],
    },
    staticHosting: {
      githubPagesLikely: false,
      evidence: [],
      homepageUrl: null,
      basePath: null,
      hashRouting: false,
    },
    assistant: { ruleFiles: [] },
    pagesProbe: null,
    findings: [],
    recommendedCommands: ['npx @decantr/cli scan'],
    privacy: { sourceUploaded: true, persistedByDecantr: false, notes: [] },
  };
}

describe('hosted scan', () => {
  beforeEach(() => {
    mockCreateUnavailableScanReport.mockReset();
    mockProbePublishedSite.mockReset();
    mockResolveGitHubScanInput.mockReset();
    mockScanProject.mockReset();
    mockSpawn.mockReset();

    mockResolveGitHubScanInput.mockReturnValue({
      inputKind: 'github-repo',
      normalizedInput: 'https://github.com/acme/site',
      repository,
      publishedSiteUrl: 'https://acme.github.io/site/',
      warnings: [],
    });
    mockProbePublishedSite.mockResolvedValue(null);
    mockScanProject.mockImplementation(async (projectRoot: string) => sampleScanReport(projectRoot));
    mockCreateUnavailableScanReport.mockImplementation((input) => ({
      ...sampleScanReport('unavailable'),
      applicability: { status: 'unknown', label: 'Scan unavailable', reasons: [input.message] },
      findings: [
        {
          id: 'source-unavailable',
          severity: 'error',
          title: input.title,
          message: input.message,
          evidence: input.evidence ?? [],
        },
      ],
    }));
  });

  it('clones with fixed argv and deletes the temporary checkout', async () => {
    mockSpawn.mockImplementation(() => {
      const child = createGitChild();
      queueMicrotask(() => child.emit('close', 0));
      return child;
    });

    const report = await runHostedScan('https://github.com/acme/site');
    const projectRoot = mockScanProject.mock.calls[0]?.[0] as string;

    expect(report.schemaVersion).toBe('scan-report.v1');
    expect(mockSpawn).toHaveBeenCalledWith(
      'git',
      [
        'clone',
        '--depth',
        '1',
        '--filter=blob:limit=1048576',
        '--single-branch',
        'https://github.com/acme/site.git',
        expect.stringContaining('decantr-hosted-scan-'),
      ],
      expect.objectContaining({ shell: false }),
    );
    expect(existsSync(dirname(projectRoot))).toBe(false);
  });

  it('times out slow clones', async () => {
    const child = createGitChild();
    mockSpawn.mockReturnValue(child);

    await expect(cloneGitHubRepository(repository, '/tmp/decantr-slow-repo', 1)).rejects.toThrow(
      'timed out',
    );
    expect(child.kill).toHaveBeenCalledWith('SIGKILL');
  });

  it('returns an unavailable report and still cleans up when clone fails', async () => {
    mockSpawn.mockImplementation(() => {
      const child = createGitChild();
      queueMicrotask(() => {
        child.stderr.emit('data', Buffer.from('Repository not found'));
        child.emit('close', 128);
      });
      return child;
    });

    const report = await runHostedScan('https://github.com/acme/site');

    expect(mockCreateUnavailableScanReport).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Repository source unavailable',
        message: 'Repository not found',
      }),
    );
    expect(report.findings[0]?.id).toBe('source-unavailable');
    expect(mockScanProject).not.toHaveBeenCalled();
  });

  it('rejects immediately when hosted scan capacity is full', async () => {
    const previousLimit = process.env.DECANTR_HOSTED_SCAN_MAX_CONCURRENT;
    process.env.DECANTR_HOSTED_SCAN_MAX_CONCURRENT = '1';
    const child = createGitChild();
    mockSpawn.mockReturnValue(child);

    try {
      const firstScan = runHostedScan('https://github.com/acme/site');

      await expect(runHostedScan('https://github.com/acme/site')).rejects.toMatchObject({
        name: 'HostedScanCapacityError',
      });

      while (mockSpawn.mock.calls.length === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      child.emit('close', 0);
      await firstScan;
    } finally {
      if (previousLimit === undefined) {
        delete process.env.DECANTR_HOSTED_SCAN_MAX_CONCURRENT;
      } else {
        process.env.DECANTR_HOSTED_SCAN_MAX_CONCURRENT = previousLimit;
      }
    }
  });
});
