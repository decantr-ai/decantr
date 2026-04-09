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

export function getContentIntelligence(
  type: ContentType,
  namespace: string,
  slug: string,
): ContentIntelligenceMetadata | null {
  if (type !== 'blueprint' || namespace !== '@official') {
    return null;
  }

  const showcase = getShowcaseManifestEntry(slug);
  if (!showcase) {
    return null;
  }

  const verification = getShowcaseVerificationEntry(slug);
  const targetCoverage = showcase.target ? [showcase.target] : [];
  const goldenUsage = showcase.goldenCandidate ? 'shortlisted' : 'showcase';
  const evidence = ['live-showcase'];

  if (showcase.goldenCandidate) {
    evidence.push('shortlisted-showcase');
  }
  if (verification?.build.passed) {
    evidence.push('build-verified');
  }
  if (verification?.smoke.passed) {
    evidence.push('smoke-verified');
  }

  const verificationStatus = verification?.verificationStatus ?? 'pending';
  const benchmarkConfidence = deriveBenchmarkConfidence(showcase, verification);
  const qualityScore = deriveQualityScore(showcase, verification);
  const confidenceScore = deriveConfidenceScore(showcase, verification);
  const recommended =
    goldenUsage === 'shortlisted' &&
    verificationStatus === 'smoke-green' &&
    (verification?.drift.signal ?? 'elevated') !== 'elevated';

  return {
    verification_status: verificationStatus,
    last_verified_at: verification ? SHOWCASE_SHORTLIST_REPORT.generatedAt ?? null : null,
    target_coverage: targetCoverage,
    benchmark_confidence: benchmarkConfidence,
    golden_usage: goldenUsage,
    quality_score: qualityScore,
    confidence_score: confidenceScore,
    recommended,
    evidence,
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
