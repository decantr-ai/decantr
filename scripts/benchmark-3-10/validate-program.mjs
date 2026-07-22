#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  benchmarkDir,
  readJson,
  manifestDigests,
  parseCommonArgs,
  sha256,
} from './lib.mjs';
import { sha256Canonical } from './runner/canonical.mjs';

const options = parseCommonArgs(process.argv.slice(2));
const corpus = readJson(options.corpusPath);
const models = readJson(options.modelsPath);
const protocol = readJson(options.protocolPath);
const corpusLockPath = resolve(benchmarkDir, 'corpus.lock.json');
const corpusLock = existsSync(corpusLockPath) ? readJson(corpusLockPath) : null;
const developmentCandidatesPath = resolve(benchmarkDir, 'tasks/development-candidates.json');
const publicQualificationIndexPath = resolve(benchmarkDir, 'tasks/qualification-index.json');
const freezeAttestationPath = resolve(benchmarkDir, 'tasks/freeze-attestation.json');
const pricingPath = resolve(benchmarkDir, 'model-proxy/pricing.json');
const developmentCandidates = existsSync(developmentCandidatesPath)
  ? readJson(developmentCandidatesPath)
  : null;
const publicQualificationIndex = existsSync(publicQualificationIndexPath)
  ? readJson(publicQualificationIndexPath)
  : null;
const freezeAttestation = existsSync(freezeAttestationPath) ? readJson(freezeAttestationPath) : null;
const pricing = existsSync(pricingPath) ? readJson(pricingPath) : null;
const errors = [];

if (corpus.schemaVersion !== 'decantr-benchmark-corpus.v1') {
  errors.push('corpus schemaVersion must be decantr-benchmark-corpus.v1');
}
if (!Array.isArray(corpus.repositories) || corpus.repositories.length !== 28) {
  errors.push('corpus must contain exactly 28 repositories');
}

const seenIds = new Set();
const seenRepos = new Set();
for (const repository of corpus.repositories ?? []) {
  if (seenIds.has(repository.id)) errors.push(`duplicate corpus id: ${repository.id}`);
  if (seenRepos.has(repository.repo)) errors.push(`duplicate corpus repository: ${repository.repo}`);
  seenIds.add(repository.id);
  seenRepos.add(repository.repo);
  if (!/^[a-f0-9]{40}$/u.test(repository.commit ?? '')) {
    errors.push(`${repository.id}: commit must be a full 40-character lowercase SHA`);
  }
  if (!/^https:\/\/github\.com\/.+\.git$/u.test(repository.repo ?? '')) {
    errors.push(`${repository.id}: repo must be a canonical HTTPS GitHub clone URL`);
  }
  if (!['development', 'qualification'].includes(repository.partition)) {
    errors.push(`${repository.id}: partition must be development or qualification`);
  }
  if (typeof repository.projectPath !== 'string' || repository.projectPath.length === 0) {
    errors.push(`${repository.id}: projectPath is required`);
  }
  if (typeof repository.license !== 'string' || repository.license.length === 0) {
    errors.push(`${repository.id}: license is required`);
  }
}

const developmentCount = (corpus.repositories ?? []).filter(
  (repository) => repository.partition === 'development',
).length;
const qualificationCount = (corpus.repositories ?? []).filter(
  (repository) => repository.partition === 'qualification',
).length;
if (developmentCount !== 18) errors.push(`expected 18 development repositories, found ${developmentCount}`);
if (qualificationCount !== 10) errors.push(`expected 10 qualification repositories, found ${qualificationCount}`);
if (corpusLock) {
  if (corpusLock.schemaVersion !== 'decantr-benchmark-corpus-lock.v1') {
    errors.push('corpus lock schemaVersion must be decantr-benchmark-corpus-lock.v1');
  }
  if (!Array.isArray(corpusLock.repositories) || corpusLock.repositories.length !== 28) {
    errors.push('corpus lock must contain exactly 28 repositories');
  } else {
    const locked = new Map(corpusLock.repositories.map((repository) => [repository.id, repository]));
    for (const repository of corpus.repositories ?? []) {
      const entry = locked.get(repository.id);
      if (!entry) errors.push(`corpus lock is missing ${repository.id}`);
      else if (entry.commit !== repository.commit) {
        errors.push(`${repository.id}: corpus lock commit does not match manifest`);
      } else if (!/^[a-f0-9]{40}$/u.test(entry.tree ?? '')) {
        errors.push(`${repository.id}: corpus lock tree must be a full Git tree SHA`);
      }
    }
  }
}

