import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { runCli } from './cli.mjs';
import {
  AUDIT_SCHEMA_VERSION,
  DayZeroValidationError,
  ORACLE_SCHEMA_VERSION,
  assertOracle,
  auditDayZero,
  formatJson,
  generateOracleDraft,
  sha256,
} from './oracle.mjs';

test('oracle schema is a strict Draft 2020-12 document', async () => {
  const schema = JSON.parse(await readFile(new URL('./oracle.schema.json', import.meta.url), 'utf8'));
  assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
  assert.equal(schema.type, 'object');
  assert.equal(schema.additionalProperties, false);
  assert.equal(schema.properties.schemaVersion.const, ORACLE_SCHEMA_VERSION);
});

test('draft generation is deterministic and never fabricates expectations or approval', () => {
  const fixture = makeFixture();
  const first = generateOracleDraft(fixture);
  const second = generateOracleDraft(fixture);

  assert.deepEqual(first, second);
  assert.equal(first.review.status, 'draft');
  assert.equal(first.repositories.length, 2);
  assert.ok(first.repositories.every((repository) => repository.expectations === null));
  assert.ok(first.repositories.every((repository) => repository.review.status === 'pending'));
  assert.throws(
    () => assertOracle(first, { requireApproved: true }),
    (error) =>
      error instanceof DayZeroValidationError &&
      error.issues.some((issue) => issue.includes('must be "approved" for auditing')),
  );
});

test('strict oracle validation rejects unknown properties and approval without evidence', () => {
  const fixture = makeFixture();
  const oracle = approveOracle(generateOracleDraft(fixture));
  oracle.repositories[0].unexpected = true;
  oracle.repositories[1].review.evidence = [];

  assert.throws(
    () => assertOracle(oracle, { requireApproved: true }),
    (error) =>
      error instanceof DayZeroValidationError &&
      error.issues.some((issue) => issue.includes('.unexpected is not allowed')) &&
      error.issues.some((issue) => issue.includes('must cite at least one independently reviewed source')),
  );
});

test('approved expectations pass and produce a deterministic audit', () => {
  const fixture = makeFixture();
  const oracle = approveOracle(generateOracleDraft(fixture));
  const auditInput = {
    ...fixture,
    oracle,
    oracleSha256: sha256(formatJson(oracle)),
  };
  const first = auditDayZero(auditInput);
  const second = auditDayZero(auditInput);

  assert.deepEqual(first, second);
  assert.equal(first.schemaVersion, AUDIT_SCHEMA_VERSION);
  assert.equal(first.passed, true);
  assert.equal(first.summary.findings, 0);
  assert.deepEqual(first.findings, []);
});

test('audit fails closed for missing, unsupported, contaminated, and high-confidence untargetable repositories', () => {
  const fixture = makeFixture();
  const oracle = approveOracle(generateOracleDraft(fixture));
  const brokenReport = structuredClone(fixture.report);
  brokenReport.results[0].applicability = 'not_applicable';
  brokenReport.results[0].routes.excludedAuthorityFiles = ['src/fixtures/fake.routes.ts'];
  brokenReport.results[0].routes.taskableRouteCount = 0;
  brokenReport.results.pop();

  const audit = auditDayZero({
    ...fixture,
    oracle,
    report: brokenReport,
    oracleSha256: sha256(formatJson(oracle)),
    reportSha256: sha256(formatJson(brokenReport)),
  });
  const codes = new Set(audit.findings.map((finding) => finding.code));

  assert.equal(audit.passed, false);
  assert.ok(codes.has('REPOSITORY_MISSING'));
  assert.ok(codes.has('UNSUPPORTED_REPOSITORY'));
  assert.ok(codes.has('AUTHORITY_CONTAMINATION'));
  assert.ok(codes.has('HIGH_CONFIDENCE_WITHOUT_TASKABLE_TARGET'));
});

test('audit reports every expectation class and limitation drift', () => {
  const fixture = makeFixture();
  const oracle = approveOracle(generateOracleDraft(fixture));
  const result = fixture.report.results[0];
  const expectation = oracle.repositories[0].expectations;
  expectation.minimums.taskableTargets = result.routes.taskableRouteCount + 1;
  expectation.minimums.components = result.components.count + 1;

  const changedReport = structuredClone(fixture.report);
  const changed = changedReport.results[0];
  changed.uiAuthority.primaryMode = 'component-library';
  changed.routes.strategy = 'source-declared';
  changed.routes.authority = 'inferred';
  changed.routes.completeness = 'partial';
  changed.styling.approach = 'inline-styles';
  changed.styling.confidence = 'medium';
  changed.limitations = ['A newly discovered limitation that was not reviewed.'];

  const audit = auditDayZero({
    ...fixture,
    oracle,
    report: changedReport,
    oracleSha256: sha256(formatJson(oracle)),
    reportSha256: sha256(formatJson(changedReport)),
  });
  const codes = new Set(audit.findings.map((finding) => finding.code));

  for (const code of [
    'PROJECT_MODE_MISMATCH',
    'ROUTE_AUTHORITY_FAMILY_MISMATCH',
    'ROUTE_AUTHORITY_BELOW_MINIMUM',
    'ROUTE_COMPLETENESS_BELOW_MINIMUM',
    'TASKABLE_TARGET_MINIMUM_MISSED',
    'COMPONENT_MINIMUM_MISSED',
    'STYLING_AUTHORITY_FAMILY_MISMATCH',
    'STYLING_CONFIDENCE_BELOW_MINIMUM',
    'REQUIRED_LIMITATION_MISSING',
    'UNEXPECTED_LIMITATION',
  ]) {
    assert.ok(codes.has(code), `missing finding ${code}`);
  }
});

