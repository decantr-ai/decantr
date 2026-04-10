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

const AUTHORED_QUALITY_RECOMMEND_THRESHOLD = 74;
const AUTHORED_CONFIDENCE_RECOMMEND_THRESHOLD = 68;

const SHOWCASE_RUNTIME_BUDGETS = {
  largestJsAssetWarnBytes: 350_000,
  totalCssWarnBytes: 150_000,
  totalAssetsWarnBytes: 1_500_000,
} as const;

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function toUniqueList(values: Iterable<string>): string[] {
  return [...new Set([...values].filter((value) => value.trim().length > 0))];
}

function hasDocumentMetadataBaseline(verification: ShowcaseVerificationEntry | null): boolean {
  return Boolean(
    verification?.smoke.passed
    && verification.smoke.rootDocumentOk
    && verification.smoke.titleOk
    && verification.smoke.langOk
    && verification.smoke.viewportOk,
  );
}

function hasCharsetBaseline(verification: ShowcaseVerificationEntry | null): boolean {
  return Boolean(verification?.smoke.passed && verification.smoke.charsetOk);
}

function hasScriptHygieneBaseline(verification: ShowcaseVerificationEntry | null): boolean {
  return Boolean(
    verification?.smoke.passed
    && verification.smoke.inlineScriptCount === 0
    && verification.smoke.inlineEventHandlerCount === 0
    && verification.smoke.externalScriptsWithoutIntegrityCount === 0
    && verification.smoke.externalScriptsWithIntegrityMissingCrossoriginCount === 0
    && verification.smoke.externalStylesheetsWithoutIntegrityCount === 0
    && verification.smoke.externalStylesheetsWithIntegrityMissingCrossoriginCount === 0
    && verification.smoke.externalScriptsWithInsecureTransportCount === 0
    && verification.smoke.externalStylesheetsWithInsecureTransportCount === 0
    && verification.smoke.externalMediaSourcesWithInsecureTransportCount === 0,
  );
}

function hasCspSignal(verification: ShowcaseVerificationEntry | null): boolean {
  return Boolean(verification?.smoke.passed && verification.smoke.cspSignalOk);
}

function hasFullRouteCoverage(verification: ShowcaseVerificationEntry | null): boolean {
  return Boolean(verification?.smoke.passed && verification.smoke.fullRouteCoverageOk);
}

function hasRouteDocumentHardening(verification: ShowcaseVerificationEntry | null): boolean {
  return Boolean(verification?.smoke.passed && verification.smoke.routeDocumentsHardeningOk);
}

function hasRuntimeHardeningBaseline(verification: ShowcaseVerificationEntry | null): boolean {
  return hasDocumentMetadataBaseline(verification)
    && hasCharsetBaseline(verification)
    && hasScriptHygieneBaseline(verification)
    && hasRouteDocumentHardening(verification);
}

function isWithinRuntimeBudget(verification: ShowcaseVerificationEntry | null): boolean {
  return Boolean(
    verification?.smoke.passed
    && verification.smoke.largestAssetBytes <= SHOWCASE_RUNTIME_BUDGETS.largestJsAssetWarnBytes
    && verification.smoke.cssAssetBytes <= SHOWCASE_RUNTIME_BUDGETS.totalCssWarnBytes
    && verification.smoke.totalAssetBytes <= SHOWCASE_RUNTIME_BUDGETS.totalAssetsWarnBytes,
  );
}

