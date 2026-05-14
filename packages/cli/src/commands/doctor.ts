import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isV4 } from '@decantr/essence-spec';
import { ARTIFACT_README_PATH } from '../artifacts.js';
import { detectProject } from '../detect.js';
import { localPatternsPath, localRulesPath } from '../local-law.js';
import { resolveWorkspaceInfo } from '../workspace.js';
import { listWorkspaceCandidates, listWorkspaceProjects } from './workspace.js';

const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

type DoctorStatus = 'healthy' | 'needs-setup' | 'needs-attention' | 'needs-migration';
type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun' | 'unknown';

interface DoctorIssue {
  category:
    | 'setup'
    | 'migration'
    | 'ci'
    | 'generated-artifact'
    | 'local-law'
    | 'visual-evidence'
    | 'design-authority'
    | 'workspace';
  severity: 'error' | 'warn' | 'info';
  message: string;
  nextCommand?: string;
}

interface ProjectJson {
  detected?: {
    framework?: string;
    packageManager?: string;
    workspaceRoot?: string;
    appRoot?: string;
  };
  sync?: {
    status?: string;
    registrySource?: string;
  };
  initialized?: {
    version?: string;
    workflowMode?: string;
    adoptionMode?: string;
    projectScope?: string;
  };
}

interface DoctorReport {
  generatedAt: string;
  workspaceRoot: string;
  appRoot: string;
  projectPath: string | null;
  packageManager: PackageManager;
  cli: {
    localDependency: string | null;
    runningVersion: string;
  };
  project: {
    essencePresent: boolean;
    essenceVersion: string | null;
    workflowMode: string | null;
    adoptionMode: string | null;
    syncStatus: string | null;
    artifactReadmePresent: boolean;
  };
  workspace: {
    attachedProjects: string[];
    appCandidates: Array<{ path: string; attached: boolean }>;
  };
  generatedArtifacts: {
    contextDirPresent: boolean;
    packManifestPresent: boolean;
    reviewPackPresent: boolean;
  };
  localLaw: {
    patternsPresent: boolean;
    rulesPresent: boolean;
  };
  visualEvidence: {
    manifestPresent: boolean;
  };
  designAuthority: string[];
  status: DoctorStatus;
  issues: DoctorIssue[];
  recommendedNextCommand: string;
}

function readJson<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as T;
  } catch {
    return null;
  }
}

function readCliPackageVersion(): string {
  const packagePath = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'package.json');
  const srcPackagePath = join(dirname(fileURLToPath(import.meta.url)), '..', 'package.json');
  const pkg =
    readJson<{ version?: string }>(packagePath) ?? readJson<{ version?: string }>(srcPackagePath);
  return pkg?.version ?? 'unknown';
}

function readPackageJson(dir: string): {
  packageManager?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
} | null {
  return readJson(join(dir, 'package.json'));
}

function detectPackageManager(root: string): PackageManager {
  const pkg = readPackageJson(root);
  const declared = pkg?.packageManager?.split('@')[0];
  if (declared === 'pnpm' || declared === 'npm' || declared === 'yarn' || declared === 'bun') {
    return declared;
  }
  if (existsSync(join(root, 'pnpm-lock.yaml'))) return 'pnpm';
  if (existsSync(join(root, 'package-lock.json'))) return 'npm';
  if (existsSync(join(root, 'yarn.lock'))) return 'yarn';
  if (existsSync(join(root, 'bun.lock')) || existsSync(join(root, 'bun.lockb'))) return 'bun';
  return 'unknown';
}

function localCliDependency(root: string): string | null {
  const pkg = readPackageJson(root);
  return pkg?.devDependencies?.['@decantr/cli'] ?? pkg?.dependencies?.['@decantr/cli'] ?? null;
}

function rel(root: string, path: string): string {
  const value = relative(root, path).replace(/\\/g, '/');
  return value || '.';
}

function hasAnyFile(dir: string, names: string[]): string | null {
  for (const name of names) {
    const path = join(dir, name);
    if (existsSync(path)) return name;
  }
  return null;
}

function packageHasDependency(dir: string, names: string[]): boolean {
  const pkg = readPackageJson(dir);
  const deps = { ...pkg?.dependencies, ...pkg?.devDependencies };
  return names.some((name) => Boolean(deps[name]));
}