if (models.schemaVersion !== 'decantr-benchmark-model-lock.v1') {
  errors.push('models schemaVersion must be decantr-benchmark-model-lock.v1');
}
if (!Array.isArray(models.models) || models.models.length !== 2) {
  errors.push('model lock must contain exactly two models');
}
const modelIds = new Set((models.models ?? []).map((model) => model.requestedModel));
for (const requiredModel of ['gpt-5.6-sol', 'claude-fable-5']) {
  if (!modelIds.has(requiredModel)) errors.push(`model lock is missing ${requiredModel}`);
}

if (protocol.schemaVersion !== 'decantr-benchmark-protocol.v1') {
  errors.push('protocol schemaVersion must be decantr-benchmark-protocol.v1');
}
const design = protocol.design ?? {};
const calculatedRuns =
  Number(design.taskCount) * Number(design.models) * Number(design.arms) * Number(design.repetitions);
if (calculatedRuns !== design.totalRuns || calculatedRuns !== 320) {
  errors.push(`protocol run arithmetic must equal 320, found ${calculatedRuns}`);
}
if (!/^[a-f0-9]{64}$/u.test(design.randomizationSeed ?? '')) {
  errors.push('protocol randomizationSeed must be a committed SHA-256 value');
}
if (design.minimumQualificationTasks < 16) {
  errors.push('protocol must require at least 16 qualification tasks');
}
if (!String(design.powerGate ?? '').includes('80% power')) {
  errors.push('protocol must retain the pre-qualification 80% power gate');
}
const maximumModelSpend = (models.models ?? []).reduce(
  (total, model) => total + Number(model.maxRunCostUsd) * Number(design.taskCount) * Number(design.arms) * Number(design.repetitions),
  0,
);
if (maximumModelSpend !== protocol.budget?.maximumModelSpendUsd || maximumModelSpend !== 4160) {
  errors.push(`protocol maximum model spend must equal $4,160, found $${maximumModelSpend}`);
}
if (protocol.budget?.requiresExplicitHumanApproval !== true) {
  errors.push('paid benchmark execution must require explicit human approval');
}

validateTaskFreeze({
  developmentCandidates,
  developmentCandidatesPath,
  publicQualificationIndex,
  publicQualificationIndexPath,
  freezeAttestation,
  protocol,
  models,
  errors,
});
validatePricingLock(pricing, models, errors);

if (errors.length > 0) {
  console.error('Decantr 3.10 benchmark program is invalid:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      repositories: corpus.repositories.length,
      development: developmentCount,
      qualification: qualificationCount,
      tasks: design.taskCount,
      runs: calculatedRuns,
      maximumModelSpendUsd: maximumModelSpend,
      corpusLockSha256: corpusLock ? sha256(readFileSync(corpusLockPath)) : null,
      developmentCandidatesSha256: sha256(readFileSync(developmentCandidatesPath)),
      publicQualificationIndexSha256: sha256(readFileSync(publicQualificationIndexPath)),
      freezeAttestationSha256: sha256(readFileSync(freezeAttestationPath)),
      paidExecutionAuthorized: false,
      ...manifestDigests(options),
    },
    null,
    2,
  ),
);

