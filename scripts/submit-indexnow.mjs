import { readFileSync } from 'node:fs';

const DEFAULT_KEY = '24d33581c24e009daf33a15d040ef127';
const DEFAULT_SITEMAPS = [
  'https://decantr.ai/sitemap.xml',
  'https://registry.decantr.ai/sitemap.xml',
];
const INDEXNOW_ENDPOINT = process.env.INDEXNOW_ENDPOINT || 'https://api.indexnow.org/indexnow';
const MAX_URLS_PER_BATCH = 10000;

const args = parseArgs(process.argv.slice(2));
const key = args.key || process.env.INDEXNOW_KEY || DEFAULT_KEY;
const sitemaps = args.sitemaps.length > 0 ? args.sitemaps : DEFAULT_SITEMAPS;
const dryRun = args.dryRun;

let submittedBatches = 0;

for (const sitemap of sitemaps) {
  try {
    submittedBatches += await submitSitemap(sitemap);
  } catch (error) {
    console.warn(error instanceof Error ? error.message : String(error));
  }
}

if (!dryRun && submittedBatches === 0) {
  console.warn('No IndexNow batches were submitted.');
}

async function submitSitemap(sitemapUrl) {
  const urls = await readUrlsFromSitemap(sitemapUrl);
  if (urls.length === 0) {
    console.warn(`No URLs found in ${sitemapUrl}`);
    return 0;
  }

  const host = new URL(sitemapUrl).hostname;
  const keyLocation = `https://${host}/${key}.txt`;

  if (!(await verifyIndexNowKey(keyLocation, key))) {
    console.warn(`Skipping ${host}: IndexNow key file is not live at ${keyLocation}`);
    return 0;
  }

  let submitted = 0;

  for (let index = 0; index < urls.length; index += MAX_URLS_PER_BATCH) {
    const urlList = urls.slice(index, index + MAX_URLS_PER_BATCH);
    const payload = {
      host,
      key,
      keyLocation,
      urlList,
    };

    if (dryRun) {
      console.log(`[dry-run] Would submit ${urlList.length} URLs for ${host}`);
      submitted += 1;
      continue;
    }

    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok && response.status !== 202 && response.status !== 200) {
      const body = await response.text().catch(() => '');
      throw new Error(`IndexNow ${host} failed: HTTP ${response.status} ${body}`);
    }

    console.log(`Submitted ${urlList.length} URLs for ${host} to IndexNow.`);
    submitted += 1;
  }

  return submitted;
}

async function readUrlsFromSitemap(sitemapUrl) {
  const xml = sitemapUrl.startsWith('file:')
    ? readFileSync(new URL(sitemapUrl), 'utf8')
    : await fetchText(sitemapUrl);
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => decodeXml(match[1].trim()));
  const nestedSitemaps = locs.filter((url) => url.endsWith('.xml'));
  const pageUrls = locs.filter((url) => !url.endsWith('.xml'));

  if (pageUrls.length > 0 || nestedSitemaps.length === 0) {
    return pageUrls;
  }

  const nestedUrls = await Promise.all(nestedSitemaps.map(readUrlsFromSitemap));
  return nestedUrls.flat();
}

async function verifyIndexNowKey(keyLocation, expectedKey) {
  if (dryRun) return true;

  try {
    const body = (await fetchText(keyLocation)).trim();
    return body === expectedKey;
  } catch {
    return false;
  }
}

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
  }
  return response.text();
}

function decodeXml(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function parseArgs(rawArgs) {
  const parsed = {
    sitemaps: [],
    key: '',
    dryRun: false,
  };

  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];

    if (arg === '--dry-run') {
      parsed.dryRun = true;
      continue;
    }

    if (arg === '--key') {
      parsed.key = rawArgs[index + 1] ?? '';
      index += 1;
      continue;
    }

    if (arg.startsWith('--key=')) {
      parsed.key = arg.slice('--key='.length);
      continue;
    }

    if (arg === '--sitemap') {
      parsed.sitemaps.push(rawArgs[index + 1]);
      index += 1;
      continue;
    }

    if (arg.startsWith('--sitemap=')) {
      parsed.sitemaps.push(arg.slice('--sitemap='.length));
      continue;
    }
  }

  parsed.sitemaps = parsed.sitemaps.filter(Boolean);
  return parsed;
}
