import { createHash } from 'node:crypto';

export const PROGRAM = 'decantr-3.10-ui-change-control-proof';
export const ORACLE_SCHEMA_VERSION = 'decantr-day-zero-target-oracle.v1';
export const REPORT_SCHEMA_VERSION = 'decantr-day-zero-report.v1';
export const AUDIT_SCHEMA_VERSION = 'decantr-day-zero-target-audit.v1';

const SHA256 = /^[a-f0-9]{64}$/u;
const GIT_SHA = /^[a-f0-9]{40}$/u;
const SLUG = /^[a-z0-9][a-z0-9._-]*$/u;
const REPORT_STATUSES = ['completed', 'harness_failure', 'scan_failure'];
const APPROVAL_STATUSES = ['draft', 'approved'];
const REPOSITORY_REVIEW_STATUSES = ['pending', 'approved'];
const ROUTE_AUTHORITY_RANK = new Map([
  ['unknown', 0],
  ['unresolved', 1],
  ['inferred', 2],
  ['proven', 3],
]);
const COMPLETENESS_RANK = new Map([
  ['unknown', 0],
  ['partial', 1],
  ['complete', 2],
]);
const CONFIDENCE_RANK = new Map([
  ['unknown', 0],
  ['low', 1],
  ['medium', 2],
  ['high', 3],
]);

export class DayZeroValidationError extends Error {
  constructor(label, issues) {
    super(`${label} is invalid:\n${issues.map((issue) => `- ${issue}`).join('\n')}`);
    this.name = 'DayZeroValidationError';
    this.issues = issues;
  }
}

export function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

export function formatJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function assertCorpus(corpus) {
  const issues = [];
  checkObject(corpus, '$', issues, {
    required: ['schemaVersion', 'program', 'frozenAt', 'sourcePolicy', 'repositories'],
  });
  checkEqual(corpus?.schemaVersion, 'decantr-benchmark-corpus.v1', '$.schemaVersion', issues);
  checkEqual(corpus?.program, PROGRAM, '$.program', issues);
  checkString(corpus?.frozenAt, '$.frozenAt', issues);
  checkPlainObject(corpus?.sourcePolicy, '$.sourcePolicy', issues);
  checkArray(corpus?.repositories, '$.repositories', issues, { minimum: 1 });

  const ids = new Set();
  for (const [index, repository] of (corpus?.repositories ?? []).entries()) {
    const path = `$.repositories[${index}]`;
    checkObject(repository, path, issues, {
      required: ['id', 'repo', 'commit', 'branch', 'license', 'framework', 'projectPath', 'partition'],
    });
    checkPattern(repository?.id, SLUG, `${path}.id`, issues);
    checkString(repository?.repo, `${path}.repo`, issues);
    checkPattern(repository?.commit, GIT_SHA, `${path}.commit`, issues);
    checkString(repository?.branch, `${path}.branch`, issues);
    checkString(repository?.license, `${path}.license`, issues);
    checkString(repository?.framework, `${path}.framework`, issues);
    checkString(repository?.projectPath, `${path}.projectPath`, issues);
    checkOneOf(repository?.partition, ['development', 'qualification'], `${path}.partition`, issues);
    if (ids.has(repository?.id)) issues.push(`${path}.id duplicates ${JSON.stringify(repository?.id)}`);
    ids.add(repository?.id);
  }

  throwIfIssues('Day-0 corpus', issues);
  return corpus;
}

export function assertDayZeroReport(report) {
  const issues = [];
  checkObject(report, '$', issues, {
    required: [
      'schemaVersion',
      'generatedAt',
      'baseline',
      'manifests',
      'corpusRoot',
      'rawDirectory',
      'summary',
      'results',
    ],
  });
  checkEqual(report?.schemaVersion, REPORT_SCHEMA_VERSION, '$.schemaVersion', issues);
  checkString(report?.generatedAt, '$.generatedAt', issues);
  checkPlainObject(report?.baseline, '$.baseline', issues);
  checkObject(report?.manifests, '$.manifests', issues, {
    required: ['corpusSha256', 'modelsSha256', 'protocolSha256'],
  });
  for (const key of ['corpusSha256', 'modelsSha256', 'protocolSha256']) {
    checkPattern(report?.manifests?.[key], SHA256, `$.manifests.${key}`, issues);
  }
  checkString(report?.corpusRoot, '$.corpusRoot', issues);
  checkString(report?.rawDirectory, '$.rawDirectory', issues);
  checkPlainObject(report?.summary, '$.summary', issues);
  checkArray(report?.results, '$.results', issues, { minimum: 1 });

  const ids = new Set();
  for (const [index, result] of (report?.results ?? []).entries()) {
    validateResult(result, `$.results[${index}]`, issues);
    if (ids.has(result?.id)) issues.push(`$.results[${index}].id duplicates ${JSON.stringify(result?.id)}`);
    ids.add(result?.id);
  }

  throwIfIssues('Day-0 report', issues);
  return report;
}

