import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { isAbsolute, join, relative } from 'node:path';
import { collectMissingPackManifestFiles } from '@decantr/verifier';
import type { EssenceV4 } from '@decantr/essence-spec';
import { isV4 } from '@decantr/essence-spec';
import { RegistryClient } from '../registry.js';
import { refreshDerivedFiles } from '../scaffold.js';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

export interface RefreshCommandOptions {
  offline?: boolean;
  check?: boolean;
  listChanges?: boolean;
  json?: boolean;
  displayRoot?: string;
}

interface RefreshFileState {
  path: string;
  hash: string;
  mtimeMs: number;
}

interface RefreshSummary {
  projectRoot: string;
  check: boolean;
  stale: boolean;
  reasons: string[];
  created: string[];
  updated: string[];
  removed: string[];
  unchanged: string[];
}

function hashFile(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function walkFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(path));
    } else if (entry.isFile()) {
      files.push(path);
    }
  }
  return files;
}

function trackedGeneratedFiles(projectRoot: string): string[] {
  return [
    join(projectRoot, 'DECANTR.md'),
    ...walkFiles(join(projectRoot, '.decantr', 'context')),
    ...['global.css', 'tokens.css', 'treatments.css', 'decantr-bridge.css']
      .map((file) => join(projectRoot, 'src', 'styles', file))
      .filter((path) => existsSync(path)),
  ].filter((path) => existsSync(path));
}

function snapshotGeneratedFiles(projectRoot: string): Map<string, RefreshFileState> {
  const map = new Map<string, RefreshFileState>();
  for (const path of trackedGeneratedFiles(projectRoot)) {
    const rel = path.replace(`${projectRoot}/`, '');
    map.set(rel, {
      path: rel,
      hash: hashFile(path),
      mtimeMs: fileMtimeMs(path),
    });
  }
  return map;
}

function fileMtimeMs(path: string): number {
  try {
    return statSync(path).mtimeMs;
  } catch {
    return 0;
  }
}

function newestInputMtime(projectRoot: string): number {
  return Math.max(
    fileMtimeMs(join(projectRoot, 'decantr.essence.json')),
    fileMtimeMs(join(projectRoot, '.decantr', 'project.json')),
  );
}

function isContractOnlyProject(projectRoot: string): boolean {
  const projectJsonPath = join(projectRoot, '.decantr', 'project.json');
  if (!existsSync(projectJsonPath)) return false;
  try {
    const projectJson = JSON.parse(readFileSync(projectJsonPath, 'utf-8')) as {
      initialized?: { adoptionMode?: unknown };
    };
    return projectJson.initialized?.adoptionMode === 'contract-only';
  } catch {
    return false;
  }
}

function checkRefreshFreshness(projectRoot: string): RefreshSummary {
  const contextDir = join(projectRoot, '.decantr', 'context');
  const generated = trackedGeneratedFiles(projectRoot);
  const reasons: string[] = [];
  const packHydrationOptional = isContractOnlyProject(projectRoot);
  if (!existsSync(join(projectRoot, 'DECANTR.md'))) reasons.push('DECANTR.md is missing.');
  if (!existsSync(contextDir)) reasons.push('.decantr/context is missing.');
  if (!existsSync(join(contextDir, 'scaffold.md'))) {
    reasons.push('.decantr/context/scaffold.md is missing.');
  }
  if (!packHydrationOptional && !existsSync(join(contextDir, 'pack-manifest.json'))) {
    reasons.push('.decantr/context/pack-manifest.json is missing.');
  } else if (existsSync(join(contextDir, 'pack-manifest.json'))) {
    const missingPackFiles = collectMissingPackManifestFiles(projectRoot);
    if (missingPackFiles.length > 0) {
      reasons.push(
        `pack-manifest.json references missing files: ${missingPackFiles
          .slice(0, 5)
          .map((missing) => missing.relativePath)
          .join(', ')}${missingPackFiles.length > 5 ? '...' : ''}`,
      );
    }
  }
  const newestInput = newestInputMtime(projectRoot);
  const staleFiles = generated
    .filter((path) => fileMtimeMs(path) > 0 && fileMtimeMs(path) < newestInput)
    .map((path) => path.replace(`${projectRoot}/`, ''));
  if (staleFiles.length > 0) {
    reasons.push(
      `Generated files are older than the essence/project metadata: ${staleFiles.slice(0, 5).join(', ')}${staleFiles.length > 5 ? '...' : ''}`,
    );
  }
  return {
    projectRoot,
    check: true,
    stale: reasons.length > 0,
    reasons,
    created: [],
    updated: [],
    removed: [],
    unchanged: generated.map((path) => path.replace(`${projectRoot}/`, '')).sort(),
  };
}

