import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const repoRoot = new URL('..', import.meta.url);
const files = [
  'README.md',
  'docs/index.html',
  'docs/llms.txt',
  'docs/README.md',
  'packages/cli/README.md',
  'packages/mcp-server/README.md',
  'packages/registry/README.md',
  'packages/verifier/README.md',
  'packages/vite-plugin/README.md',
];

const LINK_PATTERN = /\[[^\]]+\]\((https?:\/\/[^)\s]+)(?:\s+"[^"]*")?\)|href=["'](https?:\/\/[^"']+)["']/g;
const PUBLIC_DECANTR_HOSTS = new Set(['decantr.ai', 'registry.decantr.ai', 'api.decantr.ai']);

const urls = new Set();

for (const file of files) {
  const text = readFileSync(join(repoRoot.pathname, file), 'utf8');
  for (const match of text.matchAll(LINK_PATTERN)) {
    const raw = match[1] || match[2];
    if (!raw) continue;
    const url = new URL(raw);
    if (!PUBLIC_DECANTR_HOSTS.has(url.hostname)) continue;
    url.hash = '';
    urls.add(url.toString());
  }
}

const failures = [];

for (const url of [...urls].sort()) {
  if (url.startsWith('https://decantr.ai/')) {
    const pathname = new URL(url).pathname;
    const candidates = pathname === '/'
      ? ['docs/index.html']
      : [
          `docs${pathname}`,
          `docs${pathname.replace(/\/$/, '')}.html`,
          `docs${pathname.replace(/\/$/, '')}.md`,
          `docs${pathname.replace(/\/$/, '')}/index.html`,
        ];

    if (!candidates.some((candidate) => existsSync(join(repoRoot.pathname, candidate)))) {
      failures.push(`missing local docs route ${url}`);
    }
    continue;
  }

  try {
    const response = await fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(10_000),
    });

    const host = new URL(url).hostname;
    const expectedProtectedApi = host === 'api.decantr.ai' && response.status === 401;

    if (!expectedProtectedApi && (response.status < 200 || response.status >= 400)) {
      failures.push(`${response.status} ${url}${response.headers.get('location') ? ` -> ${response.headers.get('location')}` : ''}`);
    }
  } catch (error) {
    failures.push(`${url}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failures.length > 0) {
  console.error(`Public link audit failed: ${failures.length} broken link(s).`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Public link audit passed: ${urls.size} Decantr public URLs checked.`);
