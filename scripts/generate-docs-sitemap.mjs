import { execFileSync } from 'node:child_process';
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const docsDir = join(repoRoot, 'docs');
const siteUrl = normalizeSiteUrl(process.env.DECANTR_SITE_URL || 'https://decantr.ai');
const outputPath = join(docsDir, 'sitemap.xml');

const INDEXABLE_EXTENSIONS = new Set(['.html', '.md', '.json']);
const EXCLUDED_FILES = new Set([
  'CNAME',
  'README.md',
  'decantr.essence.json',
  'sitemap.xml',
]);
const EXCLUDED_PATH_PREFIXES = [
  'audit/',
  'benchmarks/',
  'legacy/',
  'programs/',
];

const entries = walkDocs(docsDir)
  .filter(isIndexableFile)
  .map((filePath) => ({
    loc: toPublicUrl(filePath),
    lastmod: getLastModified(filePath),
    priority: getPriority(filePath),
    changefreq: getChangeFrequency(filePath),
  }))
  .sort((a, b) => a.loc.localeCompare(b.loc));

writeFileSync(outputPath, renderSitemap(entries));
console.log(`Generated ${outputPath} with ${entries.length} URLs.`);

function normalizeSiteUrl(value) {
  return value.trim().replace(/\/+$/, '');
}

function walkDocs(dir) {
  const files = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDocs(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function isIndexableFile(filePath) {
  const rel = normalizePath(relative(docsDir, filePath));
  const filename = rel.split('/').at(-1) ?? rel;
  if (EXCLUDED_FILES.has(rel) || EXCLUDED_FILES.has(filename)) return false;
  if (EXCLUDED_PATH_PREFIXES.some((prefix) => rel.startsWith(prefix))) return false;
  return INDEXABLE_EXTENSIONS.has(getExtension(filename));
}

function getExtension(filename) {
  const index = filename.lastIndexOf('.');
  return index === -1 ? '' : filename.slice(index);
}

function toPublicUrl(filePath) {
  const rel = normalizePath(relative(docsDir, filePath));
  let path = `/${rel}`;

  if (path === '/index.html') {
    path = '/';
  } else if (path.endsWith('/index.html')) {
    path = path.slice(0, -'index.html'.length);
  }

  return new URL(path, `${siteUrl}/`).toString();
}

function normalizePath(path) {
  return path.split(sep).join('/');
}

function getLastModified(filePath) {
  const rel = normalizePath(relative(repoRoot, filePath));

  try {
    const value = execFileSync('git', ['log', '-1', '--format=%aI', '--', rel], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (value) return value;
  } catch {
    // Fall back to the filesystem timestamp below.
  }

  return statSync(filePath).mtime.toISOString();
}

function getPriority(filePath) {
  const rel = normalizePath(relative(docsDir, filePath));
  if (rel === 'index.html') return '1.0';
  if (rel === 'faq.md') return '0.8';
  if (rel.startsWith('reference/')) return '0.8';
  if (rel.startsWith('schemas/')) return '0.75';
  if (rel.startsWith('releases/')) return '0.7';
  return '0.5';
}

function getChangeFrequency(filePath) {
  const rel = normalizePath(relative(docsDir, filePath));
  if (rel === 'index.html') return 'weekly';
  if (rel.startsWith('releases/')) return 'weekly';
  if (rel.startsWith('schemas/')) return 'monthly';
  return 'monthly';
}

function renderSitemap(items) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items
    .map(
      (item) => `  <url>
    <loc>${escapeXml(item.loc)}</loc>
    <lastmod>${escapeXml(item.lastmod)}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`,
    )
    .join('\n')}\n</urlset>\n`;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