export function assertOracle(oracle, { requireApproved = false } = {}) {
  const issues = [];
  checkObject(oracle, '$', issues, {
    required: ['schemaVersion', 'program', 'corpus', 'sourceReport', 'review', 'repositories'],
  });
  checkEqual(oracle?.schemaVersion, ORACLE_SCHEMA_VERSION, '$.schemaVersion', issues);
  checkEqual(oracle?.program, PROGRAM, '$.program', issues);

  checkObject(oracle?.corpus, '$.corpus', issues, {
    required: ['schemaVersion', 'sha256', 'repositoryCount', 'repositoryIds'],
  });
  checkEqual(oracle?.corpus?.schemaVersion, 'decantr-benchmark-corpus.v1', '$.corpus.schemaVersion', issues);
  checkPattern(oracle?.corpus?.sha256, SHA256, '$.corpus.sha256', issues);
  checkInteger(oracle?.corpus?.repositoryCount, '$.corpus.repositoryCount', issues, { minimum: 1 });
  checkStringArray(oracle?.corpus?.repositoryIds, '$.corpus.repositoryIds', issues, { minimum: 1, unique: true });

  checkObject(oracle?.sourceReport, '$.sourceReport', issues, {
    required: ['schemaVersion', 'sha256'],
  });
  checkEqual(oracle?.sourceReport?.schemaVersion, REPORT_SCHEMA_VERSION, '$.sourceReport.schemaVersion', issues);
  checkPattern(oracle?.sourceReport?.sha256, SHA256, '$.sourceReport.sha256', issues);

  validateTopLevelReview(oracle?.review, '$.review', issues);
  checkArray(oracle?.repositories, '$.repositories', issues, { minimum: 1 });

  const repositoryIds = new Set();
  for (const [index, repository] of (oracle?.repositories ?? []).entries()) {
    const path = `$.repositories[${index}]`;
    checkObject(repository, path, issues, {
      required: ['id', 'observedAtDraft', 'expectations', 'review'],
    });
    checkPattern(repository?.id, SLUG, `${path}.id`, issues);
    if (repositoryIds.has(repository?.id)) issues.push(`${path}.id duplicates ${JSON.stringify(repository?.id)}`);
    repositoryIds.add(repository?.id);
    validateObserved(repository?.observedAtDraft, `${path}.observedAtDraft`, issues);
    if (repository?.expectations !== null) {
      validateExpectations(repository?.expectations, `${path}.expectations`, issues);
    }
    validateRepositoryReview(repository?.review, `${path}.review`, issues);
    if (repository?.review?.status === 'approved' && repository?.expectations === null) {
      issues.push(`${path}.expectations must be populated before repository approval`);
    }
    if (requireApproved && repository?.review?.status !== 'approved') {
      issues.push(`${path}.review.status must be "approved" for auditing`);
    }
    if (requireApproved && repository?.expectations === null) {
      issues.push(`${path}.expectations must be populated for auditing`);
    }
  }

  if (oracle?.corpus?.repositoryCount !== oracle?.corpus?.repositoryIds?.length) {
    issues.push('$.corpus.repositoryCount must equal $.corpus.repositoryIds.length');
  }
  if (oracle?.corpus?.repositoryCount !== oracle?.repositories?.length) {
    issues.push('$.corpus.repositoryCount must equal $.repositories.length');
  }
  if (requireApproved && oracle?.review?.status !== 'approved') {
    issues.push('$.review.status must be "approved" for auditing');
  }

  throwIfIssues('Day-0 target oracle', issues);
  return oracle;
}

export function assertOracleCorpusBinding(oracle, corpus, corpusSha256) {
  assertOracle(oracle);
  assertCorpus(corpus);
  const issues = bindingIssues(oracle, corpus, corpusSha256).map((finding) => finding.message);
  throwIfIssues('Day-0 oracle corpus binding', issues);
  return oracle;
}

export function generateOracleDraft({ corpus, report, corpusSha256, reportSha256 }) {
  assertCorpus(corpus);
  assertDayZeroReport(report);
  assertDigest(corpusSha256, 'corpusSha256');
  assertDigest(reportSha256, 'reportSha256');

  const resultById = indexResults(report.results);
  const corpusIds = corpus.repositories.map((repository) => repository.id);
  const extraIds = [...resultById.keys()].filter((id) => !corpusIds.includes(id));
  const missingIds = corpusIds.filter((id) => !resultById.has(id));
  if (missingIds.length > 0 || extraIds.length > 0) {
    throw new DayZeroValidationError('Day-0 draft source coverage', [
      ...(missingIds.length > 0 ? [`missing repositories: ${missingIds.join(', ')}`] : []),
      ...(extraIds.length > 0 ? [`unexpected repositories: ${extraIds.join(', ')}`] : []),
    ]);
  }

  const oracle = {
    schemaVersion: ORACLE_SCHEMA_VERSION,
    program: PROGRAM,
    corpus: {
      schemaVersion: corpus.schemaVersion,
      sha256: corpusSha256,
      repositoryCount: corpus.repositories.length,
      repositoryIds: corpusIds,
    },
    sourceReport: {
      schemaVersion: report.schemaVersion,
      sha256: reportSha256,
    },
    review: {
      status: 'draft',
      approvedBy: null,
      approvedAt: null,
      method: null,
      notes: [
        'Generated observations are evidence to review, not accepted expectations.',
        'Approve only after independently checking the pinned source and every known limitation.',
      ],
    },
    repositories: corpus.repositories.map((repository) => {
      const result = resultById.get(repository.id);
      return {
        id: repository.id,
        observedAtDraft: observedSnapshot(result),
        expectations: null,
        review: {
          status: 'pending',
          evidence: [],
          notes: [],
        },
      };
    }),
  };

  assertOracle(oracle);
  return oracle;
}

