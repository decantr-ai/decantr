import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isV4 } from '@decantr/essence-spec';
import { collectMissingPackManifestFiles } from '@decantr/verifier';
import { ARTIFACT_README_PATH } from '../artifacts.js';
import { detectProject } from '../detect.js';
import { localPatternsPath, localRulesPath } from '../local-law.js';
import { styleBridgePath, styleBridgeProposalPath } from '../style-bridge.js';
import { resolveWorkspaceInfo } from '../workspace.js';
import { buildGraphArtifacts } from './graph.js';
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
type AdoptionLaneId =
  | 'workspace'
  | 'unattached'
  | 'brownfield-contract-only'
  | 'hybrid-local-law'
  | 'hybrid-style-bridge'
  | 'hybrid-decantr-css'
  | 'hybrid-compose'
  | 'greenfield-contract-only'
  | 'greenfield-scaffold';

interface DoctorIssue {
  category:
    | 'setup'
    | 'migration'
    | 'ci'
    | 'generated-artifact'
    | 'graph'
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
    missingReferencedFiles: string[];
    graphSnapshotPresent: boolean;
    graphCapsulePresent: boolean;
    graphArtifactsCurrent: boolean | null;
    graphStaleArtifacts: string[];
    graphError: string | null;
  };
  localLaw: {
    patternsPresent: boolean;
    rulesPresent: boolean;
    styleBridgePresent: boolean;
    styleBridgeProposalPresent: boolean;
  };
  visualEvidence: {
    manifestPresent: boolean;
  };
  lane: {
    id: AdoptionLaneId;
    label: string;
    sourceAuthority: string;
    styleAuthority: string;
    activeAuthorities: string[];
    nextChoice: string;
  };
  designAuthority: string[];
  status: DoctorStatus;
  issues: DoctorIssue[];
  recommendedNextCommand: string;
  recommendedNextCommands: string[];
}

function readJson<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as T;
  } catch {
    return null;
  }
}

function isContractOnlyProject(projectRoot: string): boolean {
  const projectJson = readJson<ProjectJson>(join(projectRoot, '.decantr', 'project.json'));
  return (
    projectJson?.initialized?.adoptionMode === 'contract-only' ||
    projectJson?.initialized?.adoptionMode === 'style-bridge'
  );
}

function readCliPackageVersion(): string {
  const packagePath = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'package.json');
  const srcPackagePath = join(dirname(fileURLToPath(import.meta.url)), '..', 'package.json');
  const pkg =
    readJson<{ version?: string }>(packagePath) ?? readJson<{ version?: string }>(srcPackagePath);
  return pkg?.version ?? 'unknown';
}

