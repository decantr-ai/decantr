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

function functionBody(source, name) {
  const match = new RegExp(`function\\s+${name}\\s*\\(`, 'u').exec(source);
  if (!match) throw new Error(`Missing ${name}`);
  const parametersStart = source.indexOf('(', match.index);
  const parametersEnd = findMatching(source, parametersStart, '(', ')');
  const bodyStart = source.indexOf('{', parametersEnd);
  const bodyEnd = findMatching(source, bodyStart, '{', '}');
  return source.slice(bodyStart + 1, bodyEnd);
}

function compileKeyFunction(source, name, context, parameters = ['ev']) {
  const body = functionBody(source, name)
    .replace(/\s+as\s+keyof\s+typeof\s+modifierKeys/gu, '')
    .replace(/\s+as\s+(?:Key|ModifierKeys)/gu, '');
  return vm.runInNewContext(`(function ${name}(${parameters.join(', ')}) {${body}})`, context, { timeout: 1000 });
}

function keyboardEvent(overrides = {}) {
  return {
    key: '',
    code: '',
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    shiftKey: false,
    target: { element: true, typable: false, codeMirror: false, monaco: false },
    getModifierState: (name) => name === 'NumLock',
    preventDefault() {},
    stopPropagation() {},
    stopImmediatePropagation() {},
    ...overrides,
  };
}

function extractKeydownHandler(source) {
  const shortcutIndex = source.indexOf('hoppscotch_desktop_shortcut');
  const eventIndex = source.lastIndexOf('"keydown"', shortcutIndex);
  if (eventIndex < 0) throw new Error('Missing window keydown listener');
  const functionIndex = source.indexOf('function', eventIndex);
  const parametersStart = source.indexOf('(', functionIndex);
  const parametersEnd = findMatching(source, parametersStart, '(', ')');
  const bodyStart = source.indexOf('{', parametersEnd);
  const bodyEnd = findMatching(source, bodyStart, '{', '}');
  const body = source
    .slice(bodyStart + 1, bodyEnd)
    .replace(/let\s+shortcutEvent\s*:\s*string\s*\|\s*null\s*=/u, 'let shortcutEvent =');
  return body;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const helperSource = await readFile(
    resolve(options.workspace, 'packages/hoppscotch-common/src/helpers/keybindings.ts'),
    'utf8',
  );
  const mainSource = await readFile(resolve(options.workspace, options.projectPath, 'src/main.ts'), 'utf8');

  const context = {
    isAppleDevice: () => false,
    isDOMElement: (target) => Boolean(target?.element),
    isTypableElement: (target) => Boolean(target?.typable),
    isCodeMirrorEditor: (target) => Boolean(target?.codeMirror),
    isMonacoEditor: (target) => Boolean(target?.monaco),
  };
  if (/function\s+resolvePressedKey\s*\(/u.test(helperSource)) {
    context.resolvePressedKey = compileKeyFunction(
      helperSource,
      'resolvePressedKey',
      context,
      ['ev', 'strategy'],
    );
    context.getKeyboardLayoutStrategy = () => 'hybrid';
  }
  const getPressedKey = compileKeyFunction(helperSource, 'getPressedKey', context);
  context.getPressedKey = getPressedKey;
  context.getActiveModifier = compileKeyFunction(helperSource, 'getActiveModifier', context);
  const generateKeybindingString = compileKeyFunction(helperSource, 'generateKeybindingString', context);

  const physicalCases = [
    ['Cyrillic letter', keyboardEvent({ key: 'й', code: 'KeyQ', ctrlKey: true }), 'ctrl-q'],
    ['CJK letter', keyboardEvent({ key: '中', code: 'KeyA', ctrlKey: true }), 'ctrl-a'],
    ['non-Latin digit', keyboardEvent({ key: 'ж', code: 'Digit7', ctrlKey: true, altKey: true }), 'ctrl-alt-7'],
    ['English letter', keyboardEvent({ key: 't', code: 'KeyT', ctrlKey: true }), 'ctrl-t'],
    ['navigation key', keyboardEvent({ key: 'ArrowRight', code: 'ArrowRight', altKey: true }), 'alt-right'],
  ];
  for (const [name, event, expected] of physicalCases) {
    const actual = generateKeybindingString(event);
    record(`configured ${name}`, actual === expected, `expected ${expected}, received ${String(actual)}`);
  }

  const typingTarget = { element: true, typable: true, codeMirror: false, monaco: false };
  record(
    'typing field ignores unmodified letters',
    generateKeybindingString(keyboardEvent({ key: 'ф', code: 'KeyA', target: typingTarget })) === null,
    'an editable target must retain unmodified input',
  );
  record(
    'typing field ignores shifted slash',
    generateKeybindingString(
      keyboardEvent({ key: '?', code: 'Slash', shiftKey: true, target: typingTarget }),
    ) === null,
    'an editable target must retain shifted punctuation',
  );
  record(
    'editor retains alt navigation',
    generateKeybindingString(
      keyboardEvent({
        key: 'ArrowUp',
        code: 'ArrowUp',
        altKey: true,
        target: { element: true, typable: false, codeMirror: true, monaco: false },
      }),
    ) === null,
    'editor navigation must not be intercepted',
  );

  const handlerBody = extractKeydownHandler(mainSource);
  const emitted = [];
  const handler = vm.runInNewContext(`(function (e) {${handlerBody}})`, {
    isTextInput: (target) => Boolean(target?.typable),
    emit: (_channel, shortcut) => {
      emitted.push(shortcut);
      return Promise.resolve();
    },
    setTimeout: (callback) => callback(),
    console: { error() {} },
    Promise,
    resolvePressedKey: context.resolvePressedKey,
    getKeyboardLayoutStrategy: context.getKeyboardLayoutStrategy,
  });
  const desktopCases = [
    ['quit', { key: 'й', code: 'KeyQ', ctrlKey: true }, 'ctrl-q'],
    ['new tab', { key: 'е', code: 'KeyT', ctrlKey: true }, 'ctrl-t'],
    ['close tab', { key: 'ц', code: 'KeyW', ctrlKey: true }, 'ctrl-w'],
    ['reopen tab', { key: 'е', code: 'KeyT', ctrlKey: true, shiftKey: true }, 'ctrl-shift-t'],
    ['digit tab', { key: '(', code: 'Digit9', ctrlKey: true, altKey: true }, 'ctrl-alt-9'],
    ['navigation tab', { key: 'ArrowRight', code: 'ArrowRight', ctrlKey: true, altKey: true }, 'ctrl-alt-right'],
  ];
  for (const [name, input, expected] of desktopCases) {
    emitted.length = 0;
    handler(keyboardEvent(input));
    record(`desktop ${name}`, emitted.length === 1 && emitted[0] === expected, `emitted ${emitted.join(', ') || 'nothing'}`);
  }
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