export function auditDayZero({ oracle, report, corpus, corpusSha256, oracleSha256, reportSha256 }) {
  assertOracle(oracle, { requireApproved: true });
  assertDayZeroReport(report);
  assertCorpus(corpus);
  assertDigest(corpusSha256, 'corpusSha256');
  assertDigest(oracleSha256, 'oracleSha256');
  assertDigest(reportSha256, 'reportSha256');

  const findings = bindingIssues(oracle, corpus, corpusSha256);
  if (report.manifests.corpusSha256 !== corpusSha256) {
    findings.push(
      makeFinding({
        code: 'REPORT_CORPUS_DIGEST_MISMATCH',
        path: 'report.manifests.corpusSha256',
        expected: corpusSha256,
        actual: report.manifests.corpusSha256,
        message: 'The Day-0 report was not produced from the audited corpus bytes.',
      }),
    );
  }

  const corpusById = new Map(corpus.repositories.map((repository) => [repository.id, repository]));
  const oracleById = new Map(oracle.repositories.map((repository) => [repository.id, repository]));
  const reportById = indexResults(report.results);

  for (const repository of corpus.repositories) {
    const result = reportById.get(repository.id);
    if (!result) {
      findings.push(
        makeFinding({
          code: 'REPOSITORY_MISSING',
          repositoryId: repository.id,
          path: 'report.results',
          expected: repository.id,
          actual: null,
          message: `The Day-0 report is missing corpus repository ${repository.id}.`,
        }),
      );
      continue;
    }
    auditResult(result, repository, oracleById.get(repository.id), findings);
  }

  for (const result of report.results) {
    if (!corpusById.has(result.id)) {
      findings.push(
        makeFinding({
          code: 'UNEXPECTED_REPOSITORY',
          repositoryId: result.id,
          path: 'report.results',
          expected: null,
          actual: result.id,
          message: `The Day-0 report contains repository ${result.id}, which is not in the frozen corpus.`,
        }),
      );
    }
  }

  const repositoryOrder = new Map(corpus.repositories.map((repository, index) => [repository.id, index]));
  findings.sort((left, right) => compareFindings(left, right, repositoryOrder));

  return {
    schemaVersion: AUDIT_SCHEMA_VERSION,
    program: PROGRAM,
    passed: findings.length === 0,
    bindings: {
      corpusSha256,
      oracleSha256,
      reportSha256,
      reportCorpusSha256: report.manifests.corpusSha256,
      oracleCorpusSha256: oracle.corpus.sha256,
      sourceReportSha256: oracle.sourceReport.sha256,
    },
    summary: {
      expectedRepositories: corpus.repositories.length,
      observedRepositories: report.results.length,
      findings: findings.length,
      findingCodes: countBy(findings, (finding) => finding.code),
    },
    findings,
  };
}

function validateResult(result, path, issues) {
  checkObject(result, path, issues, {
    required: ['id', 'partition', 'expectedFramework', 'projectPath', 'commitVerified', 'worktreeClean', 'status'],
    optional: [
      'tree',
      'exitCode',
      'durationMs',
      'rawOutputSha256',
      'rawStderrSha256',
      'rawOutputFile',
      'schemaVersion',
      'applicability',
      'confidence',
      'project',
      'routes',
      'components',
      'styling',
      'uiAuthority',
      'limitations',
      'error',
    ],
  });
  checkPattern(result?.id, SLUG, `${path}.id`, issues);
  checkOneOf(result?.partition, ['development', 'qualification'], `${path}.partition`, issues);
  checkString(result?.expectedFramework, `${path}.expectedFramework`, issues);
  checkString(result?.projectPath, `${path}.projectPath`, issues);
  checkBoolean(result?.commitVerified, `${path}.commitVerified`, issues);
  checkBoolean(result?.worktreeClean, `${path}.worktreeClean`, issues);
  checkOneOf(result?.status, REPORT_STATUSES, `${path}.status`, issues);

  if (result?.status !== 'completed') return;
  for (const key of [
    'schemaVersion',
    'applicability',
    'confidence',
    'project',
    'routes',
    'components',
    'styling',
    'uiAuthority',
    'limitations',
    'error',
  ]) {
    if (!Object.hasOwn(result, key)) issues.push(`${path}.${key} is required when status is "completed"`);
  }
  checkString(result?.schemaVersion, `${path}.schemaVersion`, issues);
  checkNullableString(result?.applicability, `${path}.applicability`, issues);
  validateConfidence(result?.confidence, `${path}.confidence`, issues);
  validateProject(result?.project, `${path}.project`, issues);
  validateRoutes(result?.routes, `${path}.routes`, issues);
  validateComponents(result?.components, `${path}.components`, issues);
  validateStyling(result?.styling, `${path}.styling`, issues);
  validateUiAuthority(result?.uiAuthority, `${path}.uiAuthority`, issues);
  checkStringArray(result?.limitations, `${path}.limitations`, issues);
  if (result?.error !== null) checkString(result?.error, `${path}.error`, issues);
}