function detectDesignAuthority(workspaceRoot: string, appRoot: string): string[] {
  const found = new Set<string>();
  const sharedCandidates = [
    'packages/ui',
    'packages/design-system',
    'packages/theme',
    'packages/themes',
    'packages/tokens',
    'packages/components',
    'libs/ui',
    'libs/design-system',
  ];
  for (const candidate of sharedCandidates) {
    if (existsSync(join(workspaceRoot, candidate))) found.add(candidate);
  }

  for (const root of [appRoot, workspaceRoot]) {
    const label = root === appRoot ? 'app' : 'workspace';
    const tailwind = hasAnyFile(root, [
      'tailwind.config.js',
      'tailwind.config.ts',
      'tailwind.config.mjs',
      'tailwind.config.cjs',
    ]);
    if (tailwind) found.add(`${label}:${tailwind}`);
    if (existsSync(join(root, '.storybook'))) found.add(`${label}:.storybook`);
    if (existsSync(join(root, 'components', 'ui'))) found.add(`${label}:components/ui`);
    if (existsSync(join(root, 'src', 'components', 'ui'))) found.add(`${label}:src/components/ui`);
    if (packageHasDependency(root, ['@storybook/react', 'storybook']))
      found.add(`${label}:storybook`);
    if (packageHasDependency(root, ['tailwindcss'])) found.add(`${label}:tailwindcss`);
    if (packageHasDependency(root, ['@radix-ui/react-slot', 'class-variance-authority'])) {
      found.add(`${label}:component-primitives`);
    }
  }

  return [...found].sort();
}

