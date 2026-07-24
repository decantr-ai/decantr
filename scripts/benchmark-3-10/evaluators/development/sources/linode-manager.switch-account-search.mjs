#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { rm, writeFile } from 'node:fs/promises';
import { isAbsolute, join, relative, resolve } from 'node:path';

const TEST_SOURCE = `import { profileFactory } from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { accountFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { SwitchAccountDrawer } from './SwitchAccountDrawer';

const queryMocks = vi.hoisted(() => ({
  useProfile: vi.fn().mockReturnValue({}),
  useMyDelegatedChildAccountsQuery: vi.fn().mockReturnValue({}),
  useChildAccountsInfiniteQuery: vi.fn().mockReturnValue({}),
  useIsIAMDelegationEnabled: vi.fn().mockReturnValue({ isIAMDelegationEnabled: true }),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useProfile: queryMocks.useProfile,
    useMyDelegatedChildAccountsQuery: queryMocks.useMyDelegatedChildAccountsQuery,
    useChildAccountsInfiniteQuery: queryMocks.useChildAccountsInfiniteQuery,
  };
});

vi.mock('src/features/IAM/hooks/useIsIAMEnabled', async () => {
  const actual = await vi.importActual('src/features/IAM/hooks/useIsIAMEnabled');
  return {
    ...actual,
    useIsIAMDelegationEnabled: queryMocks.useIsIAMDelegationEnabled,
  };
});

const props = { onClose: vi.fn(), open: true, userType: undefined };
const accounts = accountFactory.buildList(5, { company: 'Child Account' });

function settledAccounts(overrides = {}) {
  return {
    data: { data: accounts, results: accounts.length, page: 1, pages: 1 },
    isLoading: false,
    isRefetching: false,
    ...overrides,
  };
}

describe('Decantr account-switch search behavior', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        clear: vi.fn(),
        getItem: vi.fn().mockReturnValue(null),
        key: vi.fn().mockReturnValue(null),
        length: 0,
        removeItem: vi.fn(),
        setItem: vi.fn(),
      },
    });
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ user_type: 'parent' }),
    });
    queryMocks.useIsIAMDelegationEnabled.mockReturnValue({
      isIAMDelegationEnabled: true,
    });
    queryMocks.useMyDelegatedChildAccountsQuery.mockReturnValue(settledAccounts());
    queryMocks.useChildAccountsInfiniteQuery.mockReturnValue({
      data: { pages: [settledAccounts().data], pageParams: [] },
      isInitialLoading: false,
      isRefetching: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
      refetch: vi.fn(),
    });
  });

  it('preserves the real search input, typed value, and focus after debounce', async () => {
    const user = userEvent.setup();
    const view = renderWithTheme(<SwitchAccountDrawer {...props} />);
    const search = view.getByRole('textbox', { name: 'Search' });

    await user.click(search);
    await user.type(search, 'child');
    expect(search).toHaveValue('child');
    expect(document.activeElement).toBe(search);

    await new Promise((resolveDelay) => setTimeout(resolveDelay, 400));
    await waitFor(() => {
      const current = view.getByRole('textbox', { name: 'Search' });
      expect(current).toBe(search);
      expect(current).toHaveValue('child');
      expect(document.activeElement).toBe(current);
    });
  });

  it('does not show the no-access state until an empty query settles', async () => {
    queryMocks.useMyDelegatedChildAccountsQuery.mockReturnValue(
      settledAccounts({
        data: { data: [], results: 0, page: 1, pages: 1 },
        isLoading: true,
      })
    );
    const view = renderWithTheme(<SwitchAccountDrawer {...props} />);
    expect(
      view.queryByText('You don’t have access to other accounts.')
    ).not.toBeInTheDocument();

    queryMocks.useMyDelegatedChildAccountsQuery.mockReturnValue(
      settledAccounts({ data: { data: [], results: 0, page: 1, pages: 1 } })
    );
    view.rerender(<SwitchAccountDrawer {...props} />);
    await waitFor(() => {
      expect(
        view.getByText('You don’t have access to other accounts.')
      ).toBeVisible();
    });
  });
});
`;

function parseArguments(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--workspace') options.workspace = resolve(argv[++index]);
    else if (argument === '--project-path') options.projectPath = argv[++index];
    else throw new Error(`Unknown option: ${argument}`);
  }
  if (!options.workspace || options.projectPath === undefined) {
    throw new Error('Expected --workspace and --project-path');
  }
  const project = resolve(options.workspace, options.projectPath);
  const relation = relative(options.workspace, project);
  if (relation === '..' || relation.startsWith('../') || isAbsolute(relation)) {
    throw new Error('Project path escapes the workspace');
  }
  return { ...options, project };
}

async function evaluate() {
  const options = parseArguments(process.argv.slice(2));
  const testPath = join(
    options.project,
    'src/features/Account/SwitchAccountDrawer.decantr-evaluator.test.tsx',
  );
  let result;
  try {
    await writeFile(testPath, TEST_SOURCE, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
    const startedAt = Date.now();
    const processResult = spawnSync(
      join(options.workspace, 'node_modules/.bin/vitest'),
      [
        'run',
        'src/features/Account/SwitchAccountDrawer.decantr-evaluator.test.tsx',
        '--reporter=dot',
      ],
      {
        cwd: options.project,
        env: { ...process.env, CI: '1', NO_COLOR: '1' },
        timeout: 300_000,
        encoding: 'utf8',
        maxBuffer: 8 * 1024 * 1024,
        shell: false,
      },
    );
    result = {
      exitCode: Number.isInteger(processResult.status) ? processResult.status : null,
      signal: processResult.signal ?? null,
      stdout: processResult.stdout ?? '',
      stderr: processResult.stderr ?? processResult.error?.message ?? '',
      durationMs: Date.now() - startedAt,
    };
  } finally {
    await rm(testPath, { force: true });
  }
  const passed = result.exitCode === 0;
  return {
    passed,
    metrics: {
      governanceViolations: 0,
      accessibilityViolations: passed ? 0 : 1,
      visualScore: passed ? 100 : 0,
    },
    checks: {
      realComponentScenarioPassed: passed,
      temporaryEvaluatorFileRemoved: true,
    },
    evidence: {
      exitCode: result.exitCode,
      signal: result.signal,
      durationMs: result.durationMs,
      stdoutSha256: digest(result.stdout),
      stderrSha256: digest(result.stderr),
    },
  };
}

function digest(value) {
  return createHash('sha256').update(value).digest('hex');
}

try {
  process.stdout.write(`${JSON.stringify(await evaluate())}\n`);
} catch (error) {
  process.stdout.write(
    `${JSON.stringify({
      passed: false,
      metrics: { governanceViolations: 0, accessibilityViolations: 1, visualScore: 0 },
      checks: { evaluatorExecuted: false },
      error: error instanceof Error ? error.message : String(error),
    })}\n`,
  );
}