function validateTaskFreeze(input) {
  const { errors } = input;
  if (!input.developmentCandidates) {
    errors.push('development task candidates are missing');
    return;
  }
  if (
    input.developmentCandidates.schemaVersion !== 'decantr-benchmark-development-task-candidates.v2' ||
    input.developmentCandidates.count !== 24 ||
    input.developmentCandidates.records?.length !== 24
  ) {
    errors.push('development task candidate freeze must contain exactly 24 records');
  }
  const developmentIds = new Set();
  for (const record of input.developmentCandidates.records ?? []) {
    if (record.partition !== 'development') errors.push(`${record.taskId}: public candidate is not development`);
    if (record.opaqueId !== undefined) errors.push(`${record.taskId}: public development candidate exposes an opaque id`);
    if (developmentIds.has(record.taskId)) errors.push(`duplicate development task candidate: ${record.taskId}`);
    developmentIds.add(record.taskId);
  }

  if (!input.publicQualificationIndex) {
    errors.push('public qualification candidate index is missing');
    return;
  }
  if (
    input.publicQualificationIndex.schemaVersion !== 'decantr-benchmark-public-qualification-index.v1' ||
    input.publicQualificationIndex.count !== 16 ||
    input.publicQualificationIndex.tasks?.length !== 16
  ) {
    errors.push('public qualification candidate index must contain exactly 16 opaque bindings');
  }
  const opaqueIds = new Set();
  for (const task of input.publicQualificationIndex.tasks ?? []) {
    if (Object.keys(task).sort().join(',') !== 'canonicalSha256,opaqueId') {
      errors.push('public qualification candidate entries may contain only opaqueId and canonicalSha256');
      continue;
    }
    if (!/^q-[a-f0-9-]{36}$/u.test(task.opaqueId ?? '')) errors.push('public qualification opaque id is invalid');
    if (!/^[a-f0-9]{64}$/u.test(task.canonicalSha256 ?? '')) {
      errors.push(`${task.opaqueId}: public qualification candidate digest is invalid`);
    }
    if (opaqueIds.has(task.opaqueId)) errors.push(`duplicate public qualification opaque id: ${task.opaqueId}`);
    opaqueIds.add(task.opaqueId);
  }
  if (input.publicQualificationIndex.bundleSha256 !== sha256Canonical(input.publicQualificationIndex.tasks ?? [])) {
    errors.push('public qualification candidate bundle digest is invalid');
  }
  const publicSerialized = JSON.stringify(input.publicQualificationIndex).toLowerCase();
  for (const forbidden of ['taskid', 'repositoryid', 'framework', 'prompt', 'evaluator', 'github']) {
    if (publicSerialized.includes(forbidden)) {
      errors.push(`public qualification candidate index leaks forbidden token: ${forbidden}`);
    }
  }

  if (!input.freezeAttestation) {
    errors.push('public task freeze attestation is missing');
    return;
  }
  const expectedCounts = { total: 40, development: 24, qualification: 16, repository: 28, adversarial: 12 };
  if (
    input.freezeAttestation.schemaVersion !== 'decantr-benchmark-public-task-freeze-attestation.v1' ||
    input.freezeAttestation.passed !== true ||
    Object.entries(expectedCounts).some(([key, value]) => input.freezeAttestation.counts?.[key] !== value)
  ) {
    errors.push('public task freeze attestation count or status is invalid');
  }
  if (input.freezeAttestation.gitLineagesVerified !== 40) {
    errors.push('public task freeze attestation must bind 40 verified Git lineages');
  }
  if (
    input.freezeAttestation.developmentSha256 !== sha256(readFileSync(input.developmentCandidatesPath)) ||
    input.freezeAttestation.publicQualificationIndexSha256 !==
      sha256(readFileSync(input.publicQualificationIndexPath)) ||
    input.freezeAttestation.qualificationBundleSha256 !== input.publicQualificationIndex.bundleSha256
  ) {
    errors.push('public task freeze attestation file bindings are invalid');
  }
  if (
    input.freezeAttestation.qualificationEmbargoCutoff !==
      input.protocol.design?.qualificationEmbargoCutoff ||
    input.publicQualificationIndex.qualificationEmbargoCutoff !==
      input.protocol.design?.qualificationEmbargoCutoff
  ) {
    errors.push('qualification embargo differs across frozen artifacts');
  }
  for (const model of input.models.models ?? []) {
    const expected = `${model.knowledgeCutoff}T23:59:59Z`;
    if (input.freezeAttestation.modelKnowledgeCutoffs?.[model.requestedModel] !== expected) {
      errors.push(`${model.requestedModel}: task freeze model cutoff binding is invalid`);
    }
  }
}

function validatePricingLock(pricing, models, errors) {
  if (
    pricing?.schemaVersion !== 'decantr-benchmark-pricing-lock.v1' ||
    pricing.paidPricingLocked !== true ||
    pricing.models?.length !== 2
  ) {
    errors.push('reviewed two-model pricing lock is missing or invalid');
    return;
  }
  const byId = new Map(pricing.models.map((model) => [model.modelId, model]));
  for (const model of models.models ?? []) {
    const entry = byId.get(model.id);
    if (
      !entry ||
      entry.requestedModel !== model.requestedModel ||
      entry.maximumRunCostUsd !== model.maxRunCostUsd ||
      !(entry.inputPerMillionTokensUsd > 0) ||
      !(entry.outputPerMillionTokensUsd > 0)
    ) {
      errors.push(`${model.id}: pricing lock differs from the model lock`);
    }
  }
}
