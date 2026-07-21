#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { fileURLToPath } from 'node:url';

const HUMAN_REVIEW_ATTESTATION =
  'I attest that I am a human reviewer, performed this review independently, and did not represent an agent or automated evidence pass as a person.';
const SIGNATURE_NAMESPACE = 'decantr-3.9-human-review';
const JUDGMENT_COUNT = 200;
const REVIEWER_COUNT = 2;
const LANES = ['greenfield', 'brownfield', 'hybrid'];
const STABLE_ID = /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/u;
const SHA256 = /^[a-f0-9]{64}$/u;
const GIT_OBJECT_ID = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/u;

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
function earlyOption(argv, name) {
  const directIndex = argv.indexOf(name);
  if (directIndex >= 0) return argv[directIndex + 1] ?? null;
  const prefixed = argv.find((arg) => arg.startsWith(`${name}=`));
  return prefixed ? prefixed.slice(name.length + 1) : null;
}

const repoRoot = resolve(
  earlyOption(process.argv.slice(2), '--repo-root') ?? resolve(scriptDirectory, '..'),
);
const qualificationDirectory = resolve(
  earlyOption(process.argv.slice(2), '--fixtures-dir') ??
    resolve(repoRoot, 'fixtures', 'qualification', '3.9'),
);
const reviewDirectory = resolve(qualificationDirectory, 'review');
const generatedDirectory = resolve(reviewDirectory, 'generated');
const signingDirectory = resolve(reviewDirectory, 'signatures');

const paths = {
  manifest: resolve(reviewDirectory, 'kit-manifest.json'),
  corpus: resolve(reviewDirectory, 'corpus.json'),
  reviewer1: resolve(reviewDirectory, 'reviewers', 'reviewer-1.json'),
  reviewer2: resolve(reviewDirectory, 'reviewers', 'reviewer-2.json'),
  adjudication: resolve(reviewDirectory, 'adjudication.json'),
  publicReplay: resolve(reviewDirectory, 'replays', 'public-3.8.3.json'),
  candidateReplay: resolve(reviewDirectory, 'replays', 'candidate-3.9.4.json'),
};

const generatedPaths = {
  packetFragment: resolve(generatedDirectory, 'human-review-packet-fragment.json'),
};

const signingPayloadPaths = {
  reviewer1: resolve(signingDirectory, 'reviewer-1.payload.json'),
  reviewer2: resolve(signingDirectory, 'reviewer-2.payload.json'),
  adjudication: resolve(signingDirectory, 'adjudication.payload.json'),
};

const dependencyPaths = {
  packet: 'fixtures/qualification/3.9/qualification-packet.json',
  schema: 'fixtures/qualification/3.9/qualification-packet.schema.json',
  compatibility: 'fixtures/qualification/3.9/compatibility-manifest.json',
  missingEvidence: 'fixtures/qualification/3.9/missing-evidence.json',
  legacyFindings: 'fixtures/qualification/3.9/finding-labels.json',
  audit: 'scripts/audit-3-9-qualification-baseline.mjs',
  humanReviewHarness: 'scripts/prepare-3-9-human-review.mjs',
};

const expectedReleases = {
  public383: {
    version: '3.8.3',
    installationSource: 'public-npm',
    packageVersions: {
      '@decantr/verifier': '3.8.3',
      '@decantr/mcp-server': '3.8.3',
      '@decantr/cli': '3.8.3',
    },
  },
  candidate390: {
    version: '3.9.4',
    installationSource: 'packed-or-public-npm',
    packageVersions: {
      '@decantr/content': '3.9.4',
      '@decantr/registry': '3.9.4',
      '@decantr/core': '3.9.4',
      '@decantr/verifier': '3.9.4',
      '@decantr/mcp-server': '3.9.4',
      '@decantr/cli': '3.9.4',
    },
  },
};

const worksheetPaths = {
  corpus: 'fixtures/qualification/3.9/review/corpus.json',
  reviewer1: 'fixtures/qualification/3.9/review/reviewers/reviewer-1.json',
  reviewer2: 'fixtures/qualification/3.9/review/reviewers/reviewer-2.json',
  adjudication: 'fixtures/qualification/3.9/review/adjudication.json',
  publicReplay: 'fixtures/qualification/3.9/review/replays/public-3.8.3.json',
  candidateReplay: 'fixtures/qualification/3.9/review/replays/candidate-3.9.4.json',
};

const usage = `Decantr 3.9 human finding review kit

This utility never updates qualification-packet.json and never treats a blank worksheet as evidence.

Workflow:
  1. Populate corpus.json with independently selected cases and all 200 candidate-output rows.
     Each case needs id, clusterId, lane, targetId, input, candidateSetExhaustive=true,
     and packet-schema-valid sourceEvidence. Do not import finding-labels.json rows.
     Set status=frozen and frozenAt, then run --seal-corpus.
  2. Give reviewer-1.json and reviewer-2.json to exactly two distinct people. Each person
     independently fills all 200 decisions, every case rationale, and their real reviewer record,
     then sets status=complete. Run --write-review-signing-payloads, sign each exact payload,
     record signedReviewEvidence, and run --seal-reviews.
  3. One registered reviewer fills all 200 adjudication decisions and every case resolution,
     including the precomputed disagreement IDs, then sets status=complete. Run
     --write-adjudication-signing-payload, sign it, record signedAdjudicationEvidence, and run
     --seal-adjudication.
  4. Replay public npm 3.8.3 first and candidate 3.9.4 second. The replay process must fill
     exact observed release/environment data, all 200 emitted booleans, exhaustive case rows,
     and an empty unexpectedOutputs array only after checking raw output.
  5. Run --validate, then --assemble. Assembly fails on incomplete evidence, invalid signatures,
     stale hashes, unexpected outputs, or an incompatible upstream packet/audit contract.

Commands:
  --prepare              Create missing blank workbooks; refuses every overwrite.
  --lint-only [--json]   Check structure while allowing honest incompleteness.
  --validate [--json]    Fail unless all real evidence is complete and consistent.
  --seal-corpus          Bind the frozen corpus to both untouched reviewer workbooks.
  --write-review-signing-payloads
                         Emit canonical payloads that include identity, corpus, all decisions,
                         and every reviewer rationale; refuses overwrite.
  --seal-reviews         Verify and bind exactly two completed human reviews.
  --write-adjudication-signing-payload
                         Emit the canonical adjudication payload with reviewer-workbook hashes,
                         all final decisions, rationales, and resolutions; refuses overwrite.
  --seal-adjudication    Bind completed adjudication to both untouched replay workbooks.
  --refresh-bindings     Refresh upstream hashes only while every workbook is pristine.
  --assemble             Emit review-owned artifacts and a non-claiming packet fragment.
  --self-test            Run deterministic internal checks without creating evidence.
  --repo-root <path>     Repository root (used by the qualification gate/test harness).
  --fixtures-dir <path>  Qualification fixture root (used by the qualification gate/test harness).
`;

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map((entry) => stableJson(entry)).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .filter((key) => value[key] !== undefined)
      .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

function hashJson(value) {
  return sha256(stableJson(value));
}

export function createBehaviorEvidenceBinding(exactPackageTarballs, behavior) {
  const schemaVersion = 'decantr-behavior-evidence-binding.v1';
  return {
    schemaVersion,
    packageSetSha256: hashJson(exactPackageTarballs),
    behaviorSha256: hashJson(behavior),
    boundEvidenceSha256: hashJson({ schemaVersion, exactPackageTarballs, behavior }),
  };
}

function jsonText(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function array(value) {
  return Array.isArray(value) ? value : [];
}

function unique(values) {
  return [...new Set(values)];
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isDateTime(value) {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/u.test(value) &&
    Number.isFinite(Date.parse(value))
  );
}

function isRelativePath(value) {
  return (
    isNonEmptyString(value) &&
    !isAbsolute(value) &&
    !value.split(/[\\/]+/u).includes('..')
  );
}

function exactKeys(value, expected, context, errors) {
  if (!isRecord(value)) {
    errors.push(`${context} must be an object`);
    return false;
  }
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (!isDeepStrictEqual(actual, wanted)) {
    errors.push(`${context} keys must be exactly: ${wanted.join(', ')}`);
    return false;
  }
  return true;
}

function readJsonAbsolute(path, context = relative(repoRoot, path)) {
  if (!existsSync(path)) throw new Error(`${context} is missing`);
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (cause) {
    throw new Error(`${context} is not valid JSON: ${cause.message}`);
  }
}

function writeJsonExclusive(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, jsonText(value), { encoding: 'utf8', flag: 'wx' });
}

function writeJson(path, value) {
  writeFileSync(path, jsonText(value), 'utf8');
}

const QUALIFICATION_REPO_PREFIX = 'fixtures/qualification/3.9/';

function repoPath(path) {
  const absolutePath = resolve(path);
  const qualificationRelative = relative(qualificationDirectory, absolutePath);
  if (
    qualificationRelative === '' ||
    (!qualificationRelative.startsWith('..') && !isAbsolute(qualificationRelative))
  ) {
    const suffix = qualificationRelative.split('\\').join('/');
    return suffix ? `${QUALIFICATION_REPO_PREFIX}${suffix}` : QUALIFICATION_REPO_PREFIX.slice(0, -1);
  }
  return relative(repoRoot, absolutePath).split('\\').join('/');
}

function dependencyAbsolutePath(path) {
  return path.startsWith(QUALIFICATION_REPO_PREFIX)
    ? resolve(qualificationDirectory, path.slice(QUALIFICATION_REPO_PREFIX.length))
    : resolve(repoRoot, path);
}

function expectedJudgmentIds() {
  return Array.from({ length: JUDGMENT_COUNT }, (_, index) =>
    `judgment-${String(index + 1).padStart(3, '0')}`,
  );
}

function blankJudgments(factory) {
  return expectedJudgmentIds().map((judgmentId) => ({ judgmentId, ...factory() }));
}

function packetContractSnapshot(packet) {
  return {
    schemaVersion: packet?.schemaVersion,
    packetId: packet?.packetId,
    programVersion: packet?.programVersion,
    baselineRelease: packet?.baselineRelease,
    findingCorpus: {
      requiredJudgmentCount: packet?.findingCorpus?.requiredJudgmentCount,
      requiredHumanReviewerCount: packet?.findingCorpus?.requiredHumanReviewerCount,
    },
    findingReleases: {
      public383: packet?.findingReplays?.public383?.release,
      candidate390: {
        version: packet?.findingReplays?.candidate390?.release?.version,
        installationSource:
          packet?.findingReplays?.candidate390?.release?.installationSource,
      },
    },
  };
}

function createContractBindings() {
  const packetPath = dependencyAbsolutePath(dependencyPaths.packet);
  const packet = readJsonAbsolute(packetPath, dependencyPaths.packet);
  return [
    {
      id: 'qualification-packet-contract',
      path: dependencyPaths.packet,
      kind: 'canonical-json-sha256',
      sha256: sha256(jsonText(packetContractSnapshot(packet))),
    },
    ...['schema', 'compatibility', 'legacyFindings', 'audit', 'humanReviewHarness'].map((id) => {
      const path = dependencyPaths[id];
      return {
        id,
        path,
        kind: 'file-sha256',
        sha256: sha256(readFileSync(dependencyAbsolutePath(path))),
      };
    }),
  ];
}

