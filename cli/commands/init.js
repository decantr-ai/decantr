import { mkdir, writeFile } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { welcome, success, info, heading } from '../art.js';
import {
  packageJson, configJson, essenceJson, indexHtml, manifestJson,
  claudeMd, appJs, agentsMd
} from '../../tools/init-templates.js';

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
  const dirs = ['public', '.decantr', 'src', 'src/pages', 'src/components'];
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

  console.log('');
  console.log(heading('Project created!'));
  console.log(info('Next steps:'));
  console.log('    npm install');
  console.log('    npx decantr dev');
  console.log('');
  console.log(info('Then prompt your AI to build your app.'));
  console.log('');
}