function validateConfidence(value, path, issues) {
  checkObject(value, path, issues, { required: ['level', 'score'] });
  checkNullableOneOf(value?.level, [...CONFIDENCE_RANK.keys()], `${path}.level`, issues);
  checkNullableFiniteNumber(value?.score, `${path}.score`, issues);
}

function validateProject(value, path, issues) {
  checkObject(value, path, issues, {
    required: ['framework', 'packageName', 'reportedProjectPath', 'workspaceScope'],
  });
  for (const key of ['framework', 'packageName', 'reportedProjectPath', 'workspaceScope']) {
    checkNullableString(value?.[key], `${path}.${key}`, issues);
  }
}

function validateRoutes(value, path, issues) {
  checkObject(value, path, issues, {
    required: [
      'strategy',
      'count',
      'routeSignalCount',
      'taskableRouteCount',
      'authority',
      'completeness',
      'authorityFiles',
      'excludedAuthorityFiles',
    ],
  });
  checkNullableString(value?.strategy, `${path}.strategy`, issues);
  checkInteger(value?.count, `${path}.count`, issues, { minimum: 0 });
  checkInteger(value?.routeSignalCount, `${path}.routeSignalCount`, issues, { minimum: 0 });
  checkInteger(value?.taskableRouteCount, `${path}.taskableRouteCount`, issues, { minimum: 0 });
  checkNullableOneOf(value?.authority, [...ROUTE_AUTHORITY_RANK.keys()], `${path}.authority`, issues);
  checkNullableOneOf(value?.completeness, [...COMPLETENESS_RANK.keys()], `${path}.completeness`, issues);
  checkStringArray(value?.authorityFiles, `${path}.authorityFiles`, issues);
  checkStringArray(value?.excludedAuthorityFiles, `${path}.excludedAuthorityFiles`, issues);
}

function validateComponents(value, path, issues) {
  checkObject(value, path, issues, { required: ['count', 'confidence'] });
  checkInteger(value?.count, `${path}.count`, issues, { minimum: 0 });
  checkNullableOneOf(value?.confidence, [...CONFIDENCE_RANK.keys()], `${path}.confidence`, issues);
}

function validateStyling(value, path, issues) {
  checkObject(value, path, issues, {
    required: ['approach', 'confidence', 'evidence', 'limitations'],
  });
  checkNullableString(value?.approach, `${path}.approach`, issues);
  checkNullableOneOf(value?.confidence, [...CONFIDENCE_RANK.keys()], `${path}.confidence`, issues);
  checkStringArray(value?.evidence, `${path}.evidence`, issues);
  checkStringArray(value?.limitations, `${path}.limitations`, issues);
}

function validateUiAuthority(value, path, issues) {
  if (value === null) return;
  checkObject(value, path, issues, {
    required: ['status', 'primaryMode', 'counts', 'axes', 'reasons'],
  });
  checkOneOf(value?.status, ['ready', 'limited', 'blocked', 'unsupported'], `${path}.status`, issues);
  checkString(value?.primaryMode, `${path}.primaryMode`, issues);
  checkPlainObject(value?.counts, `${path}.counts`, issues);
  checkPlainObject(value?.axes, `${path}.axes`, issues);
  checkStringArray(value?.reasons, `${path}.reasons`, issues);
}

function validateTopLevelReview(value, path, issues) {
  checkObject(value, path, issues, {
    required: ['status', 'approvedBy', 'approvedAt', 'method', 'notes'],
  });
  checkOneOf(value?.status, APPROVAL_STATUSES, `${path}.status`, issues);
  checkStringArray(value?.notes, `${path}.notes`, issues);
  if (value?.status === 'draft') {
    for (const key of ['approvedBy', 'approvedAt', 'method']) {
      if (value?.[key] !== null) issues.push(`${path}.${key} must be null while the oracle is a draft`);
    }
  } else if (value?.status === 'approved') {
    checkString(value?.approvedBy, `${path}.approvedBy`, issues);
    checkIsoTimestamp(value?.approvedAt, `${path}.approvedAt`, issues);
    checkString(value?.method, `${path}.method`, issues, { minimumLength: 20 });
  }
}

function validateRepositoryReview(value, path, issues) {
  checkObject(value, path, issues, { required: ['status', 'evidence', 'notes'] });
  checkOneOf(value?.status, REPOSITORY_REVIEW_STATUSES, `${path}.status`, issues);
  checkStringArray(value?.evidence, `${path}.evidence`, issues);
  checkStringArray(value?.notes, `${path}.notes`, issues);
  if (value?.status === 'approved' && value?.evidence?.length === 0) {
    issues.push(`${path}.evidence must cite at least one independently reviewed source`);
  }
}

