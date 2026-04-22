import { existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { seedOfflineRegistry } from '../offline-content.js';
import { detectRoutingMode, getBootstrapAdapter, resolveBootstrapTarget } from '../bootstrap.js';

const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';

function heading(text: string): string { return `\n${BOLD}${text}${RESET}\n`; }
function success(text: string): string { return `${GREEN}${text}${RESET}`; }
function error(text: string): string { return `${RED}${text}${RESET}`; }
function dim(text: string): string { return `${DIM}${text}${RESET}`; }
function cyan(text: string): string { return `${CYAN}${text}${RESET}`; }

export interface NewProjectOptions {
  blueprint?: string;
  archetype?: string;
  theme?: string;
  mode?: string;
  shape?: string;
  target?: string;
  offline?: boolean;
  registry?: string;
}

export async function cmdNewProject(
  projectName: string,
  options: NewProjectOptions
): Promise<void> {
  const workspaceRoot = process.cwd();
  const projectDir = resolve(workspaceRoot, projectName);
  const bootstrapTarget = resolveBootstrapTarget(options.target);
  const bootstrapAdapter = getBootstrapAdapter(bootstrapTarget);
  const hasRunnableBootstrap = Boolean(bootstrapAdapter);

  // Validate project name
  if (!/^[a-z0-9][a-z0-9._-]*$/i.test(projectName)) {
    console.error(error('Invalid project name. Use alphanumeric characters, hyphens, dots, or underscores.'));
    process.exitCode = 1;
    return;
  }

  // Check directory doesn't already exist
  if (existsSync(projectDir)) {
    console.error(error(`Directory "${projectName}" already exists.`));
    process.exitCode = 1;
    return;
  }

  console.log(heading(`Creating ${projectName}...`));

  // 1. Create directory
  mkdirSync(projectDir, { recursive: true });
  console.log(dim(`  Created ${projectName}/`));

  const title = projectName.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  if (bootstrapAdapter) {
    bootstrapAdapter.writeProjectFiles(projectDir, title, 'hash');
    console.log(dim(`  Bootstrapped ${bootstrapAdapter.label}`));
  } else {
    console.log(`${YELLOW}  No greenfield bootstrap adapter is available yet for target "${bootstrapTarget.target}" (${bootstrapTarget.packAdapter}).${RESET}`);
    console.log(dim('  Continuing with a contract-only Decantr workspace so the command stays target-honest instead of writing the wrong runtime.'));
  }

  const packageManager = detectPackageManager();
  if (hasRunnableBootstrap) {
    console.log(heading('Installing dependencies...'));
    try {
      execSync(`${packageManager} install`, { cwd: projectDir, stdio: 'inherit' });
    } catch {
      console.log(`\n${YELLOW}Dependency install failed. Run \`${packageManager} install\` manually.${RESET}`);
    }
  }

  const requiresOfflineContent = Boolean(options.offline && (options.blueprint || options.archetype));
  const seeded = options.offline ? seedOfflineRegistry(projectDir, workspaceRoot) : { seeded: false, strategy: null };
  if (seeded.seeded) {
    console.log(dim(`  Seeded offline registry content from ${seeded.strategy}.`));
  } else if (requiresOfflineContent) {
    console.log(`${YELLOW}  Offline blueprint/archetype resolution requires local registry content.${RESET}`);
    console.log(dim('  No parent workspace cache/custom content or configured decantr-content source was found.'));
    console.log('');
    console.log(success(`\n✓ Project "${projectName}" created!\n`));
    console.log(`  ${cyan('cd ' + projectName)}`);
    console.log(`  ${cyan(packageManager + ' run dev')}`);
    console.log(`  ${cyan('decantr sync')}  ${dim('# when online, then rerun decantr init')}`);
    console.log(`  ${cyan('DECANTR_CONTENT_DIR=/path/to/decantr-content decantr init --existing --offline')}  ${dim('# or seed a local content source')}`);
    console.log('');
    return;
  }

  // 2. Run decantr init inside the new project
  console.log(heading('Initializing Decantr...'));

  // Build the init args to pass through
  const initFlags: string[] = ['--yes', '--existing'];
  if (options.blueprint) initFlags.push(`--blueprint=${options.blueprint}`);
  if (options.archetype) initFlags.push(`--archetype=${options.archetype}`);
  if (options.theme) initFlags.push(`--theme=${options.theme}`);
  if (options.mode) initFlags.push(`--mode=${options.mode}`);
  if (options.shape) initFlags.push(`--shape=${options.shape}`);
  if (options.target) initFlags.push(`--target=${options.target}`);
  if (options.offline) initFlags.push('--offline');
  if (options.registry) initFlags.push(`--registry=${options.registry}`);

  try {
    // Reuse the currently-running CLI entrypoint when available.
    const bundledCliEntrypoint = fileURLToPath(new URL('./bin.js', import.meta.url));
    const cliEntrypoint = existsSync(bundledCliEntrypoint)
      ? bundledCliEntrypoint
      : process.argv[1] && existsSync(process.argv[1]) ? process.argv[1] : null;
    const cliPath = cliEntrypoint
      ? `"${process.execPath}" "${cliEntrypoint}"`
      : 'npx decantr';
    execSync(`${cliPath} init ${initFlags.join(' ')}`, { cwd: projectDir, stdio: 'inherit' });
    if (bootstrapAdapter) {
      bootstrapAdapter.writeProjectFiles(projectDir, title, detectRoutingMode(projectDir));
    }
  } catch {
    console.log(`\n${YELLOW}Decantr init encountered issues. Run \`decantr init\` manually inside ${projectName}/.${RESET}`);
  }

  // 3. Print success
  console.log(success(`\n✓ Project "${projectName}" created!\n`));
  console.log(`  ${cyan('cd ' + projectName)}`);
  if (bootstrapAdapter) {
    console.log(`  ${cyan(packageManager + ' run dev')}`);
  } else {
    console.log(dim(`  Contract-only mode for target ${bootstrapTarget.target}. Bring your own runtime, or rerun ${cyan(`decantr new ${projectName} --target=react`)} for the current starter adapter.`));
  }
  console.log('');
}

function detectPackageManager(): string {
  // Check for lockfiles in cwd (parent project context)
  if (existsSync(join(process.cwd(), 'pnpm-lock.yaml')) || existsSync(join(process.cwd(), 'pnpm-workspace.yaml'))) {
    return 'pnpm';
  }
  if (existsSync(join(process.cwd(), 'yarn.lock'))) {
    return 'yarn';
  }
  if (existsSync(join(process.cwd(), 'bun.lockb')) || existsSync(join(process.cwd(), 'bun.lock'))) {
    return 'bun';
  }
  return 'npm';
}
