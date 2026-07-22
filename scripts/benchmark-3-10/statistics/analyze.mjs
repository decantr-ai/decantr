#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  prettyCanonicalJson,
  readJsonFile,
  sha256,
  sha256Canonical,
  writeCanonicalFile,
} from '../runner/canonical.mjs';
import {
  assertQualificationIndex,
  assertRunPlan,
  expectedAnalysisSeed,
  expectedReviewSeed,
} from '../runner/contracts.mjs';

const benchmarkDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FUNCTIONAL_NONINFERIORITY_RULE =
  'treatment functional success no worse than control by more than 5 percentage points overall within each model; framework strata are reported as exploratory unless independently powered';
const BLIND_PREFERENCE_RULE =
  'at least 26 of 32 qualification task/model units are decisive, treatment is preferred in at least 60% of decisive units, and the two-sided 95% Wilson lower confidence bound is greater than 50%';
const MIXED_CLAIM_POLICY =
  'No value claim is authorized. This protocol predeclares and powers no scoped hypotheses, so exploratory framework or task results cannot authorize a scoped improvement claim.';
const PREFERENCE_POPULATION = 'sealed qualification tasks only; development tasks are excluded';
const PREFERENCE_REPETITION_RULE =
  'An arm wins a task/model unit only when it is preferred in a strict majority of all planned repetitions.';
const PREFERENCE_PROTOCOL_TIE_RULE =
  'Split repetitions, repetition-level ties, and every other result without a strict arm majority make the task/model unit a tie. Task/model ties are reported and excluded from the binomial denominator.';
const PREFERENCE_AGGREGATION = 'strict-majority-of-planned-repetitions';
const PREFERENCE_TIE_POLICY =
  'non-majority-task-model-units-are-ties-excluded-from-binomial-denominator';
const FAILED_TREATMENT_GOVERNANCE_PENALTY = 1_000_000;

function assertBlindPreferenceProtocol(protocol) {
  const analysis = protocol.blindPreferenceAnalysis;
  if (
    analysis?.population !== PREFERENCE_POPULATION ||
    analysis?.analysisUnit !== 'qualification-task-model' ||
    !Number.isInteger(analysis?.plannedUnits) ||
    analysis.plannedUnits < 1 ||
    analysis?.repetitionAggregation !== PREFERENCE_REPETITION_RULE ||
    analysis?.tiePolicy !== PREFERENCE_PROTOCOL_TIE_RULE ||
    analysis?.minimumDecisiveFraction !== 0.8 ||
    !Number.isInteger(analysis?.minimumDecisiveUnits) ||
    analysis.minimumDecisiveUnits < 1 ||
    analysis?.pointEstimateMinimum !== 0.6 ||
    analysis?.confidenceLevel !== 0.95 ||
    analysis?.confidenceMethod !== 'two-sided Wilson score interval' ||
    analysis?.wilsonLowerBoundMustExceed !== 0.5
  ) {
    throw new Error('statistics implementation does not recognize the frozen blind-preference analysis');
  }
  return analysis;
}

