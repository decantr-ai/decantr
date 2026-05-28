#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const indexPath = join(repoRoot, 'docs', 'index.html');
const statsPath = join(repoRoot, 'docs', 'stats.json');

const REPO = 'decantr-ai/decantr';
const NPM_PACKAGE = '@decantr/cli';

const fetchJSON = async (url, headers = {}) => {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'decantr-pages-build',
      Accept: 'application/json',
      ...headers,
    },
  });
  if (!res.ok) {
    throw new Error(`GET ${url} → ${res.status} ${res.statusText}`);
  }
  return res.json();
};

const fetchGitHubStars = async () => {
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const repo = await fetchJSON(`https://api.github.com/repos/${REPO}`, headers);
  return {
    stars: repo.stargazers_count ?? 0,
    forks: repo.forks_count ?? 0,
    watchers: repo.subscribers_count ?? 0,
  };
};

const fetchNpmWeeklyDownloads = async () => {
  const encoded = encodeURIComponent(NPM_PACKAGE);
  const data = await fetchJSON(
    `https://api.npmjs.org/downloads/point/last-week/${encoded}`,
  );
  return data.downloads ?? 0;
};

const formatStars = (n) => {
  if (n == null) return '—';
  if (n >= 10000) return `${Math.round(n / 1000)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
};

const formatDownloads = (n) => {
  if (n == null) return '—';
  return n.toLocaleString('en-US');
};

const replaceStat = (html, statName, content) => {
  const pattern = new RegExp(
    `(<[^>]+data-stat="${statName}"[^>]*>)[\\s\\S]*?(</[^>]+>)`,
    'g',
  );
  return html.replace(pattern, `$1${content}$2`);
};

const main = async () => {
  let stars = null;
  let forks = null;
  let weeklyDownloads = null;

  try {
    const gh = await fetchGitHubStars();
    stars = gh.stars;
    forks = gh.forks;
    console.log(`★ ${stars} stars · ${forks} forks`);
  } catch (e) {
    console.warn(`GitHub stats fetch failed: ${e.message}`);
  }

  try {
    weeklyDownloads = await fetchNpmWeeklyDownloads();
    console.log(`↓ ${weeklyDownloads} weekly downloads`);
  } catch (e) {
    console.warn(`npm downloads fetch failed: ${e.message}`);
  }

  const stats = {
    repo: REPO,
    package: NPM_PACKAGE,
    stars,
    forks,
    weeklyDownloads,
    generatedAt: new Date().toISOString(),
  };
  writeFileSync(statsPath, `${JSON.stringify(stats, null, 2)}\n`);
  console.log(`Wrote ${statsPath}`);

  let html = readFileSync(indexPath, 'utf-8');
  html = replaceStat(html, 'stars', `★ ${formatStars(stars)}`);
  html = replaceStat(
    html,
    'weekly-downloads',
    `${formatDownloads(weeklyDownloads)}/wk`,
  );
  writeFileSync(indexPath, html);
  console.log(`Injected live stats into ${indexPath}`);
};

main().catch((e) => {
  console.error(`generate-docs-stats failed: ${e.message}`);
  process.exit(0);
});
