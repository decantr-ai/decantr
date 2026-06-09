export interface VerificationRepairAction {
  id: string;
  payload?: Record<string, unknown>;
}

export interface VerificationDiagnosticInput {
  id: string;
  category: string;
  message: string;
  source?: string;
  rule?: string;
  target?: string;
  file?: string;
  suggestedFix?: string;
  evidence?: string[];
}

export interface VerificationDiagnosticMetadata {
  code: string;
  repair: VerificationRepairAction;
}

export interface VerificationDiagnosticCatalogEntry {
  rule: string;
  code: string;
  repairId: string;
  family: string;
}

export const KNOWN_VERIFICATION_DIAGNOSTICS = [
  {
    rule: 'browser-base-url-missing',
    code: 'VISUAL002',
    repairId: 'provide-browser-base-url',
    family: 'VISUAL',
  },
  {
    rule: 'browser-playwright-missing',
    code: 'VISUAL001',
    repairId: 'install-browser-verifier',
    family: 'VISUAL',
  },
  {
    rule: 'browser-route-verification-failed',
    code: 'VISUAL003',
    repairId: 'fix-route-render',
    family: 'VISUAL',
  },
  {
    rule: 'browser-runtime-probes-failed',
    code: 'RUNTIME010',
    repairId: 'repair-browser-runtime-probes',
    family: 'RUNTIME',
  },
  {
    rule: 'browser-axe-violations',
    code: 'A11Y020',
    repairId: 'fix-rendered-accessibility',
    family: 'A11Y',
  },
  {
    rule: 'visual-baseline-screenshot-drift',
    code: 'VISUAL010',
    repairId: 'review-visual-baseline-drift',
    family: 'VISUAL',
  },
  {
    rule: 'brownfield-route-drift',
    code: 'ROUTE001',
    repairId: 'reconcile-brownfield-routes',
    family: 'ROUTE',
  },
  { rule: 'check-failed', code: 'CHECK001', repairId: 'repair-contract-check', family: 'CHECK' },
  {
    rule: 'component-reuse-raw-control',
    code: 'COMP010',
    repairId: 'replace-raw-control-with-local-component',
    family: 'COMP',
  },
  {
    rule: 'behavior-project-interaction-primitive',
    code: 'COMP020',
    repairId: 'use-project-owned-interaction-primitive',
    family: 'COMP',
  },
  {
    rule: 'behavior-dialog-project-primitive',
    code: 'COMP020',
    repairId: 'use-project-owned-interaction-primitive',
    family: 'COMP',
  },
  {
    rule: 'component-reuse-primitive-reimplemented',
    code: 'COMP001',
    repairId: 'import-existing-component',
    family: 'COMP',
  },
  {
    rule: 'declared-route-resolves',
    code: 'STRUCT002',
    repairId: 'repair-route-binding',
    family: 'STRUCT',
  },
  {
    rule: 'design-token-coverage',
    code: 'TOKEN002',
    repairId: 'repair-design-token-coverage',
    family: 'TOKEN',
  },
  {
    rule: 'style-bridge-arbitrary-value',
    code: 'TOKEN010',
    repairId: 'replace-arbitrary-style-with-bridge-token',
    family: 'TOKEN',
  },
  {
    rule: 'essence-present',
    code: 'CONTRACT001',
    repairId: 'restore-essence-contract',
    family: 'CONTRACT',
  },
  {
    rule: 'essence-v4',
    code: 'CONTRACT002',
    repairId: 'migrate-essence-v4',
    family: 'CONTRACT',
  },
  {
    rule: 'focus-visible-enabled',
    code: 'A11Y001',
    repairId: 'enable-focus-visible',
    family: 'A11Y',
  },
  {
    rule: 'behavior-dialog-accessible-name',
    code: 'A11Y010',
    repairId: 'restore-dialog-accessible-name',
    family: 'A11Y',
  },
  {
    rule: 'behavior-form-label-associated',
    code: 'A11Y011',
    repairId: 'restore-label-association',
    family: 'A11Y',
  },
  {
    rule: 'behavior-dialog-visible-consequence',
    code: 'INT010',
    repairId: 'restore-visible-consequence-copy',
    family: 'INT',
  },
  {
    rule: 'behavior-dialog-cancel-affordance',
    code: 'INT011',
    repairId: 'restore-cancel-affordance',
    family: 'INT',
  },
  {
    rule: 'behavior-dialog-submitting-guard',
    code: 'INT012',
    repairId: 'restore-submitting-guard',
    family: 'INT',
  },
  {
    rule: 'behavior-form-explicit-button-type',
    code: 'INT013',
    repairId: 'set-explicit-button-type',
    family: 'INT',
  },
  {
    rule: 'pack-manifest-present',
    code: 'CTX002',
    repairId: 'hydrate-execution-packs',
    family: 'CTX',
  },
  {
    rule: 'pack-manifest-missing',
    code: 'CTX002',
    repairId: 'hydrate-execution-packs',
    family: 'CTX',
  },
  {
    rule: 'page-pack-count-mismatch',
    code: 'CTX001',
    repairId: 'regenerate-context-packs',
    family: 'CTX',
  },
  { rule: 'page-route-required', code: 'STRUCT001', repairId: 'add-page-route', family: 'STRUCT' },
  {
    rule: 'project-audit-invalid',
    code: 'AUDIT001',
    repairId: 'repair-project-audit',
    family: 'AUDIT',
  },
  {
    rule: 'review-pack-present',
    code: 'CTX003',
    repairId: 'hydrate-review-pack',
    family: 'CTX',
  },
  {
    rule: 'review-pack-file-missing',
    code: 'CTX003',
    repairId: 'hydrate-review-pack',
    family: 'CTX',
  },
  {
    rule: 'section-shell-concrete',
    code: 'STRUCT003',
    repairId: 'assign-section-shell',
    family: 'STRUCT',
  },
  {
    rule: 'tokens-file-present',
    code: 'TOKEN001',
    repairId: 'restore-design-token-file',
    family: 'TOKEN',
  },
  {
    rule: 'typed-graph-current',
    code: 'GRAPH001',
    repairId: 'regenerate-typed-graph',
    family: 'GRAPH',
  },
] as const satisfies readonly VerificationDiagnosticCatalogEntry[];

