# Task Environments

Benchmark outcomes are meaningful only when every task runs in its authentic toolchain. The corpus spans legacy Node 12/npm 6 applications through Node 24/pnpm 11, plus Yarn and Bun. The model arms must share the same prepared dependency tree and command environment.

Reviewed specs live at:

```text
development/specs/<task-id>.json
.private/benchmark-3-10/environments/qualification/specs/<task-id>.json
```

Each spec binds:

- a Linux x64 runtime profile and exact package-manager version;
- every base-commit lockfile by SHA-256;
- fixed-argv preparation commands and their network allowance;
- a clean-worktree requirement after ignored dependency/setup artifacts are created;
- substantive maintainer review.

Preparation may access only an operator-enforced dependency-registry network and only before benchmark timing. Preparation containers receive no model or provider credentials. Model and evaluator execution remain proxy-only or offline as declared by the protocol. A missing runtime, lockfile drift, unavailable dependency, setup write outside ignored paths, or failed required command is a visible harness failure, never an unsupported-task exclusion.

The environment pipeline is fail-closed:

1. `generate-runtime-matrix.mjs` derives unique runtime profiles from all 40 reviewed specs.
2. `build-runtime-profiles.mjs` runs only from the exact clean `main` commit on a GitHub-hosted Linux x64 runner. It binds every committed file under the benchmark Docker build context, the runtime workflow, and the complete benchmark controller tree; publishes separate evaluator and evaluator-free agent images to repository-scoped GHCR; pulls back both exact registry-manifest references; verifies both Docker config digests; and emits a canonical profile build subject with the exact GitHub run identity.
3. GitHub OIDC signs that subject. The workflow retains the offline provenance bundle, verifies it against the exact repository, workflow, signer commit, source commit, source ref, SLSA predicate, and hosted-runner policy, then emits a v3 profile attestation binding both images, agent tooling and isolation, the subject, bundle, and canonical verification output.
4. `lock-runtime-matrix.mjs` independently recomputes the complete source closure and reruns `gh attestation verify` against every retained bundle with `--deny-self-hosted-runners`. A local JSON digest, missing retained file, altered bundle, different checkout, self-hosted runner, or caller-supplied verification result cannot lock the matrix.
5. `prepare-workspace.mjs` runs the reviewed fixed preparation commands and emits a task attestation binding the spec, runtime matrix, image digest, Git base, lockfiles, and installed dependency tree.
6. The run plan binds the locked runtime-matrix bytes. Every run independently verifies its preparation attestation, lockfiles, and dependency tree before model execution and after evaluation.

A matrix remains a draft until all 40 reviews and Linux image probes pass. No draft matrix or caller-supplied environment hash can authorize a benchmark run.

`.github/workflows/benchmark-3-10-runtime-profiles.yml` is the only trusted profile-build path. It uses a fixed GitHub-hosted Ubuntu 24.04 runner, commit-pinned actions, no provider credentials, repository-scoped GHCR write permission, and one OIDC-signed evidence set per profile. The evaluator workflow receives GHCR read permission only. Download all four retained files for every profile into one evidence directory, check out the exact attested commit, and run `lock-runtime-matrix.mjs` there. A pushed image is infrastructure, not qualification; unsigned local builds and mutable tags alone remain diagnostics only.

Evaluator qualification uses the same locked task profile but produces different evidence from benchmark workspace preparation. Qualification proves that a candidate-independent evaluator fails the exact base and passes the exact expected revision inside an externally attested container run. Benchmark preparation later binds the dependency tree used by both model arms. Neither artifact can substitute for the other.

Current state: all 24 development and 16 qualification environment specs have explicit sole-maintainer approval. All 26 dual-image profiles passed GitHub-hosted run `30577939983`, with exact retries `30581534061` and `30581539933` supplying retained evidence from source commit `cfcb849454d68f2e9b8ff91fdf6b22751eb016cd`. Their v3 attestations were independently reverified and locked into matrix digest `ce55618610740db332d19c6314f78d0141f440bc5ca04ec79698b3359d6c93bc`. A complete current-head evaluator qualification and prepared-environment set does not yet exist, so run-plan generation stays closed.