export async function analyzeStatistics(options) {
  if (typeof options.seed !== 'string' || options.seed.length < 16) {
    throw new Error('analysis requires an explicit seed of at least 16 characters');
  }
  const iterations = options.bootstrapIterations ?? 10_000;
  if (!Number.isInteger(iterations) || iterations < 100) throw new Error('bootstrap iterations must be at least 100');
  const plan = assertRunPlan(await readJsonFile(options.planPath));
  const protocolBytes = await readFile(options.protocolPath ?? join(benchmarkDirectory, 'protocol.json'));
  const protocol = JSON.parse(protocolBytes);
  if (
    protocol.schemaVersion !== 'decantr-benchmark-protocol.v1' ||
    protocol.releaseGates?.functionalNonInferiority !== FUNCTIONAL_NONINFERIORITY_RULE ||
    protocol.releaseGates?.blindPreference !== BLIND_PREFERENCE_RULE
  ) {
    throw new Error('statistics implementation does not recognize the frozen statistical protocol');
  }
  const preferenceProtocol = assertBlindPreferenceProtocol(protocol);
  if (
    protocol.claimPolicy?.mixed !== MIXED_CLAIM_POLICY ||
    !Array.isArray(protocol.claimPolicy?.scopedHypotheses) ||
    protocol.claimPolicy.scopedHypotheses.length !== 0
  ) {
    throw new Error('statistics require mixed results to authorize no value claim without a powered scoped hypothesis');
  }
  if (options.seed !== expectedAnalysisSeed(protocol.design.randomizationSeed)) {
    throw new Error('analysis seed does not match the deterministic derivative of the committed protocol seed');
  }
  const qualificationBytes = await readFile(options.qualificationIndexPath);
  const qualification = assertQualificationIndex(JSON.parse(qualificationBytes));
  if (qualification.tasks.length !== protocol.design.minimumQualificationTasks) {
    throw new Error(
      `sealed qualification task count must be exactly ${protocol.design.minimumQualificationTasks}; found ${qualification.tasks.length}`,
    );
  }
  const qualificationTaskIds = new Set(qualification.tasks.map((task) => task.taskId));
  const expectedRuns = plan.runs.filter(
    (run) => run.partition === 'qualification' && qualificationTaskIds.has(run.taskId),
  );
  const unexpectedQualification = plan.runs.filter(
    (run) => run.partition === 'qualification' && !qualificationTaskIds.has(run.taskId),
  );
  if (unexpectedQualification.length > 0) throw new Error('run plan contains qualification tasks absent from the sealed index');
  if (new Set(expectedRuns.map((run) => run.taskId)).size !== qualification.tasks.length) {
    throw new Error('sealed qualification tasks and run plan do not have one-to-one coverage');
  }
  const modelIds = [...new Set(expectedRuns.map((run) => run.modelId))].sort();
  const plannedPreferenceUnits = qualification.tasks.length * modelIds.length;
  const observedPreferenceUnits = new Set(
    expectedRuns.map((run) => taskModelKey(run.taskId, run.modelId)),
  ).size;
  if (
    modelIds.length !== protocol.design.models ||
    observedPreferenceUnits !== plannedPreferenceUnits ||
    expectedRuns.length !== plannedPreferenceUnits * plan.design.arms * plan.design.repetitions
  ) {
    throw new Error('sealed qualification runs do not cover every planned task/model/arm/repetition cell');
  }
  const minimumDecisiveUnits = Math.ceil(
    plannedPreferenceUnits * preferenceProtocol.minimumDecisiveFraction,
  );
  if (
    preferenceProtocol.plannedUnits !== plannedPreferenceUnits ||
    preferenceProtocol.minimumDecisiveUnits !== minimumDecisiveUnits
  ) {
    throw new Error('blind-preference unit arithmetic does not match the sealed qualification design');
  }

  const assignmentsBytes = await readFile(options.assignmentsPath);
  const assignments = JSON.parse(assignmentsBytes);
  if (
    assignments.schemaVersion !== 'decantr-benchmark-review-assignments.v1' ||
    assignments.runPlanSha256 !== plan.planSha256 ||
    assignments.seed !== expectedReviewSeed(plan.seed)
  ) {
    throw new Error('review assignments do not match the committed run plan and randomization seed');
  }
  const assignmentsSha256 = sha256(assignmentsBytes);
  const reviewBytes = await readFile(options.reviewWorkbookPath);
  const review = JSON.parse(reviewBytes);
  if (review.schemaVersion !== 'decantr-benchmark-review-workbook.v1' || review.blinded !== true) {
    throw new Error('statistics require a sealed blinded review workbook');
  }
  if (review.assignmentsSha256 !== assignmentsSha256) {
    throw new Error('review workbook and private assignments are not bound');
  }

  const failures = [];
  const recordEntries = new Map();
  for (const run of expectedRuns) {
    try {
      const index = await readJsonFile(join(options.recordRoot, 'run-index', `${run.runId}.json`));
      const path = join(options.recordRoot, 'run-records', 'sha256', `${index.recordSha256}.json`);
      const bytes = await readFile(path);
      if (sha256(bytes) !== index.recordSha256) throw new Error('content-address digest mismatch');
      const record = JSON.parse(bytes);
      if (record.runId !== run.runId) throw new Error('run identity mismatch');
      recordEntries.set(run.runId, { record, sha256: index.recordSha256 });
    } catch (error) {
      failures.push({ runId: run.runId, stage: 'record', code: 'MISSING_RUN_RECORD', message: error.message });
      recordEntries.set(run.runId, { record: null, sha256: null });
    }
  }
  const runRecordSetSha256 = sha256Canonical(
    expectedRuns
      .map((run) => ({ runId: run.runId, recordSha256: recordEntries.get(run.runId).sha256 }))
      .sort((left, right) => left.runId.localeCompare(right.runId)),
  );
  const reviewRecordSetMatched = assignments.recordSetSha256 === runRecordSetSha256;
  if (!reviewRecordSetMatched) {
    failures.push({
      stage: 'review',
      code: 'REVIEW_RECORD_SET_MISMATCH',
      message: 'review assignments are not bound to the analyzed run-record set',
    });
  }

  const reviewEvidence = mapReviewEvidence(
    assignments,
    review,
    expectedRuns,
    failures,
  );
  const observations = [];
  for (const run of expectedRuns) {
    const entry = recordEntries.get(run.runId);
    const record = entry.record;
    const evaluator = record ? await loadEvaluator(options.recordRoot, record, run, failures) : null;
    if (record?.status !== 'completed') {
      failures.push({
        runId: run.runId,
        stage: 'run',
        code: record?.status ?? 'missing',
        message: record?.failure?.message ?? 'run did not complete',
      });
    }
    const reviewScore = reviewEvidence.scores.get(run.runId);
    if (!Number.isFinite(reviewScore)) {
      failures.push({
        runId: run.runId,
        stage: 'review',
        code: 'MISSING_REVIEW_SCORE',
        message: 'run did not receive two blinded review scores',
      });
    }
    const runSucceeded = record?.status === 'completed' && evaluator !== null;
    observations.push({
      ...run,
      qualityScore: runSucceeded && Number.isFinite(reviewScore) ? reviewScore : 0,
      governanceViolations:
        runSucceeded
          ? nonnegativeNumber(evaluator.metrics?.governanceViolations, 1)
          : run.arm === 'treatment'
            ? FAILED_TREATMENT_GOVERNANCE_PENALTY
            : 0,
      functionalSuccess:
        runSucceeded ? evaluator.metrics?.functionalSuccess === true : false,
      inputTokens: nonnegativeNumber(record?.usage?.inputTokens, 0),
      outputTokens: nonnegativeNumber(record?.usage?.outputTokens, 0),
      costUsd: nonnegativeNumber(record?.budget?.actualUsd, 0),
      failed: !runSucceeded || !Number.isFinite(reviewScore),
    });
  }

  const collapsed = collapseRepetitions(observations, plan.design.repetitions, failures);
  const confidenceLevel = preferenceProtocol.confidenceLevel;
  const modelLift = modelIds.map((modelId) => {
    const pairs = pairedByTask(collapsed.filter((item) => item.modelId === modelId), 'qualityScore');
    const differences = pairs.map((pair) => pair.treatment - pair.control);
    return {
      modelId,
      estimate: meanOrNull(differences),
      confidenceInterval: bootstrapMeanInterval(
        differences,
        `${options.seed}:lift:${modelId}`,
        iterations,
        confidenceLevel,
      ),
      n: differences.length,
    };
  });
  const governanceReduction = modelIds.map((modelId) => {
    const pairs = pairedByTask(collapsed.filter((item) => item.modelId === modelId), 'governanceViolations');
    const estimator = (sample) => relativeReduction(sample.map((pair) => pair.control), sample.map((pair) => pair.treatment));
    return {
      modelId,
      estimate: estimator(pairs),
      confidenceInterval: bootstrapObjectInterval(
        pairs,
        estimator,
        `${options.seed}:governance:${modelId}`,
        iterations,
        confidenceLevel,
      ),
      n: pairs.length,
    };
  });
  const functionalOverallByModel = [];
  const functionalExploratoryByFramework = [];
  for (const modelId of modelIds) {
    const overallPairs = pairedByTask(
      collapsed.filter((item) => item.modelId === modelId),
      'functionalSuccess',
    );
    const overallDifferences = overallPairs.map((pair) => pair.treatment - pair.control);
    functionalOverallByModel.push({
      modelId,
      estimate: meanOrNull(overallDifferences),
      confidenceInterval: bootstrapMeanInterval(
        overallDifferences,
        `${options.seed}:functional:overall:${modelId}`,
        iterations,
        confidenceLevel,
      ),
      n: overallDifferences.length,
    });
    const frameworks = [
      ...new Set(collapsed.filter((item) => item.modelId === modelId).map((item) => item.framework)),
    ].sort();
    for (const framework of frameworks) {
      const pairs = pairedByTask(
        collapsed.filter((item) => item.modelId === modelId && item.framework === framework),
        'functionalSuccess',
      );
      const differences = pairs.map((pair) => pair.treatment - pair.control);
      functionalExploratoryByFramework.push({
        modelId,
        framework,
        estimate: meanOrNull(differences),
        confidenceInterval: bootstrapMeanInterval(
          differences,
          `${options.seed}:functional:${modelId}:${framework}`,
          iterations,
          confidenceLevel,
        ),
        n: differences.length,
        powered: false,
        gateEligible: false,
        interpretation: 'exploratory-unpowered',
      });
    }
  }
  const functionalNonInferiority = {
    margin: -0.05,
    confirmatoryScope: 'overall-within-model',
    overallByModel: functionalOverallByModel,
    exploratoryByFramework: functionalExploratoryByFramework,
  };
  const aggregatedPreferences = aggregatePreferencesByTaskModel(
    reviewEvidence.preferences,
    expectedRuns,
    plan.design.repetitions,
    failures,
  );
  const preference = calculatePreference(aggregatedPreferences.outcomes);
  const blindPreference = {
    analysisUnit: preferenceProtocol.analysisUnit,
    population: 'sealed-qualification-only',
    repetitionAggregation: PREFERENCE_AGGREGATION,
    tiePolicy: PREFERENCE_TIE_POLICY,
    plannedUnits: plannedPreferenceUnits,
    minimumDecisiveUnits,
    pointEstimateMinimum: preferenceProtocol.pointEstimateMinimum,
    confidenceMethod: 'two-sided-wilson-score',
    wilsonLowerBoundMustExceed: preferenceProtocol.wilsonLowerBoundMustExceed,
    treatmentPreferred: preference.treatment,
    controlPreferred: preference.control,
    estimate: preference.rate,
    confidenceInterval: wilsonInterval(preference.treatment, preference.decisive, confidenceLevel),
    n: preference.decisive,
    ties: preference.ties,
  };
  const overhead = calculateOverhead(observations, failures);

  const gates = {
    evidenceComplete:
      recordEntries.size === expectedRuns.length &&
      [...recordEntries.values()].every((entry) => entry.record !== null) &&
      reviewRecordSetMatched &&
      reviewEvidence.complete &&
      aggregatedPreferences.complete,
    modelLift: modelLift.every(
      (item) => item.estimate !== null && item.estimate >= 5 && item.confidenceInterval.lower > 0,
    ),
    governanceReduction: governanceReduction.every(
      (item) => item.estimate !== null && item.estimate >= 25,
    ),
    governanceCi: governanceReduction.every(
      (item) => item.confidenceInterval.lower !== null && item.confidenceInterval.lower > 0,
    ),
    functionalNonInferiority: functionalOverallByModel.every(
      (item) =>
        item.n === qualification.tasks.length &&
        item.confidenceInterval.lower !== null &&
        item.confidenceInterval.lower >= functionalNonInferiority.margin,
    ),
    blindPreference:
      blindPreference.n >= blindPreference.minimumDecisiveUnits &&
      blindPreference.estimate !== null &&
      blindPreference.estimate >= blindPreference.pointEstimateMinimum &&
      blindPreference.confidenceInterval.lower !== null &&
      blindPreference.confidenceInterval.lower > blindPreference.wilsonLowerBoundMustExceed,
    medianOverhead:
      overhead.tokens.undefinedPairs === 0 &&
      overhead.cost.undefinedPairs === 0 &&
      Number.isFinite(overhead.tokens.medianPercent) &&
      Number.isFinite(overhead.cost.medianPercent) &&
      overhead.tokens.medianPercent <= 15 &&
      overhead.cost.medianPercent <= 15,
    tailOverhead:
      overhead.tokens.undefinedPairs === 0 &&
      overhead.cost.undefinedPairs === 0 &&
      Number.isFinite(overhead.tokens.p95Percent) &&
      Number.isFinite(overhead.cost.p95Percent) &&
      overhead.tokens.p95Percent <= 25 &&
      overhead.cost.p95Percent <= 25,
    failureVisibility: observations.length === expectedRuns.length,
  };
  const allGatesPassed = Object.values(gates).every(Boolean);
  const claimOutcome = allGatesPassed ? 'pass' : gates.evidenceComplete ? 'mixed' : 'fail';
  const statistics = {
    schemaVersion: 'decantr-benchmark-statistics.v1',
    analysisSeed: options.seed,
    confidenceLevel,
    bindings: {
      analysisCodeSha256: sha256(await readFile(fileURLToPath(import.meta.url))),
      runPlanSha256: plan.planSha256,
      protocolSha256: sha256(protocolBytes),
      qualificationTaskIndexSha256: sha256(qualificationBytes),
      runRecordSetSha256,
      assignmentsSha256,
      reviewWorkbookSha256: sha256(reviewBytes),
    },
    denominators: {
      sealedQualificationTasks: qualification.tasks.length,
      expectedRuns: expectedRuns.length,
      observedRuns: observations.length,
      failedRuns: observations.filter((item) => item.failed).length,
      reviewAssignments: reviewEvidence.includedAssignments,
      excludedReviewAssignments: reviewEvidence.excludedAssignments,
      plannedPreferenceUnits,
      minimumDecisivePreferences: minimumDecisiveUnits,
      decisivePreferences: preference.decisive,
      ties: preference.ties,
    },
    modelLift,
    governanceReduction,
    functionalNonInferiority,
    blindPreference,
    overhead,
    failures,
    gates,
    allGatesPassed,
    claimAuthorization: {
      outcome: claimOutcome,
      valueClaim: allGatesPassed ? 'release-audit-required' : 'no-value-claim',
      mixedValueClaim: 'no-value-claim',
      scopedHypothesesPredeclaredAndPowered: false,
    },
  };
  if (options.outputPath) await writeCanonicalFile(options.outputPath, statistics);
  return statistics;
}