function validateObserved(value, path, issues) {
  checkObject(value, path, issues, {
    required: [
      'status',
      'applicability',
      'projectMode',
      'routeStrategy',
      'routeAuthority',
      'routeCompleteness',
      'taskableTargets',
      'components',
      'stylingApproach',
      'stylingConfidence',
      'limitations',
    ],
  });
  checkOneOf(value?.status, REPORT_STATUSES, `${path}.status`, issues);
  for (const key of [
    'applicability',
    'projectMode',
    'routeStrategy',
    'routeAuthority',
    'routeCompleteness',
    'stylingApproach',
    'stylingConfidence',
  ]) {
    checkNullableString(value?.[key], `${path}.${key}`, issues);
  }
  checkInteger(value?.taskableTargets, `${path}.taskableTargets`, issues, { minimum: 0 });
  checkInteger(value?.components, `${path}.components`, issues, { minimum: 0 });
  checkLimitationSnapshots(value?.limitations, `${path}.limitations`, issues);
}

function validateExpectations(value, path, issues) {
  checkObject(value, path, issues, {
    required: ['projectMode', 'routeAuthority', 'minimums', 'stylingAuthority', 'knownLimitations'],
  });
  checkString(value?.projectMode, `${path}.projectMode`, issues);

  checkObject(value?.routeAuthority, `${path}.routeAuthority`, issues, {
    required: ['family', 'acceptedStrategies', 'minimumLevel', 'minimumCompleteness'],
  });
  checkPattern(value?.routeAuthority?.family, SLUG, `${path}.routeAuthority.family`, issues);
  checkStringArray(value?.routeAuthority?.acceptedStrategies, `${path}.routeAuthority.acceptedStrategies`, issues, {
    minimum: 1,
    unique: true,
  });
  checkOneOf(
    value?.routeAuthority?.minimumLevel,
    [...ROUTE_AUTHORITY_RANK.keys()],
    `${path}.routeAuthority.minimumLevel`,
    issues,
  );
  checkOneOf(
    value?.routeAuthority?.minimumCompleteness,
    [...COMPLETENESS_RANK.keys()],
    `${path}.routeAuthority.minimumCompleteness`,
    issues,
  );

  checkObject(value?.minimums, `${path}.minimums`, issues, {
    required: ['taskableTargets', 'components'],
  });
  checkInteger(value?.minimums?.taskableTargets, `${path}.minimums.taskableTargets`, issues, { minimum: 0 });
  checkInteger(value?.minimums?.components, `${path}.minimums.components`, issues, { minimum: 0 });

  checkObject(value?.stylingAuthority, `${path}.stylingAuthority`, issues, {
    required: ['family', 'acceptedApproaches', 'minimumConfidence'],
  });
  checkPattern(value?.stylingAuthority?.family, SLUG, `${path}.stylingAuthority.family`, issues);
  checkStringArray(
    value?.stylingAuthority?.acceptedApproaches,
    `${path}.stylingAuthority.acceptedApproaches`,
    issues,
    { minimum: 1, unique: true },
  );
  checkOneOf(
    value?.stylingAuthority?.minimumConfidence,
    [...CONFIDENCE_RANK.keys()],
    `${path}.stylingAuthority.minimumConfidence`,
    issues,
  );

  checkObject(value?.knownLimitations, `${path}.knownLimitations`, issues, {
    required: ['allowUnexpected', 'required', 'allowed'],
  });
  checkBoolean(value?.knownLimitations?.allowUnexpected, `${path}.knownLimitations.allowUnexpected`, issues);
  checkArray(value?.knownLimitations?.required, `${path}.knownLimitations.required`, issues);
  checkArray(value?.knownLimitations?.allowed, `${path}.knownLimitations.allowed`, issues);
  const matcherIds = new Set();
  for (const bucket of ['required', 'allowed']) {
    for (const [index, matcher] of (value?.knownLimitations?.[bucket] ?? []).entries()) {
      const matcherPath = `${path}.knownLimitations.${bucket}[${index}]`;
      validateLimitationMatcher(matcher, matcherPath, issues);
      if (matcherIds.has(matcher?.id)) issues.push(`${matcherPath}.id duplicates ${JSON.stringify(matcher?.id)}`);
      matcherIds.add(matcher?.id);
    }
  }
}

function validateLimitationMatcher(value, path, issues) {
  checkObject(value, path, issues, { required: ['id', 'source', 'match', 'text'] });
  checkPattern(value?.id, SLUG, `${path}.id`, issues);
  checkOneOf(value?.source, ['discovery', 'styling', 'either'], `${path}.source`, issues);
  checkOneOf(value?.match, ['exact', 'contains'], `${path}.match`, issues);
  checkString(value?.text, `${path}.text`, issues);
}

