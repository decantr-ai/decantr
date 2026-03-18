import { mkdir, writeFile, copyFile } from 'node:fs/promises';
import { join, basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { welcome, success, info, heading } from '../art.js';
import {
  packageJson, configJson, essenceJson, indexHtml, manifestJson,
  claudeMd, appJs, agentsMd
} from '../../tools/init-templates.js';
import { VERSION } from '../../tools/version.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const frameworkRoot = resolve(__dirname, '..', '..');

const TEMPLATES = ['saas-dashboard', 'ecommerce', 'portfolio', 'content-site', 'landing-page'];

/**
 * Parse --template flag from process.argv.
 * Supports: --template=name and --template name
 */
function parseTemplate() {
  const args = process.argv.slice(3);
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--template=')) return args[i].split('=')[1];
    if (args[i] === '--template' && args[i + 1]) return args[i + 1];
  }
  return null;
}

/**
 * Create a new decantr project skeleton.
 * User then prompts their AI to build the app.
 */
export async function run() {
  const cwd = process.cwd();
  const name = process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : basename(cwd);
  const templateName = parseTemplate();

  // Validate template name if provided
  if (templateName && !TEMPLATES.includes(templateName)) {
    console.log(`\x1b[31mError: Unknown template "${templateName}"\x1b[0m`);
    console.log(info(`Available templates: ${TEMPLATES.join(', ')}`));
    process.exitCode = 1;
    return;
  }

  console.log(welcome(VERSION));
  if (templateName) {
    console.log(heading(`Creating project from "${templateName}" template...`));
  } else {
    console.log(heading('Creating project skeleton...'));
  }

  // Create directories
  const dirs = ['public', 'public/images', '.decantr', 'src', 'src/pages', 'src/components'];
  for (const dir of dirs) {
    await mkdir(join(cwd, dir), { recursive: true });
  }

  // Load template overrides if specified
  let templateEssence = essenceJson;
  let templateApp = appJs;
  let templatePages = null;
  if (templateName) {
    const tmpl = await import(`../../tools/starter-templates/${templateName}/essence.js`);
    const tmplApp = await import(`../../tools/starter-templates/${templateName}/app.js`);
    const tmplPages = await import(`../../tools/starter-templates/${templateName}/pages.js`);
    templateEssence = tmpl.essenceJson;
    templateApp = tmplApp.appJs;
    templatePages = tmplPages.pageFiles;
  }

  const files = [
    ['package.json', packageJson(name)],
    ['decantr.config.json', configJson(name)],
    ['decantr.essence.json', templateEssence()],
    ['public/index.html', indexHtml(name)],
    ['.decantr/manifest.json', manifestJson(name)],
    ['CLAUDE.md', claudeMd(name)],
    ['AGENTS.md', await agentsMd()],
    ['src/app.js', templateApp()]
  ];

  // Add template page stubs
  if (templatePages) {
    for (const [path, content] of templatePages()) {
      files.push([path, content]);
    }
  }

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
  if (templateName) {
    console.log(info(`Template "${templateName}" applied. Run decantr generate to scaffold full pages from the essence.`));
  } else {
    console.log(info('Then prompt your AI to build your app.'));
  }
  console.log('');
}
