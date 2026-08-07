import { createHash, randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { basename, isAbsolute, join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
import { readArgValue } from './cli-arg-lib.mjs';
import { canonicalizePackedTarball } from './canonical-package-tarball.mjs';
import {
  getRepoRoot,
  listPublicPackages,
  loadPackageSurface,
  sortReleaseEntries,
} from './package-surface-lib.mjs';
import {
  scopePnpmAuditReport,
  selectPnpmProjects,
} from './release-vulnerability-audit-lib.mjs';

const require = createRequire(import.meta.url);
const rawArgs = process.argv.slice(2);
const args = new Set(rawArgs);
const includeExperimental = args.has('--include-experimental');
const noTarballs = args.has('--no-tarballs');
const outArg = readArgValue(rawArgs, 'out') ?? 'artifacts/release-evidence';
const onlyWave = readArgValue(rawArgs, 'wave');
const onlyNames = new Set(
  readArgValue(rawArgs, 'only')
    ? readArgValue(rawArgs, 'only')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
    : [],
);

const root = getRepoRoot();
const outDir = isAbsolute(outArg) ? outArg : join(root, outArg);
const surface = loadPackageSurface(root);
const publicPackages = listPublicPackages(root);
const publicByName = new Map(publicPackages.map((pkg) => [pkg.name, pkg]));
const packageVersionByName = new Map(
  publicPackages.map((pkg) => [pkg.name, JSON.parse(readFileSync(join(root, pkg.path, 'package.json'), 'utf8')).version]),
);
const generatedAt = new Date().toISOString();

function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

function safePackageDirName(name) {
  return name.replace(/^@/, '').replace(/\//g, '__');
}

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd: options.cwd ?? root,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 32,
    env: process.env,
  });

  if (options.allowFailure) {
    return result;
  }

  if (result.status !== 0) {
    const stderr = result.stderr ? `\n${result.stderr.trim()}` : '';
    const stdout = result.stdout ? `\n${result.stdout.trim()}` : '';
    throw new Error(`${command} ${commandArgs.join(' ')} failed.${stderr}${stdout}`);
  }

  return result;
}

function readPackageJson(entry) {
  return JSON.parse(readFileSync(join(root, entry.path, 'package.json'), 'utf8'));
}

function packagePurl(name, version) {
  if (name.startsWith('@')) {
    const [scope, unscoped] = name.slice(1).split('/');
    return `pkg:npm/%40${encodeURIComponent(scope)}/${encodeURIComponent(unscoped)}@${encodeURIComponent(version)}`;
  }
  return `pkg:npm/${encodeURIComponent(name)}@${encodeURIComponent(version)}`;
}

function resolveDependencyVersion(pkgDir, depName, spec) {
  if (typeof spec === 'string' && spec.startsWith('workspace:')) {
    return packageVersionByName.get(depName) ?? spec;
  }

  try {
    const packageJsonPath = require.resolve(`${depName}/package.json`, { paths: [pkgDir] });
    return JSON.parse(readFileSync(packageJsonPath, 'utf8')).version ?? spec;
  } catch {
    const fallbackPath = join(root, 'node_modules', depName, 'package.json');
    if (existsSync(fallbackPath)) {
      return JSON.parse(readFileSync(fallbackPath, 'utf8')).version ?? spec;
    }
  }

  return spec;
}

function collectDependencies(pkgJson, pkgDir) {
  const dependencyGroups = {
    dependencies: pkgJson.dependencies ?? {},
    peerDependencies: pkgJson.peerDependencies ?? {},
    optionalDependencies: pkgJson.optionalDependencies ?? {},
  };

  return Object.entries(dependencyGroups).flatMap(([group, dependencies]) =>
    Object.entries(dependencies).map(([name, spec]) => ({
      group,
      name,
      spec,
      resolvedVersion: resolveDependencyVersion(pkgDir, name, spec),
    })),
  );
}