function checkLimitationSnapshots(value, path, issues) {
  checkArray(value, path, issues);
  for (const [index, limitation] of (value ?? []).entries()) {
    checkObject(limitation, `${path}[${index}]`, issues, { required: ['source', 'text'] });
    checkOneOf(limitation?.source, ['discovery', 'styling'], `${path}[${index}].source`, issues);
    checkString(limitation?.text, `${path}[${index}].text`, issues);
  }
}

function observedSnapshot(result) {
  return {
    status: result.status,
    applicability: result.applicability ?? null,
    projectMode: result.uiAuthority?.primaryMode ?? null,
    routeStrategy: result.routes?.strategy ?? null,
    routeAuthority: result.routes?.authority ?? null,
    routeCompleteness: result.routes?.completeness ?? null,
    taskableTargets: result.routes?.taskableRouteCount ?? 0,
    components: result.components?.count ?? 0,
    stylingApproach: result.styling?.approach ?? null,
    stylingConfidence: result.styling?.confidence ?? null,
    limitations: collectLimitations(result),
  };
}

function auditResult(result, corpusRepository, oracleRepository, findings) {
  const repositoryId = corpusRepository.id;
  if (!oracleRepository) {
    findings.push(
      makeFinding({
        code: 'ORACLE_REPOSITORY_MISSING',
        repositoryId,
        path: 'oracle.repositories',
        expected: repositoryId,
        actual: null,
        message: `The approved oracle is missing corpus repository ${repositoryId}.`,
      }),
    );
    return;
  }
  if (result.expectedFramework !== corpusRepository.framework) {
    findings.push(
      mismatch(
        'CORPUS_FRAMEWORK_MISMATCH',
        repositoryId,
        'expectedFramework',
        corpusRepository.framework,
        result.expectedFramework,
      ),
    );
  }
  if (result.projectPath !== corpusRepository.projectPath) {
    findings.push(
      mismatch(
        'CORPUS_PROJECT_PATH_MISMATCH',
        repositoryId,
        'projectPath',
        corpusRepository.projectPath,
        result.projectPath,
      ),
    );
  }
  if (result.status !== 'completed') {
    findings.push(
      mismatch('REPOSITORY_NOT_COMPLETED', repositoryId, 'status', 'completed', result.status),
    );
    return;
  }
  if (result.commitVerified !== true) {
    findings.push(mismatch('COMMIT_NOT_VERIFIED', repositoryId, 'commitVerified', true, result.commitVerified));
  }
  if (result.worktreeClean !== true) {
    findings.push(mismatch('WORKTREE_NOT_CLEAN', repositoryId, 'worktreeClean', true, result.worktreeClean));
  }
  if (result.applicability === 'not_applicable' || result.uiAuthority?.status === 'unsupported') {
    findings.push(
      makeFinding({
        code: 'UNSUPPORTED_REPOSITORY',
        repositoryId,
        path: `report.results[${repositoryId}]`,
        expected: 'supported',
        actual: result.applicability === 'not_applicable' ? result.applicability : result.uiAuthority?.status,
        message: `${repositoryId} is unsupported by the Day-0 candidate.`,
      }),
    );
  }
  if (result.uiAuthority === null) {
    findings.push(
      makeFinding({
        code: 'UI_AUTHORITY_UNAVAILABLE',
        repositoryId,
        path: `report.results[${repositoryId}].uiAuthority`,
        expected: 'normalized UI authority evidence',
        actual: null,
        message: `${repositoryId} has no normalized UI authority evidence.`,
      }),
    );
  }
  if ((result.routes?.excludedAuthorityFiles?.length ?? 0) > 0) {
    findings.push(
      makeFinding({
        code: 'AUTHORITY_CONTAMINATION',
        repositoryId,
        path: `report.results[${repositoryId}].routes.excludedAuthorityFiles`,
        expected: [],
        actual: result.routes.excludedAuthorityFiles,
        message: `${repositoryId} attributed authority to excluded test, fixture, demo, or generated paths.`,
      }),
    );
  }
  if (result.confidence?.level === 'high' && (result.routes?.taskableRouteCount ?? 0) === 0) {
    findings.push(
      makeFinding({
        code: 'HIGH_CONFIDENCE_WITHOUT_TASKABLE_TARGET',
        repositoryId,
        path: `report.results[${repositoryId}].routes.taskableRouteCount`,
        expected: 'greater than 0 when confidence.level is high',
        actual: result.routes?.taskableRouteCount ?? null,
        message: `${repositoryId} reports high confidence without a taskable route target.`,
      }),
    );
  }

  compareExpectations(result, oracleRepository.expectations, repositoryId, findings);
}