function findCiFiles(root: string): string[] {
  const files: string[] = [];
  const workflows = join(root, '.github', 'workflows');
  if (existsSync(workflows)) {
    for (const entry of readdirSync(workflows, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      const path = join(workflows, entry.name);
      const text = readFileSync(path, 'utf-8');
      if (text.includes('decantr')) files.push(rel(root, path));
    }
  }
  for (const candidate of ['Jenkinsfile', '.gitlab-ci.yml', 'azure-pipelines.yml', 'BUILD']) {
    const path = join(root, candidate);
    if (existsSync(path) && readFileSync(path, 'utf-8').includes('decantr')) {
      files.push(candidate);
    }
  }
  return files.sort();
}

function statusFromIssues(issues: DoctorIssue[], essenceVersion: string | null): DoctorStatus {
  if (!essenceVersion) return 'needs-setup';
  if (essenceVersion && essenceVersion !== '4.0.0') return 'needs-migration';
  if (issues.some((issue) => issue.severity === 'error' || issue.severity === 'warn')) {
    return 'needs-attention';
  }
  return 'healthy';
}

function buildDoctorReport(root: string, args: string[]): DoctorReport {
  const projectIdx = args.indexOf('--project');
  const projectArg = projectIdx !== -1 && args[projectIdx + 1] ? args[projectIdx + 1] : undefined;
  const workspaceMode = args.includes('--workspace');
  const workspaceInfo = resolveWorkspaceInfo(root, projectArg);
  const workspaceRoot = workspaceInfo.workspaceRoot;
  const appRoot = workspaceMode ? workspaceRoot : workspaceInfo.appRoot;
  const projectPath = appRoot === workspaceRoot ? null : rel(workspaceRoot, appRoot);
  const packageManager = detectPackageManager(workspaceRoot);
  const detected = detectProject(appRoot);
  const projectJson = readJson<ProjectJson>(join(appRoot, '.decantr', 'project.json'));
  const essence = readJson<unknown>(join(appRoot, 'decantr.essence.json'));
  const essenceVersion =
    essence && typeof essence === 'object' && 'version' in essence
      ? String((essence as { version?: unknown }).version)
      : null;
  const contextDir = join(appRoot, '.decantr', 'context');
  const packManifestPresent = existsSync(join(contextDir, 'pack-manifest.json'));
  const reviewPackPresent = existsSync(join(contextDir, 'review-pack.json'));
  const artifactReadmePresent = existsSync(join(appRoot, ARTIFACT_README_PATH));
  const projects = listWorkspaceProjects(workspaceRoot);
  const candidates = listWorkspaceCandidates(workspaceRoot, projects).map((candidate) => ({
    path: candidate.path,
    attached: candidate.attached,
  }));
  const designAuthority = detectDesignAuthority(workspaceRoot, appRoot);
  const ciFiles = findCiFiles(workspaceRoot);
  const workflowMode = projectJson?.initialized?.workflowMode ?? null;
  const adoptionMode = projectJson?.initialized?.adoptionMode ?? null;

  const issues: DoctorIssue[] = [];
  if (!essenceVersion && !workspaceMode && !workspaceInfo.requiresProjectSelection) {
    issues.push({
      category: 'setup',
      severity: 'error',
      message: 'No decantr.essence.json found for this app.',
      nextCommand: projectPath
        ? `decantr adopt --project ${projectPath} --yes`
        : 'decantr adopt --yes',
    });
  } else if (essenceVersion && !isV4(essence)) {
    issues.push({
      category: 'migration',
      severity: 'error',
      message: `This app uses Essence ${essenceVersion}; active workflows require Essence v4.0.0.`,
      nextCommand: projectPath
        ? `cd ${projectPath} && decantr migrate --to v4`
        : 'decantr migrate --to v4',
    });
  }

  if (workspaceInfo.requiresProjectSelection && !workspaceMode) {
    issues.push({
      category: 'workspace',
      severity: 'warn',
      message: 'This is a monorepo root. App-scoped commands need --project.',
      nextCommand: `decantr doctor --project ${workspaceInfo.appCandidates[0] ?? 'apps/web'}`,
    });
  }

  if (workspaceMode && projects.length === 0 && candidates.length === 0) {
    issues.push({
      category: 'workspace',
      severity: 'info',
      message: 'No attached Decantr projects or app candidates were detected in this workspace.',
      nextCommand: 'decantr setup',
    });
  }

  if (essenceVersion === '4.0.0' && !artifactReadmePresent) {
    issues.push({
      category: 'generated-artifact',
      severity: 'info',
      message: `${ARTIFACT_README_PATH} is missing, so artifact ownership is not documented locally.`,
      nextCommand: 'decantr refresh',
    });
  }

  if (essenceVersion === '4.0.0' && (!existsSync(contextDir) || !packManifestPresent)) {
    issues.push({
      category: 'generated-artifact',
      severity: 'warn',
      message: 'Generated context packs are missing or incomplete.',
      nextCommand: projectPath ? `decantr refresh --project ${projectPath}` : 'decantr refresh',
    });
  }

  if (workflowMode === 'brownfield-attach' && !existsSync(localPatternsPath(appRoot))) {
    issues.push({
      category: 'local-law',
      severity: 'info',
      message:
        'No accepted local pattern pack was found. Brownfield drift checks are stronger after codifying project-owned UI law.',
      nextCommand: projectPath
        ? `decantr codify --from-audit --project ${projectPath}`
        : 'decantr codify --from-audit',
    });
  }

  if (
    (essenceVersion === '4.0.0' || (workspaceMode && projects.length > 0)) &&
    ciFiles.length === 0
  ) {
    issues.push({
      category: 'ci',
      severity: 'info',
      message: 'No Decantr CI integration was detected at the workspace root.',
      nextCommand: workspaceMode
        ? 'decantr ci init --workspace'
        : projectPath
          ? `decantr ci init --project ${projectPath}`
          : 'decantr ci init',
    });
  }

  if (designAuthority.length === 0 && detected.hasTailwind) {
    issues.push({
      category: 'design-authority',
      severity: 'info',
      message: 'Tailwind is present, but Decantr did not detect a shared UI/tokens authority.',
      nextCommand: projectPath
        ? `decantr codify --from-audit --project ${projectPath}`
        : 'decantr codify --from-audit',
    });
  }

  const status = statusFromIssues(
    issues,
    workspaceMode || workspaceInfo.requiresProjectSelection ? '4.0.0' : essenceVersion,
  );
  const recommendedNextCommand =
    issues.find((issue) => issue.category === 'workspace' && issue.nextCommand)?.nextCommand ??
    issues.find((issue) => issue.nextCommand)?.nextCommand ??
    (workspaceMode
      ? 'decantr ci --workspace'
      : projectPath
        ? `decantr ci --project ${projectPath}`
        : 'decantr ci');

  return {
    generatedAt: new Date().toISOString(),
    workspaceRoot,
    appRoot,
    projectPath,
    packageManager,
    cli: {
      localDependency: localCliDependency(workspaceRoot),
      runningVersion: readCliPackageVersion(),
    },
    project: {
      essencePresent: Boolean(essenceVersion),
      essenceVersion,
      workflowMode,
      adoptionMode,
      syncStatus: projectJson?.sync?.status ?? null,
      artifactReadmePresent,
    },
    workspace: {
      attachedProjects: projects.map((project) => project.path),
      appCandidates: candidates,
    },
    generatedArtifacts: {
      contextDirPresent: existsSync(contextDir),
      packManifestPresent,
      reviewPackPresent,
    },
    localLaw: {
      patternsPresent: existsSync(localPatternsPath(appRoot)),
      rulesPresent: existsSync(localRulesPath(appRoot)),
    },
    visualEvidence: {
      manifestPresent: existsSync(join(appRoot, '.decantr', 'evidence', 'visual-manifest.json')),
    },
    designAuthority,
    status,
    issues,
    recommendedNextCommand,
  };
}

function colorForStatus(status: DoctorStatus): string {
  if (status === 'healthy') return GREEN;
  if (status === 'needs-setup' || status === 'needs-migration') return RED;
  return YELLOW;
}

function formatDoctorText(report: DoctorReport): string {
  const lines = [
    `${BOLD}Decantr Doctor${RESET}`,
    '',
    `${colorForStatus(report.status)}${report.status.toUpperCase()}${RESET}`,
    `${DIM}${report.appRoot}${RESET}`,
    '',
    `${BOLD}Project:${RESET}`,
    `  Workspace root: ${report.workspaceRoot}`,
    `  App root: ${report.appRoot}`,
    `  Package manager: ${report.packageManager}`,
    `  CLI: ${report.cli.localDependency ?? 'not pinned in root package.json'} (running ${report.cli.runningVersion})`,
    `  Essence: ${report.project.essenceVersion ?? 'missing'}`,
    `  Workflow: ${report.project.workflowMode ?? 'unknown'} | adoption ${report.project.adoptionMode ?? 'unknown'}`,
    `  Sync state: ${report.project.syncStatus ?? 'unknown'} ${DIM}(registry/cache state, not generated context freshness)${RESET}`,
    '',
    `${BOLD}Generated Artifacts:${RESET}`,
    `  Context directory: ${report.generatedArtifacts.contextDirPresent ? 'present' : 'missing'}`,
    `  Pack manifest: ${report.generatedArtifacts.packManifestPresent ? 'present' : 'missing'}`,
    `  Review pack: ${report.generatedArtifacts.reviewPackPresent ? 'present' : 'missing'}`,
    `  Artifact guide: ${report.project.artifactReadmePresent ? 'present' : 'missing'}`,
    '',
    `${BOLD}Local Law:${RESET}`,
    `  Local patterns: ${report.localLaw.patternsPresent ? 'present' : 'missing'}`,
    `  Local rules: ${report.localLaw.rulesPresent ? 'present' : 'missing'}`,
    '',
    `${BOLD}Workspace:${RESET}`,
    `  Attached projects: ${report.workspace.attachedProjects.length}`,
    `  App candidates: ${report.workspace.appCandidates.length}`,
  ];

  if (report.designAuthority.length > 0) {
    lines.push('', `${BOLD}Design Authority Signals:${RESET}`);
    for (const item of report.designAuthority.slice(0, 12)) {
      lines.push(`  ${item}`);
    }
  }

  lines.push('', `${BOLD}Findings:${RESET}`);
  if (report.issues.length === 0) {
    lines.push(`  ${GREEN}No doctor findings.${RESET}`);
  } else {
    for (const issue of report.issues) {
      const color = issue.severity === 'error' ? RED : issue.severity === 'warn' ? YELLOW : CYAN;
      lines.push(
        `  ${color}[${issue.severity.toUpperCase()}]${RESET} ${issue.category}: ${issue.message}`,
      );
      if (issue.nextCommand) lines.push(`    ${DIM}${issue.nextCommand}${RESET}`);
    }
  }
  lines.push('', `${BOLD}Next:${RESET}`, `  ${report.recommendedNextCommand}`, '');
  return `${lines.join('\n')}\n`;
}

export function cmdDoctorHelp(): void {
  console.log(`
${BOLD}decantr doctor${RESET} — Explain Decantr state and the next command to run

${BOLD}Usage:${RESET}
  decantr doctor [--project <path>] [--workspace] [--json]

${BOLD}Examples:${RESET}
  decantr doctor
  decantr doctor --project apps/web
  decantr doctor --workspace --json
`);
}

export async function cmdDoctor(
  args: string[] = ['doctor'],
  root: string = process.cwd(),
): Promise<void> {
  const report = buildDoctorReport(root, args);
  if (args.includes('--json')) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  process.stdout.write(formatDoctorText(report));
}
