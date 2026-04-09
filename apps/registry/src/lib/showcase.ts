import showcaseManifest from '../../../showcase/manifest.json';

export interface ShowcaseManifestEntry {
  slug: string;
  status: string;
  classification: string;
  target?: string;
  goldenCandidate?: string | boolean;
  notes?: string;
}

const SHOWCASE_ENTRIES = (showcaseManifest.apps as ShowcaseManifestEntry[]).filter(entry => entry.status === 'active');
const SHOWCASE_ENTRY_MAP = new Map(SHOWCASE_ENTRIES.map(entry => [entry.slug, entry]));
const AVAILABLE_SHOWCASES = new Set(SHOWCASE_ENTRIES.map(entry => entry.slug));
const SHORTLISTED_SHOWCASES = SHOWCASE_ENTRIES.filter(entry => Boolean(entry.goldenCandidate));

export function hasShowcase(blueprintSlug: string): boolean {
  return AVAILABLE_SHOWCASES.has(blueprintSlug);
}

export function getShowcaseUrl(blueprintSlug: string): string {
  return `/showcase/${blueprintSlug}/`;
}

export function getShowcaseMetadata(blueprintSlug: string): ShowcaseManifestEntry | null {
  return SHOWCASE_ENTRY_MAP.get(blueprintSlug) ?? null;
}

export function isShortlistedShowcase(blueprintSlug: string): boolean {
  return Boolean(SHOWCASE_ENTRY_MAP.get(blueprintSlug)?.goldenCandidate);
}

export function listAvailableShowcases(): ShowcaseManifestEntry[] {
  return SHOWCASE_ENTRIES;
}

export function listShortlistedShowcases(): ShowcaseManifestEntry[] {
  return SHORTLISTED_SHOWCASES;
}