function compareExpectations(result, expectations, repositoryId, findings) {
  if (result.uiAuthority?.primaryMode !== expectations.projectMode) {
    findings.push(
      mismatch(
        'PROJECT_MODE_MISMATCH',
        repositoryId,
        'uiAuthority.primaryMode',
        expectations.projectMode,
        result.uiAuthority?.primaryMode ?? null,
      ),
    );
  }
  if (!expectations.routeAuthority.acceptedStrategies.includes(result.routes?.strategy)) {
    findings.push(
      mismatch(
        'ROUTE_AUTHORITY_FAMILY_MISMATCH',
        repositoryId,
        'routes.strategy',
        {
          family: expectations.routeAuthority.family,
          acceptedStrategies: expectations.routeAuthority.acceptedStrategies,
        },
        result.routes?.strategy ?? null,
      ),
    );
  }
  compareRank(
    ROUTE_AUTHORITY_RANK,
    result.routes?.authority,
    expectations.routeAuthority.minimumLevel,
    'ROUTE_AUTHORITY_BELOW_MINIMUM',
    repositoryId,
    'routes.authority',
    findings,
  );
  compareRank(
    COMPLETENESS_RANK,
    result.routes?.completeness,
    expectations.routeAuthority.minimumCompleteness,
    'ROUTE_COMPLETENESS_BELOW_MINIMUM',
    repositoryId,
    'routes.completeness',
    findings,
  );
  compareMinimum(
    result.routes?.taskableRouteCount,
    expectations.minimums.taskableTargets,
    'TASKABLE_TARGET_MINIMUM_MISSED',
    repositoryId,
    'routes.taskableRouteCount',
    findings,
  );
  compareMinimum(
    result.components?.count,
    expectations.minimums.components,
    'COMPONENT_MINIMUM_MISSED',
    repositoryId,
    'components.count',
    findings,
  );
  if (!expectations.stylingAuthority.acceptedApproaches.includes(result.styling?.approach)) {
    findings.push(
      mismatch(
        'STYLING_AUTHORITY_FAMILY_MISMATCH',
        repositoryId,
        'styling.approach',
        {
          family: expectations.stylingAuthority.family,
          acceptedApproaches: expectations.stylingAuthority.acceptedApproaches,
        },
        result.styling?.approach ?? null,
      ),
    );
  }
  compareRank(
    CONFIDENCE_RANK,
    result.styling?.confidence,
    expectations.stylingAuthority.minimumConfidence,
    'STYLING_CONFIDENCE_BELOW_MINIMUM',
    repositoryId,
    'styling.confidence',
    findings,
  );

  const limitations = collectLimitations(result);
  const matchers = [
    ...expectations.knownLimitations.required,
    ...expectations.knownLimitations.allowed,
  ];
  for (const matcher of expectations.knownLimitations.required) {
    if (!limitations.some((limitation) => matchesLimitation(matcher, limitation))) {
      findings.push(
        makeFinding({
          code: 'REQUIRED_LIMITATION_MISSING',
          repositoryId,
          path: `limitations.${matcher.id}`,
          expected: matcher,
          actual: limitations,
          message: `${repositoryId} no longer discloses required limitation ${matcher.id}.`,
        }),
      );
    }
  }
  if (!expectations.knownLimitations.allowUnexpected) {
    for (const limitation of limitations) {
      if (!matchers.some((matcher) => matchesLimitation(matcher, limitation))) {
        findings.push(
          makeFinding({
            code: 'UNEXPECTED_LIMITATION',
            repositoryId,
            path: `${limitation.source}.limitations`,
            expected: matchers,
            actual: limitation,
            message: `${repositoryId} reports a limitation that the approved oracle does not accept.`,
          }),
        );
      }
    }
  }
}

function bindingIssues(oracle, corpus, corpusSha256) {
  const findings = [];
  if (oracle.corpus.sha256 !== corpusSha256) {
    findings.push(
      makeFinding({
        code: 'ORACLE_CORPUS_DIGEST_MISMATCH',
        path: 'oracle.corpus.sha256',
        expected: corpusSha256,
        actual: oracle.corpus.sha256,
        message: 'The oracle is not bound to the audited corpus bytes.',
      }),
    );
  }
  const corpusIds = corpus.repositories.map((repository) => repository.id);
  if (JSON.stringify(oracle.corpus.repositoryIds) !== JSON.stringify(corpusIds)) {
    findings.push(
      makeFinding({
        code: 'ORACLE_CORPUS_IDS_MISMATCH',
        path: 'oracle.corpus.repositoryIds',
        expected: corpusIds,
        actual: oracle.corpus.repositoryIds,
        message: 'The oracle repository ID sequence does not match the frozen corpus.',
      }),
    );
  }
  const oracleIds = oracle.repositories.map((repository) => repository.id);
  if (JSON.stringify(oracleIds) !== JSON.stringify(corpusIds)) {
    findings.push(
      makeFinding({
        code: 'ORACLE_REPOSITORY_SEQUENCE_MISMATCH',
        path: 'oracle.repositories',
        expected: corpusIds,
        actual: oracleIds,
        message: 'The oracle repository sequence does not match the frozen corpus.',
      }),
    );
  }
  return findings;
}

function collectLimitations(result) {
  return [
    ...(result.limitations ?? []).map((text) => ({ source: 'discovery', text })),
    ...(result.styling?.limitations ?? []).map((text) => ({ source: 'styling', text })),
  ];
}

