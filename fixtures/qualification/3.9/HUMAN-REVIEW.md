# Decantr 3.9 Human Qualification Review

This packet is incomplete until two actual people review the frozen cases. An AI agent, test oracle, scripted evidence pass, or model persona must not be entered as a human identity.

## Executable Workflow

Run `node scripts/prepare-3-9-human-review.mjs --help` before assigning workbooks. The files under `review/` begin with exactly two empty reviewer slots and 200 empty judgment slots; they are workflow inputs, not evidence. Use the script's seal commands in order, then run:

```bash
pnpm qualification:3-9:human:lint
pnpm qualification:3-9:human
node scripts/prepare-3-9-human-review.mjs --assemble
```

The lint command may pass while reporting `INCOMPLETE`. Validation and assembly must fail until the frozen corpus, both independent signed reviews, adjudication, and both finding replays are complete and hash-bound. Assembly emits a non-claiming fragment for maintainer review; it never edits `qualification-packet.json` or sets the release claim.

## Freeze The Cases

1. Build route and finding cases before inspecting 3.9 candidate output.
2. Give every case a stable `id` and `clusterId`. Use the same cluster for judgments derived from one input so correlation remains visible.
3. Attach either source snapshot evidence with an exact repository commit and blob hash, or executable-oracle evidence with hashed oracle and captured-output artifacts. A path, line number, anchor, or prose rationale alone is not provenance.
4. Make each expected output set exhaustive. Finding cases must enumerate every candidate code as `emit` or `suppress`. Route cases must retain the complete ordered source set and identify the required first source plus only forbidden sources that actually competed in that set.

## Review And Adjudicate

1. Each reviewer independently records a complete output set and rationale for every finding case in their assigned workbook. Do not derive one review from the other or from replay output.
2. Each person records a stable identity, the exact human attestation, and timestamps, sets the workbook to `complete`, and leaves `signedReviewEvidence` null. Run `--write-review-signing-payloads`; this emits one canonical payload per reviewer containing that identity, the corpus hash, and every decision and rationale.
3. Sign the exact generated payload. A signed-commit record points to that payload in the verified commit and records the signer plus key fingerprint. A detached record includes a matching SSH signature and allowed-signers file under the `decantr-3.9-human-review` namespace. Record it as `signedReviewEvidence`, then run `--seal-reviews`.
4. After both signed reviews are sealed, one of those reviewers adjudicates every case, records the final exhaustive set and every resolution, and leaves `signedAdjudicationEvidence` null. Run `--write-adjudication-signing-payload`, sign that exact payload with the same signing identity used by the adjudicator's review, record `signedAdjudicationEvidence`, then run `--seal-adjudication`.
5. Count judgments from adjudicated candidate outputs, not from test assertions or repeated codes. The total must be exactly 200 across Greenfield, Brownfield, and Hybrid cases.

## Replay And Measure

1. Replay public npm 3.8.3 first, then final 3.9.4 packed or public artifacts, against the identical corpus.
2. Retain raw machine-readable output and SHA-256 artifact identity. Every expected candidate must be recorded as emitted or not emitted; unexpected outputs make the set non-exhaustive and block qualification until adjudicated.
3. Report one confusion matrix per replay. Precision uses `TP / (TP + FP)` and recall uses `TP / (TP + FN)`; each metric has its own denominator and two-sided 95% Wilson interval.
4. Replay all 84 frozen route cases exactly once in corpus order, with 84 unique case IDs and no additions or omissions. Retain each complete ordered candidate list, including all 24 forbidden sources that genuinely competed. A prose assertion or fixture declaration is not route replay evidence.
5. Keep each replay artifact at the repository-relative, SHA-256-addressed path recorded by the packet. Finding, route, adoption-boundary, and machine artifacts repeat their command, exit code, environment, generated time, result rows, and a recomputable behavior binding. Candidate route, finding, adoption, and machine evidence must all carry the identical six final 3.9.4 tarball hashes; replacing a hash table without regenerating bound behavior invalidates the evidence.
6. Do not set `packetStatus` to `complete` or `qualificationClaim` to `true` manually. Those fields are accepted only when the audit independently finds no missing evidence or failed gate.

Adoption-boundary replay must classify `.gitignore` cache entries as `narrow-ignore-entry` and formatter exclusions as `narrow-formatter-ignore-entry`, with exact before/after hashes and diffs. Neither category permits unrelated host configuration changes.

`source-snapshot` evidence is verified against the exact GitHub commit tree during qualification. A syntactically valid commit or blob hash is not sufficient; the repository, commit, source path, and blob identity must resolve together. Set `GITHUB_TOKEN` in constrained CI environments to avoid unauthenticated API limits.

Use `node scripts/audit-3-9-qualification-baseline.mjs --lint-only` while assembling the packet. That command checks structure only and never grants release qualification. The default command is the fail-closed release gate.