function summarizeChanges(
  projectRoot: string,
  before: Map<string, RefreshFileState>,
  after: Map<string, RefreshFileState>,
): RefreshSummary {
  const created: string[] = [];
  const updated: string[] = [];
  const removed: string[] = [];
  const unchanged: string[] = [];

  for (const [path, afterState] of after) {
    const beforeState = before.get(path);
    if (!beforeState) created.push(path);
    else if (beforeState.hash !== afterState.hash) updated.push(path);
    else unchanged.push(path);
  }
  for (const path of before.keys()) {
    if (!after.has(path)) removed.push(path);
  }

  return {
    projectRoot,
    check: false,
    stale: false,
    reasons: [],
    created: created.sort(),
    updated: updated.sort(),
    removed: removed.sort(),
    unchanged: unchanged.sort(),
  };
}

function displayGeneratedPath(summary: RefreshSummary, file: string, displayRoot?: string): string {
  if (!displayRoot) return file;
  const absolutePath = join(summary.projectRoot, file);
  const relativePath = relative(displayRoot, absolutePath).replace(/\\/g, '/');
  if (relativePath && !relativePath.startsWith('..') && !isAbsolute(relativePath)) {
    return relativePath;
  }
  return absolutePath;
}

function printRefreshSummary(summary: RefreshSummary, displayRoot?: string): void {
  if (summary.check) {
    if (summary.stale) {
      console.log(`${RED}Generated Decantr context is stale.${RESET}`);
      for (const reason of summary.reasons) console.log(`  ${reason}`);
      console.log(`${DIM}Run \`decantr refresh\` to regenerate derived files.${RESET}`);
    } else {
      console.log(`${GREEN}Generated Decantr context looks fresh.${RESET}`);
    }
    return;
  }

  const groups: Array<[string, string[]]> = [
    ['Created', summary.created],
    ['Updated', summary.updated],
    ['Removed', summary.removed],
  ];
  for (const [label, files] of groups) {
    if (files.length === 0) continue;
    console.log(`${GREEN}${label}:${RESET}`);
    for (const file of files) {
      console.log(`  ${DIM}${displayGeneratedPath(summary, file, displayRoot)}${RESET}`);
    }
  }
  if (groups.every(([, files]) => files.length === 0)) {
    console.log(`${GREEN}Generated files were already current.${RESET}`);
  }
}

export async function cmdRefresh(
  projectRoot: string = process.cwd(),
  options: RefreshCommandOptions = {},
): Promise<void> {
  const essencePath = join(projectRoot, 'decantr.essence.json');

  if (!existsSync(essencePath)) {
    console.error(`${RED}No decantr.essence.json found. Run \`decantr init\` first.${RESET}`);
    process.exitCode = 1;
    return;
  }

  let essence: EssenceV4;
  try {
    const raw = readFileSync(essencePath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!isV4(parsed)) {
      console.error(
        `${RED}Active workflows require Essence v4.0.0. Run \`decantr migrate --to v4\` first.${RESET}`,
      );
      process.exitCode = 1;
      return;
    }
    essence = parsed;
  } catch (e) {
    console.error(`${RED}Could not read essence: ${(e as Error).message}${RESET}`);
    process.exitCode = 1;
    return;
  }

  if (options.check) {
    const summary = checkRefreshFreshness(projectRoot);
    if (options.json) {
      console.log(JSON.stringify(summary, null, 2));
    } else {
      printRefreshSummary(summary, options.displayRoot);
    }
    if (summary.stale) process.exitCode = 1;
    return;
  }

  const registryClient = new RegistryClient({
    cacheDir: join(projectRoot, '.decantr', 'cache'),
    offline: options.offline,
  });

  console.log('Regenerating derived files...\n');

  const before = snapshotGeneratedFiles(projectRoot);
  const result = await refreshDerivedFiles(projectRoot, essence, registryClient);
  const after = snapshotGeneratedFiles(projectRoot);
  const summary = summarizeChanges(projectRoot, before, after);

  if (options.json) {
    console.log(JSON.stringify({ ...summary, result }, null, 2));
  } else if (options.listChanges) {
    printRefreshSummary(summary, options.displayRoot);
  } else {
    console.log(`${GREEN}Regenerated:${RESET}`);
    console.log(
      `  ${DIM}${displayGeneratedPath(summary, 'DECANTR.md', options.displayRoot)}${RESET}`,
    );
    for (const css of result.cssFiles) {
      const rel = css.replace(projectRoot + '/', '');
      console.log(`  ${DIM}${displayGeneratedPath(summary, rel, options.displayRoot)}${RESET}`);
    }
    for (const ctx of result.contextFiles) {
      const rel = ctx.replace(projectRoot + '/', '');
      console.log(`  ${DIM}${displayGeneratedPath(summary, rel, options.displayRoot)}${RESET}`);
    }
  }
  console.log('');
  console.log(`${GREEN}Done.${RESET}`);
}