const CODE_BY_RULE: Record<string, string> = Object.fromEntries(
  KNOWN_VERIFICATION_DIAGNOSTICS.map((entry) => [entry.rule, entry.code]),
);

const REPAIR_BY_RULE: Record<string, string> = Object.fromEntries(
  KNOWN_VERIFICATION_DIAGNOSTICS.map((entry) => [entry.rule, entry.repairId]),
);

const DEFAULT_REPAIR_BY_SOURCE: Record<string, string> = {
  assertion: 'repair-contract-assertion',
  audit: 'repair-audit-finding',
  browser: 'repair-browser-evidence',
  brownfield: 'repair-brownfield-drift',
  check: 'repair-contract-check',
  'design-token': 'repair-design-token-drift',
  'style-bridge': 'repair-style-bridge-drift',
  graph: 'regenerate-typed-graph',
  interaction: 'repair-interaction-contract',
  pack: 'regenerate-context-packs',
  runtime: 'repair-runtime-output',
};

const DEFAULT_CODE_PREFIX_BY_SOURCE: Record<string, string> = {
  assertion: 'CONTRACT',
  audit: 'AUDIT',
  browser: 'VISUAL',
  brownfield: 'ROUTE',
  check: 'CHECK',
  'design-token': 'TOKEN',
  'style-bridge': 'TOKEN',
  graph: 'GRAPH',
  interaction: 'INT',
  pack: 'CTX',
  runtime: 'RUNTIME',
};

function stableNumber(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return String((hash % 900) + 100).padStart(3, '0');
}

function normalizedKey(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

function codePrefix(input: VerificationDiagnosticInput): string {
  const source = normalizedKey(input.source);
  if (source && DEFAULT_CODE_PREFIX_BY_SOURCE[source]) return DEFAULT_CODE_PREFIX_BY_SOURCE[source];

  const category = normalizedKey(input.category);
  if (category.includes('accessibility')) return 'A11Y';
  if (category.includes('route')) return 'ROUTE';
  if (category.includes('token')) return 'TOKEN';
  if (category.includes('runtime')) return 'RUNTIME';
  if (category.includes('pack') || category.includes('context')) return 'CTX';
  if (category.includes('visual') || category.includes('browser')) return 'VISUAL';
  if (category.includes('interaction')) return 'INT';
  if (category.includes('contract')) return 'CONTRACT';
  return 'DCTR';
}

function lookupById<T>(map: Record<string, T>, input: VerificationDiagnosticInput): T | undefined {
  const id = normalizedKey(input.id);
  if (!id) return undefined;
  if (map[id]) return map[id];
  const source = normalizedKey(input.source);
  const idWithoutSource = source && id.startsWith(`${source}-`) ? id.slice(source.length + 1) : id;
  if (map[idWithoutSource]) return map[idWithoutSource];
  const suffix = Object.keys(map).find((key) => id.endsWith(`-${key}`));
  return suffix ? map[suffix] : undefined;
}

function diagnosticCode(input: VerificationDiagnosticInput): string {
  const rule = normalizedKey(input.rule);
  if (rule && CODE_BY_RULE[rule]) return CODE_BY_RULE[rule];
  const idCode = lookupById(CODE_BY_RULE, input);
  if (idCode) return idCode;
  const seed = [input.source, input.rule, input.id, input.category, input.message]
    .filter((entry): entry is string => typeof entry === 'string' && entry.length > 0)
    .join('|');
  return `${codePrefix(input)}${stableNumber(seed)}`;
}

function repairId(input: VerificationDiagnosticInput): string {
  const rule = normalizedKey(input.rule);
  if (rule && REPAIR_BY_RULE[rule]) return REPAIR_BY_RULE[rule];
  const idRepair = lookupById(REPAIR_BY_RULE, input);
  if (idRepair) return idRepair;
  const source = normalizedKey(input.source);
  return DEFAULT_REPAIR_BY_SOURCE[source] ?? 'repair-project-health-finding';
}

function compactPayload(input: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.length > 0;
      return true;
    }),
  );
}

export function deriveVerificationDiagnostic(
  input: VerificationDiagnosticInput,
): VerificationDiagnosticMetadata {
  const payload = compactPayload({
    source: input.source,
    rule: input.rule,
    target: input.target,
    file: input.file,
    suggested_fix: input.suggestedFix,
    evidence: input.evidence?.slice(0, 5),
  });
  const repair: VerificationRepairAction = { id: repairId(input) };
  if (Object.keys(payload).length > 0) repair.payload = payload;
  return {
    code: diagnosticCode(input),
    repair,
  };
}