function mapReviewEvidence(assignments, workbook, expectedRuns, failures) {
  const expectedRunById = new Map(expectedRuns.map((run) => [run.runId, run]));
  const expectedCells = new Map();
  for (const run of expectedRuns) {
    const key = reviewCellKey(run.taskId, run.modelId, run.repetition);
    const cell = expectedCells.get(key) ?? {
      taskId: run.taskId,
      framework: run.framework,
      modelId: run.modelId,
      repetition: run.repetition,
      runs: [],
    };
    cell.runs.push(run);
    expectedCells.set(key, cell);
  }
  const reviewsByAssignment = new Map();
  for (const review of workbook.reviews ?? []) {
    const items = reviewsByAssignment.get(review.assignmentId) ?? [];
    items.push(review);
    reviewsByAssignment.set(review.assignmentId, items);
  }
  const adjudications = new Map((workbook.adjudications ?? []).map((item) => [item.assignmentId, item]));
  const scores = new Map();
  const preferences = [];
  const assignmentIds = new Set();
  const observedCells = new Set();
  const workbookReviewers = new Set(workbook.reviewers ?? []);
  let includedAssignments = 0;
  let complete = true;
  for (const assignment of assignments.assignments ?? []) {
    if (assignmentIds.has(assignment.assignmentId)) {
      failures.push({
        assignmentId: assignment.assignmentId,
        stage: 'review',
        code: 'DUPLICATE_REVIEW_ASSIGNMENT',
      });
      complete = false;
      continue;
    }
    assignmentIds.add(assignment.assignmentId);
    const candidates = assignment.candidates ?? [];
    const candidateRuns = candidates.map((candidate) => expectedRunById.get(candidate.runId));
    const labels = new Set(candidates.map((candidate) => candidate.label));
    if (
      candidates.length !== 2 ||
      candidateRuns.some((run) => !run) ||
      labels.size !== 2 ||
      !labels.has('A') ||
      !labels.has('B')
    ) {
      failures.push({
        assignmentId: assignment.assignmentId,
        stage: 'review',
        code: 'EXCLUDED_NONQUALIFICATION_ASSIGNMENT',
        message: 'review assignment is not an A/B pair from the sealed qualification run set',
      });
      complete = false;
      continue;
    }
    const [firstRun] = candidateRuns;
    const cellKey = reviewCellKey(firstRun.taskId, firstRun.modelId, firstRun.repetition);
    const expectedCell = expectedCells.get(cellKey);
    const mappingMatches =
      expectedCell &&
      assignment.taskId === expectedCell.taskId &&
      assignment.framework === expectedCell.framework &&
      assignment.preferenceUnitId ===
        calculatePreferenceUnitId(assignments.seed, expectedCell.taskId, expectedCell.modelId) &&
      candidates.every((candidate, index) => {
        const run = candidateRuns[index];
        return (
          run.taskId === expectedCell.taskId &&
          run.modelId === expectedCell.modelId &&
          run.repetition === expectedCell.repetition &&
          candidate.arm === run.arm &&
          candidate.modelId === run.modelId &&
          candidate.repetition === run.repetition
        );
      }) &&
      new Set(candidateRuns.map((run) => run.arm)).size === 2;
    if (!mappingMatches || observedCells.has(cellKey)) {
      failures.push({
        assignmentId: assignment.assignmentId,
        stage: 'review',
        code: observedCells.has(cellKey) ? 'DUPLICATE_REVIEW_CELL' : 'INVALID_REVIEW_MAPPING',
        message: `${cellKey}: private assignment does not uniquely match the sealed qualification design`,
      });
      complete = false;
      continue;
    }
    observedCells.add(cellKey);
    includedAssignments += 1;
    const reviews = reviewsByAssignment.get(assignment.assignmentId) ?? [];
    if (
      reviews.length !== 2 ||
      new Set(reviews.map((item) => item.reviewerId)).size !== 2 ||
      workbookReviewers.size !== 2 ||
      reviews.some((item) => !workbookReviewers.has(item.reviewerId))
    ) {
      failures.push({
        assignmentId: assignment.assignmentId,
        stage: 'review',
        code: 'INCOMPLETE_BLINDED_REVIEW',
        message: 'exactly two independent reviews are required',
      });
      complete = false;
    }
    for (const candidate of candidates) {
      const values = reviews.map((review) => review.scores?.[candidate.label]).filter(Number.isFinite);
      if (values.length === 2) scores.set(candidate.runId, mean(values));
    }
    const reviewerPreferences = reviews.map((item) => item.preference);
    let label = null;
    if (reviewerPreferences.length === 2 && reviewerPreferences[0] === reviewerPreferences[1]) {
      label = reviewerPreferences[0];
    } else if (adjudications.has(assignment.assignmentId)) {
      label = adjudications.get(assignment.assignmentId).preference;
    } else {
      failures.push({
        assignmentId: assignment.assignmentId,
        stage: 'review',
        code: 'MISSING_ADJUDICATION',
        message: 'reviewer disagreement was not adjudicated',
      });
      complete = false;
    }
    if (label === 'tie') {
      preferences.push({
        assignmentId: assignment.assignmentId,
        taskId: expectedCell.taskId,
        modelId: expectedCell.modelId,
        repetition: expectedCell.repetition,
        preference: 'tie',
      });
    } else if (label) {
      const candidate = assignment.candidates.find((item) => item.label === label);
      if (!candidate) {
        complete = false;
        failures.push({ assignmentId: assignment.assignmentId, stage: 'review', code: 'INVALID_PREFERENCE_LABEL' });
      } else {
        preferences.push({
          assignmentId: assignment.assignmentId,
          taskId: expectedCell.taskId,
          modelId: expectedCell.modelId,
          repetition: expectedCell.repetition,
          preference: candidate.arm,
        });
      }
    }
  }
  for (const [cellKey, cell] of expectedCells) {
    if (cell.runs.length !== 2 || new Set(cell.runs.map((run) => run.arm)).size !== 2) {
      failures.push({
        stage: 'statistics',
        code: 'INVALID_QUALIFICATION_REVIEW_CELL',
        message: `${cellKey}: expected exactly one control and one treatment run`,
      });
      complete = false;
    }
    if (!observedCells.has(cellKey)) {
      failures.push({
        stage: 'review',
        code: 'MISSING_QUALIFICATION_REVIEW_ASSIGNMENT',
        message: cellKey,
      });
      complete = false;
    }
  }
  for (const assignmentId of reviewsByAssignment.keys()) {
    if (!assignmentIds.has(assignmentId)) {
      failures.push({
        assignmentId,
        stage: 'review',
        code: 'UNKNOWN_REVIEW_ASSIGNMENT',
      });
      complete = false;
    }
  }
  return {
    scores,
    preferences,
    complete,
    includedAssignments,
    excludedAssignments: (assignments.assignments?.length ?? 0) - includedAssignments,
  };
}

