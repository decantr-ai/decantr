import type {
  ContentIntelligenceMetadata,
  ContentType,
  ShowcaseManifestEntry,
  ShowcaseVerificationEntry,
} from '@decantr/registry';
import {
  getShowcaseManifestEntry,
  getShowcaseVerificationEntry,
  SHOWCASE_SHORTLIST_REPORT,
} from './showcase-benchmarks.js';

type ContentData = Record<string, unknown> | null | undefined;

interface AuthoredIntelligenceSignals {
  evidence: string[];
  qualityScore: number;
  confidenceScore: number;
  recommended: boolean;
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function deriveBenchmarkConfidence(
  showcase: ShowcaseManifestEntry,
  verification: ShowcaseVerificationEntry | null,
): ContentIntelligenceMetadata['benchmark_confidence'] {
  if (verification?.verificationStatus === 'smoke-green') return 'high';
  if (verification?.verificationStatus === 'build-green') return 'medium';
  if (showcase.classification === 'A' || showcase.classification === 'B') return 'medium';
  if (showcase.classification === 'C' || showcase.classification === 'D') return 'low';
  return 'low';
}

function deriveQualityScore(
  showcase: ShowcaseManifestEntry,
  verification: ShowcaseVerificationEntry | null,
): number {
  let score = 35;

  if (showcase.goldenCandidate) score += 10;

  switch (showcase.classification) {
    case 'A':
      score += 25;
      break;
    case 'B':
      score += 20;
      break;
    case 'C':
      score += 12;
      break;
    case 'D':
      score += 6;
      break;
    default:
      break;
  }

  if (verification?.build.passed) score += 15;
  if (verification?.smoke.passed) score += 20;

  switch (verification?.drift.signal) {
    case 'lower':
      score += 10;
      break;
    case 'moderate':
      score += 5;
      break;
    case 'elevated':
      score -= 5;
      break;
    default:
      break;
  }

  return clampScore(score);
}

function deriveConfidenceTier(input: {
  benchmarkConfidence: ContentIntelligenceMetadata['benchmark_confidence'];
  confidenceScore: number;
  verificationStatus: ContentIntelligenceMetadata['verification_status'];
  goldenUsage: ContentIntelligenceMetadata['golden_usage'];
  driftSignal?: ShowcaseVerificationEntry['drift']['signal'];
}): ContentIntelligenceMetadata['confidence_tier'] {
  if (
    input.goldenUsage === 'shortlisted'
    && input.verificationStatus === 'smoke-green'
    && input.driftSignal !== 'elevated'
  ) {
    return 'verified';
  }

  if (
    input.confidenceScore >= 82
    || input.verificationStatus === 'smoke-green'
    || input.benchmarkConfidence === 'high'
  ) {
    return 'high';
  }

  if (
    input.confidenceScore >= 60
    || input.verificationStatus === 'build-green'
    || input.benchmarkConfidence === 'medium'
  ) {
    return 'medium';
  }

  return 'low';
}

function deriveConfidenceScore(
  showcase: ShowcaseManifestEntry,
  verification: ShowcaseVerificationEntry | null,
): number {
  let score = 30;

  if (showcase.goldenCandidate) score += 10;
  if (showcase.target) score += 10;

  switch (verification?.verificationStatus) {
    case 'smoke-green':
      score += 35;
      break;
    case 'build-green':
      score += 20;
      break;
    case 'smoke-red':
      score -= 10;
      break;
    case 'build-red':
      score -= 20;
      break;
    default:
      break;
  }

  switch (showcase.classification) {
    case 'A':
      score += 15;
      break;
    case 'B':
      score += 10;
      break;
    case 'C':
      score += 5;
      break;
    default:
      break;
  }

  return clampScore(score);
}

function normalizeClassification(
  value: string | null | undefined,
): ShowcaseVerificationEntry['classification'] {
  switch (value) {
    case 'A':
    case 'B':
    case 'C':
    case 'D':
    case 'pending':
      return value;
    default:
      return 'pending';
  }
}

function hasString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasArray(value: unknown): value is unknown[] {
  return Array.isArray(value) && value.length > 0;
}

function hasRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && Object.keys(value).length > 0;
}

function collectSignals(type: ContentType, data: ContentData): string[] {
  if (!data) {
    return [];
  }

  const signals = new Set<string>();

  if (hasString(data.description)) signals.add('description');
  if (hasArray(data.tags)) signals.add('tags');

  switch (type) {
    case 'pattern':
      if (hasArray(data.components)) signals.add('components');
      if (hasRecord(data.presets)) signals.add('presets');
      if (hasRecord(data.code) || Object.values(data.presets ?? {}).some((preset) => hasRecord(preset) && hasRecord(preset.code))) {
        signals.add('code-example');
      }
      if (hasRecord(data.io)) signals.add('io-contract');
      if (hasRecord(data.responsive)) signals.add('responsive-hints');
      if (hasRecord(data.accessibility)) signals.add('accessibility');
      break;
    case 'theme':
      if (hasRecord(data.tokens)) signals.add('tokens');
      if (hasRecord(data.decorators) || hasRecord(data.treatments)) signals.add('decorators');
      if (hasRecord(data.spatial)) signals.add('spatial-contract');
      if (hasRecord(data.shell)) signals.add('shell-guidance');
      if (hasRecord(data.effects) || hasRecord(data.motion)) signals.add('effects');
      if (hasRecord(data.pattern_preferences)) signals.add('pattern-preferences');
      break;
    case 'blueprint':
      if (hasRecord(data.theme)) signals.add('theme-binding');
      if (hasArray(data.compose) || hasString(data.archetype)) signals.add('composition');
      if (hasArray(data.features)) signals.add('features');
      if (hasRecord(data.routes)) signals.add('routes');
      if (hasRecord(data.navigation)) signals.add('navigation');
      if (hasRecord(data.responsive_strategy)) signals.add('responsive-strategy');
      if (hasRecord(data.seo_hints)) signals.add('seo-hints');
      break;
    case 'archetype':
      if (hasString(data.role)) signals.add('role');
      if (hasArray(data.pages)) signals.add('pages');
      if (hasArray(data.features)) signals.add('features');
      if (hasRecord(data.suggested_theme)) signals.add('suggested-theme');
      if (hasRecord(data.dependencies)) signals.add('dependencies');
      if (hasRecord(data.page_briefs)) signals.add('page-briefs');
      if (hasRecord(data.classification)) signals.add('classification');
      break;
    case 'shell':
      if (hasString(data.layout) || hasString(data.atoms)) signals.add('layout-contract');
      if (hasString(data.root) || hasString(data.nav) || hasString(data.header)) signals.add('regions');
      if (hasRecord(data.guidance)) signals.add('guidance');
      if (hasRecord(data.code)) signals.add('code-example');
      if (hasRecord(data.dimensions)) signals.add('dimensions');
      break;
    default:
      break;
  }

  return [...signals];
}

