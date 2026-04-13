import showcaseManifest from '../../../showcase/manifest.json' with { type: 'json' };
import shortlistVerificationReport from '../../../showcase/reports/shortlist-verification.json' with { type: 'json' };
import type {
  ShowcaseManifestEntry,
  ShowcaseShortlistReport,
  ShowcaseVerificationEntry,
} from '@decantr/registry';

export const SHOWCASE_MANIFEST_ENTRIES = (
  showcaseManifest.apps as ShowcaseManifestEntry[]
).filter((entry) => entry.status === 'active');

export const SHOWCASE_SHORTLIST_REPORT =
  shortlistVerificationReport as ShowcaseShortlistReport;

export const SHOWCASE_VERIFICATION_RESULTS =
  (SHOWCASE_SHORTLIST_REPORT.results as ShowcaseVerificationEntry[] | undefined) ?? [];

export const SHOWCASE_VERIFICATION_MAP = new Map(
  SHOWCASE_VERIFICATION_RESULTS.map((entry) => [entry.slug, entry]),
);

export const SHORTLISTED_SHOWCASE_ENTRIES = SHOWCASE_MANIFEST_ENTRIES.filter((entry) =>
  Boolean(entry.goldenCandidate),
);

export function getShowcaseManifestEntry(
  slug: string,
): ShowcaseManifestEntry | null {
  return SHOWCASE_MANIFEST_ENTRIES.find((entry) => entry.slug === slug) ?? null;
}

export function getShowcaseVerificationEntry(
  slug: string,
): ShowcaseVerificationEntry | null {
  return SHOWCASE_VERIFICATION_MAP.get(slug) ?? null;
}