async function loadEvaluator(recordRoot, record, run, failures) {
  if (!record.evaluatorResultSha256) {
    failures.push({ runId: run.runId, stage: 'evaluator', code: 'MISSING_EVALUATOR_RESULT' });
    return null;
  }
  try {
    const path = join(recordRoot, 'evaluator-results', 'sha256', `${record.evaluatorResultSha256}.json`);
    const bytes = await readFile(path);
    if (sha256(bytes) !== record.evaluatorResultSha256) throw new Error('content-address digest mismatch');
    const evaluator = JSON.parse(bytes);
    if (
      evaluator.schemaVersion !== 'decantr-benchmark-evaluator-result.v1' ||
      evaluator.runId !== run.runId ||
      evaluator.taskId !== run.taskId ||
      evaluator.status !== 'passed' ||
      evaluator.metrics?.buildPassed !== true ||
      evaluator.metrics?.functionalSuccess !== true ||
      !Number.isFinite(evaluator.metrics?.governanceViolations) ||
      evaluator.metrics.governanceViolations < 0
    ) {
      throw new Error('evaluator identity, status, or metrics mismatch');
    }
    return evaluator;
  } catch (error) {
    failures.push({ runId: run.runId, stage: 'evaluator', code: 'INVALID_EVALUATOR_RESULT', message: error.message });
    return null;
  }
}