function createManifest() {
  return {
    schemaVersion: 'decantr-3.9-human-review-kit.v2',
    kitStatus: 'awaiting-human-evidence',
    qualificationClaim: false,
    requirements: {
      reviewerCount: REVIEWER_COUNT,
      judgmentCount: JUDGMENT_COUNT,
      requiredLanes: LANES,
      replayOrder: ['public383', 'candidate390'],
      baselineRelease: '3.8.3',
      candidateRelease: '3.9.4',
    },
    quarantine: {
      path: dependencyPaths.legacyFindings,
      requiredStatus: 'legacy-unqualified',
      countsTowardQualification: false,
      importIntoActiveCorpus: false,
    },
    contractBindings: createContractBindings(),
    worksheets: worksheetPaths,
    signingPayloads: {
      reviewer1: repoPath(signingPayloadPaths.reviewer1),
      reviewer2: repoPath(signingPayloadPaths.reviewer2),
      adjudication: repoPath(signingPayloadPaths.adjudication),
    },
    generatedOutputs: {
      artifactDirectory: repoPath(generatedDirectory),
      packetFragment: repoPath(generatedPaths.packetFragment),
    },
  };
}

function createCorpus() {
  return {
    schemaVersion: 'decantr-3.9-human-finding-corpus-workbook.v1',
    status: 'draft',
    qualificationClaim: false,
    frozenAt: null,
    legacyFindingLabelsImported: false,
    cases: [],
    judgments: blankJudgments(() => ({
      caseId: null,
      source: null,
      code: null,
      codeKind: null,
    })),
  };
}

function createReviewer(reviewerSlot) {
  return {
    schemaVersion: 'decantr-3.9-human-reviewer-workbook.v2',
    reviewerSlot,
    status: 'not-started',
    qualificationClaim: false,
    corpusSha256: null,
    reviewer: null,
    reviewedAt: null,
    caseRationales: [],
    decisions: blankJudgments(() => ({
      decision: null,
      severity: null,
      actionable: null,
      rationale: null,
    })),
  };
}

function createAdjudication() {
  return {
    schemaVersion: 'decantr-3.9-human-adjudication-workbook.v2',
    status: 'not-started',
    qualificationClaim: false,
    corpusSha256: null,
    reviewerWorksheetSha256: {
      'reviewer-1': null,
      'reviewer-2': null,
    },
    adjudicatorReviewerId: null,
    adjudicatedAt: null,
    signedAdjudicationEvidence: null,
    caseResolutions: [],
    decisions: blankJudgments(() => ({
      decision: null,
      severity: null,
      actionable: null,
      rationale: null,
    })),
  };
}

function createReplay(replayId) {
  return {
    schemaVersion: 'decantr-3.9-finding-replay-workbook.v2',
    replayId,
    status: 'not-run',
    qualificationClaim: false,
    expectedRelease: expectedReleases[replayId],
    corpusSha256: null,
    adjudicationSha256: null,
    observedRelease: null,
    generatedAt: null,
    command: null,
    exitCode: null,
    environment: null,
    caseResults: [],
    judgments: blankJudgments(() => ({ emitted: null })),
  };
}

function prepare() {
  const targets = Object.values(paths);
  const existing = targets.filter((path) => existsSync(path));
  if (existing.length > 0) {
    throw new Error(
      `refusing to overwrite existing review files: ${existing.map(repoPath).join(', ')}`,
    );
  }

  writeJsonExclusive(paths.manifest, createManifest());
  writeJsonExclusive(paths.corpus, createCorpus());
  writeJsonExclusive(paths.reviewer1, createReviewer(1));
  writeJsonExclusive(paths.reviewer2, createReviewer(2));
  writeJsonExclusive(paths.adjudication, createAdjudication());
  writeJsonExclusive(paths.publicReplay, createReplay('public383'));
  writeJsonExclusive(paths.candidateReplay, createReplay('candidate390'));
}

function validateStableId(value, context, errors) {
  if (!isNonEmptyString(value) || !STABLE_ID.test(value)) {
    errors.push(`${context} must be a lowercase stable ID`);
    return false;
  }
  return true;
}

function validateSourceEvidence(value, context, errors, verifyFiles) {
  if (!isRecord(value)) {
    errors.push(`${context} must be source-snapshot or executable-oracle evidence`);
    return;
  }
  if (value.kind === 'source-snapshot') {
    if (
      !exactKeys(
        value,
        ['kind', 'repository', 'commit', 'sourcePath', 'blobHash'],
        context,
        errors,
      )
    ) {
      return;
    }
    if (!/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\.git)?\/?$/u.test(value.repository)) {
      errors.push(`${context}.repository must be an HTTPS GitHub repository`);
    }
    if (!GIT_OBJECT_ID.test(value.commit ?? '')) errors.push(`${context}.commit is invalid`);
    if (!isRelativePath(value.sourcePath)) errors.push(`${context}.sourcePath is invalid`);
    if (!GIT_OBJECT_ID.test(value.blobHash ?? '')) errors.push(`${context}.blobHash is invalid`);
    return;
  }
  if (value.kind !== 'executable-oracle') {
    errors.push(`${context}.kind is unsupported`);
    return;
  }
  if (
    !exactKeys(
      value,
      [
        'kind',
        'workingDirectory',
        'command',
        'expectedExitCode',
        'oraclePath',
        'oracleSha256',
        'capturedOutputPath',
        'capturedOutputSha256',
      ],
      context,
      errors,
    )
  ) {
    return;
  }
  if (!isRelativePath(value.workingDirectory)) {
    errors.push(`${context}.workingDirectory is invalid`);
  }
  if (!Array.isArray(value.command) || value.command.length === 0 || !value.command.every(isNonEmptyString)) {
    errors.push(`${context}.command must be a non-empty argv array`);
  }
  if (!Number.isInteger(value.expectedExitCode)) {
    errors.push(`${context}.expectedExitCode must be an integer`);
  }
  for (const field of ['oraclePath', 'capturedOutputPath']) {
    if (!isRelativePath(value[field])) errors.push(`${context}.${field} is invalid`);
  }
  for (const field of ['oracleSha256', 'capturedOutputSha256']) {
    if (!SHA256.test(value[field] ?? '')) errors.push(`${context}.${field} is invalid`);
  }
  if (!verifyFiles) return;
  for (const [pathField, hashField] of [
    ['oraclePath', 'oracleSha256'],
    ['capturedOutputPath', 'capturedOutputSha256'],
  ]) {
    const absolutePath = resolve(repoRoot, value[pathField] ?? '');
    if (!isRelativePath(value[pathField]) || !existsSync(absolutePath) || !statSync(absolutePath).isFile()) {
      errors.push(`${context}.${pathField} does not resolve to a repository file`);
    } else if (sha256(readFileSync(absolutePath)) !== value[hashField]) {
      errors.push(`${context}.${hashField} does not match ${value[pathField]}`);
    }
  }
  const workingDirectory = resolve(repoRoot, value.workingDirectory ?? '');
  if (!existsSync(workingDirectory) || !statSync(workingDirectory).isDirectory()) {
    errors.push(`${context}.workingDirectory does not resolve to a directory`);
  }
}

function validateCorpus(corpus, errors, { requireFrozen = false } = {}) {
  const ready = { value: true };
  if (
    !exactKeys(
      corpus,
      [
        'schemaVersion',
        'status',
        'qualificationClaim',
        'frozenAt',
        'legacyFindingLabelsImported',
        'cases',
        'judgments',
      ],
      'corpus.json',
      errors,
    )
  ) {
    return false;
  }
  if (corpus.schemaVersion !== 'decantr-3.9-human-finding-corpus-workbook.v1') {
    errors.push('corpus.json schemaVersion changed');
  }
  if (!['draft', 'frozen'].includes(corpus.status)) errors.push('corpus.json status is invalid');
  if (corpus.qualificationClaim !== false) errors.push('corpus.json cannot claim qualification');
  if (corpus.legacyFindingLabelsImported !== false) {
    errors.push('corpus.json cannot import the legacy-unqualified finding rows');
  }
  if (corpus.status === 'draft' && corpus.frozenAt !== null) {
    errors.push('corpus.json draft must not have frozenAt');
  }
  if (corpus.status === 'frozen' && !isDateTime(corpus.frozenAt)) {
    errors.push('corpus.json frozenAt must be a real ISO date-time when frozen');
  }
  if (requireFrozen && corpus.status !== 'frozen') ready.value = false;

  const cases = array(corpus.cases);
  const caseIds = [];
  for (const [index, item] of cases.entries()) {
    const context = `corpus.json.cases[${index}]`;
    if (
      !exactKeys(
        item,
        ['id', 'clusterId', 'lane', 'targetId', 'input', 'candidateSetExhaustive', 'sourceEvidence'],
        context,
        errors,
      )
    ) {
      ready.value = false;
      continue;
    }
    validateStableId(item.id, `${context}.id`, errors);
    validateStableId(item.clusterId, `${context}.clusterId`, errors);
    validateStableId(item.targetId, `${context}.targetId`, errors);
    if (!LANES.includes(item.lane)) errors.push(`${context}.lane is invalid`);
    if (!isNonEmptyString(item.input)) errors.push(`${context}.input is required`);
    if (item.candidateSetExhaustive !== true) {
      errors.push(`${context}.candidateSetExhaustive must be true before freeze`);
    }
    validateSourceEvidence(item.sourceEvidence, `${context}.sourceEvidence`, errors, requireFrozen);
    caseIds.push(item.id);
  }
  if (unique(caseIds).length !== caseIds.length) errors.push('corpus.json case IDs must be unique');
  if (requireFrozen && cases.length === 0) ready.value = false;

  const expectedIds = expectedJudgmentIds();
  const judgments = array(corpus.judgments);
  if (judgments.length !== JUDGMENT_COUNT) {
    errors.push(`corpus.json must contain exactly ${JUDGMENT_COUNT} judgment slots`);
    ready.value = false;
  }
  const seenOutputKeys = new Set();
  const referencedCases = new Set();
  const laneCounts = Object.fromEntries(LANES.map((lane) => [lane, 0]));
  const caseMap = new Map(cases.map((item) => [item.id, item]));
  for (const [index, item] of judgments.entries()) {
    const context = `corpus.json.judgments[${index}]`;
    if (!exactKeys(item, ['judgmentId', 'caseId', 'source', 'code', 'codeKind'], context, errors)) {
      ready.value = false;
      continue;
    }
    if (item.judgmentId !== expectedIds[index]) {
      errors.push(`${context}.judgmentId must be ${expectedIds[index]}`);
    }
    const populated = ['caseId', 'source', 'code', 'codeKind'].every((field) => item[field] !== null);
    const empty = ['caseId', 'source', 'code', 'codeKind'].every((field) => item[field] === null);
    if (!populated && !empty) errors.push(`${context} is partially populated`);
    if (!populated) {
      if (requireFrozen) ready.value = false;
      continue;
    }
    validateStableId(item.caseId, `${context}.caseId`, errors);
    if (!caseMap.has(item.caseId)) errors.push(`${context}.caseId does not identify a corpus case`);
    if (!isNonEmptyString(item.source)) errors.push(`${context}.source is required`);
    if (!isNonEmptyString(item.code)) errors.push(`${context}.code is required`);
    if (!['finding-id', 'diagnostic-code'].includes(item.codeKind)) {
      errors.push(`${context}.codeKind is invalid`);
    }
    const outputKey = `${item.caseId}|${item.source}|${item.codeKind}|${item.code}`;
    if (seenOutputKeys.has(outputKey)) errors.push(`${context} duplicates a candidate output in its case`);
    seenOutputKeys.add(outputKey);
    referencedCases.add(item.caseId);
    const lane = caseMap.get(item.caseId)?.lane;
    if (lane in laneCounts) laneCounts[lane] += 1;
  }
  if (corpus.status === 'frozen') {
    for (const caseId of caseIds) {
      if (!referencedCases.has(caseId)) errors.push(`corpus case ${caseId} has no candidate judgments`);
    }
    for (const lane of LANES) {
      if (laneCounts[lane] === 0) errors.push(`frozen corpus has no ${lane} judgments`);
    }
  }
  return ready.value && errors.length === 0;
}

