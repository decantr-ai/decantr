import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';

const hash = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');
const json = (path) => JSON.parse(readFileSync(path, 'utf8'));
const normalized = (path) => path.replaceAll('\\', '/');
const runtimeFile = (path) => /\.[cm]?js$/u.test(path);
function contained(root, path) {
  const rel = relative(root, path);
  return (
    rel !== '..' &&
    !rel.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`) &&
    !isAbsolute(rel)
  );
}
function files(root) {
  return readdirSync(root).flatMap((name) => {
    const path = join(root, name);
    const stat = lstatSync(path);
    if (stat.isSymbolicLink()) throw new Error('Symlinked bundle outputs are unsupported.');
    return stat.isDirectory() ? files(path) : [path];
  });
}
function owner(path) {
  let dir = dirname(path);
  while (true) {
    const manifest = join(dir, 'package.json');
    if (existsSync(manifest)) {
      const pkg = json(manifest);
      if (typeof pkg.name === 'string' && typeof pkg.version === 'string')
        return { dir, manifest: pkg };
    }
    const parent = dirname(dir);
    if (parent === dir) throw new Error(`Cannot identify bundled input package: ${path}`);
    dir = parent;
  }
}

// Build evidence: compiler contribution metadata plus hashes of the final files.
// This is an inventory of included code, not a reachability or vulnerability verdict.
export function createBundledDependencyInventory({ packageDir, repoRoot, metafile }) {
  if (!metafile?.outputs) throw new Error('Bundled inventory requires esbuild output metadata.');
  const manifest = json(join(packageDir, 'package.json'));
  const components = new Map();
  const outputs = [];
  for (const [output, detail] of Object.entries(metafile.outputs)) {
    if (!runtimeFile(output)) continue;
    const absolute = resolve(packageDir, output);
    if (!contained(join(packageDir, 'dist'), absolute))
      throw new Error('Bundle output is outside dist.');
    outputs.push({ file: normalized(relative(packageDir, absolute)), sha256: hash(absolute) });
    for (const [input, contribution] of Object.entries(detail.inputs ?? {})) {
      if (!(contribution.bytesInOutput > 0)) continue;
      const absoluteInput = resolve(packageDir, input);
      const dependency = owner(absoluteInput);
      if (resolve(dependency.dir) === resolve(packageDir)) continue;
      const { name, version } = dependency.manifest;
      if (typeof name !== 'string' || typeof version !== 'string')
        throw new Error('Unidentified bundled dependency.');
      const key = `${name}@${version}`;
      const component = components.get(key) ?? {
        name,
        version,
        inputFiles: new Set(),
        attributedBytes: 0,
      };
      component.inputFiles.add(normalized(relative(dependency.dir, absoluteInput)));
      component.attributedBytes += contribution.bytesInOutput;
      components.set(key, component);
    }
  }
  if (!outputs.length) throw new Error('No runtime bundle outputs were inventoried.');
  return {
    schemaVersion: 'decantr-bundled-dependencies.v1',
    package: { name: manifest.name, version: manifest.version },
    packageManifestSha256: hash(join(packageDir, 'package.json')),
    lockfileSha256: hash(join(repoRoot, 'pnpm-lock.yaml')),
    outputs: outputs.sort((a, b) => a.file.localeCompare(b.file)),
    components: [...components.values()]
      .map((c) => ({ ...c, inputFiles: [...c.inputFiles].sort() }))
      .sort((a, b) => `${a.name}@${a.version}`.localeCompare(`${b.name}@${b.version}`)),
    limitations: [
      'Compiler-attributed bytes are estimates; included code is not proof of runtime reachability. External runtime dependencies remain separate.',
    ],
  };
}

export function readBundledDependencyInventory(repoRoot, entry, inventories) {
  const configured = inventories[entry.name];
  if (!configured) return null;
  const packageDir = resolve(repoRoot, entry.path);
  const path = resolve(packageDir, configured);
  if (!contained(packageDir, path))
    throw new Error('Bundled inventory path is outside its package.');
  if (!existsSync(path))
    throw new Error(`Missing bundled inventory for ${entry.name}; rebuild packages.`);
  const inventory = json(path);
  const manifest = json(join(packageDir, 'package.json'));
  if (
    inventory.schemaVersion !== 'decantr-bundled-dependencies.v1' ||
    inventory.package?.name !== manifest.name ||
    inventory.package?.version !== manifest.version ||
    inventory.packageManifestSha256 !== hash(join(packageDir, 'package.json')) ||
    inventory.lockfileSha256 !== hash(join(repoRoot, 'pnpm-lock.yaml')) ||
    !Array.isArray(inventory.outputs) ||
    !inventory.outputs.length ||
    !Array.isArray(inventory.components)
  ) {
    throw new Error(`Invalid or stale bundled inventory for ${entry.name}; rebuild packages.`);
  }
  const expected = files(join(packageDir, 'dist'))
    .filter(runtimeFile)
    .map((file) => normalized(relative(packageDir, file)))
    .sort();
  const actual = inventory.outputs.map((output) => output.file).sort();
  if (JSON.stringify(expected) !== JSON.stringify(actual))
    throw new Error(`Bundle output set changed for ${entry.name}; rebuild packages.`);
  for (const output of inventory.outputs) {
    const file = resolve(packageDir, output.file);
    if (!contained(join(packageDir, 'dist'), file) || hash(file) !== output.sha256) {
      throw new Error(`Bundle output hash mismatch for ${entry.name}; rebuild packages.`);
    }
  }
  const keys = new Set();
  for (const component of inventory.components) {
    const key = `${component.name}@${component.version}`;
    if (
      typeof component.name !== 'string' ||
      typeof component.version !== 'string' ||
      !component.name ||
      !component.version ||
      keys.has(key) ||
      !Array.isArray(component.inputFiles) ||
      !component.inputFiles.length ||
      component.inputFiles.some(
        (file) => typeof file !== 'string' || isAbsolute(file) || file.split('/').includes('..'),
      ) ||
      !(component.attributedBytes > 0)
    )
      throw new Error(`Invalid bundled component for ${entry.name}.`);
    keys.add(key);
  }
  return inventory;
}

export function addBundledComponents(sbom, inventory, purl) {
  sbom.properties.push({
    name: 'decantr:bundledInventory',
    value: inventory ? 'build-verified' : 'not-configured',
  });
  if (!inventory) return sbom;
  for (const component of inventory.components) {
    const ref = `pkg:${component.name}@${component.version}`;
    const existing = sbom.components.find((c) => c.bomRef === ref);
    const properties = [
      { name: 'decantr:bundled', value: 'true' },
      { name: 'decantr:bundledInputCount', value: String(component.inputFiles.length) },
    ];
    if (existing) existing.properties.push(...properties);
    else
      sbom.components.push({
        type: 'library',
        bomRef: ref,
        name: component.name,
        version: component.version,
        scope: 'required',
        purl: purl(component.name, component.version),
        properties,
      });
    if (!sbom.dependencies[0].dependsOn.includes(ref)) sbom.dependencies[0].dependsOn.push(ref);
  }
  return sbom;
}

export function verifyPackedBundleOutputs(tarball, inventory) {
  if (!inventory) return;
  for (const output of inventory.outputs) {
    if (!/^dist\//u.test(output.file) || output.file.split('/').includes('..'))
      throw new Error('Invalid packed bundle path.');
    const bytes = execFileSync('tar', ['-xOf', tarball, `package/${output.file}`], {
      maxBuffer: 32 * 1024 * 1024,
    });
    if (createHash('sha256').update(bytes).digest('hex') !== output.sha256) {
      throw new Error(`Packed bundle differs from its build inventory: ${output.file}`);
    }
  }
}