function collapseRepetitions(observations, expectedRepetitions, failures) {
  const groups = new Map();
  for (const item of observations) {
    const key = `${item.taskId}:${item.modelId}:${item.arm}`;
    const values = groups.get(key) ?? [];
    values.push(item);
    groups.set(key, values);
  }
  const collapsed = [];
  for (const [key, values] of groups) {
    if (values.length !== expectedRepetitions) {
      failures.push({ stage: 'statistics', code: 'REPETITION_ARITHMETIC', message: `${key}: ${values.length}` });
    }
    collapsed.push({
      taskId: values[0].taskId,
      modelId: values[0].modelId,
      arm: values[0].arm,
      framework: values[0].framework,
      qualityScore: mean(values.map((item) => item.qualityScore)),
      governanceViolations: mean(values.map((item) => item.governanceViolations)),
      functionalSuccess: mean(values.map((item) => (item.functionalSuccess ? 1 : 0))),
    });
  }
  return collapsed;
}

function pairedByTask(items, field) {
  const groups = new Map();
  for (const item of items) {
    const pair = groups.get(item.taskId) ?? {};
    pair[item.arm] = item[field];
    groups.set(item.taskId, pair);
  }
  return [...groups.entries()]
    .filter(([, pair]) => Number.isFinite(pair.control) && Number.isFinite(pair.treatment))
    .map(([taskId, pair]) => ({ taskId, control: pair.control, treatment: pair.treatment }));
}

