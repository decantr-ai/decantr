import { mkdir, writeFile } from 'node:fs/promises';
import { join, basename, dirname } from 'node:path';
import { parseArgs } from 'node:util';
import { ask, select } from '../prompts.js';
import { success, heading, info } from '../output.js';
import { createResolver } from '@decantr/registry';
import type { Essence, GeneratorTarget } from '@decantr/essence-spec';

const ARCHETYPES = [
  'saas-dashboard',
  'ecommerce',
  'portfolio',
  'content-site',
  'landing-page',
];

const STYLES = ['auradecantism', 'clean', 'glassmorphism', 'retro'];
const MODES = ['dark', 'light', 'auto'];
const TARGETS: GeneratorTarget[] = ['decantr', 'react'];

export async function run(): Promise<void> {
  const { values } = parseArgs({
    options: {
      yes: { type: 'boolean', short: 'y', default: false },
      target: { type: 'string', short: 't' },
      archetype: { type: 'string' },
    },
    strict: false,
    allowPositionals: true,
  });

  const cwd = process.cwd();
  const defaultName = basename(cwd);

  console.log(heading('Create a new Decantr project'));

  // Interactive prompts (skip with --yes for defaults)
  const name = values.yes
    ? defaultName
    : await ask('Project name', defaultName);

  const archetype = (values.archetype as string) || (values.yes
    ? ARCHETYPES[0]
    : await select('Choose an archetype', ARCHETYPES));

  const style = values.yes
    ? STYLES[0]
    : await select('Choose a style', STYLES);

  const mode = values.yes
    ? MODES[0]
    : await select('Choose a mode', MODES);

  const target = (values.target as GeneratorTarget) || (values.yes
    ? 'react'
    : await select('Target framework', TARGETS)) as GeneratorTarget;

  // Load archetype to get default structure
  let defaultStructure: Essence['structure'] = [
    { id: 'home', shell: 'full-bleed', layout: ['hero'] },
  ];

  try {
    const contentRoot = join(cwd, 'node_modules', '@decantr', 'content');
    const resolver = createResolver({ contentRoot });
    const resolved = await resolver.resolve('archetype', archetype);
    if (resolved?.item?.pages) {
      defaultStructure = resolved.item.pages.map((p: any) => ({
        id: p.id,
        shell: p.shell ?? p.carafe ?? 'sidebar-main',
        layout: p.default_blend?.patterns ?? p.layout ?? p.blend ?? [],
      }));
    }
  } catch {
    // Fall back to minimal structure — archetype not available yet
  }

  // Build essence
  const essence: Essence = {
    version: '2.0.0',
    archetype,
    theme: { style, mode: mode as 'dark' | 'light' | 'auto', recipe: style },
    character: ['professional'],
    platform: { type: 'spa', routing: 'hash' },
    structure: defaultStructure,
    features: [],
    guard: { enforce_style: true, enforce_recipe: true, mode: 'strict' },
    density: { level: 'comfortable', content_gap: '_gap4' },
    target,
  };

  // Create directory structure
  console.log(heading('Scaffolding project...'));
  const dirs = ['src', 'src/pages', 'src/components', 'public'];
  for (const dir of dirs) {
    await mkdir(join(cwd, dir), { recursive: true });
    console.log(success(dir + '/'));
  }

  // Write essence file
  const essencePath = join(cwd, 'decantr.essence.json');
  await writeFile(essencePath, JSON.stringify(essence, null, 2) + '\n');
  console.log(success('decantr.essence.json'));

  // Write minimal package.json
  const pkg = {
    name,
    version: '0.1.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'decantr dev',
      build: 'decantr build',
      generate: `decantr generate --target ${target}`,
    },
    dependencies:
      target === 'react'
        ? { react: '^19.0.0', 'react-dom': '^19.0.0' }
        : { decantr: 'latest' },
  };
  await writeFile(join(cwd, 'package.json'), JSON.stringify(pkg, null, 2) + '\n');
  console.log(success('package.json'));

  // Write index.html
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${name}</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/app.${target === 'react' ? 'tsx' : 'js'}"></script>
</body>
</html>
`;
  await writeFile(join(cwd, 'public', 'index.html'), html);
  console.log(success('public/index.html'));

  // Run generator
  console.log(heading('Generating code...'));
  try {
    const { runPipeline } = await import('@decantr/generator-core');
    const plugin = target === 'react'
      ? await import('@decantr/generator-react').then((m) => m.createReactPlugin())
      : await import('@decantr/generator-decantr').then((m) => m.createDecantrPlugin());
    const contentRoot = join(cwd, 'node_modules', '@decantr', 'content');
    const result = await runPipeline(essence, {
      plugin,
      projectRoot: cwd,
      contentRoot,
      overridePaths: [join(cwd, 'src', 'registry-content')],
    });
    for (const file of result.files) {
      const fullPath = join(cwd, file.path);
      await mkdir(dirname(join(cwd, file.path)), { recursive: true });
      await writeFile(fullPath, file.content);
      console.log(success(file.path));
    }
  } catch (e) {
    console.log(info(`Generator not available yet: ${(e as Error).message}`));
    console.log(info('Run "decantr generate" after installing dependencies.'));
  }

  // Done
  console.log(heading('Project created!'));
  console.log(info('Next steps:'));
  console.log('    npm install');
  console.log(`    npx decantr generate --target ${target}`);
  console.log('    npx decantr dev');
  console.log('');
}