function validateDecision(value, context, errors, requireComplete) {
  if (!exactKeys(value, ['judgmentId', 'decision', 'severity', 'actionable', 'rationale'], context, errors)) {
    return false;
  }
  const complete =
    ['emit', 'suppress'].includes(value.decision) &&
    ['warning', 'error', null].includes(value.severity) &&
    typeof value.actionable === 'boolean' &&
    isNonEmptyString(value.rationale);
  const blank =
    value.decision === null &&
    value.severity === null &&
    value.actionable === null &&
    value.rationale === null;
  if (!complete && !blank) errors.push(`${context} is partially populated or invalid`);
  if (requireComplete && !complete) return false;
  return complete;
}

function validateSignedEvidenceShape(evidence, context, errors) {
  if (!isRecord(evidence)) {
    errors.push(`${context} is required`);
    return false;
  }
  if (evidence.kind === 'git-commit') {
    exactKeys(
      evidence,
      ['kind', 'commit', 'path', 'sha256', 'signer', 'keyFingerprint'],
      context,
      errors,
    );
    if (!GIT_OBJECT_ID.test(evidence.commit ?? '')) errors.push(`${context}.commit is invalid`);
    if (!isRelativePath(evidence.path)) errors.push(`${context}.path is invalid`);
    if (!SHA256.test(evidence.sha256 ?? '')) errors.push(`${context}.sha256 is invalid`);
    if (!isNonEmptyString(evidence.signer)) errors.push(`${context}.signer is required`);
    if (!isNonEmptyString(evidence.keyFingerprint) || evidence.keyFingerprint.length < 8) {
      errors.push(`${context}.keyFingerprint is invalid`);
    }
    return true;
  }
  if (evidence.kind === 'detached-signature') {
    exactKeys(
      evidence,
      [
        'kind',
        'path',
        'sha256',
        'signaturePath',
        'signatureSha256',
        'allowedSignersPath',
        'allowedSignersSha256',
        'namespace',
        'principal',
      ],
      context,
      errors,
    );
    for (const field of ['path', 'signaturePath', 'allowedSignersPath']) {
      if (!isRelativePath(evidence[field])) errors.push(`${context}.${field} is invalid`);
    }
    for (const field of ['sha256', 'signatureSha256', 'allowedSignersSha256']) {
      if (!SHA256.test(evidence[field] ?? '')) errors.push(`${context}.${field} is invalid`);
    }
    if (evidence.namespace !== SIGNATURE_NAMESPACE) {
      errors.push(`${context}.namespace must be ${SIGNATURE_NAMESPACE}`);
    }
    if (!isNonEmptyString(evidence.principal)) errors.push(`${context}.principal is required`);
    return true;
  }
  errors.push(`${context}.kind is unsupported`);
  return false;
}

function validateReviewerRecord(reviewer, context, errors, { requireEvidence = true } = {}) {
  if (
    !exactKeys(
      reviewer,
      [
        'reviewerId',
        'kind',
        'name',
        'stableIdentity',
        'attestation',
        'attestedAt',
        'signedReviewEvidence',
      ],
      context,
      errors,
    )
  ) {
    return false;
  }
  let valid = true;
  valid = validateStableId(reviewer.reviewerId, `${context}.reviewerId`, errors) && valid;
  if (reviewer.kind !== 'human') {
    errors.push(`${context}.kind must be human`);
    valid = false;
  }
  if (!isNonEmptyString(reviewer.name) || reviewer.name.length < 3) {
    errors.push(`${context}.name is invalid`);
    valid = false;
  }
  if (!isNonEmptyString(reviewer.stableIdentity) || reviewer.stableIdentity.length < 3) {
    errors.push(`${context}.stableIdentity is invalid`);
    valid = false;
  }
  if (reviewer.attestation !== HUMAN_REVIEW_ATTESTATION) {
    errors.push(`${context}.attestation must exactly match the packet schema`);
    valid = false;
  }
  if (!isDateTime(reviewer.attestedAt)) {
    errors.push(`${context}.attestedAt is invalid`);
    valid = false;
  }
  if (reviewer.signedReviewEvidence === null && !requireEvidence) return valid;
  return (
    validateSignedEvidenceShape(
      reviewer.signedReviewEvidence,
      `${context}.signedReviewEvidence`,
      errors,
    ) && valid
  );
}

function reviewerIdentityRecord(reviewer) {
  return {
    reviewerId: reviewer?.reviewerId,
    kind: reviewer?.kind,
    name: reviewer?.name,
    stableIdentity: reviewer?.stableIdentity,
    attestation: reviewer?.attestation,
    attestedAt: reviewer?.attestedAt,
  };
}

export function reviewerSignaturePayload(workbook) {
  return {
    schemaVersion: 'decantr-human-review-signature-payload.v1',
    reviewer: reviewerIdentityRecord(workbook.reviewer),
    worksheet: {
      schemaVersion: workbook.schemaVersion,
      reviewerSlot: workbook.reviewerSlot,
      status: workbook.status,
      qualificationClaim: workbook.qualificationClaim,
      corpusSha256: workbook.corpusSha256,
      reviewedAt: workbook.reviewedAt,
      caseRationales: workbook.caseRationales,
      decisions: workbook.decisions,
    },
  };
}

export function adjudicationSignaturePayload(adjudication, adjudicator) {
  return {
    schemaVersion: 'decantr-human-adjudication-signature-payload.v1',
    adjudicator: reviewerIdentityRecord(adjudicator),
    adjudication: {
      schemaVersion: adjudication.schemaVersion,
      status: adjudication.status,
      qualificationClaim: adjudication.qualificationClaim,
      corpusSha256: adjudication.corpusSha256,
      reviewerWorksheetSha256: adjudication.reviewerWorksheetSha256,
      adjudicatorReviewerId: adjudication.adjudicatorReviewerId,
      adjudicatedAt: adjudication.adjudicatedAt,
      caseResolutions: adjudication.caseResolutions,
      decisions: adjudication.decisions,
    },
  };
}

function readRepoEvidence(path, context, errors) {
  if (!isRelativePath(path)) {
    errors.push(`${context} path is invalid`);
    return null;
  }
  const evidenceRoot = path.startsWith(QUALIFICATION_REPO_PREFIX) ? qualificationDirectory : repoRoot;
  const absolutePath = dependencyAbsolutePath(path);
  const relation = relative(evidenceRoot, absolutePath);
  if (relation.startsWith('..') || isAbsolute(relation) || !existsSync(absolutePath)) {
    errors.push(`${context} file does not exist: ${path}`);
    return null;
  }
  if (!statSync(absolutePath).isFile()) {
    errors.push(`${context} is not a file: ${path}`);
    return null;
  }
  return readFileSync(absolutePath);
}

function validateSignedPayloadContents(contents, expectedPayload, context, errors) {
  let payload;
  try {
    payload = JSON.parse(contents.toString('utf8'));
  } catch (cause) {
    errors.push(`${context} is not valid JSON: ${cause.message}`);
    return false;
  }
  const valid = isDeepStrictEqual(payload, expectedPayload);
  if (!valid) {
    errors.push(`${context} does not exactly match the identity and complete worksheet payload`);
  }
  return valid;
}

function verifySignedPayload(evidence, expectedPayload, signerIdentity, context, errors) {
  if (evidence.kind === 'git-commit') {
    const signature = spawnSync(
      'git',
      ['-C', repoRoot, 'show', '--no-patch', '--format=%G?%x00%GS%x00%GF', evidence.commit],
      { encoding: 'utf8' },
    );
    if (signature.status !== 0) {
      errors.push(`${context} signed commit is not present`);
      return null;
    }
    const [status, signer, fingerprint] = signature.stdout.trim().split('\0');
    if (
      !['G', 'U'].includes(status) ||
      signer !== evidence.signer ||
      fingerprint?.toLowerCase() !== evidence.keyFingerprint.toLowerCase()
    ) {
      errors.push(`${context} commit signature, signer, or fingerprint is not verified`);
    }
    const blob = spawnSync(
      'git',
      ['-C', repoRoot, 'show', `${evidence.commit}:${evidence.path}`],
      { encoding: null, maxBuffer: 4 * 1024 * 1024 },
    );
    if (blob.status !== 0 || !Buffer.isBuffer(blob.stdout)) {
      errors.push(`${context} attestation is not present in the signed commit`);
      return null;
    }
    if (sha256(blob.stdout) !== evidence.sha256) errors.push(`${context} payload hash differs`);
    validateSignedPayloadContents(blob.stdout, expectedPayload, `${context} payload`, errors);
    return `git:${fingerprint?.toLowerCase() ?? ''}`;
  }

  const payload = readRepoEvidence(evidence.path, `${context} payload`, errors);
  const signature = readRepoEvidence(evidence.signaturePath, `${context} signature`, errors);
  const allowedSigners = readRepoEvidence(
    evidence.allowedSignersPath,
    `${context} allowed signers`,
    errors,
  );
  if (!payload || !signature || !allowedSigners) return null;
  if (sha256(payload) !== evidence.sha256) errors.push(`${context} payload hash differs`);
  if (sha256(signature) !== evidence.signatureSha256) errors.push(`${context} signature hash differs`);
  if (sha256(allowedSigners) !== evidence.allowedSignersSha256) {
    errors.push(`${context} allowed-signers hash differs`);
  }
  if (evidence.principal !== signerIdentity.stableIdentity) {
    errors.push(`${context} principal does not match stableIdentity`);
  }
  validateSignedPayloadContents(payload, expectedPayload, `${context} payload`, errors);
  const verification = spawnSync(
    'ssh-keygen',
    [
      '-Y',
      'verify',
      '-f',
      dependencyAbsolutePath(evidence.allowedSignersPath),
      '-I',
      evidence.principal,
      '-n',
      SIGNATURE_NAMESPACE,
      '-s',
      dependencyAbsolutePath(evidence.signaturePath),
    ],
    { input: payload, encoding: 'utf8' },
  );
  if (verification.status !== 0) errors.push(`${context} detached SSH signature did not verify`);
  return `ssh:${evidence.principal}:${evidence.allowedSignersSha256}`;
}

function verifyReviewerSignature(workbook, context, errors) {
  return verifySignedPayload(
    workbook.reviewer.signedReviewEvidence,
    reviewerSignaturePayload(workbook),
    workbook.reviewer,
    context,
    errors,
  );
}