function aggregatePreferencesByTaskModel(preferences, expectedRuns, expectedRepetitions, failures) {
  const expectedUnits = new Map();
  for (const run of expectedRuns) {
    const key = taskModelKey(run.taskId, run.modelId);
    const unit = expectedUnits.get(key) ?? {
      taskId: run.taskId,
      modelId: run.modelId,
      repetitions: new Set(),
    };
    unit.repetitions.add(run.repetition);
    expectedUnits.set(key, unit);
  }
  const observed = new Map();
  let complete = true;
  for (const item of preferences) {
    const key = taskModelKey(item.taskId, item.modelId);
    if (!expectedUnits.has(key)) {
      failures.push({
        assignmentId: item.assignmentId,
        stage: 'statistics',
        code: 'EXCLUDED_NONQUALIFICATION_PREFERENCE',
      });
      complete = false;
      continue;
    }
    const repetitions = observed.get(key) ?? new Map();
    if (repetitions.has(item.repetition)) {
      failures.push({
        assignmentId: item.assignmentId,
        stage: 'statistics',
        code: 'DUPLICATE_REPETITION_PREFERENCE',
        message: `${key}: repetition ${item.repetition}`,
      });
      complete = false;
      continue;
    }
    repetitions.set(item.repetition, item.preference);
    observed.set(key, repetitions);
  }

  const outcomes = [];
  for (const [key, unit] of expectedUnits) {
    const repetitions = observed.get(key) ?? new Map();
    if (unit.repetitions.size !== expectedRepetitions || repetitions.size !== expectedRepetitions) {
      failures.push({
        stage: 'statistics',
        code: 'INCOMPLETE_TASK_MODEL_PREFERENCE',
        message: `${key}: expected ${expectedRepetitions} repetition preferences; found ${repetitions.size}`,
      });
      complete = false;
    }
    const values = [...repetitions.values()];
    const treatment = values.filter((value) => value === 'treatment').length;
    const control = values.filter((value) => value === 'control').length;
    const majority = expectedRepetitions / 2;
    if (treatment > majority) outcomes.push('treatment');
    else if (control > majority) outcomes.push('control');
    else outcomes.push('tie');
  }
  return { outcomes, complete };
}

