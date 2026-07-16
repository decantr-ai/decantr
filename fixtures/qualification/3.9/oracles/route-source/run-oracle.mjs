#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const oracleRoot = dirname(scriptPath);
const defaultRepoRoot = resolve(oracleRoot, '../../../../..');

function parseArgs(argv) {
  const options = {
    repoRoot: defaultRepoRoot,
    verifier: null,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--repo-root') options.repoRoot = resolve(argv[++index] || '');
    else if (arg.startsWith('--repo-root=')) options.repoRoot = resolve(arg.slice(12));
    else if (arg === '--verifier') options.verifier = resolve(argv[++index] || '');
    else if (arg.startsWith('--verifier=')) options.verifier = resolve(arg.slice(11));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  options.verifier ??= resolve(options.repoRoot, 'packages/verifier/dist/index.js');
  return options;
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function walkFiles(root, current = root) {
  const files = [];
  for (const entry of readdirSync(current).sort()) {
    const absolute = resolve(current, entry);
    const stat = statSync(absolute);
    if (stat.isDirectory()) files.push(...walkFiles(root, absolute));
    else if (stat.isFile()) files.push(relative(root, absolute).replaceAll('\\', '/'));
  }
  return files;
}

function orderedSources(discovery, route) {
  const selected = discovery.routes.taskableRoutes.find((item) => item.path === route);
  if (!selected) throw new Error(`Oracle route was not taskable: ${route}`);
  const competitors = [
    ...new Set(
      discovery.routes.routeSignals
        .filter((signal) => signal.path === route && signal.taskable)
        .map((signal) => signal.file),
    ),
  ];
  return [selected.file, ...competitors.filter((file) => file !== selected.file).sort()];
}

function expectedCase(discovery, index, kind) {
  const suffix = String(index).padStart(2, '0');
  const competition = kind === 'competition';
  const route = competition
    ? `/qualification/competition-${suffix}`
    : `/qualification/standalone-${suffix}`;
  const page = competition
    ? `src/pages/competition-${suffix}-page.tsx`
    : `src/pages/standalone-${suffix}-page.tsx`;
  const layout = competition ? `src/layouts/competition-${suffix}-layout.tsx` : null;
  const ordered = orderedSources(discovery, route);
  const expected = layout ? [page, layout] : [page];
  if (JSON.stringify(ordered) !== JSON.stringify(expected)) {
    throw new Error(
      `Oracle ordering mismatch for ${route}: expected ${expected.join(', ')}, received ${ordered.join(', ')}`,
    );
  }
  return {
    id: `route-oracle-${competition ? 'competition' : 'standalone'}-${suffix}`,
    clusterId: `route-oracle-${competition ? 'competition' : 'standalone'}-${suffix}`,
    route,
    orderedSources: ordered,
    requiredFirstSource: page,
    forbiddenFirstSources: layout
      ? [
          {
            source: layout,
            category: 'layout',
            declaration: `React Router parent layout for ${route} genuinely competed with its index page.`,
          },
        ]
      : [],
  };
}

const options = parseArgs(process.argv.slice(2));
if (!existsSync(options.verifier)) {
  throw new Error(`Built verifier entrypoint does not exist: ${options.verifier}`);
}

const projectRoot = oracleRoot;
const packageJson = JSON.parse(
  readFileSync(resolve(options.repoRoot, 'packages/verifier/package.json'), 'utf8'),
);
const { discoverProject } = await import(pathToFileURL(options.verifier).href);
if (typeof discoverProject !== 'function') {
  throw new Error('The selected verifier does not export discoverProject().');
}

const discovery = discoverProject(projectRoot);
const cases = [
  ...Array.from({ length: 24 }, (_, index) => expectedCase(discovery, index + 1, 'competition')),
  ...Array.from({ length: 11 }, (_, index) => expectedCase(discovery, index + 1, 'standalone')),
];
const fixtureFiles = walkFiles(projectRoot)
  .filter((path) => path !== 'captured-output.json')
  .map((path) => ({ path, sha256: sha256(readFileSync(resolve(projectRoot, path))) }));
const implementationFiles = fixtureFiles.filter(
  (file) => file.path.startsWith('src/layouts/') || file.path.startsWith('src/pages/'),
);
if (
  implementationFiles.length !== 59 ||
  new Set(implementationFiles.map((file) => file.sha256)).size !== 59
) {
  throw new Error('Every oracle layout and page must have distinct implementation bytes.');
}
const fixtureTreeSha256 = sha256(
  fixtureFiles.map((file) => `${file.path}\0${file.sha256}\n`).join(''),
);

const payload = {
  schemaVersion: 'decantr-route-source-oracle-output.v1',
  oracle: {
    framework: 'React Router object routes',
    competitionCount: 24,
    standaloneCount: 11,
    implementationFileCount: 59,
    distinctImplementationHashCount: 59,
    fixtureTreeSha256,
    fixtureFiles,
  },
  verifier: {
    package: '@decantr/verifier',
    version: packageJson.version,
    entrypoint: relative(options.repoRoot, options.verifier).replaceAll('\\', '/'),
    entrypointSha256: sha256(readFileSync(options.verifier)),
  },
  discovery: {
    strategy: discovery.routes.strategy,
    routeSignalCount: discovery.routes.routeSignalCount,
    taskableRouteCount: discovery.routes.taskableRouteCount,
    confidence: discovery.routes.confidence,
  },
  cases,
};

process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
