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

function openingTag(source, component, from = 0) {
  const start = source.indexOf(`<${component}`, from);
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

function resolveHandler(source, expression) {
  if (!/^[A-Za-z_$][\w$]*$/u.test(expression)) return expression;
  const declaration = new RegExp(`(?:const|let)\\s+${expression}\\s*=`, 'u').exec(source);
  if (declaration) {
    let start = source.indexOf('=', declaration.index) + 1;
    while (/\s/u.test(source[start])) start += 1;
    const arrow = source.indexOf('=>', start);
    const bodyStart = source.indexOf('{', arrow);
    const bodyEnd = findMatching(source, bodyStart, '{', '}');
    return source.slice(start, bodyEnd + 1);
  }
  const named = new RegExp(`function\\s+${expression}\\s*\\(`, 'u').exec(source);
  if (named) {
    const bodyStart = source.indexOf('{', named.index);
    const bodyEnd = findMatching(source, bodyStart, '{', '}');
    return source.slice(named.index, bodyEnd + 1);
  }
  throw new Error(`Cannot resolve handler ${expression}`);
}

function runCleanup(source, tag) {
  const expression = jsxProperty(tag, 'onCloseAutoFocus');
  if (typeof expression !== 'string') return { passed: false, detail: 'missing onCloseAutoFocus handler' };
  const style = {
    pointerEvents: 'none',
    removeProperty(name) {
      if (name === 'pointer-events') this.pointerEvents = '';
    },
    setProperty(name, value) {
      if (name === 'pointer-events') this.pointerEvents = value;
    },
  };
  const handler = vm.runInNewContext(`(${resolveHandler(source, expression)})`, {
    document: { body: { style } },
    setTimeout: (callback) => callback(),
  }, { timeout: 1000 });
  let prevented = false;
  handler({ preventDefault() { prevented = true; } });
  return {
    passed: style.pointerEvents === '',
    detail: `pointerEvents=${JSON.stringify(style.pointerEvents)}, defaultPrevented=${prevented}`,
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const source = await readFile(
    resolve(options.workspace, options.projectPath, 'src/components/forms/settings/form-api-key.tsx'),
    'utf8',
  );
  const expirationIndex = source.indexOf('name="expiresAt"');
  if (expirationIndex < 0) throw new Error('Missing expiration-date field');
  const popoverTag = openingTag(source, 'Popover', expirationIndex);
  const modal = jsxProperty(popoverTag, 'modal');
  const nonModal = modal === undefined || modal === 'false' ||
    (typeof modal === 'string' && vm.runInNewContext(`Boolean(${modal})`) === false);
  record('date picker avoids a nested modal layer', nonModal, `modal=${String(modal)}`);

  const dialogTag = openingTag(source, 'DialogContent');
  const alertTag = openingTag(source, 'AlertDialogContent');
  const dialogCleanup = runCleanup(source, dialogTag);
  const alertCleanup = runCleanup(source, alertTag);
  record('creation dialog restores page interaction', dialogCleanup.passed, dialogCleanup.detail);
  record('success dialog restores page interaction', alertCleanup.passed, alertCleanup.detail);

  const expirationSection = source.slice(expirationIndex, source.indexOf('</FormField>', expirationIndex));
  record(
    'expiration picker remains keyboard-usable',
    /<Calendar\b/u.test(expirationSection) &&
      /\binitialFocus\b/u.test(expirationSection) &&
      /\bonSelect\s*=\s*\{/u.test(expirationSection),
    'the existing calendar must retain focus and selection behavior',
  );
  record(
    'dialog feedback and dismissal remain labeled',
    /<DialogTitle>\s*Create API Key\s*<\/DialogTitle>/u.test(source) &&
      source.includes('<DialogDescription>') &&
      /<AlertDialogTitle>\s*API Key Created\s*<\/AlertDialogTitle>/u.test(source) &&
      />\s*Cancel\s*<\/Button>/u.test(source) &&
      />\s*Done\s*<\/Button>/u.test(source),
    'creation, cancellation, success feedback, and completion controls must remain present',
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
