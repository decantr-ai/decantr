import { unstable_cache } from 'next/cache';
import {
  type ShowcaseManifestEntry,
  type ShowcaseShortlistSummary as ShowcaseShortlistVerificationSummary,
  type ShowcaseVerificationEntry,
} from '@decantr/registry/client';
import { getPublicRegistryClient } from '@/lib/public-registry-client';

export interface ShowcaseMetadata extends ShowcaseManifestEntry {
  verification: ShowcaseVerificationEntry | null;
}

interface ShowcaseDataset {
  apps: ShowcaseMetadata[];
  shortlisted: ShowcaseMetadata[];
  summary: ShowcaseShortlistVerificationSummary | null;
  bySlug: Record<string, ShowcaseMetadata>;
}

const SHOWCASE_REVALIDATE_SECONDS = 300;
const EMPTY_SHOWCASE_DATASET: ShowcaseDataset = {
  apps: [],
  shortlisted: [],
  summary: null,
  bySlug: {},
}

function normalizeShowcaseEntry(entry: ShowcaseManifestEntry): ShowcaseMetadata {
  return {
    ...entry,
    verification: entry.verification ?? null,
  };
}

const fetchShowcaseDataset = unstable_cache(
  async (): Promise<ShowcaseDataset> => {
    try {
      const client = getPublicRegistryClient();
      const [manifest, shortlist] = await Promise.all([
        client.getShowcaseManifest(),
        client.getShowcaseShortlist(),
      ]);

      const apps = manifest.apps
        .filter((entry) => entry.status === 'active')
        .map(normalizeShowcaseEntry);
      const bySlug = Object.fromEntries(
        apps.map((entry) => [entry.slug, entry]),
      ) as Record<string, ShowcaseMetadata>;
      const shortlisted = shortlist.apps
        .filter((entry) => entry.status === 'active')
        .map((entry) => bySlug[entry.slug] ?? normalizeShowcaseEntry(entry));

      return {
        apps,
        shortlisted,
        summary: shortlist.summary ?? null,
        bySlug,
      };
    } catch {
      return EMPTY_SHOWCASE_DATASET;
    }
  },
  ['registry-showcase-benchmarks'],
  { revalidate: SHOWCASE_REVALIDATE_SECONDS },
);

async function getShowcaseDataset(): Promise<ShowcaseDataset> {
  return fetchShowcaseDataset();
}

export function getShowcaseUrl(blueprintSlug: string): string {
  return `/showcase/${blueprintSlug}/`;
}

export async function hasShowcase(blueprintSlug: string): Promise<boolean> {
  const { bySlug } = await getShowcaseDataset();
  return blueprintSlug in bySlug;
}

export async function getShowcaseMetadata(blueprintSlug: string): Promise<ShowcaseMetadata | null> {
  const { bySlug } = await getShowcaseDataset();
  return bySlug[blueprintSlug] ?? null;
}

export async function getShowcaseMetadataMap(
  blueprintSlugs: string[],
): Promise<Record<string, ShowcaseMetadata>> {
  if (blueprintSlugs.length === 0) {
    return {};
  }

  const uniqueBlueprintSlugs = [...new Set(blueprintSlugs)];
  const { bySlug } = await getShowcaseDataset();

  return Object.fromEntries(
    uniqueBlueprintSlugs
      .map((slug) => [slug, bySlug[slug] ?? null] as const)
      .filter((entry): entry is [string, ShowcaseMetadata] => entry[1] !== null),
  );
}

export async function isShortlistedShowcase(blueprintSlug: string): Promise<boolean> {
  const showcase = await getShowcaseMetadata(blueprintSlug);
  return Boolean(showcase?.goldenCandidate);
}

export async function listAvailableShowcases(): Promise<ShowcaseMetadata[]> {
  const { apps } = await getShowcaseDataset();
  return apps;
}

export async function listShortlistedShowcases(): Promise<ShowcaseMetadata[]> {
  const { shortlisted } = await getShowcaseDataset();
  return shortlisted;
}

export async function getShowcaseShortlistVerificationSummary(): Promise<ShowcaseShortlistVerificationSummary | null> {
  const { summary } = await getShowcaseDataset();
  return summary;
}