function makeSbom(entry, pkgJson, dependencies) {
  const packageRef = `pkg:${pkgJson.name}@${pkgJson.version}`;
  const components = dependencies.map((dep) => {
    const version = String(dep.resolvedVersion || dep.spec || 'unknown');
    return {
      type: 'library',
      bomRef: `pkg:${dep.name}@${version}`,
      name: dep.name,
      version,
      scope: dep.group === 'dependencies' ? 'required' : 'optional',
      purl: packagePurl(dep.name, version),
      properties: [
        { name: 'decantr:dependencyGroup', value: dep.group },
        { name: 'decantr:declaredSpec', value: String(dep.spec) },
      ],
    };
  });

  return {
    bomFormat: 'CycloneDX',
    specVersion: '1.5',
    serialNumber: `urn:uuid:${randomUUID()}`,
    version: 1,
    metadata: {
      timestamp: generatedAt,
      tools: {
        components: [
          {
            type: 'application',
            name: 'decantr-release-evidence',
            version: '1.0.0',
          },
        ],
      },
      component: {
        type: 'library',
        bomRef: packageRef,
        name: pkgJson.name,
        version: pkgJson.version,
        purl: packagePurl(pkgJson.name, pkgJson.version),
        licenses: [{ license: { id: pkgJson.license ?? 'NOASSERTION' } }],
      },
    },
    components,
    dependencies: [
      {
        ref: packageRef,
        dependsOn: components.map((component) => component.bomRef),
      },
    ],
    properties: [
      { name: 'decantr:packagePath', value: entry.path },
      { name: 'decantr:releaseWave', value: entry.releaseWave },
      { name: 'decantr:surfaceClass', value: entry.surfaceClass },
      { name: 'decantr:maturity', value: entry.maturity },
    ],
  };
}

