import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  createUnavailableScanReport,
  probePublishedSite,
  resolveGitHubScanInput,
  scanProject,
  type PublishedSiteProbeV1,
  type ScanRepositoryV1,
  type ScanReportV1,
} from '@decantr/verifier';

const HOSTED_SCAN_CLONE_TIMEOUT_MS = 15_000;
const MAX_GIT_STDERR_BYTES = 4096;
const DEFAULT_HOSTED_SCAN_MAX_CONCURRENT = 3;

let activeHostedScans = 0;

export class HostedScanCapacityError extends Error {
  constructor() {
    super('Hosted scan capacity is currently full. Please try again in a moment.');
    this.name = 'HostedScanCapacityError';
  }
}

function cloneUrlForRepository(repository: ScanRepositoryV1): string {
  return `${repository.url}.git`;
}

function hostedScanConcurrencyLimit(): number {
  const raw = process.env.DECANTR_HOSTED_SCAN_MAX_CONCURRENT;
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_HOSTED_SCAN_MAX_CONCURRENT;
}

function acquireHostedScanSlot(): () => void {
  if (activeHostedScans >= hostedScanConcurrencyLimit()) {
    throw new HostedScanCapacityError();
  }

  activeHostedScans += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    activeHostedScans = Math.max(0, activeHostedScans - 1);
  };
}

export function cloneGitHubRepository(
  repository: ScanRepositoryV1,
  targetDir: string,
  timeoutMs = HOSTED_SCAN_CLONE_TIMEOUT_MS,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      'git',
      [
        'clone',
        '--depth',
        '1',
        '--filter=blob:limit=1048576',
        '--single-branch',
        cloneUrlForRepository(repository),
        targetDir,
      ],
      {
        shell: false,
        stdio: ['ignore', 'ignore', 'pipe'],
      },
    );
    let stderr = '';
    const timeout = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error('GitHub repository clone timed out.'));
    }, timeoutMs);

    child.stderr?.on('data', (chunk: Buffer) => {
      if (stderr.length < MAX_GIT_STDERR_BYTES) {
        stderr += chunk.toString('utf-8');
      }
    });

    child.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    child.on('close', (code) => {
      clearTimeout(timeout);
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(stderr.trim() || `git clone exited with code ${code ?? 'unknown'}`));
    });
  });
}

export async function runHostedScan(rawUrl: string): Promise<ScanReportV1> {
  const resolution = resolveGitHubScanInput(rawUrl);
  const releaseSlot = acquireHostedScanSlot();
  let tempRoot: string | null = null;
  let pagesProbePromise: Promise<PublishedSiteProbeV1 | null> = Promise.resolve(null);
  const scanInput = {
    kind: resolution.inputKind,
    value: resolution.normalizedInput,
  } as const;

  try {
    tempRoot = await mkdtemp(join(tmpdir(), 'decantr-hosted-scan-'));
    const repoRoot = join(tempRoot, 'repo');
    pagesProbePromise = resolution.publishedSiteUrl
      ? probePublishedSite(resolution.publishedSiteUrl)
      : Promise.resolve(null);

    await cloneGitHubRepository(resolution.repository, repoRoot);
    const pagesProbe = await pagesProbePromise;
    const report = await scanProject(repoRoot, {
      input: scanInput,
      repository: resolution.repository,
      publishedSiteUrl: resolution.publishedSiteUrl,
      pagesProbe,
    });
    if (resolution.warnings.length > 0) {
      report.findings.unshift(
        ...resolution.warnings.map((warning, index) => ({
          id: `input-normalized-${index + 1}`,
          severity: 'info' as const,
          title: 'Input normalized',
          message: warning,
          evidence: [resolution.normalizedInput],
        })),
      );
    }
    return report;
  } catch (error) {
    const pagesProbe = await pagesProbePromise.catch(() => null);
    return createUnavailableScanReport({
      scanInput,
      repository: resolution.repository,
      publishedSiteUrl: resolution.publishedSiteUrl,
      pagesProbe,
      title: 'Repository source unavailable',
      message:
        error instanceof Error
          ? error.message
          : 'Decantr could not clone the public GitHub repository.',
      evidence: [resolution.repository.url],
    });
  } finally {
    try {
      if (tempRoot) {
        await rm(tempRoot, { recursive: true, force: true });
      }
    } finally {
      releaseSlot();
    }
  }
}
