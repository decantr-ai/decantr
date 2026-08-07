import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, realpathSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import type {
  ChangeAssuranceSelection,
  GovernanceComparisonScopeV1,
  GovernanceGitChangeBaseV1,
} from '@decantr/verifier';
import { resolveWorkspaceInfo, type WorkspaceInfo } from './workspace.js';

export interface GitChangeScopeEvidence {
  comparisonScope: GovernanceComparisonScopeV1;
  changeBase: GovernanceGitChangeBaseV1;
}

export interface ChangeAssuranceProjectResolution {
  workspaceInfo: WorkspaceInfo;
  projectPath: string;
  selection: ChangeAssuranceSelection;
  git: GitChangeScopeEvidence;
}

function gitOutput(root: string, args: string[]): string {
  return execFileSync('git', args, {
    cwd: root,
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function outputPaths(output: string): string[] {
  return output
    .split(/\r?\n/u)
    .map((path) => path.trim().replace(/\\/gu, '/').replace(/^\.\//u, ''))
    .filter(Boolean);
}

function hashChangeBase(value: {
  headRef: string | null;
  mergeBase: string | null;
  changedFiles: string[];
}): string {
  const canonical = JSON.stringify({
    changedFiles: [...value.changedFiles].sort(),
    headRef: value.headRef,
    mergeBase: value.mergeBase,
  });
  return `sha256:${createHash('sha256').update(canonical).digest('hex')}`;
}

function unknownGitScope(message: string): GitChangeScopeEvidence {
  return {
    comparisonScope: { kind: 'unknown', identity: null },
    changeBase: {
      identity: null,
      hash: null,
      baseRef: null,
      headRef: null,
      mergeBase: null,
      completeness: 'incomplete',
      changedFiles: [],
      changedRoutes: [],
      impactedNodeIds: [],
      unresolvedFiles: [],
      limitations: [message],
    },
  };
}

export function collectGitChangeScope(
  workspaceRoot: string,
  since?: string,
): GitChangeScopeEvidence {
  const root = realpathSync(resolve(workspaceRoot));
  try {
    const gitRoot = resolve(gitOutput(root, ['rev-parse', '--show-toplevel']));
    if (gitRoot !== root) {
      return unknownGitScope(
        `Selected workspace root ${root} does not match the Git root ${gitRoot}.`,
      );
    }
    let head: string | null = null;
    try {
      head = gitOutput(root, ['rev-parse', '--verify', 'HEAD^{commit}']);
    } catch {
      head = null;
    }
    if (since) {
      if (!head) throw new Error('HEAD does not exist, so --since cannot resolve a commit range.');
      const base = gitOutput(root, ['rev-parse', '--verify', `${since}^{commit}`]);
      const mergeBase = gitOutput(root, ['merge-base', base, head]);
      const changedFiles = [
        ...new Set(
          outputPaths(
            gitOutput(root, ['diff', '--name-only', '--find-renames', mergeBase, head, '--']),
          ),
        ),
      ].sort();
      const identity = `${mergeBase}..${head}`;
      return {
        comparisonScope: { kind: 'commit_range', identity },
        changeBase: {
          identity: `git:commit-range:${identity}`,
          hash: hashChangeBase({ headRef: head, mergeBase, changedFiles }),
          baseRef: since,
          headRef: head,
          mergeBase,
          completeness: 'complete',
          changedFiles,
          changedRoutes: [],
          impactedNodeIds: [],
          unresolvedFiles: [],
          limitations: [],
        },
      };
    }

    if (!head) {
      const staged = outputPaths(gitOutput(root, ['diff', '--cached', '--name-only', '--']));
      const untracked = outputPaths(
        gitOutput(root, ['ls-files', '--others', '--exclude-standard']),
      );
      const changedFiles = [...new Set([...staged, ...untracked])].sort();
      return {
        comparisonScope: { kind: 'working_tree', identity: 'UNBORN+working-tree' },
        changeBase: {
          identity: 'git:working-tree:unborn',
          hash: hashChangeBase({ headRef: null, mergeBase: null, changedFiles }),
          baseRef: null,
          headRef: null,
          mergeBase: null,
          completeness: 'complete',
          changedFiles,
          changedRoutes: [],
          impactedNodeIds: [],
          unresolvedFiles: [],
          limitations: [
            'The repository has no first commit; assurance covers staged and untracked files.',
          ],
        },
      };
    }

    const tracked = outputPaths(
      gitOutput(root, ['diff', '--name-only', '--find-renames', 'HEAD', '--']),
    );
    const untracked = outputPaths(gitOutput(root, ['ls-files', '--others', '--exclude-standard']));
    const changedFiles = [...new Set([...tracked, ...untracked])].sort();
    const identity = `HEAD+working-tree:${head}`;
    return {
      comparisonScope: { kind: 'working_tree', identity },
      changeBase: {
        identity: `git:working-tree:${head}`,
        hash: hashChangeBase({ headRef: head, mergeBase: head, changedFiles }),
        baseRef: 'HEAD',
        headRef: head,
        mergeBase: head,
        completeness: 'complete',
        changedFiles,
        changedRoutes: [],
        impactedNodeIds: [],
        unresolvedFiles: [],
        limitations: [],
      },
    };
  } catch (error) {
    return unknownGitScope(
      `Git change scope could not be established: ${(error as Error).message}`,
    );
  }
}

function scopedPath(path: string, projectPath: string): string | null {
  if (projectPath === '.') return path;
  const prefix = `${projectPath.replace(/\/$/u, '')}/`;
  return path.startsWith(prefix) ? path.slice(prefix.length) : null;
}

export function scopeGitChangeEvidence(
  git: GitChangeScopeEvidence,
  projectPath: string,
): GitChangeScopeEvidence {
  const changedFiles = git.changeBase.changedFiles
    .map((file) => scopedPath(file, projectPath))
    .filter((file): file is string => Boolean(file))
    .sort();
  return {
    comparisonScope: git.comparisonScope,
    changeBase: {
      ...git.changeBase,
      hash: git.changeBase.hash
        ? hashChangeBase({
            headRef: git.changeBase.headRef,
            mergeBase: git.changeBase.mergeBase,
            changedFiles,
          })
        : null,
      changedFiles,
    },
  };
}

function candidateTouched(changedFiles: string[], candidatePath: string): boolean {
  const prefix = `${candidatePath.replace(/\/$/u, '')}/`;
  return changedFiles.some((file) => file.startsWith(prefix));
}

function selectedWorkspaceInfo(cwd: string, projectPath: string): WorkspaceInfo {
  return resolveWorkspaceInfo(cwd, projectPath);
}

export function resolveChangeAssuranceProject(
  cwd: string,
  projectArg?: string,
  since?: string,
): ChangeAssuranceProjectResolution {
  const initial = resolveWorkspaceInfo(cwd, projectArg);
  if (projectArg && !existsSync(initial.appRoot)) {
    throw new Error(`Project path does not exist: ${projectArg}`);
  }
  const workspaceGit = collectGitChangeScope(initial.workspaceRoot, since);

  if (projectArg) {
    const projectPath =
      relative(initial.workspaceRoot, initial.appRoot).replace(/\\/gu, '/') || '.';
    return {
      workspaceInfo: initial,
      projectPath,
      selection: {
        strategy: 'explicit',
        evidence: [`Selected by --project ${projectArg}.`],
      },
      git: scopeGitChangeEvidence(workspaceGit, projectPath),
    };
  }

  if (!initial.requiresProjectSelection) {
    const projectPath =
      relative(initial.workspaceRoot, initial.appRoot).replace(/\\/gu, '/') || '.';
    return {
      workspaceInfo: initial,
      projectPath,
      selection: {
        strategy: 'current-directory',
        evidence: [`Selected current app directory "${projectPath}".`],
      },
      git: scopeGitChangeEvidence(workspaceGit, projectPath),
    };
  }

  const touched = initial.appCandidateDetails.filter((candidate) =>
    candidateTouched(workspaceGit.changeBase.changedFiles, candidate.path),
  );
  if (touched.length > 1) {
    throw new Error(
      `Changed files span multiple app candidates: ${touched.map((candidate) => candidate.path).join(', ')}. Use --project <path> for one app or --workspace for workspace health.`,
    );
  }
  if (touched.length === 1) {
    const candidate = touched[0]!;
    const workspaceInfo = selectedWorkspaceInfo(cwd, candidate.path);
    return {
      workspaceInfo,
      projectPath: candidate.path,
      selection: {
        strategy: 'changed-files',
        evidence: [`All changed app files resolve to ${candidate.path}.`, candidate.reason],
      },
      git: scopeGitChangeEvidence(workspaceGit, candidate.path),
    };
  }

  throw new Error(
    `No single app can be selected safely. Use --project <path>. Candidates: ${initial.appCandidateDetails
      .map((candidate) => `${candidate.path} (${candidate.category}, ${candidate.score})`)
      .join(', ')}`,
  );
}
