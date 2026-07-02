import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getRepoRoot, loadPackageSurface, sortReleaseEntries } from './package-surface-lib.mjs';

const REQUIRED_RUNTIME_FIELDS = new Set([
  'name',
  'path',
  'runtimeKind',
  'ships',
  'filesystem',
  'network',
  'process',
  'telemetry',
  'hostedUpload',
  'localArtifacts',
  'scannerNotes',
]);

const INSTALL_LIFECYCLE_SCRIPTS = new Set(['preinstall', 'install', 'postinstall', 'prepare']);

export function getPackagePermissionsPath(root = getRepoRoot()) {
  return join(root, 'config', 'package-permissions.json');
}

export function getSecurityPermissionsDocPath(root = getRepoRoot()) {
  return join(root, 'docs', 'reference', 'security-permissions.md');
}

export function loadPackagePermissions(root = getRepoRoot()) {
  return JSON.parse(readFileSync(getPackagePermissionsPath(root), 'utf8'));
}

export function collectNpmPackSurfaces(root = getRepoRoot(), entries = loadPackageSurface(root).packages) {
  const surfaces = [];
  const findings = [];

  for (const entry of sortReleaseEntries(entries)) {
    const packageDir = join(root, entry.path);
    const packageJsonPath = join(packageDir, 'package.json');
    if (!existsSync(packageJsonPath)) {
      findings.push(`Package ${entry.name} has no package.json at ${entry.path}.`);
      continue;
    }

    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    const packResult = spawnSync('npm', ['pack', '--dry-run', '--json'], {
      cwd: packageDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    if (packResult.status !== 0) {
      findings.push(
        `npm pack dry-run failed for ${entry.name}: ${packResult.stderr || packResult.stdout}`,
      );
      continue;
    }

    let packJson;
    try {
      packJson = JSON.parse(packResult.stdout);
    } catch {
      findings.push(`npm pack dry-run did not return JSON for ${entry.name}.`);
      continue;
    }

    const pack = Array.isArray(packJson) ? packJson[0] : null;
    if (!pack || typeof pack !== 'object') {
      findings.push(`npm pack dry-run returned an unexpected shape for ${entry.name}.`);
      continue;
    }

    const lifecycleScripts = Object.entries(packageJson.scripts ?? {})
      .filter(([name]) => INSTALL_LIFECYCLE_SCRIPTS.has(name))
      .map(([name, command]) => ({ name, command }));

    const filePaths = (pack.files ?? []).map((file) => file.path).sort();
    for (const path of filePaths) {
      if (path.startsWith('../') || path.includes('/../')) {
        findings.push(`Package ${entry.name} npm pack includes an escaping path: ${path}`);
      }
    }

    if (lifecycleScripts.length > 0) {
      findings.push(
        `Package ${entry.name} has install-time lifecycle scripts: ${lifecycleScripts
          .map((script) => script.name)
          .join(', ')}`,
      );
    }

    surfaces.push({
      name: entry.name,
      path: entry.path,
      version: packageJson.version,
      bin: packageJson.bin ?? null,
      filesAllowlist: packageJson.files ?? [],
      dependencies: Object.keys(packageJson.dependencies ?? {}).sort(),
      optionalDependencies: Object.keys(packageJson.optionalDependencies ?? {}).sort(),
      peerDependencies: Object.keys(packageJson.peerDependencies ?? {}).sort(),
      lifecycleScripts,
      npmPack: {
        filename: pack.filename,
        size: pack.size,
        unpackedSize: pack.unpackedSize,
        entryCount: pack.entryCount,
        files: filePaths,
      },
    });
  }

  return { surfaces, findings };
}

export function validatePackagePermissions(permissions, surface, packSurfaces = []) {
  const findings = [];
  if (!permissions || typeof permissions !== 'object') {
    return ['config/package-permissions.json must be an object.'];
  }
  if (permissions.version !== 1) {
    findings.push('Package permissions manifest version must be 1.');
  }
  if (!Array.isArray(permissions.packages)) {
    findings.push('Package permissions manifest must include packages array.');
    return findings;
  }

  const surfaceByName = new Map(surface.packages.map((entry) => [entry.name, entry]));
  const permissionsByName = new Map();

  for (const entry of permissions.packages) {
    if (!entry || typeof entry !== 'object') {
      findings.push('Package permissions entries must be objects.');
      continue;
    }
    for (const field of REQUIRED_RUNTIME_FIELDS) {
      if (!(field in entry)) {
        findings.push(`Package permissions entry ${entry.name ?? '<unknown>'} is missing ${field}.`);
      }
    }
    if (permissionsByName.has(entry.name)) {
      findings.push(`Package permissions manifest contains duplicate package: ${entry.name}`);
    }
    permissionsByName.set(entry.name, entry);

    const surfaceEntry = surfaceByName.get(entry.name);
    if (!surfaceEntry) {
      findings.push(`Package permissions manifest includes ${entry.name} outside package surface.`);
      continue;
    }
    if (entry.path !== surfaceEntry.path) {
      findings.push(
        `Package permissions path mismatch for ${entry.name}: expected ${surfaceEntry.path}, found ${entry.path}`,
      );
    }

    if (!Array.isArray(entry.ships) || entry.ships.length === 0) {
      findings.push(`Package permissions entry ${entry.name} must declare shipped surface.`);
    }
    if (!Array.isArray(entry.filesystem?.read)) {
      findings.push(`Package permissions entry ${entry.name} filesystem.read must be an array.`);
    }
    if (!Array.isArray(entry.filesystem?.write)) {
      findings.push(`Package permissions entry ${entry.name} filesystem.write must be an array.`);
    }
    if (!Array.isArray(entry.filesystem?.delete)) {
      findings.push(`Package permissions entry ${entry.name} filesystem.delete must be an array.`);
    }
    if (!Array.isArray(entry.process?.spawn)) {
      findings.push(`Package permissions entry ${entry.name} process.spawn must be an array.`);
    }
    if (!Array.isArray(entry.network?.outbound)) {
      findings.push(`Package permissions entry ${entry.name} network.outbound must be an array.`);
    }
    if (typeof entry.network?.inbound !== 'boolean') {
      findings.push(`Package permissions entry ${entry.name} network.inbound must be boolean.`);
    }
  }

  for (const entry of surface.packages) {
    if (!permissionsByName.has(entry.name)) {
      findings.push(`Package permissions manifest is missing ${entry.name}.`);
    }
  }

  const packByName = new Map(packSurfaces.map((entry) => [entry.name, entry]));
  for (const entry of permissions.packages) {
    const pack = packByName.get(entry.name);
    if (!pack) continue;
    for (const shipped of entry.ships) {
      if (shipped === 'README.md' || shipped === 'package.json') {
        if (!pack.npmPack.files.includes(shipped)) {
          findings.push(`${entry.name} declares ${shipped} as shipped but npm pack omits it.`);
        }
        continue;
      }
      const hasPrefix = pack.npmPack.files.some(
        (filePath) => filePath === shipped || filePath.startsWith(`${shipped}/`),
      );
      if (!hasPrefix) {
        findings.push(`${entry.name} declares shipped surface ${shipped} but npm pack omits it.`);
      }
    }
  }

  return findings;
}

export function renderSecurityPermissionsMarkdown(permissions, surface) {
  const sorted = sortReleaseEntries(
    permissions.packages.map((entry) => ({
      ...entry,
      releaseWave: surface.packages.find((pkg) => pkg.name === entry.name)?.releaseWave ?? 'experimental',
      publishOrder: surface.packages.find((pkg) => pkg.name === entry.name)?.publishOrder ?? 999,
    })),
  );

  const lines = [
    '# Decantr Security And Permissions',
    '',
    'Generated from `config/package-permissions.json`.',
    'Do not edit manually. Run `node scripts/sync-security-permissions.mjs` after permission-surface changes.',
    '',
    'This page describes the installed npm package surface, not every internal script, showcase app, fixture, or release helper in the monorepo. Static scanners that inspect the full repository can therefore report scary findings that do not ship in the packages users install.',
    '',
    '## Quick Answers',
    '',
    '- Decantr does not collect telemetry by default. CLI telemetry requires explicit opt-in through `--telemetry`, `decantr telemetry link --enable`, or `.decantr/project.json` with `telemetry: true`.',
    '- Decantr browser evidence and screenshots are local artifacts under `.decantr/evidence/*`; the active Decantr 3.8 API does not accept source or screenshot uploads.',
    '- MCP write tools are explicitly annotated and are contained to the active workspace root.',
    '- Hosted critique/audit source upload fallbacks are retired in the active API. Compatibility flags such as `allow_hosted_upload` do not activate removed routes.',
    '- Published packages use package `files` allowlists and the release audit runs `npm pack --dry-run --json` to prove what ships.',
    '',
    '## Package Permission Matrix',
    '',
    '| Package | Runtime | Filesystem | Network | Process | Telemetry | Hosted Upload | Local Artifacts | Ships |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...sorted.map((entry) => {
      const fs = [
        summarizeList('read', entry.filesystem.read),
        summarizeList('write', entry.filesystem.write),
        summarizeList('delete', entry.filesystem.delete),
      ].join('<br>');
      const network = [
        entry.network.outbound.length > 0 ? `outbound: ${entry.network.outbound.join('; ')}` : 'outbound: none',
        `inbound: ${entry.network.inbound ? 'yes' : 'no'}`,
      ].join('<br>');
      const process =
        entry.process.spawn.length > 0 ? entry.process.spawn.join('; ') : 'none';
      const localArtifacts =
        entry.localArtifacts.length > 0 ? entry.localArtifacts.join('; ') : 'none';
      return `| \`${escapeMarkdownCell(entry.name)}\` | ${escapeMarkdownCell(entry.runtimeKind)} | ${escapeMarkdownCell(fs)} | ${escapeMarkdownCell(network)} | ${escapeMarkdownCell(process)} | ${escapeMarkdownCell(entry.telemetry)} | ${escapeMarkdownCell(entry.hostedUpload)} | ${escapeMarkdownCell(localArtifacts)} | ${escapeMarkdownCell(entry.ships.join(', '))} |`;
    }),
    '',
    '## Scanner Notes',
    '',
    ...sorted.flatMap((entry) => [
      `### \`${entry.name}\``,
      '',
      ...(entry.scannerNotes.length > 0
        ? entry.scannerNotes.map((note) => `- ${note}`)
        : ['- No package-specific scanner note.']),
      '',
    ]),
    '## Release Checks',
    '',
    'The normal package-surface audit now verifies both the support matrix and the permission surface:',
    '',
    '```bash',
    'pnpm audit:package-surface',
    '```',
    '',
    'For permission-only work, run:',
    '',
    '```bash',
    'pnpm audit:package-permissions',
    '```',
    '',
    'The audit checks every public package in `config/package-surface.json`, validates that the permissions manifest covers it, runs `npm pack --dry-run --json`, rejects install-time lifecycle scripts, and compares this generated document against the checked-in copy.',
    '',
  ];

  return `${lines.join('\n')}`;
}

function summarizeList(label, entries) {
  return entries.length > 0 ? `${label}: ${entries.join('; ')}` : `${label}: none`;
}

function escapeMarkdownCell(value) {
  let escaped = '';
  for (const char of String(value ?? '-')) {
    if (char === '\\') escaped += '\\\\';
    else if (char === '|') escaped += '\\|';
    else if (char === '\n' || char === '\r') escaped += ' ';
    else escaped += char;
  }
  return escaped;
}
