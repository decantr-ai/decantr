import {
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { create, extract } from 'tar';

const CANONICAL_MTIME = new Date('1985-10-26T08:15:00.000Z');

function compareCodePoints(left, right) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function sortJson(value) {
  if (Array.isArray(value)) return value.map(sortJson);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort(compareCodePoints)
        .map((key) => [key, sortJson(value[key])]),
    );
  }
  return value;
}

function listArchiveEntries(root, parent = '') {
  const entries = [];
  const directory = parent ? join(root, ...parent.split('/')) : root;
  const names = readdirSync(directory).sort(compareCodePoints);

  for (const name of names) {
    const relativePath = parent ? `${parent}/${name}` : name;
    const absolutePath = join(root, ...relativePath.split('/'));
    const stat = lstatSync(absolutePath);
    entries.push(relativePath.startsWith('@') ? `./${relativePath}` : relativePath);
    if (stat.isDirectory()) entries.push(...listArchiveEntries(root, relativePath));
  }

  return entries;
}

function packageTarballName(packageName, version) {
  const normalizedName = packageName.replace(/^@/u, '').replaceAll('/', '-');
  return `${normalizedName}-${version}.tgz`;
}

export function canonicalizePackedTarball(
  rawTarball,
  expectedPackageName,
  candidateRoot,
  tarballDirectory,
) {
  const packageKey = expectedPackageName.replace(/^@/u, '').replaceAll('/', '-');
  const sourceRoot = resolve(candidateRoot, 'canonical-sources', packageKey);
  rmSync(sourceRoot, { recursive: true, force: true });
  mkdirSync(sourceRoot, { recursive: true });

  extract({
    cwd: sourceRoot,
    file: resolve(rawTarball),
    preservePaths: false,
    strict: true,
    sync: true,
  });

  const roots = readdirSync(sourceRoot).sort(compareCodePoints);
  if (roots.length !== 1 || roots[0] !== 'package') {
    throw new Error(
      `Packed snapshot for ${expectedPackageName} must contain only the package/ root.`,
    );
  }

  const packageRoot = join(sourceRoot, 'package');
  if (!lstatSync(packageRoot).isDirectory()) {
    throw new Error(`Packed snapshot for ${expectedPackageName} has no package directory.`);
  }

  const manifestPath = join(packageRoot, 'package.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  if (manifest.name !== expectedPackageName) {
    throw new Error(
      `Packed snapshot identity mismatch: expected ${expectedPackageName}, found ${manifest.name ?? 'none'}.`,
    );
  }
  if (typeof manifest.version !== 'string' || manifest.version.length === 0) {
    throw new Error(`Packed snapshot for ${expectedPackageName} has no version.`);
  }
  writeFileSync(manifestPath, `${JSON.stringify(sortJson(manifest), null, 2)}\n`, 'utf8');

  mkdirSync(tarballDirectory, { recursive: true });
  const target = resolve(
    tarballDirectory,
    packageTarballName(expectedPackageName, manifest.version),
  );
  rmSync(target, { force: true });

  const entries = listArchiveEntries(packageRoot);
  if (entries.length === 0) {
    throw new Error(`Packed snapshot for ${expectedPackageName} is empty.`);
  }
  create(
    {
      cwd: packageRoot,
      file: target,
      follow: false,
      gzip: { level: 9, portable: true },
      jobs: 1,
      mtime: CANONICAL_MTIME,
      noDirRecurse: true,
      portable: true,
      prefix: 'package/',
      strict: true,
      sync: true,
    },
    entries,
  );

  return target;
}