function validateReviewerWorkbook(
  workbook,
  slot,
  corpus,
  corpusHash,
  errors,
  { requireComplete = false, verifySignature = false, allowUnsignedComplete = false } = {},
) {
  const context = `reviewer-${slot}.json`;
  if (
    !exactKeys(
      workbook,
      [
        'schemaVersion',
        'reviewerSlot',
        'status',
        'qualificationClaim',
        'corpusSha256',
        'reviewer',
        'reviewedAt',
        'caseRationales',
        'decisions',
      ],
      context,
      errors,
    )
  ) {
    return { complete: false, signingIdentity: null };
  }
  if (workbook.schemaVersion !== 'decantr-3.9-human-reviewer-workbook.v2') {
    errors.push(`${context} schemaVersion changed`);
  }
  if (workbook.reviewerSlot !== slot) errors.push(`${context} reviewerSlot changed`);
  if (!['not-started', 'in-progress', 'complete'].includes(workbook.status)) {
    errors.push(`${context} status is invalid`);
  }
  if (workbook.qualificationClaim !== false) errors.push(`${context} cannot claim qualification`);
  if (workbook.corpusSha256 !== null && !SHA256.test(workbook.corpusSha256)) {
    errors.push(`${context} corpusSha256 is invalid`);
  }
  if (workbook.corpusSha256 !== null && workbook.corpusSha256 !== corpusHash) {
    errors.push(`${context} is not bound to the current corpus bytes`);
  }

  let reviewerValid = false;
  let signingIdentity = null;
  if (workbook.reviewer !== null) {
    reviewerValid = validateReviewerRecord(workbook.reviewer, `${context}.reviewer`, errors, {
      requireEvidence:
        verifySignature || (workbook.status === 'complete' && !allowUnsignedComplete),
    });
    if (reviewerValid && verifySignature) {
      signingIdentity = verifyReviewerSignature(workbook, `${context}.reviewer`, errors);
    }
  }
  if (workbook.reviewedAt !== null && !isDateTime(workbook.reviewedAt)) {
    errors.push(`${context}.reviewedAt is invalid`);
  }

  const expectedIds = expectedJudgmentIds();
  const decisions = array(workbook.decisions);
  if (decisions.length !== JUDGMENT_COUNT) {
    errors.push(`${context} must contain exactly ${JUDGMENT_COUNT} decisions`);
  }
  let completeDecisions = decisions.length === JUDGMENT_COUNT;
  for (const [index, decision] of decisions.entries()) {
    const complete = validateDecision(
      decision,
      `${context}.decisions[${index}]`,
      errors,
      requireComplete || workbook.status === 'complete',
    );
    if (decision?.judgmentId !== expectedIds[index]) {
      errors.push(`${context}.decisions[${index}].judgmentId must be ${expectedIds[index]}`);
    }
    completeDecisions = completeDecisions && complete;
  }

  const caseIds = array(corpus.cases).map((item) => item.id);
  const caseRationales = array(workbook.caseRationales);
  const rationaleIds = [];
  let completeRationales = caseRationales.length === caseIds.length;
  for (const [index, item] of caseRationales.entries()) {
    const rationaleContext = `${context}.caseRationales[${index}]`;
    if (!exactKeys(item, ['caseId', 'rationale'], rationaleContext, errors)) {
      completeRationales = false;
      continue;
    }
    rationaleIds.push(item.caseId);
    if (item.rationale !== null && !isNonEmptyString(item.rationale)) {
      errors.push(`${rationaleContext}.rationale is invalid`);
    }
    if (!isNonEmptyString(item.rationale)) completeRationales = false;
  }
  if (!isDeepStrictEqual(rationaleIds, caseIds)) {
    if (caseRationales.length > 0 || corpus.status === 'frozen') {
      errors.push(`${context}.caseRationales must match frozen corpus case order`);
    }
    completeRationales = false;
  }

  const complete =
    workbook.status === 'complete' &&
    workbook.corpusSha256 === corpusHash &&
    reviewerValid &&
    isDateTime(workbook.reviewedAt) &&
    completeDecisions &&
    completeRationales &&
    (!verifySignature || Boolean(signingIdentity));
  if (requireComplete && !complete) return { complete: false, signingIdentity };
  return { complete, signingIdentity };
}

function semanticDecision(decision) {
  return {
    decision: decision?.decision,
    severity: decision?.severity,
    actionable: decision?.actionable,
  };
}

function disagreementIdsForCase(caseId, corpus, reviewer1, reviewer2) {
  const judgments = corpus.judgments.filter((item) => item.caseId === caseId);
  const decisions1 = new Map(reviewer1.decisions.map((item) => [item.judgmentId, item]));
  const decisions2 = new Map(reviewer2.decisions.map((item) => [item.judgmentId, item]));
  return judgments
    .filter(
      (item) =>
        !isDeepStrictEqual(
          semanticDecision(decisions1.get(item.judgmentId)),
          semanticDecision(decisions2.get(item.judgmentId)),
        ),
    )
    .map((item) => item.judgmentId);
}

function validateAdjudication(
  adjudication,
  corpus,
  corpusHash,
  reviewers,
  reviewerHashes,
  errors,
  { requireComplete = false, verifySignature = false } = {},
) {
  if (
    !exactKeys(
      adjudication,
      [
        'schemaVersion',
        'status',
        'qualificationClaim',
        'corpusSha256',
        'reviewerWorksheetSha256',
        'adjudicatorReviewerId',
        'adjudicatedAt',
        'signedAdjudicationEvidence',
        'caseResolutions',
        'decisions',
      ],
      'adjudication.json',
      errors,
    )
  ) {
    return false;
  }
  if (adjudication.schemaVersion !== 'decantr-3.9-human-adjudication-workbook.v2') {
    errors.push('adjudication.json schemaVersion changed');
  }
  if (!['not-started', 'in-progress', 'complete'].includes(adjudication.status)) {
    errors.push('adjudication.json status is invalid');
  }
  if (adjudication.qualificationClaim !== false) {
    errors.push('adjudication.json cannot claim qualification');
  }
  if (adjudication.corpusSha256 !== null && adjudication.corpusSha256 !== corpusHash) {
    errors.push('adjudication.json is not bound to the current corpus bytes');
  }
  if (
    !exactKeys(
      adjudication.reviewerWorksheetSha256,
      ['reviewer-1', 'reviewer-2'],
      'adjudication.json.reviewerWorksheetSha256',
      errors,
    )
  ) {
    return false;
  }
  for (const [key, expected] of Object.entries(reviewerHashes)) {
    const actual = adjudication.reviewerWorksheetSha256[key];
    if (actual !== null && actual !== expected) {
      errors.push(`adjudication.json reviewer hash ${key} does not match current bytes`);
    }
  }
  if (adjudication.adjudicatorReviewerId !== null && !STABLE_ID.test(adjudication.adjudicatorReviewerId)) {
    errors.push('adjudication.json adjudicatorReviewerId is invalid');
  }
  if (adjudication.adjudicatedAt !== null && !isDateTime(adjudication.adjudicatedAt)) {
    errors.push('adjudication.json adjudicatedAt is invalid');
  }
  if (adjudication.signedAdjudicationEvidence !== null) {
    validateSignedEvidenceShape(
      adjudication.signedAdjudicationEvidence,
      'adjudication.json.signedAdjudicationEvidence',
      errors,
    );
  }

  const expectedIds = expectedJudgmentIds();
  const decisions = array(adjudication.decisions);
  let completeDecisions = decisions.length === JUDGMENT_COUNT;
  if (decisions.length !== JUDGMENT_COUNT) {
    errors.push(`adjudication.json must contain exactly ${JUDGMENT_COUNT} decisions`);
  }
  for (const [index, decision] of decisions.entries()) {
    const complete = validateDecision(
      decision,
      `adjudication.json.decisions[${index}]`,
      errors,
      requireComplete || adjudication.status === 'complete',
    );
    if (decision?.judgmentId !== expectedIds[index]) {
      errors.push(`adjudication.json.decisions[${index}].judgmentId must be ${expectedIds[index]}`);
    }
    completeDecisions = completeDecisions && complete;
  }

  const caseIds = corpus.cases.map((item) => item.id);
  const resolutionIds = [];
  let completeResolutions = adjudication.caseResolutions.length === caseIds.length;
  for (const [index, item] of array(adjudication.caseResolutions).entries()) {
    const context = `adjudication.json.caseResolutions[${index}]`;
    if (!exactKeys(item, ['caseId', 'disagreementJudgmentIds', 'resolution'], context, errors)) {
      completeResolutions = false;
      continue;
    }
    resolutionIds.push(item.caseId);
    const expectedDisagreements = disagreementIdsForCase(
      item.caseId,
      corpus,
      reviewers[0],
      reviewers[1],
    );
    if (!isDeepStrictEqual(item.disagreementJudgmentIds, expectedDisagreements)) {
      errors.push(`${context}.disagreementJudgmentIds do not match the independent reviews`);
    }
    if (item.resolution !== null && !isNonEmptyString(item.resolution)) {
      errors.push(`${context}.resolution is invalid`);
    }
    if (!isNonEmptyString(item.resolution)) completeResolutions = false;
  }
  if (!isDeepStrictEqual(resolutionIds, caseIds)) {
    if (adjudication.caseResolutions.length > 0 || corpus.status === 'frozen') {
      errors.push('adjudication.json caseResolutions must match frozen corpus case order');
    }
    completeResolutions = false;
  }

  const reviewerIds = reviewers.map((item) => item.reviewer?.reviewerId).filter(Boolean);
  const reviewerTimes = reviewers.map((item) => Date.parse(item.reviewedAt)).filter(Number.isFinite);
  const adjudicatorWorkbook = reviewers.find(
    (item) => item.reviewer?.reviewerId === adjudication.adjudicatorReviewerId,
  );
  let adjudicationSigningIdentity = null;
  let reviewerSigningIdentity = null;
  if (verifySignature && adjudicatorWorkbook && adjudication.signedAdjudicationEvidence) {
    adjudicationSigningIdentity = verifySignedPayload(
      adjudication.signedAdjudicationEvidence,
      adjudicationSignaturePayload(adjudication, adjudicatorWorkbook.reviewer),
      adjudicatorWorkbook.reviewer,
      'adjudication.json.signedAdjudicationEvidence',
      errors,
    );
    reviewerSigningIdentity = verifyReviewerSignature(
      adjudicatorWorkbook,
      'adjudication.json.adjudicatorReviewer',
      errors,
    );
    if (
      adjudicationSigningIdentity &&
      reviewerSigningIdentity &&
      adjudicationSigningIdentity !== reviewerSigningIdentity
    ) {
      errors.push('adjudication signature must use the adjudicator reviewer signing identity');
    }
  }
  const complete =
    adjudication.status === 'complete' &&
    adjudication.corpusSha256 === corpusHash &&
    adjudication.reviewerWorksheetSha256['reviewer-1'] === reviewerHashes['reviewer-1'] &&
    adjudication.reviewerWorksheetSha256['reviewer-2'] === reviewerHashes['reviewer-2'] &&
    reviewerIds.includes(adjudication.adjudicatorReviewerId) &&
    isDateTime(adjudication.adjudicatedAt) &&
    completeDecisions &&
    completeResolutions &&
    (!verifySignature ||
      (Boolean(adjudicationSigningIdentity) &&
        adjudicationSigningIdentity === reviewerSigningIdentity));
  if (
    complete &&
    reviewerTimes.length === REVIEWER_COUNT &&
    Date.parse(adjudication.adjudicatedAt) < Math.max(...reviewerTimes)
  ) {
    errors.push('adjudication.json must be timestamped after both independent reviews');
    return false;
  }
  return requireComplete ? complete && errors.length === 0 : complete;
}

