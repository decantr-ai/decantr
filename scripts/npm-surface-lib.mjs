import { execFileSync } from 'node:child_process';

export function readNpmDistTags(packageName) {
  try {
    const stdout = execFileSync('npm', ['view', packageName, 'dist-tags', '--json'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return {
      published: true,
      tags: JSON.parse(stdout),
      error: null,
    };
  } catch (error) {
    const stdout = error.stdout?.toString?.() ?? '';
    const stderr = error.stderr?.toString?.() ?? '';
    const combined = stdout || stderr;

    try {
      const parsed = combined ? JSON.parse(combined) : null;
      if (parsed?.error?.code === 'E404') {
        return {
          published: false,
          tags: {},
          error: 'unpublished',
        };
      }
    } catch {
      // fall through to generic error handling
    }

    return {
      published: false,
      tags: {},
      error: combined.trim() || (error.message ?? 'unknown npm view failure'),
    };
  }
}

export function isBetaLike(version) {
  return typeof version === 'string' && /beta|alpha|rc/i.test(version);
}

export function readNpmVersions(packageName) {
  try {
    const stdout = execFileSync('npm', ['view', packageName, 'versions', '--json'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const parsed = JSON.parse(stdout);
    const versions = Array.isArray(parsed) ? parsed : [parsed].filter(Boolean);
    return {
      published: true,
      versions,
      error: null,
    };
  } catch (error) {
    const stdout = error.stdout?.toString?.() ?? '';
    const stderr = error.stderr?.toString?.() ?? '';
    const combined = stdout || stderr;

    try {
      const parsed = combined ? JSON.parse(combined) : null;
      if (parsed?.error?.code === 'E404') {
        return {
          published: false,
          versions: [],
          error: 'unpublished',
        };
      }
    } catch {
      // fall through to generic error handling
    }

    return {
      published: false,
      versions: [],
      error: combined.trim() || (error.message ?? 'unknown npm versions failure'),
    };
  }
}

export function findLatestStableVersion(versions) {
  return [...versions]
    .filter((version) => typeof version === 'string' && !isBetaLike(version))
    .at(-1) ?? null;
}

export function planNpmSurfaceRepairs(surface) {
  const results = [];

  for (const entry of surface.packages) {
    if (entry.publish !== true) continue;

    const npmState = readNpmDistTags(entry.name);
    const npmVersions = readNpmVersions(entry.name);
    const tagKeys = Object.keys(npmState.tags ?? {});
    const extraTags = tagKeys.filter((tag) => !new Set(['latest', 'beta']).has(tag));
    const actions = [];
    const findings = [];
    const stableFallbackVersion = findLatestStableVersion(npmVersions.versions ?? []);

    if (!npmState.published) {
      findings.push('unpublished');
      results.push({
        name: entry.name,
        maturity: entry.maturity,
        expectedTag: entry.defaultDistTag,
        published: false,
        tags: {},
        versions: [],
        stableFallbackVersion: null,
        findings,
        actions,
        npmError: npmState.error,
      });
      continue;
    }

    if (!npmState.tags[entry.defaultDistTag]) {
      findings.push(`missing expected ${entry.defaultDistTag} dist-tag`);
      if (entry.defaultDistTag === 'beta' && isBetaLike(npmState.tags.latest)) {
        actions.push({
          type: 'add-dist-tag',
          tag: 'beta',
          version: npmState.tags.latest,
        });
      }
    }

    if (entry.maturity !== 'stable' && npmState.tags.latest && isBetaLike(npmState.tags.latest)) {
      findings.push(`beta version on latest (${npmState.tags.latest})`);
      actions.push({
        type: 'manual-latest-retag',
        tag: 'latest',
        version: npmState.tags.latest,
        recommendedVersion: stableFallbackVersion,
      });
    }

    for (const tag of extraTags) {
      findings.push(`unexpected dist-tag ${tag}`);
      actions.push({
        type: 'remove-dist-tag',
        tag,
      });
    }

    results.push({
      name: entry.name,
      maturity: entry.maturity,
      expectedTag: entry.defaultDistTag,
      published: true,
      tags: npmState.tags,
      versions: npmVersions.versions ?? [],
      stableFallbackVersion,
      findings,
      actions,
      npmError: null,
    });
  }

  return results;
}
