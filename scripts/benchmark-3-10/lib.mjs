import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const benchmarkDir = resolve(dirname(fileURLToPath(import.meta.url)));
export const repoRoot = resolve(benchmarkDir, '..', '..');

export function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

export function stableJson(value) {
  return `${JSON.stringify(sortValue(value), null, 2)}\n`;
}

function sortValue(value) {
  if (Array.isArray(value)) return value.map(sortValue);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => [key, sortValue(item)]),
  );
}

export function checkoutDirectory(repoUrl) {
  const match = /^https:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/u.exec(repoUrl);
  if (!match) throw new Error(`Unsupported corpus repository URL: ${repoUrl}`);
  return `${match[1]}__${match[2]}`;
}

export function parseCommonArgs(argv) {
  const options = {
    corpusPath: resolve(benchmarkDir, 'corpus.json'),
    modelsPath: resolve(benchmarkDir, 'models.json'),
    protocolPath: resolve(benchmarkDir, 'protocol.json'),
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--corpus') options.corpusPath = resolve(argv[++index]);
    else if (argument === '--models') options.modelsPath = resolve(argv[++index]);
    else if (argument === '--protocol') options.protocolPath = resolve(argv[++index]);
    else throw new Error(`Unknown option: ${argument}`);
  }
  return options;
}

export function manifestDigests(options) {
  return {
    corpusSha256: sha256(readFileSync(options.corpusPath)),
    modelsSha256: sha256(readFileSync(options.modelsPath)),
    protocolSha256: sha256(readFileSync(options.protocolPath)),
  };
}