function validateEnvironment(value, context, expectedPackageVersions, errors) {
  if (
    !exactKeys(
      value,
      [
        'os',
        'cpu',
        'nodeVersion',
        'packageManagerVersion',
        'exactSourceRef',
        'exactPackageVersions',
        'exactPackageTarballs',
      ],
      context,
      errors,
    )
  ) {
    return false;
  }
  for (const field of ['os', 'cpu', 'nodeVersion', 'packageManagerVersion', 'exactSourceRef']) {
    if (!isNonEmptyString(value[field])) errors.push(`${context}.${field} is required`);
  }
  if (!isRecord(value.exactPackageVersions) || Object.keys(value.exactPackageVersions).length === 0) {
    errors.push(`${context}.exactPackageVersions is required`);
    return false;
  }
  if (!Object.values(value.exactPackageVersions).every(isNonEmptyString)) {
    errors.push(`${context}.exactPackageVersions values are invalid`);
  }
  if (!isDeepStrictEqual(value.exactPackageVersions, expectedPackageVersions)) {
    errors.push(`${context}.exactPackageVersions must be the exact replay package wave`);
  }
  if (
    !isRecord(value.exactPackageTarballs) ||
    !isDeepStrictEqual(
      Object.keys(value.exactPackageTarballs).sort(),
      Object.keys(expectedPackageVersions).sort(),
    )
  ) {
    errors.push(`${context}.exactPackageTarballs must contain the exact replay package wave`);
    return false;
  }
  for (const [name, tarball] of Object.entries(value.exactPackageTarballs)) {
    if (
      !isRecord(tarball) ||
      !exactKeys(tarball, ['file', 'sha256'], `${context}.exactPackageTarballs.${name}`, errors) ||
      !isNonEmptyString(tarball.file) ||
      tarball.file.includes('/') ||
      tarball.file.includes('\\') ||
      !tarball.file.endsWith('.tgz') ||
      !SHA256.test(tarball.sha256 ?? '')
    ) {
      errors.push(`${context}.exactPackageTarballs.${name} is invalid`);
    }
  }
  const packageSetSha256 = hashJson(value.exactPackageTarballs);
  if (!value.exactSourceRef.includes(`package-set-sha256:${packageSetSha256}`)) {
    errors.push(`${context}.exactSourceRef is not bound to exactPackageTarballs`);
  }
  return true;
}

function validateOutputIdentity(value, context, errors, identityContract) {
  const keys = identityContract.schemaSupportsCodeKind ? ['source', 'code', 'codeKind'] : ['source', 'code'];
  if (!exactKeys(value, keys, context, errors)) return false;
  if (!isNonEmptyString(value.source) || !isNonEmptyString(value.code)) {
    errors.push(`${context} source and code are required`);
  }
  if (
    identityContract.schemaSupportsCodeKind &&
    !['finding-id', 'diagnostic-code'].includes(value.codeKind)
  ) {
    errors.push(`${context}.codeKind is invalid`);
  }
  return true;
}

function validateReplay(
  replay,
  replayId,
  corpus,
  corpusHash,
  adjudicationHash,
  identityContract,
  errors,
  { requireComplete = false } = {},
) {
  const context = replayId === 'public383' ? 'public-3.8.3.json' : 'candidate-3.9.4.json';
  if (
    !exactKeys(
      replay,
      [
        'schemaVersion',
        'replayId',
        'status',
        'qualificationClaim',
        'expectedRelease',
        'corpusSha256',
        'adjudicationSha256',
        'observedRelease',
        'generatedAt',
        'command',
        'exitCode',
        'environment',
        'caseResults',
        'judgments',
      ],
      context,
      errors,
    )
  ) {
    return false;
  }
  if (replay.schemaVersion !== 'decantr-3.9-finding-replay-workbook.v2') {
    errors.push(`${context} schemaVersion changed`);
  }
  if (replay.replayId !== replayId) errors.push(`${context} replayId changed`);
  if (!['not-run', 'running', 'complete'].includes(replay.status)) errors.push(`${context} status is invalid`);
  if (replay.qualificationClaim !== false) errors.push(`${context} cannot claim qualification`);
  if (!isDeepStrictEqual(replay.expectedRelease, expectedReleases[replayId])) {
    errors.push(`${context} expectedRelease changed`);
  }
  if (replay.corpusSha256 !== null && replay.corpusSha256 !== corpusHash) {
    errors.push(`${context} is not bound to current corpus bytes`);
  }
  if (replay.adjudicationSha256 !== null && replay.adjudicationSha256 !== adjudicationHash) {
    errors.push(`${context} is not bound to current adjudication bytes`);
  }
  if (replay.observedRelease !== null && !isDeepStrictEqual(replay.observedRelease, expectedReleases[replayId])) {
    errors.push(`${context} observedRelease is not the exact required package wave`);
  }
  if (replay.generatedAt !== null && !isDateTime(replay.generatedAt)) {
    errors.push(`${context} generatedAt is invalid`);
  }
  if (
    replay.command !== null &&
    (!Array.isArray(replay.command) || replay.command.length === 0 || !replay.command.every(isNonEmptyString))
  ) {
    errors.push(`${context} command must be a non-empty argv array`);
  }
  if (replay.exitCode !== null && !Number.isInteger(replay.exitCode)) {
    errors.push(`${context} exitCode must be an integer`);
  }
  if (replay.environment !== null) {
    validateEnvironment(
      replay.environment,
      `${context}.environment`,
      expectedReleases[replayId].packageVersions,
      errors,
    );
  }

  const expectedIds = expectedJudgmentIds();
  let completeJudgments = replay.judgments.length === JUDGMENT_COUNT;
  if (replay.judgments.length !== JUDGMENT_COUNT) {
    errors.push(`${context} must contain exactly ${JUDGMENT_COUNT} judgment results`);
  }
  for (const [index, item] of array(replay.judgments).entries()) {
    const itemContext = `${context}.judgments[${index}]`;
    if (!exactKeys(item, ['judgmentId', 'emitted'], itemContext, errors)) {
      completeJudgments = false;
      continue;
    }
    if (item.judgmentId !== expectedIds[index]) {
      errors.push(`${itemContext}.judgmentId must be ${expectedIds[index]}`);
    }
    if (item.emitted !== null && typeof item.emitted !== 'boolean') {
      errors.push(`${itemContext}.emitted must be boolean or null`);
    }
    if (typeof item.emitted !== 'boolean') completeJudgments = false;
  }

  const caseIds = corpus.cases.map((item) => item.id);
  const clusterByCase = new Map(corpus.cases.map((item) => [item.id, item.clusterId]));
  const replayCaseIds = [];
  let completeCases = replay.caseResults.length === caseIds.length;
  for (const [index, item] of array(replay.caseResults).entries()) {
    const caseContext = `${context}.caseResults[${index}]`;
    if (!exactKeys(item, ['caseId', 'clusterId', 'exhaustive', 'unexpectedOutputs'], caseContext, errors)) {
      completeCases = false;
      continue;
    }
    replayCaseIds.push(item.caseId);
    if (item.clusterId !== clusterByCase.get(item.caseId)) {
      errors.push(`${caseContext}.clusterId does not match the frozen corpus`);
    }
    if (item.exhaustive !== null && item.exhaustive !== true) {
      errors.push(`${caseContext}.exhaustive must be true or null`);
    }
    if (item.unexpectedOutputs !== null && !Array.isArray(item.unexpectedOutputs)) {
      errors.push(`${caseContext}.unexpectedOutputs must be an array or null`);
    }
    for (const [outputIndex, output] of array(item.unexpectedOutputs).entries()) {
      validateOutputIdentity(
        output,
        `${caseContext}.unexpectedOutputs[${outputIndex}]`,
        errors,
        identityContract,
      );
    }
    if (
      item.exhaustive !== true ||
      !Array.isArray(item.unexpectedOutputs) ||
      item.unexpectedOutputs.length !== 0
    ) {
      completeCases = false;
    }
  }
  if (!isDeepStrictEqual(replayCaseIds, caseIds)) {
    if (replay.caseResults.length > 0) errors.push(`${context}.caseResults must match frozen corpus case order`);
    completeCases = false;
  }

  const complete =
    replay.status === 'complete' &&
    replay.corpusSha256 === corpusHash &&
    replay.adjudicationSha256 === adjudicationHash &&
    isDeepStrictEqual(replay.observedRelease, expectedReleases[replayId]) &&
    isDateTime(replay.generatedAt) &&
    Array.isArray(replay.command) &&
    replay.command.length > 0 &&
    replay.exitCode === 0 &&
    isRecord(replay.environment) &&
    completeCases &&
    completeJudgments;
  return requireComplete ? complete && errors.length === 0 : complete;
}

function detectReplayIdentityContract(schema, auditSource) {
  const outputIdentity = schema?.$defs?.outputIdentity;
  const schemaSupportsCodeKind = Boolean(outputIdentity?.properties?.codeKind);
  const schemaRequiresCodeKind = array(outputIdentity?.required).includes('codeKind');
  const outputKeyFunction = auditSource.match(/function outputKey\(output\)\s*\{([\s\S]*?)\n\}/u)?.[1] ?? '';
  const auditUsesCodeKind = outputKeyFunction.includes('codeKind');
  const compatible = auditUsesCodeKind
    ? schemaSupportsCodeKind && schemaRequiresCodeKind
    : !schemaRequiresCodeKind;
  return { compatible, schemaSupportsCodeKind, schemaRequiresCodeKind, auditUsesCodeKind };
}

function validateContractBindings(manifest, errors) {
  const expectedBindings = new Map(createContractBindings().map((item) => [item.id, item]));
  for (const binding of array(manifest.contractBindings)) {
    const expected = expectedBindings.get(binding.id);
    if (!expected || !isDeepStrictEqual(binding, expected)) {
      errors.push(`kit-manifest.json contract binding ${binding.id ?? '<missing>'} is stale`);
    }
  }
  if (manifest.contractBindings.length !== expectedBindings.size) {
    errors.push('kit-manifest.json contractBindings are incomplete');
  }
}

function validateManifest(manifest, errors) {
  if (
    !exactKeys(
      manifest,
      [
        'schemaVersion',
        'kitStatus',
        'qualificationClaim',
        'requirements',
        'quarantine',
        'contractBindings',
        'worksheets',
        'signingPayloads',
        'generatedOutputs',
      ],
      'kit-manifest.json',
      errors,
    )
  ) {
    return;
  }
  if (manifest.schemaVersion !== 'decantr-3.9-human-review-kit.v2') {
    errors.push('kit-manifest.json schemaVersion changed');
  }
  if (manifest.kitStatus !== 'awaiting-human-evidence') {
    errors.push('kit-manifest.json must remain awaiting-human-evidence');
  }
  if (manifest.qualificationClaim !== false) errors.push('kit-manifest.json cannot claim qualification');
  if (
    !isDeepStrictEqual(manifest.requirements, {
      reviewerCount: REVIEWER_COUNT,
      judgmentCount: JUDGMENT_COUNT,
      requiredLanes: LANES,
      replayOrder: ['public383', 'candidate390'],
      baselineRelease: '3.8.3',
      candidateRelease: '3.9.4',
    })
  ) {
    errors.push('kit-manifest.json requirements changed');
  }
  if (
    manifest.quarantine?.path !== dependencyPaths.legacyFindings ||
    manifest.quarantine?.requiredStatus !== 'legacy-unqualified' ||
    manifest.quarantine?.countsTowardQualification !== false ||
    manifest.quarantine?.importIntoActiveCorpus !== false
  ) {
    errors.push('kit-manifest.json legacy finding quarantine changed');
  }
  if (!isDeepStrictEqual(manifest.worksheets, worksheetPaths)) {
    errors.push('kit-manifest.json worksheet paths changed');
  }
  if (!isDeepStrictEqual(manifest.signingPayloads, createManifest().signingPayloads)) {
    errors.push('kit-manifest.json signing payload paths changed');
  }
  if (!isDeepStrictEqual(manifest.generatedOutputs, createManifest().generatedOutputs)) {
    errors.push('kit-manifest.json generated output paths changed');
  }
  validateContractBindings(manifest, errors);
}

