import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import type { DiscoveryConfidenceLevel } from './discovery.js';
import { classifyProjectSourceScope, type ProjectSourceScope } from './source/scope.js';

export type UIEvidenceAdapterKind =
  | 'storybook'
  | 'figma-code-connect'
  | 'design-tokens'
  | 'project-tests'
  | 'runtime'
  | 'visual'
  | 'accessibility';

export type UIEvidenceAdapterStatus = 'absent' | 'configured' | 'available';
export type UIEvidenceFileRole = 'configuration' | 'source' | 'artifact';

export interface UIEvidenceFile {
  file: string;
  role: UIEvidenceFileRole;
  scope: ProjectSourceScope | 'runtime-evidence';
}

export interface UIEvidenceAdapter {
  kind: UIEvidenceAdapterKind;
  status: UIEvidenceAdapterStatus;
  confidence: DiscoveryConfidenceLevel;
  files: UIEvidenceFile[];
  evidence: string[];
  limitations: string[];
}

export interface UIEvidenceAdapters {
  storybook: UIEvidenceAdapter;
  figmaCodeConnect: UIEvidenceAdapter;
  designTokens: UIEvidenceAdapter;
  projectTests: UIEvidenceAdapter;
  runtime: UIEvidenceAdapter;
  visual: UIEvidenceAdapter;
  accessibility: UIEvidenceAdapter;
}

export interface DiscoverUIEvidenceAdaptersInput {
  projectRoot: string;
  files: string[];
  dependencies: Record<string, string>;
}

const MAX_KNOWN_DIRECTORY_FILES = 500;
const MAX_ADAPTER_FILES = 100;
const MAX_INSPECTED_SOURCE_FILES = 500;
const MAX_INSPECTED_FILE_BYTES = 256 * 1024;

const STORY_SOURCE_RE = /\.stories?\.(?:[cm]?[jt]sx?|mdx)$/iu;
const STORYBOOK_CONFIG_RE =
  /(?:^|\/)\.storybook\/(?:main|preview|manager|test-runner|preview-head)\.(?:[cm]?[jt]s|json)$/iu;
const FIGMA_SOURCE_RE = /\.figma\.(?:[cm]?[jt]sx?)$/iu;
const FIGMA_CONFIG_RE = /(?:^|\/)figma\.config\.json$/iu;
const TOKEN_PATH_RE =
  /(?:^|\/)(?:design[-_]?tokens?|tokens?)(?:\/|\.(?:jsonc?|ya?ml|[cm]?[jt]s)$)|(?:^|\/)(?:style-dictionary|token-transformer)\.config\.[cm]?[jt]s$/iu;
const TOKEN_CONFIG_RE = /(?:^|\/)(?:style-dictionary|token-transformer)\.config\.[cm]?[jt]s$/iu;
const TEST_CONFIG_RE =
  /(?:^|\/)(?:vitest|jest|playwright|cypress)(?:\.config)?\.(?:[cm]?[jt]s|json)$/iu;
const COLLECTED_EVIDENCE_RE = /(?:^|\/)\.decantr\/(?:browser-evidence|evidence|runtime)(?:\/|$)/iu;
const RUNTIME_ARTIFACT_RE =
  /(?:^|\/)\.decantr\/(?:browser-evidence|runtime)(?:\/|$)|(?:^|\/)\.decantr\/evidence\/(?:browser|runtime)(?:\/|$)|(?:browser|runtime)[-_]?(?:evidence|probe|report)/iu;
const VISUAL_ARTIFACT_RE =
  /(?:visual|screenshot|snapshot|baseline|diff)|\.(?:avif|gif|jpe?g|png|webp)$/iu;
const ACCESSIBILITY_ARTIFACT_RE = /(?:accessibility|a11y|axe|wcag)/iu;
const VISUAL_TEST_SIGNAL_RE = /\b(?:toHaveScreenshot|matchImageSnapshot|toMatchImageSnapshot)\b/u;
const ACCESSIBILITY_TEST_SIGNAL_RE =
  /\b(?:axe-core|jest-axe|pa11y|toHaveNoViolations|accessibility|a11y)\b/iu;
const EXCLUDED_EVIDENCE_CONTEXT_RE =
  /(?:^|\/)(?:build|coverage|demos?|dist|examples?|fixtures?|generated|__generated__|mocks?|out|playgrounds?|samples?|target)(?:\/|$)|(?:\.fixture|\.mock|\.gen|\.generated|\.d)\.[cm]?[jt]sx?$/iu;

