export const CERTIFICATION_TIERS = ['enterprise', 'demo', 'experimental'];

export const DEFAULT_CERTIFICATION_TIER = 'enterprise';

export function getContentCertification(item) {
  const certification = item && typeof item === 'object' ? item.certification : null;
  const tier = certification && CERTIFICATION_TIERS.includes(certification.tier)
    ? certification.tier
    : DEFAULT_CERTIFICATION_TIER;

  return {
    tier,
    rationale: typeof certification?.rationale === 'string' ? certification.rationale : null,
  };
}

export function isEnterpriseCertified(item) {
  return getContentCertification(item).tier === 'enterprise';
}

const DANGEROUS_POLICY_PATTERNS = [
  {
    id: 'auth-bypass',
    pattern: /\bauth\s+bypass\b|decantr_authenticated|accept\s+any\s+credentials/i,
  },
  {
    id: 'unsafe-demo-auth',
    pattern: /\bno\s+actual\s+auth\b|\bdemo\s+mode\b.*\blocalstorage\b|\blocalstorage\b.*\bdemo\s+flag\b/i,
  },
  {
    id: 'hardcoded-secrets',
    pattern: /\bhardcoded\s+(?:secret|token|api\s*key|password)\b/i,
  },
  {
    id: 'disabled-authorization',
    pattern: /\bdisabled\s+authorization\b|\bskip\s+authorization\b|\bturn\s+off\s+auth(?:orization)?\b/i,
  },
  {
    id: 'unsafe-demo-persistence',
    pattern: /\bdemo-only\s+persistence\b|\bunsafe\s+demo\b.*\bpersist/i,
  },
];

export function lintDangerousScaffoldingPolicy(item) {
  const serialized = JSON.stringify(item);
  return DANGEROUS_POLICY_PATTERNS
    .filter(({ pattern }) => pattern.test(serialized))
    .map(({ id }) => id);
}
