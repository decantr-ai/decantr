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
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = null;
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

function openingTag(source, component) {
  const start = source.indexOf(`<${component}`);
  if (start < 0) throw new Error(`Missing ${component}`);
  let braces = 0;
  let quote = null;
  let escaped = false;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }
    if (char === '{') braces += 1;
    else if (char === '}') braces -= 1;
    else if (char === '>' && braces === 0) return source.slice(start, index + 1);
  }
  throw new Error(`Unclosed ${component}`);
}

function jsxProperty(tag, name) {
  const match = new RegExp(`\\b${name}\\b`, 'u').exec(tag);
  if (!match) return undefined;
  let cursor = match.index + name.length;
  while (/\s/u.test(tag[cursor])) cursor += 1;
  if (tag[cursor] !== '=') return true;
  cursor += 1;
  while (/\s/u.test(tag[cursor])) cursor += 1;
  if (tag[cursor] === '{') {
    const end = findMatching(tag, cursor, '{', '}');
    return tag.slice(cursor + 1, end).trim();
  }
  const quote = tag[cursor];
  if (quote === '"' || quote === "'") {
    const end = tag.indexOf(quote, cursor + 1);
    return tag.slice(cursor + 1, end);
  }
  return tag.slice(cursor).split(/\s|\/>/u)[0];
}

function conditionBefore(source, marker, anchor, terminator) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) throw new Error(`Missing UI text: ${marker}`);
  const start = source.lastIndexOf(anchor, markerIndex);
  if (start < 0) throw new Error(`Missing condition before ${marker}`);
  const end = terminator === 'last-and'
    ? source.lastIndexOf('&& (', markerIndex)
    : source.indexOf('?', start);
  if (end < start || end > markerIndex) throw new Error(`Cannot isolate condition before ${marker}`);
  return source.slice(start + 1, end).trim();
}

function evaluate(expression, values) {
  return Boolean(vm.runInNewContext(`(${expression})`, values, { timeout: 1000 }));
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const source = await readFile(
    resolve(options.workspace, options.projectPath, 'src/features/Account/SwitchAccountDrawer.tsx'),
    'utf8',
  );
  const searchTag = openingTag(source, 'DebouncedSearchTextField');
  const keyExpression = jsxProperty(searchTag, 'key');
  let stableIdentity = keyExpression === undefined;
  let identityDetail = 'no explicit key remounts the controlled search field';
  if (typeof keyExpression === 'string') {
    try {
      const first = vm.runInNewContext(`(${keyExpression})`, {
        searchQuery: 'a', value: 'a', page: 1, isLoading: false, filter: {}, childAccounts: [],
      });
      const second = vm.runInNewContext(`(${keyExpression})`, {
        searchQuery: 'ab', value: 'ab', page: 1, isLoading: false, filter: {}, childAccounts: [],
      });
      stableIdentity = Object.is(first, second);
      identityDetail = `key resolves to ${String(first)} then ${String(second)}`;
    } catch (error) {
      stableIdentity = !/searchQuery|\bvalue\b|\bpage\b|isLoading|childAccounts|filter/u.test(keyExpression);
      identityDetail = `key expression could not be executed: ${error instanceof Error ? error.message : String(error)}`;
    }
  } else if (keyExpression === true) {
    stableIdentity = false;
    identityDetail = 'key is present without a stable value';
  }
  record('typing preserves search field identity', stableIdentity, identityDetail);
  record(
    'search remains controlled and labeled',
    jsxProperty(searchTag, 'value') === 'searchQuery' &&
      typeof jsxProperty(searchTag, 'onSearch') === 'string' &&
      jsxProperty(searchTag, 'label') === 'Search',
    'the search field must retain its controlled value, callback, and accessible label',
  );

  const noAccessCondition = conditionBefore(
    source,
    'You don’t have access to other accounts.',
    '{childAccounts',
    'ternary',
  );
  const noAccessBase = {
    childAccounts: [], isIAMDelegationEnabled: true, filter: {}, isLoading: false,
  };
  record(
    'no-access state waits for loading',
    !evaluate(noAccessCondition, { ...noAccessBase, isLoading: true }) &&
      evaluate(noAccessCondition, noAccessBase),
    `condition: ${noAccessCondition.replace(/\s+/gu, ' ')}`,
  );
  record(
    'filtered state does not become no-access',
    !evaluate(noAccessCondition, { ...noAccessBase, filter: { company: 'acme' } }),
    'a company filter must suppress the no-access state',
  );

  const filteredCondition = conditionBefore(
    source,
    'No search results',
    '{isIAMDelegationEnabled',
    'last-and',
  );
  const filteredBase = {
    childAccounts: [], isIAMDelegationEnabled: true, searchQuery: 'missing', isLoading: false,
  };
  record(
    'filtered empty state appears only after settlement',
    evaluate(filteredCondition, filteredBase) &&
      !evaluate(filteredCondition, { ...filteredBase, isLoading: true }) &&
      !evaluate(filteredCondition, { ...filteredBase, searchQuery: '' }) &&
      !evaluate(filteredCondition, { ...filteredBase, childAccounts: [{ id: 1 }] }),
    `condition: ${filteredCondition.replace(/\s+/gu, ' ')}`,
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
