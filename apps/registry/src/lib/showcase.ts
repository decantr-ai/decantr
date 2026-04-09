import showcaseManifest from '../../../showcase/manifest.json';

interface ShowcaseManifestEntry {
  slug: string;
  status: string;
  classification: string;
  target?: string;
  goldenCandidate?: string | boolean;
  notes?: string;
}

const SHOWCASE_ENTRIES = (showcaseManifest.apps as ShowcaseManifestEntry[]).filter(entry => entry.status === 'active');
const AVAILABLE_SHOWCASES = new Set(SHOWCASE_ENTRIES.map(entry => entry.slug));
const SHORTLISTED_SHOWCASES = SHOWCASE_ENTRIES.filter(entry => Boolean(entry.goldenCandidate));

export function hasShowcase(blueprintSlug: string): boolean {
  return AVAILABLE_SHOWCASES.has(blueprintSlug);
}

export function getShowcaseUrl(blueprintSlug: string): string {
  return `/showcase/${blueprintSlug}/`;
}

export function listAvailableShowcases(): ShowcaseManifestEntry[] {
  return SHOWCASE_ENTRIES;
}

export function listShortlistedShowcases(): ShowcaseManifestEntry[] {
  return SHORTLISTED_SHOWCASES;
}
