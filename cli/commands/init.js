import { mkdir, writeFile, copyFile } from 'node:fs/promises';
import { join, basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { welcome, success, info, heading } from '../art.js';
import {
  packageJson, configJson, essenceJson, indexHtml, manifestJson,
  claudeMd, appJs, agentsMd
} from '../../tools/init-templates.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const frameworkRoot = resolve(__dirname, '..', '..');

/**
 * Create a new decantr project skeleton.
 * User then prompts their AI to build the app.
 */
export async function run() {
  const cwd = process.cwd();
  const name = process.argv[3] || basename(cwd);

  console.log(welcome('0.4.0'));
  console.log(heading('Creating project skeleton...'));

  // Create directories
  const dirs = ['public', 'public/images', '.decantr', 'src', 'src/pages', 'src/components'];
  for (const dir of dirs) {
    await mkdir(join(cwd, dir), { recursive: true });
  }

  const files = [
    ['package.json', packageJson(name)],
    ['decantr.config.json', configJson(name)],
    ['decantr.essence.json', essenceJson()],
    ['public/index.html', indexHtml(name)],
    ['.decantr/manifest.json', manifestJson(name)],
    ['CLAUDE.md', claudeMd(name)],
    ['AGENTS.md', await agentsMd()],
    ['src/app.js', appJs()]
  ];

  for (const [path, content] of files) {
    await writeFile(join(cwd, path), content + '\n');
    console.log('  ' + success(path));
  }

  // Copy logo asset
  const logoSrc = join(frameworkRoot, 'workbench', 'public', 'images', 'logo-portrait.svg');
  const logoDest = join(cwd, 'public', 'images', 'logo-portrait.svg');
  try {
    await copyFile(logoSrc, logoDest);
    console.log('  ' + success('public/images/logo-portrait.svg'));
  } catch {
    // Logo not found — non-fatal, welcome page still works without it
  }

  console.log('');
  console.log(heading('Project created!'));
  console.log(info('Next steps:'));
  console.log('    npm install');
  console.log('    npx decantr dev');
  console.log('');
  console.log(info('Then prompt your AI to build your app.'));
  console.log('');
}