const STORYBOOK_DEPENDENCIES = [
  'storybook',
  '@storybook/react',
  '@storybook/vue3',
  '@storybook/angular',
  '@storybook/svelte',
  '@storybook/web-components',
];
const FIGMA_DEPENDENCIES = ['@figma/code-connect'];
const TOKEN_DEPENDENCIES = [
  'style-dictionary',
  '@tokens-studio/sd-transforms',
  'token-transformer',
];
const TEST_DEPENDENCIES = ['vitest', 'jest', '@playwright/test', 'playwright', 'cypress'];
const VISUAL_DEPENDENCIES = [
  'chromatic',
  '@chromatic-com/storybook',
  'pixelmatch',
  'reg-suit',
  'jest-image-snapshot',
];
const ACCESSIBILITY_DEPENDENCIES = [
  'axe-core',
  '@axe-core/playwright',
  '@axe-core/react',
  'jest-axe',
  'pa11y',
];

export function discoverUIEvidenceAdapters(
  input: DiscoverUIEvidenceAdaptersInput,
): UIEvidenceAdapters {
  const files = collectCandidateFiles(input.projectRoot, input.files);
  const productionEvidenceFiles = files.filter(isProjectSourceEvidencePath);
  const storySources = files.filter(
    (file) => STORY_SOURCE_RE.test(file) && !EXCLUDED_EVIDENCE_CONTEXT_RE.test(file),
  );
  const storybookConfigs = files.filter((file) => STORYBOOK_CONFIG_RE.test(file));
  const figmaSources = productionEvidenceFiles.filter((file) => FIGMA_SOURCE_RE.test(file));
  const figmaConfigs = productionEvidenceFiles.filter((file) => FIGMA_CONFIG_RE.test(file));
  const tokenCandidates = productionEvidenceFiles.filter((file) => TOKEN_PATH_RE.test(file));
  const tokenConfigs = tokenCandidates.filter((file) => TOKEN_CONFIG_RE.test(file));
  const tokenSources = tokenCandidates.filter(
    (file) => !TOKEN_CONFIG_RE.test(file) && hasTokenDocumentSignal(input.projectRoot, file),
  );
  const projectTests = files.filter(
    (file) =>
      classifyProjectSourceScope(file) === 'test' && !EXCLUDED_EVIDENCE_CONTEXT_RE.test(file),
  );
  const testConfigs = productionEvidenceFiles.filter((file) => TEST_CONFIG_RE.test(file));
  const collectedEvidenceArtifacts = files.filter(
    (file) => COLLECTED_EVIDENCE_RE.test(file) && isReportableArtifact(file),
  );
  const runtimeArtifacts = collectedEvidenceArtifacts.filter((file) =>
    RUNTIME_ARTIFACT_RE.test(file),
  );
  const inspectedTests = projectTests.slice(0, MAX_INSPECTED_SOURCE_FILES);
  const visualTestSources = inspectedTests.filter((file) =>
    fileContains(input.projectRoot, file, VISUAL_TEST_SIGNAL_RE),
  );
  const accessibilityTestSources = inspectedTests.filter((file) =>
    fileContains(input.projectRoot, file, ACCESSIBILITY_TEST_SIGNAL_RE),
  );
  const visualArtifacts = collectedEvidenceArtifacts.filter((file) =>
    VISUAL_ARTIFACT_RE.test(file),
  );
  const accessibilityArtifacts = collectedEvidenceArtifacts.filter((file) =>
    ACCESSIBILITY_ARTIFACT_RE.test(file),
  );

  return {
    storybook: createAdapter({
      kind: 'storybook',
      available: storySources,
      configured: storybookConfigs,
      dependencyConfigured: hasDependency(input.dependencies, STORYBOOK_DEPENDENCIES),
      availableEvidence: `${storySources.length} selected-app Storybook source file(s) found.`,
      configuredEvidence: 'Storybook configuration or dependency found for the selected app.',
      absentLimitation: 'No Storybook configuration or story source was found in the selected app.',
      availableLimitation:
        'Story source is static project evidence; rendered story coverage is not proven.',
      roles: { available: 'source', configured: 'configuration' },
    }),
    figmaCodeConnect: createAdapter({
      kind: 'figma-code-connect',
      available: figmaSources,
      configured: figmaConfigs,
      dependencyConfigured: hasDependency(input.dependencies, FIGMA_DEPENDENCIES),
      availableEvidence: `${figmaSources.length} production-scoped Figma Code Connect source file(s) found.`,
      configuredEvidence:
        'Figma Code Connect configuration or dependency found for the selected app.',
      absentLimitation:
        'No production-scoped Figma Code Connect configuration or source was found.',
      availableLimitation: 'Static Code Connect files do not prove a successful Figma publication.',
      roles: { available: 'source', configured: 'configuration' },
    }),
    designTokens: createAdapter({
      kind: 'design-tokens',
      available: tokenSources,
      configured: tokenConfigs,
      dependencyConfigured: hasDependency(input.dependencies, TOKEN_DEPENDENCIES),
      availableEvidence: `${tokenSources.length} production-scoped design-token document(s) with token value markers found.`,
      configuredEvidence: 'Design-token tooling or configuration found for the selected app.',
      absentLimitation: 'No production-scoped DTCG/design-token source or configuration was found.',
      availableLimitation:
        'Token markers were detected statically; schema validity and runtime consumption are not proven.',
      roles: { available: 'source', configured: 'configuration' },
    }),
    projectTests: createAdapter({
      kind: 'project-tests',
      available: projectTests,
      configured: testConfigs,
      dependencyConfigured: hasDependency(input.dependencies, TEST_DEPENDENCIES),
      availableEvidence: `${projectTests.length} selected-app project test source file(s) found.`,
      configuredEvidence: 'Project test configuration or dependency found for the selected app.',
      absentLimitation: 'No selected-app project test source or configuration was found.',
      availableLimitation:
        'Test source presence does not prove that the tests pass or cover this UI task.',
      roles: { available: 'source', configured: 'configuration' },
    }),
    runtime: createAdapter({
      kind: 'runtime',
      available: runtimeArtifacts,
      configured: [],
      dependencyConfigured: false,
      availableEvidence: `${runtimeArtifacts.length} project-owned runtime evidence artifact(s) found.`,
      configuredEvidence: '',
      absentLimitation: 'No project-owned runtime evidence artifact was found.',
      availableLimitation: 'Runtime evidence freshness and target coverage require verification.',
      roles: { available: 'artifact', configured: 'configuration' },
      runtimeEvidence: true,
    }),
    visual: createAdapter({
      kind: 'visual',
      available: visualArtifacts,
      configured: visualTestSources,
      dependencyConfigured: hasDependency(input.dependencies, VISUAL_DEPENDENCIES),
      availableEvidence: `${visualArtifacts.length} project-owned visual evidence artifact(s) found.`,
      configuredEvidence: 'Visual comparison tooling or screenshot assertion source found.',
      absentLimitation: 'No visual evidence artifact or visual comparison configuration was found.',
      availableLimitation:
        'Visual evidence freshness, baseline approval, and target coverage are not proven.',
      roles: { available: 'artifact', configured: 'source' },
      runtimeEvidence: true,
    }),
    accessibility: createAdapter({
      kind: 'accessibility',
      available: accessibilityArtifacts,
      configured: accessibilityTestSources,
      dependencyConfigured: hasDependency(input.dependencies, ACCESSIBILITY_DEPENDENCIES),
      availableEvidence: `${accessibilityArtifacts.length} project-owned accessibility evidence artifact(s) found.`,
      configuredEvidence: 'Accessibility tooling or accessibility assertion source found.',
      absentLimitation:
        'No accessibility evidence artifact or accessibility test configuration was found.',
      availableLimitation:
        'Accessibility evidence freshness, pass state, and target coverage are not proven.',
      roles: { available: 'artifact', configured: 'source' },
      runtimeEvidence: true,
    }),
  };
}