function matchesLimitation(matcher, limitation) {
  if (matcher.source !== 'either' && matcher.source !== limitation.source) return false;
  return matcher.match === 'exact'
    ? limitation.text === matcher.text
    : limitation.text.includes(matcher.text);
}

function compareRank(rank, actual, expected, code, repositoryId, path, findings) {
  if (!rank.has(actual) || rank.get(actual) < rank.get(expected)) {
    findings.push(mismatch(code, repositoryId, path, expected, actual ?? null));
  }
}

function compareMinimum(actual, expected, code, repositoryId, path, findings) {
  if (!Number.isInteger(actual) || actual < expected) {
    findings.push(mismatch(code, repositoryId, path, { minimum: expected }, actual ?? null));
  }
}

function mismatch(code, repositoryId, path, expected, actual) {
  return makeFinding({
    code,
    repositoryId,
    path: `report.results[${repositoryId}].${path}`,
    expected,
    actual,
    message: `${repositoryId} does not match the approved expectation at ${path}.`,
  });
}

function makeFinding({ code, repositoryId = null, path, expected, actual, message }) {
  return { code, repositoryId, path, expected, actual, message };
}

function compareFindings(left, right, repositoryOrder) {
  const leftOrder = left.repositoryId === null ? -1 : (repositoryOrder.get(left.repositoryId) ?? Number.MAX_SAFE_INTEGER);
  const rightOrder = right.repositoryId === null ? -1 : (repositoryOrder.get(right.repositoryId) ?? Number.MAX_SAFE_INTEGER);
  return leftOrder - rightOrder || left.code.localeCompare(right.code) || left.path.localeCompare(right.path);
}

function countBy(values, select) {
  const counts = {};
  for (const value of values) {
    const key = select(value);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return Object.fromEntries(Object.entries(counts).sort(([left], [right]) => left.localeCompare(right)));
}

function indexResults(results) {
  return new Map(results.map((result) => [result.id, result]));
}

function assertDigest(value, label) {
  if (!SHA256.test(value)) throw new DayZeroValidationError(label, [`${label} must be a lowercase SHA-256 digest`]);
}

function checkObject(value, path, issues, { required = [], optional = [] }) {
  if (!checkPlainObject(value, path, issues)) return;
  const accepted = new Set([...required, ...optional]);
  for (const key of required) {
    if (!Object.hasOwn(value, key)) issues.push(`${path}.${key} is required`);
  }
  for (const key of Object.keys(value)) {
    if (!accepted.has(key)) issues.push(`${path}.${key} is not allowed`);
  }
}

function checkPlainObject(value, path, issues) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    issues.push(`${path} must be an object`);
    return false;
  }
  return true;
}

function checkArray(value, path, issues, { minimum = 0 } = {}) {
  if (!Array.isArray(value)) {
    issues.push(`${path} must be an array`);
    return false;
  }
  if (value.length < minimum) issues.push(`${path} must contain at least ${minimum} item(s)`);
  return true;
}

function checkStringArray(value, path, issues, { minimum = 0, unique = false } = {}) {
  if (!checkArray(value, path, issues, { minimum })) return;
  for (const [index, item] of value.entries()) checkString(item, `${path}[${index}]`, issues);
  if (unique && new Set(value).size !== value.length) issues.push(`${path} must not contain duplicates`);
}

function checkString(value, path, issues, { minimumLength = 1 } = {}) {
  if (typeof value !== 'string' || value.trim().length < minimumLength) {
    issues.push(`${path} must be a string with at least ${minimumLength} non-whitespace character(s)`);
  }
}

function checkNullableString(value, path, issues) {
  if (value !== null) checkString(value, path, issues);
}

function checkBoolean(value, path, issues) {
  if (typeof value !== 'boolean') issues.push(`${path} must be a boolean`);
}

function checkInteger(value, path, issues, { minimum = Number.MIN_SAFE_INTEGER } = {}) {
  if (!Number.isInteger(value) || value < minimum) issues.push(`${path} must be an integer >= ${minimum}`);
}

function checkFiniteNumber(value, path, issues) {
  if (!Number.isFinite(value)) issues.push(`${path} must be a finite number`);
}

function checkNullableFiniteNumber(value, path, issues) {
  if (value !== null) checkFiniteNumber(value, path, issues);
}

function checkOneOf(value, accepted, path, issues) {
  if (!accepted.includes(value)) issues.push(`${path} must be one of ${accepted.map(JSON.stringify).join(', ')}`);
}

function checkNullableOneOf(value, accepted, path, issues) {
  if (value !== null) checkOneOf(value, accepted, path, issues);
}

function checkEqual(actual, expected, path, issues) {
  if (actual !== expected) issues.push(`${path} must equal ${JSON.stringify(expected)}`);
}

function checkPattern(value, pattern, path, issues) {
  if (typeof value !== 'string' || !pattern.test(value)) issues.push(`${path} has an invalid format`);
}

function checkIsoTimestamp(value, path, issues) {
  if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) {
    issues.push(`${path} must be an ISO-8601 timestamp`);
  }
}

function throwIfIssues(label, issues) {
  if (issues.length > 0) throw new DayZeroValidationError(label, issues);
}
