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

export function readNpmRegistry() {
  try {
    return execFileSync('npm', ['config', 'get', 'registry'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch (error) {
    return normalizeNpmCliOutput(error.stdout?.toString?.() ?? '')
      || normalizeNpmCliOutput(error.stderr?.toString?.() ?? '')
      || null;
  }
}

function getPackageScope(packageName) {
  const match = /^(@[^/]+)\//.exec(packageName);
  return match?.[1] ?? null;
}

function getOrgNameFromScope(scope) {
  return scope?.replace(/^@/, '') ?? null;
}

function parseAccessValue(value) {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    for (const key of ['access', 'permission', 'permissions']) {
      if (typeof value[key] === 'string') return value[key];
    }
  }
  return null;
}

function getRoleValue(value) {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    for (const key of ['role', 'access', 'permission']) {
      if (typeof value[key] === 'string') return value[key];
    }
  }
  return null;
}

function readNpmOrgPackageCreationAccess(scope) {
  const orgName = getOrgNameFromScope(scope);
  if (!orgName) {
    return {
      canCreate: false,
      role: null,
      error: 'package is not scoped to an npm organization',
    };
  }

  const auth = readNpmAuthState();
  if (!auth.authenticated || !auth.username) {
    return {
      canCreate: false,
      role: null,
      error: auth.error ?? 'npm authentication is required to inspect org access',
    };
  }

  try {
    const stdout = execFileSync('npm', ['org', 'ls', orgName, '--json'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
    const parsed = stdout ? JSON.parse(stdout) : {};
    const role = getRoleValue(parsed[auth.username]);
    const canCreate = typeof role === 'string' && /^(owner|admin)$/i.test(role);

    return {
      canCreate,
      role,
      error: canCreate ? null : `current npm identity is ${role ?? 'not listed'} in the ${orgName} npm org`,
    };
  } catch (error) {
    const stdout = normalizeNpmCliOutput(error.stdout?.toString?.() ?? '');
    const stderr = normalizeNpmCliOutput(error.stderr?.toString?.() ?? '');
    const combined = stdout || stderr || error.message || 'unknown npm org access failure';

    return {
      canCreate: false,
      role: null,
      error: combined,
    };
  }
}

export function readNpmPackageAccess(packageName) {
  const scope = getPackageScope(packageName);
  if (!scope) {
    return {
      packageName,
      scope: null,
      canPublish: true,
      access: 'unscoped',
      error: null,
    };
  }

  try {
    const stdout = execFileSync('npm', ['access', 'list', 'packages', scope, packageName, '--json'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
    const parsed = stdout ? JSON.parse(stdout) : {};
    const access = parseAccessValue(parsed[packageName] ?? parsed);
    const canPublish = typeof access === 'string' && /\b(write|read-write)\b/i.test(access);

    if (!canPublish && !parsed[packageName]) {
      const orgCreationAccess = readNpmOrgPackageCreationAccess(scope);
      if (orgCreationAccess.canCreate) {
        return {
          packageName,
          scope,
          canPublish: true,
          access: `scope-${orgCreationAccess.role}-first-publish`,
          error: null,
        };
      }
    }

    return {
      packageName,
      scope,
      canPublish,
      access,
      error: canPublish ? null : `current npm identity has ${access ?? 'no'} write access to ${packageName}`,
    };
  } catch (error) {
    const stdout = normalizeNpmCliOutput(error.stdout?.toString?.() ?? '');
    const stderr = normalizeNpmCliOutput(error.stderr?.toString?.() ?? '');
    const combined = stdout || stderr || error.message || 'unknown npm access failure';

    return {
      packageName,
      scope,
      canPublish: false,
      access: null,
      error: combined,
    };
  }
}

export function assertNpmPackageWriteAccess(packageName) {
  const access = readNpmPackageAccess(packageName);

  if (!access.canPublish) {
    throw new Error(
      [
        `The current npm identity cannot publish ${packageName}.`,
        `npm returned: ${access.error ?? 'no write access'}`,
        'Ask an npm org owner to grant this account or automation token read-write access for the @decantr scope/package, then rerun the publish wrapper.',
      ].join('\n'),
    );
  }

  return access;
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
