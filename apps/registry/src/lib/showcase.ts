import showcaseManifest from '../../../showcase/manifest.json';
import shortlistVerificationReport from '../../../showcase/reports/shortlist-verification.json';

export interface ShowcaseManifestEntry {
  slug: string;
  status: string;
  classification: string;
  target?: string;
  goldenCandidate?: string | boolean;
  notes?: string;
}

export interface ShowcaseVerificationEntry {
  slug: string;
  target?: string | null;
  classification: string;
  verificationStatus: string;
  build: {
    passed: boolean | null;
    durationMs: number;
  };
  smoke: {
    passed: boolean | null;
    durationMs: number;
    rootDocumentOk: boolean;
    assetCount: number;
    assetsPassed: number;
    routeHintsChecked: string[];
    routeHintsMatched: number;
    failures: string[];
  };
  drift: {
    signal: string;
    penalty: number;
    inlineStyleCount: number;
    hardcodedColorCount: number;
    utilityLeakageCount: number;
    decantrTreatmentCount: number;
    hasPackManifest: boolean;
    hasDist: boolean;
  };
}

export interface ShowcaseShortlistVerificationSummary {
  appCount: number;
  passedBuilds: number;
  failedBuilds: number;
  averageDurationMs: number;
  passedSmokes: number;
  failedSmokes: number;
  averageSmokeDurationMs: number;
  lowerDriftCount: number;
  moderateDriftCount: number;
  elevatedDriftCount: number;
  withPackManifestCount: number;
}

export interface ShowcaseMetadata extends ShowcaseManifestEntry {
  verification: ShowcaseVerificationEntry | null;
}

const SHOWCASE_ENTRIES = (showcaseManifest.apps as ShowcaseManifestEntry[]).filter(entry => entry.status === 'active');
const SHOWCASE_VERIFICATION_ENTRIES = (shortlistVerificationReport.results as ShowcaseVerificationEntry[] | undefined) ?? [];
const SHOWCASE_VERIFICATION_SUMMARY = (shortlistVerificationReport.summary as ShowcaseShortlistVerificationSummary | undefined) ?? null;
const SHOWCASE_VERIFICATION_MAP = new Map(SHOWCASE_VERIFICATION_ENTRIES.map(entry => [entry.slug, entry]));
const SHOWCASE_ENTRY_MAP = new Map(
  SHOWCASE_ENTRIES.map(entry => [
    entry.slug,
    {
      ...entry,
      verification: SHOWCASE_VERIFICATION_MAP.get(entry.slug) ?? null,
    } satisfies ShowcaseMetadata,
  ]),
);
const AVAILABLE_SHOWCASES = new Set(SHOWCASE_ENTRIES.map(entry => entry.slug));
const SHORTLISTED_SHOWCASES = [...SHOWCASE_ENTRY_MAP.values()].filter(entry => Boolean(entry.goldenCandidate));

export function hasShowcase(blueprintSlug: string): boolean {
  return AVAILABLE_SHOWCASES.has(blueprintSlug);
}

export function getShowcaseUrl(blueprintSlug: string): string {
  return `/showcase/${blueprintSlug}/`;
}

export function getShowcaseMetadata(blueprintSlug: string): ShowcaseMetadata | null {
  return SHOWCASE_ENTRY_MAP.get(blueprintSlug) ?? null;
}

export function isShortlistedShowcase(blueprintSlug: string): boolean {
  return Boolean(SHOWCASE_ENTRY_MAP.get(blueprintSlug)?.goldenCandidate);
}

export function listAvailableShowcases(): ShowcaseMetadata[] {
  return [...SHOWCASE_ENTRY_MAP.values()];
}

export function listShortlistedShowcases(): ShowcaseMetadata[] {
  return SHORTLISTED_SHOWCASES;
}

export function getShowcaseShortlistVerificationSummary(): ShowcaseShortlistVerificationSummary | null {
  return SHOWCASE_VERIFICATION_SUMMARY;
}
