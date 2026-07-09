import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { detectRoutingMode, getBootstrapAdapter, resolveBootstrapTarget } from '../bootstrap.js';
import { seedOfflineRegistry } from '../offline-content.js';
import { sendNewProjectCompletedTelemetry } from '../telemetry.js';

const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';

function heading(text: string): string {
  return `\n${BOLD}${text}${RESET}\n`;
}
function success(text: string): string {
  return `${GREEN}${text}${RESET}`;
}
function error(text: string): string {
  return `${RED}${text}${RESET}`;
}
function dim(text: string): string {
  return `${DIM}${text}${RESET}`;
}
function cyan(text: string): string {
  return `${CYAN}${text}${RESET}`;
}

export interface NewProjectOptions {
  blueprint?: string;
  archetype?: string;
  theme?: string;
  mode?: string;
  shape?: string;
  target?: string;
  offline?: boolean;
  registry?: string;
  workflow?: string;
  adoption?: string;
  assistantBridge?: string;
  telemetry?: boolean;
}

interface ArgvCommand {
  command: string;
  args: string[];
}

const PASSTHROUGH_FLAG_NAMES = [
  'blueprint',
  'archetype',
  'theme',
  'mode',
  'shape',
  'target',
  'registry',
  'assistant-bridge',
] as const;

type PassThroughFlagName = (typeof PASSTHROUGH_FLAG_NAMES)[number];

function validatePassThroughFlagValue(flag: PassThroughFlagName, value: string): string {
  if (value.length === 0) {
    throw new Error(`--${flag} cannot be empty.`);
  }
  if (value.length > 512) {
    throw new Error(`--${flag} is too long.`);
  }
  if (
    Array.from(value).some((character) => {
      const code = character.charCodeAt(0);
      return code <= 0x1f || code === 0x7f;
    })
  ) {
    throw new Error(`--${flag} contains unsupported control characters.`);
  }
  return value;
}

function pushPassThroughFlag(
  flags: string[],
  flag: PassThroughFlagName,
  value: string | undefined,
): void {
  if (value == null) return;
  flags.push(`--${flag}=${validatePassThroughFlagValue(flag, value)}`);
}

export function buildNewProjectInitArgs(
  options: NewProjectOptions,
  inferredAdoption: string,
): string[] {
  const initFlags: string[] = [
    '--yes',
    '--workflow=greenfield',
    `--adoption=${validatePassThroughFlagValue('mode', inferredAdoption)}`,
  ];
  pushPassThroughFlag(initFlags, 'blueprint', options.blueprint);
  pushPassThroughFlag(initFlags, 'archetype', options.archetype);
  pushPassThroughFlag(initFlags, 'theme', options.theme);
  pushPassThroughFlag(initFlags, 'mode', options.mode);
  pushPassThroughFlag(initFlags, 'shape', options.shape);
  pushPassThroughFlag(initFlags, 'target', options.target);
  if (options.offline) initFlags.push('--offline');
  if (options.telemetry) initFlags.push('--telemetry');
  pushPassThroughFlag(initFlags, 'registry', options.registry);
  pushPassThroughFlag(initFlags, 'assistant-bridge', options.assistantBridge);
  return initFlags;
}

function buildNewProjectTelemetryArgs(projectName: string, options: NewProjectOptions): string[] {
  const args = ['new', projectName];
  const flagPairs: Array<[string, string | undefined]> = [
    ['blueprint', options.blueprint],
    ['archetype', options.archetype],
    ['theme', options.theme],
    ['mode', options.mode],
    ['shape', options.shape],
    ['target', options.target],
    ['registry', options.registry],
    ['workflow', options.workflow],
    ['adoption', options.adoption],
    ['assistant-bridge', options.assistantBridge],
  ];

  for (const [flag, value] of flagPairs) {
    if (value) args.push(`--${flag}=${value}`);
  }
  if (options.offline) args.push('--offline');
  if (options.telemetry) args.push('--telemetry');
  return args;
}

function commandForPlatform(command: string): string {
  if (process.platform !== 'win32') {
    return command;
  }
  return /^(?:npm|pnpm|yarn|bun|npx)$/.test(command) ? `${command}.cmd` : command;
}