function sha256File(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function normalizePackOutput(stdout) {
  const parsed = JSON.parse(stdout);
  return Array.isArray(parsed) ? parsed[0] : parsed;
}

function makeProvenanceReference(entry, pkgJson, tarballSha256) {
  return {
    generatedAt,
    package: {
      name: pkgJson.name,
      version: pkgJson.version,
      path: entry.path,
      tarballSha256,
    },
    expectedPublish: {
      command: 'node scripts/publish-packages.mjs',
      distTag: entry.defaultDistTag,
      requiresGithubOidc: true,
      publishesCanonicalTarball: true,
    },
    githubActions: {
      repository: process.env.GITHUB_REPOSITORY ?? null,
      ref: process.env.GITHUB_REF ?? null,
      sha: process.env.GITHUB_SHA ?? null,
      workflow: process.env.GITHUB_WORKFLOW ?? null,
      runId: process.env.GITHUB_RUN_ID ?? null,
      runAttempt: process.env.GITHUB_RUN_ATTEMPT ?? null,
    },
  };
}

function parseJsonOrRaw(result) {
  if (result.status !== 0) {
    return {
      ok: false,
      status: result.status,
      stdout: result.stdout,
      stderr: result.stderr,
    };
  }

  try {
    return {
      ok: true,
      data: JSON.parse(result.stdout),
    };
  } catch {
    return {
      ok: true,
      stdout: result.stdout,
    };
  }
}

function isRetiredPnpmAuditEndpoint(result) {
  const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;
  return (
    result.status !== 0 &&
    output.includes('ERR_PNPM_AUDIT_BAD_RESPONSE') &&
    output.includes('responded with 410') &&
    /bulk advisory endpoint/i.test(output)
  );
}

function isNpmRegistryResolution(resolved) {
  if (!resolved) return false;

  try {
    const url = new URL(resolved);
    return url.protocol === 'https:' && url.hostname === 'registry.npmjs.org' && url.port === '';
  } catch {
    return false;
  }
}

function collectRegistryDependencyVersions(projects) {
  const versionsByName = new Map();
  const visited = new Set();

  function visit(node) {
    if (!node || typeof node !== 'object' || visited.has(node)) return;
    visited.add(node);

    for (const group of ['dependencies', 'devDependencies', 'optionalDependencies']) {
      const dependencies = node[group];
      if (!dependencies || typeof dependencies !== 'object') continue;

      for (const [name, dependency] of Object.entries(dependencies)) {
        if (!dependency || typeof dependency !== 'object') continue;

        const resolved = String(dependency.resolved ?? '');
        const dependencyPath = String(dependency.path ?? '').replaceAll('\\', '/');
        const isRegistryDependency =
          isNpmRegistryResolution(resolved) || dependencyPath.includes('/node_modules/.pnpm/');

        if (isRegistryDependency && typeof dependency.version === 'string') {
          const versions = versionsByName.get(name) ?? new Set();
          versions.add(dependency.version);
          versionsByName.set(name, versions);
        }

        visit(dependency);
      }
    }
  }

  for (const project of projects) visit(project);

  return Object.fromEntries(
    [...versionsByName.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([name, versions]) => [name, [...versions].sort()]),
  );
}

async function runBulkAdvisoryAudit(pnpmAuditResult, selectedPackages) {
  const inventoryResult = run('pnpm', ['list', '--recursive', '--json', '--depth', 'Infinity'], {
    allowFailure: true,
  });
  if (inventoryResult.status !== 0) {
    return {
      ok: false,
      source: 'npm-bulk-advisory',
      error: 'Unable to build the installed dependency inventory for npm bulk advisory audit.',
      pnpmAudit: parseJsonOrRaw(pnpmAuditResult),
      inventory: parseJsonOrRaw(inventoryResult),
    };
  }

  let projects;
  try {
    projects = JSON.parse(inventoryResult.stdout);
  } catch (error) {
    return {
      ok: false,
      source: 'npm-bulk-advisory',
      error: `Unable to parse the installed dependency inventory: ${error instanceof Error ? error.message : String(error)}`,
      pnpmAudit: parseJsonOrRaw(pnpmAuditResult),
    };
  }

  const selectedProjects = selectPnpmProjects(projects, root, selectedPackages);
  if (selectedProjects.length !== selectedPackages.length) {
    return {
      ok: false,
      source: 'npm-bulk-advisory',
      error: `Expected ${selectedPackages.length} selected package inventories, found ${selectedProjects.length}.`,
      pnpmAudit: parseJsonOrRaw(pnpmAuditResult),
    };
  }

  const dependencies = collectRegistryDependencyVersions(selectedProjects);
  if (Object.keys(dependencies).length === 0) {
    return {
      ok: false,
      source: 'npm-bulk-advisory',
      error: 'The installed dependency inventory was empty.',
      pnpmAudit: parseJsonOrRaw(pnpmAuditResult),
    };
  }

  try {
    const response = await fetch('https://registry.npmjs.org/-/npm/v1/security/advisories/bulk', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'user-agent': 'decantr-release-evidence',
      },
      body: JSON.stringify(dependencies),
    });
    const responseText = await response.text();

    if (!response.ok) {
      return {
        ok: false,
        source: 'npm-bulk-advisory',
        error: `npm bulk advisory endpoint responded with ${response.status}.`,
        response: responseText,
        pnpmAudit: parseJsonOrRaw(pnpmAuditResult),
      };
    }

    let advisoriesByPackage;
    try {
      advisoriesByPackage = JSON.parse(responseText);
    } catch (error) {
      return {
        ok: false,
        source: 'npm-bulk-advisory',
        error: `Unable to parse npm bulk advisory response: ${error instanceof Error ? error.message : String(error)}`,
        response: responseText,
        pnpmAudit: parseJsonOrRaw(pnpmAuditResult),
      };
    }

    if (!advisoriesByPackage || typeof advisoriesByPackage !== 'object' || Array.isArray(advisoriesByPackage)) {
      return {
        ok: false,
        source: 'npm-bulk-advisory',
        error: 'npm bulk advisory endpoint returned an unexpected response shape.',
        response: advisoriesByPackage,
        pnpmAudit: parseJsonOrRaw(pnpmAuditResult),
      };
    }

    const advisoryCount = Object.values(advisoriesByPackage).reduce(
      (count, advisories) => count + (Array.isArray(advisories) ? advisories.length : 0),
      0,
    );

    return {
      ok: advisoryCount === 0,
      source: 'npm-bulk-advisory',
      fallbackReason: 'pnpm audit endpoints retired with HTTP 410',
      scope: {
        mode: 'selected-package-inventory',
        selectedPackages: selectedPackages.map(({ name, path }) => ({ name, path })),
        policy: 'Selected package dependency inventories gate publication.',
      },
      dependencyCount: Object.keys(dependencies).length,
      advisoryCount,
      advisories: advisoriesByPackage,
      pnpmAudit: parseJsonOrRaw(pnpmAuditResult),
    };
  } catch (error) {
    return {
      ok: false,
      source: 'npm-bulk-advisory',
      error: `npm bulk advisory request failed: ${error instanceof Error ? error.message : String(error)}`,
      pnpmAudit: parseJsonOrRaw(pnpmAuditResult),
    };
  }
}

