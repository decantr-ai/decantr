import sourceShowcaseManifest from '../../../showcase/manifest.json';
import sourceShortlistVerification from '../../../showcase/reports/shortlist-verification.json';
import type {
  ShowcaseManifestEntry,
  ShowcaseManifestResponse,
  ShowcaseShortlistReport,
  ShowcaseShortlistResponse,
  ShowcaseShortlistSummary,
  ShowcaseVerificationEntry,
} from '@decantr/registry/client';

export interface ShowcaseMetadata extends ShowcaseManifestEntry {
  verification: ShowcaseVerificationEntry | null;
}

export interface ShowcaseDataset {
  apps: ShowcaseMetadata[];
  shortlisted: ShowcaseMetadata[];
  summary: ShowcaseShortlistSummary | null;
  bySlug: Record<string, ShowcaseMetadata>;
}

function getShowcasePublicUrl(slug: string): string {
  return `/showcase/${slug}`;
}

function normalizeShowcaseEntry(entry: ShowcaseManifestEntry): ShowcaseMetadata {
  return {
    ...entry,
    url: entry.url ?? getShowcasePublicUrl(entry.slug),
    verification: entry.verification ?? null,
  };
}

export function buildShowcaseDataset(
  manifest: ShowcaseManifestResponse,
  shortlist?: ShowcaseShortlistResponse | null,
): ShowcaseDataset {
  const apps = manifest.apps
    .filter((entry) => entry.status === 'active')
    .map(normalizeShowcaseEntry);
  const bySlug = Object.fromEntries(
    apps.map((entry) => [entry.slug, entry]),
  ) as Record<string, ShowcaseMetadata>;
  const shortlistEntries = shortlist?.apps?.length
    ? shortlist.apps
    : apps.filter((entry) => Boolean(entry.goldenCandidate));
  const shortlisted = shortlistEntries
    .filter((entry) => entry.status === 'active')
    .map((entry) => bySlug[entry.slug] ?? normalizeShowcaseEntry(entry));

  return {
    apps,
    shortlisted,
    summary: shortlist?.summary ?? null,
    bySlug,
  };
}

const SOURCE_SHORTLIST_VERIFICATION =
  sourceShortlistVerification as ShowcaseShortlistReport;
const SOURCE_VERIFICATION_RESULTS =
  SOURCE_SHORTLIST_VERIFICATION.results as ShowcaseVerificationEntry[];
const SOURCE_VERIFICATION_MAP = new Map(
  SOURCE_VERIFICATION_RESULTS.map((entry) => [entry.slug, entry]),
);
const VERIFIED_SHOWCASE_SLUGS = new Set(
  SOURCE_VERIFICATION_RESULTS
    .filter((entry) => entry.build?.passed && entry.smoke?.passed)
    .map((entry) => entry.slug),
);

let staticManifestResponse: ShowcaseManifestResponse | null = null;
let staticShortlistResponse: ShowcaseShortlistResponse | null = null;
let staticDataset: ShowcaseDataset | null = null;

export function getStaticShowcaseManifestResponse(): ShowcaseManifestResponse {
  if (staticManifestResponse) return staticManifestResponse;

  const apps = (sourceShowcaseManifest.apps as ShowcaseManifestEntry[])
    .filter((entry) => entry.status === 'active' && VERIFIED_SHOWCASE_SLUGS.has(entry.slug))
    .map((entry) => ({
      ...entry,
      url: entry.url ?? getShowcasePublicUrl(entry.slug),
      verification: SOURCE_VERIFICATION_MAP.get(entry.slug) ?? null,
    }));

  staticManifestResponse = {
    total: apps.length,
    shortlisted: apps.filter((entry) => Boolean(entry.goldenCandidate)).length,
    apps,
  };
  return staticManifestResponse;
}

export function getStaticShowcaseShortlistResponse(): ShowcaseShortlistResponse {
  if (staticShortlistResponse) return staticShortlistResponse;

  const manifest = getStaticShowcaseManifestResponse();
  staticShortlistResponse = {
    generatedAt: SOURCE_SHORTLIST_VERIFICATION.generatedAt ?? null,
    summary: SOURCE_SHORTLIST_VERIFICATION.summary ?? null,
    apps: manifest.apps.filter((entry) => Boolean(entry.goldenCandidate)),
  };
  return staticShortlistResponse;
}

export function getStaticShowcaseDataset(): ShowcaseDataset {
  if (staticDataset) return staticDataset;

  staticDataset = buildShowcaseDataset(
    getStaticShowcaseManifestResponse(),
    getStaticShowcaseShortlistResponse(),
  );
  return staticDataset;
}
