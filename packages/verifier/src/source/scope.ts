export type ProjectSourceScope =
  | 'production'
  | 'package'
  | 'story'
  | 'example'
  | 'test'
  | 'fixture'
  | 'generated'
  | 'build-output'
  | 'supporting';

const BUILD_OUTPUT_RE =
  /(?:^|\/)(?:\.next|\.nuxt|\.svelte-kit|coverage|dist|build|out|target)(?:\/|$)/iu;
const GENERATED_RE =
  /(?:^|\/)(?:__generated__|generated)(?:\/|$)|(?:\.gen|\.generated|\.d)\.[cm]?[jt]sx?$/iu;
const TEST_RE =
  /(?:^|\/)(?:__tests__|cypress|e2e|playwright|specs?|tests?)(?:\/|$)|\.(?:cy|e2e|spec|test|vitest)\.[cm]?[jt]sx?$/iu;
const FIXTURE_RE =
  /(?:^|\/)(?:__fixtures__|fixtures?|mocks?)(?:\/|$)|\.(?:fixture|mock)\.[cm]?[jt]sx?$/iu;
const STORY_RE = /(?:^|\/)(?:\.storybook|stories|storybook)(?:\/|$)|\.stories?\.[cm]?[jt]sx?$/iu;
const EXAMPLE_RE = /(?:^|\/)(?:demos?|examples?|playgrounds?|samples?)(?:\/|$)/iu;
const SUPPORTING_RE =
  /(?:^|\/)(?:scripts?|tools?|benchmarks?|docs?|test-utils?|support)(?:\/|$)|\.figma\.[cm]?[jt]sx?$/iu;
const PACKAGE_RE = /(?:^|\/)packages?\/[^/]+\/(?:src\/)?/iu;

export function classifyProjectSourceScope(path: string): ProjectSourceScope {
  const normalized = path.replace(/\\/gu, '/');
  if (BUILD_OUTPUT_RE.test(normalized)) return 'build-output';
  if (GENERATED_RE.test(normalized)) return 'generated';
  if (STORY_RE.test(normalized)) return 'story';
  if (TEST_RE.test(normalized)) return 'test';
  if (FIXTURE_RE.test(normalized)) return 'fixture';
  if (EXAMPLE_RE.test(normalized)) return 'example';
  if (SUPPORTING_RE.test(normalized)) return 'supporting';
  if (PACKAGE_RE.test(normalized)) return 'package';
  return 'production';
}

export function isProductionAuthorityScope(scope: ProjectSourceScope): boolean {
  return scope === 'production' || scope === 'package';
}

export function isProductionAuthorityPath(path: string): boolean {
  return isProductionAuthorityScope(classifyProjectSourceScope(path));
}