function deriveBenchmarkConfidence(
  showcase: ShowcaseManifestEntry,
  verification: ShowcaseVerificationEntry | null,
): ContentIntelligenceMetadata['benchmark_confidence'] {
  if (
    verification?.verificationStatus === 'smoke-green'
    && hasRuntimeHardeningBaseline(verification)
    && hasFullRouteCoverage(verification)
    && isWithinRuntimeBudget(verification)
  ) {
    return 'high';
  }
  if (verification?.verificationStatus === 'smoke-green') return 'medium';
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
  if (hasDocumentMetadataBaseline(verification)) score += 4;
  if (hasCharsetBaseline(verification)) score += 3;
  if (hasScriptHygieneBaseline(verification)) score += 4;
  if (hasFullRouteCoverage(verification)) score += 5;
  if (hasRouteDocumentHardening(verification)) score += 3;
  if (hasCspSignal(verification)) score += 2;
  if (isWithinRuntimeBudget(verification)) score += 6;

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
  runtimeHardeningOk: boolean;
  fullRouteCoverageOk: boolean;
  runtimeBudgetOk: boolean;
}): ContentIntelligenceMetadata['confidence_tier'] {
  if (
    input.goldenUsage === 'shortlisted'
    && input.verificationStatus === 'smoke-green'
    && input.driftSignal !== 'elevated'
    && input.runtimeHardeningOk
    && input.fullRouteCoverageOk
    && input.runtimeBudgetOk
  ) {
    return 'verified';
  }

  if (
    input.confidenceScore >= 82
    || (input.verificationStatus === 'smoke-green' && input.runtimeHardeningOk && input.fullRouteCoverageOk)
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

  if (hasDocumentMetadataBaseline(verification)) score += 5;
  if (hasCharsetBaseline(verification)) score += 4;
  if (hasScriptHygieneBaseline(verification)) score += 5;
  if (hasFullRouteCoverage(verification)) score += 6;
  if (hasCspSignal(verification)) score += 2;
  if (isWithinRuntimeBudget(verification)) score += 8;

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
  const recommended =
    official
    && qualityScore >= AUTHORED_QUALITY_RECOMMEND_THRESHOLD
    && confidenceScore >= AUTHORED_CONFIDENCE_RECOMMEND_THRESHOLD;

  return {
    evidence: official ? ['official-source', ...evidence] : evidence,
    qualityScore,
    confidenceScore,
    recommended,
  };
}

function deriveAuthoredRecommendationReasons(
  namespace: string,
  authoredSignals: AuthoredIntelligenceSignals | null,
): string[] {
  if (!authoredSignals) {
    return [];
  }

  const reasons: string[] = [];
  const authoredEvidence = authoredSignals.evidence.filter((signal) => signal !== 'official-source');

  if (namespace === '@official') {
    reasons.push('Official registry source');
  }
  if (authoredEvidence.length >= 5) {
    reasons.push('Structured authored contract coverage is strong');
  }
  if (authoredSignals.evidence.some((signal) => ['code-example', 'layout-contract', 'tokens', 'presets'].includes(signal))) {
    reasons.push('Copyable implementation guidance is present');
  }
  if (authoredSignals.qualityScore >= AUTHORED_QUALITY_RECOMMEND_THRESHOLD) {
    reasons.push('Authored quality score meets the recommendation threshold');
  }
  if (authoredSignals.confidenceScore >= AUTHORED_CONFIDENCE_RECOMMEND_THRESHOLD) {
    reasons.push('Authored confidence score meets the recommendation threshold');
  }

  return toUniqueList(reasons);
}

function deriveAuthoredRecommendationBlockers(
  namespace: string,
  authoredSignals: AuthoredIntelligenceSignals | null,
): string[] {
  if (!authoredSignals) {
    return [];
  }

  const blockers: string[] = [];
  const authoredEvidence = authoredSignals.evidence.filter((signal) => signal !== 'official-source');

  if (namespace !== '@official') {
    blockers.push('Only official registry items are recommended from authored signals alone');
  }
  if (authoredEvidence.length < 5) {
    blockers.push('Structured authored contract coverage is still thin');
  }
  if (authoredSignals.qualityScore < AUTHORED_QUALITY_RECOMMEND_THRESHOLD) {
    blockers.push('Authored quality score is below the recommendation threshold');
  }
  if (authoredSignals.confidenceScore < AUTHORED_CONFIDENCE_RECOMMEND_THRESHOLD) {
    blockers.push('Authored confidence score is below the recommendation threshold');
  }

  return toUniqueList(blockers);
}

function deriveBenchmarkRecommendationExplanation(input: {
  namespace: string;
  authoredSignals: AuthoredIntelligenceSignals | null;
  goldenUsage: ContentIntelligenceMetadata['golden_usage'];
  verificationStatus: ContentIntelligenceMetadata['verification_status'];
  benchmarkConfidence: ContentIntelligenceMetadata['benchmark_confidence'];
  verification: ShowcaseVerificationEntry | null;
  runtimeHardeningOk: boolean;
  fullRouteCoverageOk: boolean;
  runtimeBudgetOk: boolean;
}): Pick<ContentIntelligenceMetadata, 'recommendation_reasons' | 'recommendation_blockers'> {
  const reasons = deriveAuthoredRecommendationReasons(input.namespace, input.authoredSignals);
  const blockers: string[] = [];

  reasons.push('Live showcase evidence is available');

  if (input.goldenUsage === 'shortlisted') {
    reasons.push('Shortlisted showcase benchmark');
  } else {
    blockers.push('Showcase benchmark is not shortlisted yet');
  }

  switch (input.verificationStatus) {
    case 'smoke-green':
      reasons.push('Smoke verification passed');
      break;
    case 'build-green':
      blockers.push('Runtime smoke verification has not passed yet');
      break;
    case 'build-red':
    case 'smoke-red':
      blockers.push('Latest showcase verification is failing');
      break;
    default:
      blockers.push('Showcase verification is still pending');
      break;
  }

  if (input.runtimeHardeningOk) {
    reasons.push('Runtime hardening baseline passed');
  } else {
    blockers.push('Runtime hardening baseline is incomplete');
  }

  if (input.fullRouteCoverageOk) {
    reasons.push('Full route coverage survived the build');
  } else {
    blockers.push('Full route coverage is not preserved in the build');
  }

  if (input.runtimeBudgetOk) {
    reasons.push('Runtime asset budgets are within target');
  } else {
    blockers.push('Runtime asset budgets exceed the preferred thresholds');
  }

  if (input.verification?.drift.signal === 'lower') {
    reasons.push('Benchmark drift is low');
  } else if (input.verification?.drift.signal === 'moderate') {
    reasons.push('Benchmark drift is moderate but acceptable');
  } else if (input.verification?.drift.signal === 'elevated') {
    blockers.push('Benchmark drift is elevated');
  }

  if (input.benchmarkConfidence === 'high') {
    reasons.push('Benchmark confidence is high');
  }

  return {
    recommendation_reasons: toUniqueList(reasons),
    recommendation_blockers: toUniqueList(blockers),
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

    const recommendationReasons = deriveAuthoredRecommendationReasons(namespace, authoredSignals);
    const recommendationBlockers = authoredSignals.recommended
      ? []
      : deriveAuthoredRecommendationBlockers(namespace, authoredSignals);

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
        runtimeHardeningOk: false,
        fullRouteCoverageOk: false,
        runtimeBudgetOk: false,
      }),
      golden_usage: 'none',
      quality_score: authoredSignals.qualityScore,
      confidence_score: authoredSignals.confidenceScore,
      recommended: authoredSignals.recommended,
      evidence: authoredSignals.evidence,
      recommendation_reasons: recommendationReasons,
      recommendation_blockers: recommendationBlockers,
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
  if (hasDocumentMetadataBaseline(verification)) {
    evidence.add('document-metadata-verified');
  }
  if (hasCharsetBaseline(verification)) {
    evidence.add('charset-verified');
  }
  if (hasScriptHygieneBaseline(verification)) {
    evidence.add('script-hygiene-verified');
  }
  if (hasRuntimeHardeningBaseline(verification)) {
    evidence.add('runtime-hardening-verified');
  }
  if (hasFullRouteCoverage(verification)) {
    evidence.add('full-route-coverage-verified');
  }
  if (hasCspSignal(verification)) {
    evidence.add('csp-signal-present');
  }
  if (isWithinRuntimeBudget(verification)) {
    evidence.add('asset-budget-ok');
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
    hasRuntimeHardeningBaseline(verification) &&
    hasFullRouteCoverage(verification) &&
    isWithinRuntimeBudget(verification) &&
    (verification?.drift.signal ?? 'elevated') !== 'elevated';
  const source: ContentIntelligenceMetadata['source'] = authoredSignals ? 'hybrid' : 'benchmark';
  const confidenceTier = deriveConfidenceTier({
    benchmarkConfidence,
    confidenceScore,
    verificationStatus,
    goldenUsage,
    driftSignal: verification?.drift.signal,
    runtimeHardeningOk: hasRuntimeHardeningBaseline(verification),
    fullRouteCoverageOk: hasFullRouteCoverage(verification),
    runtimeBudgetOk: isWithinRuntimeBudget(verification),
  });
  const recommendationExplanation = deriveBenchmarkRecommendationExplanation({
    namespace,
    authoredSignals,
    goldenUsage,
    verificationStatus,
    benchmarkConfidence,
    verification,
    runtimeHardeningOk: hasRuntimeHardeningBaseline(verification),
    fullRouteCoverageOk: hasFullRouteCoverage(verification),
    runtimeBudgetOk: isWithinRuntimeBudget(verification),
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
    recommendation_reasons: recommendationExplanation.recommendation_reasons,
    recommendation_blockers: recommended ? [] : recommendationExplanation.recommendation_blockers,
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