function runArgvCommand(command: string, args: string[], cwd: string): void {
  // Security: command is selected by Decantr, args are array-based, and shell execution stays off.
  const result = spawnSync(commandForPlatform(command), args, {
    cwd,
    stdio: 'inherit',
    shell: false,
  });

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(' ')}`);
  }
}

function resolveInitCommand(initFlags: string[]): ArgvCommand {
  const bundledCliEntrypoint = fileURLToPath(new URL('./bin.js', import.meta.url));
  const cliEntrypoint = existsSync(bundledCliEntrypoint)
    ? bundledCliEntrypoint
    : process.argv[1] && existsSync(process.argv[1])
      ? process.argv[1]
      : null;

  if (cliEntrypoint) {
    return {
      command: process.execPath,
      args: [cliEntrypoint, 'init', ...initFlags],
    };
  }

  return {
    command: 'npx',
    args: ['decantr', 'init', ...initFlags],
  };
}

export async function cmdNewProject(
  projectName: string,
  options: NewProjectOptions,
): Promise<void> {
  const startedAt = Date.now();
  const workspaceRoot = process.cwd();
  const projectDir = resolve(workspaceRoot, projectName);
  const bootstrapTarget = resolveBootstrapTarget(options.target);
  const bootstrapAdapter = getBootstrapAdapter(bootstrapTarget);
  const inferredAdoption = options.adoption || 'contract-only';
  const shouldBootstrapRuntime = Boolean(bootstrapAdapter && inferredAdoption === 'decantr-css');

  // Validate project name
  if (!/^[a-z0-9][a-z0-9._-]*$/i.test(projectName)) {
    console.error(
      error('Invalid project name. Use alphanumeric characters, hyphens, dots, or underscores.'),
    );
    process.exitCode = 1;
    return;
  }

  // Check directory doesn't already exist
  if (existsSync(projectDir)) {
    console.error(error(`Directory "${projectName}" already exists.`));
    process.exitCode = 1;
    return;
  }

  let initFlags: string[];
  try {
    initFlags = buildNewProjectInitArgs(options, inferredAdoption);
  } catch (err) {
    console.error(error((err as Error).message));
    process.exitCode = 1;
    return;
  }

  console.log(heading(`Creating ${projectName}...`));

  // 1. Create directory
  mkdirSync(projectDir, { recursive: true });
  console.log(dim(`  Created ${projectName}/`));

  const title = projectName.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  if (shouldBootstrapRuntime && bootstrapAdapter) {
    bootstrapAdapter.writeProjectFiles(projectDir, title, 'hash');
    console.log(dim(`  Bootstrapped ${bootstrapAdapter.label}`));
  } else if (bootstrapAdapter) {
    console.log(
      dim(
        `  Skipping runtime bootstrap for adoption=${inferredAdoption}; creating a Decantr contract-only workspace.`,
      ),
    );
  } else {
    console.log(
      `${YELLOW}  No greenfield bootstrap adapter is available yet for target "${bootstrapTarget.target}" (${bootstrapTarget.packAdapter}).${RESET}`,
    );
    console.log(
      dim(
        '  Continuing with a contract-only Decantr workspace so the command stays target-honest instead of writing the wrong runtime.',
      ),
    );
  }

  const packageManager = detectPackageManager();
  if (shouldBootstrapRuntime) {
    console.log(heading('Installing dependencies...'));
    try {
      runArgvCommand(packageManager, ['install'], projectDir);
    } catch {
      console.log(
        `\n${YELLOW}Dependency install failed. Run \`${packageManager} install\` manually.${RESET}`,
      );
    }
  }

  const requiresOfflineContent = Boolean(
    options.offline && (options.blueprint || options.archetype),
  );
  const seeded = options.offline
    ? seedOfflineRegistry(projectDir, workspaceRoot)
    : { seeded: false, strategy: null };
  if (seeded.seeded) {
    console.log(dim(`  Seeded offline official content from ${seeded.strategy}.`));
  } else if (requiresOfflineContent) {
    console.log(
      `${YELLOW}  Offline blueprint/archetype resolution requires local content corpus data.${RESET}`,
    );
    console.log(
      dim(
        '  No parent workspace cache/custom content, configured content source, or installed @decantr/content corpus was found.',
      ),
    );
    console.log('');
    console.log(success(`\n✓ Project "${projectName}" created!\n`));
    console.log(`  ${cyan('cd ' + projectName)}`);
    console.log(`  ${cyan(packageManager + ' run dev')}`);
    console.log(`  ${cyan('decantr sync')}  ${dim('# when online, then rerun decantr init')}`);
    console.log(
      `  ${cyan('DECANTR_CONTENT_DIR=/path/to/content decantr init --existing --offline')}  ${dim('# or seed a local content source')}`,
    );
    console.log('');
    return;
  }

  // 2. Run decantr init inside the new project
  console.log(heading('Initializing Decantr...'));

  try {
    const initCommand = resolveInitCommand(initFlags);
    runArgvCommand(initCommand.command, initCommand.args, projectDir);
    if (shouldBootstrapRuntime && bootstrapAdapter) {
      bootstrapAdapter.writeProjectFiles(projectDir, title, detectRoutingMode(projectDir));
    }
  } catch {
    console.log(
      `\n${YELLOW}Decantr init encountered issues. Run \`decantr init\` manually inside ${projectName}/.${RESET}`,
    );
  }

  // 3. Print success
  console.log(success(`\n✓ Project "${projectName}" created!\n`));
  console.log(`  ${cyan('cd ' + projectName)}`);
  if (shouldBootstrapRuntime) {
    console.log(`  ${cyan(packageManager + ' run dev')}`);
  } else {
    console.log(
      dim(
        `  Contract-only mode for target ${bootstrapTarget.target}. Bring your own runtime, or rerun with ${cyan('--adoption=decantr-css')} for a runnable Decantr CSS starter adapter.`,
      ),
    );
  }
  console.log('');

  if (options.telemetry) {
    await sendNewProjectCompletedTelemetry({
      args: buildNewProjectTelemetryArgs(projectName, options),
      durationMs: Date.now() - startedAt,
      projectRoot: projectDir,
      success: true,
    });
  }
}

function detectPackageManager(): string {
  // Check for lockfiles in cwd (parent project context)
  if (
    existsSync(join(process.cwd(), 'pnpm-lock.yaml')) ||
    existsSync(join(process.cwd(), 'pnpm-workspace.yaml'))
  ) {
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