test('normalized null authority evidence remains auditable and fails closed', () => {
  const fixture = makeFixture();
  const oracle = approveOracle(generateOracleDraft(fixture));
  const report = structuredClone(fixture.report);
  report.results[0].confidence = { level: null, score: null };
  report.results[0].routes.authority = null;
  report.results[0].routes.completeness = null;
  report.results[0].components.confidence = null;
  report.results[0].styling.confidence = null;
  report.results[0].uiAuthority = null;

  const audit = auditDayZero({
    ...fixture,
    oracle,
    report,
    oracleSha256: sha256(formatJson(oracle)),
    reportSha256: sha256(formatJson(report)),
  });
  const codes = new Set(audit.findings.map((finding) => finding.code));

  assert.ok(codes.has('UI_AUTHORITY_UNAVAILABLE'));
  assert.ok(codes.has('PROJECT_MODE_MISMATCH'));
  assert.ok(codes.has('ROUTE_AUTHORITY_BELOW_MINIMUM'));
  assert.ok(codes.has('ROUTE_COMPLETENESS_BELOW_MINIMUM'));
  assert.ok(codes.has('STYLING_CONFIDENCE_BELOW_MINIMUM'));
});

test('audit treats corpus digest and extra repository drift as failures', () => {
  const fixture = makeFixture();
  const oracle = approveOracle(generateOracleDraft(fixture));
  oracle.corpus.sha256 = 'f'.repeat(64);
  const report = structuredClone(fixture.report);
  report.results.push({ ...structuredClone(report.results[0]), id: 'extra-app' });

  const audit = auditDayZero({
    ...fixture,
    oracle,
    report,
    oracleSha256: sha256(formatJson(oracle)),
    reportSha256: sha256(formatJson(report)),
  });
  const codes = new Set(audit.findings.map((finding) => finding.code));

  assert.ok(codes.has('ORACLE_CORPUS_DIGEST_MISMATCH'));
  assert.ok(codes.has('UNEXPECTED_REPOSITORY'));
});