interface CreateAdapterInput {
  kind: UIEvidenceAdapterKind;
  available: string[];
  configured: string[];
  dependencyConfigured: boolean;
  availableEvidence: string;
  configuredEvidence: string;
  absentLimitation: string;
  availableLimitation: string;
  roles: {
    available: UIEvidenceFileRole;
    configured: UIEvidenceFileRole;
  };
  runtimeEvidence?: boolean;
}

function createAdapter(input: CreateAdapterInput): UIEvidenceAdapter {
  const available = unique(input.available);
  const configured = unique(input.configured).filter((file) => !available.includes(file));
  const status: UIEvidenceAdapterStatus =
    available.length > 0
      ? 'available'
      : configured.length > 0 || input.dependencyConfigured
        ? 'configured'
        : 'absent';
  const files = [
    ...available.map((file) => evidenceFile(file, input.roles.available, input.runtimeEvidence)),
    ...configured.map((file) => evidenceFile(file, input.roles.configured, input.runtimeEvidence)),
  ].slice(0, MAX_ADAPTER_FILES);
  const evidence =
    status === 'available'
      ? [input.availableEvidence]
      : status === 'configured'
        ? [input.configuredEvidence]
        : [];
  if (input.dependencyConfigured) {
    evidence.push(`${input.kind} dependency signal found in the selected package manifest.`);
  }
  const limitations =
    status === 'available'
      ? [input.availableLimitation]
      : status === 'configured'
        ? [`${input.kind} is configured, but no collected evidence artifact/source was found.`]
        : [input.absentLimitation];
  if (available.length + configured.length > MAX_ADAPTER_FILES) {
    limitations.push(`File reporting was capped at ${MAX_ADAPTER_FILES} entries.`);
  }
  return {
    kind: input.kind,
    status,
    confidence: status === 'available' ? 'high' : status === 'configured' ? 'medium' : 'low',
    files,
    evidence: unique(evidence.filter(Boolean)),
    limitations: unique(limitations),
  };
}

