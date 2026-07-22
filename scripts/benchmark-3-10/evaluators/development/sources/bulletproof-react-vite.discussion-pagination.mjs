#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

function parseArgs(argv) {
  const options = { projectPath: '.' };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--workspace') options.workspace = argv[++index];
    else if (argv[index] === '--project-path') options.projectPath = argv[++index];
    else throw new Error(`Unknown option: ${argv[index]}`);
  }
  if (!options.workspace) throw new Error('--workspace is required');
  return options;
}

async function optionalRead(path) {
  try {
    return await readFile(path, 'utf8');
  } catch (error) {
    if (error && error.code === 'ENOENT') return '';
    throw error;
  }
}

function pagedMock(source) {
  return (
    /searchParams\s*\.\s*get\s*\(\s*['"]page['"]\s*\)/u.test(source) &&
    /\btake\s*:\s*\d+/u.test(source) &&
    /\bskip\s*:\s*\d+\s*\*\s*\(\s*page\s*-\s*1\s*\)/u.test(source) &&
    /\bmeta\s*:\s*\{[\s\S]{0,200}\bpage\b[\s\S]{0,120}\btotal\b[\s\S]{0,120}\btotalPages\b/u.test(
      source,
    )
  );
}

function emit(checks) {
  const failures = checks.filter((check) => !check.passed);
  const accessibilityViolations = checks.filter(
    (check) => check.accessibility === true && !check.passed,
  ).length;
  console.log(
    JSON.stringify({
      passed: failures.length === 0,
      metrics: {
        governanceViolations: 0,
        accessibilityViolations,
        visualScore: Math.round((100 * (checks.length - failures.length)) / checks.length),
        behaviorChecksPassed: checks.length - failures.length,
        behaviorChecksTotal: checks.length,
      },
      checks,
    }),
  );
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const root = resolve(options.workspace, options.projectPath);
  const paths = {
    route: 'src/app/routes/app/discussions/discussions.tsx',
    discussionsApi: 'src/features/discussions/api/get-discussions.ts',
    discussionsList: 'src/features/discussions/components/discussions-list.tsx',
    pagination: 'src/components/ui/table/pagination.tsx',
    commentsApi: 'src/features/comments/api/get-comments.ts',
    commentsList: 'src/features/comments/components/comments-list.tsx',
    discussionsMock: 'src/testing/mocks/handlers/discussions.ts',
    commentsMock: 'src/testing/mocks/handlers/comments.ts',
  };
  const entries = await Promise.all(
    Object.entries(paths).map(async ([key, path]) => [key, await optionalRead(resolve(root, path))]),
  );
  const source = Object.fromEntries(entries);

  const currentPageIsVisible =
    /<PaginationLink[^>]*(?:isActive|aria-current)[^>]*>[\s\S]{0,120}\{\s*currentPage\s*\}/u.test(
      source.pagination,
    ) ||
    /<PaginationItem[^>]*className\s*=\s*["'][^"']+["'][^>]*>\s*<PaginationLink[^>]*createHref\s*\(\s*currentPage\s*\)[^>]*>[\s\S]{0,100}\{\s*currentPage\s*\}/u.test(
      source.pagination,
    );
  const previousNumberedLink =
    /<PaginationLink[^>]*createHref\s*\(\s*currentPage\s*-\s*1\s*\)[^>]*>[\s\S]{0,100}\{\s*currentPage\s*-\s*1\s*\}/u.test(
      source.pagination,
    );
  const nextNumberedLink =
    /<PaginationLink[^>]*createHref\s*\(\s*currentPage\s*\+\s*1\s*\)[^>]*>[\s\S]{0,100}\{\s*currentPage\s*\+\s*1\s*\}/u.test(
      source.pagination,
    );

  emit([
    {
      id: 'loader-reads-page-from-url',
      passed:
        /new URL\s*\(\s*request\.url\s*\)/u.test(source.route) &&
        /searchParams\s*\.\s*get\s*\(\s*['"]page['"]\s*\)/u.test(source.route) &&
        /getDiscussionsQueryOptions\s*\(\s*\{[\s\S]{0,80}\bpage\b/u.test(source.route),
    },
    {
      id: 'discussion-query-is-page-keyed',
      passed:
        /params\s*:\s*\{[\s\S]{0,120}\bpage\b/u.test(source.discussionsApi) &&
        /queryKey\s*:[\s\S]{0,180}\bpage\b/u.test(source.discussionsApi) &&
        /queryFn\s*:[\s\S]{0,100}getDiscussions\s*\(\s*page\s*\)/u.test(source.discussionsApi),
    },
    {
      id: 'list-uses-url-page-and-server-meta',
      passed:
        /useSearchParams\s*\(/u.test(source.discussionsList) &&
        /useDiscussions\s*\(\s*\{[\s\S]{0,180}\bpage\b/u.test(source.discussionsList) &&
        /totalPages\s*:\s*meta\.totalPages/u.test(source.discussionsList) &&
        /currentPage\s*:\s*meta\.page/u.test(source.discussionsList),
    },
    {
      id: 'local-discussion-api-paginates',
      passed: pagedMock(source.discussionsMock),
    },
    {
      id: 'pagination-has-navigation-label',
      accessibility: true,
      passed: /<nav[\s\S]{0,260}aria-label\s*=\s*['"]pagination['"]/u.test(source.pagination),
    },
    {
      id: 'current-page-is-visually-distinct',
      passed: currentPageIsVisible,
    },
    {
      id: 'numbered-navigation-exposes-adjacent-pages',
      passed:
        previousNumberedLink &&
        nextNumberedLink &&
        /createHref\s*\(\s*currentPage\s*\)/u.test(source.pagination),
    },
    {
      id: 'numbered-navigation-is-bounded',
      passed:
        /currentPage\s*>\s*2[\s\S]{0,240}PaginationEllipsis/u.test(source.pagination) &&
        /totalPages\s*>\s*currentPage\s*\+\s*1[\s\S]{0,240}PaginationEllipsis/u.test(
          source.pagination,
        ),
    },
    {
      id: 'comments-use-page-aware-infinite-query',
      passed:
        /infiniteQueryOptions\s*\(/u.test(source.commentsApi) &&
        /params\s*:\s*\{[\s\S]{0,160}\bpage\b/u.test(source.commentsApi) &&
        /pageParam/u.test(source.commentsApi) &&
        /getNextPageParam/u.test(source.commentsApi) &&
        /initialPageParam\s*:\s*1/u.test(source.commentsApi),
    },
    {
      id: 'local-comments-api-paginates',
      passed: pagedMock(source.commentsMock),
    },
    {
      id: 'load-more-accumulates-pages',
      passed:
        /pages\s*\.\s*flatMap\s*\(/u.test(source.commentsList) &&
        /hasNextPage/u.test(source.commentsList) &&
        /fetchNextPage\s*\(/u.test(source.commentsList) &&
        /isFetchingNextPage/u.test(source.commentsList) &&
        /Load More Comments/u.test(source.commentsList),
    },
    {
      id: 'empty-comments-state-preserved',
      passed:
        /!comments\?\.length[\s\S]{0,600}(?:No Comments Found|role\s*=\s*['"]list['"])/u.test(
          source.commentsList,
        ),
    },
  ]);
}

main().catch((error) =>
  emit([{ id: 'oracle-execution', passed: false, detail: error instanceof Error ? error.message : String(error) }]),
);