test('CLI generates a draft, refuses unapproved audit, and returns one for findings', async () => {
  const root = await mkdtemp(join(tmpdir(), 'decantr-day-zero-oracle-'));
  try {
    const fixture = makeFixture();
    const corpusPath = join(root, 'corpus.json');
    const reportPath = join(root, 'report.json');
    const draftPath = join(root, 'draft.json');
    const approvedPath = join(root, 'approved.json');
    const auditPath = join(root, 'audit.json');
    await writeFile(corpusPath, formatJson(fixture.corpus));
    await writeFile(reportPath, formatJson(fixture.report));

    const generated = captureIo();
    assert.equal(
      await runCli(
        ['generate', '--corpus', corpusPath, '--report', reportPath, '--out', draftPath],
        generated.io,
      ),
      0,
    );
    const draft = JSON.parse(await readFile(draftPath, 'utf8'));
    assert.equal(draft.review.status, 'draft');
    assert.ok(draft.repositories.every((repository) => repository.expectations === null));

    const rejected = captureIo();
    assert.equal(
      await runCli(
        ['audit', '--corpus', corpusPath, '--oracle', draftPath, '--report', reportPath],
        rejected.io,
      ),
      2,
    );
    assert.match(rejected.stderr(), /must be "approved" for auditing/u);

    const approved = approveOracle(draft);
    await writeFile(approvedPath, formatJson(approved));
    const broken = structuredClone(fixture.report);
    broken.results[0].routes.excludedAuthorityFiles = ['test/fake-route.ts'];
    await writeFile(reportPath, formatJson(broken));
    const audited = captureIo();
    assert.equal(
      await runCli(
        [
          'audit',
          '--corpus',
          corpusPath,
          '--oracle',
          approvedPath,
          '--report',
          reportPath,
          '--out',
          auditPath,
        ],
        audited.io,
      ),
      1,
    );
    const audit = JSON.parse(await readFile(auditPath, 'utf8'));
    assert.equal(audit.passed, false);
    assert.equal(audit.summary.findingCodes.AUTHORITY_CONTAMINATION, 1);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

function makeFixture() {
  const corpus = {
    schemaVersion: 'decantr-benchmark-corpus.v1',
    program: 'decantr-3.10-ui-change-control-proof',
    frozenAt: '2026-07-22T10:02:09Z',
    sourcePolicy: { redistributeSource: false },
    repositories: [
      makeCorpusRepository('angular-app', 'angular', 'apps/angular', 'a'),
      makeCorpusRepository('react-app', 'react', '.', 'b'),
    ],
  };
  const corpusBytes = formatJson(corpus);
  const report = {
    schemaVersion: 'decantr-day-zero-report.v1',
    generatedAt: '2026-07-22T12:00:00.000Z',
    baseline: { cliVersion: '3.10.0-dev' },
    manifests: {
      corpusSha256: sha256(corpusBytes),
      modelsSha256: 'c'.repeat(64),
      protocolSha256: 'd'.repeat(64),
    },
    corpusRoot: '/tmp/corpus',
    rawDirectory: '/tmp/raw',
    summary: { repositories: 2, completed: 2 },
    results: [
      makeReportResult({
        id: 'angular-app',
        framework: 'angular',
        projectPath: 'apps/angular',
        strategy: 'angular-router',
        styling: 'scss',
      }),
      makeReportResult({
        id: 'react-app',
        framework: 'react',
        projectPath: '.',
        strategy: 'react-router',
        styling: 'tailwind',
      }),
    ],
  };
  const reportBytes = formatJson(report);
  return {
    corpus,
    report,
    corpusSha256: sha256(corpusBytes),
    reportSha256: sha256(reportBytes),
  };
}

function makeCorpusRepository(id, framework, projectPath, shaCharacter) {
  return {
    id,
    repo: `https://github.com/example/${id}.git`,
    commit: shaCharacter.repeat(40),
    branch: 'main',
    license: 'MIT',
    framework,
    projectPath,
    partition: 'development',
  };
}

function makeReportResult({ id, framework, projectPath, strategy, styling }) {
  return {
    id,
    partition: 'development',
    expectedFramework: framework,
    projectPath,
    commitVerified: true,
    worktreeClean: true,
    status: 'completed',
    schemaVersion: 'scan-report.v2',
    applicability: 'strong_fit',
    confidence: { level: 'high', score: 98 },
    project: {
      framework,
      packageName: id,
      reportedProjectPath: projectPath,
      workspaceScope: projectPath === '.' ? 'single-app' : 'workspace-app',
    },
    routes: {
      strategy,
      count: 4,
      routeSignalCount: 5,
      taskableRouteCount: 4,
      authority: 'proven',
      completeness: 'complete',
      authorityFiles: ['src/routes.ts'],
      excludedAuthorityFiles: [],
    },
    components: { count: 8, confidence: 'high' },
    styling: {
      approach: styling,
      confidence: 'high',
      evidence: ['Production stylesheet import found'],
      limitations: [],
    },
    uiAuthority: {
      status: 'ready',
      primaryMode: 'application',
      counts: { route: 5, component: 8 },
      axes: { surfaceAuthority: 'proven' },
      reasons: [],
    },
    limitations: ['Component inventory is static and advisory.'],
    error: null,
  };
}

function approveOracle(oracle) {
  const approved = structuredClone(oracle);
  approved.review = {
    status: 'approved',
    approvedBy: 'Independent Day-0 reviewer',
    approvedAt: '2026-07-22T13:00:00.000Z',
    method: 'Pinned production route, component, and styling sources were independently inspected.',
    notes: [],
  };
  for (const repository of approved.repositories) {
    const observed = repository.observedAtDraft;
    repository.expectations = {
      projectMode: observed.projectMode,
      routeAuthority: {
        family: `${repository.id}-routes`,
        acceptedStrategies: [observed.routeStrategy],
        minimumLevel: observed.routeAuthority,
        minimumCompleteness: observed.routeCompleteness,
      },
      minimums: {
        taskableTargets: observed.taskableTargets,
        components: observed.components,
      },
      stylingAuthority: {
        family: `${repository.id}-styles`,
        acceptedApproaches: [observed.stylingApproach],
        minimumConfidence: observed.stylingConfidence,
      },
      knownLimitations: {
        allowUnexpected: false,
        required: observed.limitations.map((limitation, index) => ({
          id: `known-${index + 1}`,
          source: limitation.source,
          match: 'exact',
          text: limitation.text,
        })),
        allowed: [],
      },
    };
    repository.review = {
      status: 'approved',
      evidence: ['src/routes.ts and the production styling entrypoint at the pinned commit'],
      notes: [],
    };
  }
  assertOracle(approved, { requireApproved: true });
  return approved;
}

function captureIo() {
  let stdout = '';
  let stderr = '';
  return {
    io: {
      stdout: (value) => {
        stdout += value;
      },
      stderr: (value) => {
        stderr += value;
      },
    },
    stdout: () => stdout,
    stderr: () => stderr,
  };
}
