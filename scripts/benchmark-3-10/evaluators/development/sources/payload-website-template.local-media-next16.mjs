#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import vm from 'node:vm';

const checks = [];

function record(name, passed, detail) {
  checks.push({ name, passed: Boolean(passed), detail });
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--workspace') options.workspace = resolve(argv[++index]);
    else if (argv[index] === '--project-path') options.projectPath = argv[++index];
    else throw new Error(`Unknown option: ${argv[index]}`);
  }
  if (!options.workspace || !options.projectPath) throw new Error('Missing workspace or project path');
  return options;
}

function findMatching(source, start, open, close) {
  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (lineComment) {
      if (char === '\n') lineComment = false;
      continue;
    }
    if (blockComment) {
      if (char === '*' && next === '/') {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '/' && next === '/') {
      lineComment = true;
      index += 1;
      continue;
    }
    if (char === '/' && next === '*') {
      blockComment = true;
      index += 1;
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }
    if (char === open) depth += 1;
    else if (char === close) {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  throw new Error(`Unmatched ${open}`);
}

function compileMediaUrl(source) {
  const declaration = /(?:export\s+)?const\s+getMediaUrl\s*=/u.exec(source);
  if (!declaration) throw new Error('Missing getMediaUrl function');
  const parametersStart = source.indexOf('(', declaration.index);
  const parametersEnd = findMatching(source, parametersStart, '(', ')');
  const bodyStart = source.indexOf('{', source.indexOf('=>', parametersEnd));
  const bodyEnd = findMatching(source, bodyStart, '{', '}');
  const body = source.slice(bodyStart + 1, bodyEnd);
  return vm.runInNewContext(`(function (url, cacheTag) {${body}})`, {
    getClientSideURL: () => 'http://127.0.0.1:3000',
    encodeURIComponent,
  }, { timeout: 1000 });
}

function globMatches(pattern, value) {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/gu, '\\$&');
  const expression = escaped.replace(/\*\*/gu, '.*').replace(/\*/gu, '[^/]*');
  return new RegExp(`^${expression}$`, 'u').test(value);
}

function localPathPatterns(source) {
  const property = source.indexOf('localPatterns');
  if (property < 0) return [];
  const start = source.indexOf('[', property);
  const end = findMatching(source, start, '[', ']');
  return [...source.slice(start, end + 1).matchAll(/\bpathname\s*:\s*['"]([^'"]+)['"]/gu)]
    .map((match) => match[1]);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const root = resolve(options.workspace, options.projectPath);
  const [utilitySource, configSource] = await Promise.all([
    readFile(resolve(root, 'src/utilities/getMediaUrl.ts'), 'utf8'),
    readFile(resolve(root, 'next.config.ts'), 'utf8'),
  ]);
  const getMediaUrl = compileMediaUrl(utilitySource);

  const behavior = [
    ['local media remains relative', '/api/media/file/seed image.webp', undefined, '/api/media/file/seed image.webp'],
    ['local cache tag is encoded', '/api/media/file/seed.webp', 'draft 2', '/api/media/file/seed.webp?draft%202'],
    ['external storage remains absolute', 'https://cdn.example.test/seed.webp', undefined, 'https://cdn.example.test/seed.webp'],
    ['external cache tag is preserved', 'https://cdn.example.test/seed.webp', 'v 3', 'https://cdn.example.test/seed.webp?v%203'],
    ['other local assets remain relative', '/assets/logo.svg', undefined, '/assets/logo.svg'],
    ['empty media remains empty', undefined, undefined, ''],
  ];
  for (const [name, url, cacheTag, expected] of behavior) {
    const actual = getMediaUrl(url, cacheTag);
    record(name, actual === expected, `expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
  }

  const patterns = localPathPatterns(configSource);
  record(
    'image optimizer accepts local media endpoint',
    patterns.some((pattern) => globMatches(pattern, '/api/media/file/seed.webp')),
    `local patterns: ${patterns.join(', ') || 'none'}`,
  );
  record(
    'local image permission is scoped',
    patterns.length > 0 && !patterns.some((pattern) => globMatches(pattern, '/api/admin/users')),
    'local image patterns must not authorize unrelated application endpoints',
  );
}

try {
  await main();
} catch (error) {
  record('oracle execution', false, error instanceof Error ? error.message : String(error));
}

const passed = checks.length > 0 && checks.every((check) => check.passed);
process.stdout.write(`${JSON.stringify({
  passed,
  metrics: { governanceViolations: 0, accessibilityViolations: 0 },
  checks,
})}\n`);