function deriveAuthoredSignals(
  type: ContentType,
  namespace: string,
  data: ContentData,
): AuthoredIntelligenceSignals | null {
  const evidence = collectSignals(type, data);

  if (evidence.length === 0) {
    return null;
  }

  const official = namespace === '@official';
  const qualityScore = clampScore(
    (official ? 20 : 10) +
    Math.round((evidence.length / 8) * 60) +
    (evidence.includes('code-example') ? 8 : 0) +
    (evidence.includes('routes') || evidence.includes('pages') ? 6 : 0),
  );
  const confidenceScore = clampScore(
    (official ? 28 : 12) +
    Math.round((evidence.length / 8) * 46) +
    (evidence.includes('presets') || evidence.includes('tokens') || evidence.includes('layout-contract') ? 8 : 0),
    );
  const recommended = official && qualityScore >= 74 && confidenceScore >= 68;

  return {
    evidence: official ? ['official-source', ...evidence] : evidence,
    qualityScore,
    confidenceScore,
    recommended,
  };
}

export function getContentIntelligence(
  type: ContentType,
  namespace: string,
  slug: string,
  data?: ContentData,
): ContentIntelligenceMetadata | null {
  const authoredSignals = deriveAuthoredSignals(type, namespace, data);
  const showcase = getShowcaseManifestEntry(slug);
  const verification = getShowcaseVerificationEntry(slug);

  if (type !== 'blueprint' || namespace !== '@official' || !showcase) {
    if (!authoredSignals) {
      return null;
    }

    return {
      source: 'authored',
      verification_status: 'unknown',
      last_verified_at: null,
      target_coverage: [],
      benchmark_confidence: 'none',
      confidence_tier: deriveConfidenceTier({
        benchmarkConfidence: 'none',
        confidenceScore: authoredSignals.confidenceScore,
        verificationStatus: 'unknown',
        goldenUsage: 'none',
      }),
      golden_usage: 'none',
      quality_score: authoredSignals.qualityScore,
      confidence_score: authoredSignals.confidenceScore,
      recommended: authoredSignals.recommended,
      evidence: authoredSignals.evidence,
    };
  }

  const targetCoverage = showcase.target ? [showcase.target] : [];
  const goldenUsage = showcase.goldenCandidate ? 'shortlisted' : 'showcase';
  const evidence = new Set<string>(authoredSignals?.evidence ?? []);

  evidence.add('live-showcase');

  if (showcase.goldenCandidate) {
    evidence.add('shortlisted-showcase');
  }
  if (verification?.build.passed) {
    evidence.add('build-verified');
  }
  if (verification?.smoke.passed) {
    evidence.add('smoke-verified');
  }

  const verificationStatus = verification?.verificationStatus ?? 'pending';
  const benchmarkConfidence = deriveBenchmarkConfidence(showcase, verification);
  const qualityScore = Math.max(
    deriveQualityScore(showcase, verification),
    authoredSignals?.qualityScore ?? 0,
  );
  const confidenceScore = Math.max(
    deriveConfidenceScore(showcase, verification),
    authoredSignals?.confidenceScore ?? 0,
  );
  const recommended =
    goldenUsage === 'shortlisted' &&
    verificationStatus === 'smoke-green' &&
    (verification?.drift.signal ?? 'elevated') !== 'elevated';
  const source: ContentIntelligenceMetadata['source'] = authoredSignals ? 'hybrid' : 'benchmark';
  const confidenceTier = deriveConfidenceTier({
    benchmarkConfidence,
    confidenceScore,
    verificationStatus,
    goldenUsage,
    driftSignal: verification?.drift.signal,
  });

  return {
    source,
    verification_status: verificationStatus,
    last_verified_at: verification ? SHOWCASE_SHORTLIST_REPORT.generatedAt ?? null : null,
    target_coverage: targetCoverage,
    benchmark_confidence: benchmarkConfidence,
    confidence_tier: confidenceTier,
    golden_usage: goldenUsage,
    quality_score: qualityScore,
    confidence_score: confidenceScore,
    recommended,
    evidence: [...evidence],
    benchmark: {
      classification: normalizeClassification(
        verification?.classification ?? showcase.classification,
      ),
      target: verification?.target ?? showcase.target ?? null,
      drift_signal: verification?.drift.signal,
      build_passed: verification?.build.passed ?? null,
      smoke_passed: verification?.smoke.passed ?? null,
    },
  };
}