function reviewCellKey(taskId, modelId, repetition) {
  return JSON.stringify([taskId, modelId, repetition]);
}

function taskModelKey(taskId, modelId) {
  return JSON.stringify([taskId, modelId]);
}

function calculatePreferenceUnitId(seed, taskId, modelId) {
  return `preference-unit-${sha256Canonical({ seed, taskId, modelId }).slice(0, 20)}`;
}

function calculatePreference(preferences) {
  const treatment = preferences.filter((item) => item === 'treatment').length;
  const control = preferences.filter((item) => item === 'control').length;
  const ties = preferences.filter((item) => item === 'tie').length;
  const decisive = treatment + control;
  return { treatment, control, ties, decisive, rate: decisive > 0 ? treatment / decisive : null };
}

function calculateOverhead(observations, failures) {
  const groups = new Map();
  for (const item of observations) {
    const key = `${item.taskId}:${item.modelId}:${item.repetition}`;
    const pair = groups.get(key) ?? {};
    pair[item.arm] = item;
    groups.set(key, pair);
  }
  const tokenOverheads = [];
  const costOverheads = [];
  let tokenUndefined = 0;
  let costUndefined = 0;
  for (const [key, pair] of groups) {
    if (!pair.control || !pair.treatment) {
      failures.push({ stage: 'statistics', code: 'MISSING_OVERHEAD_PAIR', message: key });
      tokenUndefined += 1;
      costUndefined += 1;
      continue;
    }
    const controlTokens = pair.control.inputTokens + pair.control.outputTokens;
    const treatmentTokens = pair.treatment.inputTokens + pair.treatment.outputTokens;
    const tokenValue = percentOverhead(controlTokens, treatmentTokens);
    const costValue = percentOverhead(pair.control.costUsd, pair.treatment.costUsd);
    if (tokenValue === null) tokenUndefined += 1;
    else tokenOverheads.push(tokenValue);
    if (costValue === null) costUndefined += 1;
    else costOverheads.push(costValue);
  }
  return {
    tokens: summarizeOverhead(tokenOverheads, tokenUndefined),
    cost: summarizeOverhead(costOverheads, costUndefined),
  };
}