function readKit() {
  return {
    manifest: readJsonAbsolute(paths.manifest),
    corpus: readJsonAbsolute(paths.corpus),
    reviewers: [readJsonAbsolute(paths.reviewer1), readJsonAbsolute(paths.reviewer2)],
    adjudication: readJsonAbsolute(paths.adjudication),
    replays: {
      public383: readJsonAbsolute(paths.publicReplay),
      candidate390: readJsonAbsolute(paths.candidateReplay),
    },
  };
}

function rawHash(path) {
  return sha256(readFileSync(path));
}

function validateParentState(errors) {
  const packet = readJsonAbsolute(dependencyAbsolutePath(dependencyPaths.packet));
  const missing = readJsonAbsolute(dependencyAbsolutePath(dependencyPaths.missingEvidence));
  const legacy = readJsonAbsolute(dependencyAbsolutePath(dependencyPaths.legacyFindings));
  if (packet.packetStatus !== 'incomplete' || packet.qualificationClaim !== false) {
    errors.push('active qualification packet must remain incomplete with qualificationClaim false');
  }
  if (
    legacy.qualificationStatus !== 'legacy-unqualified' ||
    legacy.countsTowardQualification !== false ||
    array(legacy.labels).length !== JUDGMENT_COUNT
  ) {
    errors.push('legacy finding labels are no longer quarantined exactly as expected');
  }
  const expectedMissing = [
    'HUMAN_REVIEW_IDENTITIES',
    'HUMAN_ADJUDICATED_FINDING_CORPUS',
    'PUBLIC_383_FINDING_REPLAY',
    'CANDIDATE_390_FINDING_REPLAY',
  ];
  if (!isDeepStrictEqual(array(missing.items).map((item) => item.id), expectedMissing)) {
    errors.push('missing-evidence.json no longer lists the four human/finding blockers in order');
  }
}

function validateKit({ requireComplete = false } = {}) {
  const errors = [];
  const blockers = [];
  const kit = readKit();
  validateManifest(kit.manifest, errors);
  validateParentState(errors);

  const schema = readJsonAbsolute(dependencyAbsolutePath(dependencyPaths.schema));
  const auditSource = readFileSync(dependencyAbsolutePath(dependencyPaths.audit), 'utf8');
  const identityContract = detectReplayIdentityContract(schema, auditSource);
  if (!identityContract.compatible) {
    blockers.push(
      'UPSTREAM_FINDING_REPLAY_IDENTITY_CONTRACT: packet schema and audit disagree about codeKind',
    );
  }

  const corpusReady = validateCorpus(kit.corpus, errors, { requireFrozen: true });
  if (!corpusReady) blockers.push('FROZEN_200_JUDGMENT_CORPUS');
  const corpusHash = rawHash(paths.corpus);
  const reviewerHashes = {
    'reviewer-1': rawHash(paths.reviewer1),
    'reviewer-2': rawHash(paths.reviewer2),
  };
  const reviewerResults = kit.reviewers.map((reviewer, index) =>
    validateReviewerWorkbook(reviewer, index + 1, kit.corpus, corpusHash, errors, {
      requireComplete: true,
      verifySignature: reviewer.status === 'complete',
    }),
  );
  for (const [index, result] of reviewerResults.entries()) {
    if (!result.complete) blockers.push(`HUMAN_REVIEWER_${index + 1}`);
  }
  const reviewerIds = kit.reviewers.map((item) => item.reviewer?.reviewerId).filter(Boolean);
  const stableIdentities = kit.reviewers.map((item) => item.reviewer?.stableIdentity).filter(Boolean);
  const signingIdentities = reviewerResults.map((item) => item.signingIdentity).filter(Boolean);
  if (
    reviewerResults.every((item) => item.complete) &&
    (unique(reviewerIds).length !== REVIEWER_COUNT ||
      unique(stableIdentities).length !== REVIEWER_COUNT ||
      unique(signingIdentities).length !== REVIEWER_COUNT)
  ) {
    errors.push('the two reviewers must have distinct IDs, stable identities, and signing identities');
  }

  const adjudicationHash = rawHash(paths.adjudication);
  const adjudicationReady = validateAdjudication(
    kit.adjudication,
    kit.corpus,
    corpusHash,
    kit.reviewers,
    reviewerHashes,
    errors,
    { requireComplete: true, verifySignature: true },
  );
  if (!adjudicationReady) blockers.push('HUMAN_ADJUDICATION');

  const replayReady = {};
  for (const replayId of ['public383', 'candidate390']) {
    replayReady[replayId] = validateReplay(
      kit.replays[replayId],
      replayId,
      kit.corpus,
      corpusHash,
      adjudicationHash,
      identityContract,
      errors,
      { requireComplete: true, verifySignature: true },
    );
    if (!replayReady[replayId]) blockers.push(`FINDING_REPLAY_${replayId.toUpperCase()}`);
  }
  if (
    replayReady.public383 &&
    replayReady.candidate390 &&
    Date.parse(kit.replays.candidate390.generatedAt) <= Date.parse(kit.replays.public383.generatedAt)
  ) {
    errors.push('candidate 3.9 replay must be generated after the public 3.8.3 replay');
  }
  if (replayReady.candidate390) {
    const packet = readJsonAbsolute(dependencyAbsolutePath(dependencyPaths.packet));
    const qualifiedTarballs = packet.machineReplay?.artifact?.environment?.exactPackageTarballs;
    const candidateTarballs = kit.replays.candidate390.environment?.exactPackageTarballs;
    for (const [name, artifact] of [
      ['candidate finding', { environment: kit.replays.candidate390.environment }],
      ['route', packet.routeReplay?.artifact],
      ['adoption boundary', packet.adoptionBoundaryReplay?.artifact],
      ['machine', packet.machineReplay?.artifact],
    ]) {
      if (!isDeepStrictEqual(artifact?.environment?.exactPackageTarballs, qualifiedTarballs)) {
        errors.push(`${name} evidence is not bound to the exact qualified six-tarball set`);
      }
    }
    if (!isDeepStrictEqual(candidateTarballs, qualifiedTarballs)) {
      errors.push('candidate 3.9 finding replay tarballs do not match machine qualification');
    }
  }

  const summary = {
    status: errors.length > 0 ? 'invalid' : blockers.length > 0 ? 'incomplete' : 'ready',
    qualificationClaim: false,
    counts: {
      reviewerSlots: kit.reviewers.length,
      completedReviewers: reviewerResults.filter((item) => item.complete).length,
      judgmentSlots: kit.corpus.judgments.length,
      populatedCorpusJudgments: kit.corpus.judgments.filter((item) => item.caseId !== null).length,
      adjudicatedJudgments: kit.adjudication.decisions.filter((item) => item.decision !== null).length,
      publicReplayJudgments: kit.replays.public383.judgments.filter(
        (item) => typeof item.emitted === 'boolean',
      ).length,
      candidateReplayJudgments: kit.replays.candidate390.judgments.filter(
        (item) => typeof item.emitted === 'boolean',
      ).length,
    },
    identityContract,
    blockers: unique(blockers),
    errors: unique(errors),
  };
  if (requireComplete && summary.status !== 'ready') return { kit, summary };
  return { kit, summary };
}

function assertUnstartedReviewer(workbook, slot) {
  const blank = createReviewer(slot);
  const allowed = {
    ...blank,
    corpusSha256: workbook.corpusSha256,
    caseRationales: workbook.caseRationales,
  };
  if (!isDeepStrictEqual(workbook, allowed)) {
    throw new Error(`reviewer-${slot}.json has started; refusing to change corpus binding`);
  }
}

function sealCorpus() {
  const kit = readKit();
  const errors = [];
  validateManifest(kit.manifest, errors);
  if (!validateCorpus(kit.corpus, errors, { requireFrozen: true }) || errors.length > 0) {
    throw new Error(`cannot seal corpus:\n- ${errors.join('\n- ')}`);
  }
  const corpusHash = rawHash(paths.corpus);
  const caseRationales = kit.corpus.cases.map((item) => ({ caseId: item.id, rationale: null }));
  for (const [index, workbook] of kit.reviewers.entries()) {
    assertUnstartedReviewer(workbook, index + 1);
    workbook.corpusSha256 = corpusHash;
    workbook.caseRationales = caseRationales;
    writeJson(index === 0 ? paths.reviewer1 : paths.reviewer2, workbook);
  }
  return corpusHash;
}

function writeReviewSigningPayloads() {
  const kit = readKit();
  const errors = [];
  validateManifest(kit.manifest, errors);
  if (!validateCorpus(kit.corpus, errors, { requireFrozen: true })) {
    throw new Error(`cannot write review signing payloads:\n- ${errors.join('\n- ')}`);
  }
  const existing = [signingPayloadPaths.reviewer1, signingPayloadPaths.reviewer2].filter((path) =>
    existsSync(path),
  );
  if (existing.length > 0) {
    throw new Error(`refusing to overwrite signing payloads: ${existing.map(repoPath).join(', ')}`);
  }
  const corpusHash = rawHash(paths.corpus);
  const results = kit.reviewers.map((workbook, index) => {
    if (workbook.reviewer?.signedReviewEvidence !== null) {
      errors.push(`reviewer-${index + 1}.json signedReviewEvidence must be null before payload generation`);
    }
    return validateReviewerWorkbook(workbook, index + 1, kit.corpus, corpusHash, errors, {
      requireComplete: true,
      verifySignature: false,
      allowUnsignedComplete: true,
    });
  });
  const reviewerIds = kit.reviewers.map((item) => item.reviewer?.reviewerId).filter(Boolean);
  const stableIdentities = kit.reviewers
    .map((item) => item.reviewer?.stableIdentity)
    .filter(Boolean);
  if (
    !results.every((item) => item.complete) ||
    unique(reviewerIds).length !== REVIEWER_COUNT ||
    unique(stableIdentities).length !== REVIEWER_COUNT ||
    errors.length > 0
  ) {
    throw new Error(
      `cannot write review signing payloads:\n- ${errors.join('\n- ') || 'both complete, distinct reviews are required'}`,
    );
  }
  writeJsonExclusive(signingPayloadPaths.reviewer1, reviewerSignaturePayload(kit.reviewers[0]));
  writeJsonExclusive(signingPayloadPaths.reviewer2, reviewerSignaturePayload(kit.reviewers[1]));
  return [signingPayloadPaths.reviewer1, signingPayloadPaths.reviewer2];
}

function assertUnstartedAdjudication(adjudication) {
  const blank = createAdjudication();
  const allowed = {
    ...blank,
    corpusSha256: adjudication.corpusSha256,
    reviewerWorksheetSha256: adjudication.reviewerWorksheetSha256,
    caseResolutions: adjudication.caseResolutions,
  };
  if (!isDeepStrictEqual(adjudication, allowed)) {
    throw new Error('adjudication.json has started; refusing to change reviewer bindings');
  }
}

