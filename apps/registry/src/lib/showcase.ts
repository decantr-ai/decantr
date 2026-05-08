import { unstable_cache } from 'next/cache';
import {
  RegistryAPIClient,
  type ShowcaseManifestResponse,
  type ShowcaseShortlistResponse,
  type ShowcaseShortlistSummary as ShowcaseShortlistVerificationSummary,
} from '@decantr/registry/client';
import { getPublicRegistryApiUrl } from '@/lib/public-registry-client';
import {
  buildShowcaseDataset,
  getStaticShowcaseDataset,
  getStaticShowcaseManifestResponse,
  getStaticShowcaseShortlistResponse,
  type ShowcaseDataset,
  type ShowcaseMetadata,
} from '@/lib/showcase-dataset';

export type { ShowcaseMetadata } from '@/lib/showcase-dataset';

const SHOWCASE_REVALIDATE_SECONDS = 300;
const SHOWCASE_API_TIMEOUT_MS = 3500;
const SHOWCASE_CACHE_KEY = 'registry-showcase-dataset-v2';

let showcaseRegistryClient: RegistryAPIClient | null = null;

function getShowcaseRegistryClient(): RegistryAPIClient {
  if (!showcaseRegistryClient) {
    showcaseRegistryClient = new RegistryAPIClient({
      baseUrl: getPublicRegistryApiUrl(),
      timeoutMs: SHOWCASE_API_TIMEOUT_MS,
    });
  }
  return showcaseRegistryClient;
}

function warnShowcaseFallback(source: string, error: unknown) {
  const detail = error instanceof Error ? error.message : String(error);
  console.warn(`[registry] ${source} unavailable; using bundled showcase metadata. ${detail}`);
}

function assertUsableManifest(manifest: ShowcaseManifestResponse): ShowcaseManifestResponse {
  if (!Array.isArray(manifest.apps) || manifest.apps.length === 0) {
    throw new Error('Showcase manifest returned no apps');
  }
  return manifest;
}

function assertUsableShortlist(shortlist: ShowcaseShortlistResponse): ShowcaseShortlistResponse {
  if (!Array.isArray(shortlist.apps)) {
    throw new Error('Showcase shortlist returned no apps array');
  }
  return shortlist;
}

async function fetchShowcaseManifest(): Promise<ShowcaseManifestResponse> {
  try {
    return assertUsableManifest(await getShowcaseRegistryClient().getShowcaseManifest());
  } catch (error) {
    warnShowcaseFallback('Showcase manifest API', error);
    return getStaticShowcaseManifestResponse();
  }
}

async function fetchShowcaseShortlist(): Promise<ShowcaseShortlistResponse> {
  try {
    return assertUsableShortlist(await getShowcaseRegistryClient().getShowcaseShortlist());
  } catch (error) {
    warnShowcaseFallback('Showcase shortlist API', error);
    return getStaticShowcaseShortlistResponse();
  }
}

const fetchShowcaseDataset = unstable_cache(
  async (): Promise<ShowcaseDataset> => {
    const [manifest, shortlist] = await Promise.all([
      fetchShowcaseManifest(),
      fetchShowcaseShortlist(),
    ]);

    return buildShowcaseDataset(manifest, shortlist);
  },
  [SHOWCASE_CACHE_KEY],
  { revalidate: SHOWCASE_REVALIDATE_SECONDS },
);

async function getShowcaseDataset(): Promise<ShowcaseDataset> {
  try {
    return await fetchShowcaseDataset();
  } catch (error) {
    warnShowcaseFallback('Showcase dataset cache', error);
    return getStaticShowcaseDataset();
  }
}

export function getShowcaseUrl(blueprintSlug: string, metadata?: ShowcaseMetadata | null): string {
  return metadata?.url ?? `/showcase/${blueprintSlug}`;
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
