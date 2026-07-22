#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const visualCopies = [
  'demos/cloudflare/src/pages/posts/[slug].astro',
  'demos/playground/src/pages/posts/[slug].astro',
  'demos/postgres/src/pages/posts/[slug].astro',
  'demos/preview/src/pages/posts/[slug].astro',
  'demos/simple/src/pages/posts/[slug].astro',
  'templates/blog-cloudflare/src/pages/posts/[slug].astro',
  'templates/blog/src/pages/posts/[slug].astro',
];

function parseArgs(argv) {
  const options = { projectPath: '.' };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--workspace') options.workspace = argv[++index];
    else if (argv[index] === '--project-path') options.projectPath = argv[++index];
    else throw new Error(`Unknown option: ${argv[index]}`);
  }
  if (!options.workspace) throw new Error('--workspace is required');
  return options;
}

function emit(checks) {
  const failures = checks.filter((check) => !check.passed);
  const accessibilityViolations = checks.filter(
    (check) => check.accessibility === true && !check.passed,
  ).length;
  console.log(
    JSON.stringify({
      passed: failures.length === 0,
      metrics: {
        governanceViolations: 0,
        accessibilityViolations,
        visualScore: Math.round((100 * (checks.length - failures.length)) / checks.length),
        behaviorChecksPassed: checks.length - failures.length,
        behaviorChecksTotal: checks.length,
      },
      checks,
    }),
  );
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const root = resolve(options.workspace);
  const [router, editor, ...copies] = await Promise.all([
    readFile(resolve(root, 'packages/admin/src/router.tsx'), 'utf8'),
    readFile(resolve(root, 'packages/admin/src/components/ContentEditor.tsx'), 'utf8'),
    ...visualCopies.map((path) => readFile(resolve(root, path), 'utf8')),
  ]);
  const copyBindings = copies.map((source, index) => ({
    path: visualCopies[index],
    passed: /article-excerpt[^>]*\{\.\.\.post\.edit\.excerpt\}/u.test(source),
  }));
  const idBindings = editor.match(/\bid\s*=\s*\{\s*id\s*\}/gu)?.length ?? 0;
  const preservesSearch =
    /\{\s*field\s*:\s*_[^}]*\.\.\.preservedSearch\s*\}\s*=\s*searchParams/u.test(router) &&
    /navigate\s*\(\s*\{[\s\S]{0,250}search\s*:\s*preservedSearch[\s\S]{0,250}replace\s*:\s*true/u.test(router);

  emit([
    {
      id: 'excerpt-activates-visual-field-in-every-copy',
      passed: copyBindings.every((item) => item.passed),
      detail: copyBindings.filter((item) => !item.passed).map((item) => item.path),
    },
    {
      id: 'field-selector-is-validated',
      passed: /validateSearch[\s\S]{0,300}typeof\s+search\.field\s*===\s*['"]string['"]/u.test(router),
    },
    {
      id: 'selection-waits-for-loaded-content',
      passed:
        /useEffect\s*\([\s\S]{0,1000}(?:isLoading|content)[\s\S]{0,1000}(?:requestIdleCallback|setTimeout)/u.test(router),
    },
    {
      id: 'matching-editor-field-is-resolved',
      passed: /getElementById\s*\(\s*`field-\$\{searchParams\.field\}`\s*\)/u.test(router),
    },
    {
      id: 'field-is-centered',
      passed: /scrollIntoView\s*\(\s*\{[\s\S]{0,180}block\s*:\s*['"]center['"]/u.test(router),
    },
    {
      id: 'focus-is-attempted-on-resolved-field',
      accessibility: true,
      passed: /if\s*\(\s*el\s*\)[\s\S]{0,350}el\s*\.\s*focus\s*\(/u.test(router),
    },
    {
      id: 'only-field-selector-is-replaced',
      passed: preservesSearch,
    },
    {
      id: 'field-renderers-expose-addressable-ids',
      accessibility: true,
      passed: idBindings >= 4,
      detail: { idBindings },
    },
  ]);
}

main().catch((error) =>
  emit([{ id: 'oracle-execution', passed: false, detail: error instanceof Error ? error.message : String(error) }]),
);