function evidenceFile(
  file: string,
  role: UIEvidenceFileRole,
  runtimeEvidence = false,
): UIEvidenceFile {
  return {
    file,
    role,
    scope: runtimeEvidence ? 'runtime-evidence' : classifyProjectSourceScope(file),
  };
}

function collectCandidateFiles(projectRoot: string, files: string[]): string[] {
  return unique([
    ...files,
    ...walkKnownDirectory(projectRoot, '.storybook'),
    ...walkKnownDirectory(projectRoot, '.decantr/browser-evidence'),
    ...walkKnownDirectory(projectRoot, '.decantr/evidence'),
    ...walkKnownDirectory(projectRoot, '.decantr/runtime'),
  ]).sort();
}

function walkKnownDirectory(projectRoot: string, relativeDirectory: string): string[] {
  const root = join(projectRoot, relativeDirectory);
  if (!existsSync(root)) return [];
  const files: string[] = [];
  const pending = [root];
  while (pending.length > 0 && files.length < MAX_KNOWN_DIRECTORY_FILES) {
    const directory = pending.pop();
    if (!directory) break;
    let entries: import('node:fs').Dirent[];
    try {
      entries = readdirSync(directory, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (files.length >= MAX_KNOWN_DIRECTORY_FILES) break;
      const fullPath = join(directory, entry.name);
      if (entry.isDirectory()) {
        pending.push(fullPath);
      } else if (entry.isFile()) {
        files.push(relative(projectRoot, fullPath).replace(/\\/gu, '/'));
      }
    }
  }
  return files;
}

function isProjectSourceEvidencePath(file: string): boolean {
  const scope = classifyProjectSourceScope(file);
  return scope === 'production' || scope === 'package' || scope === 'supporting';
}

function isReportableArtifact(file: string): boolean {
  return !/(?:^|\/)(?:README(?:\.[^/]*)?|\.gitkeep|\.DS_Store)$/iu.test(file);
}

function hasTokenDocumentSignal(projectRoot: string, file: string): boolean {
  if (TOKEN_CONFIG_RE.test(file)) return false;
  return (
    fileContains(projectRoot, file, /["']\$(?:value|type)["']\s*:/u) ||
    fileContains(projectRoot, file, /["'](?:value|type)["']\s*:/u) ||
    fileContains(projectRoot, file, /(?:^|[\r\n])\s*\$?(?:value|type)\s*:/mu)
  );
}

function fileContains(projectRoot: string, file: string, pattern: RegExp): boolean {
  try {
    const path = join(projectRoot, file);
    const stat = statSync(path);
    if (!stat.isFile() || stat.size > MAX_INSPECTED_FILE_BYTES) return false;
    return pattern.test(readFileSync(path, 'utf8'));
  } catch {
    return false;
  }
}

function hasDependency(dependencies: Record<string, string>, names: string[]): boolean {
  return names.some((name) => Boolean(dependencies[name]));
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}