function readWorkspacePackages() {
  const result = run('pnpm', ['list', '--recursive', '--json', '--depth', '-1'], {
    allowFailure: true,
  });
  if (result.status !== 0) {
    return {
      ok: false,
      error: 'Unable to enumerate workspace importers for vulnerability-audit scoping.',
      command: parseJsonOrRaw(result),
    };
  }

  try {
    const projects = JSON.parse(result.stdout);
    return {
      ok: true,
      packages: projects.map((project) => ({
        name: project.name ?? null,
        path: relative(root, project.path).replaceAll('\\', '/') || '.',
      })),
    };
  } catch (error) {
    return {
      ok: false,
      error: `Unable to parse workspace importer inventory: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

async function runVulnerabilityAudit(selectedPackages) {
  const workspacePackages = readWorkspacePackages();
  if (!workspacePackages.ok) {
    return {
      ok: false,
      source: 'pnpm-audit-selected-package-importers',
      error: workspacePackages.error,
      workspaceInventory: workspacePackages.command ?? null,
    };
  }

  const pnpmAuditResult = run('pnpm', ['audit', '--json'], { allowFailure: true });
  if (!isRetiredPnpmAuditEndpoint(pnpmAuditResult)) {
    try {
      const report = JSON.parse(pnpmAuditResult.stdout);
      if (!report?.advisories || typeof report.advisories !== 'object' || Array.isArray(report.advisories)) {
        throw new Error('pnpm audit returned an unexpected report shape');
      }

      return {
        ...scopePnpmAuditReport(report, selectedPackages, workspacePackages.packages),
        commandStatus: pnpmAuditResult.status,
      };
    } catch (error) {
      return {
        ok: false,
        source: 'pnpm-audit-selected-package-importers',
        error: `Unable to parse pnpm audit report: ${error instanceof Error ? error.message : String(error)}`,
        pnpmAudit: parseJsonOrRaw(pnpmAuditResult),
      };
    }
  }

  return runBulkAdvisoryAudit(pnpmAuditResult, selectedPackages);
}

async function main() {
  ensureDir(outDir);

  const selected = sortReleaseEntries(surface.packages).filter((entry) => {
    if (!publicByName.has(entry.name)) return false;
    if (!includeExperimental && entry.publish !== true) return false;
    if (onlyWave && entry.releaseWave !== onlyWave) return false;
    if (onlyNames.size > 0 && !onlyNames.has(entry.name)) return false;
    return true;
  });

  if (selected.length === 0) {
    throw new Error('No packages selected for release evidence generation.');
  }

  const auditResult = await runVulnerabilityAudit(selected);
  writeFileSync(join(outDir, 'vulnerability-report.json'), `${JSON.stringify(auditResult, null, 2)}\n`, 'utf8');

  const licenseResult = parseJsonOrRaw(run('pnpm', ['licenses', 'list', '--json'], { allowFailure: true }));
  writeFileSync(join(outDir, 'license-report.json'), `${JSON.stringify(licenseResult, null, 2)}\n`, 'utf8');

  const surfaceSnapshot = {
    generatedAt,
    packageSurface: surface,
    publicPackages,
  };
  writeFileSync(join(outDir, 'package-surface-snapshot.json'), `${JSON.stringify(surfaceSnapshot, null, 2)}\n`, 'utf8');

  const surfaceDiff = run(
    'git',
    ['diff', '--', 'config/package-surface.json', 'docs/reference/package-support-matrix.md', 'packages/*/package.json'],
    { allowFailure: true },
  );
  writeFileSync(join(outDir, 'package-surface-diff.patch'), surfaceDiff.stdout ?? '', 'utf8');

  const packageResults = [];
  for (const entry of selected) {
    const pkgJson = readPackageJson(entry);
    const pkgDir = join(root, entry.path);
    const evidenceDir = join(outDir, safePackageDirName(entry.name));
    const rawTarballDir = join(evidenceDir, 'raw-tarballs');
    const tarballDir = join(evidenceDir, 'tarballs');
    const canonicalWorkDir = join(evidenceDir, 'canonical-work');
    ensureDir(evidenceDir);
    ensureDir(rawTarballDir);
    ensureDir(tarballDir);

    const packResult = run('pnpm', ['--filter', entry.name, 'pack', '--pack-destination', rawTarballDir, '--json']);
    const packOutput = normalizePackOutput(packResult.stdout);
    const rawTarballPath = isAbsolute(packOutput.filename)
      ? packOutput.filename
      : join(root, packOutput.filename);
    const tarballPath = canonicalizePackedTarball(
      rawTarballPath,
      entry.name,
      canonicalWorkDir,
      tarballDir,
    );
    const tarballSha256 = sha256File(tarballPath);
    const tarballName = basename(tarballPath);
    await rm(rawTarballDir, { recursive: true, force: true });
    await rm(canonicalWorkDir, { recursive: true, force: true });

    if (noTarballs) {
      await rm(tarballPath, { force: true });
    }

    const dependencies = collectDependencies(pkgJson, pkgDir);
    const sbom = makeSbom(entry, pkgJson, dependencies);
    const packFiles = {
      generatedAt,
      package: {
        name: pkgJson.name,
        version: pkgJson.version,
        path: entry.path,
      },
      tarball: {
        filename: tarballName,
        sha256: tarballSha256,
      },
      files: (packOutput.files ?? []).map((file) => ({
        path: file.path,
        size: file.size ?? null,
        mode: file.mode ?? null,
      })),
    };
    const packageLicenseReport = {
      generatedAt,
      package: {
        name: pkgJson.name,
        version: pkgJson.version,
        license: pkgJson.license ?? null,
      },
      dependencies,
      rootLicenseReport: relative(evidenceDir, join(outDir, 'license-report.json')),
    };
    const provenanceReference = makeProvenanceReference(entry, pkgJson, tarballSha256);

    writeFileSync(join(evidenceDir, 'sbom.cyclonedx.json'), `${JSON.stringify(sbom, null, 2)}\n`, 'utf8');
    writeFileSync(join(evidenceDir, 'npm-pack-files.json'), `${JSON.stringify(packFiles, null, 2)}\n`, 'utf8');
    writeFileSync(join(evidenceDir, 'tarball.sha256'), `${tarballSha256}  ${tarballName}\n`, 'utf8');
    writeFileSync(join(evidenceDir, 'provenance-reference.json'), `${JSON.stringify(provenanceReference, null, 2)}\n`, 'utf8');
    writeFileSync(join(evidenceDir, 'license-report.json'), `${JSON.stringify(packageLicenseReport, null, 2)}\n`, 'utf8');
    writeFileSync(join(evidenceDir, 'vulnerability-report.json'), `${JSON.stringify({
      generatedAt,
      package: {
        name: pkgJson.name,
        version: pkgJson.version,
      },
      rootAuditReport: relative(evidenceDir, join(outDir, 'vulnerability-report.json')),
      auditOk: auditResult.ok === true,
    }, null, 2)}\n`, 'utf8');

    packageResults.push({
      name: entry.name,
      version: pkgJson.version,
      path: entry.path,
      evidencePath: relative(root, evidenceDir),
      tarball: noTarballs ? null : relative(root, join(tarballDir, tarballName)),
      sha256: tarballSha256,
      fileCount: packFiles.files.length,
    });
  }

  const manifest = {
    generatedAt,
    selectedPackages: packageResults,
    artifacts: {
      vulnerabilityReport: relative(root, join(outDir, 'vulnerability-report.json')),
      licenseReport: relative(root, join(outDir, 'license-report.json')),
      packageSurfaceSnapshot: relative(root, join(outDir, 'package-surface-snapshot.json')),
      packageSurfaceDiff: relative(root, join(outDir, 'package-surface-diff.patch')),
    },
  };

  writeFileSync(join(outDir, 'release-evidence-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  const markdown = [
    '# Release Evidence Manifest',
    '',
    `- Generated at: ${generatedAt}`,
    `- Packages: ${packageResults.length}`,
    `- Vulnerability audit: ${auditResult.ok ? 'ok' : 'failed'}`,
    `- License report: ${licenseResult.ok ? 'ok' : 'failed'}`,
    '',
    '| Package | Version | Files | Tarball SHA-256 |',
    '| --- | --- | ---: | --- |',
    ...packageResults.map((pkg) => `| ${pkg.name} | ${pkg.version} | ${pkg.fileCount} | \`${pkg.sha256}\` |`),
    '',
  ].join('\n');
  writeFileSync(join(outDir, 'release-evidence-manifest.md'), `${markdown}\n`, 'utf8');
  console.log(markdown);

  if (!auditResult.ok) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
