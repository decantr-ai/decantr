import { loadPackageSurface, sortReleaseEntries } from './package-surface-lib.mjs';

const DEFAULT_PERIODS = ['last-week', 'last-month'];
const NPM_DOWNLOAD_TIMEOUT_MS = 8_000;

export function publicPackageNames() {
  return sortReleaseEntries(loadPackageSurface().packages)
    .filter((entry) => entry.publish !== false && entry.maturity === 'stable')
    .map((entry) => entry.name);
}

export async function fetchNpmDownloadSummary(options = {}) {
  const dryRun = options.dryRun === true;
  const periods = normalizePeriods(options.periods ?? DEFAULT_PERIODS);
  const packageNames = options.packageNames?.length ? options.packageNames : publicPackageNames();

  if (dryRun) {
    return sampleNpmDownloadSummary({ packageNames, periods });
  }

  const rows = await Promise.all(
    packageNames.map(async (name) => ({
      name,
      downloads: await fetchPackageDownloads(name, periods),
    })),
  );

  return summarizeNpmDownloads(rows, periods);
}

export function summarizeNpmDownloads(rows, periods) {
  const totals = Object.fromEntries(periods.map((period) => [period, 0]));
  const packages = rows.map((row) => {
    const downloads = {};
    const errors = {};
    for (const period of periods) {
      const result = row.downloads[period] ?? { downloads: 0 };
      downloads[period] = result.downloads ?? 0;
      totals[period] += downloads[period];
      if (result.error) errors[period] = result.error;
    }
    return {
      downloads,
      errors,
      name: row.name,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    packages,
    periods,
    totals,
    top: Object.fromEntries(
      periods.map((period) => [
        period,
        [...packages]
          .sort((a, b) => (b.downloads[period] ?? 0) - (a.downloads[period] ?? 0))
          .slice(0, 5),
      ]),
    ),
  };
}

async function fetchPackageDownloads(name, periods) {
  const entries = await Promise.all(
    periods.map(async (period) => [period, await fetchPackageDownloadPeriod(name, period)]),
  );
  return Object.fromEntries(entries);
}

async function fetchPackageDownloadPeriod(name, period) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), NPM_DOWNLOAD_TIMEOUT_MS);
  try {
    const response = await fetch(
      `https://api.npmjs.org/downloads/point/${encodeURIComponent(period)}/${encodeURIComponent(name)}`,
      { signal: controller.signal },
    );
    const text = await response.text();
    const body = text ? parseJson(text) : {};
    if (!response.ok) {
      const message = typeof body === 'object' && body !== null
        ? JSON.stringify(body)
        : text.slice(0, 300);
      return { downloads: 0, error: `npm downloads ${response.status}: ${message}` };
    }
    return {
      downloads: readNumber(body.downloads),
      end: typeof body.end === 'string' ? body.end : null,
      start: typeof body.start === 'string' ? body.start : null,
    };
  } catch (error) {
    return {
      downloads: 0,
      error: error instanceof Error ? error.message : 'npm download request failed',
    };
  } finally {
    clearTimeout(timeout);
  }
}

function normalizePeriods(periods) {
  const allowed = new Set(['last-day', 'last-week', 'last-month']);
  const normalized = periods
    .map((period) => String(period).trim())
    .filter((period) => allowed.has(period));
  return normalized.length ? [...new Set(normalized)] : DEFAULT_PERIODS;
}

function sampleNpmDownloadSummary({ packageNames, periods }) {
  const rows = packageNames.map((name, index) => ({
    name,
    downloads: Object.fromEntries(
      periods.map((period) => [
        period,
        {
          downloads: period === 'last-week' ? 140 - index * 7 : 520 - index * 19,
        },
      ]),
    ),
  }));
  return summarizeNpmDownloads(rows, periods);
}

function readNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}
