import { execFileSync } from 'node:child_process';

function normalizeNpmCliOutput(value) {
  return value
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line) => !/^npm warn Unknown env config\b/i.test(line))
    .filter(Boolean)
    .join('\n')
    .trim();
}

export function readNpmAuthState() {
  try {
    const username = execFileSync('npm', ['whoami'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
    return {
      authenticated: true,
      username: username || null,
      error: null,
    };
  } catch (error) {
    const stdout = normalizeNpmCliOutput(error.stdout?.toString?.() ?? '');
    const stderr = normalizeNpmCliOutput(error.stderr?.toString?.() ?? '');
    const combined = stdout || stderr || error.message || 'unknown npm auth failure';
    return {
      authenticated: false,
      username: null,
      error: combined,
    };
  }
}

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
    const stdout = normalizeNpmCliOutput(error.stdout?.toString?.() ?? '');
    const stderr = normalizeNpmCliOutput(error.stderr?.toString?.() ?? '');
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

export function isPrereleaseLike(version) {
  return typeof version === 'string' && /^\d+\.\d+\.\d+-.+/.test(version);
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
    const stdout = normalizeNpmCliOutput(error.stdout?.toString?.() ?? '');
    const stderr = normalizeNpmCliOutput(error.stderr?.toString?.() ?? '');
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

function readPublishedDependencyField(packageName, version, field) {
  try {
    const stdout = execFileSync('npm', ['view', `${packageName}@${version}`, field, '--json'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();

    if (!stdout) {
      return {};
    }

    const parsed = JSON.parse(stdout);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function findLatestStableVersion(versions) {
  return [...versions]
    .filter((version) => typeof version === 'string' && !isPrereleaseLike(version))
    .at(-1) ?? null;
}

export function planNpmSurfaceRepairs(surface) {
  const results = [];

  for (const entry of surface.packages) {
    if (entry.publish !== true) continue;

    const npmState = readNpmDistTags(entry.name);
    const npmVersions = readNpmVersions(entry.name);
    const tagKeys = Object.keys(npmState.tags ?? {});
    const extraTags = tagKeys.filter((tag) => !new Set(['latest', 'next']).has(tag));
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
      if (entry.defaultDistTag === 'next' && isPrereleaseLike(npmState.tags.latest)) {
        actions.push({
          type: 'add-dist-tag',
          tag: 'next',
          version: npmState.tags.latest,
        });
      }
    }

    if (entry.maturity === 'stable' && npmState.tags.latest && isPrereleaseLike(npmState.tags.latest)) {
      findings.push(`prerelease version on latest (${npmState.tags.latest})`);
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

    const latestVersion = npmState.tags.latest;
    if (typeof latestVersion === 'string' && latestVersion.length > 0) {
      const publishedDependencies = readPublishedDependencyField(entry.name, latestVersion, 'dependencies');
      const publishedPeerDependencies = readPublishedDependencyField(entry.name, latestVersion, 'peerDependencies');

      for (const [dependencyName, dependencyVersion] of Object.entries({
        ...publishedDependencies,
        ...publishedPeerDependencies,
      })) {
        if (typeof dependencyVersion === 'string' && dependencyVersion.startsWith('workspace:')) {
          findings.push(`workspace protocol leaked in published manifest (${dependencyName}=${dependencyVersion})`);
        }
      }
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
