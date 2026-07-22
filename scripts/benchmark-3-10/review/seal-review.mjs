#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prettyCanonicalJson, readJsonFile, sha256, writeCanonicalFile } from '../runner/canonical.mjs';

export async function sealReview(options) {
  const assignmentsBytes = await readFile(options.assignmentsPath);
  const assignmentsSha256 = sha256(assignmentsBytes);
  const assignments = JSON.parse(assignmentsBytes);
  const submitted = await readJsonFile(options.workbookPath);
  if (submitted.schemaVersion !== 'ui-change-review-workbook.v1' || submitted.blinded !== true) {
    throw new Error('submitted workbook is not a blinded review workbook');
  }
  if (submitted.assignmentsSha256 !== assignmentsSha256) {
    throw new Error('submitted workbook is bound to different assignments');
  }
  if (!Array.isArray(submitted.reviewers) || submitted.reviewers.length !== 2 || new Set(submitted.reviewers).size !== 2) {
    throw new Error('review workbook must identify exactly two reviewers');
  }
  const assignmentIds = new Set(assignments.assignments.map((item) => item.assignmentId));
  const reviewsByAssignment = new Map();
  for (const review of submitted.reviews ?? []) {
    if (!assignmentIds.has(review.assignmentId)) throw new Error(`unknown review assignment: ${review.assignmentId}`);
    if (!submitted.reviewers.includes(review.reviewerId)) throw new Error(`unknown reviewer: ${review.reviewerId}`);
    validateReview(review);
    const items = reviewsByAssignment.get(review.assignmentId) ?? [];
    if (items.some((item) => item.reviewerId === review.reviewerId)) {
      throw new Error(`${review.assignmentId}: duplicate review from ${review.reviewerId}`);
    }
    items.push(review);
    reviewsByAssignment.set(review.assignmentId, items);
  }
  const adjudications = new Map();
  for (const adjudication of submitted.adjudications ?? []) {
    if (!assignmentIds.has(adjudication.assignmentId)) {
      throw new Error(`unknown adjudication assignment: ${adjudication.assignmentId}`);
    }
    if (adjudications.has(adjudication.assignmentId)) {
      throw new Error(`${adjudication.assignmentId}: duplicate adjudication`);
    }
    validateAdjudication(adjudication);
    adjudications.set(adjudication.assignmentId, adjudication);
  }
  for (const assignmentId of assignmentIds) {
    const reviews = reviewsByAssignment.get(assignmentId) ?? [];
    if (reviews.length !== 2) throw new Error(`${assignmentId}: exactly two completed reviews are required`);
    const disagreement = reviews[0].preference !== reviews[1].preference;
    if (disagreement && !adjudications.has(assignmentId)) {
      throw new Error(`${assignmentId}: reviewer disagreement requires adjudication`);
    }
  }
  const sealed = {
    schemaVersion: 'decantr-benchmark-review-workbook.v1',
    blinded: true,
    assignmentsSha256,
    reviewers: submitted.reviewers,
    reviews: submitted.reviews,
    adjudications: submitted.adjudications ?? [],
  };
  await writeCanonicalFile(options.outputPath, sealed);
  return { outputPath: options.outputPath, sha256: sha256(await readFile(options.outputPath)) };
}

function validateReview(review) {
  if (!['A', 'B', 'tie'].includes(review.preference)) throw new Error('review preference must be A, B, or tie');
  for (const label of ['A', 'B']) {
    const score = review.scores?.[label];
    if (!Number.isFinite(score) || score < 0 || score > 100) throw new Error(`review score ${label} is invalid`);
  }
  if (!Number.isFinite(Date.parse(review.completedAt))) throw new Error('review completedAt is invalid');
}

function validateAdjudication(adjudication) {
  if (!['A', 'B', 'tie'].includes(adjudication.preference)) throw new Error('adjudication preference is invalid');
  if (typeof adjudication.adjudicatorId !== 'string' || adjudication.adjudicatorId === '') {
    throw new Error('adjudicatorId is required');
  }
  if (typeof adjudication.reason !== 'string' || adjudication.reason.trim() === '') {
    throw new Error('adjudication reason is required');
  }
  if (!Number.isFinite(Date.parse(adjudication.completedAt))) throw new Error('adjudication completedAt is invalid');
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--assignments') options.assignmentsPath = resolve(argv[++index]);
    else if (argv[index] === '--workbook') options.workbookPath = resolve(argv[++index]);
    else if (argv[index] === '--out') options.outputPath = resolve(argv[++index]);
    else throw new Error(`Unknown option: ${argv[index]}`);
  }
  for (const name of ['assignmentsPath', 'workbookPath', 'outputPath']) {
    if (!options[name]) throw new Error(`Missing required option: ${name}`);
  }
  return options;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const result = await sealReview(parseArgs(process.argv.slice(2)));
    console.log(prettyCanonicalJson({ ok: true, ...result }).trim());
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