function percentOverhead(control, treatment) {
  if (control === 0) return treatment === 0 ? 0 : null;
  return ((treatment - control) / control) * 100;
}

function summarizeOverhead(values, undefinedPairs) {
  return {
    medianPercent: values.length > 0 ? percentile([...values].sort((a, b) => a - b), 0.5) : null,
    p95Percent: values.length > 0 ? percentile([...values].sort((a, b) => a - b), 0.95) : null,
    n: values.length,
    undefinedPairs,
  };
}

function bootstrapMeanInterval(values, seed, iterations, confidenceLevel) {
  return bootstrapObjectInterval(values, meanOrNull, seed, iterations, confidenceLevel);
}

function bootstrapObjectInterval(values, estimator, seed, iterations, confidenceLevel) {
  if (values.length === 0) return { lower: null, upper: null };
  const random = seededRandom(seed);
  const estimates = [];
  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const sample = Array.from({ length: values.length }, () => values[Math.floor(random() * values.length)]);
    const estimate = estimator(sample);
    if (Number.isFinite(estimate)) estimates.push(estimate);
  }
  if (estimates.length !== iterations) return { lower: null, upper: null };
  estimates.sort((left, right) => left - right);
  const alpha = (1 - confidenceLevel) / 2;
  return { lower: percentile(estimates, alpha), upper: percentile(estimates, 1 - alpha) };
}

function seededRandom(seed) {
  let state = BigInt(`0x${sha256(seed).slice(0, 16)}`) || 1n;
  return () => {
    state ^= state << 13n;
    state ^= state >> 7n;
    state ^= state << 17n;
    state &= (1n << 64n) - 1n;
    return Number(state >> 11n) / 2 ** 53;
  };
}

function relativeReduction(control, treatment) {
  const controlMean = meanOrNull(control);
  const treatmentMean = meanOrNull(treatment);
  if (!Number.isFinite(controlMean) || controlMean <= 0 || !Number.isFinite(treatmentMean)) return null;
  return ((controlMean - treatmentMean) / controlMean) * 100;
}

function wilsonInterval(successes, total, confidenceLevel) {
  if (total === 0) return { lower: null, upper: null };
  const z = confidenceLevel === 0.95 ? 1.959963984540054 : 1.959963984540054;
  const p = successes / total;
  const denominator = 1 + (z * z) / total;
  const center = (p + (z * z) / (2 * total)) / denominator;
  const margin =
    (z / denominator) * Math.sqrt((p * (1 - p)) / total + (z * z) / (4 * total * total));
  return { lower: center - margin, upper: center + margin };
}

function percentile(sorted, fraction) {
  if (sorted.length === 1) return sorted[0];
  const position = (sorted.length - 1) * fraction;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}

function mean(values) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function meanOrNull(values) {
  return values.length > 0 ? mean(values) : null;
}

function nonnegativeNumber(value, fallback) {
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function parseArgs(argv) {
  const options = {
    bootstrapIterations: 10_000,
    protocolPath: join(benchmarkDirectory, 'protocol.json'),
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--plan') options.planPath = resolve(argv[++index]);
    else if (argument === '--protocol') options.protocolPath = resolve(argv[++index]);
    else if (argument === '--qualification-index') options.qualificationIndexPath = resolve(argv[++index]);
    else if (argument === '--record-root') options.recordRoot = resolve(argv[++index]);
    else if (argument === '--assignments') options.assignmentsPath = resolve(argv[++index]);
    else if (argument === '--reviews') options.reviewWorkbookPath = resolve(argv[++index]);
    else if (argument === '--seed') options.seed = argv[++index];
    else if (argument === '--bootstrap-iterations') options.bootstrapIterations = Number(argv[++index]);
    else if (argument === '--out') options.outputPath = resolve(argv[++index]);
    else throw new Error(`Unknown option: ${argument}`);
  }
  for (const name of [
    'planPath',
    'qualificationIndexPath',
    'recordRoot',
    'assignmentsPath',
    'reviewWorkbookPath',
    'seed',
    'outputPath',
  ]) {
    if (!options[name]) throw new Error(`Missing required option: ${name}`);
  }
  return options;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const statistics = await analyzeStatistics(parseArgs(process.argv.slice(2)));
    console.log(prettyCanonicalJson({ ok: statistics.allGatesPassed, output: process.argv.at(-1), gates: statistics.gates }).trim());
    if (!statistics.allGatesPassed) process.exitCode = 1;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