function sealReviews() {
  const kit = readKit();
  const errors = [];
  validateManifest(kit.manifest, errors);
  if (!validateCorpus(kit.corpus, errors, { requireFrozen: true })) {
    throw new Error(`cannot seal reviews:\n- ${errors.join('\n- ')}`);
  }
  const corpusHash = rawHash(paths.corpus);
  const results = kit.reviewers.map((workbook, index) =>
    validateReviewerWorkbook(workbook, index + 1, kit.corpus, corpusHash, errors, {
      requireComplete: true,
      verifySignature: true,
    }),
  );
  if (!results.every((item) => item.complete)) {
    throw new Error(`cannot seal reviews:\n- ${errors.join('\n- ') || 'both reviews are incomplete'}`);
  }
  const reviewerIds = kit.reviewers.map((item) => item.reviewer.reviewerId);
  const stableIdentities = kit.reviewers.map((item) => item.reviewer.stableIdentity);
  const signingIdentities = results.map((item) => item.signingIdentity);
  if (
    unique(reviewerIds).length !== REVIEWER_COUNT ||
    unique(stableIdentities).length !== REVIEWER_COUNT ||
    unique(signingIdentities).length !== REVIEWER_COUNT
  ) {
    throw new Error('cannot seal reviews: reviewer and signing identities must be distinct');
  }
  assertUnstartedAdjudication(kit.adjudication);
  kit.adjudication.corpusSha256 = corpusHash;
  kit.adjudication.reviewerWorksheetSha256 = {
    'reviewer-1': rawHash(paths.reviewer1),
    'reviewer-2': rawHash(paths.reviewer2),
  };
  kit.adjudication.caseResolutions = kit.corpus.cases.map((item) => ({
    caseId: item.id,
    disagreementJudgmentIds: disagreementIdsForCase(
      item.id,
      kit.corpus,
      kit.reviewers[0],
      kit.reviewers[1],
    ),
    resolution: null,
  }));
  writeJson(paths.adjudication, kit.adjudication);
  return kit.adjudication.reviewerWorksheetSha256;
}

function writeAdjudicationSigningPayload() {
  const kit = readKit();
  const errors = [];
  validateManifest(kit.manifest, errors);
  const corpusHash = rawHash(paths.corpus);
  const reviewerHashes = {
    'reviewer-1': rawHash(paths.reviewer1),
    'reviewer-2': rawHash(paths.reviewer2),
  };
  const reviewerResults = kit.reviewers.map((workbook, index) =>
    validateReviewerWorkbook(workbook, index + 1, kit.corpus, corpusHash, errors, {
      requireComplete: true,
      verifySignature: true,
    }),
  );
  if (kit.adjudication.signedAdjudicationEvidence !== null) {
    errors.push('adjudication.json signedAdjudicationEvidence must be null before payload generation');
  }
  const adjudicationReady = validateAdjudication(
    kit.adjudication,
    kit.corpus,
    corpusHash,
    kit.reviewers,
    reviewerHashes,
    errors,
    { requireComplete: true, verifySignature: false },
  );
  const adjudicator = kit.reviewers.find(
    (item) => item.reviewer?.reviewerId === kit.adjudication.adjudicatorReviewerId,
  )?.reviewer;
  if (
    !reviewerResults.every((item) => item.complete) ||
    !adjudicationReady ||
    !adjudicator ||
    errors.length > 0
  ) {
    throw new Error(
      `cannot write adjudication signing payload:\n- ${errors.join('\n- ') || 'complete signed reviews and adjudication are required'}`,
    );
  }
  writeJsonExclusive(
    signingPayloadPaths.adjudication,
    adjudicationSignaturePayload(kit.adjudication, adjudicator),
  );
  return signingPayloadPaths.adjudication;
}

function assertUnstartedReplay(replay, replayId) {
  const blank = createReplay(replayId);
  const allowed = {
    ...blank,
    corpusSha256: replay.corpusSha256,
    adjudicationSha256: replay.adjudicationSha256,
    caseResults: replay.caseResults,
  };
  if (!isDeepStrictEqual(replay, allowed)) {
    throw new Error(`${replayId} replay has started; refusing to change adjudication binding`);
  }
}

function sealAdjudication() {
  const kit = readKit();
  const errors = [];
  validateManifest(kit.manifest, errors);
  const corpusHash = rawHash(paths.corpus);
  const reviewerHashes = {
    'reviewer-1': rawHash(paths.reviewer1),
    'reviewer-2': rawHash(paths.reviewer2),
  };
  if (
    !validateAdjudication(
      kit.adjudication,
      kit.corpus,
      corpusHash,
      kit.reviewers,
      reviewerHashes,
      errors,
      { requireComplete: true },
    )
  ) {
    throw new Error(`cannot seal adjudication:\n- ${errors.join('\n- ') || 'adjudication is incomplete'}`);
  }
  const adjudicationHash = rawHash(paths.adjudication);
  for (const replayId of ['public383', 'candidate390']) {
    const replay = kit.replays[replayId];
    assertUnstartedReplay(replay, replayId);
    replay.corpusSha256 = corpusHash;
    replay.adjudicationSha256 = adjudicationHash;
    replay.caseResults = kit.corpus.cases.map((item) => ({
      caseId: item.id,
      clusterId: item.clusterId,
      exhaustive: null,
      unexpectedOutputs: null,
    }));
    writeJson(replayId === 'public383' ? paths.publicReplay : paths.candidateReplay, replay);
  }
  return adjudicationHash;
}

function refreshBindings() {
  const kit = readKit();
  if (kit.corpus.status !== 'draft' || kit.corpus.frozenAt !== null || kit.corpus.cases.length !== 0) {
    throw new Error('refusing to refresh contract bindings after corpus work has started');
  }
  if (!isDeepStrictEqual(kit.corpus, createCorpus())) {
    throw new Error('refusing to refresh contract bindings because corpus slots are not pristine');
  }
  for (const [index, reviewer] of kit.reviewers.entries()) {
    if (!isDeepStrictEqual(reviewer, createReviewer(index + 1))) {
      throw new Error('refusing to refresh contract bindings after reviewer work has started');
    }
  }
  if (!isDeepStrictEqual(kit.adjudication, createAdjudication())) {
    throw new Error('refusing to refresh contract bindings after adjudication work has started');
  }
  if (
    !isDeepStrictEqual(kit.replays.public383, createReplay('public383')) ||
    !isDeepStrictEqual(kit.replays.candidate390, createReplay('candidate390'))
  ) {
    throw new Error('refusing to refresh contract bindings after replay work has started');
  }
  kit.manifest.contractBindings = createContractBindings();
  writeJson(paths.manifest, kit.manifest);
}

function wilsonInterval(successes, total, z = 1.959963984540054) {
  if (!Number.isInteger(successes) || !Number.isInteger(total) || total <= 0) return null;
  if (successes < 0 || successes > total) return null;
  const proportion = successes / total;
  const zSquared = z * z;
  const denominator = 1 + zSquared / total;
  const center = (proportion + zSquared / (2 * total)) / denominator;
  const spread =
    (z * Math.sqrt((proportion * (1 - proportion) + zSquared / (4 * total)) / total)) /
    denominator;
  return { confidence: 0.95, lower: center - spread, upper: center + spread };
}

function computeMetrics(corpus, adjudication, replay) {
  const expected = new Map(adjudication.decisions.map((item) => [item.judgmentId, item.decision]));
  const matrix = { truePositive: 0, falsePositive: 0, falseNegative: 0, trueNegative: 0 };
  for (const result of replay.judgments) {
    const shouldEmit = expected.get(result.judgmentId) === 'emit';
    if (shouldEmit) matrix[result.emitted ? 'truePositive' : 'falseNegative'] += 1;
    else matrix[result.emitted ? 'falsePositive' : 'trueNegative'] += 1;
  }
  const judgmentTotal = Object.values(matrix).reduce((sum, value) => sum + value, 0);
  if (judgmentTotal !== corpus.judgments.length) throw new Error('replay matrix does not cover corpus');
  const precisionDenominator = matrix.truePositive + matrix.falsePositive;
  const recallDenominator = matrix.truePositive + matrix.falseNegative;
  if (precisionDenominator === 0 || recallDenominator === 0) {
    throw new Error('precision and recall denominators must both be nonzero');
  }
  return {
    confusionMatrix: { ...matrix, judgmentTotal },
    precision: {
      successes: matrix.truePositive,
      denominator: precisionDenominator,
      estimate: matrix.truePositive / precisionDenominator,
      wilson95: wilsonInterval(matrix.truePositive, precisionDenominator),
    },
    recall: {
      successes: matrix.truePositive,
      denominator: recallDenominator,
      estimate: matrix.truePositive / recallDenominator,
      wilson95: wilsonInterval(matrix.truePositive, recallDenominator),
    },
  };
}

function outputIdentity(judgment, identityContract) {
  const value = { source: judgment.source, code: judgment.code };
  if (identityContract.schemaSupportsCodeKind) value.codeKind = judgment.codeKind;
  return value;
}

function packetOutput(judgment, decision) {
  return {
    source: judgment.source,
    code: judgment.code,
    codeKind: judgment.codeKind,
    decision: decision.decision,
    severity: decision.severity,
    actionable: decision.actionable,
    rationale: decision.rationale,
  };
}

function buildFindingCorpus(kit) {
  const reviewerDecisionMaps = kit.reviewers.map(
    (item) => new Map(item.decisions.map((decision) => [decision.judgmentId, decision])),
  );
  const reviewerRationaleMaps = kit.reviewers.map(
    (item) => new Map(item.caseRationales.map((entry) => [entry.caseId, entry.rationale])),
  );
  const adjudicationDecisions = new Map(
    kit.adjudication.decisions.map((decision) => [decision.judgmentId, decision]),
  );
  const resolutions = new Map(
    kit.adjudication.caseResolutions.map((entry) => [entry.caseId, entry.resolution]),
  );
  return {
    status: 'complete',
    requiredJudgmentCount: JUDGMENT_COUNT,
    requiredHumanReviewerCount: REVIEWER_COUNT,
    cases: kit.corpus.cases.map((caseItem) => {
      const judgments = kit.corpus.judgments.filter((item) => item.caseId === caseItem.id);
      return {
        id: caseItem.id,
        clusterId: caseItem.clusterId,
        lane: caseItem.lane,
        targetId: caseItem.targetId,
        input: caseItem.input,
        sourceEvidence: caseItem.sourceEvidence,
        reviews: kit.reviewers.map((reviewer, reviewerIndex) => ({
          reviewerId: reviewer.reviewer.reviewerId,
          reviewedAt: reviewer.reviewedAt,
          expectedOutputs: {
            exhaustive: true,
            outputs: judgments.map((judgment) =>
              packetOutput(judgment, reviewerDecisionMaps[reviewerIndex].get(judgment.judgmentId)),
            ),
          },
          rationale: reviewerRationaleMaps[reviewerIndex].get(caseItem.id),
        })),
        adjudication: {
          adjudicatorReviewerId: kit.adjudication.adjudicatorReviewerId,
          adjudicatedAt: kit.adjudication.adjudicatedAt,
          expectedOutputs: {
            exhaustive: true,
            outputs: judgments.map((judgment) =>
              packetOutput(judgment, adjudicationDecisions.get(judgment.judgmentId)),
            ),
          },
          resolution: resolutions.get(caseItem.id),
        },
      };
    }),
  };
}