function readPackageJson(dir: string): {
  workspaces?: string[] | { packages?: string[] };
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

function hasWorkspaceMarker(root: string): boolean {
  const pkg = readPackageJson(root);
  return Boolean(
    existsSync(join(root, 'pnpm-workspace.yaml')) ||
      existsSync(join(root, 'turbo.json')) ||
      existsSync(join(root, 'nx.json')) ||
      pkg?.workspaces,
  );
}

function pinCliCommand(packageManager: PackageManager, root: string): string {
  switch (packageManager) {
    case 'pnpm':
      return hasWorkspaceMarker(root) ? 'pnpm add -D -w @decantr/cli' : 'pnpm add -D @decantr/cli';
    case 'yarn':
      return 'yarn add -D @decantr/cli';
    case 'bun':
      return 'bun add -d @decantr/cli';
    case 'npm':
      return 'npm install -D @decantr/cli';
    default:
      return 'npm install -D @decantr/cli';
  }
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

function appendUnique(commands: string[], command: string | undefined): void {
  if (!command) return;
  if (!commands.includes(command)) commands.push(command);
}

function deriveAdoptionLane(input: {
  workspaceMode: boolean;
  essenceVersion: string | null;
  workflowMode: string | null;
  adoptionMode: string | null;
  localPatternsPresent: boolean;
  localRulesPresent: boolean;
  styleBridgePresent: boolean;
  designAuthority: string[];
  packManifestPresent: boolean;
}): DoctorReport['lane'] {
  if (input.workspaceMode) {
    return {
      id: 'workspace',
      label: 'Workspace overview',
      sourceAuthority: 'Each attached app keeps its own Decantr contract and source authority.',
      styleAuthority: 'Per-app adoption mode',
      activeAuthorities: ['workspace project list', 'attached app contracts'],
      nextChoice: 'Pick an app with --project when you want route-level or source-level guidance.',
    };
  }
  if (!input.essenceVersion) {
    return {
      id: 'unattached',
      label: 'Unattached app',
      sourceAuthority: 'Existing app only',
      styleAuthority: 'Existing app styling system',
      activeAuthorities: ['source tree'],
      nextChoice:
        'Run decantr adopt to attach an observed contract before choosing Brownfield or Hybrid law.',
    };
  }

  const hasLocalLaw = input.localPatternsPresent || input.localRulesPresent;
  const hasStyleBridge = input.styleBridgePresent || input.adoptionMode === 'style-bridge';
  if (input.workflowMode === 'hybrid-compose') {
    return {
      id: 'hybrid-compose',
      label: 'Hybrid composition',
      sourceAuthority: 'Existing app plus selected Decantr/local law',
      styleAuthority:
        input.adoptionMode === 'decantr-css'
          ? 'Decantr CSS runtime is active where adopted'
          : hasStyleBridge
            ? 'Style bridge maps Decantr intent into the app styling system'
            : 'Existing app styling system remains primary',
      activeAuthorities: [
        'existing source',
        'Essence V4 contract',
        hasStyleBridge ? 'accepted style bridge' : 'no style bridge',
        hasLocalLaw ? 'accepted local law' : 'reviewed Hybrid choices',
        input.packManifestPresent ? 'hosted execution packs' : 'optional hosted packs',
      ],
      nextChoice:
        'Use task/verify for daily work and keep any hosted pattern adoption mapped into project-owned law.',
    };
  }
  if (input.workflowMode === 'brownfield-attach') {
    if (input.adoptionMode === 'decantr-css') {
      return {
        id: 'hybrid-decantr-css',
        label: 'Hybrid with Decantr CSS',
        sourceAuthority: 'Existing app plus explicitly adopted Decantr CSS runtime',
        styleAuthority: 'Decantr CSS runtime is active where adopted',
        activeAuthorities: ['existing source', 'Essence V4 contract', 'Decantr CSS runtime'],
        nextChoice:
          'Keep Decantr CSS usage explicit and validate route changes with task and verify.',
      };
    }
    if (hasStyleBridge) {
      return {
        id: 'hybrid-style-bridge',
        label: 'Hybrid style bridge',
        sourceAuthority: 'Existing app plus Decantr intent mapped through a style bridge',
        styleAuthority: 'Style bridge over the existing app styling system',
        activeAuthorities: [
          'existing source',
          'Essence V4 contract',
          'accepted style bridge',
          hasLocalLaw ? 'accepted local patterns/rules' : 'optional local law',
        ],
        nextChoice:
          'Use local law to decide which component families the bridge governs before making it strict.',
      };
    }
    if (hasLocalLaw) {
      return {
        id: 'hybrid-local-law',
        label: 'Hybrid local law',
        sourceAuthority: 'Existing app plus accepted project-owned UI law',
        styleAuthority:
          input.designAuthority.length > 0
            ? 'Existing design authority plus accepted local rules'
            : 'Accepted local rules over the current app styling system',
        activeAuthorities: [
          'existing source',
          'Essence V4 contract',
          'accepted local patterns/rules',
          input.packManifestPresent
            ? 'hosted execution packs as guidance'
            : 'optional hosted packs',
        ],
        nextChoice:
          'Use task before edits and verify --local-patterns after edits; map hosted patterns into local law before enforcing them.',
      };
    }
    return {
      id: 'brownfield-contract-only',
      label: 'Brownfield contract-only',
      sourceAuthority: 'Existing app is authoritative',
      styleAuthority: 'Existing app styling system',
      activeAuthorities: ['existing source', 'Essence V4 contract'],
      nextChoice:
        'Stay contract-only for context, or codify local patterns/rules when you want Hybrid drift control.',
    };
  }
  if (input.workflowMode === 'greenfield-contract-only') {
    return {
      id: 'greenfield-contract-only',
      label: 'Greenfield contract-only',
      sourceAuthority: 'Essence V4 contract',
      styleAuthority: 'Project-chosen styling system',
      activeAuthorities: ['Essence V4 contract', 'generated context'],
      nextChoice: 'Add local rules or a style bridge only after the runtime conventions are clear.',
    };
  }
  return {
    id: 'greenfield-scaffold',
    label: 'Greenfield scaffold',
    sourceAuthority: 'Decantr contract and certified adapter output',
    styleAuthority:
      input.adoptionMode === 'contract-only' ? 'Project-chosen styling system' : 'Decantr CSS',
    activeAuthorities: ['Essence V4 contract', 'adapter output', 'execution packs'],
    nextChoice: 'Use task and verify to keep generated routes aligned with the compiled contract.',
  };
}

function inspectGraphArtifacts(
  appRoot: string,
  workspaceRoot: string,
): {
  snapshotPresent: boolean;
  capsulePresent: boolean;
  artifactsCurrent: boolean | null;
  staleArtifacts: string[];
  error: string | null;
} {
  const snapshotPath = join(appRoot, '.decantr', 'graph', 'graph.snapshot.json');
  const capsulePath = join(appRoot, '.decantr', 'graph', 'contract-capsule.json');
  try {
    const artifacts = buildGraphArtifacts(appRoot);
    return {
      snapshotPresent: existsSync(snapshotPath),
      capsulePresent: existsSync(capsulePath),
      artifactsCurrent: artifacts ? artifacts.staleArtifacts.length === 0 : null,
      staleArtifacts: artifacts
        ? artifacts.staleArtifacts.map((path) => rel(workspaceRoot, path))
        : [],
      error: null,
    };
  } catch (error) {
    return {
      snapshotPresent: existsSync(snapshotPath),
      capsulePresent: existsSync(capsulePath),
      artifactsCurrent: false,
      staleArtifacts: [],
      error: (error as Error).message,
    };
  }
}

function buildDoctorReport(root: string, args: string[]): DoctorReport {
  let projectArg: string | undefined;
  for (let index = 1; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--project' && args[index + 1]) projectArg = args[++index];
    else if (arg.startsWith('--project=')) projectArg = arg.slice('--project='.length);
  }
  const workspaceMode = args.includes('--workspace');
  const workspaceInfo = resolveWorkspaceInfo(root, projectArg);
  const workspaceRoot = workspaceInfo.workspaceRoot;
  const appRoot = workspaceMode ? workspaceRoot : workspaceInfo.appRoot;
  const projectMissing = Boolean(projectArg && !existsSync(appRoot));
  const projectPath = appRoot === workspaceRoot ? null : rel(workspaceRoot, appRoot);
  const packageManager = detectPackageManager(workspaceRoot);
  const cliDependency = localCliDependency(workspaceRoot);
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
  const packHydrationOptional = adoptionMode === 'contract-only' || adoptionMode === 'style-bridge';
  const localPatternsPresent = existsSync(localPatternsPath(appRoot));
  const localRulesPresent = existsSync(localRulesPath(appRoot));
  const styleBridgePresent = existsSync(styleBridgePath(appRoot));
  const styleBridgeProposalPresent = existsSync(styleBridgeProposalPath(appRoot));
  const graphArtifacts = inspectGraphArtifacts(appRoot, workspaceRoot);
  const missingPackReferences = workspaceMode
    ? projects.flatMap((project) =>
        collectMissingPackManifestFiles(join(workspaceRoot, project.path)).map(
          (missing) => `${project.path}/${missing.relativePath}`,
        ),
      )
    : collectMissingPackManifestFiles(appRoot).map((missing) => missing.relativePath);
  const workspaceProjectsMissingManifest = workspaceMode
    ? projects
        .map((project) => project.path)
        .filter((projectPath) => {
          const projectContextDir = join(workspaceRoot, projectPath, '.decantr', 'context');
          return (
            !isContractOnlyProject(join(workspaceRoot, projectPath)) &&
            !existsSync(join(projectContextDir, 'pack-manifest.json'))
          );
        })
    : [];
  const workspaceProjectsMissingReviewPack = workspaceMode
    ? projects
        .map((project) => project.path)
        .filter((projectPath) => {
          const projectContextDir = join(workspaceRoot, projectPath, '.decantr', 'context');
          return (
            !isContractOnlyProject(join(workspaceRoot, projectPath)) &&
            !existsSync(join(projectContextDir, 'review-pack.json'))
          );
        })
    : [];

  const issues: DoctorIssue[] = [];
  if (projectMissing) {
    issues.push({
      category: 'workspace',
      severity: 'error',
      message: `Project path does not exist: ${projectArg}`,
      nextCommand: 'decantr workspace list',
    });
  } else if (!essenceVersion && !workspaceMode && !workspaceInfo.requiresProjectSelection) {
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

  if ((essenceVersion === '4.0.0' || workspaceMode || projects.length > 0) && !cliDependency) {
    issues.push({
      category: 'ci',
      severity: 'info',
      message: '@decantr/cli is not pinned in the workspace root package.json.',
      nextCommand: pinCliCommand(packageManager, workspaceRoot),
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

  if (
    essenceVersion === '4.0.0' &&
    !packHydrationOptional &&
    (!existsSync(contextDir) || !packManifestPresent)
  ) {
    issues.push({
      category: 'generated-artifact',
      severity: 'warn',
      message: 'Generated context packs are missing or incomplete.',
      nextCommand: projectPath
        ? `decantr registry compile-packs ${projectPath}/decantr.essence.json --write-context`
        : 'decantr registry compile-packs decantr.essence.json --write-context',
    });
  }

  if (essenceVersion === '4.0.0' && missingPackReferences.length > 0) {
    issues.push({
      category: 'generated-artifact',
      severity: 'warn',
      message: `Generated pack manifest references ${missingPackReferences.length} missing file(s).`,
      nextCommand: projectPath
        ? `decantr registry compile-packs ${projectPath}/decantr.essence.json --write-context`
        : 'decantr registry compile-packs decantr.essence.json --write-context',
    });
  }

  if (
    essenceVersion === '4.0.0' &&
    (Boolean(projectJson) || graphArtifacts.snapshotPresent || graphArtifacts.capsulePresent) &&
    (graphArtifacts.error || graphArtifacts.artifactsCurrent === false)
  ) {
    issues.push({
      category: 'graph',
      severity: 'warn',
      message: graphArtifacts.error
        ? `Typed Contract graph could not be derived: ${graphArtifacts.error}`
        : 'Typed Contract graph artifacts are missing or stale.',
      nextCommand: projectPath ? `decantr graph --project ${projectPath}` : 'decantr graph',
    });
  }

  if (
    workspaceMode &&
    (workspaceProjectsMissingManifest.length > 0 ||
      workspaceProjectsMissingReviewPack.length > 0 ||
      missingPackReferences.length > 0)
  ) {
    issues.push({
      category: 'generated-artifact',
      severity: 'warn',
      message:
        'One or more attached workspace projects have missing or incomplete generated context packs.',
      nextCommand: 'decantr registry compile-packs <app-path>/decantr.essence.json --write-context',
    });
  }

  if (workflowMode === 'brownfield-attach' && !localPatternsPresent) {
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

  if (adoptionMode === 'style-bridge' && !styleBridgePresent) {
    issues.push({
      category: 'local-law',
      severity: 'warn',
      message:
        'This app declares style-bridge adoption, but .decantr/style-bridge.json is missing.',
      nextCommand: styleBridgeProposalPresent
        ? projectPath
          ? `decantr codify --accept --project ${projectPath}`
          : 'decantr codify --accept'
        : projectPath
          ? `decantr codify --style-bridge --project ${projectPath}`
          : 'decantr codify --style-bridge',
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
  const lane = deriveAdoptionLane({
    workspaceMode: workspaceMode || workspaceInfo.requiresProjectSelection,
    essenceVersion,
    workflowMode,
    adoptionMode,
    localPatternsPresent,
    localRulesPresent,
    styleBridgePresent,
    designAuthority,
    packManifestPresent,
  });
  const projectFlag = projectPath ? ` --project ${projectPath}` : '';
  const verifyCommand =
    workflowMode === 'brownfield-attach'
      ? `decantr verify --brownfield --local-patterns${projectFlag}`
      : workspaceMode
        ? 'decantr ci --workspace'
        : `decantr verify${projectFlag}`;
  const ciCommand = workspaceMode
    ? 'decantr ci --workspace --fail-on error'
    : `decantr ci${projectFlag} --fail-on error`;
  const recommendedNextCommands: string[] = [];
  const blockingIssue =
    issues.find((issue) => issue.category === 'workspace' && issue.nextCommand) ??
    issues.find(
      (issue) =>
        (issue.category === 'setup' || issue.category === 'migration') && issue.nextCommand,
    );
  if (blockingIssue) {
    appendUnique(recommendedNextCommands, blockingIssue.nextCommand);
  } else {
    appendUnique(
      recommendedNextCommands,
      issues.find((issue) => issue.category === 'ci' && issue.message.includes('not pinned'))
        ?.nextCommand,
    );
    appendUnique(
      recommendedNextCommands,
      issues.find((issue) => issue.category === 'graph')?.nextCommand,
    );
    if (workflowMode === 'brownfield-attach' && !localPatternsPresent) {
      appendUnique(recommendedNextCommands, `decantr codify --from-audit${projectFlag}`);
      appendUnique(recommendedNextCommands, `decantr codify --accept${projectFlag}`);
    }
    if (adoptionMode === 'style-bridge' && !styleBridgePresent) {
      appendUnique(
        recommendedNextCommands,
        styleBridgeProposalPresent
          ? `decantr codify --accept${projectFlag}`
          : `decantr codify --style-bridge${projectFlag}`,
      );
    }
    appendUnique(
      recommendedNextCommands,
      issues.find((issue) => issue.category === 'generated-artifact')?.nextCommand,
    );
    appendUnique(
      recommendedNextCommands,
      issues.find((issue) => issue.category === 'ci' && issue.message.includes('No Decantr CI'))
        ?.nextCommand,
    );
    if (workflowMode === 'brownfield-attach') {
      appendUnique(recommendedNextCommands, `decantr task <route> "<change>"${projectFlag}`);
    }
    appendUnique(recommendedNextCommands, verifyCommand);
    appendUnique(recommendedNextCommands, ciCommand);
  }
  const recommendedNextCommand = recommendedNextCommands[0] ?? ciCommand;

  return {
    generatedAt: new Date().toISOString(),
    workspaceRoot,
    appRoot,
    projectPath,
    packageManager,
    cli: {
      localDependency: cliDependency,
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
      contextDirPresent: workspaceMode
        ? projects.some((project) =>
            existsSync(join(workspaceRoot, project.path, '.decantr', 'context')),
          )
        : existsSync(contextDir),
      packManifestPresent: workspaceMode
        ? projects.length > 0 && workspaceProjectsMissingManifest.length === 0
        : packManifestPresent,
      reviewPackPresent: workspaceMode
        ? projects.length > 0 && workspaceProjectsMissingReviewPack.length === 0
        : reviewPackPresent,
      missingReferencedFiles: missingPackReferences.slice(0, 25),
      graphSnapshotPresent: graphArtifacts.snapshotPresent,
      graphCapsulePresent: graphArtifacts.capsulePresent,
      graphArtifactsCurrent: graphArtifacts.artifactsCurrent,
      graphStaleArtifacts: graphArtifacts.staleArtifacts.slice(0, 25),
      graphError: graphArtifacts.error,
    },
    localLaw: {
      patternsPresent: localPatternsPresent,
      rulesPresent: localRulesPresent,
      styleBridgePresent,
      styleBridgeProposalPresent,
    },
    visualEvidence: {
      manifestPresent: existsSync(join(appRoot, '.decantr', 'evidence', 'visual-manifest.json')),
    },
    lane,
    designAuthority,
    status,
    issues,
    recommendedNextCommand,
    recommendedNextCommands,
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
    `${BOLD}Adoption Lane:${RESET}`,
    `  ${report.lane.label}`,
    `  Source authority: ${report.lane.sourceAuthority}`,
    `  Style authority: ${report.lane.styleAuthority}`,
    `  Active: ${report.lane.activeAuthorities.join(', ')}`,
    `  Choice: ${report.lane.nextChoice}`,
    '',
    `${BOLD}Generated Artifacts:${RESET}`,
    `  Context directory: ${report.generatedArtifacts.contextDirPresent ? 'present' : 'missing'}`,
    `  Pack manifest: ${report.generatedArtifacts.packManifestPresent ? 'present' : 'missing'}`,
    `  Review pack: ${report.generatedArtifacts.reviewPackPresent ? 'present' : 'missing'}`,
    `  Manifest references: ${
      report.generatedArtifacts.missingReferencedFiles.length === 0
        ? 'complete'
        : `${report.generatedArtifacts.missingReferencedFiles.length} missing`
    }`,
    `  Artifact guide: ${report.project.artifactReadmePresent ? 'present' : 'missing'}`,
    `  Typed graph: ${
      report.generatedArtifacts.graphError
        ? 'error'
        : report.generatedArtifacts.graphArtifactsCurrent === true
          ? 'current'
          : report.generatedArtifacts.graphArtifactsCurrent === false
            ? 'stale or missing'
            : 'not generated'
    }`,
    `  Graph capsule: ${report.generatedArtifacts.graphCapsulePresent ? 'present' : 'missing'}`,
    '',
    `${BOLD}Local Law:${RESET}`,
    `  Local patterns: ${report.localLaw.patternsPresent ? 'present' : 'missing'}`,
    `  Local rules: ${report.localLaw.rulesPresent ? 'present' : 'missing'}`,
    `  Style bridge: ${
      report.localLaw.styleBridgePresent
        ? 'present'
        : report.localLaw.styleBridgeProposalPresent
          ? 'proposal pending'
          : 'missing'
    }`,
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
  lines.push('', `${BOLD}Next steps:${RESET}`);
  for (const [index, command] of report.recommendedNextCommands.entries()) {
    lines.push(`  ${index + 1}. ${command}`);
  }
  if (report.recommendedNextCommands.length === 0) {
    lines.push(`  ${report.recommendedNextCommand}`);
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}

export function cmdDoctorHelp(): void {
  console.log(`
${BOLD}decantr doctor${RESET} — Explain Decantr state and the next commands to run

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
    if (report.issues.some((issue) => issue.severity === 'error')) process.exitCode = 1;
    return;
  }
  process.stdout.write(formatDoctorText(report));
  if (report.issues.some((issue) => issue.severity === 'error')) process.exitCode = 1;
}