function buildReplayCases(kit, replay, identityContract) {
  const results = new Map(replay.judgments.map((item) => [item.judgmentId, item.emitted]));
  const caseResults = new Map(replay.caseResults.map((item) => [item.caseId, item]));
  return kit.corpus.cases.map((caseItem) => {
    const judgments = kit.corpus.judgments.filter((item) => item.caseId === caseItem.id);
    return {
      caseId: caseItem.id,
      clusterId: caseItem.clusterId,
      exhaustive: true,
      emitted: judgments
        .filter((item) => results.get(item.judgmentId) === true)
        .map((item) => outputIdentity(item, identityContract)),
      notEmitted: judgments
        .filter((item) => results.get(item.judgmentId) === false)
        .map((item) => outputIdentity(item, identityContract)),
      unexpectedOutputs: caseResults.get(caseItem.id).unexpectedOutputs,
    };
  });
}

function buildReplayArtifact(kit, replay, identityContract) {
  const artifact = {
    schemaVersion: 'decantr-finding-replay-artifact.v1',
    generatedAt: replay.generatedAt,
    command: replay.command,
    exitCode: replay.exitCode,
    environment: replay.environment,
    release: replay.observedRelease,
    cases: buildReplayCases(kit, replay, identityContract),
    metrics: computeMetrics(kit.corpus, kit.adjudication, replay),
  };
  artifact.behaviorBinding = createBehaviorEvidenceBinding(
    artifact.environment.exactPackageTarballs,
    {
      release: artifact.release,
      cases: artifact.cases,
      metrics: artifact.metrics,
    },
  );
  return artifact;
}

function artifactReference(path, text, artifact) {
  return {
    path: repoPath(path),
    sha256: sha256(text),
    mediaType: 'application/json',
    generatedAt: artifact.generatedAt,
    command: artifact.command,
    exitCode: artifact.exitCode,
    environment: artifact.environment,
    behaviorBinding: artifact.behaviorBinding,
  };
}

function contentAddressedArtifactPath(artifact, text) {
  return resolve(generatedDirectory, `${artifact.schemaVersion}.${sha256(text)}.json`);
}

function assemble() {
  const { kit, summary } = validateKit({ requireComplete: true });
  if (summary.status !== 'ready') {
    const issues = [...summary.errors, ...summary.blockers];
    throw new Error(`review kit is not ready:\n- ${issues.join('\n- ')}`);
  }
  for (const path of Object.values(generatedPaths)) {
    if (existsSync(path)) throw new Error(`refusing to overwrite generated evidence: ${repoPath(path)}`);
  }

  const publicArtifact = buildReplayArtifact(kit, kit.replays.public383, summary.identityContract);
  const candidateArtifact = buildReplayArtifact(
    kit,
    kit.replays.candidate390,
    summary.identityContract,
  );
  const publicText = jsonText(publicArtifact);
  const candidateText = jsonText(candidateArtifact);
  const publicArtifactPath = contentAddressedArtifactPath(publicArtifact, publicText);
  const candidateArtifactPath = contentAddressedArtifactPath(candidateArtifact, candidateText);
  for (const path of [publicArtifactPath, candidateArtifactPath]) {
    if (existsSync(path)) {
      throw new Error(`refusing to overwrite generated evidence: ${repoPath(path)}`);
    }
  }
  const publicSection = {
    status: 'complete',
    release: kit.replays.public383.observedRelease,
    artifact: artifactReference(publicArtifactPath, publicText, publicArtifact),
    cases: publicArtifact.cases,
    metrics: publicArtifact.metrics,
  };
  const candidateSection = {
    status: 'complete',
    release: kit.replays.candidate390.observedRelease,
    artifact: artifactReference(candidateArtifactPath, candidateText, candidateArtifact),
    cases: candidateArtifact.cases,
    metrics: candidateArtifact.metrics,
  };
  const fragment = {
    schemaVersion: 'decantr-3.9-human-review-packet-fragment.v2',
    qualificationClaim: false,
    sourceBindings: {
      corpusSha256: rawHash(paths.corpus),
      reviewerWorksheetSha256: {
        'reviewer-1': rawHash(paths.reviewer1),
        'reviewer-2': rawHash(paths.reviewer2),
      },
      adjudicationSha256: rawHash(paths.adjudication),
      replayWorkbookSha256: {
        public383: rawHash(paths.publicReplay),
        candidate390: rawHash(paths.candidateReplay),
      },
      signingPayloadSha256: {
        'reviewer-1': rawHash(signingPayloadPaths.reviewer1),
        'reviewer-2': rawHash(signingPayloadPaths.reviewer2),
        adjudication: rawHash(signingPayloadPaths.adjudication),
      },
    },
    patch: {
      reviewers: kit.reviewers.map((item) => item.reviewer),
      findingCorpus: buildFindingCorpus(kit),
      findingReplays: {
        public383: publicSection,
        candidate390: candidateSection,
      },
    },
  };

  mkdirSync(generatedDirectory, { recursive: true });
  writeFileSync(publicArtifactPath, publicText, { encoding: 'utf8', flag: 'wx' });
  writeFileSync(candidateArtifactPath, candidateText, { encoding: 'utf8', flag: 'wx' });
  writeJsonExclusive(generatedPaths.packetFragment, fragment);
}

function selfTest() {
  const tests = [];
  const check = (condition, name) => {
    if (!condition) throw new Error(`self-test failed: ${name}`);
    tests.push(name);
  };
  const ids = expectedJudgmentIds();
  check(ids.length === JUDGMENT_COUNT && unique(ids).length === JUDGMENT_COUNT, '200 unique slots');
  check(ids[0] === 'judgment-001' && ids.at(-1) === 'judgment-200', 'deterministic slot order');
  check(createReviewer(1).reviewer === null && createReviewer(2).reviewer === null, 'no fabricated identities');
  check(
    createAdjudication().signedAdjudicationEvidence === null,
    'blank adjudication has no signature evidence',
  );
  check(
    [createCorpus(), createReviewer(1), createReviewer(2), createAdjudication(), createReplay('public383')].every(
      (item) => item.qualificationClaim === false,
    ),
    'all templates deny qualification claims',
  );
  const interval = wilsonInterval(1, 1);
  check(interval.lower > 0.2 && interval.lower < 0.21 && interval.upper === 1, 'Wilson interval');
  const workbook = createReviewer(1);
  workbook.status = 'complete';
  workbook.corpusSha256 = 'a'.repeat(64);
  workbook.reviewedAt = '2026-07-16T12:00:00.000Z';
  workbook.reviewer = {
    reviewerId: 'self-test-reviewer',
    kind: 'human',
    name: 'Self Test Reviewer',
    stableIdentity: 'self-test-reviewer',
    attestation: HUMAN_REVIEW_ATTESTATION,
    attestedAt: '2026-07-16T12:00:00.000Z',
    signedReviewEvidence: null,
  };
  const firstPayloadHash = hashJson(reviewerSignaturePayload(workbook));
  workbook.decisions[0].rationale = 'changed';
  check(
    hashJson(reviewerSignaturePayload(workbook)) !== firstPayloadHash,
    'review signature payload binds every decision rationale',
  );
  const schema = readJsonAbsolute(dependencyAbsolutePath(dependencyPaths.schema));
  const contract = detectReplayIdentityContract(
    schema,
    readFileSync(dependencyAbsolutePath(dependencyPaths.audit), 'utf8'),
  );
  check(typeof contract.compatible === 'boolean', 'replay identity contract preflight');
  return tests;
}

function parseArgs(argv) {
  const actions = new Set([
    '--prepare',
    '--lint-only',
    '--validate',
    '--seal-corpus',
    '--write-review-signing-payloads',
    '--seal-reviews',
    '--write-adjudication-signing-payload',
    '--seal-adjudication',
    '--refresh-bindings',
    '--assemble',
    '--self-test',
    '--help',
  ]);
  let action = '--validate';
  let json = false;
  let actionSeen = false;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--') continue;
    if (arg === '--repo-root' || arg === '--fixtures-dir') {
      if (!argv[++index]) throw new Error(`${arg} requires a path`);
      continue;
    }
    if (arg.startsWith('--repo-root=') || arg.startsWith('--fixtures-dir=')) continue;
    if (arg === '--json') {
      json = true;
      continue;
    }
    if (!actions.has(arg)) throw new Error(`unknown argument: ${arg}`);
    if (actionSeen) throw new Error('choose exactly one action');
    action = arg;
    actionSeen = true;
  }
  return { action, json };
}

function printSummary(summary, json) {
  if (json) {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }
  console.log(`Decantr 3.9 human review kit: ${summary.status.toUpperCase()}`);
  console.log(
    `reviewers ${summary.counts.completedReviewers}/${REVIEWER_COUNT}; corpus ${summary.counts.populatedCorpusJudgments}/${JUDGMENT_COUNT}; adjudicated ${summary.counts.adjudicatedJudgments}/${JUDGMENT_COUNT}; replays ${summary.counts.publicReplayJudgments}/${JUDGMENT_COUNT} and ${summary.counts.candidateReplayJudgments}/${JUDGMENT_COUNT}`,
  );
  for (const issue of summary.errors) console.error(`- invalid: ${issue}`);
  for (const blocker of summary.blockers) console.error(`- incomplete: ${blocker}`);
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.action === '--prepare') {
    prepare();
    console.log(`Prepared blank human review kit at ${repoPath(reviewDirectory)}`);
  } else if (options.action === '--self-test') {
    const tests = selfTest();
    console.log(`Human review kit self-test: PASS (${tests.length} checks)`);
  } else if (options.action === '--help') {
    console.log(usage);
  } else if (options.action === '--seal-corpus') {
    const hash = sealCorpus();
    console.log(`Sealed corpus binding ${hash}; reviewer evidence remains incomplete`);
  } else if (options.action === '--write-review-signing-payloads') {
    const payloads = writeReviewSigningPayloads();
    console.log(`Wrote canonical reviewer signing payloads: ${payloads.map(repoPath).join(', ')}`);
  } else if (options.action === '--seal-reviews') {
    sealReviews();
    console.log('Sealed two verified reviewer workbooks; adjudication remains incomplete');
  } else if (options.action === '--write-adjudication-signing-payload') {
    const payload = writeAdjudicationSigningPayload();
    console.log(`Wrote canonical adjudication signing payload: ${repoPath(payload)}`);
  } else if (options.action === '--seal-adjudication') {
    const hash = sealAdjudication();
    console.log(`Sealed adjudication binding ${hash}; finding replays remain incomplete`);
  } else if (options.action === '--refresh-bindings') {
    refreshBindings();
    console.log('Refreshed pristine kit contract bindings; no human evidence was created');
  } else if (options.action === '--assemble') {
    assemble();
    console.log(`Assembled review-owned packet fragment at ${repoPath(generatedPaths.packetFragment)}`);
  } else {
    const { summary } = validateKit({ requireComplete: options.action === '--validate' });
    printSummary(summary, options.json);
    const passed =
      options.action === '--lint-only' ? summary.errors.length === 0 : summary.status === 'ready';
    if (!passed) process.exitCode = 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (cause) {
    console.error(`Human review kit failed: ${cause.message}`);
    process.exitCode = 1;
  }
}
